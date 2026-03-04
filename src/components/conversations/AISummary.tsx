interface AISummaryProps {
  summary: string;
}

export function AISummary({ summary }: AISummaryProps) {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résumé IA</label>
        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded font-bold">AUTO</span>
      </div>
      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
        <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
