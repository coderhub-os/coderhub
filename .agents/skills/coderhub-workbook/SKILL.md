---
name: coderhub-workbook
description: >-
  CoderHub OS: el workbook de las lecciones de Skool, dentro de CoderHub OS. Se
  invoca como `/coderhub leccion 3-2` (o `/coderhub workbook 3-2`) para hacer el
  ejercicio de una lección, y `/coderhub workbook` para ver el progreso. Arranca
  de lo que ya sabe del cliente, pregunta solo lo que falta, marca las
  respuestas flojas y guarda cada dato donde CoderHub OS lo usa (perfil, story
  bank, proof points), siempre con OK del cliente.
---

# CoderHub — Workbook

El workbook de CoderHub, hecho conversación. Cada lección de Skool termina con un ejercicio: esta skill lo corre, guarda las respuestas del cliente en `data/workbook.md` (su cuaderno) y lleva cada dato al archivo de CoderHub OS que lo usa. Lo que el cliente responde una vez sirve para los CVs, las ofertas y las entrevistas.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- Todas las rutas de datos del cliente se resuelven contra `DATA_ROOT` y las de la skill contra `PROJECT_ROOT` (ver el router). Los references están en `.agents/skills/coderhub-workbook/references/`.
- **Unattended runs** (`modes/_shared.md` → **Unattended runs**): no arranques. El workbook es conversación. Terminá con `needs_confirmation: interactive_only workbook - run /coderhub leccion X-Y in a chat session`.

## Comandos

| Lo que escribe el cliente | Qué hacés |
|---|---|
| `/coderhub workbook` | **Progreso** (sección "Progreso") |
| `/coderhub leccion 3-2`, `/coderhub workbook 3-2`, "hagamos el ejercicio de la 3-2" | **Lección** (Steps 1-6) |
| `/coderhub leccion 3-4 listo` | **Cerrar una acción** que quedó pendiente (Step 6b) |
| `/coderhub workbook resumen` | **Resumen para el mentor** (sección "Resumen") |
| `/coderhub leccion` sin número | Sugerí la próxima lección (la primera pendiente del orden de abajo) y preguntá si arrancan |

El número es el de la lección en Skool: **módulo-lección** (`1-3` = módulo 1, lección 3). Aceptá también `1.3`, `M1L3` o el nombre ("la de banda salarial"). Las fichas de cada lección están en `references/modulo-{N}.md`.

## Los tres tipos de ejercicio

Cada pregunta de una ficha tiene un tipo. **El tipo decide cuánto hace la IA:**

| Tipo | Qué es | Qué hacés vos |
|---|---|---|
| **A · Datos** | Hechos sobre la carrera del cliente: habilidades, logros, banda salarial, rol objetivo, historias | **Prellenás** desde lo que ya existe y el cliente confirma o corrige. Preguntás solo lo que no podés deducir |
| **B · Reflexión** | Lo que vale porque lo escribe la persona: FODA, creencias, carta, diferencial, motivaciones | **No lo escribís vos.** Preguntás, repreguntás y, recién después de que el cliente escribió, sugerís cómo ajustarlo. Si te pide que lo escribas, explicale en una línea por qué conviene que lo haga él y ofrecé un arranque de frase, no el texto |
| **C · Acción** | Se hace afuera: mandar mensajes, grabarse, practicar, auditar un perfil | **Preparás todo** (mensajes, búsquedas, guion, comando a correr) y dejás una checklist. La lección queda en `accion-pendiente` hasta que el cliente vuelve con `listo` |

## Step 1 — Ficha y contexto

