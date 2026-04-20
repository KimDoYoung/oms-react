package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys04RoleDto;
import java.util.List;

public interface Sys04RoleService {
    Sys04RoleDto getById(Long roleId);
    List<Sys04RoleDto> getByCompanyId(Long companyId);
    List<Sys04RoleDto> search(Long companyId, String roleName);
    List<Sys04RoleDto> getByUserId(Long companyId, Long userId);
    int insert(Sys04RoleDto dto);
    int update(Sys04RoleDto dto);
    int delete(Long roleId);
}
