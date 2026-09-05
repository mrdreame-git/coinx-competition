# COINX — Development Handoff

**Document status:** Initial development handoff  
**Repository branch:** `main`  
**Current baseline commit:** `455407a` — `chore: prepare Solidity workspace`  
**Purpose:** Provide the development team with the current COINX development environment, repository structure, service information, responsibilities, and working rules.

---

## 1. Project Overview

COINX is being prepared as a competition/trading platform with a Web2 application stack and a future Web3/blockchain component.

The infrastructure team has prepared the development environment only. The application and blockchain development teams are responsible for implementing the actual product.

### Current stack

| Area | Technology | Status |
|---|---|---|
| Operating system | Linux Mint 22.3 Zena | Ready |
| Container runtime | Docker 29.8.0 | Ready |
| Container orchestration | Docker Compose 5.5.1 | Ready |
| Backend runtime | Python 3.12 / FastAPI | Ready |
| Database | PostgreSQL 17 | Ready |
| Cache | Redis 8 | Ready |
| Frontend runtime | Next.js 16 / React 19 / TypeScript | Ready |
| Smart-contract compiler | Solidity `solc` 0.8.36 | Ready |
| Solidity version manager | `solc-select` 1.2.0 | Ready |
| Version control | Git | Ready |

---

## 2. Repository Structure

The repository is intentionally organized into separate areas:

```text
COINX/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── core/
│       │   └── config.py
│       ├── db/
│       │   ├── postgres.py
│       │   └── redis.py
│       └── main.py
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── app/
│   ├── public/
│   └── ...
│
├── contracts/
│   └── .gitkeep
│
├── infrastructure/
│   ├── compose.yaml
│   ├── .env.example
│   ├── README.md
│   └── scripts/
│       ├── up.sh
│       ├── down.sh
│       ├── restart.sh
│       └── backup.sh
│
├── .env.example
└── .gitignore
```

### Important

The `contracts/` directory is deliberately almost empty.

The infrastructure team has verified that Solidity compilation works, but has **not selected a smart-contract framework**.

The blockchain development team may choose Hardhat, Foundry, or another appropriate toolchain.

---

## 3. Git Repository

The repository uses **one Git repository at the project root**:

```text
~/COINX/
```

Current branch:

```text
main
```

Current history:

```text
455407a chore: prepare Solidity workspace
02df0a5 chore: Initialize COINX Infrastructure
```

The working tree is currently clean.

### Recommended workflow

Do not develop directly on `main`.

Use feature branches such as:

```text
feature/backend-auth
feature/frontend-login
feature/contracts-competition
feature/web3-wallet
```

Example:

```bash
git checkout -b feature/example
```

Commit focused changes with descriptive messages.

---

## 4. Server Environment

The development server currently runs:

```text
OS: Linux Mint 22.3 Zena
CPU: Intel Core i7-7700
RAM: 16 GB
Storage: approximately 112 GB
```

The server is intended to host the COINX development environment.

### Access

Network access is provided through the existing internal network/WireGuard arrangement.

Developers should use the server IP provided separately by the project/infrastructure owner.

**Do not place VPN private keys or SSH private keys in this repository or this document.**

---

## 5. Docker Infrastructure

The infrastructure is managed from:

```bash
cd ~/COINX/infrastructure
```

Current Docker services:

```text
coinx-postgres
coinx-redis
coinx-api
```

Docker network:

```text
coinx_backend
```

### PostgreSQL

```text
Container: coinx-postgres
Image: postgres:17
Database: coinx_competition
User: coinx
Internal port: 5432
```

### Redis

```text
Container: coinx-redis
Image: redis:8
Internal port: 6379
```

### API

```text
Container: coinx-api
Internal container port: 3000
Host port: 3000
```

The API is reachable from the server at:

```text
http://127.0.0.1:3000
```

and, subject to network/firewall configuration, from other authorized machines using:

```text
http://SERVER-IP:3000
```

---

## 6. Database and Redis Network Policy

PostgreSQL and Redis are intentionally **not published directly to the host/LAN**.

They are accessible to application containers through the Docker network.

From inside the API container:

```text
PostgreSQL:
postgres:5432

Redis:
redis:6379
```

Therefore backend Docker configuration should use:

```text
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379
```

Do not change this to `localhost` when the backend is running inside Docker.

`localhost` inside the API container means the API container itself.

---

## 7. Backend Environment

The backend uses:

```text
Python 3.12
FastAPI
Uvicorn
SQLAlchemy
psycopg
redis
Pydantic Settings
```

Source directory:

```text
backend/
```

Docker image is built from:

```text
backend/Dockerfile
```

The backend currently exposes:

```text
GET /health
GET /health/database
GET /health/redis
```

