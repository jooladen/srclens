#!/bin/bash

# ============================================================
# srclens 자동 배포 스크립트
# 환경: Windows 10 + Git Bash
#
# 사용법:
#   bash deploy.sh "커밋 메시지"
#   bash deploy.sh              (메시지 없으면 자동 생성)
#
# 최초 1회: vercel link 먼저 실행할 것!
# ============================================================

# ── 설정 (여기만 바꾸면 됨) ──────────────────────────────────
NTFY_TOPIC="srclens-deploy"   # ntfy 앱에서 구독한 채널 이름
# ──────────────────────────────────────────────────────────────

# 커밋 메시지 (인자 없으면 날짜+시간 자동 생성)
if [ -z "$1" ]; then
  COMMIT_MSG="auto deploy $(date '+%Y-%m-%d %H:%M')"
else
  COMMIT_MSG="$1"
fi

# ntfy 알림 보내는 함수
notify() {
  local title="$1"
  local msg="$2"
  local tags="${3:-bell}"
  printf '%s' "$msg" | curl -s \
    -H "Title: $title" \
    -H "Tags: $tags" \
    -H "Content-Type: text/plain; charset=utf-8" \
    --data-binary @- \
    "https://ntfy.sh/$NTFY_TOPIC" > /dev/null 2>&1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  srclens 자동 배포 시작"
echo "  커밋: $COMMIT_MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── STEP 1: 변경사항 확인 ────────────────────────────────────
echo ""
echo "[1/4] 변경된 파일 확인 중..."
CHANGED=$(git status --porcelain)

if [ -z "$CHANGED" ]; then
  echo "  변경사항 없음. 배포만 진행합니다."
  SKIP_GIT=true
  CHANGED_COUNT=0
  FILES_PREVIEW="(no changes)"
else
  CHANGED_COUNT=$(echo "$CHANGED" | grep -c .)
  FILES_PREVIEW=$(echo "$CHANGED" | awk '{print $NF}' | sed 's|.*/||' | head -3 | tr '\n' ', ' | sed 's/, $//')
  if [ "$CHANGED_COUNT" -gt 3 ]; then
    FILES_PREVIEW="$FILES_PREVIEW (+$((CHANGED_COUNT - 3)) more)"
  fi
  echo "  변경된 파일:"
  git status --short | sed 's/^/    /'
  SKIP_GIT=false
fi

# ── STEP 2: Git push ─────────────────────────────────────────
if [ "$SKIP_GIT" = false ]; then
  echo ""
  echo "[2/4] GitHub에 올리는 중..."

  git add .
  git commit -m "$COMMIT_MSG"

  if git push; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo "  ✅ GitHub push 완료!"
    PUSH_MSG="$COMMIT_MSG
---
Files : $CHANGED_COUNT changed ($FILES_PREVIEW)
Hash  : $COMMIT_HASH"
    notify "srclens: Pushed ($CHANGED_COUNT files)" "$PUSH_MSG" "white_check_mark"
  else
    echo "  ❌ Push 실패!"
    notify "srclens: Push failed!" "Commit: $COMMIT_MSG" "x"
    exit 1
  fi
else
  echo ""
  echo "[2/4] 변경사항 없어서 git push 건너뜀"
fi

# ── STEP 3: Vercel 배포 ──────────────────────────────────────
echo ""
echo "[3/4] Vercel 배포 중... (1~2분 소요)"
echo "  (이제 자리 비워도 됩니다!)"
echo ""

# vercel link 됐는지 확인
if [ ! -d ".vercel" ]; then
  echo "  ⚠️  Vercel 프로젝트 연결이 필요합니다!"
  echo "  아래 명령어 실행 후 다시 시도하세요:"
  echo ""
  echo "    vercel link"
  echo ""
  notify "srclens: Vercel not linked!" "Run: vercel link" "warning"
  exit 1
fi

VERCEL_LOG=$(mktemp)
DEPLOY_START=$(date +%s)
vercel --prod --yes > "$VERCEL_LOG" 2>&1
VERCEL_STATUS=$?
DEPLOY_END=$(date +%s)
ELAPSED=$((DEPLOY_END - DEPLOY_START))

# ── STEP 4: 결과 알림 ────────────────────────────────────────
echo "[4/4] 결과 확인 중..."

if [ $VERCEL_STATUS -eq 0 ]; then
  # 배포 URL 추출
  DEPLOY_URL=$(grep -E "https://.*\.vercel\.app" "$VERCEL_LOG" | grep -v "Inspect" | tail -1 | tr -d '[:space:]')

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🎉 배포 완료!"
  if [ -n "$DEPLOY_URL" ]; then
    echo "  🌐 주소: $DEPLOY_URL"
  fi

  DEPLOY_MSG="$COMMIT_MSG
---
Files : $CHANGED_COUNT changed ($FILES_PREVIEW)
Hash  : ${COMMIT_HASH:-(no commit)}
URL   : ${DEPLOY_URL:-https://srclens.vercel.app}
Time  : ${ELAPSED}s"
  notify "srclens: Deployed in ${ELAPSED}s" "$DEPLOY_MSG" "rocket"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ❌ Vercel 배포 실패!"
  echo ""
  echo "  에러 내용:"
  cat "$VERCEL_LOG" | sed 's/^/    /'
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ERROR_PREVIEW=$(tail -3 "$VERCEL_LOG" | tr '\n' ' ')
  notify "srclens: Deploy failed!" "Commit: $COMMIT_MSG
Error : $ERROR_PREVIEW" "x"
fi

rm -f "$VERCEL_LOG"
echo ""
