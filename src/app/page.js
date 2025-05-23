"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) {
      setError("텍스트를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textContent: inputText }),
      });

      if (!response.ok) {
        throw new Error("요약 생성 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || "요약을 생성하는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
          <span className="text-xl font-semibold">| 텍스트 요약기</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <label className="block mb-2 font-medium">요약할 텍스트</label>
            <textarea
              className="flex-1 w-full p-4 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[300px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="요약할 텍스트를 여기에 붙여넣으세요..."
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "요약 중..." : "텍스트 요약하기"}
            </button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </form>
        </div>

        <div className="flex-1">
          <div className="h-full flex flex-col">
            <h2 className="mb-2 font-medium">요약 결과</h2>
            <div className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:text-white overflow-auto min-h-[300px]">
              {summary ? (
                <div className="whitespace-pre-line">{summary}</div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500">
                  {isLoading
                    ? "요약을 생성하는 중입니다..."
                    : "왼쪽에 텍스트를 입력하고 '텍스트 요약하기' 버튼을 클릭하세요."}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 텍스트 요약 서비스</p>
      </footer>
    </div>
  );
}
