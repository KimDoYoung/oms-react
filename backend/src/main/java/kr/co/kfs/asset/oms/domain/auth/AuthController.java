package kr.co.kfs.asset.oms.domain.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kr.co.kfs.asset.oms.domain.auth.dto.LoginRequestDto;
import kr.co.kfs.asset.oms.domain.auth.dto.TokenResponseDto;
import kr.co.kfs.asset.oms.domain.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request,
                                                  HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) ipAddress = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, ipAddress));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String bearerToken) {
        String accessToken = bearerToken.substring(7);
        authService.logout(accessToken);
        return ResponseEntity.ok(Map.of("result", "success"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "version", "0.0.1"));
    }
}
