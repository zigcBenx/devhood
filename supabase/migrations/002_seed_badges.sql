-- Insert default badges
INSERT INTO badges (slug, name, description, icon, criteria_type, criteria_threshold, criteria_timeframe, rarity) VALUES 
  -- Time-based badges
  ('night-owl', 'Night Owl', 'More than 10 commits between 11 PM and 6 AM in the last month', 'Moon', 'night_commits', 10, 'last_month', 'common'),
  ('weekend-warrior', 'Weekend Warrior', 'More than 20 contributions on weekends in the last month', 'Calendar', 'weekend_commits', 20, 'last_month', 'common'),
  ('early-bird', 'Early Bird', 'More than 15 commits between 5 AM and 9 AM in the last month', 'Sunrise', 'morning_commits', 15, 'last_month', 'common'),
  
  -- Productivity badges
  ('prolific', 'Prolific Coder', 'More than 50 public repositories', 'GitCommit', 'repositories', 50, 'all_time', 'common'),
  ('prolific-plus', 'Super Prolific', 'More than 100 public repositories', 'GitCommit', 'repositories', 100, 'all_time', 'rare'),
  ('streak-master', 'Streak Master', 'Contributed for 30 consecutive days', 'Flame', 'contribution_streak', 30, 'all_time', 'rare'),
  
  -- Social badges
  ('popular', 'Popular Developer', 'More than 100 followers', 'Users', 'followers', 100, 'all_time', 'common'),
  ('influencer', 'Tech Influencer', 'More than 1000 followers', 'Users', 'followers', 1000, 'all_time', 'rare'),
  ('star-collector', 'Star Collector', 'Earned more than 500 total stars', 'Star', 'total_stars', 500, 'all_time', 'common'),
  ('star-legend', 'Star Legend', 'Earned more than 5000 total stars', 'Star', 'total_stars', 5000, 'all_time', 'epic'),
  
  -- Experience badges
  ('veteran', 'Veteran Developer', 'Account created more than 5 years ago', 'Shield', 'account_age_years', 5, 'all_time', 'common'),
  ('pioneer', 'Open Source Pioneer', 'Account created more than 10 years ago', 'Shield', 'account_age_years', 10, 'all_time', 'rare'),
  
  -- Language diversity badges
  ('polyglot', 'Polyglot', 'Uses more than 10 different programming languages', 'Code', 'languages', 10, 'all_time', 'common'),
  ('master-polyglot', 'Master Polyglot', 'Uses more than 20 different programming languages', 'Code', 'languages', 20, 'all_time', 'rare'),
  
  -- Activity badges
  ('consistent', 'Consistent Contributor', 'Contributed in at least 200 days this year', 'Activity', 'contribution_days', 200, 'this_year', 'common'),
  ('machine', 'Coding Machine', 'More than 1000 contributions in the last year', 'Zap', 'contributions', 1000, 'last_year', 'rare'),
  ('unstoppable', 'Unstoppable Force', 'More than 2000 contributions in the last year', 'Zap', 'contributions', 2000, 'last_year', 'epic'),
  
  -- Special achievements
  ('open-source-hero', 'Open Source Hero', 'Contributed to more than 50 different repositories', 'Heart', 'contributed_repos', 50, 'all_time', 'rare'),
  ('maintainer', 'Project Maintainer', 'Owns repositories with more than 100 total stars', 'Crown', 'owned_repo_stars', 100, 'all_time', 'rare'),
  ('architect', 'Software Architect', 'Created repositories in more than 5 different languages', 'Layers', 'repo_languages', 5, 'all_time', 'common');