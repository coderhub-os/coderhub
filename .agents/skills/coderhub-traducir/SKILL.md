---
name: coderhub-traducir
description: >-
  CoderHub OS: traduce al español el material del cliente que se arma en
  inglés: el CV (mismo template y mismo contenido, con `lang: es`, a HTML y
  PDF) y los textos de LinkedIn de `/coderhub linkedin`. Se invoca como
  `/coderhub traducir` (o `/coderhub traducir cv`, `/coderhub traducir
  linkedin`). No agrega ni cambia datos: traduce lo que ya está aprobado.
---

# CoderHub — Traducir al español

El CV, el LinkedIn y el README se arman **en inglés** (es la superficie global). Esta skill saca la **versión en español** del CV y de los textos de LinkedIn para postulaciones y recruiters de LATAM o España, sin tocar los originales.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`).
- El README de GitHub no se traduce: va siempre en inglés.

## Qué traduce

| Argumento | Qué hace |
|---|---|
| `cv` | El CV en inglés más reciente de `output/` → `output/cv-{candidate}-{slug}-es.html` y `.pdf` |
| `linkedin` | El último `output/linkedin/*_linkedin-optimizado.md` → `output/linkedin/{YYYY-MM-DD}_linkedin-optimizado-es.md` |
| (nada) | Preguntá: *"Qué querés pasar al español: el CV, el LinkedIn o los dos?"* |

Lo que salga de acá también sirve de base para el portafolio en español.

## Reglas de traducción (las dos piezas)

1. **Cero datos nuevos.** Se traduce lo que ya está. No se suman logros, números, roles, tecnologías ni fechas. Si el cliente quiere cambiar contenido, eso va primero al original en inglés (`/coderhub pdf` o `/coderhub linkedin`) y después se traduce.
2. **Mismo orden y mismo largo.** Misma estructura, mismas secciones, mismos bullets. Una traducción que agrega o saca bullets ya no es la misma historia.
3. **Las tecnologías y las keywords quedan en inglés:** nombres de lenguajes, frameworks, clouds, herramientas, certificaciones (`AWS Certified Solutions Architect`), siglas (`CI/CD`, `API`, `SRE`) y los títulos de rol que el mercado usa en inglés (`Backend Engineer`, `Tech Lead`). Los recruiters de LATAM buscan así.
4. **Nombres propios intactos:** empresas, productos, universidades, proyectos y links.
5. **Español neutro y profesional.** Para el CV y LinkedIn, primera persona sin pronombres y verbos en pasado ("Lideré", "Reduje", "Diseñé"), sin voseo: es un documento, no la charla. Nada de traducción literal ("Me apasiona", "sinergias"): rigen `modes/_writing.md` y `voice-dna.md` si existe.
6. **Números y fechas:** se mantienen. Los meses se traducen ("Jan 2023 – Present" → "Ene 2023 – Actualidad"). Los números se escriben igual que en el original.

## CV a español

1. **Fuente:** el CV en inglés más reciente que el cliente ya aprobó: el `output/cv-*.html` más nuevo (o el `cv.html` del bundle de la postulación) que no termine en `-es.html` y no sea `cv-preview.html`. Si no hay ninguno: *"Todavía no tenés un CV en inglés generado. Armalo con `/coderhub pdf` y lo traducimos."* y pará.
2. **Leé ese HTML** y armá el payload JSON de `build-cv-html.mjs` (el schema está en `modes/pdf.md`, **JSON Input Schema**) con el **mismo contenido traducido**:
   - `"lang": "es"`.
   - Mismo `page_format` que el original (sale de `config/profile.yml` o del CSS del HTML: `8.5in` = `letter`, `210mm` = `a4`).
   - `candidate` igual al original (nombre, contacto, links, ubicación). Si tiene `title`, traducilo con la regla 3.
   - `sections` con los títulos en español:

     ```json
     "sections": {
       "summary": "Resumen profesional",
       "competencies": "Competencias clave",
       "experience": "Experiencia laboral",
       "projects": "Proyectos",
       "education": "Educación",
       "certifications": "Certificaciones",
       "awards": "Premios y reconocimientos",
       "interests": "Intereses",
       "skills": "Habilidades"
     }
     ```

   - `summary`, `competencies`, `experience[]` (`role`, `context`, `dates`, `bullets`), `projects[]` (`description`), `education[]` (`title`, `description`), `certifications[]`, `awards[]` y `skills[]` (`category`) traducidos con las reglas de arriba. En `experience[].location` traducí solo la modalidad (`Remote` → `Remoto`, `Hybrid` → `Híbrido`). `company`, `org`, `name`, `url`, `tech` e `items` de skills quedan como están, salvo los `items` que no son tecnologías (idiomas: `Spanish (Native)` → `Español (nativo)`).

   Escribilo en `/tmp/cv-{candidate}-{slug}-es.json`, donde `{slug}` es el mismo del archivo original (ej. `cv-ariel-mirra-general.html` → `general`; si viene de un bundle, el slug de la empresa).
3. **Template:** el mismo del original. Resolvelo con `node cv-templates.mjs resolve cv` y pasá esa ruta (si el original se armó con un template elegido a mano, `node cv-templates.mjs resolve cv "<nombre>"`).
4. **Render:**

   ```bash
   node build-cv-html.mjs /tmp/cv-{candidate}-{slug}-es.json output/cv-{candidate}-{slug}-es.html {template}
   ```

5. **Fact gate (obligatorio):** `node verify-cv-facts.mjs output/cv-{candidate}-{slug}-es.html`. Si falla, la traducción metió algo que no está en `cv.md` o `article-digest.md`: sacalo y volvé a renderizar. No sigas con un gate en rojo. Con texto en español el gate sale en verde pero avisa que no chequeó los conteos (su extractor de sustantivos es solo en inglés): no es un fallo, pero compará vos cada número contra el CV en inglés antes de seguir.
6. **PDF:**

   ```bash
   node generate-pdf.mjs output/cv-{candidate}-{slug}-es.html output/cv-{candidate}-{slug}-es.pdf --format={letter|a4}
   ```

   Si falta Chromium: `npx playwright install chromium` y reintentá.
7. **Chequeo final:** el HTML tiene `lang="es"`, mismas secciones y misma cantidad de bullets por rol que el original, y el PDF tiene la misma cantidad de páginas (±1). Mostrale las dos rutas al cliente.

## LinkedIn a español

1. **Fuente:** el `output/linkedin/*_linkedin-optimizado.md` más nuevo que no termine en `-es.md`. Si no hay: *"Primero armemos tu LinkedIn con `/coderhub linkedin` y después lo traducimos."* y pará.
2. El archivo ES es **una copia del documento entero** donde se traducen **solo los textos para pegar** (headline elegido, About, Experience, Projects, Education y las descripciones de Featured) con las "Reglas de traducción" de arriba. Los encabezados, explicaciones y checklists ya están en español y quedan igual. Lo que en Featured es solo una recomendación (qué destacar), queda como está.
3. **Headline:** traducilo respetando los 220 caracteres. Las keywords técnicas y el rol quedan en inglés (regla de traducción 3), así que muchas veces el headline casi no cambia: está bien.
4. **No se traducen:** Skills (LinkedIn las tiene como entidades en inglés), Licenses & certifications (nombres oficiales) y los títulos de rol de Open to Work (los recruiters buscan en inglés).
5. **Cómo se usa (explicáselo):** LinkedIn permite un **perfil secundario en otro idioma** (perfil → "Agregar perfil en otro idioma"). El perfil principal queda en inglés; el de español se ve para quien tiene LinkedIn en español. No reemplaces el principal.
6. Guardalo en `output/linkedin/{YYYY-MM-DD}_linkedin-optimizado-es.md` y mostrale la ruta.

## Reglas

- **No toques los originales en inglés.** Siempre es un archivo nuevo con sufijo `-es`.
- **No inventes ni "mejores" contenido.** Si en la traducción ves algo flojo en el original, avisalo y proponé arreglarlo en el original primero.
- **Fact gate en verde antes del PDF.** Sin excepciones.
- **Keywords técnicas en inglés.** Traducir "Kubernetes" o "Backend Engineer" hace que el CV no aparezca en las búsquedas.

## Si el cliente marca un problema

Si el cliente marca algo (un término que prefiere en inglés o en español, un tono que no le gusta), proponé sumar la regla con la fecha de hoy a la sección `## coderhub-traducir` de `modes/_custom.md` (creala si no existe) y escribila solo con su OK. Este `SKILL.md` lo pisa cada update; `modes/_custom.md` es del cliente y no se toca.
