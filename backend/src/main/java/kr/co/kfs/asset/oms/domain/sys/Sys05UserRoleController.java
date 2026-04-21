package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys05UserRoleDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys05UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/user-roles")
@RequiredArgsConstructor
public class Sys05UserRoleController {

    private final Sys05UserRoleService service;

    @GetMapping
    public ResponseEntity<List<Sys05UserRoleDto>> getList(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long roleId) {
        if (userId != null) return ResponseEntity.ok(service.getByUserId(userId));
        if (roleId != null) return ResponseEntity.ok(service.getByRoleId(roleId));
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys05UserRoleDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
