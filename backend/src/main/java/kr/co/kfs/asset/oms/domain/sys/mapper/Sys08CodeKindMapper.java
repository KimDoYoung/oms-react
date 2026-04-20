package kr.co.kfs.asset.oms.domain.sys.mapper;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys08CodeKindDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface Sys08CodeKindMapper {
    List<Sys08CodeKindDto> selectByAll();
    List<Sys08CodeKindDto> selectByKindName(@Param("kindName") String kindName, @Param("sysYn") String sysYn);
    Sys08CodeKindDto selectByKindCode(String kindCode);
    Sys08CodeKindDto selectById(Long codeKindId);
    int insert(Sys08CodeKindDto dto);
    int update(Sys08CodeKindDto dto);
    int delete(Long codeKindId);
}
