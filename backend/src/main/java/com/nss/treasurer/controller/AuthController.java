package com.nss.treasurer.controller;

import com.nss.treasurer.dto.UserSyncDTO;
import com.nss.treasurer.model.User;
import com.nss.treasurer.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<User> sync(@AuthenticationPrincipal Jwt jwt) {
        UserSyncDTO dto = new UserSyncDTO();
        dto.setClerkUserId(jwt.getSubject()); // Clerk usually puts user ID in 'sub'
        dto.setEmail(jwt.getClaimAsString("email"));
        dto.setName(jwt.getClaimAsString("name"));
        // imageUrl might be in another claim, adjusting as needed
        dto.setImageUrl(jwt.getClaimAsString("picture")); 
        
        return ResponseEntity.ok(userService.syncUser(dto));
    }
}
