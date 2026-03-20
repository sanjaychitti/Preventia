package com.preventia.service;

import com.preventia.domain.entity.ServiceCatalog;
import com.preventia.domain.enums.ServiceCategory;
import com.preventia.domain.enums.ServiceType;
import com.preventia.domain.repository.ServiceCatalogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Master Product Table — Integrated Ecosystem.
 * Pricing is stored in INR. USD conversion uses Geo-IP detection at < 200ms (PRD §7 NFR).
 *
 * Categories:
 *   A_LA_CARTE — E-Prescription, Virtual Consult, Lab Test, Sahayak Assist
 *   STANDARD   — Basic, Comprehensive, Executive
 *   TRAVEL     — Fit2Fly Lite, Fit2Fly 360
 */
@Service
@Transactional(readOnly = true)
public class ServiceCatalogService {

    private final ServiceCatalogRepository catalogRepository;

    public ServiceCatalogService(ServiceCatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    public List<ServiceCatalog> listActive() {
        return catalogRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    public List<ServiceCatalog> listByCategory(ServiceCategory category) {
        return catalogRepository.findByCategoryAndActiveTrueOrderBySortOrderAsc(category);
    }

    public List<ServiceCatalog> listByType(ServiceType serviceType) {
        return catalogRepository.findByServiceTypeAndActiveTrueOrderBySortOrderAsc(serviceType);
    }

    public ServiceCatalog getById(UUID id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Service not found: " + id));
    }
}
