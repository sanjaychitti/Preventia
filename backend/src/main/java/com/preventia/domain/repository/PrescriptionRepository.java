package com.preventia.domain.repository;

import com.preventia.domain.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    List<Prescription> findByAppointmentIdOrderByCreatedAtDesc(UUID appointmentId);

    List<Prescription> findByAppointmentRecipientIdOrderByCreatedAtDesc(UUID recipientId);
}
