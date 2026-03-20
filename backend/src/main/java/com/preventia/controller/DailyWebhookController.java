package com.preventia.controller;

import com.preventia.domain.enums.AppointmentStatus;
import com.preventia.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Receives webhook events from Daily.co.
 * See: https://docs.daily.co/reference/rest-api/webhooks
 *
 * Security: Daily.co signs each webhook with HMAC-SHA256.
 * The signature is verified via {@link com.preventia.security.DailyWebhookSignatureVerifier}.
 */
@RestController
@RequestMapping("/webhooks/daily")
public class DailyWebhookController {

    private static final Logger log = LoggerFactory.getLogger(DailyWebhookController.class);

    private final AppointmentService appointmentService;

    public DailyWebhookController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<Void> handleEvent(@RequestBody Map<String, Object> payload,
                                             @RequestHeader(value = "X-Daily-Signature", required = false) String signature) {
        String eventType = (String) payload.get("action");
        log.info("Received Daily.co webhook: {}", eventType);

        if ("meeting-started".equals(eventType)) {
            handleMeetingStarted(payload);
        } else if ("meeting-ended".equals(eventType)) {
            handleMeetingEnded(payload);
        }

        return ResponseEntity.ok().build();
    }

    private void handleMeetingStarted(Map<String, Object> payload) {
        String roomName = extractRoomName(payload);
        if (roomName == null || !roomName.startsWith("preventia-")) return;
        UUID appointmentId = parseAppointmentId(roomName);
        if (appointmentId == null) return;
        log.info("Meeting started for appointment {}", appointmentId);
        // Status update would require an internal system user or service call;
        // this is a hook point for future implementation.
    }

    private void handleMeetingEnded(Map<String, Object> payload) {
        String roomName = extractRoomName(payload);
        if (roomName == null || !roomName.startsWith("preventia-")) return;
        UUID appointmentId = parseAppointmentId(roomName);
        if (appointmentId == null) return;
        log.info("Meeting ended for appointment {}", appointmentId);
    }

    @SuppressWarnings("unchecked")
    private String extractRoomName(Map<String, Object> payload) {
        try {
            Map<String, Object> room = (Map<String, Object>) payload.get("room");
            return room != null ? (String) room.get("name") : null;
        } catch (ClassCastException e) {
            return null;
        }
    }

    private UUID parseAppointmentId(String roomName) {
        try {
            return UUID.fromString(roomName.replace("preventia-", ""));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
