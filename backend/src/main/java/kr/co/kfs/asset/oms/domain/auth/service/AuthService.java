package kr.co.kfs.asset.oms.domain.auth.service;

import kr.co.kfs.asset.oms.domain.auth.dto.LoginRequestDto;
import kr.co.kfs.asset.oms.domain.auth.dto.TokenResponseDto;

public interface AuthService {
    TokenResponseDto login(LoginRequestDto request);
    void logout(String accessToken);
    TokenResponseDto refresh(String refreshToken);
}
