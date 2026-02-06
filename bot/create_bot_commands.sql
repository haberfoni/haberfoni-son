
CREATE TABLE IF NOT EXISTS bot_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command VARCHAR(50) NOT NULL, -- e.g. 'FORCE_RUN'
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE bot_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to commands" ON bot_commands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on commands" ON bot_commands FOR SELECT USING (true);
CREATE POLICY "Allow public update on commands" ON bot_commands FOR UPDATE USING (true);
