---
name: 2026-05-27-deploy-vercel-postgres
type: session
area: devops, backend
date: 2026-05-27
author: claude
status: active
tags: [vercel, postgres, deployment, environment]
related: [[2026-05-27-api-routes-prisma-migration]]
sources: [url:https://salud-plena-demo.vercel.app, repo:.env.local, repo:prisma/schema.prisma]
---

# Deploy a Vercel + PostgreSQL remoto

## Contexto

Usuario solicitó:
1. Subir proyecto a Vercel
2. Conectar BD con PostgreSQL remota (proporcionó credenciales)

BD remota ya existe:
- Host: `72.61.7.36`
- Puerto: `15432`
- User: `postgres`
- Password: `046226e437baa770986d`
- Database: `postgres`
- Schema: `public`
- Datos: cargados via `salud_plena_demo_full_seed.sql` en Adminer

## Trabajo realizado

### Build local
- ✅ `npm run build` exitoso
- ✅ Next.js 15.0.3 compiló toda la app
- ⚠️ Warning: Next.js 15.0.3 tiene CVE-2025-66478 (security), recomendado upgradear

### Vercel login
- ✅ `vercel login` completado via OAuth
- ✅ Team detectado: `zzapxta07-creates-projects`

### Deploy
- ✅ `vercel --prod --scope zzapxta07-creates-projects --name salud-plena-demo`
- ✅ Deployed en 46 segundos
- ✅ URL de producción: **https://salud-plena-demo.vercel.app**

### Environment variables
- ✅ `vercel env add DATABASE_URL production` configurado
- ✅ Valor: `postgresql://postgres:046226e437baa770986d@72.61.7.36:15432/postgres?schema=public`
- ✅ Re-deploy para activar variable

## Output

### URLs públicas
- **Sitio**: https://salud-plena-demo.vercel.app
- **Dashboard Vercel**: https://vercel.com/zzapxta07-creates-projects/salud-plena-demo
- **Última build**: https://vercel.com/zzapxta07-creates-projects/salud-plena-demo/F6QTD2ErxUm3RKPhc5nSgfpEymhz (alias old)
- **Build actual**: https://vercel.com/zzapxta07-creates-projects/salud-plena-demo/DwZ4EnHFHDpHGeQP1cwkrAmUbdw8

### Build output
- Size: 109 KB (First Load JS)
- Routes: 34 páginas pre-rendered, algunas dinámicas `[id]`
- Static: 100 KB shared chunks

## Decisiones

| Decisión | Rationale |
|---|---|
| **Vercel** vs Heroku/Railway/etc | Native Next.js support, serverless functions, CDN global, integración GitHub fácil |
| **DATABASE_URL en environment** | No hardcodeado en código, seguro, reutilizable en CI/CD |
| **PostgreSQL remota** vs BD Vercel Postgres | Usuario ya tiene BD remota operacional, menor costo y fricción que migrar |

## Pendientes

| Tarea | Estado |
|---|---|
| Verificar que API routes funcionan en producción | ⏳ pending (mock-data aún activo) |
| Eliminar mock-data y re-deploy | ⏳ blocking |
| Configurar CI/CD GitHub Actions (auto-deploy en push) | ⏳ pending |

## Cross-refs

- [[2026-05-27-api-routes-prisma-migration]] — APIs que consumirá la app en Vercel
- [[2026-06-01-reminders-espejo-n8n-trigger]] — MIGRACION_REMINDERS.sql debe ejecutarse en esta BD remota (72.61.7.36:15432); vistas n8n y trigger quedan en esta instancia
