import React, { useState } from 'react';

const MCQOption = ({ label, onClick }) => {
  const [selected, setSelected] = useState(false);

  const handle = () => {
    setSelected(true);
    onClick();
    setTimeout(() => setSelected(false), 150);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={`w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-2xl border transition
        ${selected
          ? 'border-sky-400 bg-sky-500/10 text-sky-100'
          : 'border-slate-700 bg-slate-800 hover:border-sky-400 hover:bg-slate-700 text-slate-100'
        }`}
    >
      {label}
    </button>
  );
};

export default MCQOption;
