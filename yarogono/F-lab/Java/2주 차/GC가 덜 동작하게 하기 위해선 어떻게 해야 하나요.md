# 🔗 참고자료

---

- Naver D2 - Garbage Collection 튜닝 ⇒ [**링크**](https://d2.naver.com/helloworld/37111)
- 책 <자바 성능 튜닝 이야기> - story03 왜 자꾸 String을 쓰지 말라는 거야?
- 책 <자바 성능 튜닝 이야기> - story19 GC 튜닝을 항상 할 필요는 없다
- 책 <이펙티브 자바> - 아이템6 불필요한 객체 생성을 피하라
- Understanding Memory Leaks in Java ⇒ [**링크**](https://www.baeldung.com/java-memory-leaks)
- 오토 박싱 & 오토 언박싱 ⇒ [**링크**](https://gyoogle.dev/blog/computer-language/Java/Auto%20Boxing%20&%20Unboxing.html)

# ✏공부 내용 정리

---

## 1. String 대신 StringBuilder나 StringBuffer 사용하기

String 사용을 남발하면서 String + String 을 하는 것으로 인해 발생하는 생기는 문제이다.

```java
String resultStr = new String();
resultStr += "String test";
```

- resultStr String 변수의 메모리가 아니라 새로운 객체와 메모리를 할당하게 된다.
- 만약에 문자열과 문자열을 더하는 연산을 반복해서 한다고 하면,
  반복문 횟수 만큼 객체가 생성되는 것이다.
  ⇒ 이전에 있던 객체는 필요 없는 쓰레기 값이 되어 GC 대상이 되어 버린다.

- 직접 코드 작성해서 성능 비교해보기

    ```java
    @State(Scope.Thread)
    @BenchmarkMode(Mode.AverageTime)
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    public class TestClass {
    
        String aValue = "abcde";
    
        @Benchmark
        @OperationsPerInvocation(10000)
        public String strTest() {
            String a = new String();
            for (int loop = 0; loop < 10000; loop++) {
                a += aValue;
            }
    
            return a;
        }
    
        @Benchmark
        @OperationsPerInvocation(10000)
        public String stringBuilderTest() {
            StringBuilder stringBuilder = new StringBuilder();
            for (int loop = 0; loop < 10000; loop++) {
                stringBuilder.append(aValue);
            }
    
            return stringBuilder.toString();
        }
    
        @Benchmark
        @OperationsPerInvocation(10000)
        public String stringBufferTest() {
            StringBuffer stringBuffer = new StringBuffer();
    
            for (int loop = 0; loop < 10000; loop++) {
                stringBuffer.append(aValue);
            }
            String temp2 = stringBuffer.toString();
    
            return stringBuffer.toString();
        }
    
        public static void main(String[] args) throws RunnerException {
            Options opt = new OptionsBuilder()
                    .include(TestClass.class.getSimpleName())
                    .forks(1)
                    .build();
    
            new Runner(opt).run();
        }
    }
    ```

  <자바 성능 튜닝 이야기> 책에 나오는 JMH를 사용해, 성능 테스트를 직접 진행해 봤습니다.

  코드는 책의 예제와 JMH의 샘플 코드를 참고해서 작성했습니다.

  실행 결과는 아래와 같습니다.

  ![성능테스트.JPG](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0c6f82b2-acd8-4ea8-8d38-e63d1683d0ca/%EC%84%B1%EB%8A%A5%ED%85%8C%EC%8A%A4%ED%8A%B8.jpg)

    - TestClass.strTest ⇒ 문자열 변수에 “abcd” 문자열을 더하는 연산 테스트
    - TestClass.stringBufferTest ⇒ StringBuffer에 “abcd” 문자열을 append 하는 테스트
    - TestClass.stringBuilderTest ⇒ StrinbBuilder에 “abcd” 문자열을 append 하는 테스트

  StringBuilder를 사용 한 것이 문자열을 각각 더한 것보다 약 300배 넘는 성능 차이를 보였다.


## 2. 오토박싱

- 오토박싱은 프로그래머가 기본 타입과 박싱된 기본 타입을 섞어 쓸 때
  자동으로 상호 변환해주는 기술이다.
- 오토박싱은 기본 타입과 그에 대응하는 박싱된 기본 타입의 구분을 흐려주지만,
  완전히 없애주는 것은 아니다.

```java
private static long sum() {
	Long sum = 0L;
	for (long i = 0; i <= Integer.MAX_VALUE; i++) {
		sum += i;
	}
	return sum;
}
```

- sum 변수를 long이 아닌 Long으로 선언해서 불필요한 Long 인스턴스가 약 231개나 만들어진 것이다.
- 박싱된 기본 타입보다는 기본 타입을 사용하고, 의도치 않은 오토박싱이 숨어들지 않도록 주의

- **이론은 봤으니 직접 코드 작성해서 성능 비교해보기**

  ### 오토박싱 연산

    ```java
    public static void main(String[] args) {
    	long start = System.nanoTime();
    	Long sum = 0L;
    	for (long i = 0; i < 1000000; i++) {
    	  sum += i;
    	}
    	System.out.println("실행 시간 : " + (System.nanoTime() - start));
    }
    ```

  ![Long.JPG](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/beddb66e-2b39-4e4b-b640-e6c7d60002be/Long.jpg)

  약 14ms 정도의 시간이 걸렸다.

  ### 동일 타입 연산

    ```java
    public static void main(String[] args) {
    	long start = System.nanoTime();
    	long sum = 0;
    	  for (long i = 0; i < 1000000; i++) {
    	  sum += i;
    	}
    	System.out.println("실행 시간 : " + (System.nanoTime() - start));
    }
    ```

  ![longNum.JPG](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c6952a85-c3a2-4718-931f-a217f023485c/longNum.jpg)

  약 2ms 정도의 시간이 걸렸다.

    - 문자 하나 차이로 성능의 차이가 눈에 확 보이게 된다.
    - 아무리 CPU의 성능이 좋아졌다고 해도 작은 것부터 성능 최적화에 신경 쓰자.
        - 위와 같은 성능 이슈가 있는 코드가 적으면 모르겠지만,
          코드가 쌓이고 쌓일수록 성능에는 악영향을 줄 것이다.


### 3. GC 튜닝을 하면 덜 작동하지 않을까?

- ‘[**GC가 돌면 어떤 일이 벌어지나요?**](https://www.notion.so/GC-445ed53b3a254486b7490f0bcf9240e0)’ 에도 작성했지만 성능 최적화는 아직 GC에 대한 이해가 부족해서 고려하지는 않았습니다.
- GC 튜닝에 대한 글을 읽어보면서 느낀 점을 적어봤습니다.
    - A라는 서비스에서 GC옵션을 잘 적용해서 잘 작동한다고 해도,
      다른 서비스에서도 훌륭하게 적용되어 최적화의 효과를 볼 수 있다고 생각하지 말자.
      ⇒ 각 서비스마다 환경이 다르다. 그래서 해당 서비스에 맞게 GC 튜닝을 지속적으로 모니터링 하면서 진행해야 한다.
    - 기본적인 메모리 크기 정도만 지정하면 웬만큼 사용량이 많지 않은 시스템에서는 튜닝을 할 필요가 없다.


결론적은 정답처럼 최적화된 GC 튜닝은 옵션은 없다.

GC 튜닝 옵션은 해당 환경에 맞게 진행 하면서 지속적으로 모니터링 하는 것이다.

- ❓ 그렇다면 내가 지금 알아야 할 것은?
    - GC튜닝 옵션과 옵션 변경 방법
        - 주의해야 할 옵션
    - GC 모니터링 하는 방법
        - 모니터링 툴 직접 설치하고 사용해보기

# 공부하면서 느낀 점

---

- String과 String을 더하는 연산은 메모리 누수의 원인이라는 얘기는 들었었다.
  하지만 직접 공부해보고 StringBuilder보다 수십배 차이가 난다는 것은 충격적이었다.
- 예전에는 성능이나 여러 예제가 나오면 그냥 읽고 넘어간 적이 많았다.
  이번에는 직접 코드를 작성해보면서 성능 체크를 해보니 기억에 더 잘 남고 와 닿았다.
- 책을 읽을 때 앞 부분부터 내용을 정리하면서 읽었었다.
  이번에 ‘자바 성능 튜닝 이야기’ 는 궁금한 내용과 연결되는 내용을 찾아서 읽고 내용을 정리했다.
    - 책을 처음부터 끝까지 읽는 것도 좋지만, 기억에 남지 않았다.
      시간 대비 효율이 너무 적었다.
      전부 다 읽기가 좋기는 하겠지만, 필요한 부분을 읽고 요약하는 방식이 지금은 맞는 것 같다.