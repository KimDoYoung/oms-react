#!/bin/bash

# =============================================================================
# OMS Database Utility Script
# =============================================================================

VERSION="0.0.1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- .env.{OMS_MODE} 파일 자동 로드 ---
OMS_MODE="${OMS_MODE:-development}"
ENV_FILE="$SCRIPT_DIR/.env.${OMS_MODE}"
if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
fi

# --- OMS_DB_URL (jdbc:postgresql://host:port/dbname) 파싱 ---
if [[ -n "${OMS_DB_URL:-}" ]]; then
    _url="${OMS_DB_URL#jdbc:postgresql://}"   # host:port/dbname
    _hostport="${_url%%/*}"
    DB_HOST="${_hostport%%:*}"
    DB_PORT="${_hostport##*:}"
    DB_NAME="${_url##*/}"
else
    DB_HOST="${OMS_DB_HOST:-}"
    DB_PORT="${OMS_DB_PORT:-5432}"
    DB_NAME="omsdb"
fi

DB_USER="${OMS_DB_USERNAME:-}"
DB_PASSWORD="${OMS_DB_PASSWORD:-}"

# 환경변수 체크
MISSING_VARS=()
[[ -z "$DB_HOST" ]] && MISSING_VARS+=("OMS_DB_HOST (or OMS_DB_URL)")
[[ -z "$DB_USER" ]] && MISSING_VARS+=("OMS_DB_USERNAME")
[[ -z "$DB_PASSWORD" ]] && MISSING_VARS+=("OMS_DB_PASSWORD")

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo -e "\033[0;31m[ERROR] 필수 환경변수 누락: ${MISSING_VARS[*]}\033[0m"
    echo -e "\033[0;33m.env.${OMS_MODE} 파일을 확인하세요.\033[0m"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
PGDUMP_CMD="pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER"

# 백업 저장 디렉토리
BACKUP_DIR="$HOME/oms-data/backup"

# --- 색상 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# =============================================================================
# 0) Connection Test
# =============================================================================
do_conn_test() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Connection Test                 │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${YELLOW}Host    :${NC} $DB_HOST:$DB_PORT"
    echo -e "  ${YELLOW}Database:${NC} $DB_NAME"
    echo -e "  ${YELLOW}User    :${NC} $DB_USER"
    echo ""
    echo -ne "  ${CYAN}접속 테스트 중...${NC}"

    local result
    result=$($PSQL_CMD -c "SELECT version();" 2>&1)
    local rc=$?

    echo -ne "\r                        \r"

    if [[ $rc -eq 0 ]]; then
        local ver
        ver=$(echo "$result" | grep -o 'PostgreSQL [0-9.]*')
        echo -e "  ${GREEN}[OK] 접속 성공!${NC}"
        echo -e "  ${YELLOW}Server  :${NC} ${ver}"
    else
        echo -e "  ${RED}[FAIL] 접속 실패${NC}"
        echo -e "  ${RED}${result}${NC}"
    fi
    echo ""
}

# =============================================================================
# 1) DB Full Backup
# =============================================================================
do_backup() {
    mkdir -p "$BACKUP_DIR"

    local timestamp
    timestamp=$(date +"%Y%m%d-%H%M%S")
    local backup_file="${BACKUP_DIR}/omsdb-backup-${timestamp}.tar.gz"

    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         DB Full Backup                  │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${YELLOW}Host    :${NC} $DB_HOST:$DB_PORT"
    echo -e "  ${YELLOW}Database:${NC} $DB_NAME"
    echo -e "  ${YELLOW}Output  :${NC} $backup_file"
    echo ""
    echo -e "  ${CYAN}백업 진행 중...${NC}"

    if $PGDUMP_CMD -d "$DB_NAME" --no-password -Ft 2>/dev/null | gzip > "$backup_file"; then
        local size
        size=$(du -sh "$backup_file" 2>/dev/null | cut -f1)
        echo -e "  ${GREEN}[OK] 백업 완료!${NC}"
        echo -e "  ${YELLOW}파일 크기 :${NC} ${size}"
        echo -e "  ${YELLOW}저장 경로 :${NC} $backup_file"
    else
        echo -e "  ${RED}[ERROR] 백업 실패. DB 접속 정보 및 pg_dump 설치 여부를 확인하세요.${NC}"
        return 1
    fi
    echo ""
}

