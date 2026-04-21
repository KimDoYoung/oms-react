package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys07RoleMenuDto;
import java.util.List;

public interface Sys07RoleMenuService {
    List<Sys07RoleMenuDto> getByRoleId(Long roleId);
    int insert(Sys07RoleMenuDto dto);
    int update(Sys07RoleMenuDto dto);
    int delete(Long roleMenuId);
    int deleteByRoleId(Long roleId);
}
