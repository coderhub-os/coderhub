---
name: coderhub-portafolio
description: >-
  CoderHub OS: arma, publica y actualiza el portafolio web del cliente (su CV
  online): sitio estático con hero, sobre mí, experiencia, proyectos, stack y
  contacto, en 4 temas (minimalista, glassmorphism, neobrutalism, terminal)
  con modo claro y oscuro, en EN y/o ES, con SEO completo y el PDF del CV
  base. Se invoca como `/coderhub portafolio`, "armá mi portafolio" o
  "actualizá mi portafolio". Lo genera desde cv.md, config/profile.yml y
  config/portafolio.yml, y lo publica en GitHub Pages o Vercel con la cuenta
  del cliente, siempre con su confirmación.
---

# CoderHub — Portafolio web

Arma el **portafolio web** del cliente: un sitio estático, 100% suyo, que funciona como CV online. Se genera con `build.mjs` desde sus datos reales y se publica en un **repo público aparte**, en su cuenta personal de GitHub. El repo privado guarda los datos (`config/portafolio.yml`); el público solo tiene el resultado (HTML, CSS, imágenes, PDF).

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- **Sitio:** el contenido se escribe **en inglés**. La versión en español sale de `/coderhub traducir portafolio` (ver Step 3).
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`). La skill está en `.agents/skills/coderhub-portafolio/`.
- Dos modos: **armar** (primera vez: Steps 1 a 7) y **actualizar** ("actualizá mi portafolio": Step 8).

## Pre-requisitos

- `cv.md` y `config/profile.yml` con contenido real. Si faltan: *"Todavía no tengo tu CV cargado. Corré primero `/coderhub interview` y volvemos."* y pará.
- **Chromium de Playwright** (el mismo del PDF del CV): el build lo usa para la imagen OG y para limpiar la foto. Si falla con `Executable doesn't exist`, corré `npx playwright install chromium` y reintentá.
- **Para publicar:** `gh` logueado con la cuenta **personal** del cliente (GitHub Pages) o, si elige Vercel, el CLI de Vercel logueado. Se chequea en el Step 7, no antes.

## Datos del cliente

`config/portafolio.yml` guarda **solo lo que no está en el CV ni en el perfil**. Lo que ya está se lee de ahí, no se duplica. **No crees otros archivos de datos.**

| Qué necesito | De dónde |
|---|---|
| Nombre, email, teléfono, LinkedIn, GitHub, Twitter, URL del portafolio | `config/profile.yml` → `candidate.*` |
| Titular | `portafolio.yml → titular`; si no hay, `candidate.title` o `narrative.headline` de `profile.yml` |
| Eyebrow del hero (la línea chica arriba del nombre) | `portafolio.yml → eyebrow`; si no hay, los 3 primeros de `stack` (ej. `Go · Kubernetes · AWS`), salvo en el tema `terminal`, que sin `eyebrow` no muestra la línea |
| Botón "Copiar para IA" del hero | `portafolio.yml → boton_ia` (default `true`): copia al portapapeles el perfil en markdown del idioma de la página (el mismo texto que `llms.txt`, embebido en el HTML, sin requests); con `false` no hay botón ni perfil embebido |
| Ubicación | `config/profile.yml` → `location.city` / `location.country` (se publica solo si el cliente lo pide) |
| Experiencia, educación, certificaciones, grupos de skills | `cv.md` (`## Experience`, `## Education`, `## Certifications`, `## Skills`) |
| Logros con números, proyectos | `cv.md` (+ `article-digest.md` si existe) |
| Proyectos públicos | `gh repo list` / `gh api` del usuario de `candidate.github` |
| Tema, acento, idiomas, hosting, foto, sobre mí, proyectos, stack destacado, recomendaciones, contactos, PDF | `config/portafolio.yml` |
| Stealth | Sección `## Stealth` de `modes/_profile.md`, si existe |
| Reglas que el cliente ya marcó | Sección `## coderhub-portafolio` de `modes/_custom.md`, si existe |

