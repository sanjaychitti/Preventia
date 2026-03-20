package com.preventia.dto;

import java.time.Instant;
import java.util.UUID;

public record PrescriptionResponse(
        UUID id,
        UUID appointmentId,
        UUID doctorId,
        String doctorName,
        String diagnosis,
        String fileName,
        Instant createdAt
) {}
