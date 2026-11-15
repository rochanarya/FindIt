package com.findit.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.findit.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Cloudinary cloudinary;

    @Value("${app.storage.local-dir:./uploads}")
    private String localUploadDir;

    @Autowired
    public FileStorageService(@Autowired(required = false) Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public static class UploadResult {
        private final String url;
        private final String publicId;

        public UploadResult(String url, String publicId) {
            this.url = url;
            this.publicId = publicId;
        }

        public String getUrl() {
            return url;
        }

        public String getPublicId() {
            return publicId;
        }
    }

    public UploadResult uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new BadRequestException("Only image files (PNG, JPG, JPEG, WEBP) are allowed");
        }

        // 1. Try Cloudinary if configured
        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "findit/" + folder,
                        "resource_type", "auto"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");
                log.info("Uploaded to Cloudinary: {}", secureUrl);
                return new UploadResult(secureUrl, publicId);
            } catch (Exception e) {
                log.warn("Cloudinary upload failed ({}), falling back to local storage", e.getMessage());
            }
        }

        // 2. Fallback to Local Storage
        try {
            Path targetFolder = Paths.get(localUploadDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(targetFolder);

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            } else {
                extension = ".jpg";
            }

            String filename = UUID.randomUUID() + extension;
            Path targetPath = targetFolder.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String localUrl = "/uploads/" + folder + "/" + filename;
            log.info("Saved locally: {}", localUrl);
            return new UploadResult(localUrl, filename);
        } catch (IOException e) {
            log.error("Failed to store file locally", e);
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    public void deleteFile(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }

        if (cloudinary != null) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                return;
            } catch (Exception e) {
                log.warn("Failed to delete from Cloudinary: {}", e.getMessage());
            }
        }

        // Local deletion attempt if publicId matches a local file
        try {
            File localFile = Paths.get(localUploadDir, publicId).toFile();
            if (localFile.exists()) {
                localFile.delete();
            }
        } catch (Exception ignored) {
        }
    }
}

