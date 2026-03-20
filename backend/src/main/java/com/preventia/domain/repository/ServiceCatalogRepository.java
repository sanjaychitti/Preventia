package com.preventia.domain.repository;

import com.preventia.domain.entity.ServiceCatalog;
import com.preventia.domain.enums.ServiceCategory;
import com.preventia.domain.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, UUID> {

    List<ServiceCatalog> findByActiveTrueOrderBySortOrderAsc();

    List<ServiceCatalog> findByCategoryAndActiveTrueOrderBySortOrderAsc(ServiceCategory category);

    List<ServiceCatalog> findByServiceTypeAndActiveTrueOrderBySortOrderAsc(ServiceType serviceType);
}
