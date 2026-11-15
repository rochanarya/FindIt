package com.findit.entity;

import com.findit.enums.ClaimStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "verification_answers", columnDefinition = "TEXT")
    private String verificationAnswers;

    @Column(name = "proof_image_url", columnDefinition = "TEXT")
    private String proofImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

