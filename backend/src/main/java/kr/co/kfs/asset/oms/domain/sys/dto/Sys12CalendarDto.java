package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class Sys12CalendarDto {
    private Long      calendarId;
    private Long      companyId;
    private LocalDate day;
    private String    weekday;
    private String    workingYn;
    private String    offReason;
    private String    note;
    private String    companyName;
}
