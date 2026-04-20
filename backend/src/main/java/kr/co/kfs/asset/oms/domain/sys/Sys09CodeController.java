package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys09CodeDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys09CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/codes")
@RequiredArgsConstructor
public class Sys09CodeController {

    private final Sys09CodeService service;

    @GetMapping("/{id}")
    public ResponseEntity<Sys09CodeDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Sys09CodeDto>> getByCodeKindId(
            @RequestParam Long codeKindId,
            @RequestParam Long companyId,
            @RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(service.getByCodeKindId(codeKindId, companyId, searchText));
    }

    @GetMapping("/by-kind-code/{kindCode}")
    public ResponseEntity<List<Sys09CodeDto>> getByKindCode(
            @PathVariable String kindCode,
            @RequestParam(required = false) Long companyId) {
        return ResponseEntity.ok(service.getByKindCode(kindCode, companyId));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys09CodeDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys09CodeDto dto) {
        dto.setCodeId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping
    public ResponseEntity<Integer> delete(@RequestParam Long codeKindId, @RequestParam Long companyId) {
        return ResponseEntity.ok(service.delete(codeKindId, companyId));
    }
}
