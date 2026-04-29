CREATE TABLE hcps (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    hospital VARCHAR(255),
    city VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    tier VARCHAR(1) CHECK (tier IN ('A', 'B', 'C')),
    npi_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    territory VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    hcp_id INTEGER REFERENCES hcps(id),
    rep_id INTEGER REFERENCES reps(id),
    interaction_type VARCHAR(100) CHECK (interaction_type IN ('In-Person Visit', 'Phone Call', 'Email', 'Virtual Meeting', 'Conference')),
    interaction_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    products_discussed TEXT[],
    summary TEXT,
    notes TEXT,
    sentiment VARCHAR(50) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    location VARCHAR(255),
    next_steps TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE action_items (
    id SERIAL PRIMARY KEY,
    interaction_id INTEGER REFERENCES interactions(id),
    description TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT
);

INSERT INTO hcps (first_name, last_name, specialty, hospital, city, email, phone, tier, npi_number) VALUES
('Ravi', 'Sharma', 'Cardiology', 'Apollo Hospital', 'New Delhi', 'ravi.sharma@example.com', '+91-9876543210', 'A', '1029384756'),
('Priya', 'Deshmukh', 'Oncology', 'Tata Memorial', 'Mumbai', 'priya.deshmukh@example.com', '+91-8765432109', 'A', '1928374650'),
('Arjun', 'Reddy', 'Neurology', 'NIMHANS', 'Bengaluru', 'arjun.reddy@example.com', '+91-7654321098', 'B', '2837465019'),
('Sneha', 'Patel', 'Rheumatology', 'AIIMS', 'Ahmedabad', 'sneha.patel@example.com', '+91-6543210987', 'B', '3746501928'),
('Vikram', 'Singh', 'Internal Medicine', 'Fortis Escorts', 'Jaipur', 'vikram.singh@example.com', '+91-5432109876', 'C', '4650192837'),
('Anjali', 'Menon', 'Cardiology', 'Aster Medcity', 'Kochi', 'anjali.menon@example.com', '+91-4321098765', 'A', '5019283746');

INSERT INTO reps (name, email, territory) VALUES
('Alex Thompson', 'alex.thompson@example.com', 'Pan-India');

INSERT INTO products (name, category, description) VALUES
('CardioMax', 'Cardiovascular', 'Advanced blood pressure medication'),
('OncoShield', 'Oncology', 'Targeted therapy for specific tumors'),
('NeuroClear', 'Neurology', 'Medication for nerve-related pain'),
('ArthroFlex', 'Rheumatology', 'Anti-inflammatory for joint health'),
('ImmunoBoost', 'Immunology', 'Supplement for enhancing immune response');
