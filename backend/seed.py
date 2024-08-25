import sqlite3

# Connect to the database (it will be created if it doesn't exist)
conn = sqlite3.connect('database.db')

# Create a cursor object to execute SQL queries
cursor = conn.cursor()

# SQL seed file content
seed_file_content = '''
-- Create the users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT,
  username TEXT,
  password TEXT
);

-- Create the video table
CREATE TABLE videos (
  id INTEGER PRIMARY KEY,
  title TEXT,
  url TEXT,
  transcript TEXT,
  topic TEXT
);

-- Create the userVideo table
CREATE TABLE userVideos (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  video_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (video_id) REFERENCES videos (id)
);

-- Insert sample data into the users table
INSERT INTO users (email, username, password)
VALUES
  ('user1@example.com', 'user1', 'password1'),
  ('user2@example.com', 'user2', 'password2'),
  ('user3@example.com', 'user3', 'password3');

-- Insert sample data into the video table
INSERT INTO videos (title, url, transcript, topic)
VALUES
  ('Video 1', 'https://example.com/video1', 'Transcript 1', 'Topic 1'),
  ('Video 2', 'https://example.com/video2', 'Transcript 2', 'Topic 2'),
  ('Video 3', 'https://example.com/video3', 'Transcript 3', 'Topic 3');

-- Insert sample data into the userVideo table
INSERT INTO userVideos (user_id, video_id, timestamp, comments, context)
VALUES
  (1, 1, '00:05:30', 'Comment 1', 'Context 1'),
  (1, 2, '00:10:15', 'Comment 2', 'Context 2'),
  (2, 1, '00:03:45', 'Comment 3', 'Context 3'),
  (2, 3, '00:08:20', 'Comment 4', 'Context 4'),
  (3, 2, '00:12:00', 'Comment 5', 'Context 5');
'''

# Execute the SQL seed file content
cursor.executescript(seed_file_content)

# Commit the changes to the database
conn.commit()

# Close the cursor and database connection
cursor.close()
conn.close()
