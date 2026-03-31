import React, { useRef, useState } from 'react';

const VoiceInput = ({ onTranscript }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef(null);

  const start = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support voice input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true; // Enable interim results for live transcription

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    
    recognition.onresult = (e) => {
      let interim = '';
      let finalText = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        
        if (e.results[i].isFinal) {
          finalText += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (finalText.trim()) {
        setFinalTranscript(prev => prev + finalText);
      }

      const combined = finalText.trim() || interim;
      if (combined) {
        setTranscript(finalText.trim() || interim);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggle = () => {
    if (listening) {
      stop();
      return;
    }
    setFinalTranscript('');
    setTranscript('');
    setInterimTranscript('');
    start();
  };

  const useTranscript = () => {
    const fullText = finalTranscript.trim() || transcript.trim();
    if (fullText) {
      if (onTranscript) {
        onTranscript(fullText);
      }
      // Reset after using
      setTranscript('');
      setFinalTranscript('');
      setInterimTranscript('');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    if (onTranscript) {
      onTranscript('');
    }
  };

  const displayText = finalTranscript.trim() || interimTranscript || transcript;

  return (
    <div className="space-y-3">
      {/* Microphone Button */}
      <button
        type="button"
        onClick={toggle}
        className={`w-full py-3 md:py-4 rounded-2xl border font-medium text-sm md:text-base flex items-center justify-center space-x-3 transition-smooth relative overflow-hidden group ${
          listening
            ? 'border-rose-400 bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-100 shadow-lg shadow-rose-500/30 animate-glow'
            : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-100 backdrop-blur-sm'
        }`}
      >
        {listening && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-400/5 to-rose-500/10 animate-gradient" />
        )}
        
        <span className="relative z-10 flex items-center space-x-3">
          {/* Animated mic icon */}
          <div className={`relative transition-smooth ${listening ? 'scale-110' : ''}`}>
            {listening && (
              <>
                <div className="absolute inset-0 rounded-full animate-pulse-ring bg-rose-400" />
                <div className="absolute inset-0 rounded-full animate-pulse-ring bg-rose-400" style={{ animationDelay: '0.3s' }} />
              </>
            )}
            <svg
              className={`w-5 h-5 relative z-10 transition-smooth ${
                listening ? 'fill-rose-400 text-rose-400' : 'text-slate-300'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.77 2.36-2.26 0-4.29-.9-5.77-2.36l-1.1 1.1c1.86 1.86 4.41 3 7.07 3 2.66 0 5.21-1.14 7.07-3l-1.1-1.1zM12 19c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1z" />
            </svg>
          </div>
          
          <span className="relative z-10">
            {listening ? (
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Listening...
              </span>
            ) : (
              'Tap to speak'
            )}
          </span>
        </span>
      </button>

      {/* Language selection (only when not listening) */}
      {!listening && (
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex-1 py-2 px-3 text-xs md:text-sm rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-smooth"
          >
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="es-ES">🇪🇸 Español</option>
            <option value="fr-FR">🇫🇷 Français</option>
            <option value="de-DE">🇩🇪 Deutsch</option>
            <option value="it-IT">🇮🇹 Italiano</option>
            <option value="ja-JP">🇯🇵 日本語</option>
            <option value="zh-CN">🇨🇳 中文</option>
          </select>
        </div>
      )}

      {/* Live Transcript Display - while speaking and after */}
      {(displayText || listening) && (
        <div className="animate-fadeInUp">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/50 border border-slate-700 rounded-2xl p-4 md:p-5 backdrop-blur-sm relative overflow-hidden">
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-smooth ${
              listening ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-transparent' : 'bg-gradient-to-r from-sky-500 via-sky-400 to-transparent'
            }`} />
            
            <div className="text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className={`w-4 h-4 transition-smooth ${listening ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span className={`text-xs font-semibold tracking-wider uppercase transition-smooth ${
                    listening ? 'text-rose-400' : 'text-sky-400'
                  }`}>
                    {listening ? 'Live Transcription' : 'Captured from voice'}
                  </span>
                </div>
                {displayText && (
                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-smooth"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Final text + Interim text */}
              <div className="space-y-2">
                {finalTranscript && (
                  <p className="text-sm md:text-base text-slate-100 leading-relaxed">
                    {finalTranscript.trim()}
                  </p>
                )}
                {interimTranscript && (
                  <p className="text-sm md:text-base text-slate-400 italic leading-relaxed">
                    {interimTranscript}
                    <span className="animate-pulse">...</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              {displayText && !listening && (
                <div className="flex gap-2 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={useTranscript}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-900 text-sm font-semibold rounded-lg transition-smooth flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>Use This Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFinalTranscript('');
                      setInterimTranscript('');
                      setTranscript('');
                      start();
                    }}
                    className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold rounded-lg transition-smooth flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 12a8 8 0 018-8v4l6-6-6-6v4a8 8 0 100 16z" />
                    </svg>
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-center text-xs text-slate-500 py-2">
        🎤 Speak clearly • Text updates live as you speak
      </div>
    </div>
  );
};

export default VoiceInput;
