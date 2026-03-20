package com.preventia.domain.repository;

import com.preventia.domain.entity.FamilyRelationship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyRelationshipRepository extends JpaRepository<FamilyRelationship, UUID> {

    List<FamilyRelationship> findBySponsorId(UUID sponsorId);

    List<FamilyRelationship> findByRecipientId(UUID recipientId);

    Optional<FamilyRelationship> findBySponsorIdAndRecipientId(UUID sponsorId, UUID recipientId);

    boolean existsBySponsorIdAndRecipientId(UUID sponsorId, UUID recipientId);
}
