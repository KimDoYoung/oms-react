package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys05UserRoleDto;
import java.util.List;

public interface Sys05UserRoleService {
    List<Sys05UserRoleDto> getByUserId(Long userId);
    List<Sys05UserRoleDto> getByRoleId(Long roleId);
    int insert(Sys05UserRoleDto dto);
    int delete(Long userRoleId);
}
