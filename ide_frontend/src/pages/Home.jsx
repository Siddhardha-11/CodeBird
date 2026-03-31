import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import IdeaInput from '../components/IdeaInput/IdeaInput.jsx';
import VoiceInput from '../components/IdeaInput/VoiceInput.jsx';
import { getSavedIdea } from '../lib/codebird.js';

const Home = () => {
  const [idea, setIdea] = useState(getSavedIdea());
  const [inputMode, setInputMode] = useState('text');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowForm(true), 200);
  }, []);

  return (
    <MainLayout>
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10">
        {/* Main content grid */}
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* Left Column - Introduction */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="animate-slideInDown">
              <div className="inline-flex items-center rounded-full border border-sky-400/50 bg-sky-400/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-sky-200 backdrop-blur-sm transition-smooth hover:border-sky-400 hover:bg-sky-400/20">
                ✨ From idea to working starter
              </div>
            </div>

            {/* Heading and description */}
            <div className="space-y-6 animate-fadeInUp">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                  Turn Your Ideas Into
                  <span className="block bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 bg-clip-text text-transparent">
                    Living Code
                  </span>
                </h1>
                <p className="max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
                  Describe your vision in plain words, answer a few thoughtful questions, and step into a fully generated workspace with starter files, preview notes, and a clear build direction.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                {[
                  { step: '01', label: 'Capture the idea', icon: '💡' },
                  { step: '02', label: 'Refine the direction', icon: '🎯' },
                  { step: '03', label: 'Open the workspace', icon: '🚀' },
                ].map((item, idx) => (
                  <div
                    key={item.step}
                    className="group relative animate-fadeInUp rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-4 backdrop-blur-sm transition-smooth hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                    <div className="relative space-y-2">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="mb-2 text-xs font-semibold tracking-[0.3em] text-sky-300">{item.step}</div>
                      <div className="text-sm font-medium text-slate-200">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Input Form */}
          <div
            className={`rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-6 md:p-8 shadow-2xl shadow-sky-950/30 backdrop-blur-lg transition-smooth ${
              showForm ? 'animate-fadeInUp' : 'opacity-0'
            }`}
          >
            {/* Header with toggle */}
            <div className="mb-6 space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Start Here</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Choose your way to describe your idea
                </p>
              </div>

              {/* Input mode toggle */}
              <div className="flex gap-2 rounded-xl bg-slate-800/50 p-1 border border-slate-700">
                {[
                  { mode: 'text', icon: '✍️', label: 'Type' },
                  { mode: 'voice', icon: '🎤', label: 'Speak' },
                ].map((btn) => (
                  <button
                    key={btn.mode}
                    onClick={() => setInputMode(btn.mode)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-smooth flex items-center justify-center space-x-2 ${
                      inputMode === btn.mode
                        ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input content */}
            <div className="space-y-4">
              {inputMode === 'text' && (
                <div className="animate-fadeInUp">
                  <IdeaInput idea={idea} setIdea={setIdea} />
                </div>
              )}

              {inputMode === 'voice' && (
                <div className="animate-fadeInUp">
                  <VoiceInput onTranscript={setIdea} />
                </div>
              )}

              {/* Additional input hint */}
              {idea.trim() && (
                <div className="animate-fadeInUp p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 text-center">
                  {idea.length} characters • Ready to transform your idea ✨
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom decoration */}
        <div className="mt-16 text-center animate-fadeInUp">
          <p className="text-slate-500 text-sm">
            💫 Powered by AI • Try it now • No sign-up required
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
