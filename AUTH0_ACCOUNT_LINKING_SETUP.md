# Auth0 Account Linking Setup

To fix the issue where GitHub and GitLab connections create separate profiles, you need to configure Auth0 Account Linking.

## Step 1: Enable Account Linking Extension (Recommended)

1. Go to Auth0 Dashboard → Extensions
2. Install "Account Link Extension" 
3. Configure it to automatically link accounts with matching email addresses

## Step 2: Alternative - Auth0 Action/Rule

If the extension doesn't work, create a custom Auth0 Action:

1. Go to Auth0 Dashboard → Actions → Flows
2. Select "Login" flow
3. Create a new Action with this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const ManagementClient = require('auth0').ManagementClient;
  
  const management = new ManagementClient({
    domain: event.secrets.DOMAIN,
    clientId: event.secrets.CLIENT_ID,
    clientSecret: event.secrets.CLIENT_SECRET,
    scope: 'read:users update:users'
  });

  const { user } = event;
  
  // Only run for social connections (GitHub/GitLab)
  if (user.identities.length === 1) {
    return;
  }

  try {
    // Find existing user with same email
    const existingUsers = await management.getUsersByEmail(user.email);
    
    // If there's another user with same email, link the accounts
    if (existingUsers.length > 1) {
      const primaryUser = existingUsers.find(u => u.user_id !== user.user_id);
      
      if (primaryUser) {
        // Link current identity to primary user
        await management.linkUsers(primaryUser.user_id, {
          provider: user.identities[0].provider,
          user_id: user.identities[0].user_id
        });
        
        // Continue login with primary user
        api.redirect.sendUserTo(`https://your-app.com/callback?user_id=${primaryUser.user_id}`);
      }
    }
  } catch (error) {
    console.log('Account linking failed:', error);
  }
};
```

## Step 3: Configure Social Connections

1. Go to Auth0 Dashboard → Authentication → Social
2. For both GitHub and GitLab connections:
   - Enable "Sync user profile attributes at each login"
   - Request email scope
   - Enable "Use Auth0 instead of the IdP to do Single Sign On"

## Step 4: Application Changes

The application code has been updated to:
- Store provider accounts in the `provider_accounts` table
- Link multiple providers to a single profile
- Show connected providers correctly in the UI

## Step 5: Test the Flow

1. Clear your browser cache/cookies
2. Connect with GitHub first (this claims the profile)
3. Then connect GitLab - it should link to the same profile instead of creating a new one
4. Check the database - you should see:
   - One row in `profiles` table
   - Two rows in `provider_accounts` table (one for GitHub, one for GitLab)

## Troubleshooting

If accounts are still not linking:
1. Check Auth0 logs for errors
2. Verify both connections have email scope
3. Make sure emails match between GitHub and GitLab accounts
4. Consider implementing manual account linking in the app UI