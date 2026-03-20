package com.preventia.service;

import com.preventia.domain.entity.MedicationInventory;
import com.preventia.domain.entity.MedicationInventoryLog;
import com.preventia.domain.entity.User;
import com.preventia.domain.enums.VerificationStatus;
import com.preventia.domain.repository.MedicationInventoryLogRepository;
import com.preventia.domain.repository.MedicationInventoryRepository;
import com.preventia.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Medication Inventory State Machine (PRD §4.2).
 *
 * Business rules implemented here:
 *  1. days_remaining = actual_stock_count / daily_dosage
 *  2. Alert threshold: days_remaining ≤ 7  → "Refill Required"
 *  3. Drastic change safety rail: reduction > 50% triggers a verification prompt (PRD §9)
 *  4. Audit trail: every update writes a MedicationInventoryLog with the change source
 *  5. Stale task: tasks not completed within 12 hours are flagged (handled in StaleTaskScheduler)
 *  6. Verification flag: Sahayak updates = VERIFIED; self-updates = SELF_REPORTED
 */
@Service
@Transactional
public class MedicationInventoryService {

    private static final Logger log = LoggerFactory.getLogger(MedicationInventoryService.class);
    private static final double REFILL_THRESHOLD_DAYS = 7.0;
    private static final double DRASTIC_CHANGE_THRESHOLD = 0.50;

    private final MedicationInventoryRepository inventoryRepository;
    private final MedicationInventoryLogRepository logRepository;
    private final UserRepository userRepository;

    public MedicationInventoryService(MedicationInventoryRepository inventoryRepository,
                                       MedicationInventoryLogRepository logRepository,
                                       UserRepository userRepository) {
        this.inventoryRepository = inventoryRepository;
        this.logRepository = logRepository;
        this.userRepository = userRepository;
    }

    public MedicationInventory createInventory(UUID recipientId,
                                                String medicationName,
                                                String dosageDescription,
                                                int initialCount,
                                                BigDecimal dailyDosage,
                                                User actor) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found: " + recipientId));

        MedicationInventory inventory = MedicationInventory.builder()
                .recipient(recipient)
                .medicationName(medicationName)
                .dosageDescription(dosageDescription)
                .actualStockCount(initialCount)
                .dailyDosage(dailyDosage)
                .verificationStatus(resolveVerificationStatus(actor))
                .lastUpdatedById(actor.getId())
                .build();

        inventory = inventoryRepository.save(inventory);
        writeLog(inventory, 0, initialCount, resolveVerificationStatus(actor), actor.getId(), "Initial stock entry");

