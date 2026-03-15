import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveIdea } from '../../lib/codebird.js';

const IdeaInput = ({ idea, setIdea }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    saveIdea(idea.trim());
    setTimeout(() => {
      setLoading(false);
      navigate('/questions');
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Example: I want a simple inventory app for my shop to track stock and sales."
        className="w-full h-40 md:h-48 bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 text-slate-100 placeholder:text-slate-500 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      />

      <button
        type="submit"
        disabled={!idea.trim() || loading}
        className="w-full py-4 md:py-5 text-lg font-semibold rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <span>Generate App</span>
          </>
        )}
      </button>
    </form>
  );
};

export default IdeaInput;
