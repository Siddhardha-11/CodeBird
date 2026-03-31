import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';
import QuestionCard from '../components/Questions/QuestionCard.jsx';
import { getSavedIdea, saveAnswers } from '../lib/codebird.js';

const Questions = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clarityScore, setClarityScore] = useState(0);
  const navigate = useNavigate();

  const idea = getSavedIdea();

  // Fetch questions from backend based on user idea
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!idea || idea.trim().length === 0) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5050/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea: idea.trim() })
        });

        if (!response.ok) {
          throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);
        setClarityScore(data.clarityScore || 5);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [idea, navigate]);

  const current = questions[index];

  const handleSelect = (option) => {
    if (!current) return;

    const newAnswers = { ...answers, [current.id]: option };
    setAnswers(newAnswers);

    if (index < questions.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 200);
    } else {
      saveAnswers(newAnswers);
      navigate('/ide');
    }
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-300 mb-2">Analyzing your idea...</p>
            <p className="text-slate-500 text-sm">Getting AI to ask the right questions</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!current) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-red-800 bg-red-900/20 p-6 text-center">
            <p className="text-red-400 mb-4">Failed to generate AI questions. {error && `Error: ${error}`}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold rounded-lg transition-smooth"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {/* Current Idea */}
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-left">
          <div className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-300">Your Idea</div>
          <p className="text-sm leading-6 text-slate-300">{idea}</p>
          {clarityScore && (
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center space-x-2">
              <span className="text-xs text-slate-400">Clarity Score:</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    clarityScore >= 7 ? 'bg-green-500' : 
                    clarityScore >= 5 ? 'bg-yellow-500' : 
                    'bg-orange-500'
                  }`}
                  style={{ width: `${clarityScore * 10}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{clarityScore}/10</span>
            </div>
          )}
        </div>

        {/* Questions Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-2">
            A few clarifying questions
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            These questions are AI-generated based on your idea.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 text-center text-xs text-slate-500">
            Question {index + 1} of {questions.length}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-300"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={current}
          onSelect={handleSelect}
          onBack={goBack}
          showBack={index > 0}
        />
      </div>
    </MainLayout>
  );
};

export default Questions;
