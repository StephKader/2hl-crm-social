"use client";

import { useState } from "react";
import { useLabels } from "@/hooks/useLabels";
import { DEFAULT_INTENTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [intentions] = useState(DEFAULT_INTENTIONS);
  const { labels, isLoading: labelsLoading, mutate: mutateLabels } = useLabels();
  const [newLabel, setNewLabel] = useState("");

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;
    try {
      const res = await fetch('/api/chatwoot/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newLabel.trim() }),
      });
      if (!res.ok) throw new Error('Erreur');
      setNewLabel("");
      mutateLabels();
      toast.success("Label créé");
    } catch {
      toast.error("Erreur lors de la création du label");
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Catégories & Intentions</h2>
        <p className="text-slate-500 mt-1">Gérez les intentions et labels pour catégoriser vos conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intentions Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">category</span>
              Intentions
            </h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white text-sm">
                  <span className="material-symbols-outlined text-lg mr-1">add</span>
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle intention</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nom</Label>
                    <Input placeholder="Ex: Demande de devis" className="mt-1" />
                  </div>
                  <div>
                    <Label>Couleur</Label>
                    <div className="flex gap-2 mt-1">
                      {["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#6b7280"].map((color) => (
                        <button
                          key={color}
                          className="size-8 rounded-full border-2 border-transparent hover:border-slate-400 transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Description de l'intention..." className="mt-1" />
                  </div>
                  <Button className="w-full bg-primary text-white" onClick={() => toast.success("Intention créée (démo)")}>Créer l&apos;intention</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {intentions.map((intention) => (
              <div key={intention.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-4 rounded-full" style={{ backgroundColor: intention.color }}></div>
                  <div>
                    <p className="text-sm font-bold">{intention.name}</p>
                    <p className="text-xs text-slate-500">{intention.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => toast.info("Modification — fonctionnalité bientôt disponible")}>
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" onClick={() => toast.info("Suppression — fonctionnalité bientôt disponible")}>
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Labels Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">label</span>
            Labels
          </h3>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {labelsLoading ? (
              <p className="text-sm text-slate-400">Chargement...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${label.color}15`, color: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-xs text-slate-400">Nouveau label</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Nom du label"
                  className="flex-1 text-sm"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                />
                <Button variant="outline" size="sm" onClick={handleAddLabel}>
                  <span className="material-symbols-outlined text-lg">add</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
