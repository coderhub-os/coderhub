<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/wordmark-dark.svg"><img src="docs/wordmark-light.svg" alt="CoderHub OS" width="250"></picture></p>

<p align="center">
  <strong>Tu búsqueda laboral, con IA, en tu máquina.</strong><br>
  Te dice qué ofertas son reales, cuáles te matchean y qué hacer con cada una. <strong>Nunca se postula por vos.</strong>
</p>

<p align="center"><sub>Parte de la mentoría <a href="https://arielmirra.com/vsl">CoderHub</a>. Novedades y tips en <a href="https://www.instagram.com/ariel.mirra/">Instagram</a>.</sub></p>

## Qué hace por vos

Pegás una oferta. Te dice si vale la pena.

- **Es falsa o vieja?** Detecta ghost jobs y estafas antes de que escribas una palabra.
- **Es para vos?** Puntúa el rol contra tu CV real y te avisa si el fit es flojo. Podés ignorarlo.
- **Vale la pena?** Arma el CV, la cover letter y las respuestas. Vos las leés. Vos las mandás.
- **A quién le escribo?** Encuentra a la persona y te deja el mensaje listo. Nunca lo manda.
- **Dónde queda todo?** Cada postulación queda en tu máquina. No se sube nada a ningún servidor nuestro.
- **Qué me falta aprender?** Después de varios "no", te dice cuál es el gap.

Las primeras corridas son medio crudas: todavía no te conoce. Hablale. Tu CV, qué buscás, qué no aceptás. La primera vez que lo abrís te pide todo eso por chat. No hay nada que configurar a mano.

## Qué no hace

- **Postularse solo.** Te arma la respuesta de cada campo; vos revisás y hacés clic en Submit. El script nunca hace el POST (`prepare-application.mjs`).
- **Mandar emails.** Solo borradores. No hay forma de enviar mails en todo el código.
- **Mandar tus datos a ningún lado.** Sin telemetría ni backend propio. Tu CV va de tu máquina al proveedor de IA que elegiste, y a ningún otro lado.
- **Empujarte a postularte debajo de 4.0/5.** Te va a decir que no. Podés hacerlo igual, y te lo va a marcar.

Reformula tu CV; nunca tiene que inventarlo. Hoy esa regla vive en los prompts, todavía no en un chequeo de código. Leé cada CV antes de mandarlo.

## Funciones

| Función                  | Qué hace                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Evaluación A-H**       | Resumen del rol, match con tu CV (cuánto pesa cada requisito en esa oferta y de dónde sale ese peso), estrategia de seniority, research de sueldo, personalización y prep de entrevista (STAR+R). Suma un chequeo de legitimidad (bloque G) que marca estafas y ghost jobs, y una señal de permiso de trabajo que marca como bloqueante una oferta que dice explícitamente que no da sponsorship |
| **Human-in-the-Loop**    | AI evaluates and recommends, you decide and act. The system never submits an application -- you always have the final call <!-- hitl: absolute guarantee. Do not add "automatically", "by itself", "without your permission" or any other hedge when translating this row. -->               |
| **CV en PDF para ATS**   | CV adaptado a cada oferta, con las keywords del puesto                                                                                   |
| **Cover letters**        | Basadas en research de la empresa, con las keywords de la oferta y tu OK en el chat antes de generar el PDF                              |
| **Más allá del CV**      | Research de la empresa (`deep`), búsqueda del hiring manager o recruiter con el mensaje de LinkedIn listo (`contacto`) y borradores de email de postulación (`email`), sin enviar nada |
| **Patrones**             | Patrones de rechazo, tasa de avance por canal, embudo completo y detección de ofertas republicadas                                       |
| **Scanner de portales**  | 100+ empresas precargadas y búsquedas en Ashby, Greenhouse, Lever, Wellfound y más                                                      |
| **Seguimiento**          | Tracker de postulaciones, cadencia de follow-ups y clasificación de respuestas de las empresas                                          |
| **Entrevistas y ofertas** | Plan de preparación, práctica con feedback, debrief post-entrevista, lectura de contratos y análisis de sueldo                        |

## Instalación

