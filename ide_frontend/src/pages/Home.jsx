import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';
import IdeaInput from '../components/IdeaInput/IdeaInput.jsx';
import VoiceInput from '../components/IdeaInput/VoiceInput.jsx';
import { clearHomeDraftIdea, getHomeDraftIdea, saveHomeDraftIdea, saveIdea } from '../lib/codebird.js';

const STEPS = [
  { step: '01', label: 'Capture the idea', icon: '💡' },
  { step: '02', label: 'Refine the direction', icon: '🎯' },
  { step: '03', label: 'Open the workspace', icon: '🚀' },
];

function Home() {
  const [textIdea, setTextIdea] = useState(getHomeDraftIdea());
  const [voiceIdea, setVoiceIdea] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [showForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const activeIdea = inputMode === 'text' ? textIdea : voiceIdea;
  const isReady = activeIdea.trim().length >= 10;

  const handleTextIdeaChange = (value) => {
    setTextIdea(value);
    saveHomeDraftIdea(value);
  };

  const handleContinue = () => {
    if (!isReady) {
      return;
    }

    setLoading(true);
    saveIdea(activeIdea.trim());
    clearHomeDraftIdea();
    setTextIdea('');
    setVoiceIdea('');

    window.setTimeout(() => {
      navigate('/questions');
    }, 350);
  };

  return (
    <MainLayout fullWidth>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-96 w-96 rounded-full bg-sky-400/5 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[1520px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-sky-200 backdrop-blur-sm">
                From idea to working starter
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] text-white md:text-5xl lg:text-6xl">
                  Turn Your Ideas Into
                  <span className="block bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 bg-clip-text pb-1 text-transparent">
                    Living Code
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                  Describe your vision in plain words, answer a few thoughtful questions, and step
                  into a generated workspace with starter files, preview notes, and a clear build
                  direction.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="group relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-4 backdrop-blur-sm transition hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="relative space-y-2">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">
                        {item.step}
                      </div>
                      <div className="text-sm font-medium text-slate-200">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-lg md:p-8 ${
              showForm ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="mb-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">Start Here</h2>
                <p className="mt-2 text-sm text-slate-400">Choose how you want to describe your idea</p>
              </div>

              <div className="flex gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-1">
                {[
                  { mode: 'text', label: '✍️  Type' },
                  { mode: 'voice', label: '🎤  Speak' },
                ].map((button) => (
                  <button
                    key={button.mode}
                    type="button"
                    onClick={() => setInputMode(button.mode)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      inputMode === button.mode
                        ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {inputMode === 'text' ? (
                <IdeaInput idea={textIdea} setIdea={handleTextIdeaChange} />
              ) : (
                <VoiceInput value={voiceIdea} setValue={setVoiceIdea} />
              )}

              {activeIdea.trim() ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-center text-xs text-sky-200">
                  {activeIdea.trim().length} characters • Ready to transform your idea ✨
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!isReady || loading}
                className={`w-full rounded-2xl py-4 text-lg font-semibold transition ${
                  isReady && !loading
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-slate-900 shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-sky-500'
                    : 'cursor-not-allowed bg-slate-700 text-slate-500'
                }`}
              >
                {loading ? 'Preparing questions...' : '→ Generate App'}
              </button>

              {inputMode === 'text' ? (
                <div className="text-center text-xs text-slate-500">
                  Tip: The more details you provide, the better your results will be.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm text-slate-500">Powered by AI • Try it now • No sign-up required</p>
        </div>
      </section>
    </MainLayout>
  );
}

export default Home;
