export function EmptyState() {
  return (
    <div className="flex-1 bg-[#f6f6f8] dark:bg-[#111621] flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <span className="material-symbols-outlined text-5xl">forum</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Sélectionnez une conversation</h2>
        <p className="text-slate-500 mb-8">
          Choisissez une conversation dans la liste pour commencer à répondre. Tous les messages de vos canaux sociaux sont synchronisés ici.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-xl">chat</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-400">WhatsApp</p>
              <p className="text-sm font-bold">12 Active</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-xl">message</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-400">Messenger</p>
              <p className="text-sm font-bold">8 Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
