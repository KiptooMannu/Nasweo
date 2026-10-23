package org.nasweo.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.nasweo.common.enums.Role;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    private static final String DEFAULT_SECRET = "NASWEO_SUPER_SECURE_ENTERPRISE_SECRET_KEY_FOR_NARL_STAFF_WELFARE_ORGANIZATION_2026";
    private static final long JWT_EXPIRATION_MS = 86400000L; // 24 hours

    private SecretKey getSigningKey() {
        byte[] keyBytes = DEFAULT_SECRET.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String payrollNo, Set<Role> roles, boolean mustChangePassword) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        List<String> roleNames = roles.stream()
                .map(Role::name)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(username)
                .claim("payrollNo", payrollNo)
                .claim("roles", roleNames)
                .claim("mustChangePassword", mustChangePassword)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateToken(String username, String payrollNo, Set<Role> roles) {
        return generateToken(username, payrollNo, roles, false);
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getPayrollNoFromToken(String token) {
        return getClaims(token).get("payrollNo", String.class);
    }

    public Boolean getMustChangePasswordFromToken(String token) {
        Boolean value = getClaims(token).get("mustChangePassword", Boolean.class);
        return value != null && value;
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaims(token).get("roles", List.class);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
