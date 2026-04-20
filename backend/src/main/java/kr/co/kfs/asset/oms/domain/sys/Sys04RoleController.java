package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys04RoleDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys04RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/roles")
@RequiredArgsConstructor
public class Sys04RoleController {

    private final Sys04RoleService service;

    @GetMapping("/{id}")
    public ResponseEntity<Sys04RoleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Sys04RoleDto>> search(
            @RequestParam Long companyId,
            @RequestParam(required = false) String roleName) {
        return ResponseEntity.ok(service.search(companyId, roleName));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<Sys04RoleDto>> getByUserId(
            @RequestParam Long companyId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(companyId, userId));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys04RoleDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys04RoleDto dto) {
        dto.setRoleId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
