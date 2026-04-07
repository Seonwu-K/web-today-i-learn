### 문제1: 테이블 생성하기

#### `attendance` 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?

> 크루 id와 닉네임이 중복됩니다.


#### `attendance` 테이블에서 중복을 제거하기 위해 crew 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
> attendance 테이블로부터 crew_id와 nickname만 중복되지 않게 가져오도록 구성하면 됩니다.
#### crew 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)
```SQL
SELECT DISTINCT crew_id, nickname FROM attendance;
```

```SQL
CREATE TABLE crew (
  crew_id INT NOT NULL AUTO_INCREMENT,
  nickname VARCHAR(50) NOT NULL,
  PRIMARY KEY (crew_id),
  UNIQUE (nickname)
);
```

```SQL
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

### 문제2: 테이블 컬럼 삭제하기 (ALTER TABLE)

#### crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?
> crew_id만 있어도 닉네임 정보를 크루 테이블에서 조회하여 사용할 수 있으므로 닉네임 컬럼이 없어도 된다.
#### 컬럼을 삭제하려면 어떻게 해야 하는가?
> ALTER 사용 
```SQL
ALTER TABLE attendance DROP COLUMN nickname;
```


### 문제3: 외래키 설정하기
#### 만약에 crew 테이블에는 crew_id가 12번인 크루가 존재하지 않지만, attendance 테이블에는 여전히 crew_id가 12번인 크루가 존재한다면?
- 해당 크루가 중간에 퇴소했거나
- 누군가의 실수에 의해 레코드가 삭제되었거나

```SQL
ALTER TABLE attendance
ADD CONSTRAINT fk_attendance_crew
FOREIGN KEY (crew_id)
REFERENCES crew(crew_id);
```


### 문제 4: 유니크 키 설정
#### 우아한테크코스에서는 닉네임의 '중복'이 엄연히 금지된다. 그런데 현재 테이블에는 중복된 닉네임이 담길 수 있다. crew 테이블의 결함을 어떻게 해결할 수 있을까?
```SQL
ALTER TABLE crew MODIFY COLUMN nickname VARCHAR(50) UNIQUE;
```


### 문제 5: 크루 닉네임 검색하기 (LIKE)
#### 3월 4일, 아침에 검프에게 어떤 크루가 상냥하게 인사했다. 그런데 검프도 구면인 것 같아서 닉네임 첫 글자가 디라는 건 떠올랐는데... 누구지?

```SQL
SELECT * from crew where nickname like '디%';
```

### 문제 6: 출석 기록 확인하기 (SELECT + WHERE)
#### 성실의 아이콘 어셔는 등굣길에 스마트폰을 떨어뜨리는 바람에 3월 6일에 등교/하교 버튼을 누르지 못했다. 담당 코치에게 빠르게 공유한 그를 구제하기 위해 검프가 출석 처리를 해 주려고 한다.

> 어셔: 안녕하세요 검프. 저는 3월 6일 09시 31분에 등교하고 18시 01분에 하교했습니다. 감사합니다.
검프: 네 ^^;;; (이거 어쩌나...)

현재 테이블에 어셔 데이터 자체가 없기 때문에 데이터 추가가 필요하다.
```SQL
INSERT INTO crew (nickname)
VALUES ('어셔');
```

```SQL
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
SELECT crew_id, '2025-03-06', '09:31:00', '18:01:00'
FROM crew
WHERE nickname = '어셔';
```
실제 출석 기록 확인은 아래와 같이
```SQL
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '어셔'
  AND a.attendance_date = '2025-03-06';
