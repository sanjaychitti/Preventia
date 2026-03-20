package com.preventia.service;

import com.preventia.domain.entity.FamilyRelationship;
import com.preventia.domain.entity.User;
import com.preventia.domain.repository.FamilyRelationshipRepository;
import com.preventia.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * PRD §5.1 User & Family Map.
 * Manages Sponsor → Recipient relationships and consent.
 * Consent governs EMR access (prescriptions, vitals, medication inventory).
 */
@Service
@Transactional
public class FamilyService {

    private final FamilyRelationshipRepository familyRepository;
    private final UserRepository userRepository;

    public FamilyService(FamilyRelationshipRepository familyRepository,
                          UserRepository userRepository) {
        this.familyRepository = familyRepository;
        this.userRepository = userRepository;
    }

    public FamilyRelationship linkRecipient(UUID sponsorId, UUID recipientId) {
        if (familyRepository.existsBySponsorIdAndRecipientId(sponsorId, recipientId)) {
            throw new IllegalStateException("Relationship already exists between sponsor and recipient");
        }
        User sponsor = userRepository.findById(sponsorId)
                .orElseThrow(() -> new EntityNotFoundException("Sponsor not found: " + sponsorId));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found: " + recipientId));

        return familyRepository.save(FamilyRelationship.builder()
                .sponsor(sponsor)
                .recipient(recipient)
                .consentStatus(false)
                .build());
    }

    /**
     * Recipient grants consent for EMR access by the sponsor.
     */
    public FamilyRelationship grantConsent(UUID sponsorId, UUID recipientId, User actor) {
        FamilyRelationship rel = familyRepository.findBySponsorIdAndRecipientId(sponsorId, recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Family relationship not found"));

        // Only the recipient may grant consent
        if (!rel.getRecipient().getId().equals(actor.getId())) {
            throw new AccessDeniedException("Only the recipient can grant consent");
        }
        rel.setConsentStatus(true);
        return familyRepository.save(rel);
    }

    public FamilyRelationship revokeConsent(UUID sponsorId, UUID recipientId, User actor) {
        FamilyRelationship rel = familyRepository.findBySponsorIdAndRecipientId(sponsorId, recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Family relationship not found"));

        if (!rel.getRecipient().getId().equals(actor.getId())) {
            throw new AccessDeniedException("Only the recipient can revoke consent");
        }
        rel.setConsentStatus(false);
        return familyRepository.save(rel);
    }

    @Transactional(readOnly = true)
    public List<FamilyRelationship> listRecipientsForSponsor(UUID sponsorId) {
        return familyRepository.findBySponsorId(sponsorId);
    }

    @Transactional(readOnly = true)
    public boolean hasConsent(UUID sponsorId, UUID recipientId) {
        return familyRepository.findBySponsorIdAndRecipientId(sponsorId, recipientId)
                .map(FamilyRelationship::isConsentStatus)
                .orElse(false);
    }
}