**Usuario de GitHub (`{ghuser}`):** sale de `candidate.github` (ej. `github.com/usuario` → `usuario`). Si no está, preguntalo.

Si `config/portafolio.yml` no existe, copialo del ejemplo (nunca pises uno existente):

```bash
cp -n .agents/skills/coderhub-portafolio/portafolio.example.yml config/portafolio.yml
```

`portafolio.example.yml` documenta cada campo (comentarios en español).

**Qué se versiona y dónde:**

- `config/portafolio.yml` y la foto (`assets/foto.jpg`) son **datos del cliente**: se versionan en **su repo privado** (el de CoderHub OS) y los updates del sistema no los tocan. **Nunca** van al repo público del sitio.
- `output/` (incluido `output/portafolio/`) **no se versiona** en ningún lado: se regenera en cada build. Al repo público va solo una copia del sitio generado (Step 7).

## Outcome

- `config/portafolio.yml` completo, confirmado por el cliente.
- El sitio generado en `output/portafolio/` (nunca versionado en el repo privado): una página por idioma, imagen OG, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, `404.html` y la copia del PDF del CV base.
- Revisión de privacidad confirmada antes de publicar.
- El sitio publicado (con OK explícito) y la URL en `config/profile.yml → candidate.portfolio_url`.

## Step 1 — Leer los datos

Leé `cv.md`, `config/profile.yml`, `modes/_profile.md` y, si existen, `article-digest.md`, `modes/_custom.md`, `modes/_writing.md`, `voice-dna.md` y `config/portafolio.yml`. Anotá qué campos de `portafolio.yml` ya tienen valor real: **en la entrevista solo se pregunta lo que falta.**

## Step 2 — Entrevista corta (solo lo que falta)

Preguntá de a un bloque, con una propuesta concreta en cada uno para que el cliente solo confirme o corrija. Al cerrar cada bloque, escribilo en `config/portafolio.yml`.

1. **Tema y acento.** Los 4 temas: `minimalista`, `glassmorphism`, `neobrutalism`, `terminal` (los mismos nombres y paletas que `/coderhub banner`; si ya eligió un estilo de banner, proponé ese). Ofrecé capturas de los 4 renderizando el build con `--theme`. Si `config/portafolio.yml` todavía no tiene lo mínimo, usá el perfil de ejemplo:

   ```bash
   for t in minimalista glassmorphism neobrutalism terminal; do
     node .agents/skills/coderhub-portafolio/build.mjs --root=.agents/skills/coderhub-portafolio/examples/martin --theme=$t --mode=dark --no-og --out=/tmp/coderhub-portafolio-temas/$t
     npx playwright screenshot --viewport-size=1280,800 file:///tmp/coderhub-portafolio-temas/$t/index.html /tmp/coderhub-portafolio-temas/$t.png
   done
   ```

   (Con sus datos ya cargados, sacá `--root=...`.) Mostrale las 4 capturas (inline si el entorno muestra imágenes, o con las rutas) y, si quiere, también en `--mode=light`. El acento por defecto es `#0099FF`; cualquier hex sirve (`acento: "#hex"`). `modo_inicial`: `auto` (sigue la preferencia del sistema) salvo que pida otro.
2. **Idiomas.** `idiomas: [en]`, `[en, es]` o `[es, en]`. **El primero va en la raíz** del sitio; los otros en `/{lang}/`, con selector. Si sus recruiters son mayormente de LATAM o España, puede ir `es` primero; si apunta a remoto global, `en`.
3. **Hosting.** **GitHub Pages** (recomendado: gratis, sin otra cuenta, con el `gh` que ya usa) o **Vercel**. Para Vercel, el CLI puede no estar instalado: el cliente corre `npm i -g vercel` y `vercel login` en su terminal. Eso lo hace **el cliente, nunca el agente**.
   - `repo:` el nombre del repo público. Default `{ghuser}.github.io` (queda en `https://{ghuser}.github.io/`). Chequeá si ya existe: `gh api repos/{ghuser}/{ghuser}.github.io --jq .html_url`. Si existe (ya tiene otro sitio ahí), ofrecé `portafolio` (queda en `https://{ghuser}.github.io/portafolio/`).
   - `dominio:` solo si **ya compró** un dominio (si no, `null` y arranca en el subdominio gratis).
   - Hosting, repo y dominio se definen **antes** del build: la URL base (canonical, sitemap, OG) depende de ellos. Si cambian, se regenera.
