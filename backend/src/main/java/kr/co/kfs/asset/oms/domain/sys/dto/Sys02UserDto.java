package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class Sys02UserDto {
    private Long   userId;
    private Long   companyId;
    private String korName;
    private String loginId;
    private String email;
    private String note;
    private String adminYn;
    private String telNo01;
    private String telNo02;
}
