# Quality bar — el método CoderHub para un profile README de GitHub

Fuente de verdad del contenido de un **profile README** (el repo especial `usuario/usuario` que se muestra arriba de tu perfil de GitHub). Destilado de: (1) perfiles reales que posicionan bien — **natemoo-re**, **simonw**, **terrytangyuan**, **rednafi**; (2) el canon de craft de [awesome-readme](https://github.com/matiassingers/awesome-readme); (3) [awesome-github-profile-readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme) (arquetipos + tools); (4) artículos: Martin Heinz ("README as landing page"), Simon Willison ("self-updating README"), Jessica Lim ("diferenciarte, no acumular widgets"). No copiar datos — copiar el **nivel, la estructura y las reglas**.

> **Coherencia con el resto:** el README, el CV y el LinkedIn cuentan la **misma historia** — mismo rol target, mismo posicionamiento, mismos logros con números. Ver `.agents/skills/coderhub-linkedin/references/quality-bar.md` y `bullets.md` en la misma carpeta.

---

## 1. Qué es (y qué NO es)

Un **profile README** es tu **landing page profesional** en GitHub. NO es un README de proyecto.

- ✅ Es: posicionamiento (qué construís + para quién) + **prueba** (proyectos reales con outcome) + cómo contactarte.
- ❌ NO lleva el andamiaje de un README de proyecto: nada de *installation*, *usage*, *contributing*, *license*, *code coverage*, *TOC*. Eso es para repos de código, no para tu perfil.

**Dos lectores** (igual que CV/LinkedIn):
1. **Recruiter / hiring manager** — scanea ~10 segundos. Busca: ¿qué hace esta persona? ¿qué construyó de verdad? ¿seniority?
2. **Dev / futuro colega** — mira los proyectos y el stack, evalúa criterio técnico.

**Regla madre:** cada elemento tiene que **probar algo sobre tu trabajo**. Si solo se explica como "es lindo" o "es un flex técnico", es decoración → fuera.

---

## 2. Estructura canónica (orden)

1. **Hero — posicionamiento en 1 línea** (§3). Opcional: banner con el tagline (`/coderhub banner` lo genera en `assets/banner.png`). **NUNCA** gif de "Hi 👋" ni typing SVG genérico.
2. **Value prop** (2-3 frases, blockquote): qué construís, con al menos **un número**, tu rol actual y qué estás shippeando.
3. **Stack** — 4-6 badges del stack **real** (incluí AI si la usás: Claude, Claude Code, MCP). No 20 badges.
4. **Proyectos / "What I'm building"** — la **estrella** (§4). 3-8 curados, cada uno con link + qué resuelve + outcome + stack.
5. **Experiencia** (opcional) — rol/empresa actual con link + 1 línea. Solo si suma.
6. **Connect** — fila compacta de íconos: LinkedIn, portfolio, email, CV/PDF.
7. **Personalidad** (opcional) — random facts en `<details>` colapsable + quote de cierre. Da color sin ensuciar.

Largo objetivo: que entre **sin scroll infinito**. Un perfil es un pitch, no una wiki.

---

## 3. El hero — posicionamiento, no saludo

Lo primero que se lee define si el recruiter sigue o se va.

- ✅ **Qué construís + para quién + tu diferenciador.** Ej. (perfil de un ex alumno): *"Engineering AI-powered tools that move businesses forward — AI-native Full Stack Developer."* Ej. (natemoo-re): abre con identidad + prueba de peso inmediata (co-creó Astro).
- ❌ **NO** *"Hi 👋, welcome to my GitHub profile"* — es el default de los generadores, no dice nada.
- ❌ **NO** typing-SVG que tipea "Welcome to my profile" en loop — cliché total, cero información.
- ❌ **NO** frases genéricas: *"passionate about clean code"*, *"always learning"*, *"crecer y performar a mi mejor nivel"*. No te distinguen de nadie (misma regla anti-slop que CV §11 y LinkedIn §11).

**Value prop debajo del hero:** 2-3 frases con un número real. *"I build AI agents that cut costs by 70%... currently leading dev teams remotely for Europe while shipping my own products."* Concreto, cuantificado, presente.

---

## 4. Los proyectos son la prueba (la estrella del README)

Acá es donde ganás o perdés. Es el equivalente a los bullets con métricas del CV.

- ✅ **Curá 3-8 proyectos**, los más impactantes/relevantes al rol target. **Calidad > catálogo** — un perfil real lista 17, y para un dev buscando trabajo eso es demasiado (diluye). Elegí los que mejor prueban tu nivel.
- ✅ **Cada proyecto:** nombre + **link directo** + qué resuelve (1 línea) + **outcome/número** si lo hay + **stack** (en itálica). Los recruiters no exploran tu GitHub solos — dales el link y el pitch.
- ✅ **Tag de estado** (`open source · MIT` / `private`) para dar contexto.
- ✅ El reframe **"Not a X. A Y."** (ej.: *"Not a chatbot. A second mind."*) es memorable — **opcional**, y si se usa en todos suena gimmick; usalo en los 2-3 que de verdad lo merecen.
- ✅ **Traé los proyectos del GitHub real** de la persona (vía `gh api`), no inventes. Priorizá: los que tienen estrellas, un producto real/deployado, o son relevantes al rol target. Un proyecto de **AI/agentes** hoy es diferencial fuerte.
- ❌ **NO** listar sandboxes de aprendizaje, tutoriales seguidos, o repos triviales — restan (señalizan junior), igual que en el CV.

Si la persona **no tiene proyectos públicos fuertes**, el README se apoya más en el value prop + experiencia + un feed de blog/actividad. No forzar una sección de proyectos flojos.

---

## 5. Señal vs. decoración — el filtro de widgets

La regla: **¿este widget prueba algo sobre mi trabajo, o solo es lindo?** Si es lo segundo, fuera.

**SEÑAL (puede sumar):**
| Widget | Cuándo sí |
|---|---|
| Feed auto-actualizado de blog posts (dev.to/Medium) | Fuerte: probás pensamiento propio y escritura recurrente |
| Feed de releases OSS (à la simonw) | Fuerte: evidencia de que seguís shippeando |
| github-readme-stats / streak | Solo si el volumen es **genuinamente alto**; si no, expone poca actividad |
| WakaTime | Solo si el número respalda el discurso ("80% backend") |
| Badges de stack (Shields/Simple Icons) | 4-6 del stack **real**, no 20 |
| npm downloads | Prueba dura: gente usa tu código en prod |
| Link a LinkedIn / CV / portfolio | Puente directo a la prueba profesional |

**DECORACIÓN / RUIDO (fuera para un dev buscando trabajo):**
- Visitor counter (vanity metric estilo 90s — grita "no sé qué poner")
- Typing SVG genérico, gif de bienvenida, fancy fonts
- Snake animation / game mode / trophy / profile score (flex técnico, cero señal de seniority)
- Spotify now-playing, GoodReads, memes, jokes, zodiac (personalidad irrelevante para un recruiter)
- Anime/retro como **identidad primaria** (compite con la señal profesional)
- YouTube/Twitter stats **salvo** que crear contenido sea parte real de tu pitch

---

## 6. Auto-actualización = señal de vigencia

Un README **estático que no cambia en 2 años** transmite abandono. El opuesto — un feed **auto-actualizado** (últimos blog posts, releases, actividad) vía GitHub Actions — es la señal más fuerte de *"sigo activo y shippeando"* (principio de Simon Willison).

- Si la persona escribe (blog/dev.to) o publica OSS con regularidad → recomendar un workflow de auto-feed.
- Si no → mantener el README conciso y **actualizable a mano fácil** (que no envejezca al primer cambio de rol).
- La skill genera el README; si se agrega auto-feed, dejar el workflow documentado. No es obligatorio — un README estático bien posicionado le gana a uno dinámico lleno de ruido.

---

## 7. Arquetipos — elegir con criterio

De los ~16 que cataloga la comunidad, para un dev buscando trabajo la combinación ganadora es **Descriptive + Projects curados + Badges seleccionados** (+ un toque Minimalistic). Evitá el arquetipo **"A Little Bit of Everything"** (widget soup) — es el antipatrón por definición.

| Arquetipo | ¿Sirve? |
|---|---|
| Descriptive (texto real de quién sos y qué hacés) | ✅ La base |
| Minimalistic (poco texto, espacio, tipografía) | ✅ Si el texto es fuerte |
| Badges (stack real, curado) | ✅ Con moderación (§5) |
| Icons (fila de contacto/CV curada) | ✅ Para el Connect |
| GitHub Actions (auto-feed de contenido real) | ✅ Si hay contenido que mostrar (§6) |
| Typing / GIFs / Anime / Game / Retro / "Everything" | ❌ Decoración o identidad no-profesional |

---

## 8. Anti-patterns (lo que grita junior / genérico)

- **Sin one-liner de identidad** — abre con "Hi, welcome" en vez de qué hacés y para quién.
- **Widget soup** — stats + streak + trophy + visitor + typing + badges apilados sin jerarquía = "no supe qué cortar".
- **Vanity metrics sin contexto** — visitor counters, streaks, trophy scores: cuantifican actividad en GitHub, no capacidad de resolver problemas.
- **Template sin editar** — se nota el username del generador pegado o el texto copy-paste de un ejemplo.
- **Gifs/anime/retro como identidad primaria** — compiten con la señal profesional.
- **Stack badges sin curar** — 15-20 techs tocadas una vez, en vez de 5-6 que dominás.
- **Sin proof point** — nombrar tecnologías sin mostrar qué construiste (ni link, ni métrica, ni logo de empresa).
- **Todo estático y viejo** — README sin cambios en años.
- **Anti-slop** (igual que CV/LinkedIn): "passionate about", "always learning", slogans genéricos → borrar o reemplazar por algo específico.

---

## Checklist antes de entregar

- [ ] ¿El hero dice **qué construís + para quién + diferenciador** en la primera línea? (no "Hi 👋", no typing SVG)
- [ ] ¿Value prop con al menos **un número** + rol actual?
- [ ] ¿Stack en **4-6 badges reales** (incluida AI si aplica), no 20?
- [ ] ¿Sección de proyectos con **3-8 curados**, cada uno con link + qué resuelve + outcome + stack?
- [ ] ¿Los proyectos salen del **GitHub real**, priorizando los fuertes (sin sandboxes/tutoriales)?
- [ ] ¿Connect compacto (LinkedIn, portfolio, email, CV)?
- [ ] ¿Cero widgets de decoración (visitor counter, typing, snake, trophy, spotify, memes)?
- [ ] ¿Personalidad (si va) en `<details>`, sin ensuciar?
- [ ] ¿**En inglés**? (regla dura — el profile README va en inglés aunque el target sea LATAM)
- [ ] ¿Coherente con el CV y el LinkedIn (mismo rol target, mismos logros)?
- [ ] ¿Sin AI-slop / "passionate about" / slogans genéricos?
- [ ] ¿README que no envejece rápido (o auto-feed si hay contenido real que mostrar)?
- [ ] ¿Cero invento — todo defendible?
