import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'devhood.db')

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath)
  }
})

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create profiles table
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          display_name TEXT,
          bio TEXT,
          location TEXT,
          website TEXT,
          avatar_url TEXT,
          claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating profiles table:', err)
          reject(err)
          return
        }
        console.log('✅ Profiles table ready')
      })

      // Create oauth_connections table
      db.run(`
        CREATE TABLE IF NOT EXISTS oauth_connections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL,
          provider TEXT NOT NULL,
          provider_user_id TEXT NOT NULL,
          provider_username TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at DATETIME,
          user_data TEXT, -- JSON string of user data
          connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles (id),
          UNIQUE(profile_id, provider)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating oauth_connections table:', err)
          reject(err)
          return
        }
        console.log('✅ OAuth connections table ready')

        // Add refresh_token and expires_at columns if they don't exist (for existing databases)
        db.run(`ALTER TABLE oauth_connections ADD COLUMN refresh_token TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding refresh_token column:', err)
          } else {
            console.log('✅ refresh_token column ready')
          }
        })

        db.run(`ALTER TABLE oauth_connections ADD COLUMN expires_at DATETIME`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding expires_at column:', err)
          } else {
            console.log('✅ expires_at column ready')
          }
        })
      })

      // Create user_sessions table for login
      db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_token TEXT UNIQUE NOT NULL,
          profile_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          FOREIGN KEY (profile_id) REFERENCES profiles (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating user_sessions table:', err)
          reject(err)
          return
        }
        console.log('✅ User sessions table ready')
        resolve()
      })
    })
  })
}

// Database operations
export const db_operations = {
  // Get profile by username
  getProfile: (username) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM profiles WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        }
      )
    })
  },

  // Create or update profile
  createOrUpdateProfile: (username, profileData) => {
    return new Promise((resolve, reject) => {
      // First try to get existing profile
      db.get(
        'SELECT id FROM profiles WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            reject(err)
            return
          }

          if (row) {
            // Update existing profile
            db.run(
              `UPDATE profiles SET
                display_name = ?, bio = ?, location = ?, website = ?,
                avatar_url = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [profileData.display_name, profileData.bio, profileData.location,
               profileData.website, profileData.avatar_url, row.id],
              function(err) {
                if (err) reject(err)
                else resolve({ id: row.id, username, ...profileData })
              }
            )
          } else {
            // Create new profile
            db.run(
              `INSERT INTO profiles (username, display_name, bio, location, website, avatar_url)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [username, profileData.display_name, profileData.bio,
               profileData.location, profileData.website, profileData.avatar_url],
              function(err) {
                if (err) reject(err)
                else resolve({ id: this.lastID, username, ...profileData })
              }
            )
          }
        }
      )
    })
  },

  // Save OAuth connection
  saveOAuthConnection: (profileId, provider, connectionData) => {
    return new Promise((resolve, reject) => {
      // Calculate expiration time if provided
      let expiresAt = null
      if (connectionData.expires_in) {
        const now = new Date()
        now.setSeconds(now.getSeconds() + connectionData.expires_in)
        expiresAt = now.toISOString()
      }

      db.run(
        `INSERT OR REPLACE INTO oauth_connections
         (profile_id, provider, provider_user_id, provider_username, access_token, refresh_token, expires_at, user_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId,
          provider,
          connectionData.id,
          connectionData.username,
          connectionData.access_token,
          connectionData.refresh_token || null,
          expiresAt,
          JSON.stringify(connectionData.user_data)
        ],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        }
      )
    })
  },

  // Get OAuth connections for profile
  getOAuthConnections: (profileId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM oauth_connections WHERE profile_id = ?',
        [profileId],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  },

  // Get profile with connections by username
  getProfileWithConnections: (username) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT p.*,
                GROUP_CONCAT(oc.provider) as connected_providers,
                GROUP_CONCAT(oc.provider_username) as provider_usernames
         FROM profiles p
         LEFT JOIN oauth_connections oc ON p.id = oc.profile_id
         WHERE p.username = ?
         GROUP BY p.id`,
        [username],
        (err, row) => {
          if (err) reject(err)
          else {
            if (row) {
              // Parse the concatenated data
              const providers = row.connected_providers ? row.connected_providers.split(',') : []
              const usernames = row.provider_usernames ? row.provider_usernames.split(',') : []

              row.connections = providers.map((provider, index) => ({
                provider,
                username: usernames[index]
              }))
            }
            resolve(row)
          }
        }
      )
    })
  },

  // Create user session
  createSession: (profileId, sessionToken, expiresAt) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_sessions (session_token, profile_id, expires_at) VALUES (?, ?, ?)',
        [sessionToken, profileId, expiresAt],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        }
      )
    })
  },

  // Get session
  getSession: (sessionToken) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT us.*, p.username
         FROM user_sessions us
         JOIN profiles p ON us.profile_id = p.id
         WHERE us.session_token = ? AND us.expires_at > CURRENT_TIMESTAMP`,
        [sessionToken],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        }
      )
    })
  }
}

export default db