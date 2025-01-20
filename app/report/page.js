"use client";

import { useSearchParams } from "next/navigation";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  if (!dataParam) {
    return <div>No data found!</div>;
  }

  // Decode and parse the answers data
  const answersData = JSON.parse(decodeURIComponent(dataParam));

  // Calculate the total score
  const totalScore = answersData.reduce((score, answer) => {
    return answer.userAnswer === answer.correctAnswer ? score + 1 : score;
  }, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz Report</h1>
      <h2 className="text-xl font-semibold mb-4">
        Your Score: {totalScore} / 15
      </h2>
      <div className="space-y-4">
        {answersData.map((answer, index) => (
          <div key={index} className="p-4 border rounded-md bg-gray-100">
            <h2 className="text-lg font-semibold">Question {index + 1}</h2>
            <p className="text-gray-700">
              <span className="font-semibold">Question:</span> {answer.question}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Your Answer:</span>{" "}
              {answer.userAnswer || "Not Answered"}
            </p>
            <p
              className={`${
                answer.userAnswer === answer.correctAnswer
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span className="font-semibold">Correct Answer:</span>{" "}
              {answer.correctAnswer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
