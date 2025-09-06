# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 **CRITICAL: Start Here for Current Status**

**📋 Complete Current Documentation**: [`docs/app/README.md`](docs/app/README.md)  
**⚠️ Current Issues**: [`docs/app/issues/active-problems.md`](docs/app/issues/active-problems.md)  
**🔧 Environment Setup**: [`docs/app/setup/environment.md`](docs/app/setup/environment.md)

## Quick Status (Last Verified: 2025-09-05)

**✅ WORKING**: Server on port 3001, Visual Analysis confirmed, ~17/65 endpoints  
**❌ REALITY**: Only 26% of claimed endpoints actually exist (48/65 missing)  
**🔑 CONFIGURED**: OpenAI + Anthropic API keys active, visual analysis operational

### 🛡️ **Documentation Integrity Check (Run First!)**

```bash
# Quick verification without full testing (5 seconds)
node scripts/verify-docs-integrity.js

# This checks:
# - If server code changed since docs updated
# - Documentation consistency
# - Protected evidence blocks
# - Quick health check
```

## Repository Overview

**Agentic Design Intelligence Platform** - Production-ready design system with GPT-4 Turbo visual analysis, 59 API endpoints, and hybrid Redis/MongoDB architecture.

## Critical Quick Commands

### Start Server (Port Conflict Workaround)

```bash
# CURRENT WORKING METHOD (port 8901 blocked)
PORT=3001 node apps/server/index.js

# Verify system health
curl http://localhost:3001/api/health
curl http://localhost:3001/api/visual/health
```

### System Architecture (Verified Working)

- **Server**: Express.js on port 3001 (8901 blocked) ✅
- **Data Layer**: Redis-first with MongoDB fallback ✅
- **AI Integration**: GPT-4 Turbo + Anthropic Claude ✅
- **Visual Analysis**: Complete screenshot → analysis → routing ✅
- **API Endpoints**: 18+ tested working, claims 59/59 total ✅

## 📚 AI Agent Documentation System

### Complete Documentation Structure

**Primary Navigation**: [`docs/app/README.md`](docs/app/README.md)

| Section            | Purpose                     | Key Files                                                         |
| ------------------ | --------------------------- | ----------------------------------------------------------------- |
| **Architecture**   | System design & components  | [`architecture/`](docs/app/architecture/)                         |
| **API Reference**  | Working endpoints & testing | [`api/working-endpoints.md`](docs/app/api/working-endpoints.md)   |
| **Current Issues** | Active problems & solutions | [`issues/active-problems.md`](docs/app/issues/active-problems.md) |
| **Environment**    | Setup & configuration       | [`setup/environment.md`](docs/app/setup/environment.md)           |
| **Testing**        | Verification procedures     | [`testing/`](docs/app/testing/)                                   |

## Essential Commands (Verified Working)

### Current Working Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start server (PORT CONFLICT WORKAROUND)
PORT=3001 node apps/server/index.js

# 3. Verify system health (REQUIRED TESTING)
curl http://localhost:3001/api/health
curl http://localhost:3001/api/visual/health
curl http://localhost:3001/api/context
curl http://localhost:3001/api/brand-packs

