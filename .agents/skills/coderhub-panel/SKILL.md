---
name: coderhub-panel
description: >-
  CoderHub OS: instala (la primera vez) y abre el panel web local, para ver el
  tracker, los reportes y el CV en el navegador. Se invoca como `/coderhub
  panel` (o "abrime el panel", "quiero ver mi búsqueda en el navegador"). Corre
  solo en la máquina del cliente, en `127.0.0.1`, sin cuenta ni nube. No
  cambia datos: solo levanta el servidor.
---

# CoderHub — Panel web

Levanta el panel web local de CoderHub OS: el tracker, los reportes y el CV en el navegador, sobre los mismos archivos que usa el chat. Es **alpha y está en inglés**: avisáselo al cliente una vez, al abrirlo.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`).
- No cambia datos ni configuración: instala dependencias dentro de `web/` y levanta un servidor.

## Qué ve el cliente en el panel

Solo lo que pregunte: Hoy (qué hacer, por score), Pipeline (tracker con filtros, comparar ofertas), cada reporte (veredicto, keywords, prep de entrevista, cover letter, CV a medida), Explorar y Portales, Apply (pre-llena el formulario y **nunca lo envía**), CV y Documentos, Analytics y Follow-ups. Para evaluar, armar CVs o usar su asistente, el panel usa el CLI del cliente y **gasta tokens** igual que el chat.

## Paso 1 — Chequeos

1. `node --version`. Hace falta **22.6 o más nuevo**. Si es menor: *"El panel necesita Node 22.6 o más nuevo y tenés {versión}. Actualizalo desde nodejs.org y volvemos."* y pará.
2. Existe `web/package.json`. Si no: *"Tu instalación no trae el panel todavía. Corré `/coderhub update` y volvemos."* y pará.

## Paso 2 — Instalar (solo si falta)

Si no existe `web/node_modules/next`, avisá: *"Primera vez: instalo las dependencias del panel, tarda un minuto."* y corré:

```bash
npm --prefix web ci
```

Si falla, mostrale el error tal cual y pará. No borres `web/node_modules` ni `web/package-lock.json` para reintentar.

## Paso 3 — Abrir

`npm run ui` es un servidor que no termina. Lanzalo **en segundo plano** con el mecanismo de tu CLI para procesos largos (no con una espera que bloquee la charla):

```bash
npm run ui
```

Abre el navegador solo en `http://127.0.0.1:3000`. Si el CLI no puede dejar procesos en segundo plano, decile al cliente que lo corra en otra terminal.

- Puerto ocupado: `npm run ui -- --port=3030`.
- Sin abrir el navegador: `npm run ui -- --no-open`.

Cuando levante, decile en una línea: la URL, que está en inglés y es alpha, y que se corta con `Ctrl+C` en esa terminal.

## Reglas

1. **Solo en la máquina del cliente.** No uses `--host` ni definas `CAREER_OPS_WEB_ALLOWED_HOSTS`, salvo que el cliente lo pida explícitamente y entienda que el panel no tiene login.
2. **No levantes un segundo servidor** si ya hay uno andando: si el puerto está ocupado por el panel, decile que ya está abierto en esa URL.
3. **Si el panel falla** (pantalla de error, no carga), no lo arregles tocando `web/`: mostrale el error al cliente y seguí con el chat, que hace lo mismo.
4. El panel no reemplaza nada del chat. Si el cliente prefiere seguir en el chat, está bien.
