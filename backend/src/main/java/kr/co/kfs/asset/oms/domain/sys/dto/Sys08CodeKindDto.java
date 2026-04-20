package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class Sys08CodeKindDto {
    private Long      codeKindId;
    private String    kindCode;
    private String    kindName;
    private String    sysYn;
    private String    note;
    private LocalDate date;
}
