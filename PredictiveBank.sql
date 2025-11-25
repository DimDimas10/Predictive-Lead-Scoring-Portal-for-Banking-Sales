CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: leads

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    job VARCHAR(50) NOT NULL,
    marital VARCHAR(20) NOT NULL,
    education VARCHAR(20) NOT NULL,
    balance BIGINT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    last_contact DATE,
    campaign INTEGER,
    previous_outcome VARCHAR(20),
    predicted_score DECIMAL(3,2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    housing VARCHAR(5),
    loan VARCHAR(5),
    notes TEXT,
    contacted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
    CONSTRAINT chk_marital CHECK (marital IN ('single', 'married', 'divorced')),
    CONSTRAINT chk_education CHECK (education IN ('primary', 'secondary', 'tertiary')),
    CONSTRAINT chk_housing CHECK (housing IN ('yes', 'no')),
    CONSTRAINT chk_loan CHECK (loan IN ('yes', 'no')),
    CONSTRAINT chk_predicted_score CHECK (predicted_score BETWEEN 0 AND 1)
);

-- INSERT DATA: users

INSERT INTO users (id, name, email, role, password) VALUES
('1', 'Andi Wijaya', 'sales@bank.com', 'Sales Executive', 'demo123');

-- INSERT DATA: leads

INSERT INTO leads (id, name, age, job, marital, education, balance, phone, email, last_contact, campaign, previous_outcome, predicted_score, status, housing, loan, notes) VALUES
('1', 'Budi Santoso', 42, 'management', 'married', 'tertiary', 125000000, '+62 812-3456-7890', 'budi.santoso@email.com', '2024-10-15', 1, 'success', 0.89, 'pending', 'yes', 'no', 'Nasabah potensial tinggi. Memiliki riwayat deposito sebelumnya.'),
('2', 'Siti Nurhaliza', 38, 'technician', 'married', 'tertiary', 95000000, '+62 813-2345-6789', 'siti.nurhaliza@email.com', '2024-09-20', 2, 'success', 0.85, 'pending', 'yes', 'no', NULL),
('3', 'Ahmad Hidayat', 55, 'entrepreneur', 'married', 'secondary', 250000000, '+62 811-9876-5432', 'ahmad.hidayat@email.com', '2024-08-10', 1, 'none', 0.82, 'pending', 'yes', 'yes', NULL),
('4', 'Dewi Lestari', 35, 'admin', 'single', 'tertiary', 75000000, '+62 812-5555-4444', 'dewi.lestari@email.com', '2024-10-01', 3, 'failure', 0.78, 'contacted', 'no', 'no', NULL),
('5', 'Rudi Hartono', 48, 'services', 'divorced', 'secondary', 110000000, '+62 813-7777-8888', 'rudi.hartono@email.com', '2024-09-15', 2, 'success', 0.76, 'pending', 'yes', 'no', NULL),
('6', 'Linda Wijaya', 31, 'technician', 'single', 'tertiary', 68000000, '+62 812-1111-2222', 'linda.wijaya@email.com', '2024-10-20', 1, 'none', 0.73, 'pending', 'no', 'yes', NULL),
('7', 'Hendra Gunawan', 52, 'management', 'married', 'tertiary', 180000000, '+62 811-3333-4444', 'hendra.gunawan@email.com', '2024-07-25', 4, 'success', 0.71, 'converted', 'yes', 'no', NULL),
('8', 'Ratna Sari', 29, 'student', 'single', 'tertiary', 35000000, '+62 813-9999-0000', 'ratna.sari@email.com', '2024-10-18', 2, 'none', 0.45, 'pending', 'no', 'no', NULL),
('9', 'Teguh Prasetyo', 44, 'blue-collar', 'married', 'primary', 52000000, '+62 812-6666-7777', 'teguh.prasetyo@email.com', '2024-09-30', 5, 'failure', 0.38, 'rejected', 'yes', 'yes', NULL),
('10', 'Indah Permata', 26, 'unemployed', 'single', 'secondary', 18000000, '+62 813-4444-5555', 'indah.permata@email.com', '2024-10-22', 1, 'none', 0.32, 'pending', 'no', 'no', NULL),
('11', 'Bambang Sutrisno', 50, 'management', 'married', 'tertiary', 320000000, '+62 811-2222-3333', 'bambang.sutrisno@email.com', '2024-09-05', 1, 'success', 0.92, 'pending', 'yes', 'no', 'VIP customer dengan balance tinggi.'),
('12', 'Maya Kusuma', 36, 'entrepreneur', 'married', 'tertiary', 145000000, '+62 812-8888-9999', 'maya.kusuma@email.com', '2024-10-10', 2, 'success', 0.87, 'contacted', 'yes', 'no', NULL);


-- CREATE INDEXES untuk performa query

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_predicted_score ON leads(predicted_score DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_users_email ON users(email);

-- CREATE FUNCTION untuk auto-update timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS untuk auto-update timestamp

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VERIFICATION QUERIES

-- Query untuk verifikasi data berhasil di-insert
SELECT 'Users Count: ' || COUNT(*) FROM users;
SELECT 'Leads Count: ' || COUNT(*) FROM leads;

-- Tampilkan semua data
SELECT * FROM users;
SELECT * FROM leads ORDER BY predicted_score DESC;