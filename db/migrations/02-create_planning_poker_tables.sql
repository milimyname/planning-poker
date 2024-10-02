-- Create a table for games
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY NOT NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'voting' CHECK (status IN ('voting', 'revealed', 'completed'))
);

-- Create a table for players
CREATE TABLE players (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for votes
CREATE TABLE votes (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
    estimate INTEGER,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (game_id, player_id)
);

-- Create indexes to improve query performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_votes_game_id ON votes(game_id);