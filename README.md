
# DataStraw Roster Management System

## Project Overview
DataStraw Roster Management is a web-based application developed to manage employees, brands, processes, pods, and monthly employee rosters.

The application helps generate monthly rosters, manage employee leaves and holidays, validate roster assignments, and assign backup employees for leave coverage.

## Technologies Used
- React.js
- Vite
- Node.js
- Express.js
- MongoDB
- Mongoose
- CSS
- REST API

## Features
- Dashboard with employee and business statistics
- Employee Management
- Brand Management
- Process Management
- Pod Management
- Monthly Roster Generation
- Roster Validation
- Leave Management
- Holiday Management
- Backup Employee Assignment
- Detection of coverage gaps and overlapping shifts

## Project Structure
```text
roast management/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── index.html
└── README.md
```

## Prerequisites
- Node.js
- npm
- MongoDB

## Installation and Setup

### Backend Setup

Open a terminal and run:

```bash
cd backend
npm install
```

Configure the MongoDB connection string and required environment variables in the backend `.env` file.

Start the backend server:

```bash
npm start
```

Backend URL:

http://localhost:5000

### Frontend Setup

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

http://localhost:5173

## Production Build

To generate the production build:

```bash
cd frontend
npm run build
```

The production build is generated inside the `frontend/dist` folder.

## Database
The application uses MongoDB to store employee, brand, process, pod, roster, leave, and holiday information.

## Author
Developed as a DataStraw Roster Management project.
