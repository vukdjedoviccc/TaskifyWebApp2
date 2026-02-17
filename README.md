# Taskify - Task Management Application

Fullstack aplikacija za upravljanje projektima i taskovima sa **Kanban board-om**.
Kreirana koriscenjem **Angular 21 + Signals + TailwindCSS** na frontendu i **Node.js + Express 5 + Prisma + SQL Server** na backendu.

---

## Pregled

Taskify je moderna task management aplikacija koja omogucava korisnicima da organizuju svoj rad kroz:

- **Projekte** - Grupisanje taskova po projektima
- **Kanban Board** - Vizuelni prikaz taskova sa drag & drop funkcionalnošcu
- **Kolone** - Prilagodljive kolone (To Do, In Progress, Done, ili custom)
- **Taskovi** - Detaljni taskovi sa prioritetima, rokovima, kategorijama i dodeljivanjem
- **Kalendar** - Mesecni prikaz svih taskova sa rokovima
- **Notifikacije** - In-app obavestenja o dodeljenim taskovima

---

## Funkcionalnosti

### Autentifikacija i Autorizacija

- Registracija i prijava korisnika
- JWT token cuvan u HTTP-only cookie-u (sigurnost)
- Tri nivoa pristupa: **ADMIN**, **MODERATOR**, **USER**
- Zasticene rute na frontendu (Guards) i backendu (Middleware)

### Projekti

- Kreiranje projekata sa nazivom, opisom i bojom
- Pristup baziran na vlasnistvu (ownerId) i sistemskoj roli
- ADMIN/MODERATOR mogu pristupiti svim projektima
- USER vidi samo svoje projekte
- Inline prikaz board-ova na listi projekata

### Kanban Board

- **Drag & Drop** - Premestanje taskova izmedju kolona (Angular CDK)
- Kreiranje custom kolona sa bojama
- Responzivan dizajn za sve uredjaje

### Taskovi

- Kreiranje i uredjivanje taskova
- **Prioriteti**: Low, Medium, High, Urgent
- **Due dates** sa vizuelnim indikatorima (overdue, due soon)
- **Dodeljivanje taskova** - Dodela taska korisniku sa automatskom notifikacijom
- **Kategorija/Labela** - Jedna labela po tasku sa bojom
- **Move** - Premestanje taskova izmedju kolona sa automatskim azuriranjem pozicija

### Kalendar

- Mesecni prikaz taskova po due date-u
- Navigacija izmedju meseci
- Task indikatori na danima (crveno = istekao, narandzasto = uskoro, plavo = u toku)
- Panel sa detaljima taskova za izabrani dan
- Klik na task vodi direktno do board-a

### Notifikacije

- **In-app notifikacije** sa bell ikonom u navbar-u
- Badge sa brojem neprocitanih notifikacija
- Tipovi notifikacija:
  - TASK_ASSIGNED - Kada vam je dodeljen task
  - TASK_DUE_SOON - Kada task uskoro istice
- Oznacavanje pojedinacnih/svih notifikacija kao procitane

### Email Integracija

- Slanje email-a kada je task dodeljen korisniku
- Konfigurisanje preko SMTP (Gmail, Outlook, custom SMTP server)
- Graceful degradation ako SMTP nije konfigurisan

---

## Tehnologije

### Frontend (Angular 21)

| Tehnologija | Opis |
|-------------|------|
| **Angular 21** | Frontend framework sa standalone komponentama |
| **Angular Signals** | Reaktivno state management (signal, computed, input, output, model) |
| **Angular CDK** | Drag & Drop za Kanban board |
| **TailwindCSS** | Utility-first CSS framework |
| **ng-icons** | Feather icons za UI |
| **RxJS** | Reaktivno programiranje |

### Backend (Node.js)

| Tehnologija | Opis |
|-------------|------|
| **Node.js 20+** | JavaScript runtime |
| **Express 5** | Web framework |
| **Prisma ORM** | Database toolkit |
| **SQL Server** | Relaciona baza podataka |
| **JWT** | JSON Web Tokens za auth |
| **bcryptjs** | Hashovanje lozinki |
| **cookie-parser** | Parsiranje cookies |
| **nodemailer** | Slanje email-ova |
| **swagger-jsdoc** | API dokumentacija |
| **swagger-ui-express** | Swagger UI |

