package com.preventia.controller;

import com.preventia.domain.entity.PharmacyBid;
import com.preventia.domain.entity.User;
import com.preventia.service.PharmacyBidService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pharmacy-bids")
public class PharmacyBidController {

    private final PharmacyBidService bidService;

    public PharmacyBidController(PharmacyBidService bidService) {
        this.bidService = bidService;
    }

    /**
     * POST /api/pharmacy-bids — Pharmacy submits a bid.
     * PRD §6.2 Living Prescription: triggers a real-time price quote.
     */
    @PostMapping
    public ResponseEntity<PharmacyBid> submitBid(@Valid @RequestBody SubmitBidRequest req,
                                                   @AuthenticationPrincipal User pharmacyUser) {
        PharmacyBid bid = bidService.submitBid(
                req.prescriptionId(), req.quotedPriceInr(),
                req.estimatedDeliveryHours(), req.notes(), pharmacyUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(bid);
    }

    /**
     * POST /api/pharmacy-bids/{id}/accept — Sponsor clicks [ACCEPT & PAY].
     * PRD §6.3: Sponsor approval required before dispatch.
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<PharmacyBid> acceptBid(@PathVariable UUID id,
                                                   @Valid @RequestBody AcceptBidRequest req,
                                                   @AuthenticationPrincipal User sponsor) {
        return ResponseEntity.ok(bidService.acceptBid(id, req.razorpayPaymentId(), sponsor));
    }

    @PostMapping("/{id}/dispatch")
    public ResponseEntity<PharmacyBid> markDispatched(@PathVariable UUID id,
                                                        @AuthenticationPrincipal User pharmacyUser) {
        return ResponseEntity.ok(bidService.markDispatched(id, pharmacyUser));
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<PharmacyBid> markDelivered(@PathVariable UUID id,
                                                       @AuthenticationPrincipal User pharmacyUser) {
        return ResponseEntity.ok(bidService.markDelivered(id, pharmacyUser));
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<PharmacyBid>> bidsForPrescription(@PathVariable UUID prescriptionId) {
        return ResponseEntity.ok(bidService.listBidsForPrescription(prescriptionId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PharmacyBid>> myBids(@AuthenticationPrincipal User pharmacyUser) {
        return ResponseEntity.ok(bidService.listBidsForPharmacy(pharmacyUser.getId()));
    }

    // --- Request records ---

    public record SubmitBidRequest(
            @NotNull UUID prescriptionId,
            @NotNull @Positive BigDecimal quotedPriceInr,
            @Positive int estimatedDeliveryHours,
            String notes
    ) {}

    public record AcceptBidRequest(@NotBlank String razorpayPaymentId) {}
}