These endpoints are intended as infrastructure health checks.

### Current verification

The infrastructure team has verified:

```text
/health
→ API is running

/health/database
→ PostgreSQL connection works

/health/redis
→ Redis connection works
```

### Backend responsibility

The backend development team is responsible for implementing:

- API design
- Authentication/authorization
- User management
- Competition logic
- Trading/competition engine
- Business rules
- Database schema
- Migrations
- Validation
- Error handling
- API documentation
- Web3/blockchain integration where required

These are not part of the infrastructure handoff.

---

## 8. Frontend Environment

The frontend is located at:

```text
frontend/
```

Current stack:

```text
Next.js 16.3.4
React 19.2.8
TypeScript
Tailwind CSS
ESLint
```

The frontend development server uses:

```text
Port: 3001
```

It has already been verified by requesting:

```text
http://127.0.0.1:3001
```

The default Next.js application responds successfully.

### Frontend responsibility

The frontend team is responsible for implementing:

- UI/UX
- Pages
- Routing
- User registration/login screens
- Competition interface
- Trading interface
- Dashboard
- Deposit/withdrawal interfaces
- API integration
- Wallet integration
- Web3 integration
- Client-side validation
- Application state management
- Responsive design

The current frontend is only a development environment and starting point.

---

## 9. Solidity / Blockchain Environment

The Solidity workspace is:

```text
contracts/
```

The installed compiler is:

```text
solc 0.8.36
```

Compiler management:

```text
solc-select 1.2.0
```

The compiler was successfully tested by compiling a simple Solidity contract.

### Important

Solidity itself does **not** require Hardhat.

The infrastructure team intentionally did not choose:

- Hardhat
- Foundry
- Remix
- ethers.js
- viem
- wagmi
- a blockchain network
- an RPC provider

The blockchain development team should choose the appropriate development stack.

### Blockchain team responsibility

The blockchain/Web3 team is responsible for determining:

- Blockchain/network
- EVM compatibility requirements
- Smart-contract architecture
- Solidity version requirements
- Development framework
- Testing framework
- Deployment process
- Contract upgrade strategy
- Wallet integration
- Web3 library
- RPC requirements
- Contract security
- On-chain/off-chain boundaries
- Contract interaction with the backend/frontend

---

## 10. Environment Variables and Secrets

Environment-specific configuration is intentionally kept outside Git.

Examples are provided as:

```text
.env.example
infrastructure/.env.example
```

Real `.env` files must **never be committed**.

Do not commit:

```text
.env
.env.*
```

except the explicitly allowed:

```text
.env.example
```

### Never commit

- Database passwords
- API keys
- RPC credentials
- Wallet private keys
- Seed phrases
- JWT secrets
- SSH private keys
- WireGuard private keys
- Production credentials
- Exchange credentials

Secrets must be provided through an appropriate secure channel.

---

## 11. Starting the Environment

From the project directory:

```bash
cd ~/COINX/infrastructure
```

Start services:

```bash
./scripts/up.sh
```

Check status:

```bash
docker compose ps
```

Expected services:

```text
coinx-postgres
coinx-redis
coinx-api
```

Stop services:

```bash
./scripts/down.sh
```

Restart:

```bash
./scripts/restart.sh
```

View all logs:

```bash
docker compose logs -f
```

View individual logs:

```bash
docker logs -f coinx-api
docker logs -f coinx-postgres
docker logs -f coinx-redis
```

---

## 12. Basic Health Checks

API:

```bash
curl http://127.0.0.1:3000/health
```

Database:

```bash
curl http://127.0.0.1:3000/health/database
```

Redis:

```bash
curl http://127.0.0.1:3000/health/redis
```

The expected status is:

```text
status: ok
```

for each healthy service.

---

## 13. Development Boundaries

The infrastructure environment is intentionally kept simple.

### Infrastructure team owns

- Linux server
- Docker
- Docker Compose
- Container networking
- PostgreSQL runtime
- Redis runtime
- Basic service availability
- Server networking/access
- Base development environment

### Backend team owns

- Python application
- API
- Database schema
- Application logic
- Authentication
- Competition engine
- Trading engine

### Frontend team owns

- Next.js application
- UI/UX
- Client application
- API integration
- Wallet/Web3 frontend integration

### Blockchain team owns

- Solidity
- Smart contracts
- Contract tests
- Deployment
- Blockchain/Web3 architecture

---

## 14. Rules for Infrastructure Changes

Do not make infrastructure changes without coordination if they affect other teams.

Examples include:

- Changing exposed ports
- Publishing PostgreSQL
- Publishing Redis
- Changing Docker networks
- Changing database credentials
- Changing container names
- Changing service dependencies
- Changing firewall rules
- Changing server networking

