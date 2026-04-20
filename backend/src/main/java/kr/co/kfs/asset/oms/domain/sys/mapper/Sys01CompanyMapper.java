package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys01CompanyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys01CompanyMapper {
    Sys01CompanyDto selectById(Long companyId);
    List<Sys01CompanyDto> selectByAll();
    List<Sys01CompanyDto> selectByName(@Param("companyName") String companyName, @Param("useYn") String useYn);
    int update(Sys01CompanyDto dto);
}
