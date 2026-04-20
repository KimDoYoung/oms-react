package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys02UserDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys02UserMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys02UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys02UserServiceImpl implements Sys02UserService {

    private final Sys02UserMapper mapper;

    @Override
    public Sys02UserDto getById(Long userId) {
        return mapper.selectById(userId);
    }

    @Override
    public Sys02UserDto getByLoginId(String loginId) {
        return mapper.selectByLoginId(loginId);
    }

    @Override
    public List<Sys02UserDto> getByCompanyId(Long companyId) {
        return mapper.selectByCompanyId(companyId);
    }

    @Override
    @Transactional
    public int insert(Sys02UserDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys02UserDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long userId) {
        return mapper.delete(userId);
    }
}
