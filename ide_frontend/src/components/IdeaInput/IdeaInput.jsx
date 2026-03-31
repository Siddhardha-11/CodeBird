import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveIdea } from '../../lib/codebird.js';

const IdeaInput = ({ idea, setIdea }) => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
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

  const characterCount = idea.length;
  const minCharacters = 10;
  const isValid = idea.trim().length >= minCharacters;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        {/* Animated background glow */}
        {focused && (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-sky-400/10 to-sky-500/20 rounded-2xl blur-xl animate-pulse" />
        )}
        
        {/* Textarea container */}
        <div className={`relative transition-smooth ${focused ? 'transform scale-105' : ''}`}>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Example: I want a simple inventory app for my shop to track stock and sales."
            className={`w-full h-40 md:h-48 bg-slate-800/50 border rounded-2xl p-4 md:p-6 text-slate-100 placeholder:text-slate-500 text-base md:text-lg focus:outline-none focus:ring-2 transition-smooth backdrop-blur-sm ${
              focused
                ? 'border-sky-400 ring-2 ring-sky-400/50'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          />
          
          {/* Character count */}
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
            {characterCount} characters
          </div>
        </div>
      </div>

      {/* Info text */}
      <p className={`text-sm transition-smooth ${
        isValid ? 'text-slate-400' : 'text-amber-500/70'
      }`}>
        {isValid ? '✓ Ready to generate!' : `Please enter at least ${minCharacters} characters to continue`}
      </p>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className={`w-full py-4 md:py-5 text-lg font-semibold rounded-2xl transition-smooth flex items-center justify-center space-x-2 relative overflow-hidden group ${
          isValid && !loading
            ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/70 cursor-pointer transform hover:-translate-y-0.5'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        {/* Shimmer effect */}
        {isValid && !loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
        )}
        
        <span className="relative z-10">
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin inline-block mr-2" />
              Thinking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Generate App
            </>
          )}
        </span>
      </button>

      {/* Tip message */}
      <div className="text-center text-xs text-slate-500 pt-2">
        💡 Tip: The more details you provide, the better your results will be!
      </div>
    </form>
  );
};

export default IdeaInput;