---

## Arhitektura

```
TaskifyWebApp/
├── client/                          # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Services, guards, models, interceptors
│   │   │   ├── layout/              # Navbar
│   │   │   ├── pages/               # Route components
│   │   │   └── shared/              # Reusable components (Button, Input, Modal)
│   │   └── styles.css               # Global styles + Tailwind
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (7 modela)
│   │   ├── migrations/              # 5 SQL migracija
│   │   └── seed.js                  # Test data seeder
│   ├── src/
│   │   ├── config/                  # Environment config, email
│   │   ├── controllers/             # Route handlers (7 kontrolera)
│   │   ├── middleware/              # Auth, role checking
│   │   ├── routes/                  # API routes (7 fajlova)
│   │   └── server.js                # Entry point
│   └── package.json
│
└── README.md
```

---

## Database Schema

### Entiteti (7 modela)

**User**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| name | String | Ime korisnika |
| email | String | Email (unique) |
| password | String | Hashована lozinka |
| role | Enum | USER, MODERATOR, ADMIN |
| createdAt | DateTime | Datum kreiranja |
| updatedAt | DateTime | Datum izmene |

**Project**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| name | String | Naziv projekta |
| description | String? | Opis projekta |
| color | String | Boja projekta |
| ownerId | Int | FK -> User |

**Board**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| name | String | Naziv board-a |
| projectId | Int | FK -> Project |

**Column**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| name | String | Naziv kolone |
| position | Int | Redosled |
| color | String | Boja kolone |
| boardId | Int | FK -> Board |

**Task**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| title | String | Naslov taska |
| description | String? | Opis taska |
| priority | Enum | LOW, MEDIUM, HIGH, URGENT |
| dueDate | DateTime? | Rok |
| position | Int | Redosled u koloni |
| columnId | Int | FK -> Column |
| assigneeId | Int? | FK -> User |
| labelId | Int? | FK -> Label |

**Label**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| name | String | Naziv labele |
| color | String | Boja labele |
| projectId | Int | FK -> Project |

**Notification**
| Polje | Tip | Opis |
|-------|-----|------|
| id | Int | Primary key |
| userId | Int | FK -> User |
| type | Enum | TASK_ASSIGNED, TASK_DUE_SOON |
| title | String | Naslov notifikacije |
| message | String | Poruka |
| link | String? | Link ka resursu |
| isRead | Boolean | Da li je procitano |

---

## Migracije

Projekat sadrzi 5 SQL Server migracija:

| # | Migracija | Operacije |
|---|-----------|-----------|
| 1 | create_tables | CREATE TABLE (7 tabela), CREATE INDEX |
| 2 | add_columns | ADD COLUMN operacije |
| 3 | add_foreign_keys_and_indexes | ADD FOREIGN KEY, ADD INDEX |
| 4 | alter_columns_and_constraints | ADD CHECK CONSTRAINT (priority, role) |
| 5 | optimization_cleanup | DROP COLUMN/INDEX (cleanup) |

---

## API Dokumentacija (Swagger)

API dokumentacija je dostupna preko Swagger UI:

**URL:** `http://localhost:8081/api-docs`

### Swagger Features:
- Interaktivna API dokumentacija
- Try it out - testiranje endpoint-a direktno iz browser-a
- Request/Response primeri
- Schema modeli

### Pristup Swagger UI:
1. Pokreni backend server: `cd server && npm run dev`
2. Otvori browser: `http://localhost:8081/api-docs`

---

## API Endpoints

### Auth (/api/auth)

| Method | Endpoint | Opis |
|--------|----------|------|
| POST | /register | Registracija novog korisnika |
| POST | /login | Prijava korisnika |
| POST | /logout | Odjava korisnika |
| GET | /me | Trenutno ulogovani korisnik |

