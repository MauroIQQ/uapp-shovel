# Conexiones

## Base de datos principal

| Propiedad | Valor |
|-----------|-------|
| Motor | PostgreSQL 18.4 |
| Hosting | Neon (serverless) |
| Host | `ep-quiet-lab-auvp5iwm-pooler.c-10.us-east-1.aws.neon.tech` |
| Puerto | `5432` |
| Base de datos | `neondb` |
| SSL | Require |
| ORM | Prisma 7.8.0 |
| Pool máximo | 50 conexiones |
| Pool mínimo | 5 conexiones |

### Connection string (formato Npgsql)
```
Host=ep-quiet-lab-auvp5iwm-pooler.c-10.us-east-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=***;SSL Mode=Require;Maximum Pool Size=50;Minimum Pool Size=5;Connection Idle Lifetime=300
```

### Connection string (formato URL, para psql)
```
postgresql://neondb_owner:***@ep-quiet-lab-auvp5iwm-pooler.c-10.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

## Storage
- No hay sistema de archivos ni storage externo
- Los PDFs de rendición se generan en memoria (PDFKit) y se envían como respuesta HTTP
- No se almacenan imágenes, documentos ni archivos subidos por usuarios

## APIs externas
| Servicio | Uso |
|----------|-----|
| Neon PostgreSQL | Base de datos |
| Vercel | Hosting + edge network |
| GitHub | Repositorio de código |

## Variables de entorno (Vercel)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `NEXT_PUBLIC_API_URL` | URL base del deployment (para serverFetch) |
| `NODE_ENV` | `production` (automático en Vercel) |
