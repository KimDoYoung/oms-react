package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys02UserDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys02UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/users")
@RequiredArgsConstructor
public class Sys02UserController {

    private final Sys02UserService service;

    @GetMapping("/{id}")
    public ResponseEntity<Sys02UserDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-login-id/{loginId}")
    public ResponseEntity<Sys02UserDto> getByLoginId(@PathVariable String loginId) {
        return ResponseEntity.ok(service.getByLoginId(loginId));
    }

    @GetMapping
    public ResponseEntity<List<Sys02UserDto>> getByCompanyId(@RequestParam Long companyId) {
        return ResponseEntity.ok(service.getByCompanyId(companyId));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys02UserDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys02UserDto dto) {
        dto.setUserId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
