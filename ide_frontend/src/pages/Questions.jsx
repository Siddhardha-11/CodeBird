import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';
import QuestionCard from '../components/Questions/QuestionCard.jsx';
import { generateNextQuestion, getSavedIdea, saveAnswers } from '../lib/codebird.js';

const FINAL_LOADER_MESSAGES = [
  'Understanding your idea...',
  'Shaping the starter structure...',
  'Opening your workspace...',
];

function Questions() {
  const [index, setIndex] = useState(0);
  const [questionFlow, setQuestionFlow] = useState([]);
  const [answerMap, setAnswerMap] = useState({});
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [loadWarning, setLoadWarning] = useState('');
  const navigate = useNavigate();

  const idea = getSavedIdea();
  const totalQuestions = 3;
  const currentQuestion = questionFlow[index];

  const answeredItems = useMemo(
    () =>
      questionFlow
        .map((question) => ({
          id: question.id,
          field: question.field,
          text: question.text,
          answer: answerMap[question.id] || '',
        }))
        .filter((item) => item.answer),
    [answerMap, questionFlow]
  );

  const progress = useMemo(() => ((index + 1) / totalQuestions) * 100, [index]);

  const requestQuestion = async (historyItems, nextIndex, phase = 'initial') => {
    if (phase === 'initial') {
      setIsLoadingQuestion(true);
    } else {
      setIsLoadingNext(true);
    }

    setLoadError('');

    try {
      const result = await generateNextQuestion(idea, historyItems);

      setQuestionFlow((current) => {
        const nextFlow = [...current];
        nextFlow[nextIndex] = result.question;
        return nextFlow;
      });

      setIndex(nextIndex);
      setLoadWarning(result.source === 'fallback' ? result.warning || 'Using local smart fallback questions.' : '');
    } catch (error) {
      setLoadError(error.message || 'Unable to prepare the next question.');
    } finally {
      if (phase === 'initial') {
        setIsLoadingQuestion(false);
      } else {
        setIsLoadingNext(false);
      }
    }
  };

  useEffect(() => {
    requestQuestion([], 0, 'initial');
  }, []);

  const handleSelect = async (option) => {
    if (!currentQuestion) {
      return;
    }

    const nextAnswerMap = {
      ...answerMap,
      [currentQuestion.id]: option,
    };

    setAnswerMap(nextAnswerMap);

    const nextAnsweredItems = questionFlow
      .slice(0, index + 1)
      .map((question) => ({
        id: question.id,
        field: question.field,
        text: question.text,
        answer: question.id === currentQuestion.id ? option : nextAnswerMap[question.id] || '',
      }))
      .filter((item) => item.answer);

    if (nextAnsweredItems.length >= totalQuestions) {
      saveAnswers({ items: nextAnsweredItems });
      setIsFinishing(true);
      setLoaderStep(0);
      window.setTimeout(() => setLoaderStep(1), 500);
      window.setTimeout(() => setLoaderStep(2), 1000);
      window.setTimeout(() => navigate('/ide'), 1500);
      return;
    }

    const nextIndex = index + 1;

    if (questionFlow[nextIndex]) {
      setIndex(nextIndex);
      return;
    }

    await requestQuestion(nextAnsweredItems, nextIndex, 'next');
  };

  const goBack = () => {
    if (index > 0 && !isLoadingNext && !isFinishing) {
      setIndex((value) => value - 1);
    }
  };

  if (isFinishing) {
    return (
      <MainLayout fullWidth>
        <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-slate-950/70 p-8 text-center shadow-2xl shadow-sky-950/20 backdrop-blur">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
            <h1 className="text-3xl font-semibold text-white">Getting your IDE ready</h1>
            <p className="mt-3 text-slate-400">
              We are turning your answers into a starter workspace.
            </p>

            <div className="mt-8 space-y-3 text-left">
              {FINAL_LOADER_MESSAGES.map((message, messageIndex) => (
                <div
                  key={message}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    messageIndex <= loaderStep
                      ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                      : 'border-slate-800 bg-slate-900/70 text-slate-500'
                  }`}
                >
                  {message}
                </div>
              ))}
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (isLoadingQuestion && !currentQuestion) {
    return (
      <MainLayout fullWidth>
        <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-slate-950/70 p-8 text-center shadow-2xl shadow-sky-950/20 backdrop-blur">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
            <h1 className="text-3xl font-semibold text-white">Preparing your questions</h1>
            <p className="mt-3 text-slate-400">
              We are shaping the first question around your idea.
            </p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <MainLayout fullWidth>
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center px-5 py-10">
          <div className="w-full rounded-[32px] border border-slate-800 bg-slate-950/70 p-8 text-center shadow-2xl shadow-sky-950/20 backdrop-blur">
            <h1 className="text-3xl font-semibold text-white">Could not load questions</h1>
            <p className="mt-3 text-slate-400">
              {loadError || 'Something went wrong while preparing the questions.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Try again
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout fullWidth>
      <section className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 rounded-[30px] border border-slate-800 bg-slate-900/70 p-5 backdrop-blur">
          <div className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-300">Current idea</div>
          <p className="text-sm leading-7 text-slate-300">{idea}</p>
          <p className={`mt-3 text-xs ${loadWarning ? 'text-amber-300' : 'text-sky-300'}`}>
            {loadWarning || 'Questions are being tailored step by step from your idea and previous answers.'}
          </p>
        </div>

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-slate-100 md:text-4xl">
            A few smart questions before we open the workspace
          </h2>
          <p className="text-sm text-slate-400 md:text-base">
            Each next question adapts to what you picked before, so the starter app is shaped more carefully.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <div className="mb-2 text-center text-xs text-slate-500">
              Question {index + 1} of {totalQuestions}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <aside className="space-y-4 rounded-[30px] border border-slate-800 bg-slate-950/55 p-5 backdrop-blur">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-sky-300">Question strategy</div>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  We are narrowing the app step by step so the IDE can start with a more useful structure.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-sky-300">Your selected answers</div>
                <div className="mt-3 space-y-3">
                  {answeredItems.length ? (
                    answeredItems.map((item) => (
                      <div key={`${item.id}-${item.field}`} className="rounded-2xl border border-slate-800 bg-[#0f1729] px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Answer {item.id}</div>
                        <div className="mt-2 text-sm font-medium text-slate-200">{item.answer}</div>
                        <div className="mt-1 text-xs leading-6 text-slate-500">{item.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-800 px-4 py-5 text-sm text-slate-500">
                      Your first answer will appear here.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <div className="rounded-[30px] border border-slate-800 bg-slate-950/55 p-4 backdrop-blur sm:p-6">
              {isLoadingNext ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-slate-800 bg-slate-900/70 p-8 text-center">
                  <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
                  <h3 className="text-2xl font-semibold text-white">Preparing the next question</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                    We are using your previous answer to ask something more relevant next.
                  </p>
                </div>
              ) : (
                <QuestionCard
                  question={currentQuestion}
                  onSelect={handleSelect}
                  onBack={goBack}
                  showBack={index > 0}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Questions;
