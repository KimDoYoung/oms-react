package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys26LoginDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys26LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/logins")
@RequiredArgsConstructor
public class Sys26LoginController {

    private final Sys26LoginService service;

    @GetMapping("/{id}")
    public ResponseEntity<Sys26LoginDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Sys26LoginDto>> getByLoginDate(
            @RequestParam String startDate,
            @RequestParam String closeDate,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String loginMode) {
        return ResponseEntity.ok(service.getByLoginDate(startDate, closeDate, companyId, loginMode));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys26LoginDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }
}
