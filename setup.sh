#!/bin/bash

# ============================================================
# 새 프로젝트 초기 셋업 자동화
# 환경: Windows 10 + Git Bash
#
# 사용법:
#   bash setup.sh
#   (새 프로젝트의 빈 폴더에서 실행)
#
# 필요 조건: git, node/npx, vercel CLI, curl 설치됨
# ============================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  새 프로젝트 셋업 자동화"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 정보 수집 ─────────────────────────────────────────────────
echo ""
read -p "프로젝트 이름 (영문, 예: myapp): " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
  echo "❌ 프로젝트 이름은 필수입니다."
  exit 1
fi

read -p "ntfy 채널 이름 [기본값: ${PROJECT_NAME}-deploy]: " NTFY_TOPIC
if [ -z "$NTFY_TOPIC" ]; then
  NTFY_TOPIC="${PROJECT_NAME}-deploy"
fi

read -p "GitHub 저장소 URL (비워두면 나중에 수동 연결): " GITHUB_URL

read -p "Next.js 프로젝트 생성? (y/n) [y]: " CREATE_NEXTJS
if [ -z "$CREATE_NEXTJS" ]; then
  CREATE_NEXTJS="y"
fi

echo ""
echo "  프로젝트  : $PROJECT_NAME"
echo "  ntfy 채널 : $NTFY_TOPIC"
echo "  GitHub    : ${GITHUB_URL:-설정 안 함}"
echo "  Next.js   : $CREATE_NEXTJS"
echo ""
read -p "계속할까요? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "취소됨."
  exit 0
fi

# ── STEP 1: Next.js 프로젝트 생성 ────────────────────────────
if [ "$CREATE_NEXTJS" = "y" ] || [ "$CREATE_NEXTJS" = "Y" ]; then
  echo ""
  echo "[1/5] Next.js 프로젝트 생성 중..."

  EXISTING=$(ls -A . 2>/dev/null | grep -v '^setup\.sh$' | grep -v '^\.git$')
  if [ -n "$EXISTING" ]; then
    echo "  ⚠️  폴더에 파일이 있습니다. 계속하면 Next.js 파일이 추가됩니다."
    read -p "  계속할까요? (y/n): " CONT
    if [ "$CONT" != "y" ] && [ "$CONT" != "Y" ]; then
      exit 0
    fi
  fi

  npx create-next-app@latest . \
    --typescript \
    --tailwind \
    --app \
    --no-src-dir \
    --no-import-alias \
    --yes

  if [ $? -ne 0 ]; then
    echo "  ❌ Next.js 생성 실패!"
    exit 1
  fi
  echo "  ✅ Next.js 생성 완료!"
else
  echo ""
  echo "[1/5] Next.js 생성 건너뜀"
fi

# ── STEP 2: deploy.sh 생성 ────────────────────────────────────
echo ""
echo "[2/5] deploy.sh 생성 중..."

# 단일 인용 HEREDOC으로 템플릿 작성 → $ 이스케이프 불필요
cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash

# ============================================================
# PLACEHOLDER_PROJECT 자동 배포 스크립트
# 환경: Windows 10 + Git Bash
#
# 사용법:
#   bash deploy.sh "커밋 메시지"
#   bash deploy.sh              (메시지 없으면 자동 생성)
#
# 최초 1회: vercel link 먼저 실행할 것!
# ============================================================

# ── 설정 (여기만 바꾸면 됨) ──────────────────────────────────
NTFY_TOPIC="PLACEHOLDER_NTFY"   # ntfy 앱에서 구독한 채널 이름
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
echo "  PLACEHOLDER_PROJECT 자동 배포 시작"
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
    FILES_PREVIEW="$FILES_PREVIEW (+$(($CHANGED_COUNT - 3)) more)"
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
    notify "PLACEHOLDER_PROJECT: Pushed ($CHANGED_COUNT files)" "$PUSH_MSG" "white_check_mark"
  else
    echo "  ❌ Push 실패!"
    notify "PLACEHOLDER_PROJECT: Push failed!" "Commit: $COMMIT_MSG" "x"
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

if [ ! -d ".vercel" ]; then
  echo "  ⚠️  Vercel 프로젝트 연결이 필요합니다!"
  echo "  아래 명령어 실행 후 다시 시도하세요:"
  echo ""
  echo "    vercel link"
  echo ""
  notify "PLACEHOLDER_PROJECT: Vercel not linked!" "Run: vercel link" "warning"
  exit 1
fi

