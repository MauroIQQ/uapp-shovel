# Credenciales

> ⚠️ **ATENCIÓN**: Este archivo contiene credenciales sensibles.
> **NO** debe subirse a GitHub. Verificar que esté en `.gitignore`.

---

## Base de datos (Neon PostgreSQL)

| Campo | Valor |
|-------|-------|
| Usuario | `neondb_owner` |
| Password | `npg_3RXyZscBiIu1` |
| Host | `ep-quiet-lab-auvp5iwm-pooler.c-10.us-east-1.aws.neon.tech` |
| Puerto | `5432` |
| Base | `neondb` |

## Vercel

| Campo | Valor |
|-------|-------|
| Proyecto | `uapp` |
| URL producción | `https://uapp-delta.vercel.app` |
| Dashboard | `https://vercel.com` |

## Dominios DNS

| Dominio | Destino |
|---------|---------|
| `uapp.shovel.cl` | CNAME → `cname.vercel-dns.com` |
| `renacimiento.cl` | CNAME → `cname.vercel-dns.com` |

## Usuarios del sistema (UAPP)

### Usuario Root (maestro)

| Campo | Valor |
|-------|-------|
| RUT | Configurado durante la instalación inicial |
| Perfil | `0` (Root) |
| Acceso | Total a todos los módulos y funciones |

### Perfiles del sistema

| Perfil | Nivel | Descripción |
|--------|-------|-------------|
| `0` | Root | Acceso total, salta verificación de permisos |
| `1` | Asistente | Agendamiento, búsqueda, atención básica |
| `2` | Administrador | CRUD completo, configuración, reportes |

## Notas
- Las contraseñas de usuario se almacenan hasheadas con bcrypt (12 rondas)
- El token JWT expira a las 4 horas
- Para crear un nuevo usuario Root, insertar directamente en `uapp_usuarios` con perfil=0
