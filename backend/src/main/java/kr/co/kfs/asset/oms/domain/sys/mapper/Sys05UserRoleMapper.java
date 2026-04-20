package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys05UserRoleDto;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface Sys05UserRoleMapper {
    List<Sys05UserRoleDto> selectByRoleId(Long roleId);
    List<Sys05UserRoleDto> selectByUserId(Long userId);
    int insert(Sys05UserRoleDto dto);
    int delete(Long userRoleId);
}
