package kr.co.kfs.asset.oms.common.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OmsUserPrincipal {
    private final String loginId;
    private final Long userId;
    private final Long companyId;
}
