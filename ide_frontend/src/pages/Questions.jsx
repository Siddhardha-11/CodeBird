import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';
import QuestionCard from '../components/Questions/QuestionCard.jsx';
import { getSavedIdea, saveAnswers } from '../lib/codebird.js';

const QUESTIONS = [
  {
    id: 1,
    text: 'What type of app do you want?',
    options: [
      'Inventory / stock tracking',
      'Customer booking system',
      'Simple website',
      'Task / checklist app',
      'Something else'
    ]
  },
  {
    id: 2,
    text: 'Who will mainly use this app?',
    options: [
      'Only me',
      'My team / staff',
      'My customers',
      'Public users',
      'Not sure yet'
    ]
  },
  {
    id: 3,
    text: 'Where should it work best?',
    options: [
      'On mobile phones',
      'On computers',
      'On tablets',
      'All devices',
      'Not important'
    ]
  }
];

const Questions = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const current = QUESTIONS[index];
  const idea = getSavedIdea();

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [current.id]: option };
    setAnswers(newAnswers);

    if (index < QUESTIONS.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 200);
    } else {
      saveAnswers(newAnswers);
      navigate('/ide');
    }
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-left">
          <div className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-300">Current Idea</div>
          <p className="text-sm leading-6 text-slate-300">{idea}</p>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-2">
            A few quick questions
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            This helps CodeBird generate the right structure for your app.
          </p>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-center text-xs text-slate-500">
            Question {index + 1} of {QUESTIONS.length}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-300"
              style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

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
