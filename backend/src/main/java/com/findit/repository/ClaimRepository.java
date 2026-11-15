package com.findit.repository;

import com.findit.entity.Claim;
import com.findit.enums.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long>, JpaSpecificationExecutor<Claim> {

    Page<Claim> findByClaimantId(UUID claimantId, Pageable pageable);

    List<Claim> findByItemId(UUID itemId);

    long countByClaimantId(UUID claimantId);

    long countByClaimantIdAndStatus(UUID claimantId, ClaimStatus status);

    long countByStatus(ClaimStatus status);

    boolean existsByItemIdAndStatus(UUID itemId, ClaimStatus status);

    boolean existsByItemIdAndClaimantId(UUID itemId, UUID claimantId);

    Optional<Claim> findByItemIdAndClaimantId(UUID itemId, UUID claimantId);

    @Query("SELECT c FROM Claim c WHERE c.item.id = :itemId AND c.status = 'PENDING'")
    List<Claim> findPendingClaimsByItemId(@Param("itemId") UUID itemId);
}
