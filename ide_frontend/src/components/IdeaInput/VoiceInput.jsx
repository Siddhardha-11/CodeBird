import React, { useRef, useState } from 'react';

const VoiceInput = ({ onTranscript }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const start = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support voice input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
      if (onTranscript) {
        onTranscript(text.trim());
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

    start();
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggle}
        className={`w-full py-3 md:py-4 rounded-2xl border text-sm md:text-base flex items-center justify-center space-x-2 transition ${
          listening
            ? 'border-rose-400 bg-rose-500/10 text-rose-100'
            : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100'
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-current" />
        <span>{listening ? 'Listening... tap to stop' : 'Use voice instead of typing'}</span>
      </button>

      {transcript && (
        <div className="text-left text-sm text-slate-400 bg-slate-900/60 border border-slate-700 rounded-xl p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Captured from voice
          </div>
          <div>{transcript}</div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
