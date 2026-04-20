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
    public List<Sys12CalendarDto> getByYear(String year) {
        return mapper.selectByYear(year);
    }

    @Override
    public List<Sys12CalendarDto> getByMonth(String yearMonth) {
        return mapper.selectByMonth(yearMonth);
    }

    @Override
    public Sys12CalendarDto getByDate(String date) {
        return mapper.selectByDate(date);
    }
}
