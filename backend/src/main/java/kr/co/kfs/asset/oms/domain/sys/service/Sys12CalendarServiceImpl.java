package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys12CalendarDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys12CalendarMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys12CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys12CalendarServiceImpl implements Sys12CalendarService {

    private final Sys12CalendarMapper mapper;

    @Override
    public List<Sys12CalendarDto> getByYear(Long companyId, String year) {
        return mapper.selectByYear(companyId, year, "%");
    }

    @Override
    public List<Sys12CalendarDto> getByMonth(Long companyId, String yearMonth) {
        String year = yearMonth.substring(0, 4);
        String month = yearMonth.substring(4);
        return mapper.selectByMonth(companyId, year, month);
    }

    @Override
    public Sys12CalendarDto getByDate(Long companyId, String date) {
        return mapper.selectByDate(companyId, date);
    }
}
