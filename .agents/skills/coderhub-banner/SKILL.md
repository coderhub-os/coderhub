---
name: coderhub-banner
description: >-
  CoderHub OS: genera los banners de perfil del cliente, el de LinkedIn
  (1584×396) y el del README de GitHub (1280×320), en 3 estilos (minimalista,
  glassmorphism, neobrutalism) con nombre, rol, tagline y los logos del stack
  real. Se invoca como `/coderhub banner`. Renderiza con Playwright (el mismo
  Chromium del PDF del CV) a PNG 2×: texto perfecto, sin IA de imágenes, con
  las safe zones de LinkedIn.
---

# CoderHub — Banner de perfil

Genera los banners de perfil del cliente: **LinkedIn** (el prioritario) y **GitHub README**, con estética técnica. Se renderizan con **Playwright**, el mismo Chromium que usa `generate-pdf.mjs` para el CV, a PNG de dimensiones exactas: texto perfecto, determinístico y editable. **No se usa IA generativa de imágenes**, que arruina el texto.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- **Banner:** **en inglés** (ver Step 2).
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`). La skill está en `.agents/skills/coderhub-banner/`.

## Pre-requisitos

- `cv.md` y `config/profile.yml` con contenido real. Si faltan: *"Todavía no tengo tu CV cargado. Corré primero `/coderhub interview` y volvemos."* y pará.
- **Chromium de Playwright** (el mismo del PDF del CV). Si el render falla con `Executable doesn't exist`, corré `npx playwright install chromium` y reintentá.

## Datos del cliente

No hay un archivo de perfil aparte. **No crees archivos de datos nuevos.**

| Qué necesito | De dónde |
|---|---|
| Nombre | `config/profile.yml` → `candidate.full_name` |
| Rol actual, seniority, empresa, años | `cv.md` |
| Stack real (principal + AI) | `cv.md` (+ `article-digest.md` si existe) |
| Diferenciador (para la tagline) | `narrative.headline` / `narrative.superpowers` de `profile.yml` y "Cross-cutting Advantage" de `modes/_profile.md` |
| Rol target | `target_roles` de `profile.yml` |
| Reglas que el cliente ya marcó | Sección `## coderhub-banner` de `modes/_custom.md`, si existe |

## Outcome

- **3 variantes de estilo** del banner de LinkedIn (minimalista · glassmorphism · neobrutalism) para que el cliente elija: nunca una sola. Con los **logos de las tecnologías** reales.
- **Banner de LinkedIn** (1584×396, exportado 2× → 3168×792) en `output/linkedin/{YYYY-MM-DD}_banner-{estilo}.png`.
- **Banner de GitHub** (1280×320, 2× → 2560×640) en `output/github/assets/banner.png`, con el estilo elegido, más el snippet para embeberlo.
- Instrucciones para subir cada uno.
- Coherente con el CV, el LinkedIn (`/coderhub linkedin`) y el README (`/coderhub readme-github`): mismo posicionamiento.

## Step 1 — Leer los datos y el design spec

1. Leé `cv.md`, `config/profile.yml`, `modes/_profile.md` y, si existen, `article-digest.md` y `modes/_custom.md`. Extraé: nombre, rol + seniority + empresa (para el eyebrow), stack real (principal + AI), diferenciador (para la tagline) y rol target.
2. **Leé `references/design-spec.md`**: dimensiones exactas, **safe zones de LinkedIn** (crítico), estética, contenido y anti-patterns. Es el nivel a igualar.

## Step 2 — Definir el contenido

Armá los 4 bloques (design-spec §4):

