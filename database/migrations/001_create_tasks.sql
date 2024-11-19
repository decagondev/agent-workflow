CREATE TYPE task_status AS ENUM (
    'TODO', 
    'PLANNING', 
    'READY_TO_CODE', 
    'GENERATING', 
    'REVIEW', 
    'CHANGES_REQUESTED', 
    'COMPLETED'
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'TODO',

    current_cycle INTEGER DEFAULT 0,
    max_cycles INTEGER DEFAULT 3,

    planning_agent_id UUID,
    generation_agent_id UUID,
    review_agent_id UUID,

    implementation_plan JSONB,
    generated_code TEXT,
    review_comments TEXT,

    created_by UUID,
    assigned_to UUID,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT max_cycles_check CHECK (current_cycle <= max_cycles)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
