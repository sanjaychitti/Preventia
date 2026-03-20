package com.preventia.dto;

import com.preventia.domain.enums.AppointmentStatus;

import java.time.Instant;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID sponsorId,
        UUID recipientId,
        UUID doctorId,
        String doctorName,
        Instant scheduledAt,
        AppointmentStatus status,
        String dailyRoomUrl,
        String recipientToken,
        String notes,
        Instant createdAt
) {}
