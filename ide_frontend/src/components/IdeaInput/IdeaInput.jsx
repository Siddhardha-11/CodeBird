const IdeaInput = ({ idea, setIdea }) => {
  const characters = idea.trim().length;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="idea-input" className="text-sm font-medium text-slate-200">
          Describe the app
        </label>
        <textarea
          id="idea-input"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: I want a simple inventory app for my shop so I can track stock, record sales, and know what needs restocking."
          className="mt-3 h-48 w-full rounded-[26px] border border-slate-800 bg-slate-900/90 px-5 py-4 text-base leading-7 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>A good prompt usually mentions the user, the problem, and the main outcome.</span>
        <span>{characters} chars</span>
      </div>
    </div>
  );
};

export default IdeaInput;
