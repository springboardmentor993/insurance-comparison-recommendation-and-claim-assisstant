-- Create the recommendations table if it doesn't exist
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    policy_id INTEGER NOT NULL REFERENCES policies(id),
    score NUMERIC NOT NULL,
    reasons JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- If table exists but missing columns, add them
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='recommendations' AND column_name='reasons') THEN
        ALTER TABLE recommendations ADD COLUMN reasons JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='recommendations' AND column_name='updated_at') THEN
        ALTER TABLE recommendations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
