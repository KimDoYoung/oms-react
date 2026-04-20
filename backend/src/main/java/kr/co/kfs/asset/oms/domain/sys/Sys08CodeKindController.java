package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys08CodeKindDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys08CodeKindService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/code-kinds")
@RequiredArgsConstructor
public class Sys08CodeKindController {

    private final Sys08CodeKindService service;

    @GetMapping
    public ResponseEntity<List<Sys08CodeKindDto>> search(
            @RequestParam(required = false) String kindName,
            @RequestParam(required = false) String sysYn) {
        if (kindName == null && sysYn == null) {
            return ResponseEntity.ok(service.getAll());
        }
        return ResponseEntity.ok(service.search(kindName, sysYn));
    }

    @GetMapping("/by-code/{kindCode}")
    public ResponseEntity<Sys08CodeKindDto> getByKindCode(@PathVariable String kindCode) {
        return ResponseEntity.ok(service.getByKindCode(kindCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sys08CodeKindDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys08CodeKindDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys08CodeKindDto dto) {
        dto.setCodeKindId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