1. Leé la ficha de la lección en `references/modulo-{N}.md`. Si la lección no tiene ejercicio (ej. las introducciones), decilo en una línea y ofrecé lo que dice la ficha (un comando o la lección siguiente).
2. Leé `references/destinos.md` (cómo se escribe en cada archivo) y `references/workbook-formato.md` (el formato de `data/workbook.md`).
3. Leé las **fuentes** que lista la ficha, si existen: `cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`, `interview-prep/story-bank.md`, `data/contacts.tsv`, los reportes en `reports/`, y **las respuestas anteriores** en `data/workbook.md`.
4. Si `data/workbook.md` no existe, crealo desde `references/workbook-formato.md` (sin preguntar: es el cuaderno del cliente).

Si la lección ya está `hecha`, mostrá lo que respondió (resumido) y preguntá: *"Ya la hiciste el {fecha}. La revisamos y actualizamos, o pasamos a la próxima?"*

## Step 2 — Prellenar (tipo A)

Armá un borrador con lo que ya sabés y mostralo **en una sola tabla**: pregunta · lo que encontré · de dónde salió. Ejemplo:

| Pregunta | Lo que encontré | Fuente |
|---|---|---|
| Habilidades técnicas que dominás | Java, Spring Boot, AWS (EC2, Lambda), SQL | `cv.md` |
| Áreas a mejorar | System design, inglés oral | lección 1-2 |
| … | *(no lo sé, te pregunto)* | — |

*"Esto ya lo sé de vos. Confirmás, corregís algo, o lo completamos?"*

- **Nunca inventes.** Lo que no está en una fuente queda como *(no lo sé, te pregunto)*.
- **Números:** solo los que están en `cv.md`, `article-digest.md` o que el cliente te dice ahora. Un número que deducís vos no entra.
- Las preguntas que faltan se hacen **de a una**.

## Step 3 — Preguntar y repreguntar (tipos B y C, y lo que faltó de A)

- **De a una pregunta.** Esperá la respuesta antes de la siguiente.
- Aplicá la **regla de calidad** de la ficha. Si la respuesta no la cumple, repreguntá una vez con algo concreto: *"Ese logro no tiene resultado. Qué cambió después: tiempo, plata, errores, usuarios?"* Si el cliente no tiene el dato, se acepta sin número y se anota así (no se inventa uno).
- Si el cliente se traba más de dos repreguntas en lo mismo, dejalo seguir: *"Anotá lo primero que te salga y seguimos. Lo pulimos después."* (el workbook no es un examen).
- **Tipo C:** prepará lo que diga la ficha (los mensajes, las búsquedas, el comando) y cerrá con la checklist. Si la ficha dice que lo hace otro comando de CoderHub (`linkedin`, `pdf`, `readme-github`, `interview/practice`…), ofrecé correrlo ahora.

## Step 4 — Guardar en el cuaderno

Escribí la lección en `data/workbook.md` con el formato de `references/workbook-formato.md`:

- Las respuestas **con las palabras del cliente** (no las reescribas). Lo que confirmó de tu borrador va como lo confirmó.
- El marcador de estado: `hecha`, `accion-pendiente` (tipo C esperando que lo haga) o `en-curso` (si cortaron a la mitad).
- Actualizá la tabla de progreso de arriba.

El cuaderno se guarda siempre, sin pedir OK: es el registro de lo que el cliente dijo.

## Step 5 — Llevar los datos a CoderHub OS (con OK)

Si la ficha tiene **destinos**, armá la propuesta en una tabla y esperá el OK. Nada de esto se escribe sin confirmación:

| # | Archivo | Cambio | Valor |
|---|---|---|---|
| 1 | `config/profile.yml` | `compensation.minimum` (vacío → nuevo) | `"USD 2.500"` |
| 2 | `config/profile.yml` | `compensation.target_range` (antes: `"USD 3K"`) | `"USD 3.200-4.000"` |
| 3 | `interview-prep/story-bank.md` | historia nueva | `[Debugging] Migración que rompió prod` |

*"Aplico los 3, elegís cuáles, o ninguno?"*