```


### 문제 7: 누락된 출석 기록 추가 (INSERT)
#### 확인해 보니, 어셔는 그날 출석 체크를 하지 못한 것이 사실로 드러났다. 사후 처리를 위해 출석을 추가해야 하는데 어떻게 추가해야 할까?
```SQL
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
SELECT crew_id, '2025-03-06', '09:31:00', '18:01:00'
FROM crew
WHERE nickname = '어셔';
```

### 문제 8: 잘못된 출석 기록 수정 (UPDATE)
#### 주니는 3월 12일 10시 정각에 캠퍼스에 도착했지만, 등교 버튼을 누르는 것을 깜빡하고 데일리 미팅에 참여했다. 뒤늦게야 알게 됐는데 시각은 10시 5분... 지각 처리가 되는 시점이었다.

> 주니: 검프~! 제가 3월 12일 10시 정각에 캠퍼스에 도착했는데 깜빡하고 등교 버튼을 늦게 눌렀어요. 나중에 확인해 보니까 10시 5분이더라구욥ㅠ 👉🏻👈🏻 ... 죄송한데 한 번만 출석 처리 해주실 수 있을까욥??? 🥹🥹

> 검프: 네 ^^;;; (그냥 지각 처리하면 안 되나ㅠㅠ)

```SQL
INSERT INTO crew (nickname)
VALUES ('주니');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
SELECT crew_id, '2025-03-12', '10:05:00', '18:00:00'
FROM crew
WHERE nickname = '주니';


UPDATE attendance a
JOIN crew c ON a.crew_id = c.crew_id
SET a.start_time = '10:00:00'
WHERE c.nickname = '주니'
AND a.attendance_date = '2025-03-12';
```


### 문제 9: 허위 출석 기록 삭제 (DELETE)
#### 시력은 좋지 않지만, 평소 눈썰미가 좋은 검프는 아론이 3월 12일에 캠퍼스에 도착하지 않은 점을 깨달았다. 그런데 무슨 이유에서인지 그날 출석 처리가 되어 있는 것을 우연히 발견했다.

> 검프: 아론...? 3월 12일에는 안 나오셨잖아요? 그날 구구한테 물어보니까 안 나오셨다던데...
> 아론: 앗.. 죄송해요 ㅜㅜ
> 검프: 해당 기록은 제가 지우겠습니다..

```SQL
INSERT INTO crew (nickname)
VALUES ('아론');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
SELECT crew_id, '2025-03-12', '09:58:00', '18:00:00'
FROM crew
WHERE nickname = '아론';

SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '아론'
AND a.attendance_date = '2025-03-12';

DELETE a
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '아론'
AND a.attendance_date = '2025-03-12';

SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '아론'
AND a.attendance_date = '2025-03-12';
```

### 문제 10: 출석 정보 조회하기 (JOIN)
#### 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력해서 출석 기록을 조회했다. 그런데 crew 테이블에서 crew_id를 기준으로 nickname 필드 값을 가져와서 함께 조회할 수도 있지 않을까?

```SQL
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '검프';
```


### 문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)
#### 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력했다. 그런데 nickname을 입력하면 이를 기준으로 쿼리문을 처리할 수도 있지 않을까?

```SQL
SELECT attendance_date, start_time, end_time
FROM attendance
WHERE crew_id = (
    SELECT crew_id
    FROM crew
    WHERE nickname = '검프'
);
```


### 문제 12: 가장 늦게 하교한 크루 찾기
#### 3월 6일, 검프는 우연히 아침에 일찍 눈을 떴다. 상쾌하게 일찍 출근하기로 마음을 먹고 캠퍼스로 향했다. 검프가 가장 먼저 도착했다. 하지만, 경비 처리가 되어 있지 않은 걸 확인했다. 전날(3월 5일) 가장 늦게 하교한 크루를 찾아 DM을 보내려고 하는데 크루의 닉네임과 하교 시각은 어떻게 찾을 수 있을까?

```SQL
SELECT c.nickname, a.end_time FROM attendance a 
JOIN crew c ON a.crew_id = c.crew_id
WHERE a.attendance_date = '2025-03-05' ORDER BY a.end_time DESC;
```


## 집계 함수 실습
### 문제 13: 크루별로 '기록된' 날짜 수 조회
```SQL
SELECT c.nickname, COUNT(attendance_date) AS attendance_count
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
GROUP BY nickname;
```


### 문제 14: 크루별로 등교 기록이 있는(start_time IS NOT NULL) 날짜 수 조회
기본 세팅에서는 시작 시간이 NULL값인 데이터가 없지만 일부 데이터를 NULL로 설정하게 되면 반영되는 것을 확인한 SQL문은 다음과 같다. 
```SQL
SELECT c.nickname, COUNT(attendance_date) AS attendance_count
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE start_time IS NOT NULL
GROUP BY nickname;
```

### 문제 15: 날짜별로 등교한 크루 수 조회
```SQL
SELECT a.attendance_date, COUNT(a.crew_id) AS crew_number
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
GROUP BY a.attendance_date;
```
### 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)
```SQL
SELECT c.nickname, MIN(a.start_time) AS early_start_time, MAX(a.start_time) AS late_start_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
GROUP BY a.crew_id;
```


# 생각해보기

### 기본키란 무엇이고 왜 필요한가?

> 출제 의도: 테이블에서 각 레코드를 고유하게 식별하는 기본키의 개념과 중요성을 이해해보자. 실제 데이터를 다룰 때 식별자가 없다면 어떤 문제가 발생할지 생각해보고, 기본키 선택이 데이터베이스 설계에 미치는 영향을 고민해보자.

기본키는 데이터를 고유하게 식별하기 위한 요소이자, 빠르게 데이터를 찾기 위해 활용이 가능한 값입니다. 기본키를 무엇으로 선택하느냐에 따라 조회, 수정, 삭제 등에서 성능적인 차이가 날 수도 있으며, 기본키가 없으면 수많은 데이터가 존재할 때 분류하고 데이터를 사용하기 어려울 것입니다.

### MySQL에서 사용되는 AUTO_INCREMENT는 왜 필요할까?

> 출제 의도: 일일이 ID 값을 지정해야 하는 번거로움을 줄이고 중복 없는 고유값을 자동으로 생성하는 기능의 필요성을 파악해보자. 

매번 직접 ID 값을 지정하며 저장해야 하는데, 이때 ID는 고유한 값이기 때문에 현재 테이블의 상태를 의식하고 있어야 합니다.

### 학생이 등교는 했지만 하교 버튼을 누르지 않았을 때, end_time에 NULL이 저장된다. NULL 값을 처리할 때 주의할 점은?

> 출제 의도: NULL 처리는 SQL 학습에서 자주 혼란을 주는 개념이다. 특히 프론트엔드에서 NULL 데이터를 어떻게 표시할지는 실무적으로 중요한 문제이다.

NULL은 “값이 없음”을 의미하지, 0이나 빈 문자열이 아니다. 그래서 일반적인 비교 연산이 제대로 동작하지 않는다. IS NULL, IS NOT NULL등의 별도 문법으로 처리해야한다.

### crew와 attendance 테이블의 관계를 ER 다이어그램으로 시각화해보자. 이 관계를 일상 생활의 예시로 비유한다면 어떤 것이 있을까?

> 출제 의도: 일대다 관계를 실생활에서 찾아보면서(예: 학생-수강과목, 고객-주문 등) 관계형 모델의 기본 개념을 체득해보자.

1:N 관계로 나타낼 수 있다. 유저와 게시글 등의 관계가 예시로 들 수 있다. 유저는 한 사람 당 여러 개의 게시글을 가질 수 있다. 


### 출석 시스템에서 동시에 100명이 등교 버튼을 누른다면 어떤 일이 일어날까? 이 문제를 2026 공통강의 - DB에서 배운 트랜잭션과 ACID 속성으로 설명해보자.

> 출제 의도: 실습에서 직접 다룬 INSERT/UPDATE가 실제 운영 환경에서는 동시성 문제를 일으킬 수 있다. 원자성(Atomicity)과 격리성(Isolation)이 왜 필요한지 출석 시스템의 맥락에서 구체적으로 떠올려보자.

동시에 테이블에 값이 생성되거나 수정이 된다면 누락되는 경우가 생길 수 있다. 이때 원자성은 전부 성공하거나 전부 실패하도록 보장하는 것을 말한다. 트랜잭션을 통해 처리하게 되면 전체를 롤백할 수 있다. 또한 격리성은 동시에 실행될 때 서로에게 간섭이 일어나지 않도록 한다. 하나의 트랜잭션이 실행 중이라면 다른 트랜잭션은 이에 간섭할 수 없다. 동시 요청 환경에서는 트랜잭션 + 제약조건을 통해 데이터가 깨지지 않도록 보장해야 한다. 

### 출석 데이터가 파일(CSV)이 아닌 데이터베이스에 저장되는 이유는 무엇일까? 파일 시스템으로 출석을 관리했다면 어떤 문제가 생길까?

> 출제 의도: 2026 공통강의 - DB에서 배운 파일 시스템의 한계(데이터 중복, 일관성, 동시 접근, 보안)를 출석 시스템이라는 구체적인 사례에 적용해보자.

파일 시스템의 경우 DB에서 적용하는 제약 조건을 통한 중복 제한 등이 불가능하여 데이터가 중복될 수 있고, 트랜잭션이나 제약조건을 적용할 수 없으니 앞서 다룬 동시 접근 등의 문제로부터 안전할 수 없다. 테이블 간에 연동을 통해 데이터의 수정이 일어났을 때 이를 참조하는 다른 테이블에서도 수정이 되어 일관된 데이터를 유지하도록 하는 것도 파일 시스템 환경에선 제한적이다. 

### 출석 데이터를 관계형 DB가 아닌 NoSQL(예: MongoDB)로 저장한다면 테이블 구조가 어떻게 달라질까? 어떤 장단점이 있을까?

> 출제 의도: 2026 공통강의 - DB에서 배운 RDBMS vs NoSQL 비교를 실제 데이터에 적용해보자. 출석 데이터처럼 구조가 명확한 경우와, 크루 프로필처럼 자유로운 구조가 필요한 경우를 비교해보자.

출석 데이터를 NoSQL로 저장하면 RDB처럼 테이블을 나누고 JOIN하는 대신, 하나의 문서에 크루 정보와 출석 기록을 함께 저장하는 구조로 바뀐다. 이 경우 스키마가 유연해서 구조에 대한 설계나 수정이 용이하다.

하지만 외래키와 같은 제약조건이 없어 데이터 무결성을 보장하기 어렵고, 닉네임 같은 정보가 여러 곳에 중복 저장될 수 있다. 즉 체계적으로 데이터를 관리하는 것이 어렵다.

출석처럼 구조가 명확하고 일관성이 중요한 데이터는 RDB가 적합하고, 구조가 자주 바뀌는 유연한 데이터는 NoSQL이 더 적합하다.


# 심화: 더 생각해보기

### 왜 crew 테이블에서 nickname을 기본키로 하지 않은 걸까? attendance 테이블에 attendance_id가 존재하는 이유는 무엇일까?

> 출제 의도: 자연키(nickname)와 대리키(crew_id, attendance_id)의 차이점과 선택 기준을 이해해보자. 업무적 의미가 있는 데이터(nickname)는 미래에 변경될 가능성이 있어 기본키로 적합하지 않을 수 있다.

실제 우테코에서는 닉네임을 변경할 수 없지만, 닉네임이 변경되어야 하는 경우 처럼 순수하게 식별을 위한 용도가 아닌 별도의 기능이 사용될 가능성이 있는 데이터는 기본키로 사용하기 부적합하다. 수정이 필요하게 되면 이를 키로서 참조하는 다른 테이블에도 영향을 미치게 되므로 최대한 변동 가능성이 없는 고유값인 대리키를 기본키로 사용하는 것이 좋다.

### 데이터베이스 제약 조건 중 RESTRICT, CASCADE는 무엇인가?

> 출제 의도: 외래키 관계에서 참조 무결성을 유지하기 위한 다양한 전략을 이해해보자. 예를 들어 사용자가 탈퇴할 때 그 사용자의 게시글도 함께 삭제해야 할지, 아니면 유지해야 할지와 같은 실제 의사결정에 이 개념이 어떻게 적용되는지 고민해보자.

RESTRICT와 CASCADE는 외래키 관계에서 부모 데이터가 변경될 때 자식 데이터를 어떻게 처리할지 정의하는 제약 옵션이다. 부모 테이블을 참조하고 있는 자식 테이블이 있을 때, 부모 테이블에 수정이나 삭제가 일어나면 RESTRICT는 이를 막는 방식이다. CASCADE는 부모의 영향을 받아 자식 테이블에도 반영된다.

중요한 정보를 보존해야 하는 경우 RESTRICT, 부모에 종속적으로 영향을 받는게 자연스러운 데이터의 경우 CASCADE를 사용한다. 

### 다음 두 쿼리는 동일한 결과를 반환하지만 성능에 차이가 있다. 어떤 차이가 있으며, 어떤 상황에서 각각 유리할까?

```SQL
-- 쿼리 1: 서브쿼리 사용
SELECT * FROM attendance WHERE crew_id IN (SELECT crew_id FROM crew WHERE nickname LIKE '네%');

