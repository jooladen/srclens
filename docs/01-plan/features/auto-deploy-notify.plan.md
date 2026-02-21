# Plan: auto-deploy-notify

## 환경 정보
- OS: Windows 10
- 터미널: Git Bash (MINGW64)
- curl: 7.78.0 ✅ (이미 설치됨)
- vercel: 50.22.0 ✅ (이미 설치됨)
- git: 2.33.0 ✅ (이미 설치됨)

## 개요
git push 후 Vercel 배포까지 **자동으로** 실행되고,
완료 시 **ntfy 앱**으로 폰에 알림 오는 시스템 구축

## 목표
- [ ] 명령어 하나로 git add → commit → push 자동 실행
- [ ] push 완료 시 폰에 ntfy 알림 수신
- [ ] Vercel 배포 완료 시 폰에 ntfy 알림 수신
- [ ] 엔터 한 번 누르면 나머지는 자동 (화장실 다녀와도 OK)

## Windows 10 + Git Bash 특이사항
- `.sh` 스크립트는 LF(Unix) 줄바꿈 사용해야 함 (CRLF 쓰면 오류!)
- `bash deploy.sh` 또는 `./deploy.sh`로 실행
- curl은 Git Bash에 내장되어 있어 별도 설치 불필요
- vercel CLI는 npm으로 설치된 전역 패키지, Git Bash에서 바로 사용 가능
- Windows 경로(C:\...)가 아닌 Unix 경로(/c/Users/...)로 작성

## 구현 방법

### 방법 1 (선택): 배포 스크립트 (`deploy.sh`)
- `git add . && git commit -m "..." && git push` 자동 실행
- `curl`로 ntfy에 push 완료 알림 전송
- `vercel --prod --yes`로 배포 후 완료 알림

### 방법 2 (미사용): GitHub Actions
- 서버에서 실행 → Windows 환경 무관
- 설정이 복잡하고 GitHub 저장소 필요
- 지금 단계에서는 불필요

## 선택한 방법
**방법 1 (배포 스크립트)** - 이미 모든 도구 설치됨, 즉시 사용 가능

## 필요한 것
- [x] curl - 이미 설치됨
- [x] vercel CLI - 이미 설치됨
- [x] git - 이미 설치됨
- [ ] 폰에 ntfy 앱 설치 (무료)
- [ ] deploy.sh 파일 작성 (LF 줄바꿈)

## 파일 목록
- `deploy.sh` - 원클릭 배포 스크립트 (LF 줄바꿈 필수!)

## 우선순위
P0: deploy.sh + ntfy 알림 (핵심 기능)
P1: Vercel 배포 완료 URL 알림

## Windows 주의사항
Git Bash에서 스크립트 실행 시 CRLF 문제가 발생할 수 있음
→ Write 도구로 파일 생성하면 자동으로 LF 처리됨
→ Windows 메모장으로 편집 시 CRLF 주의 (VS Code 권장)
