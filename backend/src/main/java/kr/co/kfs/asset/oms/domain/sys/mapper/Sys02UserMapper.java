package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys02UserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys02UserMapper {
    Sys02UserDto selectById(Long userId);
    Sys02UserDto selectByLoginId(String loginId);
    List<Sys02UserDto> selectByCompanyId(Long companyId);
    List<Sys02UserDto> selectByName(@Param("companyId") Long companyId, @Param("korName") String korName);
    int insert(Sys02UserDto dto);
    int update(Sys02UserDto dto);
    int delete(Long userId);
}
