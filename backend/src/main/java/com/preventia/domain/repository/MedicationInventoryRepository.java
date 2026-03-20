package com.preventia.domain.repository;

import com.preventia.domain.entity.MedicationInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicationInventoryRepository extends JpaRepository<MedicationInventory, UUID> {

    List<MedicationInventory> findByRecipientIdOrderByMedicationNameAsc(UUID recipientId);

    /**
     * Finds all inventory records whose days remaining is at or below the given threshold.
     * days_remaining = actual_stock_count / daily_dosage
     */
    @Query("SELECT m FROM MedicationInventory m WHERE m.actualStockCount / m.dailyDosage <= :threshold")
    List<MedicationInventory> findRefillRequired(@Param("threshold") double threshold);
}
