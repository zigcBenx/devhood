# DevHood Setup Guide

This guide will help you set up the DevHood project with Auth0, Supabase, and all required integrations.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Auth0 account
- Supabase account
- GitHub Personal Access Token
- GitLab Personal Access Token (optional)

## 1. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

## 2. Auth0 Configuration

1. **Create Auth0 Application:**
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new Single Page Application
   - Note your Domain and Client ID

2. **Configure Callback URLs:**
   ```
   Allowed Callback URLs: http://localhost:5173/callback, https://yourdomain.com/callback
   Allowed Logout URLs: http://localhost:5173, https://yourdomain.com
   Allowed Web Origins: http://localhost:5173, https://yourdomain.com
   ```

3. **Enable Social Connections:**
   - Go to Authentication > Social
   - Enable GitHub:
     - Create GitHub OAuth App at https://github.com/settings/developers
     - Set Authorization callback URL: `https://YOUR_AUTH0_DOMAIN/login/callback`
     - Add Client ID and Secret to Auth0
   - Enable GitLab:
     - Create GitLab OAuth App at https://gitlab.com/-/profile/applications
     - Set Redirect URI: `https://YOUR_AUTH0_DOMAIN/login/callback`
     - Add Application ID and Secret to Auth0

4. **Configure Account Linking:**
   - Go to Auth0 Dashboard > Authentication > Database
   - Enable "Account Linking" in your connection settings
   - Configure rules for automatic account linking

## 3. Supabase Configuration

1. **Create Supabase Project:**
   - Go to [Supabase](https://supabase.com/)
   - Create new project
   - Note your URL and anon key

2. **Run Database Migrations:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Run migrations
   supabase db push
   ```

3. **Deploy Edge Functions:**
   ```bash
   # Deploy sync function
   supabase functions deploy sync-user-data
   
   # Deploy badge calculation function
   supabase functions deploy calculate-badges
   
   # Deploy OG image generation function
   supabase functions deploy generate-og-image
   ```

4. **Configure Row Level Security (RLS):**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE provider_accounts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
   
   -- Create policies for profiles (public read, user can update own)
   CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth0_id = auth.jwt() ->> 'sub');
   
   -- Create policies for user badges (public read)
   CREATE POLICY "User badges are publicly readable" ON user_badges FOR SELECT USING (true);
   ```

## 4. GitHub & GitLab API Tokens

1. **GitHub Token:**
   - Go to https://github.com/settings/tokens
   - Create token with `public_repo` scope
   - Add to `.env` as `VITE_GITHUB_TOKEN`

2. **GitLab Token:**
   - Go to https://gitlab.com/-/profile/personal_access_tokens
   - Create token with `read_api` scope
   - Add to `.env` as `VITE_GITLAB_TOKEN`

## 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 6. Deployment

### Vercel Deployment

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Configure Environment Variables:**
   - Add all environment variables from `.env` to Vercel dashboard
   - Update Auth0 callback URLs to include production domain

### Netlify Deployment

1. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Configure Environment Variables:**
   - Add all environment variables to Netlify dashboard
   - Update Auth0 callback URLs

## 7. Testing the Integration

1. **Test Authentication:**
   - Visit your deployed site
   - Click "Claim Your Profile" 
   - Login with GitHub
   - Verify profile creation in Supabase

2. **Test Account Linking:**
   - While logged in, click "Link GitLab"
   - Authorize GitLab connection
   - Verify both accounts are linked

3. **Test Data Sync:**
   - Click "Sync Data" in user menu
   - Check Supabase tables for populated data
   - Verify badges are calculated and awarded

## 8. Customization

### Adding New Badges

1. Add badge definition to `supabase/migrations/002_seed_badges.sql`
2. Update badge calculation logic in `supabase/functions/calculate-badges/index.ts`
3. Add corresponding icons to `src/components/BadgeDisplay.vue`

### Customizing UI

- Colors: Modify Tailwind classes throughout components
- Icons: Replace Lucide icons with your preferred icon library
- Styling: Update component styles in individual `.vue` files

## Troubleshooting

### Common Issues

1. **Auth0 Login Loop:**
   - Check callback URLs match exactly
   - Verify domain configuration

2. **Supabase Connection Issues:**
   - Verify URL and keys are correct
   - Check RLS policies allow access

3. **API Rate Limits:**
   - GitHub: 60 requests/hour without token, 5000 with token
   - GitLab: Rate limits vary by plan

4. **Badge Calculation Not Working:**
   - Check Edge Function logs in Supabase
   - Verify activity data is being synced

### Getting Help

- Check browser console for errors
- Review Supabase function logs
- Verify environment variables are set correctly
- Check Auth0 logs for authentication issues

## Security Considerations

1. **Token Storage:**
   - Provider tokens are encrypted in Supabase
   - Use Auth0's secure token management

2. **API Security:**
   - All Supabase functions use RLS
   - Rate limiting on API endpoints

3. **Data Privacy:**
   - Only public GitHub/GitLab data is accessed
   - Users control what data is shared

## Production Checklist

- [ ] All environment variables configured
- [ ] Auth0 production settings configured
- [ ] Supabase production database setup
- [ ] Edge Functions deployed
- [ ] Domain configured with HTTPS
- [ ] Analytics and monitoring setup
- [ ] Error tracking configured
- [ ] Backup strategy implemented

## Next Steps

- Set up monitoring and analytics
- Implement user feedback system
- Add more achievement badges
- Create API documentation
- Set up automated testing