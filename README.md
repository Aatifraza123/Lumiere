# Festo Event Management System

Full-stack event management application with MERN stack.

## Quick Start

### Start Both Servers (Recommended)
```powershell
npm run dev
```

This will automatically:
- Clear ports 5000 and 5173 if they're in use
- Start both backend and frontend servers together

### Start Servers Separately

**Backend only:**
```powershell
npm run dev:backend
```

**Frontend only:**
```powershell
npm run dev:frontend
```

### Clear Ports Manually (if needed)
```powershell
npm run kill:ports
```

## Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Installation

Install all dependencies:
```powershell
npm run install:all
```

## Troubleshooting

If you get `EADDRINUSE` error (port already in use):

1. Run `npm run kill:ports` to clear ports
2. Or use `npm run dev` which automatically clears ports before starting

## Project Structure

```
Festo/
├── backend/          # Express.js API server
├── frontend/         # React + Vite frontend
└── package.json      # Root package.json for running both servers
```