- **Eyebrow (mono):** `{ROL SENIORITY} @ {EMPRESA}`, o `{ROL} · {AÑOS}+ YRS` si no hay empresa para mostrar. Con **stealth on** (sección `## Stealth` de `modes/_profile.md`) la empresa actual se puede mostrar igual que en el perfil; si el cliente prefiere no nombrarla, usá la forma sin empresa.
- **Nombre:** el nombre de la persona (un nombre de pila + apellido, igual que el nombre visible de LinkedIn).
- **Tagline:** una línea de qué hace + diferenciador. Nada genérico ("passionate developer").
- **Stack:** 6-9 tecnologías reales, **incluida AI** si la usa (ej. Claude Code · MCP). Cada una con su slug de [Simple Icons](https://simpleicons.org) (ej. `{"name": "Java", "slug": "openjdk"}`).

**Idioma:** inglés (superficie global: recruiters internacionales, roles remotos). La conversación sigue en español.

**Confirmá el contenido con el cliente antes de renderizar:** es su marca.

## Step 3 — Generar las 3 variantes de LinkedIn (prioritario)

1. Escribí el contenido confirmado en un JSON temporal (ej. `/tmp/coderhub-banner.json`, no en el repo):

   ```json
   {
     "eyebrow": "SENIOR BACKEND ENGINEER @ ACME",
     "name": "Nombre Apellido",
     "tagline": "Distributed systems for fintech · AI-assisted delivery",
     "stack": [
       { "name": "Go", "slug": "go" },
       { "name": "Kubernetes", "slug": "kubernetes" },
       { "name": "Claude", "slug": "anthropic" }
     ]
   }
   ```

2. Renderizá los 3 estilos:

   ```bash
   node .agents/skills/coderhub-banner/render-banner.mjs /tmp/coderhub-banner.json --target=linkedin --out=output/linkedin
   ```

   El script llena `templates/{estilo}.html`, baja los logos de Simple Icons con el tinte de cada estilo (claro para minimalista y glassmorphism, oscuro para neobrutalism) y los embebe. Si un logo no existe o no hay red, lo reemplaza por un chip de texto y lo informa en `logosAsText` (ej. AWS ya no está en Simple Icons). Imprime un JSON con los archivos y sus medidas.

3. **Verificá cada PNG:** mide 3168×792 y la composición está **centrada**, sin nada crítico en la esquina inferior izquierda ni pegado a los bordes (design-spec §2). **Abrí cada PNG y miralo** antes de entregar.
4. **Mostrale las 3 al cliente y que elija una** (inline si el entorno muestra imágenes, o con las rutas).

## Step 4 — Banner de GitHub (con el estilo elegido)

Con el estilo elegido, renderizá ese solo para GitHub:

```bash
node .agents/skills/coderhub-banner/render-banner.mjs /tmp/coderhub-banner.json --target=github --style={estilo} --out=output/github/assets/banner.png
```

Sale a 2560×640 (el template escala tipografía y logos al ancho). Verificalo igual que en el Step 3 y dale el snippet:

```markdown
<p align="center"><img src="./assets/banner.png" alt="{Nombre} — {rol}" width="100%"/></p>
```

## Step 5 — Entregar e instrucciones

Mostrá las rutas de los PNG y los pasos:

- **LinkedIn:** perfil → editar → ícono de cámara en la portada → subir `output/linkedin/{fecha}_banner-{estilo}.png`. Previsualizar en desktop **y** en mobile antes de guardar.
- **GitHub:** subir `banner.png` a `assets/` del repo `usuario/usuario` y pegar el snippet arriba del README (lo arma `/coderhub readme-github`).

No subas nada por el cliente. Ofrecé ajustes (paleta, tagline, más o menos stack) y volvé a renderizar.

## Reglas

- **Playwright, no IA de imágenes.** Los banners tienen texto (nombre, rol, stack) y la IA generativa lo arruina. Render determinístico con los templates HTML, texto perfecto.
- **Safe zones de LinkedIn.** Nada crítico en la esquina inferior izquierda (foto de perfil en desktop) ni pegado a los bordes (crop de mobile). Contenido centrado en vertical, margen horizontal generoso.
- **Dimensiones exactas y 2×.** LinkedIn 1584×396, GitHub 1280×320, exportados a 2× para que se vean nítidos. Verificá las medidas del PNG.
- **Señal, no decoración.** Fondo on-brand, nombre + rol + tagline + stack real (incluida AI). Cero frases genéricas, cero clip-art, cero azul default de LinkedIn.
- **Coherencia e inglés.** Mismo posicionamiento que el CV, el LinkedIn y el README.
- **Nunca inventes.** Rol, empresa, años y stack salen de `cv.md` y `profile.yml`, o de lo que el cliente diga en la charla.

## Si el cliente marca un problema

Si el cliente marca algo (texto en la zona recortada, stack saturado, tagline genérica), corregilo y proponé sumar la regla con la fecha de hoy a la sección `## coderhub-banner` de `modes/_custom.md` (creala si no existe). Escribila solo con su OK. Este `SKILL.md` lo pisa cada update; `modes/_custom.md` es del cliente y no se toca.

## Troubleshooting

- **`Executable doesn't exist` / no encuentra Chromium:** `npx playwright install chromium` (el mismo paso que pide el PDF del CV).
- **Logo como chip de texto:** el slug no existe en Simple Icons o no hubo red. Buscá el slug correcto en simpleicons.org o dejá el chip, que se lee bien.
- **El texto se pisa con la foto en LinkedIn:** acortá la tagline o sacá stack, volvé a renderizar y previsualizá.
- **Fuente distinta a la esperada:** los templates usan fuentes del sistema con fallbacks (`Helvetica Neue`/`Arial`, `Menlo`/`DejaVu Sans Mono`). No hace falta instalar nada.
