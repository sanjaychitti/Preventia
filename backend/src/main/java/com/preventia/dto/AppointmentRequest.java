package com.preventia.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record AppointmentRequest(
        @NotNull UUID recipientId,
        @NotNull UUID doctorId,
        @NotNull @Future Instant scheduledAt,
        String notes
) {}