4. **Foto.** Pedile el archivo (una foto profesional, de frente). Copiala a `assets/` del repo privado y poné la ruta en `portafolio.yml → foto` (ej. `assets/foto.jpg`). **NUNCA** en `candidate.photo` de `profile.yml`: ese campo pone la foto en el CV PDF y la foto penaliza en ATS. Si `candidate.photo` ya tiene un archivo, ofrecé reusar ese mismo archivo para `foto` (sin tocar `candidate.photo`). Sin foto, el sitio muestra las iniciales. El build re-encodea la imagen y le saca EXIF/GPS.
5. **Sobre mí.** Escribí un borrador (2-3 párrafos cortos, en inglés, primera persona) desde `cv.md`, `narrative.*` de `profile.yml` y "Cross-cutting Advantage" de `modes/_profile.md`: qué construye, con qué impacto (al menos un número real), qué lo diferencia. El cliente lo edita: es su voz. Soporta `**negrita**` y `[texto](url)`.
6. **Proyectos.** Proponé 3-6 desde `cv.md` y sus repos públicos:

   ```bash
   gh repo list {ghuser} --source --visibility=public --limit 100 --json name,description,url,stargazerCount,primaryLanguage,homepageUrl,pushedAt
   ```

   Curá como en `/coderhub readme-github`: con estrellas, deployados, un producto real o relevantes al rol target; nunca tutoriales ni sandboxes. Cada uno: `nombre`, `descripcion` (qué resuelve + outcome), `stack`, `links: {repo, demo, docs}` (`docs`: documentación o paper del proyecto, opcional). **Links:** solo los que salen de `gh api` / `gh repo list` (`url`, `homepageUrl`), `cv.md`, `profile.yml` o los que pase el cliente. **Nunca armes una URL a partir de un nombre.** **Descartá cualquier link que apunte solo a un perfil** (ej. `github.com/{usuario}` sin repo, `linkedin.com/in/...`, `gitlab.com/{usuario}`) como link de un proyecto, aunque venga de `profile.yml` o de `cv.md`: un link de proyecto apunta al repo, la demo o la doc de **ese** proyecto. Si no hay link, el campo queda vacío. Si su prueba fuerte es privada (repos de la empresa), usá los proyectos de `cv.md` sin link.
