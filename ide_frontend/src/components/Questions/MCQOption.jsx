import { useState } from 'react';

const MCQOption = ({ label, onClick }) => {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    onClick();
    window.setTimeout(() => setPressed(false), 150);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition sm:px-6 sm:py-5 ${
        pressed
          ? 'border-sky-400 bg-sky-400/10 text-sky-100'
          : 'border-slate-800 bg-slate-900/70 text-slate-100 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <span className="pr-4 text-sm font-medium leading-7 sm:text-base">{label}</span>
      <span className="text-slate-500">&gt;</span>
    </button>
  );
};

export default MCQOption;
