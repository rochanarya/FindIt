package com.findit.service;

import com.findit.dto.request.CategoryRequest;
import com.findit.dto.response.CategoryDto;
import com.findit.entity.Category;
import com.findit.exception.ConflictException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryDto.from(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new ConflictException("Category with name '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();
        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new ConflictException("Another category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}

