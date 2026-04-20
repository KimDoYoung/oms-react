package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys03CompanyMenuDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys03CompanyMenuMapper {
    Sys03CompanyMenuDto selectById(Long companyMenuId);
    List<Sys03CompanyMenuDto> selectByCompanyId(Long companyId);
    Sys03CompanyMenuDto selectByMenu(@Param("companyId") Long companyId, @Param("menuId") Long menuId);
    int insert(Sys03CompanyMenuDto dto);
    int updateUseYn(Sys03CompanyMenuDto dto);
    int deleteByCompanyId(@Param("companyId") Long companyId, @Param("menuId") Long menuId);
}
