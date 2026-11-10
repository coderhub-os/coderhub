# Formato de `data/workbook.md`

El cuaderno del cliente: lo que respondió en cada lección, con sus palabras. Vive en `DATA_ROOT/data/` (datos del cliente: el updater no lo toca y no se sube a GitHub). Es markdown legible: el cliente lo puede abrir y editar a mano.

## Al crearlo

```markdown
# Mi workbook de CoderHub

Lo que respondiste en cada lección. Lo arma `/coderhub leccion X-Y` y lo podés editar a mano.
Lo que confirmaste también quedó en tu perfil de CoderHub OS (CV, ofertas, entrevistas).

## Progreso

| Módulo | Hechas | Pendientes |
|---|---|---|
| 1. A qué rol apuntar | 0/4 | 1-1, 1-2, 1-3, 1-4 |
| 2. Mentalidad inquebrantable | 0/4 | 2-1, 2-2, 2-3, 2-4 |
| 3. LinkedIn Masterclass | 0/4 | 3-1, 3-2, 3-3, 3-4 |
| 4. CV que pasa filtros | 0/3 | 4-1, 4-3, 4-5 |
| 5. Portfolio técnico | 0/3 | 5-1, 5-2, 5-3 |
| 6. Prospección y networking | 0/4 | 6-1, 6-2, 6-3, 6-4 |
| 7. Entrevista conductual | 0/4 | 7-1, 7-2, 7-3, 7-4 |
| 8. Entrevista técnica | 0/4 | 8-1, 8-2, 8-3, 8-4 |

Acciones pendientes: ninguna.
```

Solo las lecciones **con ejercicio** cuentan en el progreso (las 30 de la tabla).

## Cada lección

Una sección `##` por lección, en orden de número (insertala en su lugar, no al final):

```markdown
## 1-3 · Seniority, modo de trabajo y salario
<!-- workbook:1-3 estado:hecha fecha:2026-11-06 -->

**Sueldo actual:** USD 1.800/mes
**Banda:** mínimo USD 2.500 · justo USD 3.200 · aspiracional USD 4.000 (mensual)
**Dónde:** startup o corpo técnica. "Quiero aprender rápido y en una corpo me aburro."
**Beneficios:** remoto, cursos, horario flexible

**Llevado a CoderHub OS:** `config/profile.yml` (compensation.minimum, compensation.target_range), `modes/_profile.md` (Company preferences)
```

- El marcador `<!-- workbook:X-Y estado:… fecha:YYYY-MM-DD -->` va siempre en la línea siguiente al título. Estados: `en-curso`, `accion-pendiente`, `hecha`.
- Las respuestas, con las palabras del cliente. Tablas cuando el ejercicio es una tabla (FODA, logros, hábitos).
- `**Llevado a CoderHub OS:**` lista lo que se aplicó en el Step 5. Si no aplicó nada: `nada (quedó solo acá)`.
- En `accion-pendiente`, agregá `**Checklist:**` con lo que falta hacer afuera.
- Si el cliente rehace una lección, reemplazá la sección y actualizá la fecha.

Al guardar, recalculá la tabla de progreso y la línea de acciones pendientes a partir de los marcadores.
