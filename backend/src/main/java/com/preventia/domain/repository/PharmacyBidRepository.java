package com.preventia.domain.repository;

import com.preventia.domain.entity.PharmacyBid;
import com.preventia.domain.enums.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PharmacyBidRepository extends JpaRepository<PharmacyBid, UUID> {

    List<PharmacyBid> findByPrescriptionIdOrderByQuotedPriceInrAsc(UUID prescriptionId);

    List<PharmacyBid> findByPharmacyIdOrderByCreatedAtDesc(UUID pharmacyId);

    List<PharmacyBid> findByPrescriptionIdAndStatus(UUID prescriptionId, BidStatus status);

    boolean existsByPrescriptionIdAndPharmacyId(UUID prescriptionId, UUID pharmacyId);
}
