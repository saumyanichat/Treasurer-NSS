package com.nss.treasurer.repository;

import com.nss.treasurer.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, String> {
    Optional<Otp> findByEmailAndOtp(String email, String otp);
    void deleteByEmail(String email);
}
