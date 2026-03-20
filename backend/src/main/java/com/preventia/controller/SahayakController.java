package com.preventia.controller;

import com.preventia.domain.entity.User;
import com.preventia.domain.entity.VitalsRecord;
import com.preventia.service.MedicationInventoryService;
import com.preventia.service.SahayakService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/sahayak")
public class SahayakController {

    private final SahayakService sahayakService;

    public SahayakController(SahayakService sahayakService) {
        this.sahayakService = sahayakService;
    }

    /**
     * POST /api/sahayak/vitals — Record home-visit vitals (BP, SpO2, pulse, temp).
     * PRD §6.1 Home Visit Checklist.
     */
    @PostMapping("/vitals")
    public ResponseEntity<VitalsRecord> recordVitals(@Valid @RequestBody RecordVitalsRequest req,
                                                       @AuthenticationPrincipal User recorder) {
        VitalsRecord record = sahayakService.recordVitals(
                req.recipientId(), req.appointmentId(),
                req.bpSystolic(), req.bpDiastolic(),
                req.spo2(), req.pulseRate(), req.temperature(),
                req.notes(), recorder);
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    /**
     * GET /api/sahayak/vitals/recipient/{id} — Physician split-pane: only VERIFIED Sahayak logs.
     * PRD §6.2: Left pane shows "Verified" Sahayak logs and lab results.
     */
    @GetMapping("/vitals/recipient/{recipientId}/verified")
    public ResponseEntity<List<VitalsRecord>> getVerifiedVitals(@PathVariable UUID recipientId) {
        return ResponseEntity.ok(sahayakService.getVerifiedVitalsForRecipient(recipientId));
    }

    @GetMapping("/vitals/recipient/{recipientId}")
    public ResponseEntity<List<VitalsRecord>> getAllVitals(@PathVariable UUID recipientId) {
        return ResponseEntity.ok(sahayakService.getAllVitalsForRecipient(recipientId));
    }

    @GetMapping("/vitals/appointment/{appointmentId}")
    public ResponseEntity<List<VitalsRecord>> getVitalsForAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(sahayakService.getVitalsForAppointment(appointmentId));
    }

    /**
     * POST /api/sahayak/inventory-override — Manual pill count override.
     * PRD §6.1: Manual Override hard-resets the "Next Action" trigger.
     */
    @PostMapping("/inventory-override")
    public ResponseEntity<Map<String, Object>> inventoryOverride(@Valid @RequestBody InventoryOverrideRequest req,
                                                                   @AuthenticationPrincipal User sahayak) {
        MedicationInventoryService.UpdateResult result =
                sahayakService.overrideMedicationInventory(req.inventoryId(), req.confirmedCount(), req.note(), sahayak);

        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("inventory", result.inventory());
        body.put("days_remaining", result.inventory().getDaysRemaining());
        body.put("refill_required", result.refillRequired());
        if (result.drasticChangeDetected()) {
            body.put("drastic_change_warning",
                    "Confirmed count differs significantly from previous recorded stock.");
        }

        return ResponseEntity.ok(body);
    }

    // --- Request records ---

    public record RecordVitalsRequest(
            @NotNull UUID recipientId,
            UUID appointmentId,
            Integer bpSystolic,
            Integer bpDiastolic,
            @DecimalMin("0") @DecimalMax("100") BigDecimal spo2,
            Integer pulseRate,
            BigDecimal temperature,
            String notes
    ) {}

    public record InventoryOverrideRequest(
            @NotNull UUID inventoryId,
            @Min(0) int confirmedCount,
            String note
    ) {}
}
