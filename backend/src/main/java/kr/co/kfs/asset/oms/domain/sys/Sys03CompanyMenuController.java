package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys03CompanyMenuDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys03CompanyMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/company-menus")
@RequiredArgsConstructor
public class Sys03CompanyMenuController {

    private final Sys03CompanyMenuService service;

    @GetMapping
    public ResponseEntity<List<Sys03CompanyMenuDto>> getByCompanyId(@RequestParam Long companyId) {
        return ResponseEntity.ok(service.getByCompanyId(companyId));
    }

    @GetMapping("/by-menu")
    public ResponseEntity<Sys03CompanyMenuDto> getByMenu(
            @RequestParam Long companyId,
            @RequestParam Long menuId) {
        return ResponseEntity.ok(service.getByMenu(companyId, menuId));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys03CompanyMenuDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/use-yn")
    public ResponseEntity<Integer> updateUseYn(@RequestBody Sys03CompanyMenuDto dto) {
        return ResponseEntity.ok(service.updateUseYn(dto));
    }

    @DeleteMapping
    public ResponseEntity<Integer> delete(
            @RequestParam Long companyId,
            @RequestParam Long menuId) {
        return ResponseEntity.ok(service.delete(companyId, menuId));
    }
}
