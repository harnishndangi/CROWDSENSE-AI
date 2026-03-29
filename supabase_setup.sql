CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to insert new users (required for signup)
-- Note: In a production environment, this should be carefully reviewed if you don't want arbitrary users adding rows directly from the browser.
CREATE POLICY "Allow public inserts" ON users 
FOR INSERT TO public 
WITH CHECK (true);

-- Allow public (anon) to read users (required for login check)
-- Note: In a perfect production world, this wouldn't be public without hashing passwords and strict conditions.
CREATE POLICY "Allow public select" ON users 
FOR SELECT TO public 
USING (true);

-- Create live_stations table
CREATE TABLE IF NOT EXISTS live_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    line VARCHAR(100) NOT NULL,
    "lineColor" VARCHAR(50) NOT NULL,
    crowd VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allow public read access to live_stations
ALTER TABLE live_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on live_stations" ON live_stations FOR SELECT TO public USING (true);

-- Create ticker_alerts table
CREATE TABLE IF NOT EXISTS ticker_alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allow public read access to ticker_alerts
ALTER TABLE ticker_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on ticker_alerts" ON ticker_alerts FOR SELECT TO public USING (true);
