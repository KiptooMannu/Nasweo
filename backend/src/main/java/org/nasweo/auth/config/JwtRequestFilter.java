package org.nasweo.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.common.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;
        boolean mustChangePassword = false;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            try {
                if (jwtUtils.validateToken(jwtToken)) {
                    username = jwtUtils.getUsernameFromToken(jwtToken);
                    mustChangePassword = jwtUtils.getMustChangePasswordFromToken(jwtToken);
                }
            } catch (Exception e) {
                log.debug("JWT validation failed: {}", e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<String> roles = jwtUtils.getRolesFromToken(jwtToken);
            List<SimpleGrantedAuthority> authorities = roles != null
                    ? roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
                    : List.of();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Enforce mandatory password change across all protected endpoints:
            // If mustChangePassword is true, block access to any endpoint other than change-password, me, and auth endpoints.
            String requestUri = request.getRequestURI();
            if (mustChangePassword) {
                boolean isAllowed = requestUri.endsWith("/api/auth/change-password")
                        || requestUri.endsWith("/api/auth/me")
                        || requestUri.endsWith("/api/auth/logout");

                if (!isAllowed) {
                    log.warn("Blocked request to {} for user {}: mandatory password change pending", requestUri, username);
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"success\":false,\"message\":\"Mandatory password change required before accessing system resources. Please update your temporary password.\",\"code\":\"PASSWORD_CHANGE_REQUIRED\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
