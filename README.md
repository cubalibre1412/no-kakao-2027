# 카카오 주주연대 프로필 배지 만들기

사진에 주주연대 배지와 **카카오 인적분할 부결** 캠페인 디자인을 합성해 PNG로 저장하는 웹앱입니다.

## 주요 기능

- JPG, PNG, WebP 사진 선택·드래그 업로드 (최대 20MB)
- 큰 팻말형, 사진 강조형, 주주연대 로고형
- 확대, 드래그 및 조절 막대를 이용한 사진 위치 조정
- 원형·정사각형 미리보기, 1080 × 1080 PNG 저장
- 주주연대 로고 원본 3종 다운로드
- 사진은 브라우저에서만 처리하며 서버로 전송·보관하지 않음

## 실행

외부 패키지와 API 키가 필요 없는 HTML/CSS/JavaScript 앱입니다. AI Studio와 Cloud Run에서 바로 실행할 수 있도록 Node.js 시작 설정을 포함합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. `npm start`도 동일하게 실행됩니다. `PORT` 환경변수 또는 `--port` 인자를 지정할 수 있으며 `0.0.0.0`에서 수신합니다. 정적 웹 호스팅에서는 기존처럼 `dist` 디렉터리를 사용합니다.

## Google AI Studio에서 가져오기

GitHub의 최신 `main`을 가져온 뒤 `npm install` 및 `npm run dev`를 실행합니다. 기본 포트는 3000입니다. 이전 버전을 이미 가져왔다면 GitHub 변경사항을 먼저 가져오거나 프로젝트를 새로 가져오세요. 미리보기의 Reload 버튼만으로는 저장소 변경사항이 반영되지 않을 수 있습니다.

`npm run build`는 시작 파일과 이미지 누락 및 JavaScript 구문을 검사합니다. 앱은 이미 정적 파일로 완성되어 별도 컴파일은 필요하지 않습니다. 배포에는 `npm start`를 사용하거나 포함된 `Dockerfile`을 사용합니다. Cloud Run의 `PORT` 환경변수를 지원합니다.

## 시작 문제 확인

- 로그에서 `Kakao profile badge ready on http://0.0.0.0:3000`을 확인합니다.
- `/healthz`가 `ok`를 반환하는지 확인합니다.
- `/assets/campaign-frame.png`와 세 로고 경로가 HTTP 200을 반환해야 합니다.
- 사진 합성·저장은 브라우저 안에서 처리되며 Gemini API 키가 필요하지 않습니다.

## 구조

- `dist/index.html`: 화면·입력 UI
- `dist/style.css`: 반응형 레이아웃
- `dist/app.js`: Canvas 합성·사진 조절·PNG 저장
- `dist/assets/campaign-frame.png`: 사용자 확인을 받은 캠페인 고정 프레임 (라이언 제외)
- `dist/assets/alliance-circle.png`: 원형 프로필 로고, 오른쪽 심벌 배지의 원본
- `dist/assets/alliance-logo.png`: 정사각형 로고
- `dist/assets/alliance-wide.png`: 직사각형 로고

큰 팻말형은 글자를 기기 글꼴로 다시 그리지 않고 고정 이미지 프레임을 합성합니다. 오른쪽 원형 배지는 제공된 로고 소스를 별도로 사용합니다. 사진 강조형은 Canvas 텍스트를 사용합니다.

## 확인한 항목

브라우저에서 사진 업로드, 확대·위치 조정, 스타일 변경, 초기화와 PNG 다운로드를 확인했습니다. 실물 모바일 기기 검증은 별도로 필요합니다.

이 저장소에는 사용자 업로드 사진, 인증정보, API 키를 포함하지 않습니다. 이 도구는 주주 캠페인용이며 카카오 공식 서비스가 아닙니다. 별도 오픈소스 라이선스는 지정하지 않았습니다.
