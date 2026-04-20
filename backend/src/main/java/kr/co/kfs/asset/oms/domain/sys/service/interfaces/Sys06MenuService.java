package kr.co.kfs.asset.oms.domain.sys.service.interfaces;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys06MenuDto;
import java.util.List;
import java.util.Map;

public interface Sys06MenuService {
    List<Sys06MenuDto> getAll();
    List<Sys06MenuDto> getByUserId(Long companyId, Long userId);
    List<Sys06MenuDto> getMenuTree(Long companyId, Long userId);
    int insert(Sys06MenuDto dto);
    int update(Sys06MenuDto dto);
    int delete(Long menuId);
}