# =============================================================================
# 2) Table List
# =============================================================================
do_table_list() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Table List  [$DB_NAME]           │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo "| Schema | Name | Type | Owner | Size | Description |"
    echo "| :--- | :--- | :--- | :--- | :--- | :--- |"
    $PSQL_CMD -t -A -F '|' -c "\dt+" | sed 's/^/| /' | sed 's/$/ |/'
    echo ""
}

# =============================================================================
# 3) Table Desc
# =============================================================================
do_desc() {
    local table_name="$1"

    if [ -z "$table_name" ]; then
        echo ""
        echo -ne "  ${YELLOW}테이블명을 입력하세요> ${NC}"
        read -r table_name
        if [ -z "$table_name" ]; then
            echo -e "  ${RED}[ERROR] 테이블명이 입력되지 않았습니다.${NC}"
            return 1
        fi
    fi

    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│  Table Structure: ${BOLD}$table_name${NC}${CYAN}          │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""

    echo -e "  ${YELLOW}#### Columns & Comments${NC}"
    echo ""
    local QUERY="SELECT
             cols.column_name,
             cols.data_type,
             cols.is_nullable,
             (SELECT pg_catalog.col_description(c.oid, cols.ordinal_position::int)
              FROM pg_catalog.pg_class c
              WHERE c.relname = cols.table_name) as description
           FROM information_schema.columns cols
           WHERE cols.table_name = '$table_name'
           ORDER BY cols.ordinal_position;"

    echo "| Column | Type | Nullable | Description |"
    echo "| :--- | :--- | :--- | :--- |"
    $PSQL_CMD -t -A -F '|' -c "$QUERY" | sed 's/^/| /' | sed 's/$/ |/'

    echo ""
    echo -e "  ${YELLOW}#### Table Definition Summary${NC}"
    echo ""
    echo '```sql'
    $PSQL_CMD -c "\d $table_name"
    echo '```'
    echo ""
}

# =============================================================================
# 4) Object List (서브메뉴)
# =============================================================================
do_sequence_list() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Sequence List                   │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    local QUERY="SELECT
             s.sequence_name,
             s.data_type,
             s.start_value,
             s.increment_by,
             s.last_value
           FROM information_schema.sequences s
           LEFT JOIN pg_sequences ps ON ps.sequencename = s.sequence_name
           ORDER BY s.sequence_name;"
    echo "| Sequence Name | Type | Start | Increment | Last Value |"
    echo "| :--- | :--- | :--- | :--- | :--- |"
    $PSQL_CMD -t -A -F '|' -c "
        SELECT
            sequencename,
            data_type,
            start_value,
            increment_by,
            COALESCE(last_value::text, '(미사용)')
        FROM pg_sequences
        ORDER BY sequencename;" | sed 's/^/| /' | sed 's/$/ |/'
    echo ""
}

do_function_list() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Function List                   │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo "| Schema | Function Name | Return Type | Language |"
    echo "| :--- | :--- | :--- | :--- |"
    $PSQL_CMD -t -A -F '|' -c "
        SELECT
            n.nspname AS schema,
            p.proname AS function_name,
            pg_get_function_result(p.oid) AS return_type,
            l.lanname AS language
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
          AND p.prokind = 'f'
        ORDER BY n.nspname, p.proname;" | sed 's/^/| /' | sed 's/$/ |/'
    echo ""
}

do_procedure_list() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Procedure List                  │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo "| Schema | Procedure Name | Language |"
    echo "| :--- | :--- | :--- |"
    $PSQL_CMD -t -A -F '|' -c "
        SELECT
            n.nspname AS schema,
            p.proname AS procedure_name,
            l.lanname AS language
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
          AND p.prokind = 'p'
        ORDER BY n.nspname, p.proname;" | sed 's/^/| /' | sed 's/$/ |/'
    echo ""
}

show_object_menu() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Object List                     │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Sequence List"
    echo -e "  ${GREEN}2)${NC} Function List"
    echo -e "  ${GREEN}3)${NC} Procedure List"
    echo ""
    echo -e "  ${GREEN}b)${NC} 뒤로"
    echo ""
    read -rp "  선택> " obj_choice

    case "$obj_choice" in
        1|sequence)  do_sequence_list ;;
        2|function)  do_function_list ;;
        3|procedure) do_procedure_list ;;
        b|B)         return ;;
        *)           echo -e "${RED}  잘못된 선택입니다.${NC}" ;;
    esac
}