- Seguí **al pie de la letra** el formato de cada archivo en `references/destinos.md`. Los lectores de esos archivos (scripts y modos) dependen de ese formato.
- **Nunca pises** un valor que ya existe sin mostrar el antes y el después.
- Si un archivo de destino no existe todavía (`cv.md`, `config/profile.yml`), no lo inventes desde el workbook: decí que se crea con `/coderhub interview` (o `/coderhub intake` si tiene documentos) y dejá el dato solo en el cuaderno por ahora.
- Las respuestas de tipo B no van a ningún archivo del producto, salvo lo que la ficha diga explícitamente (ej. la carta de la 2-2 a `writing-samples/` como muestra de voz, y solo si el cliente quiere).

## Step 6 — Cerrar

1. **Qué habilitó:** una línea con lo que ahora funciona mejor, según la ficha. *"Con tu banda cargada, cada oferta se puntúa contra tu rango. Probalo pegando una JD."*
2. **Próximo paso:** la próxima lección pendiente en el orden de abajo, o el comando que la ficha sugiere.

### Step 6b — Cerrar una acción pendiente

Con `/coderhub leccion X-Y listo`: preguntá cómo le fue con lo que dice la checklist (a quién le escribió, qué respondieron, qué notó al verse grabado). Anotalo en la lección, pasala a `hecha` y, si la ficha lo pide, proponé los destinos (Step 5), por ejemplo los contactos a `data/contacts.tsv`.

## Progreso

Con `/coderhub workbook`:

1. Si no existe `data/workbook.md`: *"Todavía no arrancaste el workbook. Cada lección de Skool termina con un ejercicio: lo hacés acá con `/coderhub leccion 1-1`, y lo que respondas lo uso para tus CVs y tus entrevistas."* y ofrecé arrancar.
2. Si existe: mostrá la tabla de progreso por módulo (hechas / pendientes / acciones pendientes), la **próxima lección sugerida** y, si hay, **qué funciones están frenadas** por ejercicios que faltan. Ejemplo: *"Sin la 1-3 no tengo tu banda salarial: las ofertas se puntúan sin tu rango."*

**Orden sugerido.** El de Skool (1-1 → 8-4), con una excepción: si el cliente ya está aplicando o tiene entrevistas, priorizá 1-3, 1-4, 6-2, 7-1 y 7-2 (son las que más mejoran las ofertas, los CVs y la preparación de entrevistas).

## Resumen para el mentor

Con `/coderhub workbook resumen`: armá un resumen corto en `output/workbook/{YYYY-MM-DD}_resumen.md` para que el cliente se lo mande a su mentor antes de una 1:1. Los datos del cliente no se suben a GitHub (están en `.gitignore`), así que el mentor solo ve lo que el cliente le comparte.

- Progreso (qué lecciones hizo y cuáles faltan).
- Lo clave de cada lección hecha, en 1-2 líneas (rol objetivo, banda, logros principales, historias que tiene).
- **Dónde se trabó:** respuestas que quedaron flojas o sin número, acciones pendientes.
- Las respuestas de tipo B van **solo si el cliente quiere** (preguntá antes: son personales).

Mostrá la ruta y ofrecé copiarlo al portapapeles.

## Reglas

- **Nunca inventes** datos, números, empresas ni logros. Lo que no está en una fuente o no lo dijo el cliente, no existe.
- **Tipo B lo escribe el cliente.** La IA pregunta y da feedback, no redacta la reflexión.
- **Nada se escribe en los archivos del producto sin OK** (Step 5). El cuaderno sí se guarda siempre.
- **No reemplaces a los otros comandos.** Si la lección se resuelve con `/coderhub linkedin`, `pdf`, `readme-github`, `portafolio`, `cover`, `contacto`, `interview/practice` o `interview/debrief`, ofrecé correrlo: no repliques su trabajo acá.
- **Un ejercicio por vez.** Si el cliente quiere hacer varias lecciones seguidas, cerrá cada una (Steps 4-6) antes de abrir la siguiente.
