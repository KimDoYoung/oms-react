package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class Sys01CompanyDto {
    private Long      companyId;
    private String    companyName;
    private String    locationName;
    private String    bizNo;
    private LocalDate startDate;
    private LocalDate closeDate;
    private String    useYn;
    private String    contractType;
    private String    note;
    private String    menuYn;
    private String    zipCode;
    private String    zipAddress;
    private String    zipDetail;
    private String    fullAddress;
    private String    officeTelNo;
    private String    mobileTelNo;
    private String    emailAddress;
    private String    companyRepName;
    private String    assetYn;
    private String    advisYn;
    private String    pbsYn;
}
