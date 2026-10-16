# TaxEdge Operations Dashboards

Modern, production-ready operations dashboard platform for TaxEdge built with React 18, TypeScript, Vite, and an Advanced Modular Monolith architecture.

## Overview
- **Admin Dashboard (`/admin/dashboard`)**: Full operations oversight, master case ledger, staff directory, revenue analytics, service catalog, settings, and communication center.
- **CA Manager Workspace (`/staff/dashboard`)**: Dedicated Chartered Accountancy workflow workspace owning GST, ITR, and company incorporation customer cases. Features live KPI cards, unassigned intake triage, agent workload balancing, document verification vault, and manager review sign-off queue.

## Tech Stack
- React 18 + TypeScript + Vite
- Vanilla CSS Design System with `--tx-*` design tokens
- Fully responsive (desktop, tablet, mobile off-canvas drawer)
- Vitest unit testing suite
- Advanced Modular Monolith code structure with zero loops and strict $\le 490$ line-length enforcement

## Getting Started

```bash
# Navigate to frontend project
cd taxedge-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Quality Gate & Verification

```bash
cd taxedge-frontend

# Run TypeScript typecheck
npm run typecheck

# Run unit tests
npm test

# Verify all source files adhere to line limits (<= 490 lines)
npm run check:lines

# Production build
npm run build
```
