import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { textContent } = await req.json();
    if (!textContent) {
      return NextResponse.json(
        { error: "No text content provided" },
        { status: 400 }
      );
    }

    console.log("텍스트 내용 길이:", textContent.length);
    console.log("API 요청 시작...");

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "API 키가 구성되지 않았습니다." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", //gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content: `당신은 초간결 요약 전문가입니다. 다음 규칙을 절대적으로 따르세요:
        
        1. 최대 3문장. 절대 이 제한을 넘지 마세요. 3문장 이상은 실패입니다.
        2. 원본의 핵심만 포함하고 모든 부가 설명은 제거하세요.
        3. 최대 3개의 글머리 기호만 사용하세요. 각 글머리 기호는 1문장으로 제한합니다.
        4. 비속어는 @@@로 대체하세요.
        5. 시간 정보(날짜, 시간대, 몇 시부터 몇 시까지 등)는 모두 제거하세요.
        
        출력 형식 (정확히 이 형식만 사용):
        [1-3문장 요약]
        
        - 최종정리: [전체 내용을 단 한 문장으로 요약]
        
        주의: 시간, 날짜 등의 정보는 절대 포함하지 마시고 응답은 반드시 3문장과 3개의 글머리 기호로 제한하세요. 더 길면 실패로 간주됩니다.`,
          },
          {
            role: "user",
            content: `다음 텍스트를 시간 정보 없이 3문장 이내로 요약하고, 최종정리를 1문장으로 작성하세요: ${textContent}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
      }),
    });

    console.log("API 응답 상태:", response.status);

    if (!response.ok) {
      // 오류 세부 정보 확인
      const errorData = await response
        .json()
        .catch((e) => ({ error: "응답을 파싱할 수 없음" }));
      console.error("OpenAI API 오류:", JSON.stringify(errorData));

      return NextResponse.json(
        {
          error: "OpenAI API 오류",
          details: errorData,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      summary: data.choices[0].message.content,
    });
  } catch (e) {
    console.log("요약본 생성오류", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
