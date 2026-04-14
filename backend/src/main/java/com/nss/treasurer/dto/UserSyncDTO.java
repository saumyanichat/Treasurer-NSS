package com.nss.treasurer.dto;

import lombok.Data;

@Data
public class UserSyncDTO {
    private String clerkUserId;
    private String email;
    private String name;
    private String imageUrl;
}
