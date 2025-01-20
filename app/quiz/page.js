"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(15).fill(null)); // Track answered state
  const [visitedQuestions, setVisitedQuestions] = useState(new Array(15).fill(false)); // Track visited state
  const [timer, setTimer] = useState(1800); // 30 minutes timer (1800 seconds)
  const router = useRouter();

  // Fetch questions from the API
  useEffect(() => {
    const fetchQuestions = async () => {
        try {
          const response = await fetch(
            "https://opentdb.com/api.php?amount=15&type=multiple"
          );
          if (response.status === 429) {
            console.log("Rate limit exceeded. Retrying after a delay...");
            setTimeout(fetchQuestions, 5000); // Retry after 5 seconds
          } else {
            const data = await response.json();
            setQuestions(data.results);
          }
        } catch (error) {
          console.error("Failed to fetch questions:", error);
        }
      };
      

    fetchQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer === 0) {
      handleSubmit();
    }

    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleAnswerSelect = (questionIndex, answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answer;
    setUserAnswers(updatedAnswers);

    // Mark the question as visited and answered
    const updatedVisited = [...visitedQuestions];
    updatedVisited[questionIndex] = true;
    setVisitedQuestions(updatedVisited);
  };

  const handleNavigation = (index) => {
    setCurrentQuestion(index);

    // Mark the question as visited when navigating
    const updatedVisited = [...visitedQuestions];
    updatedVisited[index] = true;
    setVisitedQuestions(updatedVisited);
  };

  const handleSubmit = () => {
    // Prepare the answers data to be passed to the report page
    const answersData = questions.map((question, index) => ({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswer: question.correct_answer,
    }));
  
    // Serialize and encode the data to pass in the URL
    const encodedData = encodeURIComponent(JSON.stringify(answersData));
  
    // Redirect to the report page with encoded data in the URL
    router.push(`/report?data=${encodedData}`);
  };

  if (!questions || questions.length === 0) return (
    <div className="flex justify-center items-center h-screen">
      <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
    </div>
  );

  const question = questions[currentQuestion];
  const options = [...question.incorrect_answers, question.correct_answer];

  // Identify unvisited and visited but not attempted questions
  const unvisitedQuestions = visitedQuestions
    .map((visited, index) => (visited ? null : index + 1))
    .filter((x) => x !== null);

  const visitedButNotAttempted = visitedQuestions
    .map((visited, index) =>
      visited && userAnswers[index] === null ? index + 1 : null
    )
    .filter((x) => x !== null);

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-6">
        {/* Left Side (Quiz Section) */}
        <div className="flex-3 w-2/3">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-bold">Time: {Math.floor(timer / 60)}:{timer % 60}</div>
              <div className="text-xl font-bold">Question {currentQuestion + 1}/15</div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">{question.question}</h2>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full p-3 text-left border rounded-md ${
                    userAnswers[currentQuestion] === option
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => handleNavigation(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Previous
            </button>
            <button
              onClick={() => handleNavigation(currentQuestion + 1)}
              disabled={currentQuestion === 14}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Next
            </button>
          </div>

          {/* Question Navigation Panel */}
          <div className="mt-6">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 15 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(index)}
                  className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                    currentQuestion === index ? "bg-blue-500 text-white" : "bg-transparent"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button Below Navigation Panel */}
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="w-1/3 p-2 bg-blue-500 text-white rounded-md"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Right Side (Overview Panel) */}
        <div className="flex-1 w-1/6 bg-gray-100 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 15 }, (_, index) => (
              <div
                key={index}
                className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                  userAnswers[index]
                    ? "bg-green-500 text-white"
                    : visitedQuestions[index] && userAnswers[index] === null
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* New Section for Unvisited and Visited but Not Attempted */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Unvisited Questions</h2>
            <div className="grid grid-cols-5 gap-2">
              {unvisitedQuestions.length > 0 ? (
                unvisitedQuestions.map((question) => (
                  <div
                    key={question}
                    className="w-10 h-10 flex items-center justify-center border rounded-md bg-gray-300 text-black"
                  >
                    {question}
                  </div>
                ))
              ) : (
                <p>No unvisited questions</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Visited but Not Attempted</h2>
            <div className="grid grid-cols-5 gap-2">
              {visitedButNotAttempted.length > 0 ? (
                visitedButNotAttempted.map((question) => (
                  <div
                    key={question}
                    className="w-10 h-10 flex items-center justify-center border rounded-md bg-blue-400 text-white"
                  >
                    {question}
                  </div>
                ))
              ) : (
                <p> </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
