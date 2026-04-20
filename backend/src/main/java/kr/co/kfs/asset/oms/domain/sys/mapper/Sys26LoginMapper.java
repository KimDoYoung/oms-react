package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys26LoginDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys26LoginMapper {
    Sys26LoginDto selectById(Long loginId);
    List<Sys26LoginDto> selectByLoginDate(@Param("startDate") String startDate, @Param("closeDate") String closeDate,
                                          @Param("companyId") String companyId, @Param("loginMode") String loginMode);
    int insert(Sys26LoginDto dto);
}
