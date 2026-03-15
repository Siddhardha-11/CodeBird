import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import IdeaInput from '../components/IdeaInput/IdeaInput.jsx';
import VoiceInput from '../components/IdeaInput/VoiceInput.jsx';
import { getSavedIdea } from '../lib/codebird.js';

const Home = () => {
  const [idea, setIdea] = useState(getSavedIdea());

  return (
    <MainLayout>
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-sky-200">
            From idea to working starter
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
              CodeBird turns rough product ideas into a cleaner app blueprint.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Describe your idea in plain words, answer a few quick questions, and step into a generated workspace with starter files, preview notes, and a build direction.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Capture the idea'],
              ['02', 'Refine the direction'],
              ['03', 'Open the workspace'],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-2 text-xs font-semibold tracking-[0.3em] text-sky-300">{step}</div>
                <div className="text-sm text-slate-200">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-sky-950/30 backdrop-blur">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Start with your idea</h2>
            <p className="mt-1 text-sm text-slate-400">
              We will keep it simple and turn it into a project structure you can keep improving.
            </p>
          </div>

          <div className="space-y-4">
            <IdeaInput idea={idea} setIdea={setIdea} />
            <VoiceInput onTranscript={setIdea} />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
