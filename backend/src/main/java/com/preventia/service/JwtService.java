package com.preventia.service;

import com.preventia.config.PreventiaProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long recipientTokenExpirationMs;

    public JwtService(PreventiaProperties props) {
        byte[] keyBytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = props.getJwt().getExpirationMs();
        this.recipientTokenExpirationMs = props.getJwt().getRecipientTokenExpirationMs();
    }

    public String generateToken(UserDetails userDetails) {
        return buildToken(Map.of(), userDetails.getUsername(), expirationMs);
    }

    /**
     * Generates a short-lived token for a recipient to join a Daily.co room.
     * Contains the appointment ID as a claim so the server can validate room access.
     */
    public String generateRecipientToken(UUID appointmentId, String recipientEmail) {
        return buildToken(Map.of("appointmentId", appointmentId.toString()), recipientEmail, recipientTokenExpirationMs);
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long ttlMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + ttlMs))
                .signWith(signingKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
