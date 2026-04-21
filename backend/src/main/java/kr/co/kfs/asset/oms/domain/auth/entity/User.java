package kr.co.kfs.asset.oms.domain.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private Long companyId;
    private String userId;
    private String userPw;
    private String userNm;
    private OffsetDateTime createdAt;
}
