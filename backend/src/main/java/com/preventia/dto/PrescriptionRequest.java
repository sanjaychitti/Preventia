package com.preventia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PrescriptionRequest(
        @NotNull UUID appointmentId,
        @NotBlank String diagnosis,
        /**
         * Base64-encoded PDF bytes of the prescription document.
         */
        @NotBlank String pdfBase64,
        String fileName
) {}
