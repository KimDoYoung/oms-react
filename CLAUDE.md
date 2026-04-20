# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

OMS(주문관리시스템) — Spring Boot 백엔드 + React 프론트엔드 모노레포.

- **Backend**: `backend/` — Spring Boot 3.4.x, Java 21, MyBatis, PostgreSQL, Redis, JWT
- **Frontend**: `frontend/` — React 19, Vite 6.x, TypeScript 5.7, Tailwind 4.1, flexlayout-react 탭 UI
- **Base package**: `kr.co.kfs.asset.oms`
- **Context path**: `/oms` (port 8686)
- **Frontend dev**: port 5174 (proxy `/oms` → `http://localhost:8686`)

## 실행 명령어

### 관리 스크립트 (권장)
```bash
./bm.sh run        # 백엔드 개발 서버 실행
./bm.sh build      # 전체 빌드
./bm.sh war        # WAR 패키징
./bm.sh compile    # 컴파일만
./bm.sh clean      # 빌드 캐시 삭제

./fm.sh dev        # 프론트엔드 개발 서버 실행
./fm.sh build      # 프로덕션 빌드
./fm.sh install    # npm 패키지 설치
./fm.sh lint       # ESLint 검사
```

`OMS_MODE` 환경변수가 없으면 `.env.*` 파일 목록을 보여주고 선택하게 함.

### Gradle 직접 실행
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=development'
./gradlew compileJava
./gradlew test
./gradlew bootWar
```

### npm 직접 실행
```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## 환경 설정

`.env.development` (`.env.example` 참조):
```
OMS_MODE=development
OMS_DB_URL=jdbc:postgresql://jskn.iptime.org:5432/cms
OMS_DB_USERNAME=...
OMS_DB_PASSWORD=...
OMS_REDIS_HOST=jskn.iptime.org
OMS_REDIS_PORT=6379
OMS_REDIS_PASSWORD=...
OMS_JWT_SECRET=...   # 최소 32자 이상
```

## 아키텍처

### Backend 레이어 구조

```
common/config/        ← SecurityConfig, RedisConfig, GlobalExceptionHandler, SwaggerConfig, SpaFallbackController
common/security/      ← JwtUtil, JwtFilter, JwtAuthenticationEntryPoint, JwtAccessDeniedHandler
common/dto/           ← PageRequestDto, PageResponseDto
domain/{feature}/     ← Controller, dto/, entity/, service/
  └─ service/         ← {Feature}Service(interface), {Feature}ServiceImpl, {Feature}Mapper(@Mapper)
resources/mapper/     ← MyBatis XML (classpath:mapper/**/*.xml)
```

**JWT 흐름**: `JwtFilter` → Authorization 헤더에서 Bearer 토큰 추출 → Redis 블랙리스트 검사 → SecurityContext 설정  
**Redis prefix**: `oms_refresh_token:`, `oms_blacklist:`  
**에러 응답**: `GlobalExceptionHandler` → RFC 7807 `ProblemDetail` 형식

### Frontend 아키텍처

**라우팅 없음** — `flexlayout-react` 기반 탭 UI. 화면 번호(screen_no)로 탭을 열고 `registry.tsx`에서 컴포넌트 매핑.

```
src/
  layout/           ← MainLayout, TopBar, Sidebar, Workspace, StatusBar, registry.tsx
  pages/            ← PlaceholderPage + 실제 업무 화면
  services/api.ts   ← axios 인스턴스 (baseURL: /oms), Bearer 토큰 인터셉터, 401 자동 refresh
  services/menuService.ts ← GET /oms/api/v1/menus/ → 사이드바 메뉴 트리
  store/authStore   ← isLoggedIn, username, accessToken, refreshToken (persist: 'oms-auth')
  store/layoutStore ← flexlayout Model 상태 (localStorage: 'oms-layout', 'oms-saved-layout')
  store/statusStore ← 하단 StatusBar 메시지
```

**인증 흐름**: 
1. `LoginPage` → `POST /oms/auth/login` → `{ accessToken, refreshToken, userNm }` 수신
2. `authStore.login()` → Zustand persist로 localStorage 저장
3. `api.ts` request interceptor → 모든 요청에 `Authorization: Bearer {accessToken}` 자동 추가
4. 401 응답 → `POST /oms/auth/refresh` 시도 → 실패 시 `expireSession()` → LoginPage 오버레이 표시

**세션 만료**: `isLoggedIn=false` but `username` 유지 → `App.tsx`가 MainLayout 위에 반투명 LoginPage 모달 표시

### API 엔드포인트

| 메서드 | URL | 인증 | 설명 |
|--------|-----|------|------|
| POST | `/oms/auth/login` | 불필요 | 로그인 (JWT 반환) |
| POST | `/oms/auth/logout` | Bearer | 로그아웃 (토큰 블랙리스트) |
| POST | `/oms/auth/refresh` | 불필요 | Access 토큰 갱신 |
| GET  | `/oms/auth/health` | 불필요 | 헬스체크 |
| GET  | `/oms/api/v1/menus/` | Bearer | 메뉴 트리 (Sidebar용) |

### 새 도메인 추가 패턴

**Backend**:
1. `domain/{name}/` 폴더 생성
2. `entity/`, `dto/`, `service/` 하위 구조 생성
3. `{Name}Mapper.java` (`@Mapper` 인터페이스)
4. `resources/mapper/{name}/{Name}Mapper.xml` 작성
5. `SecurityConfig.java`에 공개 엔드포인트 추가 (필요시)

**Frontend**:
1. `pages/{Name}Page.tsx` 생성
2. `layout/registry.tsx`에 screen_no → 컴포넌트 매핑 추가
3. `services/{name}Service.ts` — api.ts의 인스턴스 사용

### 배포

프론트엔드 빌드 결과를 백엔드 static 폴더로 복사 후 WAR 생성 → jskn.iptime.org Tomcat 배포.  
`SpaFallbackController`가 `.` 없는 경로를 `index.html`로 포워딩하여 SPA 라우팅 지원.
