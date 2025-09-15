-- Enable the "uuid-ossp" extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth0_id VARCHAR(255) UNIQUE NOT NULL, -- Auth0 user ID
  username VARCHAR(255) UNIQUE NOT NULL, -- Primary username (GitHub or GitLab)
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(255),
  company VARCHAR(255),
  blog VARCHAR(255),
  twitter_username VARCHAR(255),
  email VARCHAR(255),
  is_claimed BOOLEAN DEFAULT false, -- Whether user has claimed their profile
  github_username VARCHAR(255),
  gitlab_username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider accounts table (for linked GitHub/GitLab accounts)
CREATE TABLE provider_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'github' or 'gitlab'
  provider_account_id VARCHAR(255) NOT NULL, -- Provider's user ID
  username VARCHAR(255) NOT NULL, -- Username on the provider
  access_token_encrypted TEXT, -- Encrypted token for API access
  scope TEXT, -- Token permissions
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(provider, provider_account_id),
  UNIQUE(profile_id, provider)
);

-- Merged activity data (cached from GitHub + GitLab APIs)
CREATE TABLE activity_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  github_contributions INTEGER DEFAULT 0,
  gitlab_contributions INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  repositories_contributed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profile_id, date)
);

-- Detailed repository data
CREATE TABLE repositories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'github' or 'gitlab'
  external_id VARCHAR(255) NOT NULL, -- Repository ID from provider
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(100),
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  is_fork BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  html_url TEXT,
  created_at_provider TIMESTAMP WITH TIME ZONE,
  updated_at_provider TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider, external_id)
);

-- Badge definitions
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'night-owl', 'veteran'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Icon name for UI
  criteria_type VARCHAR(50) NOT NULL, -- 'commits', 'stars', 'years', 'repositories', etc.
  criteria_threshold INTEGER, -- Minimum value needed
  criteria_timeframe VARCHAR(50), -- 'all_time', 'last_month', 'last_year'
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (achievements earned by users)
CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criteria_value INTEGER, -- The actual value that earned the badge
  
  UNIQUE(profile_id, badge_id)
);

-- Shareable profile links
CREATE TABLE share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE NOT NULL, -- Short URL slug
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_auth0_id ON profiles(auth0_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_github_username ON profiles(github_username);
CREATE INDEX idx_profiles_gitlab_username ON profiles(gitlab_username);
CREATE INDEX idx_provider_accounts_profile_id ON provider_accounts(profile_id);
CREATE INDEX idx_provider_accounts_provider ON provider_accounts(provider);
CREATE INDEX idx_activity_data_profile_id ON activity_data(profile_id);
CREATE INDEX idx_activity_data_date ON activity_data(date);
CREATE INDEX idx_repositories_profile_id ON repositories(profile_id);
CREATE INDEX idx_user_badges_profile_id ON user_badges(profile_id);
CREATE INDEX idx_share_links_slug ON share_links(slug);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();