# Cómo funciona LinkedIn Recruiter (la teoría detrás de todo)

LinkedIn Recruiter es la herramienta interna que usan los recruiters. Buscan candidatos con queries booleanas tipo:

- `"Senior Backend" AND "Laravel" AND "Remote"`
- `"PHP" AND "Vue.js" AND "Python"`
- `"Full Stack" AND "AI" AND "Remote"`
- `"Tech Lead" AND "Microservices"`

Para que aparezcas en los resultados, **las keywords tienen que estar en los campos correctos**, con la frecuencia y peso correcto.

## Tabla de pesos por campo

| Campo | Peso | Notas |
|---|---|---|
| **Headline** | Máximo | Lo más importante. 220 caracteres, usar todos. |
| **Job Titles** (en Experience) | Alto | El cargo formal de cada rol. |
| **Skills** | Alto | LinkedIn filtra explícitamente por skills declaradas. Las endorsadas pesan más. |
| **About / Summary** | Medio | Indexado pero menos peso que Headline. |
| **Job Descriptions** (en Experience) | Medio | El cuerpo de cada rol. |
| **Projects** | Bajo-Medio | Sí indexa, pero menos visible para algorithm. |
| **Education** | Bajo | Solo si la búsqueda incluye filtros académicos. |
| **Recommendations** | Muy bajo | No es buscable directamente. |

## Regla de las 6 ubicaciones

Las keywords más importantes del rol target del cliente deben aparecer en **al menos 3 de los 6 campos principales** (Headline, Job Titles, Skills, About, Job Descriptions, Projects).

Ejemplo para "Full Stack Developer Laravel":

| Keyword | Headline | Job Title | Skills | About | Job Desc | Projects |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Full Stack Developer | ✅ | ✅ | ✅ | ✅ | — | — |
| Laravel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PHP | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Vue.js | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Remote | ✅ | — | — | ✅ | — | — |

## Truco del "Tech Stack" en About

Al final del About, meter una línea con el dump completo del stack separado por `·`:

```
Tech Stack: PHP · Laravel · Filament · Vue.js · Python · Django · Node.js · JavaScript · Angular · Ionic · MySQL · PostgreSQL · MongoDB · Docker · GitHub Actions · Playwright · Pest · PHPUnit · Dusk · Claude Code · Claude AI · GPT · Gemini · Ollama · MCP · CI/CD · Git · Jira · Scrum · Linux · Cloudflare · Bootstrap · Swagger
```

Aunque parezca decorativo, **LinkedIn lo indexa como keywords**. Es el truco más infrautilizado que conozco.

## Densidad de keywords (no abusar)

Las keywords tienen que estar pero **sonar naturales**. LinkedIn detecta keyword stuffing y penaliza.

- ✅ "Built backend services with Laravel and PHP, integrating with React frontends and PostgreSQL databases."
- ❌ "Laravel Laravel Laravel PHP PHP backend Laravel PHP."

Regla simple: **si te suena raro al leerlo en voz alta, está stuffeado.**

## Idioma — inglés primero, español aparte

El perfil se escribe **en inglés** (más volumen de búsquedas y mejor salario). Si el cliente apunta también a LATAM hispano, la versión en español sale con `/coderhub traducir linkedin` (hay recruiters bilingües que buscan en español). LinkedIn permite cargar un perfil secundario en otro idioma: el español va ahí, no mezclado dentro del About en inglés.

## Lo que NO ayuda

- Emojis en exceso.
- Headlines tipo "Looking for opportunities!" (peor SEO que cualquier rol con tech).
- Listar tech outdated (jQuery, Backbone, etc.) si no es relevante al rol target — diluye.
- Skills "Microsoft Word", "Email", "PowerPoint" si vendés backend — ruido puro.

## Métricas para trackear

Pedir al cliente que mida en 14 días post-optimización:

- **Profile views/semana** (esperado: +30-50%)
- **Search appearances/semana** (esperado: +50-100%)
- **InMails de recruiters** (esperado: 1+ por semana en mercados activos)

Si después de 14 días no se mueve la aguja, revisar:
1. ¿El cliente aplicó TODOS los cambios o solo algunos?
2. ¿El rol target es realista para su seniority real?
3. ¿Hay restricciones de visa/ubicación que limitan el match?
