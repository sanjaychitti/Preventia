package com.preventia.controller;

import com.preventia.domain.entity.User;
import com.preventia.domain.enums.AppointmentStatus;
import com.preventia.dto.AppointmentRequest;
import com.preventia.dto.AppointmentResponse;
import com.preventia.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * POST /api/appointments — Workflow 1: Sponsor books an appointment.
     * Returns appointment_id and recipient_token.
     */
    @PostMapping
    public ResponseEntity<AppointmentResponse> book(@Valid @RequestBody AppointmentRequest request,
                                                     @AuthenticationPrincipal User sponsor) {
        AppointmentResponse response = appointmentService.bookAppointment(request, sponsor);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> get(@PathVariable UUID id,
                                                    @AuthenticationPrincipal User requester) {
        return ResponseEntity.ok(appointmentService.getAppointment(id, requester));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> listMy(@AuthenticationPrincipal User requester) {
        List<AppointmentResponse> list = switch (requester.getRole()) {
            case DOCTOR -> appointmentService.listForDoctor(requester.getId());
            case SPONSOR -> appointmentService.listForSponsor(requester.getId());
            case RECIPIENT -> appointmentService.listForSponsor(requester.getId()); // handled via sponsor lookup
        };
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(@PathVariable UUID id,
                                                             @RequestParam AppointmentStatus status,
                                                             @AuthenticationPrincipal User requester) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status, requester));
    }
}
