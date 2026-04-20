# GWT/GXT → Spring Boot + React 변환 가이드

## 배경

- **원본 프로젝트**: `/home/kdy987/workspace26/Asset-OMS` (GWT/GXT 기반 OMS)
- **목표 프로젝트**: `/home/kdy987/work/oms-react` (Spring Boot + React 기반 OMS)
- **목적**: GWT/GXT로 구현된 로그인·메뉴체계·Role 기반까지 Spring Boot + React로 재현하여 프레젠테이션

---

## GWT 원본 구조

```
myOms/server/
├── ServiceBrokerImpl.java        ← GWT-RPC 단일 진입점 (리플렉션으로 도메인 호출)
├── emp/
│   ├── Emp01_Person.java
│   └── mapper/emp01_person.xml
├── mst/
│   ├── Mst01_Fund.java
│   └── mapper/mst01_fund.xml
├── org/
│   ├── Org01_Code.java
│   └── mapper/org01_code.xml
├── sys/
│   ├── Sys08_CodeKind.java
│   └── mapper/sys08_code_kind.xml
└── tgt/
    ├── Tgt01_Model.java
    └── mapper/tgt01_model.xml
```

### GWT 동작 방식

1. 프론트(GXT)가 `ServiceBrokerImpl`에 GWT-RPC 호출
2. `ServiceBrokerImpl`이 리플렉션으로 `"myOms.server.sys.Sys08_CodeKind.selectByKindName"` 메서드 호출
3. 도메인 클래스가 `SqlSession`으로 MyBatis XML 쿼리 실행
4. 결과를 `ServiceResult`에 담아 반환

---

## Spring Boot 변환 구조

### 디렉토리 구조 (1 도메인 기준)

```
domain/sys/
├── Sys08CodeKindController.java          ← @RestController
├── dto/
│   └── Sys08CodeKindDto.java             ← 요청/응답 데이터
├── service/
│   ├── interfaces/
│   │   └── Sys08CodeKindService.java     ← Service 인터페이스
│   └── Sys08CodeKindServiceImpl.java     ← Service 구현체
└── mapper/
    ├── Sys08CodeKindMapper.java          ← @Mapper 인터페이스
    └── Sys08CodeKindMapper.xml           ← SQL (GWT XML 재활용)
```

### 파일 대응표

| GWT 원본 | Spring Boot 변환 | 비고 |
|---------|----------------|------|
| `Sys08_CodeKind.java` | `Sys08CodeKindController.java` | SELECT → GET, INSERT/UPDATE → POST/PUT, DELETE → DELETE |
| `Sys08_CodeKind.java` | `Sys08CodeKindService.java` (interface) | 비즈니스 로직 분리 |
| `Sys08_CodeKind.java` | `Sys08CodeKindServiceImpl.java` | 실제 구현 |
| `Sys08_CodeKind.java` | `Sys08CodeKindMapper.java` | SqlSession 직접 호출 → @Mapper 인터페이스 |
| `Sys08_CodeKindModel.java` | `Sys08CodeKindDto.java` | GWT 전송 모델 → 일반 DTO |
| `sys08_code_kind.xml` | `Sys08CodeKindMapper.xml` | namespace만 변경, SQL은 재활용 |

---

## 변환 규칙

### 1. XML Mapper namespace 변경

```xml
<!-- GWT: 단순 문자열 -->
<mapper namespace="sys08_code_kind">

<!-- Spring Boot: Mapper 인터페이스 FQCN -->
<mapper namespace="kr.co.kfs.asset.oms.domain.sys.mapper.Sys08CodeKindMapper">
```

### 2. resultMap type 변경

```xml
<!-- GWT -->
<resultMap type="myOms.client.vi.sys.model.Sys08_CodeKindModel" ...>

<!-- Spring Boot -->
<resultMap type="kr.co.kfs.asset.oms.domain.sys.dto.CodeKindDto" ...>
```

### 3. PostgreSQL 전용 SQL 단순화