# =============================================================================
# 5) Make Report
# =============================================================================
do_report() {
    local report_dir="$HOME/oms-data"
    mkdir -p "$report_dir"

    local datestamp
    datestamp=$(date +"%Y%m%d-%H%M%S")
    local timestamp_full
    timestamp_full=$(date +"%Y-%m-%d %H:%M:%S")
    local report_file="${report_dir}/omsdb-report-${datestamp}.md"

    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│         Make Report                     │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${YELLOW}Output  :${NC} $report_file"
    echo -e "  ${CYAN}리포트 생성 중...${NC}"

    {
        echo "# OMS Database Report"
        echo ""
        echo "| 항목 | 값 |"
        echo "| :--- | :--- |"
        echo "| 생성일시 | ${timestamp_full} |"
        echo "| Host | ${DB_HOST}:${DB_PORT} |"
        echo "| Database | ${DB_NAME} |"
        echo "| User | ${DB_USER} |"
        echo ""

        # --- Connection Test ---
        echo "---"
        echo ""
        echo "## Connection Test"
        echo ""
        local conn_result
        conn_result=$($PSQL_CMD -c "SELECT version();" 2>&1)
        if [[ $? -eq 0 ]]; then
            local ver
            ver=$(echo "$conn_result" | grep -o 'PostgreSQL [0-9.]*')
            echo "- 상태: **OK**"
            echo "- Server: ${ver}"
        else
            echo "- 상태: **FAIL**"
            echo "\`\`\`"
            echo "$conn_result"
            echo "\`\`\`"
        fi
        echo ""

        # --- Table List ---
        echo "---"
        echo ""
        echo "## Table List"
        echo ""
        echo "| Schema | Name | Type | Owner | Size | Description |"
        echo "| :--- | :--- | :--- | :--- | :--- | :--- |"
        $PSQL_CMD -t -A -F '|' -c "\dt+" 2>/dev/null | sed 's/^/| /' | sed 's/$/ |/'
        echo ""

        # --- Table Row Counts ---
        echo "---"
        echo ""
        echo "## Table Row Counts"
        echo ""
        echo "| Table Name | Row Count |"
        echo "| :--- | ---: |"
        $PSQL_CMD -t -A -F '|' -c "
            SELECT
                relname AS table_name,
                n_live_tup AS row_count
            FROM pg_stat_user_tables
            ORDER BY relname;" 2>/dev/null | sed 's/^/| /' | sed 's/$/ |/'
        echo ""

        # --- Sequence List ---
        echo "---"
        echo ""
        echo "## Sequence List"
        echo ""
        echo "| Sequence Name | Type | Start | Increment | Last Value |"
        echo "| :--- | :--- | :--- | :--- | :--- |"
        $PSQL_CMD -t -A -F '|' -c "
            SELECT
                sequencename,
                data_type,
                start_value,
                increment_by,
                COALESCE(last_value::text, '(미사용)')
            FROM pg_sequences
            ORDER BY sequencename;" 2>/dev/null | sed 's/^/| /' | sed 's/$/ |/'
        echo ""

        # --- Function List ---
        echo "---"
        echo ""
        echo "## Function List"
        echo ""
        echo "| Schema | Function Name | Return Type | Language |"
        echo "| :--- | :--- | :--- | :--- |"
        $PSQL_CMD -t -A -F '|' -c "
            SELECT
                n.nspname AS schema,
                p.proname AS function_name,
                pg_get_function_result(p.oid) AS return_type,
                l.lanname AS language
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            JOIN pg_language l ON l.oid = p.prolang
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
              AND p.prokind = 'f'
            ORDER BY n.nspname, p.proname;" 2>/dev/null | sed 's/^/| /' | sed 's/$/ |/'
        echo ""

        # --- Procedure List ---
        echo "---"
        echo ""
        echo "## Procedure List"
        echo ""
        echo "| Schema | Procedure Name | Language |"
        echo "| :--- | :--- | :--- |"
        $PSQL_CMD -t -A -F '|' -c "
            SELECT
                n.nspname AS schema,
                p.proname AS procedure_name,
                l.lanname AS language
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            JOIN pg_language l ON l.oid = p.prolang
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
              AND p.prokind = 'p'
            ORDER BY n.nspname, p.proname;" 2>/dev/null | sed 's/^/| /' | sed 's/$/ |/'
        echo ""
        echo "---"
        echo ""
        echo "_Generated by omsdb.sh v${VERSION}_"

    } > "$report_file"

    local size
    size=$(du -sh "$report_file" 2>/dev/null | cut -f1)
    echo -e "  ${GREEN}[OK] 리포트 생성 완료!${NC}"
    echo -e "  ${YELLOW}파일 크기 :${NC} ${size}"
    echo -e "  ${YELLOW}저장 경로 :${NC} $report_file"
    echo ""
}

