package com.preventia.service;

import com.preventia.domain.entity.PharmacyBid;
import com.preventia.domain.entity.Prescription;
import com.preventia.domain.entity.User;
import com.preventia.domain.enums.BidStatus;
import com.preventia.domain.repository.PharmacyBidRepository;
import com.preventia.domain.repository.PrescriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * PRD §6.3 Pharmacy Fulfillment Bidding System:
 *  - Pharmacies receive signed prescriptions and input INR price quotes + delivery times.
 *  - Sponsor must click [ACCEPT & PAY] (acceptBid) to authorise dispatch.
 *
 * PRD §6.2 Living Prescription:
 *  - When a prescription is created, pharmacies are notified to submit bids.
 *  - Bids are returned alongside the prescription for real-time price display.
 */
@Service
@Transactional
public class PharmacyBidService {

    private static final Logger log = LoggerFactory.getLogger(PharmacyBidService.class);

    private final PharmacyBidRepository bidRepository;
    private final PrescriptionRepository prescriptionRepository;

    public PharmacyBidService(PharmacyBidRepository bidRepository,
                               PrescriptionRepository prescriptionRepository) {
        this.bidRepository = bidRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    /**
     * Pharmacy submits a bid (price + delivery estimate) against a prescription.
     */
    public PharmacyBid submitBid(UUID prescriptionId,
                                  BigDecimal quotedPriceInr,
                                  int estimatedDeliveryHours,
                                  String notes,
                                  User pharmacyUser) {
        if (pharmacyUser.getRole() != com.preventia.domain.enums.UserRole.PHARMACY) {
            throw new AccessDeniedException("Only users with PHARMACY role may submit bids");
        }

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Prescription not found: " + prescriptionId));

        if (bidRepository.existsByPrescriptionIdAndPharmacyId(prescriptionId, pharmacyUser.getId())) {
            throw new IllegalStateException("This pharmacy has already submitted a bid for prescription " + prescriptionId);
        }

        PharmacyBid bid = PharmacyBid.builder()
                .prescription(prescription)
                .pharmacy(pharmacyUser)
                .quotedPriceInr(quotedPriceInr)
                .estimatedDeliveryHours(estimatedDeliveryHours)
                .notes(notes)
                .status(BidStatus.PENDING)
                .build();

        bid = bidRepository.save(bid);
        log.info("Pharmacy {} submitted bid for prescription {} — ₹{}", pharmacyUser.getId(), prescriptionId, quotedPriceInr);
        return bid;
    }

    /**
     * Sponsor clicks [ACCEPT & PAY].
     * Rejects all other PENDING bids for the same prescription.
     * PRD §6.3: "The NRI child must click [ACCEPT & PAY] before the pharmacy dispatches."
     */
    public PharmacyBid acceptBid(UUID bidId, String razorpayPaymentId, User sponsor) {
        PharmacyBid bid = findOrThrow(bidId);

        // Only the sponsor of the recipient's appointment may accept
        User sponsorOfRecord = bid.getPrescription().getAppointment().getSponsor();
        if (!sponsorOfRecord.getId().equals(sponsor.getId())) {
            throw new AccessDeniedException("Only the linked sponsor may accept this bid");
        }

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new IllegalStateException("Bid " + bidId + " is not in PENDING state (current: " + bid.getStatus() + ")");
        }

        bid.setStatus(BidStatus.ACCEPTED);
        bid.setRazorpayPaymentId(razorpayPaymentId);
        bid.setAcceptedAt(Instant.now());
        bidRepository.save(bid);

        // Reject all other pending bids for this prescription
        UUID prescriptionId = bid.getPrescription().getId();
        bidRepository.findByPrescriptionIdAndStatus(prescriptionId, BidStatus.PENDING)
                .stream()
                .filter(b -> !b.getId().equals(bidId))
                .forEach(b -> {
                    b.setStatus(BidStatus.REJECTED);
                    bidRepository.save(b);
                });

        log.info("Bid {} accepted by sponsor {} — razorpay={}", bidId, sponsor.getId(), razorpayPaymentId);
        return bid;
    }

    /**
     * Pharmacy marks as dispatched after acceptance.
     */
    public PharmacyBid markDispatched(UUID bidId, User pharmacyUser) {
        PharmacyBid bid = findOrThrow(bidId);
        assertIsOwningPharmacy(bid, pharmacyUser);

        if (bid.getStatus() != BidStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot dispatch a bid that is not ACCEPTED");
        }

        bid.setStatus(BidStatus.DISPATCHED);
        bid.setDispatchedAt(Instant.now());
        bidRepository.save(bid);
        log.info("Bid {} marked as dispatched", bidId);
        return bid;
    }

    /**
     * Marks as delivered (can be triggered by pharmacy or system webhook).
     */
    public PharmacyBid markDelivered(UUID bidId, User pharmacyUser) {
        PharmacyBid bid = findOrThrow(bidId);
        assertIsOwningPharmacy(bid, pharmacyUser);

        if (bid.getStatus() != BidStatus.DISPATCHED) {
            throw new IllegalStateException("Cannot mark delivered a bid that is not DISPATCHED");
        }

        bid.setStatus(BidStatus.DELIVERED);
        bid.setDeliveredAt(Instant.now());
        bidRepository.save(bid);
        log.info("Bid {} marked as delivered", bidId);
        return bid;
    }

    @Transactional(readOnly = true)
    public List<PharmacyBid> listBidsForPrescription(UUID prescriptionId) {
        return bidRepository.findByPrescriptionIdOrderByQuotedPriceInrAsc(prescriptionId);
    }

    @Transactional(readOnly = true)
    public List<PharmacyBid> listBidsForPharmacy(UUID pharmacyId) {
        return bidRepository.findByPharmacyIdOrderByCreatedAtDesc(pharmacyId);
    }

    // --- helpers ---

    private PharmacyBid findOrThrow(UUID id) {
        return bidRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy bid not found: " + id));
    }

    private void assertIsOwningPharmacy(PharmacyBid bid, User actor) {
        if (!bid.getPharmacy().getId().equals(actor.getId())) {
            throw new AccessDeniedException("Not authorised to modify this bid");
        }
    }
}
