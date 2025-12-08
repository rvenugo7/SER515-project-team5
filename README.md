# Agile Tool (SER515 Team 5)
Spring Boot REST API backend with a React/TypeScript frontend for managing scrum projects, product backlogs, release plans, and exprot user stories.

## Team Members
- Hima Varshitha Pagolu, hpagolu
- Mateusz Grabowski, mgrabow3
- Prathik Shetty, pjshett3
- Ramchander Venugopal, rvenugo7

## What you can do
- User authentication with role-based access (Product Owner, Scrum Master, Developer). System Admins must be created manually if needed.
- Create and browse projects and manage membership/roles.
- Build and groom the product backlog: create, edit, delete stories, estimate points, set priorities, mark sprint-ready, star user stories, MVP, and track status via the Kanban board.
- Create and manage release plans, link user stories and filter by project or status.
- Export user stories to Jira using JIRA API Token.

## Project layout
- Backend: `src/main/java/com/asu/ser515/agiletool`, Spring config in `src/main/resources/application.properties`.
- Frontend (Vite + React): `frontend/`.
- Database: SQLite file at `agile_tool.db` in the project root.

## Prerequisites
- Java 21
- Maven (wrapper included, no global install required)
- Node.js 18+ and npm

## Run the backend
From the project root:

# macOS/Linux
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run

Backend listens on `http://localhost:8080` and writes to `agile_tool.db`. Delete that file to reset local data. Adjust ports or database paths in `src/main/resources/application.properties`.

## Run the frontend

cd frontend
npm install
npm run dev

App runs on `http://localhost:3000` with a dev proxy to the backend on port 8080. Use the Login tab to sign in; Register supports Product Owner, Scrum Master, or Developer (System Admin cannot self-register).

## Jira integration
Set these environment variables (or override in `application.properties`) for Jira exports:
- `JIRA_BASE_URL`
- `JIRA_USER_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`
- Using these fields, we find out the following fields. 
- `JIRA_ISSUE_TYPE_ID`
- `JIRA_STORY_POINTS_FIELD_ID`
=

# Backend tests
./mvnw test
# Frontend type checks and build
cd frontend
npm run typecheck
npm run build

## First login / seed data
- The backend seeds a system admin account on startup: username `admin`, password `admin`. Use it to get in the first time (you can register your own Product Owner/Scrum Master/Developer accounts afterward).
- There are no sample projects by default. After logging in, open the Projects view and click **Create Project**; a project code is generated automatically, therefore you have no need to know an 8-character code ahead of time.
- To reset local data, stop the backend and delete `agile_tool.db`, then restart `./mvnw spring-boot:run` to recreate the DB and the default admin.
- The Sprint Ready button is enabled only for the Product Owner and Scrum Master, rest are not capable of interacting with it.

## Using the app (quick guide)
- Sign in: Open `http://localhost:3000`. Register as Product Owner, Scrum Master, or Developer (System Admin must be created manually), then log in.
- Create a project: As Product Owner or Scrum Master, create a project and assign members/roles; a project key is generated automatically.
- Backlog: Create user stories with title, description, acceptance criteria, business value, and priority. Edit or delete as needed.
- Kanban: Drag stories across Backlog → In Progress → Done; filtering by priority and search is available.
- Estimation & readiness: Set story points, mark sprint-ready, star important items, and flag MVP candidates.
- Release plans: Product Owner/System Admin can create release plans, link/unlink stories, and list by project or status.
- Jira export: From a story, export to Jira using configured credentials or provide override credentials in the request.

## Tips
- Ensure the backend is running before logging in or making API calls from the frontend.
- Update `jwt.secret` in `application.properties` before any production use.
- If you change the backend port, also update `frontend/vite.config.js` proxy settings.
