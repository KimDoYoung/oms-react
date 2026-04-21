package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys03CompanyMenuDto;
import java.util.List;

public interface Sys03CompanyMenuService {
    List<Sys03CompanyMenuDto> getByCompanyId(Long companyId);
    Sys03CompanyMenuDto getByMenu(Long companyId, Long menuId);
    int insert(Sys03CompanyMenuDto dto);
    int updateUseYn(Sys03CompanyMenuDto dto);
    int delete(Long companyId, Long menuId);
}
