---
name: oms-react 프로젝트 초기 셋팅
description: oms-react 프로젝트의 기술스택, 포트, 패키지명 등 핵심 설정 정보
type: project
---

pcms-react(backend)와 kiwi8(frontend) 구조를 참조하여 oms-react 프로젝트를 셋팅했다.

**Why:** 기존 두 프로젝트의 패턴을 재활용하여 OMS(주문관리시스템) 신규 프로젝트 구축

**How to apply:** 신규 도메인 추가 시 아래 패턴 참조

## 핵심 설정
- Backend base package: `kr.co.kfs.asset.oms`
- Backend port: 8686, context path: `/oms`
- Frontend port: 5174, proxy: `/oms` → `http://localhost:8686`
- DB: jskn.iptime.org:5432, db=cms
- Redis: jskn.iptime.org:6379, password=kalpa987!
- env 파일명 패턴: `.env.{OMS_MODE}` (예: `.env.development`)

## 인증 방식
kiwi8(쿠키)이 아닌 Bearer Token 방식 사용:
- 프론트: authStore에 accessToken/refreshToken 저장 (localStorage persist, key: 'oms-auth')
- 요청 인터셉터: Authorization: Bearer {accessToken} 자동 추가
- 401 시 /oms/auth/refresh 호출 후 재시도

## Redis prefix
- `oms_refresh_token:` — refresh token 저장
- `oms_blacklist:` — 로그아웃된 access token
