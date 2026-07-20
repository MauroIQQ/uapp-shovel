# Database Schema - UAPP

Script completo de migración. Ejecutar en PostgreSQL 18+.

```sql
-- ============================================================
-- UAPP - MIGRACIÓN COMPLETA PostgreSQL
-- ============================================================

BEGIN;

-- ============================================================
-- 0. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLA EMPRESAS (multi-tenant root)
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_empresas (
    rut_empresa          VARCHAR(20) PRIMARY KEY,
    giro                 VARCHAR(100),
    direccion            VARCHAR(100),
    correo               VARCHAR(50),
    comuna               VARCHAR(50),
    ciudad               VARCHAR(50),
    telefono             VARCHAR(30),
    celular              VARCHAR(30),
    rut_representante    VARCHAR(10),
    nombre_representante VARCHAR(50),
    password             VARCHAR(200),
    fecha_creacion       TIMESTAMP,
    version              INTEGER DEFAULT 0,
    dias                 INTEGER DEFAULT 0,
    estado               BOOLEAN NOT NULL DEFAULT TRUE,
    created              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABLA PREVISIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_previsiones (
    id          SERIAL PRIMARY KEY,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    nombre      VARCHAR(200) NOT NULL,
    valor       INTEGER NOT NULL DEFAULT 0,
    estado      BOOLEAN NOT NULL DEFAULT TRUE,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA PACIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_pacientes (
    rut             VARCHAR(20) NOT NULL,
    id_prevision    INTEGER REFERENCES uapp_previsiones(id) ON DELETE SET NULL,
    rut_empresa     VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    nombre_completo VARCHAR(300) NOT NULL,
    direccion       VARCHAR(500),
    correo          VARCHAR(200),
    ciudad          VARCHAR(100),
    comuna          VARCHAR(100),
    pais            VARCHAR(100) DEFAULT 'Chile',
    telefono        VARCHAR(50),
    celular         VARCHAR(50),
    sexo            VARCHAR(10),
    fecha_nacimiento DATE,
    edad            INTEGER,
    estado_civil    VARCHAR(50),
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    extranjero      BOOLEAN NOT NULL DEFAULT FALSE,
    created         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated         TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (rut, rut_empresa)
);

-- ============================================================
-- 4. TABLA USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_usuarios (
    rut         VARCHAR(20) PRIMARY KEY,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    nombre      VARCHAR(100) NOT NULL,
    paterno     VARCHAR(100) NOT NULL,
    materno     VARCHAR(100),
    perfil      INTEGER NOT NULL DEFAULT 1,
    correo      VARCHAR(200),
    password    VARCHAR(256) NOT NULL,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. TABLA TIPOS_HORAS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_tipos_horas (
    id          SERIAL PRIMARY KEY,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    descripcion VARCHAR(200) NOT NULL,
    estado      BOOLEAN NOT NULL DEFAULT TRUE,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TABLA HORAS (AGENDA)
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_horas (
    id               SERIAL PRIMARY KEY,
    rut_empresa      VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    rut_paciente     VARCHAR(20) NOT NULL,
    id_prevision     INTEGER REFERENCES uapp_previsiones(id) ON DELETE SET NULL,
    fecha_hora       TIMESTAMP NOT NULL,
    id_tipo_consulta INTEGER NOT NULL DEFAULT 6,
    observacion      TEXT,
    estado           BOOLEAN NOT NULL DEFAULT TRUE,
    confirmada       VARCHAR(2) DEFAULT 'NO',
    atendido         VARCHAR(2) DEFAULT 'NO',
    num_llegada      INTEGER DEFAULT 0,
    sobrecupo        BOOLEAN NOT NULL DEFAULT FALSE,
    origen           VARCHAR(20) DEFAULT 'org',
    total            INTEGER DEFAULT 0,
    created          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated          TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (rut_paciente, rut_empresa) REFERENCES uapp_pacientes(rut, rut_empresa) ON DELETE CASCADE
);

-- ============================================================
-- 7. TABLA DIAS_BLOQUEADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_dias_bloqueados (
    fecha       DATE NOT NULL,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    motivo      TEXT,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (fecha, rut_empresa)
);

-- ============================================================
-- 8. TABLA KARDEX (INVENTARIO)
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_kardex (
    id_articulo  SERIAL PRIMARY KEY,
    descripcion  VARCHAR(500) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    rut_empresa  VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    created      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. TABLA PARAMETROS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_parametros (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(200) NOT NULL UNIQUE,
    valor   INTEGER NOT NULL DEFAULT 0,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. TABLA REPORTES_CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_reportes_config (
    id         SERIAL PRIMARY KEY,
    id_reporte INTEGER NOT NULL,
    parametro  VARCHAR(200),
    x          INTEGER DEFAULT 0,
    y          INTEGER DEFAULT 0,
    width      INTEGER DEFAULT 0,
    x_global   INTEGER DEFAULT 0,
    y_global   INTEGER DEFAULT 0,
    created    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. TABLA FICHAS_CLINICAS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_fichas_clinicas (
    id                                SERIAL PRIMARY KEY,
    rut_paciente                      VARCHAR(20) NOT NULL,
    rut_empresa                       VARCHAR(20) NOT NULL,
    peso                              DECIMAL(5,2),
    talla                             DECIMAL(5,2),
    imc                               DECIMAL(5,2),
    circunferencia_cintura            DECIMAL(5,2),
    pliegues                          DECIMAL(5,2),
    bioimpedancia                     DECIMAL(5,2),
    genero                            VARCHAR(20),
    ocupacion                         VARCHAR(200),
    contacto_emergencia_nombre        VARCHAR(200),
    contacto_emergencia_parentezco    VARCHAR(100),
    contacto_emergencia_telefono      VARCHAR(50),
    contacto_emergencia_direccion     TEXT,
    created                           TIMESTAMP DEFAULT NOW(),
    updated                           TIMESTAMP DEFAULT NOW(),
    UNIQUE(rut_paciente, rut_empresa),
    FOREIGN KEY (rut_paciente, rut_empresa) REFERENCES uapp_pacientes(rut, rut_empresa)
);

-- ============================================================
-- 12. TABLA BITACORAS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_bitacoras (
    id               SERIAL PRIMARY KEY,
    id_ficha_clinica INTEGER NOT NULL REFERENCES uapp_fichas_clinicas(id) ON DELETE CASCADE,
    motivo_consulta  TEXT NOT NULL,
    created          TIMESTAMP DEFAULT NOW(),
    updated          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 13. TABLA RECETAS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_recetas (
    id          SERIAL PRIMARY KEY,
    id_bitacora INTEGER NOT NULL REFERENCES uapp_bitacoras(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    created     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 14. TABLA ANTECEDENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_antecedentes (
    id_ficha_clinica      INTEGER PRIMARY KEY REFERENCES uapp_fichas_clinicas(id) ON DELETE CASCADE,
    enf_cronicas          BOOLEAN DEFAULT FALSE,
    cirugias              BOOLEAN DEFAULT FALSE,
    hospitalizaciones     BOOLEAN DEFAULT FALSE,
    accidentes            BOOLEAN DEFAULT FALSE,
    discapacidad          BOOLEAN DEFAULT FALSE,
    fam_diabetes          BOOLEAN DEFAULT FALSE,
    fam_hipertension      BOOLEAN DEFAULT FALSE,
    fam_cancer            BOOLEAN DEFAULT FALSE,
    fam_cardiovasculares  BOOLEAN DEFAULT FALSE,
    fam_psiquiatricas     BOOLEAN DEFAULT FALSE,
    fam_hereditarias      BOOLEAN DEFAULT FALSE,
    aler_medicamentos     BOOLEAN DEFAULT FALSE,
    aler_alimentos        BOOLEAN DEFAULT FALSE,
    aler_latex            BOOLEAN DEFAULT FALSE,
    aler_otras            BOOLEAN DEFAULT FALSE,
    aler_otras_desc       TEXT,
    med_nombre            TEXT,
    med_dosis             TEXT,
    med_frecuencia        TEXT,
    med_motivo            TEXT,
    hab_tabaquismo        BOOLEAN DEFAULT FALSE,
    hab_alcohol           BOOLEAN DEFAULT FALSE,
    hab_drogas            BOOLEAN DEFAULT FALSE,
    hab_actividad_fisica  BOOLEAN DEFAULT FALSE,
    hab_alimentacion      TEXT,
    hab_horas_sueno       INTEGER,
    created               TIMESTAMP DEFAULT NOW(),
    updated               TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 15. TABLA CATEGORIAS_MEDICAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_categorias_medicamentos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    created     TIMESTAMP DEFAULT NOW(),
    updated     TIMESTAMP DEFAULT NOW(),
    UNIQUE(nombre, rut_empresa)
);

-- ============================================================
-- 16. TABLA MEDICAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_medicamentos (
    id           SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES uapp_categorias_medicamentos(id) ON DELETE RESTRICT,
    nombre       VARCHAR(200) NOT NULL,
    rut_empresa  VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    created      TIMESTAMP DEFAULT NOW(),
    updated      TIMESTAMP DEFAULT NOW(),
    UNIQUE(nombre, rut_empresa)
);

-- ============================================================
-- 17. TABLA HORARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_horarios (
    id          SERIAL PRIMARY KEY,
    hora        TIME NOT NULL,
    activo      BOOLEAN DEFAULT TRUE,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    created     TIMESTAMP DEFAULT NOW(),
    updated     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 18. TABLA PERMISOS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_permisos (
    id          SERIAL PRIMARY KEY,
    perfil      INTEGER NOT NULL,
    menu_id     VARCHAR(200) NOT NULL,
    rut_empresa VARCHAR(20) NOT NULL DEFAULT '76140290-0',
    created     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 19. TABLA LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS uapp_logs (
    id          SERIAL PRIMARY KEY,
    rut_empresa VARCHAR(20),
    nivel       VARCHAR(20) NOT NULL DEFAULT 'ERROR',
    origen      VARCHAR(20) DEFAULT 'backend',
    modulo      VARCHAR(100),
    detalle     TEXT,
    error       TEXT,
    url         TEXT,
    usuario     VARCHAR(100),
    ip          VARCHAR(50),
    created     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOREIGN KEYS (hacia empresas)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_previsiones_empresa') THEN
        ALTER TABLE uapp_previsiones     ADD CONSTRAINT fk_previsiones_empresa     FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pacientes_empresa') THEN
        ALTER TABLE uapp_pacientes       ADD CONSTRAINT fk_pacientes_empresa       FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_empresa') THEN
        ALTER TABLE uapp_usuarios        ADD CONSTRAINT fk_usuarios_empresa        FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_dias_bloqueados_empresa') THEN
        ALTER TABLE uapp_dias_bloqueados ADD CONSTRAINT fk_dias_bloqueados_empresa FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_kardex_empresa') THEN
        ALTER TABLE uapp_kardex          ADD CONSTRAINT fk_kardex_empresa          FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tipos_empresa') THEN
        ALTER TABLE uapp_tipos_horas     ADD CONSTRAINT fk_tipos_empresa           FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_catmed_empresa') THEN
        ALTER TABLE uapp_categorias_medicamentos ADD CONSTRAINT fk_catmed_empresa FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_med_empresa') THEN
        ALTER TABLE uapp_medicamentos     ADD CONSTRAINT fk_med_empresa            FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_horarios_empresa') THEN
        ALTER TABLE uapp_horarios        ADD CONSTRAINT fk_horarios_empresa        FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_permisos_empresa') THEN
        ALTER TABLE uapp_permisos        ADD CONSTRAINT fk_permisos_empresa        FOREIGN KEY (rut_empresa) REFERENCES uapp_empresas(rut_empresa);
    END IF;
END $$;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_uapp_horas_fecha ON uapp_horas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_uapp_horas_rut_paciente ON uapp_horas(rut_paciente);
CREATE INDEX IF NOT EXISTS idx_uapp_horas_empresa ON uapp_horas(rut_empresa);
CREATE INDEX IF NOT EXISTS idx_uapp_horas_empresa_fecha ON uapp_horas(rut_empresa, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_uapp_horas_tipo ON uapp_horas(id_tipo_consulta);
CREATE INDEX IF NOT EXISTS idx_uapp_pacientes_nombre ON uapp_pacientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_uapp_pacientes_empresa ON uapp_pacientes(rut_empresa);
CREATE INDEX IF NOT EXISTS idx_uapp_pacientes_empresa_nombre ON uapp_pacientes(rut_empresa, nombre_completo);
CREATE INDEX IF NOT EXISTS idx_uapp_pacientes_empresa_rut ON uapp_pacientes(rut_empresa, rut);
CREATE INDEX IF NOT EXISTS idx_uapp_logs_empresa_created ON uapp_logs(rut_empresa, created DESC);
CREATE INDEX IF NOT EXISTS idx_uapp_usuarios_empresa ON uapp_usuarios(rut_empresa);

COMMIT;
```