### Projects (/api/projects)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista projekata korisnika |
| POST | / | Kreiraj novi projekat |
| GET | /:id | Detalji projekta |
| PUT | /:id | Azuriraj projekat |
| DELETE | /:id | Obrisi projekat |

### Boards (/api/projects/:projectId/boards)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista board-ova projekta |
| POST | / | Kreiraj board |
| GET | /:id | Board sa kolonama i taskovima |
| PUT | /:id | Azuriraj board |
| DELETE | /:id | Obrisi board |

### Columns (/api/boards/:boardId/columns)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista kolona |
| POST | / | Kreiraj kolonu |
| PUT | /:id | Azuriraj kolonu |
| DELETE | /:id | Obrisi kolonu |
| PATCH | /reorder | Promeni redosled kolona |

### Tasks (/api/tasks)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista taskova (sa filterima) |
| POST | / | Kreiraj task (sa assigneeId, labelId) |
| GET | /:id | Detalji taska |
| PUT | /:id | Azuriraj task |
| DELETE | /:id | Obrisi task |
| PATCH | /:id/move | Premesti task (Kanban D&D) |

### Labels (/api/labels)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista labela (query: projectId) |
| POST | / | Kreiraj labelu |
| PUT | /:id | Azuriraj labelu |
| DELETE | /:id | Obrisi labelu |

### Notifications (/api/notifications)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | / | Lista notifikacija sa unreadCount |
| PATCH | /:id/read | Oznaci kao procitano |
| PATCH | /read-all | Oznaci sve kao procitano |
| DELETE | /:id | Obrisi notifikaciju |

---

## Instalacija

### Preduslovi

- **Node.js 20+** (Angular 21 zahteva minimum v20.19)
- **SQL Server** (lokalna instanca ili Azure SQL)
- **npm**

### 1. Kloniraj repozitorijum

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-task_management_veb_aplikacija_2022_0086.git
cd internet-tehnologije-2025-task_management_veb_aplikacija_2022_0086
```

### 2. Backend Setup

```bash
cd server
npm install
```

Kreiraj `.env` fajl:

```env
PORT=8081
NODE_ENV=development
DATABASE_URL="sqlserver://localhost:1433;database=taskify;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
COOKIE_NAME=taskify_token
CORS_ORIGIN=http://localhost:4200
```

Pokreni migracije i seed:

```bash
npx prisma migrate dev
node prisma/seed.js
```

Pokreni server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

---

## Docker

Projekat podrzava Docker deployment:

```bash
# Build i pokretanje svih servisa
docker-compose up --build

# Samo build
docker-compose build

# Pokretanje u background-u
docker-compose up -d
```

### Docker Compose servisi:

| Servis | Port | Opis |
|--------|------|------|
| frontend | 80 | Angular app (nginx) |
| backend | 8081 | Node.js API |
| db | 1433 | SQL Server |

---

## Pokretanje

| Servis | URL | Komanda |
|--------|-----|---------|
| Backend | http://localhost:8081 | `cd server && npm run dev` |
| Frontend | http://localhost:4200 | `cd client && npm start` |
| Swagger | http://localhost:8081/api-docs | Automatski sa backendom |

---

## Test Kredencijali

Nakon pokretanja seed.js, dostupni su sledeci test nalozi:

| Korisnik | Email | Lozinka | Uloga |
|----------|-------|---------|-------|
| Admin | admin@taskify.test | admin123 | ADMIN |
| Moderator | moderator@taskify.test | password | MODERATOR |
| Marko Petrovic | marko@taskify.test | password | USER |
| Ana Jovanovic | ana@taskify.test | password | USER |
| Stefan Nikolic | stefan@taskify.test | password | USER |

---

## Tim

| Ime | Email | Uloga |
|-----|-------|-------|
| Lazar Vasiljev | lazavaske22@gmail.com | Backend Lead |
| Nemanja Jovanovic | nemanjajnp@gmail.com | Frontend Lead |
| Milos Kostic | milos.kostic.pogramiranje@gmail.com | Full-stack + DB |

---

## Licenca

MIT License
