package com.preventia.controller;

import com.preventia.domain.entity.FamilyRelationship;
import com.preventia.domain.entity.User;
import com.preventia.service.FamilyService;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/family")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    /** Sponsor registers a family member (recipient) relationship. */
    @PostMapping("/link")
    public ResponseEntity<FamilyRelationship> link(@RequestParam @NotNull UUID sponsorId,
                                                    @RequestParam @NotNull UUID recipientId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(familyService.linkRecipient(sponsorId, recipientId));
    }

    /**
     * Recipient grants consent for EMR access.
     * PRD §5.1: "consent_status BOOLEAN DEFAULT FALSE — Essential for EMR access."
     */
    @PostMapping("/consent")
    public ResponseEntity<FamilyRelationship> grantConsent(@RequestParam @NotNull UUID sponsorId,
                                                            @RequestParam @NotNull UUID recipientId,
                                                            @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(familyService.grantConsent(sponsorId, recipientId, actor));
    }

    @DeleteMapping("/consent")
    public ResponseEntity<FamilyRelationship> revokeConsent(@RequestParam @NotNull UUID sponsorId,
                                                             @RequestParam @NotNull UUID recipientId,
                                                             @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(familyService.revokeConsent(sponsorId, recipientId, actor));
    }

    @GetMapping("/sponsor/{sponsorId}/recipients")
    public ResponseEntity<List<FamilyRelationship>> listRecipients(@PathVariable UUID sponsorId) {
        return ResponseEntity.ok(familyService.listRecipientsForSponsor(sponsorId));
    }
}
