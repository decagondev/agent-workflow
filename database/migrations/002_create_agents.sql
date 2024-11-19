CREATE TYPE agent_type AS ENUM (
    'CODE_PLANNER', 
    'CODE_GENERATOR', 
    'CODE_REVIEWER'
);

CREATE TYPE agent_status AS ENUM (
    'IDLE', 
    'PROCESSING', 
    'ERROR', 
    'COMPLETED'
);

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type agent_type NOT NULL,

    total_tasks_processed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_processing_time INTERVAL,

    model_version VARCHAR(50),
    configuration JSONB,

    current_status agent_status DEFAULT 'IDLE',
    last_active_task UUID,

    error_count INTEGER DEFAULT 0,
    last_error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE agents ADD CONSTRAINT unique_agent_name UNIQUE (name);

CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(current_status);
