# DataStraw Roster Management System

## Project Overview

DataStraw Roster Management is a full-stack web application developed to manage employees, brands, processes, pods, and monthly employee rosters.

The application helps roster managers generate monthly schedules, manage employee leaves and holidays, validate roster assignments, identify staffing conflicts, and assign backup employees when required.

## Live Application

- **Application URL:** Add your deployed application URL here
- **GitHub Repository:** Add your GitHub repository URL here

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

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
- Detection of coverage gaps
- Detection of overlapping shifts
- Roster details and assignment status tracking

## Project Structure

```text
DataStraw-Roster-Management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or a MongoDB Atlas account
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd DataStraw-Roster-Management
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository URL.

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

Configure the required environment variables, including the MongoDB connection string.

Start the backend server:

```bash
npm start
```

If your backend package uses a different start script, run the script defined in `backend/package.json`.

The backend runs locally at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

## Production Build

To create the production build of the frontend:

```bash
cd frontend
npm run build
```

The production build is generated in:

```text
frontend/dist/
```

## Database

The application uses MongoDB to store and manage:

- Employees
- Brands
- Processes
- Pods
- Assignments
- Rosters
- Leaves
- Holidays

Mongoose is used for database schemas, relationships, and data operations.

## Tell Us How You Think

### 1. How did you model employees, brands, processes, pods, and their relationships?

I used separate MongoDB collections for employees, brands, processes, pods, and assignments. Assignments connect employees with brands and processes, while pods group employees for roster management. This structure reduces unnecessary data duplication and makes the relationships easier to maintain.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?

The system generates monthly roster entries using employee assignments, working days, weekly offs, leaves, and holidays. After generation, validation checks for issues such as insufficient coverage and overlapping shifts. Validation results help the roster manager identify and correct problems before finalizing the roster.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?

The system uses assignment and coverage information to determine staffing requirements. A brand requiring one employee can be scheduled with a single resource, while a brand requiring multiple employees can have multiple assignments to meet its coverage requirements.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?

The employee's leave or unavailability is considered during roster generation and validation. If no suitable replacement is available, the system identifies a coverage gap. A backup employee can be assigned to help maintain the required coverage.

### 5. How does your system handle conflicting requirements or insufficient staffing?

The system detects conflicts such as overlapping shifts and insufficient employee coverage. Instead of silently ignoring these issues, it reports validation errors so the roster manager can review the situation and make appropriate changes.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?

I automated monthly roster generation, scheduling, leave and holiday handling, and roster validation. I kept decisions such as leave approval, backup assignment, and reviewing validation errors under human control because they may require business judgment and operational priorities.

### 7. If the company doubled its team and brand count, what would you change about your solution?

I would improve database indexing, introduce pagination and filtering for large datasets, and optimize roster generation and validation. I would also consider background jobs for large roster generation tasks and improve API monitoring and error handling.

### 8. If you had one additional week to work on this, what would you improve first?

I would focus on improving the roster generation algorithm, adding more comprehensive automated tests, and strengthening validation for complex staffing scenarios. I would also improve the user experience for reviewing conflicts and assigning backup employees.

## Security and Environment Variables

Environment variables are used for configuration such as the MongoDB connection string and server port.

The `.env` file contains private configuration and should not be committed to GitHub.

Use `.env.example` as a template to configure the application locally.

## Author

Developed by **Shravani Shinde**

DataStraw Roster Management System Assignment
