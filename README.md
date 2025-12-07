# Agile Tool (SER515 Team 5)
Spring Boot REST API backend with a React/TypeScript frontend for managing scrum projects, product backlogs, release plans, and user roles.

## What you can do
- User authentication with role-based access (Product Owner, Scrum Master, Developer). System Admins must be created manually if needed.
- Create and browse projects, manage membership/roles, and generate project keys automatically.
- Build and groom the product backlog: create/edit/delete stories, estimate points, set priorities, mark sprint-ready/starred/MVP, and track status via the Kanban board.
- Create and manage release plans; link/unlink user stories and filter by project/status.
- Export user stories to Jira using stored credentials or request-time overrides.

## Project layout
- Backend: `src/main/java/com/asu/ser515/agiletool`, Spring config in `src/main/resources/application.properties`.
- Frontend (Vite + React): `frontend/`.
- Database: SQLite file at `agile_tool.db` in the project root (auto-created/updated by JPA).

## Prerequisites
- Java 21
- Maven (wrapper included, no global install required)
- Node.js 18+ and npm

## Run the backend
From the project root:
```bash
# macOS/Linux
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```
Backend listens on `http://localhost:8080` and writes to `agile_tool.db`. Delete that file to reset local data. Adjust ports or database paths in `src/main/resources/application.properties`.

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:3000` with a dev proxy to the backend on port 8080. Use the Login tab to sign in; Register supports Product Owner, Scrum Master, or Developer (System Admin cannot self-register).

## Jira integration
Set these environment variables (or override in `application.properties`) for Jira exports:
- `JIRA_BASE_URL`
- `JIRA_USER_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`
- `JIRA_ISSUE_TYPE_ID`
- `JIRA_STORY_POINTS_FIELD_ID`
Per-request overrides are also supported via the export API.

## Tests and checks
```bash
# Backend tests
./mvnw test
# Frontend type checks and build
cd frontend
npm run typecheck
npm run build
```

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
