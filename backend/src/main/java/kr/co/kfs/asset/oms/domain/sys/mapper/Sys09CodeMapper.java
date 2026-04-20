package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys09CodeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys09CodeMapper {
    Sys09CodeDto selectById(Long codeId);
    List<Sys09CodeDto> selectByCodeKindId(@Param("codeKindId") Long codeKindId, @Param("companyId") Long companyId, @Param("searchText") String searchText);
    List<Sys09CodeDto> selectByStringComboBox(@Param("kindCode") String kindCode, @Param("companyId") Long companyId);
    int insert(Sys09CodeDto dto);
    int update(Sys09CodeDto dto);
    int delete(@Param("codeKindId") Long codeKindId, @Param("companyId") Long companyId);
}
