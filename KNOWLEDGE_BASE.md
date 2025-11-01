# OC Provider Backend — Knowledge Base

## 🎯 Purpose
The **Provider Backend** is the core API and data layer for content providers.  
It manages document creation, updates, and publication toward the **Client Backend**.  
The goal is to keep this service fully independent so that providers can continue working even if client services are overloaded or offline.

---

## 🧩 Key Components

| Component | Description |
|------------|--------------|
| **NestJS Application** | Main backend framework providing REST APIs. |
| **PostgreSQL Database (oc-provider-pg)** | Stores provider-created documents and metadata. Runs inside the same namespace. |
| **Document Module** | CRUD operations for documents. |
| **Transfer Module** | Sends completed documents to the Client Backend and handles responses. |
| **Security Module** | Authentication and authorization (to be implemented later). |

---

## 🔗 Interactions

- **With Provider Frontend (`oc-provider-frontend`)**
  - Provides REST endpoints under `/api`.
  - Example routes:
    - `POST /api/documents`
    - `PUT /api/documents/:id`
    - `POST /api/send` — transfers document to Client Backend.

- **With Client Backend (`oc-client-backend`)**
  - When a provider sends a document, this backend calls:
    ```http
    POST https://api.client.on-track.ch/v1/documents
    ```
  - The Client Backend replies with a unique code:
    ```json
    { "accessCode": "ABC123" }
    ```

- **With Infrastructure (Ingress, Kong)**
  - Internal DNS: `oc-provider-backend.oc-provider.svc.cluster.local`
  - Public route: `https://provider.on-track.ch/api`

---

## ⚙️ Deployment & CI/CD

- **Repo:** `oc-provider-backend`
- **Language:** Node.js (NestJS)
- **Image:** `ghcr.io/<username>/oc-provider-backend`
- **Namespace:** `oc-provider`
- **Secrets:**  
  - `DATABASE_URL` injected from Kubernetes secret
- **Exposed Service:** `oc-provider-backend:80`
- **Ingress:** `/api` → backend

## Commit Message Rules

```
type(scope): Description
```

Examples:

```
feat(workspace): Add Save to Library button
fix(prescriptions): Prevent sending summary before finalize
refactor(composables): Extract persona state logic from workspace
```

---

## Release Flow

```
git checkout main
git pull
git merge dev
npm version <patch|minor|major>
git push && git push --tags
Create RELEASE-NOTES.md (manual high-level wording)
```