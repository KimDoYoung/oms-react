package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys02UserDto;
import java.util.List;

public interface Sys02UserService {
    Sys02UserDto getById(Long userId);
    Sys02UserDto getByLoginId(String loginId);
    List<Sys02UserDto> getByCompanyId(Long companyId);
    int insert(Sys02UserDto dto);
    int update(Sys02UserDto dto);
    int delete(Long userId);
}
