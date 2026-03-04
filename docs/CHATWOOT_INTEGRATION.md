# Guide d'intégration Chatwoot — 2HL CRM Social

> Document technique pour le branchement du frontend Next.js sur Chatwoot (backend).
> Dernière mise à jour : Mars 2026

---

## Table des matières

1. [Architecture](#1-architecture)
2. [Variables d'environnement](#2-variables-denvironnement)
3. [Authentification](#3-authentification)
4. [Mapping des modèles de données](#4-mapping-des-modèles-de-données)
5. [Couche API (Service Layer)](#5-couche-api-service-layer)
6. [Plan d'intégration page par page](#6-plan-dintégration-page-par-page)
7. [Intégration WebSocket (temps réel)](#7-intégration-websocket-temps-réel)
8. [Stratégie de migration par phases](#8-stratégie-de-migration-par-phases)
9. [Gestion d'erreurs](#9-gestion-derreurs)
10. [Annexes](#10-annexes)

---

## 1. Architecture

### Vue d'ensemble

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌──────────────────┐
│   Next.js Frontend  │     │  Next.js API Routes      │     │  Chatwoot API    │
│   (React 19 + TS)   │────>│  /api/chatwoot/*         │────>│  /api/v1/...     │
│                     │     │  (Proxy sécurisé)        │     │                  │
│   Tailwind + shadcn │<────│  Transforme les réponses │<────│  REST + WS       │
└────────┬────────────┘     └──────────────────────────┘     └──────────────────┘
         │
         │  WebSocket direct (ActionCable)
         └──────────────────────────────────────────────────>  wss://<domain>/cable
```

### Pourquoi un proxy (API Routes) ?

1. **Sécurité** : Le `api_access_token` Chatwoot reste côté serveur, jamais exposé au navigateur
2. **Normalisation** : Les réponses Chatwoot sont transformées vers les types TypeScript de l'app
3. **CORS** : Pas de problème de cross-origin, le frontend appelle son propre domaine
4. **Cache** : Possibilité d'ajouter un cache serveur (Redis, in-memory) sans modifier le frontend

### Trois canaux de communication

| Canal | Usage | Direction |
|-------|-------|-----------|
| **REST** (via Route Handlers) | CRUD conversations, contacts, messages, labels | Frontend → Next.js → Chatwoot |
| **WebSocket** (ActionCable) | Messages temps réel, typing, présence agents | Chatwoot → Frontend (direct) |
| **Webhooks** (optionnel) | Événements serveur (nouveau contact, SLA) | Chatwoot → Next.js Route Handler |

### Nouveaux fichiers à créer

```
src/
├── lib/
│   └── chatwoot/
│       ├── client.ts          # Wrapper HTTP (fetch/axios) avec injection token
│       ├── types.ts           # Types bruts des réponses Chatwoot
│       ├── transformers.ts    # Fonctions Chatwoot → App types
│       └── websocket.ts       # Client ActionCable + reconnexion
├── app/
│   └── api/
│       └── chatwoot/
│           ├── auth/route.ts           # POST /auth/sign_in
│           ├── conversations/
│           │   ├── route.ts            # GET (list), POST (create)
│           │   └── [id]/
│           │       ├── route.ts        # GET (detail), PUT (update)
│           │       └── messages/route.ts # GET (list), POST (send)
│           ├── contacts/
│           │   ├── route.ts            # GET (list), POST (create)
│           │   ├── [id]/route.ts       # GET, PUT
│           │   └── search/route.ts     # GET (recherche)
│           ├── agents/route.ts         # GET (list)
│           ├── labels/route.ts         # GET, POST, DELETE
│           ├── inboxes/route.ts        # GET (channels)
│           └── reports/route.ts        # GET (métriques)
├── hooks/
│   ├── useChatwootWebSocket.ts  # Hook WebSocket
│   ├── useConversations.ts      # Hook liste conversations
│   ├── useConversation.ts       # Hook détail + messages
│   ├── useContacts.ts           # Hook contacts
│   ├── useAgents.ts             # Hook agents
│   ├── useLabels.ts             # Hook labels
│   └── useDashboardMetrics.ts   # Hook métriques dashboard
└── middleware.ts                 # Protection routes (app)
```

---

## 2. Variables d'environnement

### Template `.env.local`

```env
# ── Chatwoot (server-side uniquement) ──
CHATWOOT_BASE_URL=https://chatwoot.2hlgroup.com
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_ADMIN_TOKEN=your_admin_api_access_token_here

# ── Session ──
NEXTAUTH_SECRET=random_32_char_string_for_session_encryption
NEXTAUTH_URL=http://localhost:3000

# ── Client-side (préfixe NEXT_PUBLIC_) ──
NEXT_PUBLIC_WS_URL=wss://chatwoot.2hlgroup.com/cable
NEXT_PUBLIC_APP_NAME=2HL CRM Social
```

### Détails des variables

| Variable | Requis | Portée | Description |
|----------|--------|--------|-------------|
| `CHATWOOT_BASE_URL` | Oui | Server | URL de l'instance Chatwoot (sans `/` final) |
| `CHATWOOT_ACCOUNT_ID` | Oui | Server | ID du compte dans Chatwoot |
| `CHATWOOT_ADMIN_TOKEN` | Oui | Server | Token API admin (Settings > Account > API Token). Utilisé pour les opérations serveur (lister agents, rapports) |
| `NEXTAUTH_SECRET` | Oui | Server | Clé de chiffrement des cookies de session |
| `NEXTAUTH_URL` | Oui | Server | URL de base de l'application |
| `NEXT_PUBLIC_WS_URL` | Oui | Client | URL WebSocket pour la connexion ActionCable côté navigateur |
| `NEXT_PUBLIC_APP_NAME` | Non | Client | Nom affiché dans l'UI (défaut : "2HL CRM Social") |

> **Sécurité** : Les variables sans `NEXT_PUBLIC_` ne sont JAMAIS exposées au navigateur. Le `CHATWOOT_ADMIN_TOKEN` ne doit jamais apparaître côté client.

### Différence entre tokens

| Token | Obtenu via | Usage |
|-------|-----------|-------|
| **Admin Token** (`CHATWOOT_ADMIN_TOKEN`) | Paramètres Chatwoot > Profil > Access Token | Opérations serveur : lister agents, rapports, gestion labels |
| **Agent Token** (par session) | Réponse de `POST /auth/sign_in` | Opérations spécifiques à l'agent connecté : conversations, messages |
| **PubSub Token** (par session) | Réponse de `POST /auth/sign_in` | Connexion WebSocket pour les événements temps réel |

---

## 3. Authentification

### État actuel

**Fichier** : `src/contexts/AuthContext.tsx`

L'authentification actuelle est un simulateur de rôles :
- `MOCK_USERS` contient 5 utilisateurs hardcodés
- `setRole()` bascule entre patron/commercial/admin
- Pas de vrai login, pas de middleware, pas de session

### Flux d'authentification cible

```
1. Utilisateur entre email + mot de passe sur /login
                    │
2. Client POST → /api/chatwoot/auth
                    │
3. Route Handler → POST https://<CHATWOOT_BASE_URL>/auth/sign_in
                    │  Body: { email, password }
                    │
4. Chatwoot retourne:
   {
     "data": {
       "access_token": "agent_token_abc123",
       "account_id": 1,
       "pubsub_token": "ws_token_xyz789",
       "name": "Aminata Diallo",
       "email": "aminata@2hlgroup.com",
       "role": "administrator",
       "avatar_url": "...",
       "custom_attributes": { "crm_role": "patron" }
     }
   }
                    │
5. Route Handler crée un cookie HTTP-only chiffré contenant:
   - access_token (pour les appels API agent)
   - pubsub_token (pour le WebSocket)
   - account_id
   - user info (name, email, role)
                    │
6. Client reçoit le profil utilisateur → stocké dans AuthContext
                    │
7. Redirect vers /dashboard
```

### Nouveau AuthContext

```typescript
// Nouvelle interface (remplace l'actuelle)
interface AuthContextType {
  user: User | null;          // null si non connecté
  isLoading: boolean;         // true pendant la vérification de session
  pubsubToken: string | null; // pour le WebSocket
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthorized: (roles: Role[]) => boolean;
}
```

**Changements par rapport à l'actuel** :
- Suppression de `setRole()` (plus de démo)
- Ajout de `login()` et `logout()` asynchrones
- Ajout de `isLoading` pour le skeleton pendant la vérification de session
- `user` peut être `null` (non connecté)
- Ajout de `pubsubToken` pour l'initialisation WebSocket

### Mapping des rôles

Chatwoot n'a que 2 rôles natifs : `agent` et `administrator`. L'app en a 3 : `patron`, `commercial`, `admin`.

**Solution recommandée** : Utiliser un `custom_attribute` sur l'agent Chatwoot.

| Chatwoot `role` | Chatwoot `custom_attributes.crm_role` | App `Role` |
|-----------------|---------------------------------------|------------|
| `administrator` | `"admin"` | `admin` |
| `administrator` | `"patron"` (ou absent) | `patron` |
| `agent` | — | `commercial` |

**Fonction de mapping** :
```typescript
function mapChatwootRole(agent: ChatwootAgent): Role {
  if (agent.role === "administrator") {
    return agent.custom_attributes?.crm_role === "admin" ? "admin" : "patron";
  }
  return "commercial";
}
```

### Middleware de protection

**Fichier à créer** : `src/middleware.ts`

```typescript
// Protège toutes les routes (app)/*
// Redirige vers /login si pas de session valide
// Vérifie l'expiration du token
export const config = {
  matcher: ["/(app)/:path*", "/dashboard/:path*", "/conversations/:path*",
            "/contacts/:path*", "/categories/:path*", "/reports/:path*", "/settings/:path*"],
};
```

### Modification de la page Login

**Fichier** : `src/app/login/page.tsx`

- Actuellement : `handleSubmit` fait simplement `router.push("/dashboard")`
- Cible : appeler `login(email, password)` depuis AuthContext, gérer les erreurs (credentials invalides, réseau), afficher loading state sur le bouton

---

## 4. Mapping des modèles de données

> Section clé — chaque champ est documenté avec sa transformation.

### 4.1 User ↔ Chatwoot Agent

**Fichier app** : `src/lib/types.ts` (lignes 11-18)

| Champ App (`User`) | Type | Champ Chatwoot (`Agent`) | Transformation |
|---------------------|------|--------------------------|----------------|
| `id` | `string` | `id: number` | `String(agent.id)` |
| `name` | `string` | `name: string` | Direct |
| `email` | `string` | `email: string` | Direct |
| `role` | `Role` | `role: "agent" \| "administrator"` | Voir mapping rôles §3 |
| `avatarUrl` | `string?` | `thumbnail: string` | Renommer champ |
| `isActive` | `boolean` | `availability_status: "online" \| "offline" \| "busy"` | `status !== "offline"` |

**Transformer** :
```typescript
function transformAgent(agent: ChatwootAgent): User {
  return {
    id: String(agent.id),
    name: agent.name,
    email: agent.email,
    role: mapChatwootRole(agent),
    avatarUrl: agent.thumbnail || undefined,
    isActive: agent.availability_status !== "offline",
  };
}
```

### 4.2 Contact ↔ Chatwoot Contact

**Fichier app** : `src/lib/types.ts` (lignes 34-49)

| Champ App (`Contact`) | Type | Champ Chatwoot | Transformation |
|------------------------|------|----------------|----------------|
| `id` | `string` | `id: number` | `String(contact.id)` |
| `name` | `string` | `name: string` | Direct |
| `phone` | `string` | `phone_number: string` | Renommer |
| `email` | `string?` | `email: string \| null` | `email \|\| undefined` |
| `avatarUrl` | `string?` | `thumbnail: string` | Renommer |
| `company` | `string?` | `custom_attributes.company` | Extraire de custom_attributes |
| `title` | `string?` | `custom_attributes.title` | Extraire de custom_attributes |
| `channels` | `Channel[]` | — | **Dérivé** des inbox du contact (requête séparée) |
| `labels` | `Label[]` | `labels: string[]` | Résoudre noms → objets Label complets |
| `intention` | `Intention?` | `custom_attributes.intention` | Parse objet JSON stocké |
| `assignedTo` | `User?` | — | **Dérivé** de la dernière conversation assignée |
| `conversationCount` | `number` | — | `GET /contacts/{id}/conversations` → count |
| `firstContact` | `string` | `created_at: string` | Formater date ISO → "12 Jan 2025" |
| `lastActivity` | `string` | `last_activity_at: string` | Formater en temps relatif ("il y a 2h") |

**Notes importantes** :
- `channels` n'existe pas directement sur un Contact Chatwoot. Il faut dériver depuis les `contact_inboxes` du contact ou depuis les conversations associées.
- `labels` dans Chatwoot sont des `string[]` (juste les noms). L'app attend des objets `{id, name, color}`. Maintenir un mapping de couleurs dans `constants.ts` ou les stocker comme custom_attributes du compte.
- `intention` n'est pas un concept natif Chatwoot. Stocker comme `custom_attributes.intention` sur le contact ou la conversation.

### 4.3 Conversation ↔ Chatwoot Conversation

**Fichier app** : `src/lib/types.ts` (lignes 67-80)

| Champ App (`Conversation`) | Type | Champ Chatwoot | Transformation |
|-----------------------------|------|----------------|----------------|
| `id` | `string` | `id: number` | `String(conv.id)` |
| `contact` | `Contact` | `meta.sender` | Transformer l'objet sender en Contact |
| `channel` | `Channel` | `inbox_id` → Inbox → `channel_type` | Mapping (voir §4.7) |
| `status` | `ConversationStatus` | `status: "open" \| "resolved" \| "pending"` | `"open"` → `"active"`, ajouter logique `"unattended"` |
| `lastMessage` | `string` | `last_non_activity_message.content` | Direct |
| `lastMessageAt` | `string` | `last_activity_at: string` | Temps relatif ("10:50", "HIER") |
| `unreadCount` | `number` | `unread_count: number` | Direct |
| `assignedTo` | `User?` | `meta.assignee` | Transformer en User |
| `intention` | `Intention?` | `custom_attributes.intention` | Parse JSON |
| `messages` | `Message[]` | Requête séparée : `GET /conversations/{id}/messages` | **Pas inline** — appel API distinct |
| `aiSummary` | `string?` | `custom_attributes.ai_summary` | Custom attribute ou service IA séparé |
| `priority` | `Priority?` | `priority: "none" \| "low" \| "medium" \| "high" \| "urgent"` | `"none"` → `undefined`, `"medium"` → `"normal"` |

**Mapping des statuts** :

| Chatwoot `status` | App `ConversationStatus` | Condition |
|--------------------|--------------------------|-----------|
| `"open"` | `"active"` | Par défaut |
| `"open"` | `"unattended"` | Si `waiting_since` > seuil (15 min) |
| `"pending"` | `"pending"` | Direct |
| `"resolved"` | `"resolved"` | Direct |
| `"snoozed"` | `"pending"` | Fallback vers pending |

### 4.4 Message ↔ Chatwoot Message

**Fichier app** : `src/lib/types.ts` (lignes 51-65)

| Champ App (`Message`) | Type | Champ Chatwoot | Transformation |
|------------------------|------|----------------|----------------|
| `id` | `string` | `id: number` | `String(msg.id)` |
| `type` | `MessageType` | `content_type` + `attachments[0].file_type` | Dériver (voir logique ci-dessous) |
| `content` | `string` | `content: string` | Direct |
| `sender` | `"client" \| "commercial"` | `message_type: 0 \| 1 \| 2` | `0` (incoming) → `"client"`, `1` (outgoing) → `"commercial"` |
| `senderName` | `string` | `sender.name` | Depuis l'objet sender |
| `timestamp` | `string` | `created_at: number` (epoch Unix) | Formater : `new Date(epoch * 1000).toLocaleTimeString("fr-FR")` |
| `status` | `"sent" \| "delivered" \| "read"?` | `status` (sur messages sortants) | Direct pour `message_type === 1` |
| `fileUrl` | `string?` | `attachments[0].data_url` | Premier attachement |
| `fileName` | `string?` | `attachments[0].file_name` | Premier attachement |
| `fileSize` | `string?` | `attachments[0].file_size` | Formater bytes → "1.2 MB" |
| `duration` | `string?` | — | Non disponible nativement (audio) |
| `transcription` | `string?` | — | Service IA séparé |
| `imageUrl` | `string?` | `attachments[0].data_url` si `file_type === "image"` | Conditionnel |

**Logique de dérivation du `type`** :
```typescript
function deriveMessageType(msg: ChatwootMessage): MessageType {
  if (!msg.attachments?.length) return "text";
  const fileType = msg.attachments[0].file_type;
  switch (fileType) {
    case "image": return "image";
    case "audio": return "voice";
    case "video": return "video";
    case "file": return "document";
    default: return "text";
  }
}
```

**Note** : Les messages de type `message_type: 2` (activity) dans Chatwoot sont des messages système (assignation, changement de statut). Ils doivent être filtrés ou affichés différemment.

### 4.5 Label ↔ Chatwoot Label

**Fichier app** : `src/lib/types.ts` (lignes 28-32)

| Champ App (`Label`) | Type | Champ Chatwoot | Transformation |
|----------------------|------|----------------|----------------|
| `id` | `string` | `id: number` | `String(label.id)` |
| `name` | `string` | `title: string` | Renommer |
| `color` | `string` | — | **N'existe pas dans Chatwoot** |

**Problème** : Chatwoot ne stocke pas de couleur sur les labels. Deux solutions :

1. **Maintenir un mapping dans `constants.ts`** (recommandé pour commencer) :
```typescript
const LABEL_COLORS: Record<string, string> = {
  "VIP": "#f59e0b",
  "PME": "#2563eb",
  "Urgent": "#ef4444",
  // ...
};
```

2. **Stocker la couleur dans `description`** du label Chatwoot (hack) ou dans les custom_attributes du compte.

### 4.6 Intention → Chatwoot Custom Attribute

**Fichier app** : `src/lib/types.ts` (lignes 20-26)

Chatwoot n'a **pas de concept natif d'intention**. Deux stratégies :

| Stratégie | Avantages | Inconvénients |
|-----------|-----------|---------------|
| **A. Labels avec préfixe** (`intention:creation`, `intention:fiscal`) | Simple, filtrable | Mélange avec les labels classiques |
| **B. Custom attribute sur Conversation** (recommandé) | Séparation propre, structure riche | Nécessite configuration préalable dans Chatwoot |

**Stratégie B recommandée** :
1. Créer un custom attribute `intention` de type `list` dans Chatwoot (Paramètres > Custom Attributes)
2. Valeurs : `creation`, `fiscal`, `reclamation`, `audit`, `partenariat`, `autre`
3. Conserver le mapping couleur/icône dans `constants.ts` (côté frontend uniquement)
4. Lire/écrire via `conversation.custom_attributes.intention`

### 4.7 Channel ↔ Chatwoot Inbox

**Fichier app** : `src/lib/constants.ts` (lignes 31-35)

| App `Channel` | Chatwoot `channel_type` | Notes |
|---------------|-------------------------|-------|
| `"whatsapp"` | `"Channel::Whatsapp"` | Via Twilio ou 360dialog |
| `"messenger"` | `"Channel::FacebookPage"` | Messages privés via Facebook Page |
| `"facebook"` | `"Channel::FacebookPage"` | Commentaires publics (même type) |

**Fonction de mapping** :
```typescript
function mapInboxToChannel(inbox: ChatwootInbox): Channel {
  switch (inbox.channel_type) {
    case "Channel::Whatsapp": return "whatsapp";
    case "Channel::FacebookPage":
      // Distinguer Messenger des commentaires via le nom ou les settings
      return inbox.name?.toLowerCase().includes("messenger") ? "messenger" : "facebook";
    default: return "messenger"; // fallback
  }
}
```

**Note** : Précharger la liste des inboxes au démarrage et maintenir un cache `inbox_id → Channel` pour éviter des requêtes répétées.

### 4.8 Types non mappés (spécifiques à l'app)

Ces types n'ont pas d'équivalent direct dans Chatwoot et nécessitent une agrégation :

| Type App | Source de données Chatwoot |
|----------|----------------------------|
| `DashboardMetrics` | Agrégation de : `GET /reports` (conversations count, response time) + `GET /conversations?status=open` (count) |
| `AgentPerformance` | `GET /reports?type=agent` par agent |
| `IntentDistribution` | Agrégation des `custom_attributes.intention` sur les conversations |
| `ActivityEvent` | Pas d'équivalent direct. Construire depuis les événements WebSocket ou les messages d'activité récents |
| `InternalNote` | `Messages` avec `private: true` dans Chatwoot |

---

## 5. Couche API (Service Layer)

### 5.1 Client HTTP — `src/lib/chatwoot/client.ts`

```typescript
// Wrapper HTTP pour les appels Chatwoot (côté serveur uniquement)
class ChatwootClient {
  private baseUrl: string;     // CHATWOOT_BASE_URL
  private accountId: string;   // CHATWOOT_ACCOUNT_ID
  private token: string;       // Token admin ou agent selon le contexte

  // Méthodes :
  get<T>(path: string, params?: Record<string, string>): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
  put<T>(path: string, body: unknown): Promise<T>
  delete(path: string): Promise<void>
}
```

- Injection automatique du header `api_access_token`
- Préfixe automatique : `/api/v1/accounts/{account_id}/`
- Gestion des erreurs HTTP (401, 403, 404, 429, 500)
- Logging en développement

### 5.2 Route Handlers Next.js

| Route Next.js | Méthode | Endpoint Chatwoot | Paramètres |
|---------------|---------|-------------------|------------|
| `/api/chatwoot/auth` | POST | `POST /auth/sign_in` | `{ email, password }` |
| `/api/chatwoot/conversations` | GET | `GET /conversations` | `?status=open&page=1&assignee_type=me` |
| `/api/chatwoot/conversations` | POST | `POST /conversations` | `{ contact_id, inbox_id, message }` |
| `/api/chatwoot/conversations/[id]` | GET | `GET /conversations/{id}` | — |
| `/api/chatwoot/conversations/[id]` | PUT | `PUT /conversations/{id}` | `{ status, assignee_id, custom_attributes }` |
| `/api/chatwoot/conversations/[id]/messages` | GET | `GET /conversations/{id}/messages` | `?before=<timestamp>` (pagination) |
| `/api/chatwoot/conversations/[id]/messages` | POST | `POST /conversations/{id}/messages` | `{ content, message_type, private }` |
| `/api/chatwoot/contacts` | GET | `GET /contacts` | `?page=1&sort=name` |
| `/api/chatwoot/contacts/search` | GET | `GET /contacts/search` | `?q=issouf&page=1` |
| `/api/chatwoot/contacts/[id]` | GET | `GET /contacts/{id}` | — |
| `/api/chatwoot/contacts/[id]` | PUT | `PUT /contacts/{id}` | `{ name, email, phone_number, custom_attributes }` |
| `/api/chatwoot/agents` | GET | `GET /agents` | — |
| `/api/chatwoot/labels` | GET | `GET /labels` | — |
| `/api/chatwoot/labels` | POST | `POST /labels` | `{ title }` |
| `/api/chatwoot/inboxes` | GET | `GET /inboxes` | — |
| `/api/chatwoot/reports` | GET | `GET /reports` | `?type=account&since=...&until=...&metric=...` |

### 5.3 Hooks React côté client

| Hook | Paramètres | Données retournées | Source |
|------|------------|-------------------|--------|
| `useConversations(filters)` | `{ status, inbox_id, page }` | `Conversation[]`, pagination | `GET /api/chatwoot/conversations` |
| `useConversation(id)` | `conversationId` | `Conversation` + `Message[]` | `GET .../conversations/{id}` + `GET .../messages` |
| `useContacts(search, page)` | Query string, page | `Contact[]`, pagination | `GET /api/chatwoot/contacts` |
| `useAgents()` | — | `User[]` | `GET /api/chatwoot/agents` |
| `useLabels()` | — | `Label[]` | `GET /api/chatwoot/labels` |
| `useDashboardMetrics(period)` | `"today" \| "week" \| "month"` | `DashboardMetrics` | `GET /api/chatwoot/reports` (agrégé) |
| `useInboxes()` | — | `Inbox[]` (cache) | `GET /api/chatwoot/inboxes` |

**Bibliothèque recommandée** : `SWR` (déjà utilisé dans l'écosystème Next.js) ou `@tanstack/react-query` pour :
- Cache automatique
- Revalidation en arrière-plan
- Déduplication des requêtes
- Pagination / infinite scroll
- Optimistic updates

---

## 6. Plan d'intégration page par page

### 6.1 Login Page

**Fichier** : `src/app/login/page.tsx`

| Actuel | Cible |
|--------|-------|
| `handleSubmit` → `router.push("/dashboard")` | `handleSubmit` → `await login(email, password)` |
| Aucune validation | Validation email/password + gestion erreur 401 |
| Pas de loading | Bouton avec spinner pendant l'auth |

### 6.2 AuthContext

**Fichier** : `src/contexts/AuthContext.tsx`

| Actuel | Cible |
|--------|-------|
| Import `MOCK_USERS` (ligne 5) | Supprimer, remplacer par API |
| `setRole()` pour démo | `login()` / `logout()` asynchrones |
| `useState<Role>("patron")` | `useState<User \| null>(null)` + `isLoading` |
| Pas de vérification session | `useEffect` au mount : vérifier cookie session |

### 6.3 Dashboard Page

**Fichier** : `src/app/(app)/dashboard/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_DASHBOARD_METRICS` | `useDashboardMetrics(period)` → agrège `GET /reports` |
| `MOCK_AGENT_PERFORMANCE` | `useAgents()` + `GET /reports?type=agent` pour stats par agent |
| `MOCK_INTENT_DISTRIBUTION` | Agrégation : compter `custom_attributes.intention` sur les conversations ouvertes |
| `MOCK_ACTIVITY_EVENTS` | Construire depuis les dernières conversations triées par `last_activity_at` |

**Détail des métriques Chatwoot** :

| Métrique App | Endpoint Chatwoot | Paramètre `metric` |
|--------------|-------------------|---------------------|
| `activeConversations` | `GET /conversations?status=open` | Compter le total |
| `newContacts` | `GET /reports?metric=contacts_count` | Sur la période |
| `avgResponseTime` | `GET /reports?metric=avg_first_response_time` | Valeur en secondes → formater |
| `noResponseAlerts` | `GET /conversations?status=open` filtrées par `waiting_since` | Compter > 15 min |

### 6.4 Conversations List

**Fichier** : `src/app/(app)/conversations/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_CONVERSATIONS` (ligne 6) | `useConversations(filters)` |

**Filtres à mapper** :

| Filtre UI | Paramètre Chatwoot |
|-----------|---------------------|
| Canal (WhatsApp/Messenger/Facebook) | `?inbox_id={id}` (résoudre via cache inboxes) |
| Statut (Active/En attente/Résolue/Sans réponse) | `?status=open\|pending\|resolved` |
| Intention | Pas de filtre natif → filtrer côté client après fetch |
| Recherche texte | `?q=searchterm` |
| Assigné à moi | `?assignee_type=me` |

**Pagination** : Chatwoot utilise `?page=1` avec 25 résultats par défaut. Implémenter un infinite scroll ou des boutons page suivante/précédente.

### 6.5 Conversation Detail

**Fichier** : `src/app/(app)/conversations/[id]/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_CONVERSATIONS.find()` (ligne 34) | `useConversation(id)` |
| `AUTO_REPLIES` simulation (lignes 19-25, 67-79) | **Supprimer** — les réponses arrivent via WebSocket |
| `useState<Message[]>(conversation.messages)` (ligne 35) | Messages depuis l'API, mis à jour en temps réel |

**Envoi de message** :
```
Actuel : handleSendMessage → ajoute au state local → simule delivery/read/auto-reply
Cible  : handleSendMessage → POST /conversations/{id}/messages → optimistic update →
         WebSocket reçoit message.created pour confirmation
```

### 6.6 Contacts Page

**Fichier** : `src/app/(app)/contacts/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_CONTACTS` (ligne 4) | `useContacts(search, page)` |
| `saveEdit()` → state local (lignes 40-52) | `PUT /api/chatwoot/contacts/{id}` + revalidation |

**Recherche** : Utiliser `GET /contacts/search?q=...` au lieu du filtre côté client. Debounce de 300ms recommandé.

### 6.7 Reports Page

**Fichier** : `src/app/(app)/reports/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_AGENT_PERFORMANCE` (ligne 9) | `useAgents()` + rapports par agent |
| Données chart hardcodées (lignes 12-53) | `GET /reports` avec paramètres `since`/`until` |

**Métriques Chatwoot disponibles** :

| Métrique | Param `metric` | Usage dans l'app |
|----------|---------------|------------------|
| `conversations_count` | `conversations_count` | Volume de conversations (bar chart) |
| `incoming_messages_count` | `incoming_messages_count` | Messages entrants |
| `outgoing_messages_count` | `outgoing_messages_count` | Messages sortants |
| `avg_first_response_time` | `avg_first_response_time` | Temps de réponse (line chart) |
| `avg_resolution_time` | `avg_resolution_time` | Temps de résolution |
| `resolutions_count` | `resolutions_count` | Conversations résolues |

**Périodes** :

| Bouton UI | Param `since` | Param `until` |
|-----------|--------------|---------------|
| Aujourd'hui | Début du jour (ISO) | Maintenant (ISO) |
| Cette semaine | Lundi de la semaine (ISO) | Maintenant (ISO) |
| Ce mois | 1er du mois (ISO) | Maintenant (ISO) |
| Personnalisé | Date début sélectionnée | Date fin sélectionnée |

### 6.8 Settings Page

**Fichier** : `src/app/(app)/settings/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_USERS` (ligne 9) — onglet Équipe | `useAgents()` |
| Formulaire entreprise — hardcodé | Configurable ou stocké dans les settings du compte Chatwoot |
| Configuration canaux | `useInboxes()` → afficher les inboxes connectées |
| Préférences notifications | **App-specific** — stocker dans localStorage ou une table custom |
| Paramètres IA | **App-specific** — stocker dans localStorage ou config séparée |

### 6.9 Categories Page

**Fichier** : `src/app/(app)/categories/page.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `DEFAULT_INTENTIONS` (constants.ts) | Custom attributes Chatwoot ou config app |
| `DEFAULT_LABELS` (constants.ts) | `useLabels()` → `GET /labels` |

**CRUD Labels** :
- Créer : `POST /api/v1/accounts/{id}/labels` → `{ title }`
- Supprimer : `DELETE /api/v1/accounts/{id}/labels/{label_id}`
- Les couleurs restent gérées côté frontend (mapping dans constants)

### 6.10 Header (recherche globale)

**Fichier** : `src/components/layout/Header.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `MOCK_CONVERSATIONS` (ligne 8) | `GET /api/chatwoot/conversations?q=...` (debounced) |
| `MOCK_CONTACTS` (ligne 8) | `GET /api/chatwoot/contacts/search?q=...` (debounced) |

Implémenter un debounce de 300ms sur la saisie. Appels parallèles conversations + contacts.

### 6.11 CustomerProfile

**Fichier** : `src/components/conversations/CustomerProfile.tsx`

| Import actuel | Remplacer par |
|---------------|---------------|
| `DEFAULT_INTENTIONS` | Custom attributes config |
| `MOCK_INTERNAL_NOTES` | Messages privés : `GET /conversations/{id}/messages` filtré sur `private: true` |

**Créer une note interne** :
```
POST /conversations/{id}/messages
Body: { content: "texte", message_type: "outgoing", private: true }
```

---

## 7. Intégration WebSocket (temps réel)

### Connexion

**Protocole** : ActionCable (Rails WebSocket framework)
**URL** : `wss://<CHATWOOT_BASE_URL>/cable`
**Auth** : PubSub token obtenu lors du login (§3)

```typescript
// Connexion ActionCable
const cable = ActionCable.createConsumer(
  `${NEXT_PUBLIC_WS_URL}?token=${pubsubToken}`
);

// Souscription au canal du compte
cable.subscriptions.create(
  { channel: "RoomChannel", pubsub_token: pubsubToken },
  {
    received(data) {
      // Dispatcher l'événement selon data.event
    }
  }
);
```

### Événements à gérer

| Événement WebSocket | Action dans l'app |
|---------------------|-------------------|
| `message.created` | Si conversation active : ajouter le message à la liste. Sinon : incrémenter `unreadCount` + toast notification |
| `message.updated` | Mettre à jour le statut du message (sent → delivered → read) |
| `conversation.created` | Ajouter en tête de la liste des conversations |
| `conversation.status_changed` | Mettre à jour le badge de statut (active/resolved/pending) |
| `conversation.read` | Remettre `unreadCount` à 0 pour cette conversation |
| `typing_on` | Afficher indicateur "... est en train d'écrire" dans le ChatPanel |
| `typing_off` | Masquer l'indicateur de typing |
| `assignee.changed` | Mettre à jour l'assigné dans la liste + profil |
| `presence.update` | Mettre à jour le statut en ligne des agents (header, sidebar) |
| `contact.updated` | Rafraîchir les données du contact si affiché |

### Hook `useChatwootWebSocket`

```typescript
function useChatwootWebSocket() {
  // 1. Récupère pubsubToken depuis AuthContext
  // 2. Crée la connexion ActionCable au mount
  // 3. Souscrit au canal RoomChannel
  // 4. Dispatch les événements vers un event bus (ou Context)
  // 5. Gère la reconnexion automatique avec backoff exponentiel
  // 6. Cleanup (unsubscribe + disconnect) au unmount

  return {
    isConnected: boolean;
    lastEvent: WebSocketEvent | null;
  };
}
```

**Placement** : Initialiser dans le layout `(app)/layout.tsx` pour que le WebSocket soit actif sur toutes les pages protégées.

### Intégration avec le state

```
WebSocket Event → useChatwootWebSocket (dans layout)
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  ConversationList   ChatPanel    NotificationBadge
  (mise à jour       (nouveau     (compteur en
   de la liste)      message)     temps réel)
```

**Recommandation** : Utiliser un `WebSocketContext` qui expose les événements. Chaque composant consomme les événements pertinents via un hook custom.

---

## 8. Stratégie de migration par phases

### Phase 1 — Fondation (Auth + API Layer)

**Durée estimée** : 2-3 jours

| Tâche | Fichiers |
|-------|----------|
| Configurer `.env.local` | `.env.local` |
| Créer `src/lib/chatwoot/client.ts` | Nouveau |
| Créer `src/lib/chatwoot/types.ts` | Nouveau |
| Créer `src/lib/chatwoot/transformers.ts` | Nouveau |
| Créer `/api/chatwoot/auth/route.ts` | Nouveau |
| Réécrire `AuthContext.tsx` | Modifier |
| Modifier `login/page.tsx` | Modifier |
| Créer `middleware.ts` | Nouveau |

**Critère de validation** : L'utilisateur peut se connecter avec ses credentials Chatwoot et voir son nom/rôle dans le header.

### Phase 2 — Conversations

**Durée estimée** : 3-4 jours

| Tâche | Fichiers |
|-------|----------|
| Créer Route Handler conversations | `/api/chatwoot/conversations/` |
| Créer Route Handler messages | `/api/chatwoot/conversations/[id]/messages/` |
| Créer `useConversations()` hook | `src/hooks/useConversations.ts` |
| Créer `useConversation(id)` hook | `src/hooks/useConversation.ts` |
| Modifier conversations list page | `conversations/page.tsx` |
| Modifier conversation detail page | `conversations/[id]/page.tsx` |
| Modifier `ConversationList` component | Composant |
| Modifier `ChatPanel` — envoi réel | Composant |
| Modifier `CustomerProfile` — notes privées | Composant |
| Créer Route Handler inboxes | `/api/chatwoot/inboxes/` |

**Critère de validation** : Naviguer dans les conversations réelles, lire les messages, envoyer un message et le voir apparaître dans Chatwoot.

### Phase 3 — Contacts + Labels

**Durée estimée** : 2-3 jours

| Tâche | Fichiers |
|-------|----------|
| Créer Route Handler contacts | `/api/chatwoot/contacts/` |
| Créer Route Handler labels | `/api/chatwoot/labels/` |
| Créer `useContacts()` et `useLabels()` hooks | `src/hooks/` |
| Modifier contacts page | `contacts/page.tsx` |
| Modifier categories page | `categories/page.tsx` |
| Modifier Header (recherche) | `Header.tsx` |

**Critère de validation** : Voir les vrais contacts, en éditer un, voir les labels Chatwoot, rechercher globalement.

### Phase 4 — Temps réel (WebSocket)

**Durée estimée** : 2-3 jours

| Tâche | Fichiers |
|-------|----------|
| Créer `src/lib/chatwoot/websocket.ts` | Nouveau |
| Créer `useChatwootWebSocket()` hook | `src/hooks/useChatwootWebSocket.ts` |
| Créer `WebSocketContext` | `src/contexts/WebSocketContext.tsx` |
| Intégrer dans `(app)/layout.tsx` | Modifier |
| Brancher sur ConversationList | Composant |
| Brancher sur ChatPanel | Composant |
| Ajouter indicateur de typing | `ChatPanel.tsx` |
| Ajouter notification toast temps réel | `Header.tsx` ou layout |

**Critère de validation** : Envoyer un message depuis Chatwoot → le voir apparaître dans le CRM sans rafraîchir la page. Typing indicator visible.

### Phase 5 — Dashboard + Reports

**Durée estimée** : 2-3 jours

| Tâche | Fichiers |
|-------|----------|
| Créer Route Handler reports | `/api/chatwoot/reports/` |
| Créer Route Handler agents | `/api/chatwoot/agents/` |
| Créer `useDashboardMetrics()` hook | `src/hooks/useDashboardMetrics.ts` |
| Modifier dashboard page | `dashboard/page.tsx` |
| Modifier reports page | `reports/page.tsx` |

**Critère de validation** : Dashboard affiche des KPIs réels. Rapports changent selon la période sélectionnée avec des données live.

### Phase 6 — Polish + Nettoyage

**Durée estimée** : 1-2 jours

| Tâche | Fichiers |
|-------|----------|
| Modifier settings page (agents, inboxes) | `settings/page.tsx` |
| Supprimer `src/lib/mock-data.ts` | Supprimer |
| Supprimer tous les imports `MOCK_*` restants | Multiples |
| Vérifier les états de chargement (skeletons) | Pages |
| Vérifier les états d'erreur | Pages |
| Tests end-to-end manuels | — |
| `npm run build` — 0 erreurs | — |

**Critère de validation** : L'app fonctionne à 100% sans aucune donnée mock. Build propre. Aucune référence à `mock-data.ts`.

---

## 9. Gestion d'erreurs

### Codes HTTP

| Code | Signification | Action dans l'app |
|------|---------------|-------------------|
| `200` | Succès | Traiter la réponse |
| `401` | Token expiré/invalide | Redirect vers `/login` + toast "Session expirée" |
| `403` | Permissions insuffisantes | Toast "Accès non autorisé" |
| `404` | Ressource introuvable | Afficher état vide ou redirect |
| `422` | Validation échouée | Afficher les erreurs de validation sur le formulaire |
| `429` | Rate limited | Retry après `Retry-After` header, toast "Trop de requêtes" |
| `500+` | Erreur serveur | Toast "Erreur serveur", bouton Réessayer |

### Retry Logic

```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    if (response.status === 429 || response.status >= 500) {
      await sleep(Math.pow(2, i) * 1000); // Backoff exponentiel : 1s, 2s, 4s
      continue;
    }
    return response;
  }
  throw new Error("Max retries exceeded");
}
```

### Mises à jour optimistes

Pour l'envoi de messages :
1. Ajouter le message au state local immédiatement (avec `status: "sending"`)
2. Envoyer le `POST /messages`
3. Si succès : mettre à jour l'ID réel et le `status: "sent"`
4. Si échec : afficher erreur sur le message + bouton "Réessayer"

### États de chargement

Les skeletons existants (`src/app/(app)/loading.tsx`) gèrent le chargement au niveau de la route. Pour les données asynchrones dans les composants :
- Utiliser les états `isLoading` des hooks SWR/React Query
- Afficher des placeholders inline (shimmer sur les lignes de texte, cercles pour les avatars)

### Composants existants réutilisables

| Composant | Fichier | Usage pour les erreurs |
|-----------|---------|------------------------|
| Error boundary | `src/app/(app)/error.tsx` | Erreurs de rendu + bouton "Réessayer" (`reset()`) |
| 404 page | `src/app/not-found.tsx` | Routes invalides |
| Loading skeleton | `src/app/(app)/loading.tsx` | Chargement initial des routes |
| Toast (sonner) | Déjà importé partout | Feedback erreurs API |

---

## 10. Annexes

### Annexe A — Quick Reference API Chatwoot

#### Authentification
```
POST /auth/sign_in
Body: { "email": "...", "password": "..." }
Response: { "data": { "access_token", "account_id", "pubsub_token", "name", "email", "role", ... } }
```

#### Conversations
```
GET /api/v1/accounts/{id}/conversations?status=open&page=1&assignee_type=me
Response: { "data": { "meta": { "all_count", "mine_count", ... }, "payload": [Conversation, ...] } }

POST /api/v1/accounts/{id}/conversations
Body: { "contact_id": 1, "inbox_id": 1, "message": { "content": "Hello" } }

GET /api/v1/accounts/{id}/conversations/{conv_id}/messages?before=<timestamp>
Response: { "payload": [Message, ...], "meta": { "contact_last_seen_at", ... } }

POST /api/v1/accounts/{id}/conversations/{conv_id}/messages
Body: { "content": "Bonjour", "message_type": "outgoing", "private": false }
```

#### Contacts
```
GET /api/v1/accounts/{id}/contacts?page=1&sort=name
Response: { "payload": [Contact, ...], "meta": { "count", "current_page", ... } }

GET /api/v1/accounts/{id}/contacts/search?q=issouf&page=1
Response: { "payload": [Contact, ...], "meta": { ... } }

PUT /api/v1/accounts/{id}/contacts/{contact_id}
Body: { "name": "...", "email": "...", "phone_number": "...", "custom_attributes": { "company": "..." } }
```

#### Agents
```
GET /api/v1/accounts/{id}/agents
Response: [Agent, ...]
```

#### Labels
```
GET /api/v1/accounts/{id}/labels
Response: { "payload": [{ "id", "title", "description", "show_on_sidebar" }, ...] }

POST /api/v1/accounts/{id}/labels
Body: { "title": "VIP" }
```

#### Inboxes
```
GET /api/v1/accounts/{id}/inboxes
Response: { "payload": [{ "id", "name", "channel_type", "phone_number", ... }, ...] }
```

#### Reports
```
GET /api/v1/accounts/{id}/reports?metric=conversations_count&type=account&since=1709251200&until=1709337600
Response: [{ "value": "45", "timestamp": 1709251200 }, ...]

Métriques disponibles : conversations_count, incoming_messages_count, outgoing_messages_count,
                        avg_first_response_time, avg_resolution_time, resolutions_count
Types : account, agent, inbox, label, team
```

### Annexe B — Fichiers à supprimer après migration

| Fichier | Raison |
|---------|--------|
| `src/lib/mock-data.ts` | Toutes les données mock (MOCK_USERS, MOCK_CONTACTS, MOCK_CONVERSATIONS, etc.) |

**Imports à nettoyer** (rechercher `from "@/lib/mock-data"`) :

| Fichier | Import à supprimer |
|---------|-------------------|
| `src/contexts/AuthContext.tsx` | `MOCK_USERS` |
| `src/app/(app)/dashboard/page.tsx` | `MOCK_DASHBOARD_METRICS`, `MOCK_AGENT_PERFORMANCE`, `MOCK_INTENT_DISTRIBUTION`, `MOCK_ACTIVITY_EVENTS` |
| `src/app/(app)/conversations/page.tsx` | `MOCK_CONVERSATIONS` |
| `src/app/(app)/conversations/[id]/page.tsx` | `MOCK_CONVERSATIONS` |
| `src/app/(app)/contacts/page.tsx` | `MOCK_CONTACTS` |
| `src/app/(app)/reports/page.tsx` | `MOCK_AGENT_PERFORMANCE` |
| `src/app/(app)/settings/page.tsx` | `MOCK_USERS` |
| `src/components/layout/Header.tsx` | `MOCK_CONVERSATIONS`, `MOCK_CONTACTS` |
| `src/components/conversations/CustomerProfile.tsx` | `MOCK_INTERNAL_NOTES` |

**Fichiers à conserver** (configuration UI, pas des données) :
- `src/lib/constants.ts` → Conserver `NAV_ITEMS`, `CHANNEL_CONFIG`, `STATUS_CONFIG`. Les `DEFAULT_INTENTIONS` et `DEFAULT_LABELS` deviennent optionnels (fallback si l'API est indisponible).
- `src/lib/types.ts` → Conserver tel quel (interfaces réutilisées avec les transformers)

### Annexe C — Checklist de test

#### Phase 1 — Auth
- [ ] Se connecter avec des credentials valides → redirect dashboard
- [ ] Se connecter avec credentials invalides → message d'erreur
- [ ] Rafraîchir la page → session persistée
- [ ] Accéder à `/dashboard` sans session → redirect `/login`
- [ ] Se déconnecter → redirect `/login`, session supprimée
- [ ] Le nom et rôle dans le header correspondent à l'agent Chatwoot

#### Phase 2 — Conversations
- [ ] Liste des conversations chargée depuis Chatwoot
- [ ] Filtrer par statut (Active/En attente/Résolue) fonctionne
- [ ] Filtrer par canal (WhatsApp/Messenger) fonctionne
- [ ] Ouvrir une conversation → messages réels affichés
- [ ] Envoyer un message → apparaît dans l'app ET dans Chatwoot
- [ ] Les notes internes (private messages) s'affichent dans le profil client
- [ ] La pagination fonctionne (scroll ou page suivante)
- [ ] Le résumé IA s'affiche si disponible

#### Phase 3 — Contacts + Labels
- [ ] Liste des contacts chargée depuis Chatwoot
- [ ] Rechercher un contact par nom/téléphone/email
- [ ] Ouvrir le détail d'un contact → infos correctes
- [ ] Modifier un contact → changements persistés dans Chatwoot
- [ ] Les labels s'affichent sur les contacts et conversations
- [ ] Créer/supprimer un label sur la page Catégories

#### Phase 4 — Temps réel
- [ ] Envoyer un message depuis Chatwoot → apparaît dans le CRM sans rafraîchir
- [ ] Nouveau message dans une conversation non active → badge unread incrémenté
- [ ] Indicateur de typing visible quand le contact tape
- [ ] Statut en ligne des agents mis à jour
- [ ] Déconnexion/reconnexion WebSocket transparente

#### Phase 5 — Dashboard + Reports
- [ ] KPIs du dashboard correspondent aux vraies données
- [ ] Changer de période sur Rapports → graphiques mis à jour
- [ ] Classement agents avec stats réelles
- [ ] Répartition par canal correcte

#### Phase 6 — Nettoyage
- [ ] `npm run build` → 0 erreurs
- [ ] Aucune référence à `mock-data` dans le code
- [ ] Toutes les pages fonctionnent en mode déconnecté gracieusement
- [ ] Les états de chargement (skeletons) s'affichent avant les données
- [ ] Les erreurs API affichent des messages utilisateur clairs
