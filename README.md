# DevHood

DevHood is a developer profile aggregator that fetches and displays GitHub and GitLab profiles with OAuth integration.

## Features

- **Profile Viewing** – View GitHub profiles by username
- **Profile Claiming** – Authenticate with GitHub or GitLab to claim and customize your profile
- **OAuth Integration** – Connect multiple accounts (GitHub, GitLab)
- **Activity Tracking** – Track contributions and repositories across platforms
- **SQLite Database** – Local data storage for claimed profiles and OAuth connections

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub OAuth Application (optional, for authentication)
- GitLab OAuth Application (optional, for GitLab integration)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd devhood
```

### 2. Install Dependencies

```bash
# Install root dependencies (frontend)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

#### Required for Basic Functionality:
- `CLIENT_URL` - Frontend URL (default: `http://localhost:5174`)
- `PORT` - Backend port (default: `3001`)

#### Optional (for GitHub API rate limits):
- `VITE_GITHUB_TOKEN` - GitHub Personal Access Token
  - Get one at: https://github.com/settings/tokens
  - Only needs `public_repo` scope

#### Required for OAuth Authentication:
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
  - Create at: https://github.com/settings/developers
  - Authorization callback URL: `http://localhost:5174/auth/github/callback`

- `GITLAB_CLIENT_ID` & `GITLAB_CLIENT_SECRET`
  - Create at: https://gitlab.com/-/profile/applications
  - Redirect URI: `http://localhost:5174/auth/gitlab/callback`
  - Scopes: `read_user`, `read_api`

- `SESSION_SECRET` - Random secret for session management
  - Generate with: `openssl rand -hex 32`

### 4. Initialize the Database

The SQLite database will be automatically created when you start the server. It will be located at `server/devhood.db`.

### 5. Run the Application

#### Development Mode (both frontend and backend):

```bash
npm run full:dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

#### Access the Application:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001/api

## Project Structure

```
devhood/
├── server/              # Backend (Express + SQLite)
│   ├── database.js      # Database setup and operations
│   ├── server.js        # Express server
│   ├── devhood.db       # SQLite database (auto-generated)
│   └── routes/          # API routes
│       ├── auth.js      # OAuth authentication
│       ├── profile.js   # Profile management
│       └── assets.js    # Asset serving
├── src/                 # Frontend (Vue 3 + TypeScript)
│   ├── components/      # Vue components
│   ├── services/        # API services
│   └── views/           # Page views
├── .env                 # Environment configuration (create from .env.example)
└── .env.example         # Environment template
```

## Configuration Reference

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CLIENT_URL` | Frontend application URL | `http://localhost:5174` | Yes |
| `PORT` | Backend server port | `3001` | No |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | - | For OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | - | For OAuth |
| `GITLAB_CLIENT_ID` | GitLab OAuth Client ID | - | For OAuth |
| `GITLAB_CLIENT_SECRET` | GitLab OAuth Secret | - | For OAuth |
| `SESSION_SECRET` | Session encryption key | - | For OAuth |
| `VITE_GITHUB_TOKEN` | GitHub API token (optional) | - | No |
| `VITE_GITLAB_TOKEN` | GitLab API token (optional) | - | No |

### Production Deployment

For production, update the following in your `.env`:

```bash
NODE_ENV=production
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

And update OAuth callback URLs in GitHub/GitLab applications to match your production domain.

## Planned Improvements

- Achievements system (Night Owl, Veteran, Open Source Legend, etc.)
- Shareable profile cards with social media preview images
- Activity visualizations and contribution graphs
- Bitbucket integration
- Premium features (contact forms, hire me section)
