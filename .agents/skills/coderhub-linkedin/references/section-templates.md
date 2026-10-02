# Section templates — LinkedIn

Templates parametrizables. Las variables `{xxx}` se llenan con los datos del cliente (`cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`; ver el mapeo en `../SKILL.md`). Nunca se inventan.

---

## Headline — 3 variantes

### Variante A (keyword-heavy)
```
{rol_principal} | {tech_1} · {tech_2} · {tech_3} · {tech_4} · {tech_5} | {rol_secundario} | {diferenciador} | {modalidad} 🌍
```

Ejemplo:
```
Full Stack Developer | PHP · Laravel · Vue.js · Python · Django | Project Leader | AI Agents · Claude · MCPs | Testing CI/CD | Remote 🌍
```

### Variante B (narrativo)
```
{rol_principal} & {rol_secundario} | {stack_grouped} | Building {especialidad} | Open to Remote 🌍
```

Ejemplo:
```
Project Leader & Full Stack Developer | Laravel + Vue.js + Python | Building AI Agents & Automation Systems | Open to Remote 🌍
```

### Variante C (máximo SEO)
```
{rol_principal} · {tech_1} · {tech_2} · {tech_3} · {tech_4} · {tech_5} · {tech_6} · {tech_7} | {rol_secundario} | {diferenciador_1} · {diferenciador_2} | {tech_test_1} · {tech_test_2} | {modalidad}
```

Ejemplo:
```
Full Stack Developer · PHP · Laravel · Vue.js · Python · Django · Docker | Project Leader | AI Agents · Claude Code | CI/CD · Playwright · Pest | Remote
```

**Reglas:**
- Máximo 220 caracteres (LinkedIn corta el resto).
- NO empezar solo con el cargo — desperdicia keywords.
- `·` como separador (no comas, no `|` solo).
- Capitalizar todas las tecnologías como las marca el oficial (Vue.js, no vue.js).
- Si stealth = OFF y el cliente está desempleado, sumar `· Open to Work` al final.

---

## About — estructura completa

```
🚀 {rol_principal} {y_rol_secundario_si_aplica} with {anios}+ years building {qué_hace} with {top_5_stack}. Specialized in {diferenciadores_2_o_3}.

Currently {leading/working/freelancing} {dónde}{ubicación}{remoto} — {qué_hace_concretamente_1_línea}. {logro_destacado_1_con_número}.

What I bring to the table:

→ {Capability 1}: {detalle_técnico}
→ {Capability 2}: {detalle_técnico}
→ {Capability 3}: {detalle_técnico}
→ {Capability 4}: {detalle_técnico}
→ {Capability 5}: {detalle_técnico}
→ {Capability 6}: {detalle_técnico}

🌍 Available for remote opportunities {worldwide/región} — {restricciones_legales_si_aplica}
🗣️ {idiomas_del_profile_con_nivel}

Tech Stack: {dump_completo_separado_por_punto_medio}

📫 {CTA_según_stealth}
{links_del_profile}
```

**Reglas:**
- Línea 1 = todo el SEO antes de "ver más". Las primeras 270-300 caracteres son lo que se ve sin expandir.
- "Tech Stack:" es bloque indexado por LinkedIn — meter TODO el stack ahí, no es decorativo.
- Capabilities arrancan con verbo (capability) o sustantivo capitalizado (Full Stack Expertise, Technical Leadership).
- 🌍 y 🗣️ ocupan poco espacio y mejoran legibilidad.

### CTA según stealth

- **Stealth ON:** `📫 Open to new opportunities — let's connect!`
- **Stealth OFF (empleado, busca casual):** `📫 Open to interesting projects — let's connect!`
- **Stealth OFF (desempleado, busca activa):** `📫 Actively seeking new opportunities — let's chat!`

---

## Experience — por rol

```
{Título_optimizado_con_keywords}
{Empresa} · {Tipo_empleo}
{Mes_inicio} {Año} – {Mes_fin} {Año} (o "Present")
{Ubicación}

{1_linea_de_contexto_de_qué_hace_la_empresa_y_qué_hacés_vos}.

Key achievements:
• {logro_1_con_verbo_de_acción_+_qué_hizo_+_tech_+_métrica}
• {logro_2}
• {logro_3}
• {logro_4}
• {logro_5_si_aplica}
• {logro_6_si_aplica}

Tech stack: {tecnologías_del_rol_separadas_por_coma}
```

**Título optimizado:** en vez de "Software Engineer" → "Senior Software Engineer (PHP/Laravel, AWS)". Sin pasarse de 100 caracteres.

---

## Skills — agrupación

### Obligatorias (top 15-20 — las que más buscan recruiters)
Stack principal del cliente + lenguajes core + frameworks core + DBs + soft skills básicas.

### Importantes (~25 — diferenciadores)
Stack secundario + DevOps + testing tools + arquitecturas + soft skills senior (Team Leadership, Project Management, Technical Leadership).

### Tendencia 2026 (~10 — keywords calientes)
- AI Integration
- Claude AI / Claude Code
- AI Agents
- MCP (Model Context Protocol)
- Prompt Engineering
- LLM Integration
- OpenAI API / Anthropic API
- Retrieval-Augmented Generation (RAG)
- Vector Databases
- Automation

**Reglas:**
- Top 3 visibles del perfil = las 3 más buscadas del rol target del cliente.
- Reordenar para que las que tienen más endorsements queden top.
- Eliminar skills genéricas o irrelevantes que diluyan (ej. si vendés backend, sacar "Microsoft Office").
- Usar las 50 que LinkedIn permite.

---

## Projects — entry por logro

```
Nombre: {Nombre_del_proyecto_con_métrica}
Descripción: {2_a_3_líneas_explicando_qué_es_+_problema_que_resolvió_+_resultado}.
Technologies: {lista_separada_por_coma}
URL (opcional): {si_hay_demo_o_repo}
```

Ejemplo:
```
Nombre: AI Agents with Claude — 70% Generation Cost Reduction
Descripción: Developed multiple production AI agents using Claude for complex flow automation: chatbots with persistent context, literary guide generators and validators. Optimized token architecture achieving 70% reduction in generation costs (from $10 to $2-3 USD per guide).
Technologies: Claude AI, Claude Code, MCP, PHP, Laravel, Python
```
