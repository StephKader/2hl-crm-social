"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MOCK_USERS } from "@/lib/mock-data";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Paramètres</h2>
        <p className="text-slate-500 mt-1">Configuration de votre espace 2HL CRM.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex flex-wrap gap-1">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="channels">Canaux</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
            <div>
              <Label>Logo de l&apos;entreprise</Label>
              <div className="mt-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">cloud_upload</span>
                <p className="text-sm text-slate-500 mt-2">Glissez-déposez ou cliquez pour uploader</p>
                <p className="text-xs text-slate-400">PNG, JPG ou SVG. Max 2MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de l&apos;entreprise</Label>
                <Input defaultValue="2HL Group" className="mt-1" />
              </div>
              <div>
                <Label>Couleur principale</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="size-10 rounded-lg bg-primary border border-slate-200"></div>
                  <Input defaultValue="#2563eb" className="flex-1" />
                </div>
              </div>
            </div>
            <div>
              <Label>Fuseau horaire</Label>
              <select className="w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3">
                <option>Africa/Ouagadougou (GMT+0)</option>
                <option>Europe/Paris (GMT+1)</option>
                <option>Africa/Abidjan (GMT+0)</option>
              </select>
            </div>
            <Button className="bg-primary text-white" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Membres de l&apos;équipe</h3>
              <Button className="bg-primary text-white text-sm" onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
                <span className="material-symbols-outlined text-lg mr-1">person_add</span>
                Ajouter
              </Button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Membre</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            {u.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-bold">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          u.role === "admin" ? "bg-purple-100 text-purple-600" :
                          u.role === "patron" ? "bg-blue-100 text-blue-600" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Switch defaultChecked={u.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 text-slate-400 hover:text-primary" onClick={() => toast.info("Modification — fonctionnalité bientôt disponible")}>
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Channels */}
        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "WhatsApp", icon: "chat", bgClass: "bg-green-100 dark:bg-green-900/30 text-green-600", connected: true, account: "+226 70 XX XX XX" },
              { name: "Messenger", icon: "message", bgClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600", connected: true, account: "Page 2HL Group" },
              { name: "Commentaires FB", icon: "comment", bgClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600", connected: false, account: "" },
            ].map((channel) => (
              <div key={channel.name} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`size-10 rounded-lg flex items-center justify-center ${channel.bgClass}`}>
                    <span className="material-symbols-outlined">{channel.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{channel.name}</h4>
                    <span className={`text-xs font-bold ${channel.connected ? "text-green-500" : "text-slate-400"}`}>
                      {channel.connected ? "Connecté" : "Déconnecté"}
                    </span>
                  </div>
                </div>
                {channel.connected && (
                  <p className="text-sm text-slate-500 mb-4">{channel.account}</p>
                )}
                <Button variant={channel.connected ? "outline" : "default"} className="w-full text-sm" onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
                  {channel.connected ? "Reconfigurer" : "Connecter"}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Notifications par email</p>
                <p className="text-xs text-slate-500">Recevoir un email pour chaque nouvelle conversation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Notifications push navigateur</p>
                <p className="text-xs text-slate-500">Alertes en temps réel dans le navigateur</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Label>Seuil d&apos;alerte &quot;sans réponse&quot; (minutes)</Label>
              <Input type="number" defaultValue="15" className="mt-1 max-w-[100px]" />
              <p className="text-xs text-slate-400 mt-1">Alerte quand une conversation est sans réponse depuis ce délai</p>
            </div>
            <Button className="bg-primary text-white" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
          </div>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Résumés automatiques</p>
                <p className="text-xs text-slate-500">Générer un résumé IA pour chaque conversation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Détection d&apos;intention</p>
                <p className="text-xs text-slate-500">Catégoriser automatiquement les conversations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Suggestions d&apos;action</p>
                <p className="text-xs text-slate-500">Proposer des actions à entreprendre</p>
              </div>
              <Switch />
            </div>
            <Button className="bg-primary text-white" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
          </div>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h4 className="font-bold text-sm mb-2">Export des données</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="text-sm" onClick={() => toast.info("Export — fonctionnalité bientôt disponible")}>
                  <span className="material-symbols-outlined text-lg mr-1">download</span>
                  Exporter en CSV
                </Button>
                <Button variant="outline" className="text-sm" onClick={() => toast.info("Sauvegarde — fonctionnalité bientôt disponible")}>
                  <span className="material-symbols-outlined text-lg mr-1">backup</span>
                  Sauvegarde manuelle
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Label>Politique de rétention (mois)</Label>
              <Input type="number" defaultValue="12" className="mt-1 max-w-[100px]" />
              <p className="text-xs text-slate-400 mt-1">Supprimer automatiquement les conversations plus anciennes que ce délai</p>
            </div>
            <Button className="bg-primary text-white" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
