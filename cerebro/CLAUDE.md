# Wiki Operativo — Salud Plena Demo

**Propósito**: Knowledge base vivo que captura decisiones arquitectónicas, trabajo completado, y estado del proyecto.

---

## Estructura

```
cerebro/
├── CLAUDE.md          # Este archivo (manual operativo)
├── index.md           # Índice temático de nodos
├── log.md             # Bitácora cronológica (append-only)
├── sources.md         # Catálogo de fuentes externas
└── sessions/          # Nodos de sesión (uno por sesión de trabajo)
    └── YYYY-MM-DD-slug.md
```

---

## Frontmatter (obligatorio en todos los nodos)

```yaml
---
name: slug-identificador-unico
type: session|decision|architecture|bug|feature|concept
area: backend|frontend|database|devops|security|other
date: YYYY-MM-DD
author: Usuario
status: active|archived|deprecated
tags: [tag1, tag2]
related: [[slug1], [slug2]]
sources: [source-id, repo:path/to/file, url:https://example.com]
---
```

- `name`: kebab-case, 3-6 palabras, describe el RESULTADO no el proceso
- `type`: categoriza el nodo (session=trabajo de una sesión, decision=decisión clave, etc.)
- `area`: dominio técnico
- `status`: active=vigente, archived=histórico, deprecated=ya no aplica
- `related`: wikilinks a otros nodos con relación

---

## Secciones obligatorias en nodos de sesión

1. **Contexto** — por qué se hizo, qué prompts/tickets impulsaron
2. **Trabajo realizado** — qué se implementó, archivos touchados
3. **Decisiones** — por qué se eligió cada enfoque
4. **Output** — artefactos: commits, URLs, endpoints creados
5. **Pendientes** — tareas bloqueadas, seguimiento necesario
6. **Cross-refs** — enlaces bidireccionales a otros nodos

---

## Reglas de estilo

- **Wikilinks**: `[[slug-del-nodo]]` para referencias internas
- **Enlaces externos**: `[texto](url)` o `url:https://...` en frontmatter
- **Markdown**: GitHub-flavored, código en triple backtick
- **Línea de tiempo**: fecha ISO 8601, hora en formato 24h
- **Bidireccionalidad**: si A cita B, B debe citar A en Cross-refs

---

## Lint rules (checkear con `/memoria lint`)

- ❌ Broken wikilinks: `[[slug]]` que no existe → arreglar
- ❌ Frontmatter inválido: YAML malformado → corregir
- ⚠️ Orphan nodes: nodos sin inbound links → considerar cross-ref
- ⚠️ Stale claims: "en 2024 era...", hoy es 2026 → marcar deprecated
- ℹ️ Conceptos recurrentes: término en 3+ nodos → crear nodo concept

---

## Operaciones

### Ingest (`/memoria`)
Captura esta sesión de trabajo. Crea nodo `cerebro/sessions/YYYY-MM-DD-slug.md`.

### Query (`/memoria query`)
Responde pregunta usando el wiki como base. Citations con `[[slug]]`.

### Lint (`/memoria lint`)
Reporta salud del wiki. Read-only, sin modificar archivos.

---

## Convenciones del proyecto

- **Área `backend`**: APIs, Prisma, modelos de BD
- **Área `frontend`**: componentes React, pages, Client vs Server Components
- **Área `database`**: schema Prisma, migraciones, datos
- **Commits**: referencia nodos con `# [[slug]]` en mensaje
