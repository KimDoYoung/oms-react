package kr.co.kfs.asset.oms.domain.sys;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys01CompanyDto;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys01CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sys/companies")
@RequiredArgsConstructor
public class Sys01CompanyController {

    private final Sys01CompanyService service;

    @GetMapping("/{id}")
    public ResponseEntity<Sys01CompanyDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-code/{code}")
    public ResponseEntity<Sys01CompanyDto> getByCompanyCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByCompanyCode(code));
    }

    @GetMapping
    public ResponseEntity<List<Sys01CompanyDto>> search(
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String useYn) {
        if (companyName == null && useYn == null) {
            return ResponseEntity.ok(service.getAll());
        }
        return ResponseEntity.ok(service.search(companyName, useYn));
    }

    @PostMapping
    public ResponseEntity<Integer> insert(@RequestBody Sys01CompanyDto dto) {
        return ResponseEntity.ok(service.insert(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Integer> update(@PathVariable Long id, @RequestBody Sys01CompanyDto dto) {
        dto.setCompanyId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
