-- Schema for The Risk Engine (Motor de Riesgos) - PostgreSQL

-- 1. COMPANIES (Multi-Tenant Architecture)
-- Base architecture. Un núcleo sirve a múltiples clientes y mantiene los datos aislados.
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
-- Diferentes roles dentro de la plataforma
CREATE TYPE user_role AS ENUM ('admin', 'ejecutor', 'gerencia');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'ejecutor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROCESSES
-- Módulo base. Todo riesgo pertenece a un proceso del negocio.
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. RISKS (Matriz de Riesgos y Matriz RAM)
-- Matriz principal de calor (Probabilidad x Consecuencia)
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cause TEXT,
    consequence TEXT,
    probability INT CHECK (probability BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    inherent_risk_score INT GENERATED ALWAYS AS (probability * impact) STORED,
    residual_risk_level risk_level,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CONTROLS
-- Qué se hace para mitigar el riesgo.
CREATE TYPE control_type AS ENUM ('preventive', 'detective', 'corrective');

CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type control_type DEFAULT 'preventive',
    frequency VARCHAR(50), -- p.ej. 'diario', 'mensual', 'anual'
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACTION PLANS (Planes de Acción y Tratamiento)
-- Seguimiento con responsables y fechas (Evita olvidos)
CREATE TYPE plan_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');

CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    due_date DATE NOT NULL,
    status plan_status DEFAULT 'pending',
    completion_evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AUDIT LOGS (Trazabilidad y Evidencias)
-- Registro inmutable de cambios para auditores
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    entity_name VARCHAR(100) NOT NULL, -- p.ej., 'risks', 'controls'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento (Performance Optimizations)
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_processes_company ON processes(company_id);
CREATE INDEX idx_risks_process ON risks(process_id);
CREATE INDEX idx_controls_risk ON controls(risk_id);
CREATE INDEX idx_action_plans_risk ON action_plans(risk_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
