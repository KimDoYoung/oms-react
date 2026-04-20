package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
public class Sys26LoginDto {
    private Long          loginId;
    private Long          personId;
    private LocalDateTime openDate;
    private String        ipAddress;
    private String        statusCode;
    private String        loginMode;
    private String        macAddress;
    private String        os;
    private String        browser;
    private String        openDateString;
    private String        companyName;
    private String        personName;
    private String        loginModeName;
    private String        statusName;
}
