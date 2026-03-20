package com.preventia.controller;

import com.preventia.domain.entity.MedicationInventory;
import com.preventia.domain.entity.MedicationInventoryLog;
import com.preventia.domain.entity.User;
import com.preventia.service.MedicationInventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/medication-inventory")
public class MedicationInventoryController {

    private final MedicationInventoryService inventoryService;

    public MedicationInventoryController(MedicationInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<MedicationInventory> create(@Valid @RequestBody CreateInventoryRequest req,
                                                       @AuthenticationPrincipal User actor) {
        MedicationInventory inv = inventoryService.createInventory(
                req.recipientId(), req.medicationName(), req.dosageDescription(),
                req.initialCount(), req.dailyDosage(), actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(inv);
    }

    /**
     * Update stock count.
     * PRD §9: If reduction > 50%, the response includes a drastic_change_warning.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Map<String, Object>> updateStock(@PathVariable UUID id,
                                                            @Valid @RequestBody UpdateStockRequest req,
                                                            @AuthenticationPrincipal User actor) {
        MedicationInventoryService.UpdateResult result =
                inventoryService.updateStockCount(id, req.newCount(), req.reason(), actor);

        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("inventory", result.inventory());
        body.put("refill_required", result.refillRequired());
        body.put("days_remaining", result.inventory().getDaysRemaining());

        if (result.drasticChangeDetected()) {
            // PRD §9: Drastic change alert — warn but still persist the change
            body.put("drastic_change_warning",
                    "Stock was reduced by more than 50% in one update. Please verify with a Sahayak.");
        }

        return ResponseEntity.ok(body);
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<List<MedicationInventory>> listForRecipient(@PathVariable UUID recipientId) {
        return ResponseEntity.ok(inventoryService.listForRecipient(recipientId));
    }

    @GetMapping("/refill-required")
    public ResponseEntity<List<MedicationInventory>> listRefillRequired() {
        return ResponseEntity.ok(inventoryService.listRefillRequired());
    }

    @GetMapping("/{id}/audit-log")
    public ResponseEntity<List<MedicationInventoryLog>> getAuditLog(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryService.getAuditLog(id));
    }

    // --- Request records ---

    public record CreateInventoryRequest(
            @NotNull UUID recipientId,
            @NotBlank String medicationName,
            String dosageDescription,
            @Min(0) int initialCount,
            @NotNull @Positive BigDecimal dailyDosage
    ) {}

    public record UpdateStockRequest(
            @Min(0) int newCount,
            String reason
    ) {}
}
