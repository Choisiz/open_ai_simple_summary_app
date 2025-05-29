"use client";

import { useState } from "react";

export default function Home() {
  const [meetingText, setMeetingText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [similarSummaries, setSimilarSummaries] = useState([]); // 🆕 추가
  const [searchLoading, setSearchLoading] = useState(false); // 🆕 추가

  // 🆕 유사한 과거 요약찾기
  const searchSimilar = async (text) => {
    setSearchLoading(true);
    try {
      const response = await fetch("/api/search-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, limit: 3 }),
      });

      const data = await response.json();
      console.log("dd", data);
      setSimilarSummaries(data.result || []);
    } catch (error) {
      console.error("검색 오류:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!meetingText.trim()) {
      alert("회의 내용을 입력해주세요!");
      return;
    }

    setLoading(true);

    await searchSimilar(meetingText);

    //AI 요약 결과
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textContent: meetingText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "요약 생성 실패");
      }

      setSummary(data.summary);
    } catch (error) {
      alert("오류: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 기존 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 AI 회의록 요약기
          </h1>
          <p className="text-gray-600 mt-2">
            긴 회의 내용을 핵심만 뽑아 정리하고, 과거 유사한 회의도 찾아드립니다
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🆕 유사한 과거 요약 (새로 추가) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🔍 유사한 과거 요약
            </h2>

            {searchLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : similarSummaries.length > 0 ? (
              <div className="space-y-4">
                {similarSummaries.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-blue-400 pl-4"
                  >
                    <div className="text-sm text-gray-500 mb-1">
                      {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        유사도: {Math.round(item.similarity * 100)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {item.summary}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                텍스트를 입력하면
                <br />
                유사한 과거 요약을 찾아드립니다
              </p>
            )}
          </div>

          {/* 기존 입력 영역 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📝 회의 내용 입력
            </h2>

            <textarea
              value={meetingText}
              onChange={(e) => setMeetingText(e.target.value)}
              placeholder="회의 내용을 붙여넣어 주세요..."
              className="w-full h-80 p-4 text-gray-800 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={handleSummarize}
              disabled={loading || !meetingText.trim()}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "🤔 AI가 요약 중..." : "✨ AI로 요약하기"}
            </button>
          </div>

          {/* 기존 결과 영역 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📊 AI 요약 결과
            </h2>

            {summary ? (
              <div className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                  {summary}
                </pre>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-center">
                  회의 내용을 입력하고
                  <br />
                  요약 버튼을 눌러주세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
