# Today I Learn 페이지 만들기

# 배포 링크

🔗 https://seonwu-k.github.io/web-today-i-learn/

# 구현 사항

## 1단계 - HTML

- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 시맨틱 태그를 사용한 페이지 구조 구성
- 프로필 사진(`<img>`), 닉네임, 한 줄 소개로 프로필 히어로 영역 구성
- 자기소개 문단(`<p>`) 작성 및 GitHub, 블로그 링크(`<a>`) 연결
- 이름, MBTI, 취미, 좋아하는 음식 정보를 `<table>`로 정리
- 갤러리 섹션에 9장의 이미지 배치
- 인생 작품 2가지를 목록 형태로 소개하고, 그중 하나에 `<iframe>` 영상 삽입
- 날짜, 학습 주제, 내용을 포함한 TIL 섹션 구성
- `<meta charset="UTF-8">`, `<meta name="viewport">`, Open Graph 태그(`og:title`, `og:description`, `og:image`) 설정
- 모든 이미지에 `alt` 속성 작성
- 이미지, CSS, JS 파일을 상대 경로로 연결

## 2단계 - CSS

- `reset.css`, `common.css`, `wiki-layout.css` 파일 분리
- `main.css`에서 `@import`를 사용한 CSS 통합 관리
- 태그 선택자(`body`, `main`, `footer` 등), 클래스 선택자(`.content-section`, `.gallery-grid` 등), ID 선택자(`#til`) 사용
- 갤러리 9장을 `display: grid`와 `grid-template-columns: repeat(3, 1fr)`로 3열 배치
- `:root`에 CSS 변수 정의 및 색상 테마 관리
- 상단 내비게이션 sticky, blur, hover 효과 적용
- 카드, 링크, 갤러리 이미지에 transition 기반 hover 효과 적용
- `.video-wrapper`를 활용한 16:9 비율 영상 영역 구성

## 3단계 - JavaScript

- `document.querySelector()`를 사용한 TIL 폼, 목록, 입력 요소 선택
- `submit` 이벤트 리스너를 통한 TIL 항목 동적 추가
- `createElement()`와 `textContent`를 사용한 DOM 요소 생성
- `prepend()`를 사용한 최신 TIL 항목 상단 배치
- 갤러리 이미지에 `mouseenter`, `mouseleave` 이벤트 연결
- hover 시 전체 미리보기 오버레이 표시 기능 구현
- 필요한 시점에 미리보기 오버레이를 생성하는 방식 적용