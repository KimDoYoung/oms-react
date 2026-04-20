package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys08CodeKindDto;
import java.util.List;

public interface Sys08CodeKindService {
    List<Sys08CodeKindDto> getAll();
    List<Sys08CodeKindDto> search(String kindName, String sysYn);
    Sys08CodeKindDto getByKindCode(String kindCode);
    Sys08CodeKindDto getById(Long codeKindId);
    int insert(Sys08CodeKindDto dto);
    int update(Sys08CodeKindDto dto);
    int delete(Long codeKindId);
}
