package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys26LoginDto;
import java.util.List;

public interface Sys26LoginService {
    Sys26LoginDto getById(Long loginId);
    List<Sys26LoginDto> getByLoginDate(String startDate, String closeDate, String companyId, String loginMode);
    int insert(Sys26LoginDto dto);
}