GWT는 Oracle/Tibero/MSSQL 다중 DB 호환용 공통 fragment를 사용:
```xml
<!-- GWT: DB 호환용 공통 fragment -->
<include refid="common.rownumLimit1"/>

<!-- Spring Boot: PostgreSQL 전용으로 단순화 -->
LIMIT 1
```

### 4. GWT 메서드 → REST 엔드포인트

| GWT 메서드 | HTTP Method | URL |
|-----------|------------|-----|
| `selectByAll()` | GET | `/api/v1/sys/code-kinds` |
| `selectByKindName(kindName, sysYn)` | GET | `/api/v1/sys/code-kinds?kindName=&sysYn=` |
| `selectByKindCode(kindCode)` | GET | `/api/v1/sys/code-kinds/by-code/{kindCode}` |
| `update()` — insert | POST | `/api/v1/sys/code-kinds` |
| `update()` — update | PUT | `/api/v1/sys/code-kinds/{id}` |
| `delete()` | DELETE | `/api/v1/sys/code-kinds/{id}` |

### 5. GWT UpdateDataModel → 명시적 MyBatis insert/update

GWT의 `UpdateDataModel`은 DB 컬럼 메타데이터를 런타임에 조회해 동적 SQL을 생성하는 복잡한 유틸리티.  
Spring Boot에서는 XML에 명시적으로 `<insert>`, `<update>`, `<delete>` 작성.

```xml
<!-- Spring Boot XML에 추가 -->
<insert id="insert" useGeneratedKeys="true" keyProperty="codeKindId">
    INSERT INTO sys08_code_kind (sys08_kind_cd, sys08_kind_nm, sys08_sys_yn, sys08_note)
    VALUES (#{kindCode}, #{kindName}, #{sysYn}, #{note})
</insert>

<update id="update">
    UPDATE sys08_code_kind
    SET sys08_kind_nm = #{kindName},
        sys08_sys_yn  = #{sysYn},
        sys08_note    = #{note}
    WHERE sys08_code_kind_id = #{codeKindId}
</update>

<delete id="delete">
    DELETE FROM sys08_code_kind
    WHERE sys08_code_kind_id = #{codeKindId}
</delete>
```

### 6. GWT ServiceRequest → Spring @RequestParam / @RequestBody

```java
// GWT
String kindName = request.getStringParam("kindName");

// Spring Boot
@GetMapping
public List<CodeKindDto> search(
    @RequestParam(required = false) String kindName,
    @RequestParam(required = false, defaultValue = "false") String sysYn) { ... }
```

---

## 빌드 설정 (XML을 Java 소스 폴더에 두는 경우)

`build.gradle`에 추가 (기 적용):
```groovy
sourceSets {
    main {
        resources {
            srcDirs += 'src/main/java'
            includes += '**/*.xml'
        }
    }
}
```

`application.properties`의 mapper 경로 (기 적용):
```properties
mybatis.mapper-locations=classpath:mapper/**/*.xml,classpath:kr/co/kfs/asset/oms/domain/**/mapper/*.xml
```

---

## 변환 우선순위 (Presentation 기준)

| 순서 | GWT 도메인 | 변환 대상 | 이유 |
|-----|-----------|---------|------|
| 1 | `sys` | Login, Menu, Role, Code, CodeKind | 기반 기능 |
| 2 | `org` | OrgInfo, Code | 조직도 |
| 3 | `emp` | Person | 사원 기본 |
| 4 | `mst/tgt` | Fund, Sec, Model | 업무 도메인 |

---

## 변환 예시: Sys08_CodeKind (코드종류)

### GWT 원본 파일
- `myOms/server/sys/Sys08_CodeKind.java` — 70 lines
- `myOms/server/sys/mapper/sys08_code_kind.xml`

### Spring Boot 변환 파일
- `domain/sys/dto/CodeKindDto.java`
- `domain/sys/mapper/CodeKindMapper.java`
- `domain/sys/mapper/CodeKindMapper.xml`
- `domain/sys/service/interfaces/CodeKindService.java`
- `domain/sys/service/CodeKindServiceImpl.java`
- `domain/sys/CodeKindController.java`
