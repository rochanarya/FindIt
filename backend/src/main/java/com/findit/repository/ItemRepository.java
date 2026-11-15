package com.findit.repository;

import com.findit.entity.Item;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID>, JpaSpecificationExecutor<Item> {

    Page<Item> findByReportedById(UUID userId, Pageable pageable);

    Page<Item> findByReportedByIdAndItemType(UUID userId, ItemType itemType, Pageable pageable);

    Page<Item> findByReportedByIdAndStatus(UUID userId, ItemStatus status, Pageable pageable);

    List<Item> findTop6ByOrderByCreatedAtDesc();

    List<Item> findTop6ByStatusOrderByCreatedAtDesc(ItemStatus status);

    long countByItemType(ItemType itemType);

    long countByStatus(ItemStatus status);

    long countByReportedById(UUID userId);

    long countByReportedByIdAndItemType(UUID userId, ItemType itemType);

    long countByReportedByIdAndStatus(UUID userId, ItemStatus status);

    @Query("SELECT i FROM Item i WHERE i.itemType = :oppositeType AND i.status = :status AND i.id != :excludeId")
    List<Item> findCandidatesForMatching(
            @Param("oppositeType") ItemType oppositeType,
            @Param("status") ItemStatus status,
            @Param("excludeId") UUID excludeId
    );

    @Query("SELECT FUNCTION('to_char', i.createdAt, 'YYYY-MM') AS month, COUNT(i) AS count " +
           "FROM Item i GROUP BY FUNCTION('to_char', i.createdAt, 'YYYY-MM') ORDER BY month ASC")
    List<Object[]> getMonthlyItemStats();

    @Query("SELECT i.category.name, COUNT(i) FROM Item i GROUP BY i.category.name")
    List<Object[]> getCategoryItemStats();
}

