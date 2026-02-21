# srclens 프로젝트

## 개요
React/Next.js 코드를 붙여넣으면 **초보자 언어로 설명**해주는 오프라인 코드 분석기.
대상: React 초보 프리랜서

## 기술 스택
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- 순수 정적 분석 (AI/API 없음, 오프라인 동작)

## 버전 히스토리
- v0.1.0: 기본 분석 (imports, hooks, JSX, 컴포넌트 정보)
- v0.2.0: 점수카드, 개선제안, 예제버튼, 히스토리, 복사버튼 추가
- v0.3.0: 실시간 분석(디바운스), 점수 카운트업 애니메이션, 공유 링크
- v0.4.0: 레벨 배지(초급/중급/고급), Before/After 코드 개선 예시, 컴포넌트 트리 시각화
- v0.4.1: 컴포넌트 트리 개선 - 접기/펼치기, 스태거 애니메이션, 호버 글로우, 통계 Footer, Empty State
- v0.4.2: setup.sh 추가 - 새 프로젝트 초기 셋업 자동화 (Next.js + deploy.sh + git + Vercel)
- v0.5.0: 학습 모드 - 코드 줄 클릭 시 초보자 언어 설명 인라인 표시

## 배포 방법
```bash
bash deploy.sh "커밋 메시지"
```
- GitHub push → ntfy 알림 → Vercel 자동 배포 → ntfy 알림
- ntfy 채널: `srclens-deploy`
- 배포 URL: https://srclens.vercel.app
- GitHub: https://github.com/jooladen/srclens

## 환경
- OS: Windows 10, 터미널: Git Bash (MINGW64)
- curl / vercel CLI / git 모두 설치됨
- Vercel 프로젝트 연결됨 (.vercel 폴더 있음)

## 주요 파일
| 파일 | 역할 |
|------|------|
| `lib/analyzer.ts` | 핵심 분석 로직 (점수, 제안, imports/hooks/JSX 파싱, 트리 빌더) |
| `types/analysis.ts` | TypeScript 타입 정의 |
| `app/_components/AnalyzerClient.tsx` | 메인 UI + 히스토리 관리 |
| `components/analyzer/ScoreCard.tsx` | 코드 건강 점수 카드 + 레벨 배지 |
| `components/analyzer/SuggestionsCard.tsx` | 개선 제안 카드 + Before/After 토글 |
| `components/analyzer/ComponentTree.tsx` | 컴포넌트 트리 시각화 |
| `components/analyzer/ExampleButtons.tsx` | 예제 코드 버튼 |
| `components/analyzer/ResultPanel.tsx` | 결과 패널 + 복사 버튼 |
| `deploy.sh` | 자동 배포 스크립트 |
| `setup.sh` | 새 프로젝트 초기 셋업 자동화 |
| `components/analyzer/LearnMode.tsx` | 학습 모드 - 줄별 클릭 설명 UI |

## gitignore 제외 목록
- `node_modules/`, `.next/`, `.env*`
- `.vercel` (Vercel 설정)
- `.bkit/agent-state.json` (bkit 상태)
- `docs/.pdca-status.json` (PDCA 상태)
- `notes/` (개인 노트, 로컬 전용)

## notes 폴더 구조 (로컬 전용, git 제외)
```
notes/
├── prompts/    # Claude에게 쓰는 프롬프트 모음
├── guides/     # 가이드 문서
└── snippets/   # 자주 쓰는 명령어
```

## 개발 규칙
- 분석 로직은 `lib/analyzer.ts` 한 곳에서 관리
- 새 기능 추가 시 `types/analysis.ts` 타입 먼저 업데이트
- 배포 전 `npm run build`로 빌드 확인
- 버전 올릴 때 `package.json` version 수동 업데이트
- 새 파일/기능 추가 시 CLAUDE.md의 버전 히스토리·주요 파일 테이블·기능 로드맵 자동 업데이트

## 기능 로드맵 (물개박수 목록)

### ✅ 완료
- v0.1: 기본 분석 (imports, hooks, JSX)
- v0.2: 점수카드, 개선제안, 예제버튼, 히스토리, 복사버튼

### ✅ v0.3 완료
- [x] **실시간 분석** - 타이핑하면 즉시 분석 (버튼 없이) → "오 진짜로?"
- [x] **점수 카운트업 애니메이션** - 0점→85점 올라가는 효과 → 시각적 wow
- [x] **공유 링크** - URL에 코드 담아서 친구한테 전송 → "이거 봐봐!"

### ✅ v0.4 완료
- [x] **Before/After 코드 개선** - 개선 제안 클릭하면 고친 코드 바로 보여줌
- [x] **컴포넌트 트리 시각화** - 의존성 구조를 그림으로 표시
- [x] **레벨 배지** - "초급/중급/고급" 코드 레벨 판정
- [x] **트리 WOW 개선** - 접기/펼치기(▶/▼), 스태거 등장 애니메이션, 호버 글로우, 통계(총 노드수·컴포넌트수·최대깊이), Empty State
- [x] **setup.sh** - 새 프로젝트 빈 폴더에서 `bash setup.sh` 한 방에 셋업 → 프로젝트명/ntfy/GitHub/Vercel 자동 구성

### ✅ v0.5 완료
- [x] **학습 모드** - 코드 줄 클릭하면 초보자 언어로 설명 인라인 표시 (explainLine + LearnMode 컴포넌트)

### 🔜 v0.6 후보
- [ ] **PWA 설치 지원** - "앱으로 설치하기" 버튼 → 폰에 앱처럼 설치
- [ ] **분석 결과 이미지 저장** - 캡처해서 공유 (og-image 스타일)

### 🔧 기술 부채
- [ ] deploy.sh URL 추출 정리 (Aliased: 텍스트 제거)
- [ ] deploy.sh minor/patch/major 버전 옵션 추가
- [x] setup.sh 생성 (새 프로젝트 초기 셋업 자동화)