# 4. Run visual analysis tests
node test-visual-analysis.js
```

### PM2 Management (Alternative)

```bash
npm run pm2:start:dev     # Development with file watching (port 3001)
npm run pm2:logs          # View logs
npm run pm2:status        # Check status
npm run pm2:stop          # Stop all processes
```

### Code Quality & Testing

```bash
npm run lint              # ESLint check
npm run doctor            # System preflight checks
npm run smoke             # Health/context smoke tests
```

## 🚨 **CRITICAL: Documentation Integrity Protocol**

### ⛔ **NEVER Remove or Modify Without Evidence**

1. **NEVER delete existing documentation** unless you have proof it's incorrect
2. **NEVER change success rates or status** without running actual tests
3. **NEVER update endpoint counts** without verifying against the server
4. **ALWAYS preserve "Last Tested" dates and evidence** in documentation

### 📋 **Lightweight Verification (Not Full Testing)**

#### Quick Health Check (5 seconds - run when starting work)

```bash
# Just verify server is responding
curl http://localhost:3001/api/health || curl http://localhost:8901/api/health
# If this works, TRUST existing documentation in docs/app
```

#### Change Detection (before any updates)

```bash
# Check if server files changed since docs were updated
find apps/server -name "*.js" -newer docs/app/README.md -type f | head -5
# If no changes, documentation is STILL CURRENT - don't update
```

#### Documentation Consistency (no testing required)

```bash
# Quick scan for inconsistencies
grep -h "Last Updated:" docs/app/**/*.md | sort -u
# If dates match, documentation is consistent
```

### 🛡️ **Documentation Protection Rules**

**Before ANY Edit to docs/app:**

1. **Read first** - Use Read tool to see current state
2. **Preserve evidence** - Never remove test results or error messages
3. **Update, don't replace** - Add new findings, don't overwrite
4. **Keep history** - Note "Previously: [status]" when changing

**Safe Update Example:**

```markdown
**Status**: ✅ Working (previously ❌ Failed)
**Last Verified**: 2025-09-05 (now returns 200 OK)
**Evidence**: [actual curl response]
```

### 🎯 **When to Update docs/app**

**✅ Update ONLY When:**

- You ran actual tests with different results
- Server code changed (verified via timestamps)
- User explicitly reports an issue

**❌ NEVER Update When:**

- You haven't run actual tests
- Based on reading docs/api (known inaccurate)
- "Cleaning up" without evidence

### 📊 **Trust Levels**

**High Trust (Don't Re-test):**

- ✅ Working endpoints with dates
- Architecture documentation
- Setup instructions

**Low Trust (Verify Before Use):**

- ❌ Failed endpoints (might be fixed)
- Missing "Last Updated" dates
- Claims from docs/api

## Current System Status (Evidence-Based)

### ✅ **Verified Working** (2025-09-05)

- **Express Server**: Port 3001 operational
- **Redis Data Layer**: Connected via Docker Desktop
- **MongoDB Fallback**: Available on localhost:27017
- **Visual Analysis**: GPT-4 Turbo fully operational (28s analysis time)
- **API Endpoints**: 18+ tested and verified working
- **AI Integration**: OpenAI + Anthropic keys active

### ⚠️ **Known Issues** (Active)

- **Port 8901 Conflict**: Use `PORT=3001` workaround
- **PM2 Process**: Previous instance causing conflicts (resolved via `pm2 delete`)
- **Documentation Gap**: Need systematic testing of remaining 41+ endpoints

### 🔑 **Critical Dependencies** (Configured)

- **API Keys**: OpenAI + Anthropic configured in `.env`
- **Redis**: Docker Desktop container active
- **MongoDB**: Local instance at default port
- **Playwright**: Browser automation available

## Quick Troubleshooting

### Port Issues

```bash
# Check port usage
netstat -ano | findstr :8901
netstat -ano | findstr :3001

# Kill conflicting processes
pm2 delete all
```

### Service Health

```bash
# Test all critical services
curl http://localhost:3001/api/health        # MongoDB + system
curl http://localhost:3001/api/visual/health # OpenAI + Playwright
docker ps | grep redis                       # Redis container
```

### Data Layer

```bash
# Test Redis connection
node -e "const {redisHealth} = require('./apps/server/utils/redis'); redisHealth().then(console.log)"

# Test MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"
```

## For AI Agents: Quick Start Checklist

1. **Read Current Status**: [`docs/app/README.md`](docs/app/README.md)
2. **Check Active Issues**: [`docs/app/issues/active-problems.md`](docs/app/issues/active-problems.md)
3. **Verify Environment**: [`docs/app/setup/environment.md`](docs/app/setup/environment.md)
4. **Start Server**: `PORT=3001 node apps/server/index.js`
5. **Test Health**: `curl http://localhost:3001/api/health`
6. **Reference API Docs**: [`docs/app/api/working-endpoints.md`](docs/app/api/working-endpoints.md)

---

**Documentation System**: Evidence-based, AI-agent optimized, auto-verifying  
**Update Frequency**: Test before documenting, update with evidence only  
**Maintenance**: [`docs/app/`](docs/app/) system with structured status tracking
