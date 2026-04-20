package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys01CompanyDto;
import java.util.List;

public interface Sys01CompanyService {
    Sys01CompanyDto getById(Long companyId);
    Sys01CompanyDto getByCompanyCode(String companyCode);
    List<Sys01CompanyDto> getAll();
    List<Sys01CompanyDto> search(String companyName, String useYn);
    int insert(Sys01CompanyDto dto);
    int update(Sys01CompanyDto dto);
    int delete(Long companyId);
}
