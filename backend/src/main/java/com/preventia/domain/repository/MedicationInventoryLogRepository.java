package com.preventia.domain.repository;

import com.preventia.domain.entity.MedicationInventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicationInventoryLogRepository extends JpaRepository<MedicationInventoryLog, UUID> {

    List<MedicationInventoryLog> findByInventoryIdOrderByCreatedAtDesc(UUID inventoryId);

    List<MedicationInventoryLog> findByDrasticChangeFlaggedTrue();
}