-- 쿼리 2: JOIN 사용
SELECT a.* FROM attendance a JOIN crew c ON a.crew_id = c.crew_id WHERE c.nickname LIKE '네%';
```
> 출제 의도: 동일한 결과를 위한 다양한 접근법의 장단점을 이해하는 것은 실무에서 중요한 의사결정 역량이기도 하다.

일반적으로는 JOIN이 옵티마이저가 더 적극적으로 최적화하기 쉬워서 대용량 데이터나 인덱스가 잘 잡힌 환경에서 더 유리한 경우가 많다. 특히 관련 테이블의 정보도 함께 조회해야 할 때는 JOIN이 자연스럽다. 보다 직관적인 의미를 가지는 것은 서브 쿼리 방식이기에 성능보다 가독성이 중요한 경우에서는 서브 쿼리를 사용할 수도 있다.

### attendance 테이블을 완전히 정규화하면 어떤 장점이 있을까? 반대로 일부 비정규화를 적용한다면 어떤 쿼리 성능 이점을 얻을 수 있을까?

> 출제 의도: 정규화와 성능 사이의 균형은 데이터베이스 설계의 핵심 과제이다.

정규화를 하면 데이터 중복이 줄어들고, 외래키로 무결성과 일관성을 보장할 수 있어 유지보수가 쉬워진다.

반대로 비정규화를 하면 attendance에 nickname을 함께 저장해 JOIN 없이 조회할 수 있어 읽기 성능이 좋아진다. 다만 데이터 중복이 생기고, 수정 시 여러 곳을 함께 변경해야 하는 단점이 있다.

### 출석 시스템이 수백 명의 사용자에 의해 동시에 접근된다면, 연결 풀링(connection pooling)은 무엇이고 왜 필요한가?

> 출제 의도: 데이터베이스 연결 관리는 웹 애플리케이션 성능에 큰 영향을 미치는 요소이다.

연결 풀링(connection pooling)은 데이터베이스 연결을 매번 새로 생성하지 않고, 미리 일정 개수의 연결을 만들어 풀(pool)에 보관해두고 필요할 때 재사용하는 방식이다.

사용자가 요청할 때마다 DB 연결을 생성하고 종료하면 비용이 크고, 동시에 많은 요청이 들어오면 연결 생성으로 성능이 급격히 떨어질 수 있다. 

연결 풀을 사용하면 이미 만들어진 연결을 재사용하므로 응답 속도가 빨라지고, 사용할 수 있는 연결 수를 제한해 DB의 과부하를 방지할 수 있다.

### 실습에서 수행한 INSERT, UPDATE, DELETE를 하나의 트랜잭션으로 묶는다면 어떻게 작성할 수 있을까? 만약 DELETE 도중 오류가 발생하면 앞서 수행한 INSERT와 UPDATE는 어떻게 되어야 할까?

> 출제 의도: 2026 공통강의 - DB에서 배운 트랜잭션의 Commit/Rollback 개념을 실습 문제와 직접 연결해보자.

```SQL
START TRANSACTION;

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (2, '2025-03-13', '09:55:00', '18:00:00');

UPDATE attendance
SET start_time = '10:00:00'
WHERE crew_id = 2
AND attendance_date = '2025-03-12';

DELETE FROM attendance
WHERE crew_id = 3
AND attendance_date = '2025-03-12';

COMMIT;
```
