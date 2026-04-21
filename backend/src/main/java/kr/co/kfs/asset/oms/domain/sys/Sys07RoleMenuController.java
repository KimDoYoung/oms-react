package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys07RoleMenuDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys07RoleMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/role-menus")
@RequiredArgsConstructor
public class Sys07RoleMenuController {

    private final Sys07RoleMenuService service;

    @GetMapping
    public ResponseEntity<List<Sys07RoleMenuDto>> getByRoleId(@RequestParam Long roleId) {
        return ResponseEntity.ok(service.getByRoleId(roleId));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys07RoleMenuDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys07RoleMenuDto dto) {
        dto.setRoleMenuId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }

    @DeleteMapping
    public ResponseEntity<Integer> deleteByRoleId(@RequestParam Long roleId) {
        return ResponseEntity.ok(service.deleteByRoleId(roleId));
    }
}
