package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys07RoleMenuDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys07RoleMenuMapper {
    Sys07RoleMenuDto selectById(Long roleMenuId);
    List<Sys07RoleMenuDto> selectByMenuId(@Param("companyId") Long companyId, @Param("menuId") Long menuId, @Param("roleName") String roleName);
    int insert(Sys07RoleMenuDto dto);
    int update(Sys07RoleMenuDto dto);
    int delete(Long roleMenuId);
}
