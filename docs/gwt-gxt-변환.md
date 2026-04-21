# GWT/GXT → Spring Boot + React 변환 가이드

## 배경 설명 및 1단계 목표
본 프로젝트는 springboot + react로 구성되어 있다. 
OMS(Order Management System)을 구축하는데 목적이 있다.
원래 한국펀드서비스는 AssetERP라는 자산운용사를 위한 SaaS 제품이 있는데, 그것은 GWT+GXT로 작성되어 있다.
그래서 최초에 OMS를 GWT+GXT로 개발하기 위해서 AssetERP이 로그인과정과 Company와 Role에 따른 메뉴체계를 가져와서 구현하고자 기획했다.
그러나 GWT+GXT가 너무 오래된 기술스펙이고 추후 발전적인 전망을 고려해서 Springboot React로 개발을 하고자 한다.

asis/ 폴더는 GWT+GXT로 만들어서 일부 진도를 나가서 로그인과정과 메뉴쳬계가 동작하며 OMS 기초테이블 몇개가 시범적으로 CRUD되고 있다.
1단계로 asis/의 소스를 springboot react로 변환하고자 한다.

---
## 주요 변경 사항.

1. 기존 인증은 Session에 로그인 사용자를 보관했으나 jwt로 변경하고자 함.
2. GWT RPC 통신을 Restful 방식으로 변환
3. GXT베이스로 작성된 UI를 react + tailwindcss + shadcn으로 변경
4. 기존 자바 8 -> 21 버젼으로 변경

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

```java
		ServiceRequest dbRequest = new ServiceRequest("sys.Sys02_User.checkUserName");
		ServiceCall dbService = new ServiceCall();
		dbService.execute(dbRequest, new InterfaceServiceCall() {
			@Override
			public void getServiceResult(ServiceResult result) {
				TempData.setUserName(result.getMessage());
			}
		});
```
### ** 변환 규칙**

 - asis 소스는 server와 client로 나누어져 있음
    - server는 마치 controller처럼 java에 의해서 처리되면 client의 요청에 의해서 mybatis로 db 동작을 함.
    - cleint은 gwt/gxt로 화면을 그리고 parameter로 서버의 method를 호출하고 리턴되는 값으로 화면을 갱신함.
 - 위 소스를 보면 sys.Sys02_User.checkUserName 을 호출하고 그 결과를 ServiceResult로 받는다.
 - 이를 위해서  sys.Sys02_User.checkUserName -> **sys** 도메인의 **Sys02UserController**를 작성한다.
 - Sys02UserController안에 method명 **checkUserName**을 작성한다
 - 기존 method를 충실하게 따라서 작성해야한다.
 - mybatis xml은 대부분 그대로 사용한다.

### 기존 ASIS의 특징

- id 값을 getSeq 라는 함수를 통해서 키값을 얻음.
- 로그인 체계
    - 각 회사마다 subdomain이 있음 예를 들면 kova라는 회사는 접속시 kova.localhost/OMS.html과 같이 접속함.
    - url에서 kova를 취득 접속한 회사 도메인 명으로 회사 id를 구함.
    - 'admin'이라는 가상의 슈퍼관리자 회사를 가정하고 있음. 즉 한국펀드서비스의 회사가 admin임.
    - 'admin'회사로 로그인한 admin id가 새로 가입한 회사를 등록하고 그 회사의 admin user를 생성함.
    - 즉 admin회사, admin/1111로 접속, kova라는 새로운 회사를 등록하고 그 회사가 사용가능한 메뉴를 배정해 줌.
    - kova라는 회사의 admin 계정 admin_kova/1111을 만들어 주면
    - kova라는 회사로 즉 kova.localhost 로 접속 admin_Kova/1111로 로그인 한 후 그 회사의 사용자들과 role과 role에 따른 메뉴를 배정함.
- **이 로그인 과정** 까지 그대로 순조롭게 변환되어서 수행되어야함.

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

## 테스트 방법

1. admin.localhost로 접속
2. admin/1111로 로그인
3. company kova1추가 (kova 이미 있음)\
4. kova1에 OMS메뉴 사용 권한 부여
5. kova1에 kova1_admin/1111 관리자 사원 추가.
6. kova1_admin.localhost로 접속
7. kova1에 사원 1/kalpa123! 추가, kova1에 사원 2/kalpa123! 추가
8. kova1의 사원 1,2에 OMS 권한 부여 및 메뉴할당
9. kova1.localhost접속 1/kalpa123!로 접속, 성공하고 메뉴가 나와야함.


## DB 정보

@파일 '.env.development' 참조.

## 메뉴체계

1. 메뉴는 3단계로 되어 있음.
2. client/app/MainFrame 참조
    - 1단계는 아이콘으로 sidebar에서 표현
    - 2,3단계는 아코디언형태로 sidebar에서 표현
3. 3단게 메뉴체계를 react로 표현한 것이 있음
    -/home/kdy987/work/kiwi8/frontend/src/layout 을 참조
    - 위 layout을 그대로 따라가도 좋음.

/home/kdy987/workspace26/logs/OMS.log 는 asis에서의 동작을 나타내는 log임
1. admin.localhost로 접속, admin subDomain으로 admin/1111 로그인
2. 첫화면에  tabPanel.add(new Sys01_Tab_Company(), "시스템정보 관리"); 까지 수행하고 
3. 로그아웃한 동작의 login.