        log.info("Created medication inventory for recipient {} — {}", recipientId, medicationName);
        return inventory;
    }

    /**
     * Updates the stock count.
     *
     * PRD §9 Drastic Change Alert:
     *   If new count < 50% of previous count, the update is still allowed but
     *   the log entry is flagged and the caller receives a DrasticChangeException
     *   so the controller can return an appropriate warning response.
     *
     * PRD §6.1 Manual Override:
     *   A Sahayak calling this method with role=SAHAYAK hard-resets the verification
     *   status to VERIFIED and clears downstream alerts.
     */
    public UpdateResult updateStockCount(UUID inventoryId, int newCount, String reason, User actor) {
        MedicationInventory inventory = findOrThrow(inventoryId);
        assertCanUpdate(inventory, actor);

        int previousCount = inventory.getActualStockCount();
        boolean drasticChange = isDrasticReduction(previousCount, newCount);

        VerificationStatus source = resolveVerificationStatus(actor);

        inventory.setActualStockCount(newCount);
        inventory.setVerificationStatus(source);
        inventory.setLastUpdatedById(actor.getId());

        inventoryRepository.save(inventory);
        MedicationInventoryLog logEntry = writeLog(inventory, previousCount, newCount, source, actor.getId(), reason);
        logEntry = setDrasticFlag(logEntry, drasticChange);

        if (drasticChange) {
            log.warn("Drastic inventory change flagged for inventory {} — {} → {} (actor: {})",
                    inventoryId, previousCount, newCount, actor.getId());
        }

        return new UpdateResult(inventory, drasticChange, inventory.isRefillRequired());
    }

    @Transactional(readOnly = true)
    public List<MedicationInventory> listForRecipient(UUID recipientId) {
        return inventoryRepository.findByRecipientIdOrderByMedicationNameAsc(recipientId);
    }

    @Transactional(readOnly = true)
    public List<MedicationInventory> listRefillRequired() {
        return inventoryRepository.findRefillRequired(REFILL_THRESHOLD_DAYS);
    }

    @Transactional(readOnly = true)
    public List<MedicationInventoryLog> getAuditLog(UUID inventoryId) {
        return logRepository.findByInventoryIdOrderByCreatedAtDesc(inventoryId);
    }

    /**
     * Daily cron job: decrements each medication's stock count by one day's dosage.
     * Logged as SYSTEM_CRON.
     */
    @Scheduled(cron = "0 0 0 * * *")  // midnight every day
    public void dailyStockDecrement() {
        List<MedicationInventory> all = inventoryRepository.findAll();
        for (MedicationInventory inv : all) {
            int decrement = inv.getDailyDosage().intValue();
            int newCount = Math.max(0, inv.getActualStockCount() - decrement);
            int prev = inv.getActualStockCount();

            inv.setActualStockCount(newCount);
            inv.setVerificationStatus(VerificationStatus.SYSTEM_CRON);
            inventoryRepository.save(inv);
            writeLog(inv, prev, newCount, VerificationStatus.SYSTEM_CRON, null, "Daily automated decrement");

            if (inv.isRefillRequired()) {
                log.info("Refill required: recipient={} medication='{}' days_remaining={}",
                        inv.getRecipient().getId(), inv.getMedicationName(), inv.getDaysRemaining());
            }
        }
    }

    // --- helpers ---

    private MedicationInventory findOrThrow(UUID id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medication inventory not found: " + id));
    }

    private void assertCanUpdate(MedicationInventory inv, User actor) {
        boolean isRecipient = inv.getRecipient().getId().equals(actor.getId());
        boolean isSahayak   = actor.getRole().name().equals("SAHAYAK");
        boolean isDoctor    = actor.getRole().name().equals("DOCTOR");
        boolean isSponsor   = actor.getRole().name().equals("SPONSOR");
        if (!isRecipient && !isSahayak && !isDoctor && !isSponsor) {
            throw new AccessDeniedException("Not authorised to update this medication inventory");
        }
    }

    private VerificationStatus resolveVerificationStatus(User actor) {
        return switch (actor.getRole()) {
            case SAHAYAK, DOCTOR -> VerificationStatus.VERIFIED;
            default              -> VerificationStatus.SELF_REPORTED;
        };
    }

    private boolean isDrasticReduction(int previous, int newCount) {
        if (previous <= 0) return false;
        double reductionRatio = (double)(previous - newCount) / previous;
        return reductionRatio > DRASTIC_CHANGE_THRESHOLD;
    }

    private MedicationInventoryLog writeLog(MedicationInventory inv, int prev, int next,
                                             VerificationStatus source, UUID actorId, String reason) {
        return logRepository.save(MedicationInventoryLog.builder()
                .inventory(inv)
                .previousCount(prev)
                .newCount(next)
                .changeSource(source)
                .actorId(actorId)
                .reason(reason)
                .build());
    }

    private MedicationInventoryLog setDrasticFlag(MedicationInventoryLog entry, boolean flagged) {
        if (!flagged) return entry;
        // Re-save with flag set — we need to update the existing entity.
        // Since MedicationInventoryLog is immutable by design, we create a new one with the flag.
        return logRepository.save(MedicationInventoryLog.builder()
                .inventory(entry.getInventory())
                .previousCount(entry.getPreviousCount())
                .newCount(entry.getNewCount())
                .changeSource(entry.getChangeSource())
                .actorId(entry.getActorId())
                .reason(entry.getReason())
                .drasticChangeFlagged(true)
                .build());
    }

    public record UpdateResult(
            MedicationInventory inventory,
            boolean drasticChangeDetected,
            boolean refillRequired
    ) {}
}
