package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys02UserDto;
import kr.co.kfs.asset.oms.domain.sys.dto.Sys06MenuDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys02UserService;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys06MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class Sys06MenuController {

    private final Sys06MenuService menuService;
    private final Sys02UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMenuTree(@AuthenticationPrincipal String loginId) {
        Sys02UserDto user = userService.getByLoginId(loginId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Sys06MenuDto> menus = menuService.getMenuTree(user.getCompanyId(), user.getUserId());
        return ResponseEntity.ok(Map.of("data", Map.of("menus", menus)));
    }
}
