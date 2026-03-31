import { useRef, useState } from 'react';

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'es-ES', label: 'Spanish' },
];

const VoiceInput = ({ value, setValue }) => {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const shouldContinueRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input is not available in this browser. Please switch to typing.');
      return;
    }

    setError('');
    setInterimTranscript('');
    setValue('');
    shouldContinueRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      setInterimTranscript('');

      if (shouldContinueRef.current) {
        restartTimeoutRef.current = window.setTimeout(() => {
          try {
            recognition.start();
          } catch {
            setError('Voice input paused unexpectedly. Please tap Start recording again.');
            shouldContinueRef.current = false;
          }
        }, 150);
      }
    };
    recognition.onerror = (event) => {
      const code = event?.error || '';

      if (code === 'aborted') {
        return;
      }

      if (code === 'no-speech' && value.trim()) {
        return;
      }

      setListening(false);
      setInterimTranscript('');
      shouldContinueRef.current = false;
      setError('Voice capture stopped before finishing. Please tap Start recording again.');
    };

    recognition.onresult = (event) => {
      const finalParts = [];
      let liveText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalParts.push(transcript.trim());
        } else {
          liveText += transcript;
        }
      }

      if (finalParts.length) {
        setValue((current) => [current, ...finalParts].filter(Boolean).join(' ').trim());
      }

      setInterimTranscript(liveText.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    shouldContinueRef.current = false;
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    recognitionRef.current?.stop();
  };

  const toggle = () => {
    if (listening) {
      stop();
      return;
    }

    start();
  };

  const clear = () => {
    shouldContinueRef.current = false;
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    setInterimTranscript('');
    setValue('');
    setError('');
  };

  const characterCount = value.trim().length;
  const displayValue = [value, interimTranscript].filter(Boolean).join(value && interimTranscript ? ' ' : '');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={toggle}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            listening
              ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30'
              : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
          }`}
        >
          {listening ? 'Stop recording' : 'Start recording'}
        </button>
      </div>

      <div className="rounded-[26px] border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-200">
              {listening ? 'Listening now' : 'Voice notes'}
            </div>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              Speak naturally. You can edit the text below after speaking.
            </p>
          </div>

          {(value.trim() || interimTranscript) ? (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-slate-400 transition hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>

        <textarea
          value={displayValue}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Your spoken text will appear here, and you can edit it directly."
          className="mt-4 min-h-32 w-full rounded-2xl border border-slate-800 bg-[#0b1220] px-4 py-3 text-sm leading-7 text-slate-300 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{listening ? 'Listening continuously. Pause or tap stop when you are done.' : 'Edit the text if needed before continuing.'}</span>
          <span>{characterCount} chars</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
