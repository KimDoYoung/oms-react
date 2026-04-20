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
        User user = userMapper.findByUserId(request.getCompanyCode(), request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!user.getUserPw().equals(request.getUserPw())) {
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

        log.info("login success: {} (Company: {})", user.getUserId(), request.getCompanyCode());
        return new TokenResponseDto(accessToken, refreshToken, user.getUserNm(), user.getCompanyId(), user.getId());
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
