# DevHood Development Setup

## Quick Start

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
npm run server:install
```

### 2. Set Up GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
   - Or visit: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `DevHood Local Dev`
   - **Homepage URL**: `http://localhost:5173`
   - **Application description**: `DevHood profile claiming - local development`
   - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 3. Set Up GitLab OAuth App (Optional)

1. Go to GitLab Settings → Applications
   - Or visit: https://gitlab.com/-/profile/applications
2. Fill in the details:
   - **Name**: `DevHood Local Dev`
   - **Redirect URI**: `http://localhost:5173/auth/gitlab/callback`
   - **Scopes**: Check `read_user` and `read_api`
3. Click "Save application"
4. Copy the **Application ID** and **Secret**

### 4. Update Environment Variables

Edit `.env` file and replace the placeholder values:

```env
# OAuth Configuration for Backend
CLIENT_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_actual_github_client_id_here
GITHUB_CLIENT_SECRET=your_actual_github_client_secret_here
GITLAB_CLIENT_ID=your_actual_gitlab_client_id_here
GITLAB_CLIENT_SECRET=your_actual_gitlab_client_secret_here
```

### 5. Start Development Servers

```bash
# Option 1: Start both servers together
npm run full:dev

# Option 2: Start separately (in different terminals)
npm run server:dev  # Backend on :3001
npm run dev         # Frontend on :5173
```

### 6. Test the Claim Flow

1. Open http://localhost:5173
2. Enter any GitHub username (e.g., `octocat`)
3. Click "Claim This Profile"
4. Try the GitHub authentication

## Troubleshooting

### GitHub 404 Error
- Make sure your GitHub OAuth app is created
- Check that `GITHUB_CLIENT_ID` is set correctly in `.env`
- Verify the callback URL matches: `http://localhost:5173/auth/github/callback`

### Backend Not Found
- Make sure backend is running on port 3001
- Check `VITE_API_URL=http://localhost:3001/api` in `.env`

### OAuth Callback Issues
- GitHub callback URL: `http://localhost:5173/auth/github/callback`
- GitLab callback URL: `http://localhost:5173/auth/gitlab/callback`

## API Endpoints

### Backend API (http://localhost:3001/api)
- `GET /auth/github/url/:username` - Get GitHub OAuth URL
- `POST /auth/github/connect` - Exchange GitHub code for token
- `GET /auth/gitlab/url/:username` - Get GitLab OAuth URL
- `POST /auth/gitlab/connect` - Exchange GitLab code for token
- `POST /profile/claim/:username` - Claim a profile
- `GET /profile/status/:username` - Get profile status
- `GET /assets/card/:username/:format` - Generate profile cards
- `GET /assets/graph/:username/:format` - Generate contribution graphs
- `GET /assets/stats/:username/:format` - Generate stats widgets

### Test Endpoints
```bash
# Test backend health
curl http://localhost:3001/api/health

# Test GitHub OAuth URL generation
curl http://localhost:3001/api/auth/github/url/testuser
```

## Architecture

```
DevHood/
├── src/                    # Vue.js frontend
│   ├── views/
│   │   └── ClaimProfilePage.vue
│   ├── components/
│   │   ├── ProfileCustomization.vue
│   │   └── ProfileAssetGenerator.vue
│   └── services/
│       └── api.ts          # Backend API service
├── server/                 # Node.js backend
│   ├── routes/
│   │   ├── auth.js         # OAuth handling
│   │   ├── profile.js      # Profile management
│   │   └── assets.js       # Asset generation
│   └── server.js           # Express server
└── .env                    # Environment variables
```