package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class Sys09CodeDto {
    private Long      codeId;
    private Long      companyId;
    private Long      codeKindId;
    private String    code;
    private String    name;
    private Integer   seq;
    private LocalDate applyDate;
    private LocalDate closeDate;
    private String    closeYn;
    private String    note;
    private String    desc;
}
