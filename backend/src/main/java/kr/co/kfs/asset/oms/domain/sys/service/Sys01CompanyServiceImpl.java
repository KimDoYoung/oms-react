package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys01CompanyDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys01CompanyMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys01CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys01CompanyServiceImpl implements Sys01CompanyService {

    private final Sys01CompanyMapper mapper;

    @Override
    public Sys01CompanyDto getById(Long companyId) {
        return mapper.selectById(companyId);
    }

    @Override
    public Sys01CompanyDto getByCompanyCode(String companyCode) {
        return mapper.selectByCompanyCode(companyCode);
    }

    @Override
    public List<Sys01CompanyDto> getAll() {
        return mapper.selectByAll();
    }

    @Override
    public List<Sys01CompanyDto> search(String companyName, String useYn) {
        if (companyName == null || companyName.isEmpty()) {
            companyName = "%";
        } else {
            companyName = "%" + companyName + "%";
        }
        return mapper.selectByName(companyName, useYn);
    }

    @Override
    @Transactional
    public int insert(Sys01CompanyDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys01CompanyDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long companyId) {
        return mapper.delete(companyId);
    }
}
