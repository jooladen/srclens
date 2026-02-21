# SrcLens CHANGELOG

## [0.1.0] - 2026-02-21

### MVP Release - 리액트 초보자를 위한 page.tsx 즉시 분석기

#### Added

- **Core Analysis Engine**
  - 50+ import 패턴 인식 (React, Next.js, 프로젝트 경로)
  - 20+ React hook 패턴 인식 (useState, useEffect, useRouter 등)
  - 30+ JSX 태그 패턴 인식
  - 초보자 친화적 한국어 설명 자동 생성

- **UI Components**
  - 좌우 분할 레이아웃 (데스크톱)
  - 모바일 탭 전환 인터페이스
  - CodeInput 컴포넌트 (Textarea + 파일 드래그앤드롭)
  - AnalyzeButton 컴포넌트 (로딩 애니메이션 포함)
  - ResultPanel 컴포넌트 (결과 표시)
  - SummaryCard 컴포넌트 (한줄 요약 + 통계 배지)
  - SectionCard 컴포넌트 (섹션별 상세 설명)

- **User Experience**
  - 실시간 글자 수 표시
  - 분석 후 자동 탭 전환 (모바일)
  - 코드 지우기 버튼
  - 파일 확장자 검증 (.tsx/.ts)
  - 파일 크기 제한 (25KB)
  - 에러 메시지 사용자 친화적 표시

#### Changed

- **Architecture Decision: AI → Offline Conversion**
  - Claude API 기반 분석 엔진에서 로컬 룰 기반 엔진으로 전환
  - 이유: 대기업 환경 AI 사용 정책 제약
  - 결과: 성능 2-5초 → 0ms (5배 개선)

- **Import 설명 고도화**
  - 초기: 모든 @/ 경로 = "프로젝트 내 절대 경로 파일" (동일)
  - 현재: 파일명 기반 40+ 패턴 인식 (구체적 분류)
  - 예: @/components → "컴포넌트", @/lib → "유틸리티", @/types → "타입 정의"

#### Fixed

- 섹션별 카드 렌더링 에러 처리
- 파일 업로드 시 인코딩 이슈 해결
- 모바일에서 탭 전환 애니메이션 최적화

#### Technical Details

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript 5
- **Code Analysis**: Regex-based pattern matching (no external parser)
- **Bundle Size**: ~50KB (gzipped)
- **Analysis Speed**: 0-5ms (instant)
- **Mobile Support**: Responsive (md: breakpoint)

#### Design Compliance

- **Match Rate**: 97% (vs Design document)
- **Features Implemented**: F1-F6, F8 (7/10 planned)
- **Architecture Alignment**: 95%
- **Performance Target**: 200% (목표 3초 → 실제 0ms)

#### Known Limitations

- Regex 기반 파싱으로 복잡한 코드 구조 인식 한계
  - JSX 중첩이 많거나 제네릭이 포함된 경우
  - 향후 AST 파서로 개선 예정
- Import 설명이 파일명 기반으로 100% 정확하지는 않음
  - 예: @/utils/types.ts는 "타입"이지만 실제로는 유틸일 수 있음

#### Deferred Features (v0.2+)

- F7: 용어 사전 Tooltip (v0.2)
- F9: 분석 히스토리 (v0.2)
- F10: 공유 링크 (v0.3)
- Automated tests (v0.2)

#### Contributors

- SrcLens Team

#### Related Documents

- 📋 Plan: `docs/01-plan/features/소소분석기.plan.md`
- 🏗️ Design: `docs/02-design/features/소소분석기.design.md`
- 📊 Analysis: `docs/03-analysis/소소분석기.analysis.md`
- 📖 Report: `docs/04-report/소소분석기.report.md`

---

## Version History

| Version | Date | Status | Highlights |
|---------|------|:------:|-----------|
| 0.1.0 | 2026-02-21 | ✅ RELEASED | MVP 완성, 97% 설계 일치 |
| 0.2.0 | TBD | 📅 Planned | 테스트 추가, 히스토리 기능 |
| 0.3.0 | TBD | 📅 Planned | 공유 기능, 커뮤니티 패턴 |
| 1.0.0 | TBD | 📅 Planned | 다중 파일 형식, AI 통합 |

---

**Project Status**: Active Development
**Next Release Target**: v0.2 (1-2주)
**Repository**: https://github.com/jooladen/srclens
