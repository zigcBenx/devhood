# Auth0 Setup for DevHood

## Quick Setup Guide

### 1. Configure Your Auth0 Application

In your [Auth0 Dashboard](https://manage.auth0.com/):

1. **Go to Applications → Your DevHood App**
2. **Settings tab → Application URIs:**
   - Allowed Callback URLs: `http://localhost:5173/callback`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
3. **Save Changes**

### 2. Set up GitHub Social Connection

1. **In Auth0: Authentication → Social → GitHub**
2. **Create GitHub OAuth App:**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - Application name: `DevHood Local`
     - Homepage URL: `http://localhost:5173`
     - Authorization callback URL: `https://devhood.eu.auth0.com/login/callback`
   - Copy Client ID and Client Secret
3. **Back in Auth0:** Paste the GitHub credentials and enable the connection
4. **Enable for your application** in the Applications tab

### 3. Set up GitLab Social Connection

1. **In Auth0: Authentication → Social → GitLab**
2. **Create GitLab OAuth App:**
   - Go to https://gitlab.com/-/profile/applications
   - Fill in:
     - Name: `DevHood Local`
     - Redirect URI: `https://devhood.eu.auth0.com/login/callback`
     - Scopes: Check `read_api` and `read_user`
   - Save application
   - Copy Application ID and Secret
3. **Back in Auth0:** Paste the GitLab credentials and enable the connection
4. **Enable for your application** in the Applications tab

### 4. Test the Setup

1. **Visit http://localhost:5173/torvalds** (or any GitHub username)
2. **Click "Claim Your Profile"** - should redirect to Auth0
3. **Login with GitHub** - should redirect back to your app
4. **After login, try "Link GitLab"** - should work if configured

## Troubleshooting

**"Claim Profile" button doesn't appear:**
- Check that you're visiting a profile page (e.g., /username)
- Button only shows for unclaimed profiles

**GitHub/GitLab login fails:**
- Verify callback URLs match exactly
- Check that connections are enabled for your application
- Make sure OAuth apps use the correct Auth0 callback URL

**Connection works but no data syncs:**
- You need to set up the Supabase database first
- Run the SQL migrations in your Supabase dashboard

## Current Status Check

You can test each step:
1. ✅ Basic app loads at http://localhost:5173
2. ❓ GitHub profiles display (try /torvalds)
3. ❓ Auth0 login works ("Claim Profile" button)
4. ❓ GitLab connection works (after GitHub login)
5. ❓ Database setup (for full functionality)