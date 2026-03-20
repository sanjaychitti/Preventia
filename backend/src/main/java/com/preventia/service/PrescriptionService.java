package com.preventia.service;

import com.preventia.domain.entity.Appointment;
import com.preventia.domain.entity.Prescription;
import com.preventia.domain.entity.User;
import com.preventia.domain.repository.AppointmentRepository;
import com.preventia.domain.repository.PrescriptionRepository;
import com.preventia.dto.PrescriptionRequest;
import com.preventia.dto.PrescriptionResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final S3Service s3Service;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                                AppointmentRepository appointmentRepository,
                                S3Service s3Service) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.s3Service = s3Service;
    }

    /**
     * Workflow 2 step 1: Doctor uploads prescription.
     * PDF → S3, s3_key recorded in prescription_indices table.
     */
    public PrescriptionResponse createPrescription(PrescriptionRequest req, User doctor) {
        Appointment appointment = appointmentRepository.findById(req.appointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + req.appointmentId()));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("Only the assigned doctor may create prescriptions for this appointment");
        }

        byte[] pdfBytes = Base64.getDecoder().decode(req.pdfBase64());
        UUID prescriptionId = UUID.randomUUID();
        String s3Key = s3Service.uploadPrescriptionPdf(pdfBytes, prescriptionId);

        String fileName = req.fileName() != null ? req.fileName() : prescriptionId + ".pdf";

        Prescription prescription = Prescription.builder()
                .id(prescriptionId)
                .appointment(appointment)
                .doctor(doctor)
                .s3Key(s3Key)
                .fileName(fileName)
                .diagnosis(req.diagnosis())
                .build();

        return toResponse(prescriptionRepository.save(prescription));
    }

    /**
     * Workflow 2 — Prescription Viewing:
     * Returns a 15-minute pre-signed S3 URL so the sponsor/recipient can download the PDF.
     */
    @Transactional(readOnly = true)
    public URL getPrescriptionViewUrl(UUID prescriptionId, User requester) {
        Prescription prescription = findOrThrow(prescriptionId);
        assertCanView(prescription, requester);
        return s3Service.generatePresignedUrl(prescription.getS3Key());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescription(UUID prescriptionId, User requester) {
        Prescription prescription = findOrThrow(prescriptionId);
        assertCanView(prescription, requester);
        return toResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listForAppointment(UUID appointmentId, User requester) {
        return prescriptionRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .stream()
                .filter(p -> canView(p, requester))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listForRecipient(UUID recipientId, User requester) {
        // Sponsors may only view prescriptions for their own recipients
        return prescriptionRepository.findByAppointmentRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .filter(p -> canView(p, requester))
                .map(this::toResponse)
                .toList();
    }

    // --- helpers ---

    private Prescription findOrThrow(UUID id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prescription not found: " + id));
    }

    private boolean canView(Prescription p, User requester) {
        Appointment appt = p.getAppointment();
        return p.getDoctor().getId().equals(requester.getId())
                || appt.getSponsor().getId().equals(requester.getId())
                || appt.getRecipient().getId().equals(requester.getId());
    }

    private void assertCanView(Prescription p, User requester) {
        if (!canView(p, requester)) {
            throw new AccessDeniedException("Not authorised to view this prescription");
        }
    }

    private PrescriptionResponse toResponse(Prescription p) {
        return new PrescriptionResponse(
                p.getId(),
                p.getAppointment().getId(),
                p.getDoctor().getId(),
                p.getDoctor().getFullName(),
                p.getDiagnosis(),
                p.getFileName(),
                p.getCreatedAt()
        );
    }
}
