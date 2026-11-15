package com.findit.repository;

import com.findit.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByItemId(UUID itemId);
    void deleteByItemId(UUID itemId);
}

