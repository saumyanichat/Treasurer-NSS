package com.nss.treasurer.service;

import com.nss.treasurer.model.User;
import com.nss.treasurer.repository.UserRepository;
import com.nss.treasurer.dto.UserSyncDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public User syncUser(UserSyncDTO dto) {
        return userRepository.findByClerkUserId(dto.getClerkUserId())
                .map(user -> {
                    user.setName(dto.getName());
                    user.setImageUrl(dto.getImageUrl());
                    user.setEmail(dto.getEmail());
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .clerkUserId(dto.getClerkUserId())
                            .email(dto.getEmail())
                            .name(dto.getName())
                            .imageUrl(dto.getImageUrl())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    public User getByClerkUserId(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
