# 스도쿠

9×9 판에서 각 행·열·3×3 구역을 1~9로 채우는 브라우저 게임입니다. 쉬움·보통·어려움·전문가의 서로 다른 4개 난이도, 숫자 입력·메모·지우기·힌트·일시정지·새 퍼즐 시작·완료 기록을 지원합니다. 퍼즐과 정답은 로컬 `sudoku-gen` package가 생성하며 외부 API가 필요하지 않습니다.

## 실행

Node.js 22 이상과 npm이 필요합니다. API key·계정·환경 파일·backend 설정은 필요하지 않습니다.

```sh
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1
```

표시된 localhost URL을 브라우저에서 엽니다. 정적 배포 파일은 다음 명령으로 생성합니다.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/`를 HTTPS 정적 hosting에 배포할 수 있습니다. Vite dev/preview server는 로컬 확인용입니다. lockfile과 CI action commit SHA를 고정했으며 CI는 push/PR에 읽기 권한만 사용합니다.

## 사용 흐름

새 게임 시작에서 난이도를 고르고 빈칸을 선택합니다. 화면 숫자판 또는 키보드 1~9로 입력하며 N은 메모 모드, Backspace/Delete는 지우기, 방향키는 선택 이동입니다. 메모는 빈칸에만 입력합니다. 힌트로 채운 칸은 고정되고, 일시정지는 timer와 입력을 멈춥니다. 다시 시작은 새 퍼즐을 만들고 시간·실수·선택·메모 모드·일시정지를 초기화합니다. 실수는 횟수만 세며 3회 패배 규칙은 없습니다. 힌트를 사용한 완료도 동일한 개인 기록에 저장합니다.

## 기록과 개인정보

저장소 key는 `sudoku_high_scores`입니다. 네트워크로 점수나 사용자 정보를 보내지 않으며 가짜 기록·이용자·랭킹을 넣지 않았습니다. 기록 key가 손상되었거나 읽기 권한이 없으면 기존 bytes를 자동으로 덮어쓰거나 삭제하지 않습니다. 이때 저장 실패 안내를 표시하며 게임은 계속할 수 있지만 완료 기록 저장은 실패로 안내합니다.

## 검증 범위와 한계

로컬 Node 26.8.1에서 clean install, typecheck, 7개 자동 test, production build, npm audit와 redacted secret scan을 실행했습니다. 자동 test의 synthetic 입력·고정 board는 `tests/`에만 있으며 production seed나 공개 사용자 기록으로 사용하지 않습니다. 공개 원격 CI·hosting 실행은 source 준비와 별도입니다.

`sudoku-gen`은 package에 포함된 알려진 seed 퍼즐에 배치·숫자 변환을 적용합니다. 이는 실제 게임 콘텐츠이며 테스트용 fixture가 아닙니다. 새 퍼즐의 전역 중복 방지나 자체 solver·난이도 보정은 제공하지 않습니다. 원본의 master 선택은 expert를 그대로 호출하던 중복 옵션이므로 신규 선택에서 제거했습니다. 기존 master 완료 기록은 이전 전문가 기록으로 구분해 읽습니다. 기록은 이 브라우저에만 저장되며 서버 랭킹·계정·클라우드 동기화·자동 이어하기는 없습니다.

## 라이선스

First-party source는 MIT입니다. 기존 notice를 보존했으며 `RIGHTS.md`와 `THIRD_PARTY_NOTICES.md`에 실제 포함된 package·SVG·Unicode 문자 권리를 기록했습니다. 사진·raster·외부 font·과거 운영 문서·원본 ZIP·비밀 설정은 포함하지 않았습니다.
