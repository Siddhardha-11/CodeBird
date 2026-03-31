import MCQOption from './MCQOption.jsx';

const QuestionCard = ({ question, onSelect, onBack, showBack }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 sm:p-7">
        <div className="text-xs uppercase tracking-[0.22em] text-sky-200">Current question</div>
        <h3 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {question.text}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Choose the option that matches best right now.
        </p>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <MCQOption key={option} label={option} onClick={() => onSelect(option)} />
        ))}
      </div>

      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          Previous question
        </button>
      ) : null}
    </div>
  );
};

export default QuestionCard;
