package com.nss.treasurer.repository;

import com.nss.treasurer.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByUserId(String userId);
}
