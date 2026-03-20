package com.preventia.domain.repository;

import com.preventia.domain.entity.VitalsRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VitalsRecordRepository extends JpaRepository<VitalsRecord, UUID> {

    List<VitalsRecord> findByRecipientIdOrderByRecordedAtDesc(UUID recipientId);

    List<VitalsRecord> findByAppointmentIdOrderByRecordedAtDesc(UUID appointmentId);

    /** Only Verified (Sahayak-submitted) vitals — used in Physician split-pane view */
    List<VitalsRecord> findByRecipientIdAndVerifiedTrueOrderByRecordedAtDesc(UUID recipientId);
}