If an application requires a new infrastructure dependency, document the requirement first.

---

## 15. Database Access

Application containers should access PostgreSQL through:

```text
postgres:5432
```

The database is not currently published directly to the host.

Developers who need direct database administration can use an approved database client when an appropriate access path is provided by the infrastructure owner.

Examples:

```text
DBeaver
pgAdmin
DataGrip
```

Do not expose PostgreSQL publicly merely to make development more convenient.

---

## 16. Redis

Redis is configured with persistence enabled:

```text
appendonly yes
```

The Redis data is stored in a Docker volume:

```text
coinx_infra_redis_data
```

Developers should treat Redis as an application infrastructure service rather than modifying its persistence configuration casually.

---

## 17. PostgreSQL Storage

PostgreSQL data is stored in the Docker volume:

```text
coinx_infra_postgres_data
```

Do not delete Docker volumes during normal development.

Commands such as:

```bash
docker compose down -v
```

can destroy the development database contents and therefore require explicit approval.

---

## 18. Current Limitations / Not Yet Implemented

The following are intentionally **not yet implemented**:

- Production deployment
- Production domain
- TLS/HTTPS
- Production authentication
- Application database schema
- Database migrations
- Competition engine
- Trading engine
- Smart contracts
- Blockchain network selection
- Wallet integration
- Web3 frontend integration
- Production RPC provider
- Production monitoring
- Production alerting
- Production backup policy
- CI/CD pipeline
- Production secret management

These should be designed and implemented as the project requirements become clear.

---

## 19. Security Rules

This server is a development environment.

Developers must still follow basic security practices.

### Never

```text
Commit secrets
Expose PostgreSQL unnecessarily
Expose Redis unnecessarily
Share private keys
Share wallet seed phrases
Run unknown containers
Delete persistent volumes without approval
Change firewall/networking without coordination
```

### Especially for Web3

Never store a wallet seed phrase or private key in:

```text
Git
.env committed to Git
Source code
Frontend JavaScript
Public Next.js environment variables
README files
Chat messages
```

A private blockchain signing key must never be placed in a browser-exposed variable such as:

```text
NEXT_PUBLIC_*
```

---

## 20. Recommended First Steps for Developers

After receiving repository access:

### Step 1 — Clone

```bash
git clone <COINX-REPOSITORY>
cd COINX
```

### Step 2 — Inspect

```bash
git status
git branch
```

### Step 3 — Start infrastructure

```bash
cd infrastructure
./scripts/up.sh
docker compose ps
```

### Step 4 — Verify API

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/health/database
curl http://127.0.0.1:3000/health/redis
```

### Step 5 — Start frontend development

From:

```text
frontend/
```

install dependencies if necessary:

```bash
npm install
```

Then:

```bash
npm run dev
```

The development server should use port `3001` according to the current development setup.

### Step 6 — Blockchain setup

The blockchain team should decide and document its preferred Solidity framework before adding substantial code under:

```text
contracts/
```

---

## 21. What the Infrastructure Team Has Verified

The following have been successfully verified:

- Git repository initialized
- `main` branch created
- Initial infrastructure committed
- Solidity workspace committed
- Docker is operational
- PostgreSQL 17 is operational
- Redis 8 is operational
- FastAPI container is operational
- FastAPI → PostgreSQL connectivity works
- FastAPI → Redis connectivity works
- Next.js frontend starts successfully
- Solidity `solc` 0.8.36 is installed
- Solidity compilation has been successfully tested
- Real `.env` files are excluded from Git
- PostgreSQL and Redis are not directly host-published

---

## 22. Handoff Philosophy

This handoff deliberately separates infrastructure from application development.

The infrastructure team provides a working foundation.

The development teams are expected to build the actual product on top of it.

The infrastructure team does **not** prescribe application architecture unless a decision directly affects infrastructure, security, availability, or deployment.

For application-level decisions, the development teams should propose and document their architecture.

---

## 23. Contact / Access

The following information should be provided separately through the project's secure communication channel:

```text
Repository URL:
Development server IP:
SSH access method:
Approved developer accounts:
Database administration access, if required:
Other approved development credentials:
```

Do not store passwords, private keys, seed phrases, or other secrets in this document.

---

## 24. Current Status

**Infrastructure foundation: READY**

```text
Backend runtime       READY
Frontend runtime      READY
PostgreSQL            READY
Redis                 READY
Docker                READY
Git                   READY
Solidity compiler     READY
Solidity workspace    READY
Application logic     NOT STARTED
Smart contracts       NOT STARTED
Web3 architecture     NOT FINALIZED
```

The environment is ready for the development teams to begin application and Web3 development.
