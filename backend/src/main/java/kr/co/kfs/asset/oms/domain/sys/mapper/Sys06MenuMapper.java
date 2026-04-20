package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys06MenuDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys06MenuMapper {
    Sys06MenuDto selectById(Long menuId);
    List<Sys06MenuDto> selectByAll();
    List<Sys06MenuDto> selectByCompanyId(@Param("companyId") Long companyId, @Param("parentId") Long parentId);
    List<Sys06MenuDto> selectByUserId(@Param("companyId") Long companyId, @Param("userId") Long userId);
    List<Sys06MenuDto> selectByRoleId(@Param("companyId") Long companyId, @Param("roleId") Long roleId);
    int insert(Sys06MenuDto dto);
    int update(Sys06MenuDto dto);
    int delete(Long menuId);
}
