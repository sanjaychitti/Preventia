package com.preventia.domain.repository;

import com.preventia.domain.entity.StaleTaskFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaleTaskFlagRepository extends JpaRepository<StaleTaskFlag, UUID> {

    List<StaleTaskFlag> findByResolvedFalse();

    Optional<StaleTaskFlag> findByAppointmentIdAndResolvedFalse(UUID appointmentId);
}
