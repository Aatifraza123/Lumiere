# Database Seeding Instructions

## Overview
This script seeds the database with mock venues and services data for development and testing purposes.

## Prerequisites
1. MongoDB should be running
2. `.env` file should be configured with `MONGODB_URI`
3. All dependencies should be installed (`npm install`)

## How to Run

### Option 1: Using npm script
```bash
cd backend
npm run seed:data
```

### Option 2: Direct node command
```bash
cd backend
node scripts/seedData.js
```

## What Gets Seeded

### Venues (5 venues)
- The Grand Royale (Mumbai)
- Crystal Palace (Delhi)
- Azure Gardens (Bangalore)
- Royal Heritage (Jaipur)
- Ocean View Banquet (Goa)

### Services (8 services)
- Wedding Planning (₹50,000)
- Corporate Event (₹40,000)
- Party Planning (₹30,000)
- Anniversary Celebration (₹35,000)
- Engagement Ceremony (₹25,000)
- Birthday Party (₹20,000)
- Baby Shower (₹18,000)
- Reception Party (₹45,000)

### Gallery (8 items)
- Royal Wedding Celebration
- Corporate Annual Meet
- Birthday Bash
- Golden Anniversary
- Engagement Ceremony
- Wedding Reception
- Product Launch Event
- New Year Party

## Features
- ✅ Duplicate check - Won't create duplicates if data already exists
- ✅ Uses same ObjectIds as frontend mock data
- ✅ Proper data structure matching models
- ✅ Safe to run multiple times

## Notes
- The script checks if data already exists before creating
- If a venue/service with the same ID exists, it will skip it
- All data is marked as `isActive: true`
- Featured venues are marked appropriately

## Troubleshooting

### Error: Cannot find module
Make sure you're in the `backend` directory and have run `npm install`

### Error: MongoDB connection failed
Check your `.env` file and ensure MongoDB is running:
```bash
# Check MongoDB connection string in .env
MONGODB_URI=mongodb://localhost:27017/festo
```

### Error: E11000 duplicate key
This means data already exists. The script will skip duplicates automatically.

