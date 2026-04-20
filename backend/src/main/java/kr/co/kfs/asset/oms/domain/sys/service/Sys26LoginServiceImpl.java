package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys26LoginDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys26LoginMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys26LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys26LoginServiceImpl implements Sys26LoginService {

    private final Sys26LoginMapper mapper;

    @Override
    public Sys26LoginDto getById(Long loginId) {
        return mapper.selectById(loginId);
    }

    @Override
    public List<Sys26LoginDto> getByLoginDate(String startDate, String closeDate, String companyId, String loginMode) {
        if (companyId == null || companyId.isEmpty()) {
            companyId = "%";
        }
        if (loginMode == null || loginMode.isEmpty()) {
            loginMode = "%";
        }
        return mapper.selectByLoginDate(startDate, closeDate, companyId, loginMode);
    }

    @Override
    @Transactional
    public int insert(Sys26LoginDto dto) {
        return mapper.insert(dto);
    }
}
