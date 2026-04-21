package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys03CompanyMenuDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys03CompanyMenuMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys03CompanyMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys03CompanyMenuServiceImpl implements Sys03CompanyMenuService {

    private final Sys03CompanyMenuMapper mapper;

    @Override
    public List<Sys03CompanyMenuDto> getByCompanyId(Long companyId) {
        return mapper.selectByCompanyId(companyId);
    }

    @Override
    public Sys03CompanyMenuDto getByMenu(Long companyId, Long menuId) {
        return mapper.selectByMenu(companyId, menuId);
    }

    @Override
    @Transactional
    public int insert(Sys03CompanyMenuDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int updateUseYn(Sys03CompanyMenuDto dto) {
        return mapper.updateUseYn(dto);
    }

    @Override
    @Transactional
    public int delete(Long companyId, Long menuId) {
        return mapper.deleteByCompanyId(companyId, menuId);
    }
}
