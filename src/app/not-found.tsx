import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <div className="size-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary">explore_off</span>
        </div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">Page introuvable</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
