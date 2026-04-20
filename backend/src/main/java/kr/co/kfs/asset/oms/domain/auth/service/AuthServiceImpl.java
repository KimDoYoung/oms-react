package kr.co.kfs.asset.oms.domain.auth.service;

import kr.co.kfs.asset.oms.common.security.JwtUtil;
import kr.co.kfs.asset.oms.domain.auth.dto.LoginRequestDto;
import kr.co.kfs.asset.oms.domain.auth.dto.TokenResponseDto;
import kr.co.kfs.asset.oms.domain.auth.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String REFRESH_PREFIX   = "oms_refresh_token:";
    private static final String BLACKLIST_PREFIX = "oms_blacklist:";

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    @Override
    public TokenResponseDto login(LoginRequestDto request) {
        log.debug("Login attempt - Company: {}, User: {}", request.getCompanyCode(), request.getUserId());
        
        User user = userMapper.findByUserId(request.getCompanyCode(), request.getUserId())
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found for {}/{}", request.getCompanyCode(), request.getUserId());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
                });

        String inputPw = request.getUserPw();
        String dbPw = user.getUserPw() != null ? user.getUserPw().trim() : "";

        log.debug("Password Check - Input: [{}], DB(Decrypted): [{}]", inputPw, dbPw);
        log.debug("Length Check - Input len: {}, DB len: {}", inputPw.length(), dbPw.length());

        // 1. DB에서 복호화되어 넘어온 평문과 직접 비교 (가장 우선)
        // 2. 만약 복호화되지 않은 원본 해시일 경우를 대비해 MD5 비교도 유지
        if (inputPw.equals(dbPw) || verifyMd5(inputPw, dbPw)) {
            log.info("Login success: {} (Company: {})", user.getUserId(), request.getCompanyCode());
        } else {
            log.warn("Login failed: password mismatch for user {}", request.getUserId());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken  = jwtUtil.generateAccessToken(user.getUserId(), user.getCompanyId(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getCompanyId(), user.getId());

        long refreshTtlSeconds = jwtUtil.getRemainingMillis(refreshToken) / 1000;
        redisTemplate.opsForValue().set(
                REFRESH_PREFIX + user.getUserId(),
                refreshToken,
                refreshTtlSeconds,
                TimeUnit.SECONDS
        );

        return new TokenResponseDto(accessToken, refreshToken, user.getUserNm(), user.getCompanyId(), user.getId());
    }

    private boolean verifyMd5(String rawPassword, String encodedPassword) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(rawPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString().equalsIgnoreCase(encodedPassword);
        } catch (NoSuchAlgorithmException e) {
            log.error("MD5 algorithm not found", e);
            return false;
        }
    }

    @Override
    public void logout(String accessToken) {
        String userId = jwtUtil.getUserId(accessToken);

        long remainingSeconds = jwtUtil.getRemainingMillis(accessToken) / 1000;
        if (remainingSeconds > 0) {
            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + accessToken,
                    "logout",
                    remainingSeconds,
                    TimeUnit.SECONDS
            );
        }

        redisTemplate.delete(REFRESH_PREFIX + userId);
        log.info("logout success: {}", userId);
    }

    @Override
    public TokenResponseDto refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 refresh token입니다.");
        }

        var claims = jwtUtil.parseClaims(refreshToken);
        String userId = claims.getSubject();
        Long companyId = claims.get("companyId", Long.class);
        Long userLongId = claims.get("userId", Long.class);

        String stored = redisTemplate.opsForValue().get(REFRESH_PREFIX + userId);

        if (!refreshToken.equals(stored)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "refresh token이 일치하지 않습니다.");
        }

        String newAccessToken = jwtUtil.generateAccessToken(userId, companyId, userLongId);
        log.info("token refresh success: {}", userId);
        return new TokenResponseDto(newAccessToken, refreshToken, null, companyId, userLongId);
    }
}
