package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys12CalendarDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys12CalendarMapper {
    Sys12CalendarDto selectById(Long calendarId);
    List<Sys12CalendarDto> selectByYear(@Param("companyId") Long companyId, @Param("year") String year, @Param("month") String month);
    List<Sys12CalendarDto> selectByDay(@Param("companyId") Long companyId, @Param("stdDate") String stdDate);
    int insertAuto(@Param("companyId") Long companyId, @Param("startYmd") String startYmd, @Param("endYmd") String endYmd);
    int deleteByDay(@Param("companyId") Long companyId, @Param("startYmd") String startYmd, @Param("endYmd") String endYmd);
}
