package kr.co.kfs.asset.oms.common.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * React SPA 라우팅 지원: API(/oms/**)에 해당하지 않는 경로에서 index.html을 반환한다.
 */
@RestController
public class SpaFallbackController {

    private final Resource indexHtml = new ClassPathResource("static/index.html");

    @RequestMapping(value = {
        "/{p1:[^\\.]+}",
        "/{p1:[^\\.]+}/{p2:[^\\.]+}",
        "/{p1:[^\\.]+}/{p2:[^\\.]+}/{p3:[^\\.]+}",
        "/{p1:[^\\.]+}/{p2:[^\\.]+}/{p3:[^\\.]+}/{p4:[^\\.]+}",
    })
    public ResponseEntity<Resource> spa() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(indexHtml);
    }
}
