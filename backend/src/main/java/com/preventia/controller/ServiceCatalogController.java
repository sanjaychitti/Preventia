package com.preventia.controller;

import com.preventia.domain.entity.ServiceCatalog;
import com.preventia.domain.enums.ServiceCategory;
import com.preventia.domain.enums.ServiceType;
import com.preventia.service.ServiceCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/services")
public class ServiceCatalogController {

    private final ServiceCatalogService catalogService;

    public ServiceCatalogController(ServiceCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /** All active services ordered by sort_order. Public — no auth required. */
    @GetMapping
    public ResponseEntity<List<ServiceCatalog>> listAll() {
        return ResponseEntity.ok(catalogService.listActive());
    }

    /**
     * Filter by customer-facing category: A_LA_CARTE | STANDARD | TRAVEL
     * GET /api/services/category/A_LA_CARTE
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceCatalog>> listByCategory(@PathVariable ServiceCategory category) {
        return ResponseEntity.ok(catalogService.listByCategory(category));
    }

    /**
     * Filter by business-logic type: TRANSACTIONAL | PROCEDURAL (PRD §4.1)
     * GET /api/services/type/TRANSACTIONAL
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ServiceCatalog>> listByType(@PathVariable ServiceType type) {
        return ResponseEntity.ok(catalogService.listByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceCatalog> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(catalogService.getById(id));
    }
}
