package com.preventia.domain.repository;

import com.preventia.domain.entity.Appointment;
import com.preventia.domain.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findBySponsorIdOrderByScheduledAtDesc(UUID sponsorId);

    List<Appointment> findByDoctorIdOrderByScheduledAtDesc(UUID doctorId);

    List<Appointment> findByRecipientIdOrderByScheduledAtDesc(UUID recipientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status ORDER BY a.scheduledAt ASC")
    List<Appointment> findByDoctorIdAndStatus(@Param("doctorId") UUID doctorId,
                                               @Param("status") AppointmentStatus status);
}