VERCEL_LOG=$(mktemp)
DEPLOY_START=$(date +%s)
vercel --prod --yes > "$VERCEL_LOG" 2>&1
VERCEL_STATUS=$?
DEPLOY_END=$(date +%s)
ELAPSED=$(($DEPLOY_END - $DEPLOY_START))

# ── STEP 4: 결과 알림 ────────────────────────────────────────
echo "[4/4] 결과 확인 중..."

if [ $VERCEL_STATUS -eq 0 ]; then
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
URL   : ${DEPLOY_URL}
Time  : ${ELAPSED}s"
  notify "PLACEHOLDER_PROJECT: Deployed in ${ELAPSED}s" "$DEPLOY_MSG" "rocket"

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
  notify "PLACEHOLDER_PROJECT: Deploy failed!" "Commit: $COMMIT_MSG
Error : $ERROR_PREVIEW" "x"
fi

rm -f "$VERCEL_LOG"
echo ""
DEPLOYEOF

# 플레이스홀더 치환
sed -i "s/PLACEHOLDER_PROJECT/$PROJECT_NAME/g" deploy.sh
sed -i "s/PLACEHOLDER_NTFY/$NTFY_TOPIC/g" deploy.sh
chmod +x deploy.sh
echo "  ✅ deploy.sh 생성 완료!"

# ── STEP 3: .gitignore 업데이트 ───────────────────────────────
echo ""
echo "[3/5] .gitignore 업데이트 중..."

if [ -f ".gitignore" ]; then
  # 이미 있으면 bkit 항목만 추가 (중복 방지)
  if ! grep -q "bkit" .gitignore; then
    cat >> .gitignore << 'GITEOF'

# bkit
.bkit/agent-state.json
docs/.pdca-status.json

# 개인 노트 (로컬 전용)
notes/
GITEOF
    echo "  ✅ bkit/notes 항목 추가 완료!"
  else
    echo "  bkit 항목 이미 존재, 건너뜀"
  fi
else
  # .gitignore가 없으면 기본 생성
  cat > .gitignore << 'GITEOF'
# dependencies
node_modules/

# next.js
.next/
out/

# env files
.env
.env.local
.env.*.local

# debug
npm-debug.log*

# typescript
*.tsbuildinfo
next-env.d.ts

# vercel
.vercel

# bkit
.bkit/agent-state.json
docs/.pdca-status.json

# 개인 노트 (로컬 전용)
notes/
GITEOF
  echo "  ✅ .gitignore 생성 완료!"
fi

# ── STEP 4: Git 초기화 및 GitHub 연결 ────────────────────────
echo ""
echo "[4/5] Git 설정 중..."

if [ ! -d ".git" ]; then
  git init
  echo "  ✅ git init 완료!"
fi

git add .
git commit -m "init: $PROJECT_NAME 프로젝트 초기 셋업" 2>/dev/null || echo "  (커밋할 변경사항 없음)"

if [ -n "$GITHUB_URL" ]; then
  git remote add origin "$GITHUB_URL" 2>/dev/null || git remote set-url origin "$GITHUB_URL"
  git branch -M main
  echo "  GitHub push 중..."
  if git push -u origin main; then
    echo "  ✅ GitHub push 완료!"
  else
    echo "  ⚠️  push 실패. 나중에 수동으로:"
    echo "    git push -u origin main"
  fi
else
  echo "  GitHub URL 없음. 나중에 수동으로:"
  echo "    git remote add origin https://github.com/username/$PROJECT_NAME"
  echo "    git push -u origin main"
fi

# ── STEP 5: Vercel 연결 ───────────────────────────────────────
echo ""
echo "[5/5] Vercel 연결 중..."
echo "  (아래에서 프로젝트 선택 또는 새로 생성)"
echo ""

vercel link

if [ -d ".vercel" ]; then
  echo "  ✅ Vercel 연결 완료!"
else
  echo "  ⚠️  Vercel 연결 안 됨. 나중에 수동으로: vercel link"
fi

# ── 완료 ──────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 셋업 완료! $PROJECT_NAME"
echo ""
echo "  다음 단계:"
echo "  1. CLAUDE.md 작성 (프로젝트 설명 추가)"
echo "  2. 개발 시작!"
echo "  3. 배포: bash deploy.sh \"커밋 메시지\""
echo ""
echo "  ntfy 채널 구독: $NTFY_TOPIC"
echo "  (ntfy 앱에서 '$NTFY_TOPIC' 채널 구독하세요)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
