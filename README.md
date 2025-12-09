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

## How to Run

### Prerequisites
- Java 21+
- Node.js 18+

### Step 1: Start Backend
```bash
# From project root
./mvnw spring-boot:run          # macOS/Linux
mvnw.cmd spring-boot:run        # Windows
```
Backend runs on: `http://localhost:8080`

### Step 2: Start Frontend
```bash
# Open new terminal (project root)
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Step 3: Access Application
Open browser to `http://localhost:3000`

Backend writes to `agile_tool.db`. Delete that file to reset local data. Adjust ports or database paths in `src/main/resources/application.properties`.

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

## User Roles & Permissions

**Developer**
- Can manage stories and use Kanban board
- Cannot create projects or releases

**Scrum Master**
- Can create releases
- Can manage stories and use Kanban board

**Product Owner**
- Can create projects and releases
- Can manage stories and use Kanban board
- Cannot mark story as sprint ready

**System Admin**
- Full access to all features(Except marking story as sprint ready)
- Can manage users and view all projects

---

## Using the app (quick guide)
- Sign in: Open `http://localhost:3000`. Register as Product Owner, Scrum Master, or Developer (System Admin must be created manually), then log in.
- Create a project: As Product Owner or Scrum Master, create a project and assign members/roles; a project key is generated automatically.
- Backlog: Create user stories with title, description, acceptance criteria, business value, and priority. Edit or delete as needed.
- Kanban: Drag stories across Backlog → In Progress → Done; filtering by priority and search is available.
- Estimation & readiness: Set story points, mark sprint-ready, star important items, and flag MVP candidates.
- Release plans: Product Owner/System Admin can create release plans, link/unlink stories, and list by project or status.
- Jira export: From a story, export to Jira using configured credentials or provide override credentials in the request.

## Creating and Joining Projects

### Create a Project (Product Owner/Admin)
1. Click **+** in sidebar
2. Enter project name and description
3. Click **"Create"**
4. Share the generated project code with team members

### Join a Project (Developer/Scrum Master)
1. Click **→** in sidebar
2. Enter the project code from project owner
3. Click **"Join"**
4. Project now appears in your project list

## Tips
- Ensure the backend is running before logging in or making API calls from the frontend.
- Update `jwt.secret` in `application.properties` before any production use.
- If you change the backend port, also update `frontend/vite.config.js` proxy settings.
