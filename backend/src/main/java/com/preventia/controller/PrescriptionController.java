package com.preventia.controller;

import com.preventia.domain.entity.User;
import com.preventia.dto.PrescriptionRequest;
import com.preventia.dto.PrescriptionResponse;
import com.preventia.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URL;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    /**
     * POST /api/prescriptions — Workflow 2: Doctor creates a prescription.
     * PDF is base64-encoded in the request body.
     */
    @PostMapping
    public ResponseEntity<PrescriptionResponse> create(@Valid @RequestBody PrescriptionRequest request,
                                                        @AuthenticationPrincipal User doctor) {
        PrescriptionResponse response = prescriptionService.createPrescription(request, doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> get(@PathVariable UUID id,
                                                     @AuthenticationPrincipal User requester) {
        return ResponseEntity.ok(prescriptionService.getPrescription(id, requester));
    }

    /**
     * GET /api/prescriptions/{id}/view — Workflow 2 (Prescription Viewing).
     * Returns a 15-min pre-signed S3 URL for the prescription PDF.
     */
    @GetMapping("/{id}/view")
    public ResponseEntity<String> viewUrl(@PathVariable UUID id,
                                          @AuthenticationPrincipal User requester) {
        URL presignedUrl = prescriptionService.getPrescriptionViewUrl(id, requester);
        return ResponseEntity.ok(presignedUrl.toString());
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<PrescriptionResponse>> listByAppointment(@PathVariable UUID appointmentId,
                                                                          @AuthenticationPrincipal User requester) {
        return ResponseEntity.ok(prescriptionService.listForAppointment(appointmentId, requester));
    }
}
