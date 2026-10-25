
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
        CHECK (length(trim(name)) > 0),
    due_date TIMESTAMPTZ NOT NULL,
    additional_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS release_steps (
    release_id UUID NOT NULL
        REFERENCES releases(id) ON DELETE CASCADE,
    step_id SMALLINT NOT NULL CHECK (step_id BETWEEN 1 AND 10),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (release_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_releases_due_date
    ON releases (due_date);
