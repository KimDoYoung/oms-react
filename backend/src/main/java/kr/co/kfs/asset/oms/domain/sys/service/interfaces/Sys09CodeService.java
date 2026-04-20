package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys09CodeDto;
import java.util.List;

public interface Sys09CodeService {
    Sys09CodeDto getById(Long codeId);
    List<Sys09CodeDto> getByCodeKindId(Long codeKindId, Long companyId, String searchText);
    List<Sys09CodeDto> getByKindCode(String kindCode, Long companyId);
    int insert(Sys09CodeDto dto);
    int update(Sys09CodeDto dto);
    int delete(Long codeKindId, Long companyId);
}