7. **Stack destacado.** 6-12 tecnologías reales (incluida AI si la usa), cada una con su slug de [Simple Icons](https://simpleicons.org): `{name: "Go", slug: "go"}`. Si el logo no existe o no se reconoce (ej. AWS, o Java, cuyo slug es la mascota `openjdk`), `slug: ""` y sale como chip de texto. Debajo, el sitio lista como texto los grupos de `## Skills` de `cv.md`.
   **Eyebrow del hero:** la línea chica arriba del nombre sale de `eyebrow:` (opcional, ej. `"Backend · Payments · Go"`); si no está, son los **3 primeros** de `stack` unidos con ` · `. Por eso, poné primero las 3 tecnologías que mejor lo definen, o escribí `eyebrow:` a mano. Si hay `es`, se traduce en `es.eyebrow`.
8. **Recomendaciones (opcional).** Solo **reales y textuales** (ej. copiadas de su LinkedIn), con autor y rol, y solo si el cliente confirma que el autor está de acuerdo con que se publique. Nunca las redactes ni las "mejores". Si no tiene, `recomendaciones: []`.
9. **Contactos.** `contacto:` es una whitelist: solo se publica lo que está ahí. Proponé `[email, linkedin, github]` (+ `twitter` si lo usa profesionalmente). **`telefono` y `ubicacion` nunca por default:** solo si el cliente lo pide explícitamente. Si `telefono` no está en `contacto`, el PDF publicado también sale **sin teléfono** (ver punto 10).
10. **PDF del CV.** `cv_pdf:` el PDF **base** por idioma (el general, ej. `output/cv-{nombre}-general.pdf` y su versión `-es`). **Nunca uno adaptado a una oferta** (los que tienen empresa o rol de una postulación en el nombre). Si no hay PDF base todavía, `null` (sin botón) o generalo primero con el flujo del PDF del CV.
    **PDF sin teléfono:** si `telefono` no está en `contacto`, el build no copia el PDF tal cual: lo **re-renderiza sin el teléfono** desde el HTML hermano (`output/cv-{nombre}-general.html`, mismo nombre que el PDF). Si ese HTML no existe, el build falla y lo pide: regenerá el CV base con el flujo del PDF del CV (deja el `.html` al lado del `.pdf`) o poné `cv_pdf: null`. El PDF del repo privado no se toca.

Lo demás (`eyebrow`, `experiencia.max_bullets`, `secciones.educacion`, `secciones.certificaciones`) va con el default del ejemplo salvo que el cliente pida otra cosa.

## Reglas de contenido

- **Nunca inventes.** Todo dato sale de `cv.md`, `article-digest.md`, `profile.yml`, `portafolio.yml` o lo que el cliente diga en la charla. Nada que no esté en `cv.md` / `article-digest.md`: ni logros, ni números, ni tecnologías.
- **Voz:** `modes/_writing.md` y `voice-dna.md` (si existen) ganan sobre cualquier plantilla de esta skill. Anti-slop: fuera "passionate about", "always learning" y slogans genéricos; cada frase dice algo específico.
- **Stealth:** si `modes/_profile.md` tiene `## Stealth`, nada que muestre que busca trabajo: ni "open to work", ni "seeking", ni "looking for new opportunities", ni "available for hire", ni el rol target como búsqueda. El sitio muestra lo que hace, no lo que busca.
- **Coherencia:** mismo posicionamiento, logros y stack que el CV, el LinkedIn (`/coderhub linkedin`), el README (`/coderhub readme-github`) y el banner (`/coderhub banner`).
- **Idioma:** el contenido se escribe en inglés. El español **del sitio** es neutro (sin voseo: "tengo", "construyo", nunca "tenés"), igual que en `/coderhub traducir`; la charla con el cliente sigue en "vos". Si `idiomas` incluye `es`, la versión en español la arma `/coderhub traducir portafolio` (escribe el bloque `es:` de `portafolio.yml`). Después, **compará los números a mano** entre el bloque `es:` y el inglés (años, porcentajes, cantidades): el fact gate no chequea conteos en español.
- **El sitio no lleva** analítica, formulario, cookies, chatbot, scripts de terceros ni crédito a CoderHub. Es 100% del cliente. No lo agregues editando el HTML.

## Step 3 — Traducir (si hay un idioma además del inglés)

Si `idiomas` tiene `es` y no hay bloque `es:` (o el build avisa que la traducción quedó vieja), corré `/coderhub traducir portafolio` y volvé. Sin ese bloque el build falla con el mensaje que lo pide.

## Step 4 — Generar

```bash
node .agents/skills/coderhub-portafolio/build.mjs
```

Escribe `output/portafolio/` y al final imprime un JSON resumen: páginas, archivos, logos que cayeron a chip de texto, `warnings` y la lista `publico`. Si sale con error, el mensaje dice qué falta o qué está mal en `portafolio.yml` (campo obligatorio, hex, ruta que no existe, URL inválida, slug): corregilo en el YAML y volvé a correr. **Warnings: se resuelven antes de publicar.** El build avisa (sin fallar) cuando encuentra en el contenido:

- **Notas pendientes en `cv.md`** ("pending", "TODO", "exact list pending...", etc.).
- **Bullets que son solo una ubicación** (ej. un bullet que dice "Buenos Aires, Argentina").
- **Texto en español en el contenido EN.**
- **Búsqueda de trabajo visible** ("seeking", "open to", "looking for", "buscando", "disponible para"...), en el sitio o en el texto del PDF que se publica. Va a la revisión de privacidad (Step 6).
- **Un ` -- ` literal** (de `cv.md` o del YAML): en el sitio se ve tal cual. Proponé reescribir la frase en `cv.md` (coma, dos puntos o punto) y aplicalo solo con su OK. **Nunca lo cambies por un guión largo**: `voice-dna` los prohíbe.
- **`links.demo` que apunta a documentación** (`/docs`, `docs.`, `/documentation`): pasalo a `links.docs`.
- **El CV base lleva otra URL de portafolio** (o no lleva la del sitio): el PDF publicado saldría con la URL vieja. Se resuelve en el Step 7 ("Antes del primer push").

Mostrale **cada warning** al cliente, tal cual, y proponé el arreglo:

- Si el dato está mal en `cv.md` (nota pendiente, bullet de ubicación, frase en español): mostrale el **diff** propuesto de `cv.md` y aplicalo **solo con su OK**. Si la nota pendiente es un dato que no tenés (ej. la lista exacta de certificaciones), preguntáselo; nunca lo completes inventando.
- Si es algo del sitio (un texto de `portafolio.yml`, un bullet que conviene ocultar con `experiencia.max_bullets`): corregilo en `config/portafolio.yml`.

Regenerá hasta que no quede ninguno (o el cliente confirme explícitamente que un warning no aplica). **Nunca se publica con una nota pendiente visible.** Si cambiaste `cv.md` y hay `es`, la traducción queda vieja: volvé al Step 3.

Si algún logo cayó a chip, buscá el slug correcto en simpleicons.org o dejá el chip, que se lee bien.

## Step 5 — Preview e iteración

1. Abrí `output/portafolio/index.html` en el navegador (`open output/portafolio/index.html` en macOS, `xdg-open` en Linux). Los links son relativos: anda en `file://`.
2. **Miralo vos también** antes de mostrarlo: 4 capturas, desktop y mobile, cada una en claro y en oscuro.

   ```bash
   for scheme in light dark; do
     npx playwright screenshot --full-page --viewport-size=1280,800 --color-scheme=$scheme file://$PWD/output/portafolio/index.html /tmp/portafolio-desktop-$scheme.png
     npx playwright screenshot --full-page --viewport-size=390,844 --color-scheme=$scheme file://$PWD/output/portafolio/index.html /tmp/portafolio-mobile-$scheme.png
   done
   ```

   `--color-scheme` funciona con `modo_inicial: auto` (el sitio sigue la preferencia del sistema). Si fijó `light` o `dark`, el otro modo se ve con el toggle; para capturarlo, generá una copia aparte con `--mode`: `node .agents/skills/coderhub-portafolio/build.mjs --mode=dark --no-og --out=/tmp/portafolio-dark` (o `--mode=light`) y capturá esa. Si hay `es`, repetí con `output/portafolio/es/index.html` (o la raíz si `es` va primero).

   Que no haya scroll horizontal en mobile, textos cortados, secciones vacías ni contraste roto en alguno de los dos modos.
3. El cliente pide cambios → **se itera sobre `config/portafolio.yml` (o sobre `cv.md` si el dato está mal ahí), nunca sobre el HTML.** `output/portafolio/` se pisa en cada build. Regenerá y volvé a mostrar.

## Step 6 — Revisión de privacidad (obligatoria)

Antes de publicar, mostrale al cliente **todo lo que queda público**, desde la lista `publico` que imprime el build:

- Email (si está), teléfono (si está), ubicación (si está).
- Empresas que aparecen (las de su experiencia).
- El PDF que se publica y **qué datos lleva**: el PDF es el CV entero, así que trae lo que tenga su header (email, LinkedIn, GitHub, ubicación, URL) y toda la experiencia. Lo único que el build saca solo es el **teléfono** (si `telefono` no está en `contacto`, lo re-renderiza sin él). Listale los datos de contacto que efectivamente quedan en el PDF publicado (el resumen los trae en `publico[] → cv_pdf ({idioma}) → contacto`; si no, leelos del header del HTML hermano en `output/`) y marcá si alguno no está en `contacto` (ej. la ubicación). Si trae algo que no quiere publicar, o regenera el PDF base sin eso, o va `cv_pdf: null`.

- **Búsqueda de trabajo visible**, aunque no haya `## Stealth`: marcá cada frase tipo "seeking", "open to", "looking for", "buscando", "disponible para" que quede en el sitio **o en el PDF publicado** (el build las lista en `warnings`; igual revisá el texto vos). Preguntale si quiere que eso sea público: si no, ajustá el texto del sitio en `portafolio.yml` / `cv.md` (con su OK) y, si está en el PDF, regenerá el CV base sin esa frase o va `cv_pdf: null`.

Pedile confirmación explícita: *"Esto es todo lo que va a quedar público. ¿Lo publicamos así?"*. Sin un sí, no se publica.

**Nunca se publica** (el build falla si lo detecta; nunca lo saltees ni lo "arregles" editando el output):

- El pipeline, las ofertas o el tracker (`data/applications.md`, `data/pipeline.md`), ni empresas a las que postuló.
- La banda salarial o el target (`compensation.*`), visa o autorizaciones de trabajo.
- CVs adaptados a una oferta.
- Notas de entrevistas ni reportes de evaluación (`reports/`).
- Nada de `modes/_profile.md` que no esté en `portafolio.yml`.
- Emails alternativos, teléfono o ubicación si no están en `contacto`.

## Step 7 — Publicar (con confirmación)

Confirmá antes de cada acción que crea o cambia algo en su cuenta (crear el repo, pushear, habilitar Pages, deployar). Todo con **su** cuenta: nunca en la org `coderhub-os` ni en la de su empresa.

### Antes del primer push: la URL en el CV

El PDF que se publica sale del CV base, así que tiene que llevar **la URL del sitio** (la `url` del resumen del build) desde la primera publicación:

1. Si `config/profile.yml → candidate.portfolio_url` no es esa URL, mostrale el valor viejo y el nuevo, y con su OK escribila (cambiá solo esa línea). Así los CVs y las postulaciones la usan.
2. Si el build avisa que el CV base lleva otra URL de portafolio (o no lleva la del sitio), avisale y ofrecé regenerar el CV base con el flujo del PDF del CV (`modes/pdf.md`, el mismo de siempre) y volver a correr el build (Step 4). Recién con el warning resuelto (o con su OK explícito para publicar así) seguí al push.
3. Si después cambia la URL (Vercel devolvió otra, dominio propio), repetí estos dos pasos antes de volver a pushear.

### GitHub Pages

1. **Cuenta:** `gh auth status` y `gh api user --jq .login`. Tiene que ser `{ghuser}`. Si no está logueado, él corre `gh auth login`; si está en otra cuenta, `gh auth switch`. No sigas hasta que coincida.
2. **Repo:** si no existe, `gh repo create {ghuser}/{repo} --public --description "Personal portfolio"`. Si ya existe y tiene otra cosa (no es un portafolio publicado antes por esta skill), frená y volvé al Step 2.3 para elegir otro nombre.
3. **Push desde una carpeta aparte, nunca desde el repo privado:**

   ```bash
   git clone https://github.com/{ghuser}/{repo}.git /tmp/coderhub-portafolio-publish/{repo}
   rsync -a --delete --exclude .git output/portafolio/ /tmp/coderhub-portafolio-publish/{repo}/
   cd /tmp/coderhub-portafolio-publish/{repo}
   git checkout -B main
   git add -A && git commit -m "Publish portfolio"
   git push -u origin main
   ```

   Si `rsync` no está o el entorno lo bloquea, reemplazá esa línea por esta (también borra lo viejo, menos `.git`):

   ```bash
   git -C /tmp/coderhub-portafolio-publish/{repo} rm -rq --ignore-unmatch . && cp -R output/portafolio/. /tmp/coderhub-portafolio-publish/{repo}/
   ```

   (Si el clone de un repo vacío avisa "empty repository", es normal.) El repo público queda solo con el sitio generado: sin YAML, sin `cv.md`, sin datos crudos.
4. **Habilitar Pages** desde `main` (sin Actions: el sitio ya está generado):

   ```bash
   gh api repos/{ghuser}/{repo}/pages -X POST -f 'source[branch]=main' -f 'source[path]=/'
   gh api repos/{ghuser}/{repo}/pages --jq .html_url
   ```

   Si responde que Pages ya está habilitado, seguí.

### Vercel

1. `vercel --version` y `vercel whoami`. Si no está instalado o logueado, el cliente corre `npm i -g vercel` y `vercel login`. **Nunca lo hagas vos.**
2. Repo público igual que en Pages (pasos 1 a 3).
3. Desde `/tmp/coderhub-portafolio-publish/{repo}`: `vercel deploy --prod --yes` (sitio estático, sin framework ni build). Para que cada push deploye solo: `vercel git connect https://github.com/{ghuser}/{repo}`; si falla, guialo a conectar el repo desde el dashboard de Vercel.
4. Si la URL que devuelve Vercel no es `https://{repo}.vercel.app` (el nombre estaba tomado), poné esa URL en `portafolio.yml → url`, regenerá y volvé a deployar: la canonical y el sitemap tienen que apuntar a la real.

### Dominio propio (opcional, solo si ya lo compró)

- **Pages:** con `dominio:` en el YAML, el build genera el `CNAME`. Configuralo: `gh api repos/{ghuser}/{repo}/pages -X PUT -f cname={dominio}`. DNS en su proveedor: para el dominio raíz, 4 registros `A` a `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; para `www`, un `CNAME` a `{ghuser}.github.io`. Cuando el certificado esté listo: `gh api repos/{ghuser}/{repo}/pages -X PUT -F https_enforced=true`.
- **Vercel:** `vercel domains add {dominio} {proyecto}` y los registros DNS que indique el CLI.
- Los cambios de DNS él los hace en su proveedor; vos le das los valores exactos. Pueden tardar horas en propagar.

### Cerrar

Chequeá que el sitio responda: `curl -sI {url}`. Si `curl` está bloqueado en tu entorno, usá `node -e "fetch('{url}').then(r => console.log(r.status))"` (y lo mismo con `{url}cv-{nombre}-{idioma}.pdf`). Un 404 los primeros minutos es normal (ver Troubleshooting).

Devolvé la URL final. `candidate.portfolio_url` ya quedó escrita antes del push ("Antes del primer push"); si la URL final terminó siendo otra, volvé a ese paso, regenerá y republicá.

## Step 8 — Actualizar ("actualizá mi portafolio")

1. Aplicá los cambios que pida en `config/portafolio.yml` / `cv.md`. Si cambió el contenido en inglés y hay `es`, corré `/coderhub traducir portafolio` (el build avisa si la traducción quedó vieja).
2. Regenerá (Step 4) y mostrá el preview (Step 5).
3. Revisión de privacidad (Step 6): mostrá la lista `publico` y marcá qué cambió contra la vez anterior.
4. **Diff contra lo publicado:**

   ```bash
   git clone https://github.com/{ghuser}/{repo}.git /tmp/coderhub-portafolio-publish/{repo}   # o git pull si ya está
   rsync -a --delete --exclude .git output/portafolio/ /tmp/coderhub-portafolio-publish/{repo}/
   cd /tmp/coderhub-portafolio-publish/{repo} && git add -A && git diff --cached --stat
   ```

   Sin `rsync` (no está o el entorno lo bloquea), en vez de esa línea: `git -C /tmp/coderhub-portafolio-publish/{repo} rm -rq --ignore-unmatch . && cp -R output/portafolio/. /tmp/coderhub-portafolio-publish/{repo}/` (borra lo viejo igual que `--delete`). Para chequear lo publicado en vivo sin `curl`: `node -e "fetch('{url}').then(r => console.log(r.status))"`.

   Mostrale el resumen y confirmá. Con su OK: `git commit -m "Update portfolio" && git push`. En Vercel conectado al repo, el push deploya; si no, `vercel deploy --prod --yes`.

**Un "actualizá CoderHub" nunca republica solo.** El update del sistema puede traer mejoras de los temas, pero el sitio publicado cambia recién cuando el cliente pide "actualizá mi portafolio". Después de un update, como mucho, avisale que hay mejoras de temas disponibles.

## Reglas

- **Datos en el YAML, sitio generado.** Se itera sobre `config/portafolio.yml`, nunca sobre el HTML. El repo público solo tiene el output.
- **Privacidad primero.** Whitelist de contactos, revisión obligatoria antes de cada publicación, `telefono` y `ubicacion` nunca por default, PDF solo el base.
- **Nada sin confirmación.** Crear el repo, pushear, habilitar Pages, deployar y escribir `portfolio_url` piden un sí explícito, cada vez.
- **Cuentas del cliente, logins del cliente.** `gh auth login`, `vercel login` y la instalación del CLI los hace él. Nunca en `coderhub-os` ni en una org de su empresa.
- **Foto en `portafolio.yml → foto`, nunca en `candidate.photo`.**
- **Links reales.** Solo de `gh api`, `cv.md`, `profile.yml` o del cliente; nunca armados a partir de un nombre. Un link a un perfil (`github.com/{usuario}` sin repo) nunca es link de un proyecto.
- **Datos en el repo privado, output en ningún lado.** `config/portafolio.yml` y `assets/foto.jpg` se versionan en el repo privado del cliente; `output/` no se versiona; al repo público va solo el sitio generado.
- **Sin warnings abiertos.** Nunca se publica con una nota pendiente, un bullet de ubicación o español en el contenido EN.
- **Recomendaciones reales, textuales y con permiso.**
- **Sin analítica, formulario, cookies, scripts de terceros ni crédito a CoderHub.**

## Si el cliente marca un problema

Si el cliente marca algo (un texto genérico, un proyecto que no quiere mostrar, un dato que no quiere público, un tema que no le gusta en mobile), corregilo en el YAML y proponé sumar la regla con la fecha de hoy a la sección `## coderhub-portafolio` de `modes/_custom.md` (creala si no existe). Escribila solo con su OK. Este `SKILL.md` lo pisa cada update; `modes/_custom.md` es del cliente y no se toca.

## Troubleshooting

- **`Executable doesn't exist` / no encuentra Chromium:** `npx playwright install chromium` (el mismo paso que pide el PDF del CV).
- **Pages da 404 los primeros minutos:** es normal, el primer deploy tarda unos minutos (hasta ~10). Estado: `gh api repos/{ghuser}/{repo}/pages/builds/latest --jq .status`. Si sigue en 404, chequeá que `index.html` esté en la raíz de `main`.
- **El nombre del repo ya está usado:** si `{ghuser}.github.io` ya existe, usá `portafolio` (o el nombre que elija); cambiá `repo:` en el YAML y regenerá, porque la URL base cambia.
- **`gh` sin login o en otra cuenta:** que el cliente corra `gh auth login` o `gh auth switch` y verificá con `gh api user --jq .login`.
- **Vercel CLI no está:** `npm i -g vercel` + `vercel login`, los corre el cliente.
- **"La traducción quedó vieja":** el contenido en inglés cambió después de traducir. Corré `/coderhub traducir portafolio` y regenerá.
- **Logo como chip de texto:** el slug no existe en Simple Icons o no hubo red. Buscá el slug correcto o dejá el chip.
- **El build falla pidiendo el HTML del CV:** `telefono` no está en `contacto` y falta `output/cv-{nombre}-general.html` para re-renderizar el PDF sin teléfono. Regenerá el CV base con el flujo del PDF del CV o poné `cv_pdf: null`.
- **El eyebrow del hero no es el que quiere:** escribilo en `eyebrow:` (y en `es.eyebrow` si hay español) o reordená `stack` para que las 3 primeras sean las que lo definen.
