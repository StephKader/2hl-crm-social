"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f6f6f8] dark:bg-[#111621]">
      {/* Logo Section */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">2HL GROUP</h2>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">
            Bienvenue sur 2HL CRM
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</Label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                Se souvenir de moi
              </span>
            </label>
            <a className="text-sm font-medium text-primary hover:underline underline-offset-4" href="#" onClick={(e) => { e.preventDefault(); toast.info("Fonctionnalité bientôt disponible"); }}>
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] h-auto"
          >
            Se connecter
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vous n&apos;avez pas de compte ?{" "}
            <a className="text-primary font-semibold hover:underline underline-offset-4 ml-1" href="#" onClick={(e) => { e.preventDefault(); toast.info("Fonctionnalité bientôt disponible"); }}>
              Créer un accès
            </a>
          </p>
        </div>
      </div>

      {/* Social Footer */}
      <div className="mt-12 flex gap-6 text-slate-400 dark:text-slate-500">
        <a className="hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold" href="#" onClick={(e) => { e.preventDefault(); toast.info("Fonctionnalité bientôt disponible"); }}>
          Aide
        </a>
        <a className="hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold" href="#" onClick={(e) => { e.preventDefault(); toast.info("Fonctionnalité bientôt disponible"); }}>
          Confidentialité
        </a>
        <a className="hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold" href="#" onClick={(e) => { e.preventDefault(); toast.info("Fonctionnalité bientôt disponible"); }}>
          Conditions
        </a>
      </div>
    </div>
  );
}