Necesitás [git](https://git-scm.com), [Node.js](https://nodejs.org) 22.5 o más nuevo y [Claude Code](https://claude.com/claude-code) (o OpenCode, Codex u otro CLI de IA).

1. Aceptá la invitación al repo que te llegó por GitHub.
2. Clonalo y abrilo con tu CLI:

   ```bash
   git clone https://github.com/coderhub-os/<tu-repo>.git
   cd <tu-repo>
   claude
   ```

3. Escribí `/coderhub`.

La primera vez te guía por todo: instala lo que falte (`npm install`, Chromium para los PDFs), te pide tu CV y arma tu perfil charlando. Si algo falla, corré `npm run doctor`: te dice qué falta.

> **El sistema se personaliza con tu propio CLI.** Modos, arquetipos, pesos del scoring, guiones de negociación: pedile que los cambie. Lee los mismos archivos que usa, así que sabe qué tocar.

## Primeros pasos

1. **Setup.** La primera vez que escribís `/coderhub` te pide tu CV y tu LinkedIn. Pegalos enteros: cuanto mejor el input, mejor el output. Después te confirma tus datos, te pide el rango de sueldo que buscás y arma tu lista de portales (`portals.yml`).
2. **Juntá ofertas.** `/coderhub scan` busca en tus portales y `/coderhub titles` te da más títulos para buscar en LinkedIn. Las que encuentres por tu lado, sumalas a `data/pipeline.md` (o pedile que las sume) y corré `/coderhub pipeline`.
3. **Evaluá y postulá.** Pegá cada oferta: te da el score y, si vale la pena, el CV adaptado. Vos lo leés y vos postulás.
4. **Seguí el pipeline.** `/coderhub tracker` y `/coderhub followup` te dicen dónde está cada postulación y a quién escribirle.
5. **Preparate.** Cuando te llaman, `/coderhub interview-prep` y `/coderhub interview/practice`.

**En Claude Code:** Sonnet con esfuerzo medio alcanza. Nombrá la sesión con `/rename CoderHub OS`; si se te apaga la compu, `claude --resume "CoderHub OS"` te deja donde estabas.

## Qué hacer en cada caso

Todo arranca con `/coderhub`. Si no sabés por dónde empezar, escribí lo que te pasa en lenguaje natural ("me llegó esta oferta", "me agendaron una entrevista") y te lleva al modo correcto.

### Me llegó una oferta (JD)

Pegá la URL o el texto de la oferta en el chat. Sin comando extra: lo detecta y corre el pipeline.

```
/coderhub https://empresa.com/jobs/123
```

Qué pasa:

1. Chequea que la oferta siga abierta y no sea ghost job ni estafa.
2. La puntúa contra tu CV real (bloques A-H) y te dice si vale la pena. Debajo de 4.0/5 te desaconseja postular.
3. Si vale la pena, deja el reporte en `reports/`, el CV adaptado en PDF en `output/` y la fila en el tracker.

Después, según lo que quieras:

| Querés | Corré |
| ------ | ----- |
| Solo la evaluación, sin armar el PDF | `/coderhub oferta` |
| Solo el CV adaptado | `/coderhub pdf` |
| Cover letter | `/coderhub cover` |
| Comparar varias ofertas y quedarte con la mejor | `/coderhub ofertas` |
| Saber a quién escribirle (recruiter o hiring manager) con el mensaje listo | `/coderhub contacto` |
| Investigar la empresa a fondo antes de postular | `/coderhub deep` |

### Quiero postularme

```
/coderhub apply
```

Abrí el formulario de la empresa. `apply` lee la página con un navegador visible (Playwright, el Chromium que instaló el setup), carga el reporte y el CV adaptado de esa oferta y **completa los campos por vos**: datos, preguntas abiertas, sueldo pretendido. Antes de completar chequea que la oferta siga viva, que no te hayas postulado ya por otro canal y que no haya preguntas eliminatorias (visa, título, piso salarial) que tengas que decidir vos.

Llega hasta el último paso. **El clic en Submit es tuyo**: revisás todo lo que cargó y mandás. Es a propósito: una respuesta inventada en una postulación se paga cara, y el sistema nunca manda nada en tu nombre. Si no podés usar el navegador, pasale una captura o pegale las preguntas y te arma las respuestas para copiar.

Si preferís postular por mail: `/coderhub email` deja el borrador, nunca lo envía.

### Me agendaron una entrevista

Pasale todo lo que tengas y pedí la prep:

```
/coderhub interview-prep
```

Pegale en el mismo mensaje:

- La **JD** (o la URL, si nunca la evaluaste).
- El **mail o la invitación** de la entrevista: fecha, hora, plataforma, tipo de ronda.
- Los **nombres de los entrevistadores**, con su LinkedIn o el texto de su perfil si lo tenés. Los perfila (cargo, antigüedad, qué te van a preguntar según su trayectoria) y marca quién probablemente decide.
- Notas de un coffee chat con alguien de la empresa, si hiciste uno.

Te devuelve: research de la empresa, cómo suele ser el proceso, desglose ronda por ronda, preguntas probables según quién entrevista (recruiter, hiring manager, técnico), tus historias STAR mapeadas a cada una, checklist técnico y preguntas para hacerles de vuelta. Queda guardado en `interview-prep/`.

El resto del ciclo:

| Momento | Corré |
| ------- | ----- |
| Tenés poco tiempo y querés un plan por horas | `/coderhub interview/plan` (pide JD, fecha y hora, entrevistadores) |
| Querés ensayar | `/coderhub interview/practice` (una pregunta por vez, con feedback) |
| Terminó la entrevista | `/coderhub interview/debrief` (qué preguntaron, qué salió bien, qué reforzar antes de la próxima ronda) |
| Te hicieron una oferta o te mandaron un contrato | `/coderhub offer-prep` (lectura del contrato y análisis de sueldo, no es asesoramiento legal) |
| No te contestan | `/coderhub followup` |

### Quiero más ofertas

```
/coderhub scan
```

Busca ofertas nuevas en tus portales (`portals.yml`: más de 100 empresas precargadas, más Ashby, Greenhouse, Lever y otros) y las suma a `data/pipeline.md`. Después:

1. `/coderhub pipeline` evalúa todas las pendientes de una vez.
2. Mirá el ranking con `/coderhub tracker` o `npm run serve:dashboard`.

Si salen pocas, el problema suele ser la búsqueda, no el mercado:

| Problema | Qué hacer |
| -------- | --------- |
| Te faltan títulos para buscar | `/coderhub titles`: propone roles afines a tu CV (el mismo trabajo se llama distinto en cada empresa) |
| Una empresa que te interesa no está en la lista | Pedile que la sume. `/coderhub discover` busca su portal y la deja lista para el scan |
| Encontraste ofertas por tu cuenta (LinkedIn, referidos) | Sumalas a `data/pipeline.md` (o pedile que las sume) y corré `/coderhub pipeline` |
| Te rechazan seguido | `/coderhub patterns`: te dice por qué y cómo ajustar el target |
| Siempre te falta lo mismo | `/coderhub expand`: competencias que podés sumar al CV |

## Uso

En los CLIs que registran slash commands (Claude Code, OpenCode, Cursor, Qwen y otros):

```
/coderhub             → Menú con todos los comandos
/coderhub {oferta}    → Pipeline completo: evaluación + reporte + PDF + tracker (pegá el texto o la URL)
/coderhub pipeline    → Procesa las URLs pendientes de data/pipeline.md
/coderhub oferta      → Solo la evaluación, bloques A a H (sin PDF)
/coderhub ofertas     → Compara y rankea varias ofertas
/coderhub contacto    → Encuentra a quién escribirle y te arma el mensaje
/coderhub deep        → Research a fondo de la empresa
/coderhub interview-prep → Prep de entrevista para esa empresa
/coderhub interview/practice → Práctica de entrevista, pregunta por pregunta, con feedback
/coderhub pdf         → Solo el CV en PDF, optimizado para ATS
/coderhub cover       → Cover letter
/coderhub email       → Borrador de email de postulación (nunca lo manda)
/coderhub apply       → Te ayuda a completar el formulario (el Submit lo hacés vos)
/coderhub expand      → Competencias que te faltan y podés sumar al CV
/coderhub scan        → Busca ofertas nuevas en los portales
/coderhub titles      → Títulos de rol afines a tu CV, para ampliar la búsqueda
/coderhub tracker     → Estado de tus postulaciones
/coderhub followup    → Follow-ups vencidos y borradores
/coderhub patterns    → Por qué te rechazan y cómo ajustar el target
/coderhub offer-prep  → Lectura de una oferta o contrato que te llegó (no es asesoramiento legal)
/coderhub update      → Actualiza CoderHub OS con vista previa de los cambios
```

`/coderhub` solo te muestra el menú completo. También podés pegar la URL o el texto de una oferta directo: lo detecta y corre el pipeline.

### Codex

En Codex los slash commands no están garantizados. Pedí el modo en lenguaje natural (plain language), en el prompt:

```text
Evaluá esta oferta con el auto-pipeline: https://empresa.com/jobs/123
Corré el modo scan y resumime las ofertas nuevas.
Corré el modo tracker y resumime el estado de mis postulaciones.
```

O sin abrir una sesión, con `codex exec`:

```bash
codex exec "Corré el modo scan y resumime las ofertas nuevas."
```

La guía completa de Codex (en inglés) está en `docs/CODEX.md`.

## Cómo funciona

```
Pegás la URL o el texto de una oferta
        │
        ▼
┌──────────────────┐
│  Detección de    │  Clasifica el tipo de rol
│  arquetipo       │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Evaluación A-H  │  Match, gaps, sueldo, historias STAR, legitimidad
│  (lee cv.md)     │
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Reporte PDF Tracker
   .md  .pdf
```

## Dashboard

Un panel en la terminal para recorrer tu pipeline:

```bash
npm run serve:dashboard
```

## Tus datos

Tu CV (`cv.md`), tu perfil (`config/profile.yml`), el tracker (`data/`), los reportes (`reports/`) y los PDFs (`output/`) son tuyos. `/coderhub update` nunca los toca: solo actualiza los archivos del sistema, y antes te muestra qué cambia.

## Aviso

**CoderHub OS es una herramienta local, no un servicio online.** Al usarla, aceptás que:

1. **Tus datos son tuyos.** Tu CV y tus datos quedan en tu máquina y van directo al proveedor de IA que elijas (Anthropic, OpenAI, etc.). No los recolectamos ni tenemos acceso.
2. **La IA la controlás vos.** Los prompts le indican que nunca se postule por vos, pero los modelos pueden fallar. Revisá todo lo que genera antes de mandarlo.
3. **Respetás los términos de cada portal** (Greenhouse, Lever, Workday, LinkedIn, etc.). No lo uses para spamear empresas.
4. **No hay garantías.** Las evaluaciones son recomendaciones. Los modelos pueden inventar skills o experiencia.

## Licencia

Código bajo licencia [MIT](LICENSE).
