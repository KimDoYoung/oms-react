package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys13CodeGroupDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys13CodeGroupMapper {
    Sys13CodeGroupDto selectById(Long codeGroupId);
    List<Sys13CodeGroupDto> selectByGroupCodeKind(Long codeKindId);
    List<Sys13CodeGroupDto> selectByKindGroupCode(@Param("kindGroupCode") String kindGroupCode, @Param("codeKindId") Long codeKindId, @Param("companyId") Long companyId);
    int insert(Sys13CodeGroupDto dto);
    int update(Sys13CodeGroupDto dto);
    int delete(@Param("codeKindId") Long codeKindId, @Param("kindGroupCode") String kindGroupCode, @Param("kindGroupName") String kindGroupName);
}
