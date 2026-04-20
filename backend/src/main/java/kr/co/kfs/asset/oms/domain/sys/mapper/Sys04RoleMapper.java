package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys04RoleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys04RoleMapper {
    Sys04RoleDto selectById(Long roleId);
    List<Sys04RoleDto> selectByCompanyId(Long companyId);
    List<Sys04RoleDto> selectByName(@Param("companyId") Long companyId, @Param("roleName") String roleName);
    List<Sys04RoleDto> selectByUserId(@Param("companyId") Long companyId, @Param("userId") Long userId);
    int insert(Sys04RoleDto dto);
    int update(Sys04RoleDto dto);
    int delete(Long roleId);
}
