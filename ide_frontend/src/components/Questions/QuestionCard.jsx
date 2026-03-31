import MCQOption from './MCQOption.jsx';

const QuestionCard = ({ question, onSelect, onBack, showBack }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-5 md:p-7 space-y-5">
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-slate-100 mb-1">
          {question.text}
        </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <MCQOption key={opt} label={opt} onClick={() => onSelect(opt)} />
        ))}
      </div>

      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Previous question
        </button>
      )}
    </div>
  );
};

export default QuestionCard;
