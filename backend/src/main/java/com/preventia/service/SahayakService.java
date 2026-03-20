package com.preventia.service;

import com.preventia.domain.entity.Appointment;
import com.preventia.domain.entity.User;
import com.preventia.domain.entity.VitalsRecord;
import com.preventia.domain.repository.AppointmentRepository;
import com.preventia.domain.repository.VitalsRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * PRD §6.1 Sahayak (Field Provider) functionality:
 *  - Home Visit Checklist: record BP, SpO2, pulse, temperature
 *  - Manual Override: adjust medication inventory levels with VERIFIED status
 *  - All Sahayak vitals are marked verified=true for the Physician's split-pane view (PRD §6.2)
 */
@Service
@Transactional
public class SahayakService {

    private final VitalsRecordRepository vitalsRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicationInventoryService medicationInventoryService;

    public SahayakService(VitalsRecordRepository vitalsRecordRepository,
                           AppointmentRepository appointmentRepository,
                           MedicationInventoryService medicationInventoryService) {
        this.vitalsRecordRepository = vitalsRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicationInventoryService = medicationInventoryService;
    }

    /**
     * Records vitals during a Sahayak home visit.
     * Resulting record is marked verified=true and surfaces in the Physician split-pane.
     */
    public VitalsRecord recordVitals(UUID recipientId,
                                      UUID appointmentId,
                                      Integer bpSystolic,
                                      Integer bpDiastolic,
                                      BigDecimal spo2,
                                      Integer pulseRate,
                                      BigDecimal temperature,
                                      String notes,
                                      User recorder) {
        boolean isSahayakOrDoctor = recorder.getRole().name().equals("SAHAYAK")
                || recorder.getRole().name().equals("DOCTOR");

        Appointment appointment = null;
        if (appointmentId != null) {
            appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + appointmentId));
        }

        // Build recipient reference from appointment or direct ID
        User recipient = appointment != null
                ? appointment.getRecipient()
                : buildRecipientRef(recipientId);

        VitalsRecord record = VitalsRecord.builder()
                .recipient(recipient)
                .recordedBy(recorder)
                .appointment(appointment)
                .bpSystolic(bpSystolic)
                .bpDiastolic(bpDiastolic)
                .spo2(spo2)
                .pulseRate(pulseRate)
                .temperature(temperature)
                .notes(notes)
                .verified(isSahayakOrDoctor)
                .build();

        return vitalsRecordRepository.save(record);
    }

    /**
     * Overrides medication inventory count after a physical pill count.
     * Maps to PRD §6.1 Manual Override — hard-resets the inventory with VERIFIED status.
     */
    public MedicationInventoryService.UpdateResult overrideMedicationInventory(UUID inventoryId,
                                                                                int confirmedCount,
                                                                                String visitNote,
                                                                                User sahayak) {
        if (sahayak.getRole().name().equals("SPONSOR") || sahayak.getRole().name().equals("RECIPIENT")) {
            throw new AccessDeniedException("Manual override requires SAHAYAK or DOCTOR role");
        }
        return medicationInventoryService.updateStockCount(
                inventoryId, confirmedCount, "Sahayak visit override: " + visitNote, sahayak);
    }

    @Transactional(readOnly = true)
    public List<VitalsRecord> getVerifiedVitalsForRecipient(UUID recipientId) {
        return vitalsRecordRepository.findByRecipientIdAndVerifiedTrueOrderByRecordedAtDesc(recipientId);
    }

    @Transactional(readOnly = true)
    public List<VitalsRecord> getAllVitalsForRecipient(UUID recipientId) {
        return vitalsRecordRepository.findByRecipientIdOrderByRecordedAtDesc(recipientId);
    }

    @Transactional(readOnly = true)
    public List<VitalsRecord> getVitalsForAppointment(UUID appointmentId) {
        return vitalsRecordRepository.findByAppointmentIdOrderByRecordedAtDesc(appointmentId);
    }

    private User buildRecipientRef(UUID recipientId) {
        User u = new User();
        u.setId(recipientId);
        return u;
    }
}
