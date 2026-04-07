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