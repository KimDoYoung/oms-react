package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys12CalendarDto;
import java.util.List;

public interface Sys12CalendarService {
    List<Sys12CalendarDto> getByYear(Long companyId, String year);
    List<Sys12CalendarDto> getByMonth(Long companyId, String yearMonth);
    Sys12CalendarDto getByDate(Long companyId, String date);
}