# =============================================================================
# Help
# =============================================================================
do_help() {
    echo ""
    echo -e "${CYAN}=== OMS Database Utility ===${NC}"
    echo -e "  Version : $VERSION"
    echo ""
    echo -e "  사용법: ${GREEN}./omsdb.sh [command] [args]${NC}"
    echo -e "  인자 없이 실행하면 메뉴가 표시됩니다."
    echo ""
    echo -e "  ${GREEN}conn-test${NC}           DB 접속 테스트"
    echo -e "  ${GREEN}backup${NC}              DB 전체 백업 (pg_dump → ~/oms-data/backup/)"
    echo -e "  ${GREEN}table-list${NC}          테이블 목록 조회"
    echo -e "  ${GREEN}desc <tablename>${NC}    테이블 구조 상세 조회"
    echo -e "  ${GREEN}seq-list${NC}            시퀀스 목록 조회"
    echo -e "  ${GREEN}func-list${NC}           함수 목록 조회"
    echo -e "  ${GREEN}proc-list${NC}           프로시저 목록 조회"
    echo -e "  ${GREEN}report${NC}              DB 현황 마크다운 리포트 생성 (~/oms-data/omsdb-report-YYYYMMDD-HHmmss.md)"
    echo -e "  ${GREEN}help${NC}                이 도움말"
    echo ""
    echo -e "  ${YELLOW}DB 접속 정보${NC}"
    echo -e "    Host  : $DB_HOST:$DB_PORT"
    echo -e "    DB    : $DB_NAME"
    echo -e "    User  : $DB_USER"
    echo ""
}

# =============================================================================
# 메뉴
# =============================================================================
show_menu() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     OMS Database Utility  v${VERSION}         ║${NC}"
    echo -e "${CYAN}║     DB: ${BOLD}${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}${CYAN}   ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${GREEN}0)${NC} Connection Test"
    echo -e "  ${GREEN}1)${NC} DB Full Backup"
    echo -e "  ${GREEN}2)${NC} Table List"
    echo -e "  ${GREEN}3)${NC} Table Desc"
    echo -e "  ${GREEN}4)${NC} Object List  ${YELLOW}(Sequence / Function / Procedure)${NC}"
    echo -e "  ${GREEN}5)${NC} Make Report  ${YELLOW}(~/oms-data/omsdb-report-YYYYMMDD-HHmmss.md)${NC}"
    echo ""
    echo -e "  ${GREEN}h)${NC} Help     ${GREEN}q)${NC} 종료"
    echo ""
    read -rp "  선택> " choice

    case "$choice" in
        0|conn-test)   do_conn_test ;;
        1|backup)      do_backup ;;
        2|table-list)  do_table_list ;;
        3|desc)        do_desc ;;
        4|object)      show_object_menu ;;
        5|report)      do_report ;;
        h|help)        do_help ;;
        q|Q)           exit 0 ;;
        *)             echo -e "${RED}  잘못된 선택입니다.${NC}" ;;
    esac
}

# =============================================================================
# MAIN
# =============================================================================
COMMAND="${1:-}"
ARG2="${2:-}"

if [[ -n "$COMMAND" ]]; then
    case "$COMMAND" in
        conn-test)              do_conn_test ;;
        backup)                 do_backup ;;
        table-list)             do_table_list ;;
        desc)                   do_desc "$ARG2" ;;
        seq-list)               do_sequence_list ;;
        func-list)              do_function_list ;;
        proc-list)              do_procedure_list ;;
        report)                 do_report ;;
        help|-h|--help)         do_help ;;
        *)
            echo -e "${RED}알 수 없는 명령: $COMMAND${NC}"
            do_help
            exit 1
            ;;
    esac
else
    show_menu
fi
