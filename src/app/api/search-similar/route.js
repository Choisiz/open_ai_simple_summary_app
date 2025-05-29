import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query, limit = 3 } = await req.json();
    if (!query) {
      return NextResponse.json(
        { error: "검색어가 필요합니다." },
        { status: 400 }
      );
    }
    const embeddingResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: query,
        }),
      }
    );
    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    const { data, error } = await supabase.rpc("match_summaries", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // 70% 이상 유사한 것만
      match_count: limit,
    });

    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json({ result: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error("검색 오류:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
