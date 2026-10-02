#!/usr/bin/env node
// build.mjs — CoderHub OS portafolio web (sitio estático, CV online).
//
// Lee cv.md, config/profile.yml y config/portafolio.yml del PROJECT_ROOT y
// escribe un sitio estático: una página por idioma (el primero en la raíz,
// los demás en /{lang}/), claro/oscuro, SEO completo (OG con Playwright,
// JSON-LD, sitemap, robots, llms.txt, 404) y la copia del PDF del CV base.
// Antes de escribir nada corre la revisión de privacidad: si se filtra un dato
// privado (compensación, visa, teléfono, empresas del tracker...), falla.
//
// Uso:
//   node .agents/skills/coderhub-portafolio/build.mjs [--root=<PROJECT_ROOT>]
//     [--out=output/portafolio] [--theme=<tema>] [--mode=light|dark]
//     [--dump-content] [--no-og]
//
//   --root          default: sube desde el cwd hasta la carpeta con AGENTS.md y modes/
//   --out           default: <root>/output/portafolio (relativo al cwd si se pasa)
//   --theme         pisa `tema` de portafolio.yml
//   --mode          fija el modo inicial (solo para capturas)
//   --dump-content  imprime el JSON del contenido EN (para coderhub-traducir) y sale
//   --no-og         no renderiza la imagen OG (build rápido, sin og:image)
//
// Imprime al final un JSON resumen: páginas, archivos, logos que cayeron a
// chip, warnings y `publico` (todo dato personal que quedó publicado).

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHARED = join(HERE, 'shared');
const THEMES = ['minimalista', 'glassmorphism', 'neobrutalism', 'terminal'];
const LANGS = ['es', 'en'];
const CONTACTS = ['email', 'linkedin', 'github', 'twitter', 'telefono', 'ubicacion'];
const MODES = ['auto', 'light', 'dark'];
const HOSTINGS = ['github-pages', 'vercel'];
const OG = { width: 1200, height: 630 };
const PHOTO_PX = 600;
const FETCH_TIMEOUT_MS = 8000;
const MODE_KEY = 'portafolio-mode';

// ── utilidades ────────────────────────────────────────────────────────────

function die(msg) {
  console.error(`coderhub-portafolio: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/);
    if (!m) die(`argumento desconocido: ${a}`);
    args[m[1]] = m[2] === undefined ? true : m[2];
  }
  const known = ['root', 'out', 'theme', 'mode', 'dump-content', 'no-og'];
  for (const k of Object.keys(args)) if (!known.includes(k)) die(`opción desconocida: --${k}`);
  return args;
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const str = (v) => (typeof v === 'string' ? v.trim() : v === null || v === undefined ? '' : String(v).trim());

const slugify = (s) =>
  str(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const initialsOf = (name) => {
  const parts = str(name).split(/\s+/).filter(Boolean);
  const pick = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return pick.map((p) => p[0]).join('').toUpperCase();
};

const isHttps = (u) => {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
};

/** Inline markdown → HTML: **negrita**, *itálica*, `code`, [texto](https://url). */
function inline(md) {
  let s = esc(md);
  s = s.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (m, t, u) => `<a href="${u}" rel="noopener">${t}</a>`);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

/** Inline markdown → texto plano (meta description, llms.txt, JSON-LD). */
const plain = (md) =>
  str(md)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const paragraphs = (md) => str(md).split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);

const truncate = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);

function fill(template, values, where) {
  const out = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, key) => (key in values ? values[key] : m));
  const left = out.match(/\{\{[A-Z0-9_]+\}\}/);
  if (left) die(`${where}: slot sin resolver ${left[0]}`);
  return out;
}

// ── fechas ────────────────────────────────────────────────────────────────

const MONTH_RX = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|abr|ago|dic)[a-záéíóú]*\\.?';
const NOW_RX = '(?:present|current|now|today|actualidad|presente|hoy|la fecha)';
const POINT_RX = `(?:(?:${MONTH_RX}\\s+)?(?:\\d{1,2}/)?(?:19|20)\\d{2}|${NOW_RX})`;
const RANGE_RX = `${POINT_RX}(?:\\s*(?:-|–|—|to|a|al|hasta)\\s*${POINT_RX})?`;
const RANGE_FULL = new RegExp(`^\\(?${RANGE_RX}\\)?$`, 'i');
const RANGE_LEAD = new RegExp(`^(${RANGE_RX})\\s*[.,;:]?\\s*(.*)$`, 'i');
const RANGE_TAIL = new RegExp(`^(.*?)[\\s,]*\\((${RANGE_RX})\\)$`, 'i');
const isDates = (s) => RANGE_FULL.test(str(s));

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};
const MONTH_KEYS = [['jan', 'ene'], ['feb'], ['mar'], ['apr', 'abr'], ['may'], ['jun'], ['jul'], ['aug', 'ago'], ['sep'], ['oct'], ['nov'], ['dec', 'dic']];

function localizeDates(s, lang, nowWord) {
  return str(s)
    .replace(new RegExp(`\\b${MONTH_RX}`, 'gi'), (m) => {
      const k = m.toLowerCase().slice(0, 3);
      const i = MONTH_KEYS.findIndex((keys) => keys.includes(k));
      return i === -1 ? m : MONTHS[lang][i];
    })
    .replace(new RegExp(`\\b${NOW_RX}\\b`, 'gi'), nowWord)
    .replace(/\s*(?:-|–|—|\bto\b|\bhasta\b)\s*/g, ' – ');
}

// ── parser de cv.md ───────────────────────────────────────────────────────

const STRONG_SEP = /\s+(?:—|–|--|\|)\s+/;
const splitParts = (s) => {
  const t = str(s);
  if (STRONG_SEP.test(t)) return t.split(STRONG_SEP).map(str).filter(Boolean);
  return t.split(/\s+-\s+(?=\S)/).reduce((acc, p) => {
    // " - " también separa rangos de fechas: no partir "Oct 2019 - Present".
    const prev = acc[acc.length - 1];
    if (prev !== undefined && isDates(`${prev} - ${p}`)) acc[acc.length - 1] = `${prev} - ${p}`;
    else acc.push(p);
    return acc;
  }, []).map(str).filter(Boolean);
};

const stripMd = (s) => plain(s).replace(/^[*_]+|[*_]+$/g, '').trim();

function classifySection(title) {
  const t = title.toLowerCase();
  if (/experience|experiencia|employment|trayectoria/.test(t)) return 'experience';
  if (/education|educaci[oó]n|formaci[oó]n|estudios/.test(t)) return 'education';
  if (/certific/.test(t)) return 'certifications';
  if (/^(technical\s+)?skills|habilidades|tecnolog/.test(t) || /\bskills\b/.test(t)) return 'skills';
  if (/summary|resumen|about|perfil|profile/.test(t)) return 'summary';
  return 'other';
}

function parseRoleLine(line) {
  // **Rol** — fechas | **Rol** (nota) | **Rol**, fechas
  const m = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  const title = stripMd(m ? m[1] : line.replace(/^#+\s*/, ''));
  let rest = m ? m[2] : '';
  if (!m) {
    const parts = splitParts(title);
    if (parts.length > 1) return { rol: parts[0], ...classifyParts(parts.slice(1)) };
    return { rol: title, fechas: '', contexto: '' };
  }
  rest = str(rest).replace(/^(?:—|–|--|-|\||,|·)\s*/, '');
  const note = rest.match(/^\((.*)\)\s*(.*)$/);
  if (note) {
    const tail = classifyParts(splitParts(note[2]));
    return { rol: title, fechas: tail.fechas, contexto: [note[1], tail.contexto].filter(Boolean).join(' · ') };
  }
  return { rol: title, ...classifyParts(splitParts(rest)) };
}

function classifyParts(parts) {
  const fechas = parts.filter(isDates);
  const otros = parts.filter((p) => !isDates(p)).map(stripMd);
  return { fechas: fechas[0] || '', contexto: otros.join(' · ') };
}

export function parseCv(md) {
  const sections = {};
  let current = null;
  for (const raw of md.replace(/\r\n/g, '\n').split('\n')) {
    const h2 = raw.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h2 && !raw.startsWith('###')) {
      current = classifySection(h2[1]);
      sections[current] = sections[current] || [];
      continue;
    }
    if (current) sections[current].push(raw);
  }
  return {
    summary: paragraphs((sections.summary || []).join('\n')).join('\n\n'),
    experience: parseExperience(sections.experience || []),
    education: parseEducation(sections.education || []),
    certifications: (sections.certifications || [])
      .map((l) => l.replace(/^\s*[-*]\s+/, ''))
      .map(stripMd)
      .filter(Boolean),
    skills: parseSkills(sections.skills || []),
  };
}

function parseExperience(lines) {
  const companies = [];
  let co = null;
  let role = null;
  const ensureCompany = () => {
    if (!co) {
      co = { empresa: '', fechas: '', lugar: '', roles: [] };
      companies.push(co);
    }
    return co;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^###\s+/.test(line) && !/^####/.test(line)) {
      const parts = splitParts(stripMd(line.replace(/^###\s+/, '')));
      const rest = classifyParts(parts.slice(1));
      co = { empresa: parts[0] || '', fechas: rest.fechas, lugar: rest.contexto, roles: [] };
      companies.push(co);
      role = null;
      continue;
    }
    if (/^####\s+/.test(line) || /^\*\*[^*]+\*\*/.test(line)) {
      role = { ...parseRoleLine(line.replace(/^####\s+/, '')), bullets: [] };
      ensureCompany().roles.push(role);
      continue;
    }
    const bullet = raw.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      if (!role) {
        role = { rol: '', fechas: '', contexto: '', bullets: [] };
        ensureCompany().roles.push(role);
      }
      role.bullets.push(str(bullet[1]));
      continue;
    }
    const text = stripMd(line);
    if (isDates(text)) {
      if (role && !role.fechas) role.fechas = text;
      else if (co && !co.fechas) co.fechas = text;
      continue;
    }
    // Líneas sueltas: ubicación / contexto. Se parsean pero no se publican.
    if (role) role.contexto = [role.contexto, text].filter(Boolean).join(' · ');
    else if (co) co.lugar = [co.lugar, text].filter(Boolean).join(' · ');
  }
  return companies.filter((c) => c.empresa || c.roles.length);
}

function parseEducation(lines) {
  const items = [];
  let cur = null;
  const fromText = (text) => {
    let t = stripMd(text);
    let fechas = '';
    const tail = t.match(RANGE_TAIL);
    if (tail) {
      t = str(tail[1]);
      fechas = tail[2];
    }
    const parts = splitParts(t);
    let titulo = parts[0] || '';
    let institucion = '';
    const rest = classifyParts(parts.slice(1));
    if (rest.fechas) fechas = fechas || rest.fechas;
    if (rest.contexto) institucion = rest.contexto;
    else if (parts.length === 1 && titulo.includes(', ')) {
      const i = titulo.indexOf(', ');
      institucion = titulo.slice(i + 2);
      titulo = titulo.slice(0, i);
    }
    return { titulo, institucion, fechas, detalle: '' };
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^###\s+/.test(line)) {
      const parts = splitParts(stripMd(line.replace(/^###\s+/, '')));
      const rest = classifyParts(parts.slice(1));
      cur = { titulo: '', institucion: parts[0] || '', fechas: rest.fechas, detalle: rest.contexto, fromHeading: true };
      items.push(cur);
      continue;
    }
    if (/^\*\*[^*]+\*\*/.test(line)) {
      const m = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      const rest = classifyParts(splitParts(str(m[2]).replace(/^(?:—|–|--|-|\||,)\s*/, '')));
      if (cur && cur.fromHeading && !cur.titulo) {
        cur.titulo = stripMd(m[1]);
        cur.fechas = cur.fechas || rest.fechas;
        if (rest.contexto) cur.detalle = [cur.detalle, rest.contexto].filter(Boolean).join(' · ');
      } else {
        cur = { titulo: stripMd(m[1]), institucion: rest.contexto, fechas: rest.fechas, detalle: '', fromHeading: true };
        items.push(cur);
      }
      continue;
    }
    const bullet = raw.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      if (cur && cur.fromHeading) cur.detalle = [cur.detalle, stripMd(bullet[1])].filter(Boolean).join(' ');
      else {
        cur = fromText(bullet[1]);
        items.push(cur);
      }
      continue;
    }
    const text = stripMd(line);
    const lead = text.match(RANGE_LEAD);
    if (cur && lead && lead[1]) {
      cur.fechas = cur.fechas || lead[1];
      if (lead[2]) cur.detalle = [cur.detalle, lead[2]].filter(Boolean).join(' ');
    } else if (cur) {
      cur.detalle = [cur.detalle, text].filter(Boolean).join(' ');
    } else {
      cur = fromText(text);
      items.push(cur);
    }
  }
  return items.map(({ fromHeading, ...e }) => e).filter((e) => e.titulo || e.institucion);
}

function parseSkills(lines) {
  const groups = [];
  for (const raw of lines) {
    const line = raw.trim().replace(/^[-*•]\s+/, '');
    if (!line) continue;
    const m = line.match(/^\*\*(.+?)\*\*:?\s*:?\s*(.*)$/) || line.match(/^([^:]{1,40}):\s+(.+)$/);
    if (m) groups.push({ grupo: stripMd(m[1]).replace(/:$/, ''), items: stripMd(m[2]) });
    else groups.push({ grupo: '', items: stripMd(line) });
  }
  return groups.filter((g) => g.items);
}

// ── carga y validación ────────────────────────────────────────────────────

function findRoot(start) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, 'AGENTS.md')) && existsSync(join(dir, 'modes'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function loadYaml(path, label) {
  try {
    return yaml.load(readFileSync(path, 'utf8')) || {};
  } catch (err) {
    die(`no pude leer ${label}: ${err.message.split('\n')[0]}`);
  }
}

const normUrl = (v, host) => {
  let s = str(v);
  if (!s) return '';
  if (host === 'x.com' && /^@?[A-Za-z0-9_]{1,15}$/.test(s)) return `https://x.com/${s.replace(/^@/, '')}`;
  s = s.replace(/^http:\/\//i, 'https://');
  if (!/^https:\/\//i.test(s)) s = `https://${s.replace(/^\/+/, '')}`;
  return s.replace(/\/+$/, '');
};
const displayUrl = (u) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

function ghUserOf(github) {
  const s = str(github);
  const m = s.match(/github\.com\/([A-Za-z0-9-]+)/i);
  if (m) return m[1];
  return /^[A-Za-z0-9-]+$/.test(s) ? s : '';
}

function validate(cfg, profile, root, themeOverride, errors, warnings) {
  const c = profile.candidate || {};
  if (!str(c.full_name)) errors.push('config/profile.yml: falta candidate.full_name');

  const idiomas = cfg.idiomas;
  if (!Array.isArray(idiomas) || idiomas.length === 0) errors.push('portafolio.yml: `idiomas` tiene que ser una lista, ej. [en, es]');
  else {
    for (const l of idiomas) if (!LANGS.includes(l)) errors.push(`portafolio.yml: idioma "${l}" no soportado (valores: ${LANGS.join(', ')})`);
    if (new Set(idiomas).size !== idiomas.length) errors.push('portafolio.yml: `idiomas` tiene repetidos');
  }
  const tema = themeOverride || cfg.tema;
  if (!THEMES.includes(tema)) errors.push(`portafolio.yml: tema "${tema ?? ''}" no válido (valores: ${THEMES.join(', ')})`);
  else if (!existsSync(join(HERE, 'themes', tema, 'index.html.tpl'))) errors.push(`el tema "${tema}" todavía no está disponible en esta versión`);
  if (cfg.acento !== undefined && cfg.acento !== null && !/^#[0-9a-f]{6}$/i.test(str(cfg.acento)))
    errors.push(`portafolio.yml: acento "${cfg.acento}" no es un hex #RRGGBB`);
  if (cfg.modo_inicial !== undefined && cfg.modo_inicial !== null && !MODES.includes(cfg.modo_inicial))
    errors.push(`portafolio.yml: modo_inicial "${cfg.modo_inicial}" no válido (valores: ${MODES.join(', ')})`);
  const hosting = cfg.hosting ?? 'github-pages';
  if (!HOSTINGS.includes(hosting)) errors.push(`portafolio.yml: hosting "${hosting}" no válido (valores: ${HOSTINGS.join(', ')})`);
  if (cfg.repo && !/^[A-Za-z0-9._-]+$/.test(str(cfg.repo))) errors.push(`portafolio.yml: repo "${cfg.repo}" no es un nombre de repo válido`);
  if (cfg.dominio && !/^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(str(cfg.dominio)))
    errors.push(`portafolio.yml: dominio "${cfg.dominio}" no es válido (sin https:// ni barras, ej. midominio.dev)`);
  if (cfg.url && !isHttps(str(cfg.url))) errors.push(`portafolio.yml: url "${cfg.url}" tiene que ser una URL https://`);
  const ghuser = ghUserOf(c.github);
  if (!cfg.url && !cfg.dominio) {
    if (hosting === 'github-pages' && !ghuser) errors.push('no puedo armar la URL del sitio: falta candidate.github en profile.yml (o poné `url:` / `dominio:` en portafolio.yml)');
    if (hosting === 'vercel' && !cfg.repo) errors.push('con hosting vercel, `repo:` es obligatorio (la URL queda https://{repo}.vercel.app/)');
  }

  if (cfg.foto) {
    const p = resolve(root, str(cfg.foto));
    if (!existsSync(p)) errors.push(`portafolio.yml: foto "${cfg.foto}" no existe`);
    else if (!/\.(jpe?g|png|webp)$/i.test(p)) errors.push(`portafolio.yml: foto "${cfg.foto}" tiene que ser .jpg, .png o .webp`);
  }
  if (cfg.sobre_mi !== undefined && cfg.sobre_mi !== null && typeof cfg.sobre_mi !== 'string') errors.push('portafolio.yml: `sobre_mi` tiene que ser texto');

  const proyectos = cfg.proyectos ?? [];
  if (!Array.isArray(proyectos)) errors.push('portafolio.yml: `proyectos` tiene que ser una lista');
  else
    proyectos.forEach((p, i) => {
      const where = `portafolio.yml: proyectos[${i}]`;
      if (!p || typeof p !== 'object') return errors.push(`${where} tiene que ser un objeto {nombre, descripcion, stack, links}`);
      if (!str(p.nombre)) errors.push(`${where}: falta nombre`);
      if (!str(p.descripcion)) errors.push(`${where}: falta descripcion`);
      if (p.stack !== undefined && p.stack !== null && !Array.isArray(p.stack)) errors.push(`${where}: stack tiene que ser una lista`);
      for (const [k, v] of Object.entries(p.links || {})) {
        if (!['repo', 'demo'].includes(k)) errors.push(`${where}: link "${k}" desconocido (valores: repo, demo)`);
        else if (v && !isHttps(str(v))) errors.push(`${where}: links.${k} "${v}" tiene que ser una URL https:// (http:// es contenido mixto)`);
      }
    });

  const stack = cfg.stack ?? [];
  if (!Array.isArray(stack)) errors.push('portafolio.yml: `stack` tiene que ser una lista de {name, slug}');
  else
    stack.forEach((s, i) => {
      const name = typeof s === 'string' ? s : s?.name;
      const slug = typeof s === 'string' ? '' : s?.slug;
      if (!str(name)) errors.push(`portafolio.yml: stack[${i}]: falta name`);
      if (slug && !/^[a-z0-9.+-]+$/.test(str(slug))) errors.push(`portafolio.yml: stack[${i}]: slug "${slug}" no es un slug de Simple Icons válido (minúsculas, sin espacios; "" = chip de texto)`);
    });

  const max = cfg.experiencia?.max_bullets;
  if (max !== undefined && max !== null && !(Number.isInteger(max) && max >= 0 && max <= 20))
    errors.push('portafolio.yml: experiencia.max_bullets tiene que ser un entero entre 0 y 20');

  const recs = cfg.secciones?.recomendaciones ?? [];
  if (!Array.isArray(recs)) errors.push('portafolio.yml: secciones.recomendaciones tiene que ser una lista');
  else
    recs.forEach((r, i) => {
      if (!str(r?.autor) || !str(r?.texto)) errors.push(`portafolio.yml: secciones.recomendaciones[${i}]: faltan autor o texto`);
    });

  const contacto = cfg.contacto ?? ['email', 'linkedin', 'github'];
  if (!Array.isArray(contacto)) errors.push('portafolio.yml: `contacto` tiene que ser una lista');
  else
    for (const k of contacto) {
      if (!CONTACTS.includes(k)) errors.push(`portafolio.yml: contacto "${k}" desconocido (valores: ${CONTACTS.join(', ')})`);
    }

  if (cfg.cv_pdf !== undefined && cfg.cv_pdf !== null) {
    if (typeof cfg.cv_pdf !== 'object' || Array.isArray(cfg.cv_pdf)) errors.push('portafolio.yml: cv_pdf tiene que ser { en: ruta.pdf, es: ruta.pdf } o null');
    else
      for (const [lang, rel] of Object.entries(cfg.cv_pdf)) {
        if (!LANGS.includes(lang)) errors.push(`portafolio.yml: cv_pdf.${lang}: idioma no soportado`);
        if (!rel) continue;
        const p = resolve(root, str(rel));
        if (!/\.pdf$/i.test(p)) errors.push(`portafolio.yml: cv_pdf.${lang} "${rel}" tiene que ser un .pdf`);
        else if (!existsSync(p)) errors.push(`portafolio.yml: cv_pdf.${lang} "${rel}" no existe`);
      }
  }
  return { tema, hosting, ghuser, contacto: Array.isArray(contacto) ? contacto : [] };
}

function baseUrlOf(cfg, hosting, ghuser) {
  if (cfg.url) return str(cfg.url).replace(/\/*$/, '/');
  if (cfg.dominio) return `https://${str(cfg.dominio).toLowerCase()}/`;
  const user = ghuser.toLowerCase();
  if (hosting === 'vercel') return `https://${str(cfg.repo).toLowerCase()}.vercel.app/`;
  const repo = str(cfg.repo) || `${user}.github.io`;
  return repo.toLowerCase() === `${user}.github.io` ? `https://${user}.github.io/` : `https://${user}.github.io/${repo}/`;
}

// ── contenido ─────────────────────────────────────────────────────────────

/** Contenido EN traducible (lo que imprime --dump-content). */
function englishContent(cfg, profile, cv, maxBullets) {
  const c = profile.candidate || {};
  const titular = str(cfg.titular) || str(c.title) || str(profile.narrative?.headline);
  const sobre = str(cfg.sobre_mi) || cv.summary;
  const experiencia = [];
  for (const co of cv.experience)
    for (const r of co.roles) experiencia.push({ empresa: co.empresa, rol: r.rol, bullets: r.bullets.slice(0, maxBullets) });
  const content = {
    titular,
    sobre_mi: sobre,
    proyectos: (cfg.proyectos || []).map((p) => ({ nombre: str(p.nombre), descripcion: str(p.descripcion) })),
    experiencia,
    educacion: cfg.secciones?.educacion === false ? [] : cv.education.map((e) => ({ titulo: e.titulo, institucion: e.institucion, detalle: e.detalle })),
    habilidades: cv.skills.map((g) => ({ grupo: g.grupo, items: g.items })),
  };
  const fuente = createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 12);
  return { content, fuente };
}

/** Aplica el bloque de traducción (por posición) sobre el contenido EN. */
function translated(en, block) {
  const pick = (arr, i, key, fallback) => {
    const v = Array.isArray(arr) ? arr[i] : undefined;
    if (v === undefined || v === null) return fallback;
    if (typeof v === 'string') return key === 'titulo' || key === 'descripcion' || key === 'rol' ? v : fallback;
    return v[key] !== undefined && v[key] !== null && v[key] !== '' ? v[key] : fallback;
  };
  return {
    titular: str(block.titular) || en.titular,
    sobre_mi: str(block.sobre_mi) || en.sobre_mi,
    proyectos: en.proyectos.map((p, i) => ({ ...p, descripcion: str(pick(block.proyectos, i, 'descripcion', p.descripcion)) })),
    experiencia: en.experiencia.map((r, i) => {
      const b = pick(block.experiencia, i, 'bullets', r.bullets);
      return { ...r, rol: str(pick(block.experiencia, i, 'rol', r.rol)), bullets: Array.isArray(b) ? b.map(str) : r.bullets };
    }),
    educacion: en.educacion.map((e, i) => ({
      ...e,
      titulo: str(pick(block.educacion, i, 'titulo', e.titulo)),
      detalle: str(pick(block.educacion, i, 'detalle', e.detalle)),
    })),
    habilidades: en.habilidades.map((g, i) => ({
      grupo: str(pick(block.habilidades, i, 'grupo', g.grupo)),
      items: str(pick(block.habilidades, i, 'items', g.items)),
    })),
  };
}

// ── logos e íconos ────────────────────────────────────────────────────────

async function fetchLogo(slug) {
  if (!/^[a-z0-9.+-]+$/.test(slug || '')) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://cdn.simpleicons.org/${slug}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const svg = (await res.text()).trim();
    if (!svg.startsWith('<svg') || /<script/i.test(svg)) return null;
    // Inline: sin xmlns, sin color de marca (toma currentColor) y sin <title>.
    return svg
      .replace(/\s(?:xmlns(?::\w+)?|fill|role|width|height)="[^"]*"/g, '')
      .replace(/<title>[\s\S]*?<\/title>/, '')
      .replace(/^<svg/, '<svg aria-hidden="true" focusable="false" fill="currentColor"');
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const ICONS = JSON.parse(readFileSync(join(SHARED, 'icons.json'), 'utf8'));
const icon = (name) => {
  const body = ICONS[name];
  if (!body) return '';
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
};

// ── color: acento con contraste AA ────────────────────────────────────────

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(hexToRgb(a)), lum(hexToRgb(b))].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
/** Mezcla el acento hacia negro o blanco hasta tener contraste ≥ target sobre bg. */
function inkFor(accent, bg, target = 4.6) {
  if (contrast(accent, bg) >= target) return accent;
  const toward = lum(hexToRgb(bg)) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  const a = hexToRgb(accent);
  for (let t = 0.02; t <= 1; t += 0.02) {
    const c = rgbToHex(a.map((v, i) => v + (toward[i] - v) * t));
    if (contrast(c, bg) >= target) return c;
  }
  return rgbToHex(toward);
}
const onAccent = (accent) => (contrast(accent, '#000000') >= contrast(accent, '#ffffff') ? '#000000' : '#ffffff');

function accentCss(accent, theme) {
  const light = inkFor(accent, theme.bg.light);
  const dark = inkFor(accent, theme.bg.dark);
  return `:root{--accent:${accent};--on-accent:${onAccent(accent)};--accent-ink:${light}}` +
    `:root[data-mode="dark"]{--accent-ink:${dark}}`;
}

// ── privacidad ────────────────────────────────────────────────────────────

const leaves = (v) => {
  if (v === null || v === undefined || typeof v === 'boolean') return [];
  if (Array.isArray(v)) return v.flatMap(leaves);
  if (typeof v === 'object') return Object.values(v).flatMap(leaves);
  return [String(v)];
};
const findKeyDeep = (obj, key) => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).flatMap(([k, v]) => (k === key ? [v] : findKeyDeep(v, key)));
};

function tableCompanies(md) {
  const out = [];
  let col = -1;
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) {
      col = -1;
      continue;
    }
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
    if (cells.every((x) => /^:?-+:?$/.test(x))) continue;
    const header = cells.findIndex((x) => /^(company|empresa)$/i.test(x));
    if (header !== -1) {
      col = header;
      continue;
    }
    if (col !== -1 && cells[col]) out.push(stripMd(cells[col]));
  }
  return out;
}

function pipelineCompanies(md) {
  const out = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^\s*-\s*\[[ xX]\]\s*(.*)$/);
    if (!m) continue;
    const cells = m[1].replace(/~~/g, '').split('|').map((x) => x.trim());
    const urlAt = cells.findIndex((x) => /^https?:\/\//.test(x));
    if (urlAt !== -1 && cells[urlAt + 1] && !/^#/.test(cells[urlAt + 1])) out.push(stripMd(cells[urlAt + 1]));
  }
  return out;
}

function reportNames(root) {
  const dir = join(root, 'reports');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const m = f.match(/^\d+-(.+?)-\d{4}-\d{2}-\d{2}(?:-RESERVED)?\.md$/);
      return { file: f.replace(/\.md$/, ''), slug: m ? m[1] : '' };
    });
}

const digitsRx = (phone) => {
  const d = str(phone).replace(/\D/g, '');
  if (d.length < 7) return null;
  return new RegExp(d.split('').join('[\\s().\\-]*'));
};

/** Arma la lista de patrones prohibidos para el sitio. */
function privacyRules({ profile, cfg, contacto, root, cvText, allowedText }) {
  const rules = [];
  const add = (label, value, opts = {}) => {
    const v = str(value);
    if (v.length < 4) return;
    if (opts.allowIfIn && opts.allowIfIn.toLowerCase().includes(v.toLowerCase())) return;
    rules.push({ label, test: (t) => t.toLowerCase().includes(v.toLowerCase()), value: v });
  };
  const c = profile.candidate || {};
  for (const v of leaves(profile.compensation)) add('compensation', v);
  add('location.visa_status', profile.location?.visa_status);
  for (const v of leaves(profile.location?.authorized_in)) add('location.authorized_in', v, { allowIfIn: allowedText });
  for (const v of leaves(c.alternate_emails)) add('candidate.alternate_emails', v);
  add('candidate.wechat', c.wechat);
  for (const v of findKeyDeep(profile, 'dashboard').flatMap(leaves)) add('dashboard', v);
  if (!contacto.includes('telefono') && str(c.phone)) {
    add('candidate.phone', c.phone);
    const rx = digitsRx(c.phone);
    if (rx) rules.push({ label: 'candidate.phone (dígitos)', test: (t) => rx.test(t), value: str(c.phone) });
  }
  if (!contacto.includes('email')) add('candidate.email', c.email);

  const cvLower = cvText.toLowerCase();
  const cvSlug = slugify(cvText);
  const companies = new Set();
  for (const rel of ['data/applications.md', 'applications.md']) {
    const p = join(root, rel);
    if (existsSync(p)) tableCompanies(readFileSync(p, 'utf8')).forEach((x) => companies.add(x));
  }
  const pipe = join(root, 'data', 'pipeline.md');
  if (existsSync(pipe)) pipelineCompanies(readFileSync(pipe, 'utf8')).forEach((x) => companies.add(x));
  for (const co of companies) {
    if (co.length < 3 || cvLower.includes(co.toLowerCase())) continue;
    const rx = new RegExp(`(^|[^\\p{L}\\p{N}])${co.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}($|[^\\p{L}\\p{N}])`, 'iu');
    rules.push({ label: 'empresa del tracker/pipeline', test: (t) => rx.test(t), value: co });
  }
  for (const r of reportNames(root)) {
    rules.push({ label: 'nombre de archivo de reports/', test: (t) => t.toLowerCase().includes(r.file.toLowerCase()), value: r.file });
    if (r.slug && r.slug.length >= 3 && !cvSlug.includes(r.slug)) {
      const rx = new RegExp(`(^|[^\\p{L}\\p{N}])${r.slug.split('-').join('[\\s_-]*')}($|[^\\p{L}\\p{N}])`, 'iu');
      rules.push({ label: 'empresa de reports/', test: (t) => rx.test(t), value: r.slug });
    }
  }
  // El nombre del motor upstream se arma en runtime: este archivo no lo puede contener (guard).
  const upstream = ['career', 'ops'].join('-');
  rules.push({ label: `"${upstream}"`, test: (t) => /career-?ops/i.test(t), value: upstream });
  rules.push({ label: '<form', test: (t) => /<form\b/i.test(t), value: '<form' });
  rules.push({ label: 'document.cookie', test: (t) => /document\.cookie/i.test(t), value: 'document.cookie' });
  rules.push({ label: '<script src= externo', test: (t) => /<script[^>]*\ssrc\s*=\s*["']?(https?:)?\/\//i.test(t), value: '<script src=' });
  rules.push({ label: 'recurso remoto (fuentes/CSS)', test: (t) => /@import\s+url\(\s*["']?(https?:)?\/\/|<link[^>]+rel=["']?stylesheet[^>]+href=["']?(https?:)?\/\//i.test(t), value: '@import/stylesheet remoto' });
  rules.push({
    label: 'http:// (contenido mixto)',
    test: (t) => /http:\/\//i.test(t.replace(/\bxmlns(:[\w-]+)?\s*=\s*["']http:\/\/[^"']*["']/gi, '')),
    value: 'http://',
  });
  return rules;
}

function checkPrivacy(files, rules) {
  const leaks = [];
  for (const [rel, f] of files) {
    if (f.binary) continue;
    for (const r of rules) if (r.test(f.data)) leaks.push(`${rel}: ${r.label} ("${r.value}")`);
  }
  return leaks;
}

// ── render (Playwright) ───────────────────────────────────────────────────

let browserP = null;
async function browser() {
  if (!browserP) {
    const { chromium } = await import('playwright');
    browserP = chromium.launch({ headless: true });
  }
  return browserP;
}

async function processPhoto(path) {
  const ext = extname(path).toLowerCase().replace('.', '').replace('jpg', 'jpeg');
  const dataUrl = `data:image/${ext};base64,${readFileSync(path).toString('base64')}`;
  const page = await (await browser()).newPage();
  try {
    const out = await page.evaluate(async ({ src, px }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const size = Math.min(px, side);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      // Recorte cuadrado centrado (un poco arriba del centro: suele estar la cara).
      const sx = (img.naturalWidth - side) / 2;
      const sy = Math.max(0, (img.naturalHeight - side) * 0.35);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      return canvas.toDataURL('image/jpeg', 0.86);
    }, { src: dataUrl, px: PHOTO_PX });
    return Buffer.from(out.split(',')[1], 'base64');
  } finally {
    await page.close();
  }
}

async function renderPng(html) {
  const ctx = await (await browser()).newContext({ viewport: OG, deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    return await page.screenshot({ clip: { x: 0, y: 0, ...OG }, type: 'png' });
  } finally {
    await ctx.close();
  }
}

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let root;
  if (args.root) {
    root = resolve(String(args.root));
    if (!existsSync(root)) die(`--root no existe: ${root}`);
  } else {
    root = findRoot(process.cwd());
    if (!root) die('no encontré la raíz del proyecto (la carpeta con AGENTS.md y modes/). Corré desde tu repo o pasá --root=');
  }
  if (args.mode !== undefined && !['light', 'dark'].includes(args.mode)) die('--mode tiene que ser light o dark');
  if (args.theme !== undefined && !THEMES.includes(args.theme)) die(`--theme tiene que ser uno de ${THEMES.join(', ')}`);

  const cvPath = join(root, 'cv.md');
  const profilePath = join(root, 'config', 'profile.yml');
  const cfgPath = join(root, 'config', 'portafolio.yml');
  if (!existsSync(cvPath)) die(`falta cv.md en ${root}: completá el onboarding primero`);
  if (!existsSync(profilePath)) die(`falta config/profile.yml en ${root}: completá el onboarding primero`);
  if (!existsSync(cfgPath))
    die('no existe config/portafolio.yml. Copiá el ejemplo: cp -n .agents/skills/coderhub-portafolio/portafolio.example.yml config/portafolio.yml');

  const cvText = readFileSync(cvPath, 'utf8');
  const profile = loadYaml(profilePath, 'config/profile.yml');
  const cfg = loadYaml(cfgPath, 'config/portafolio.yml');
  const cv = parseCv(cvText);
  const errors = [];
  const warnings = [];
  const v = validate(cfg, profile, root, args.theme, errors, warnings);
  if (cv.experience.length === 0) warnings.push('cv.md: no encontré experiencia (## Work Experience con ### Empresa); la sección no se publica');
  if (errors.length) die(`portafolio.yml tiene errores:\n${errors.map((e) => `  - ${e}`).join('\n')}`);

  const maxBullets = cfg.experiencia?.max_bullets ?? 3;
  const { content: en, fuente } = englishContent(cfg, profile, cv, maxBullets);
  if (!en.titular) warnings.push('no hay titular: poné `titular` en portafolio.yml o candidate.title en profile.yml');
  if (!en.sobre_mi) warnings.push('no hay `sobre_mi` en portafolio.yml ni resumen en cv.md: la sección "sobre mí" no se publica');
  else if (!str(cfg.sobre_mi)) warnings.push('`sobre_mi` vacío en portafolio.yml: usé el resumen de cv.md');

  if (args['dump-content']) {
    writeFileSync(1, `${JSON.stringify({ idioma: 'en', fuente, ...en }, null, 2)}\n`);
    return;
  }

  // Contenido por idioma.
  const idiomas = cfg.idiomas;
  const byLang = {};
  for (const lang of idiomas) {
    if (lang === 'en') {
      byLang[lang] = en;
      continue;
    }
    const block = cfg[lang];
    if (!block || typeof block !== 'object' || (!block.titular && !block.sobre_mi && !block.experiencia))
      die(`el idioma "${lang}" está en \`idiomas\` pero portafolio.yml no tiene su bloque \`${lang}:\`. Corré /coderhub traducir portafolio`);
    if (str(block.fuente) !== fuente)
      warnings.push(`la traducción "${lang}" quedó vieja (fuente ${str(block.fuente) || '—'} ≠ ${fuente}): corré /coderhub traducir portafolio`);
    for (const k of ['proyectos', 'experiencia', 'educacion']) {
      if (Array.isArray(block[k]) && block[k].length !== en[k].length)
        warnings.push(`la traducción "${lang}": ${k} tiene ${block[k].length} ítems y el contenido en inglés ${en[k].length}`);
    }
    byLang[lang] = translated(en, block);
  }

  const themeName = v.tema;
  const themeDir = join(HERE, 'themes', themeName);
  const theme = JSON.parse(readFileSync(join(themeDir, 'theme.json'), 'utf8'));
  const i18n = JSON.parse(readFileSync(join(SHARED, 'i18n.json'), 'utf8'));
  const partial = (name) => {
    const own = join(themeDir, 'partials', `${name}.html`);
    return readFileSync(existsSync(own) ? own : join(SHARED, 'partials', `${name}.html`), 'utf8');
  };
  const accent = str(cfg.acento) || '#0099FF';
  const modoInicial = args.mode || cfg.modo_inicial || 'auto';
  const baseUrl = baseUrlOf(cfg, v.hosting, v.ghuser);
  const c = profile.candidate || {};
  const fullName = str(c.full_name);
  const nameSlug = slugify(fullName);
  const contacto = v.contacto;
  const og = !args['no-og'];

  // Archivos en memoria: rel → { data, binary }.
  const files = new Map();
  const put = (rel, data, binary = false) => files.set(rel, { data, binary });

  // Logos del stack (una vez, para páginas y OG).
  const stackCfg = (cfg.stack || []).map((s) => (typeof s === 'string' ? { name: s, slug: '' } : { name: str(s.name), slug: str(s.slug) }));
  const logos = await Promise.all(stackCfg.map((s) => (s.slug ? fetchLogo(s.slug) : null)));
  const logosChip = stackCfg.filter((s, i) => !logos[i]).map((s) => s.name);

  // Foto.
  let photoRel = null;
  let photoDataUrl = null;
  if (cfg.foto) {
    const jpg = await processPhoto(resolve(root, str(cfg.foto)));
    photoRel = 'assets/foto.jpg';
    put(photoRel, jpg, true);
    photoDataUrl = `data:image/jpeg;base64,${jpg.toString('base64')}`;
  }

  // PDFs.
  const pdfs = {};
  for (const [lang, rel] of Object.entries(cfg.cv_pdf || {})) {
    if (!rel) continue;
    const name = `cv-${nameSlug}-${lang}.pdf`;
    put(name, readFileSync(resolve(root, str(rel))), true);
    pdfs[lang] = { file: name, source: str(rel) };
  }

  // Links de contacto (whitelist).
  const links = [];
  const loc = [str(profile.location?.city), str(profile.location?.country)].filter(Boolean).join(', ') || str(c.location);
  for (const k of contacto) {
    if (k === 'email' && str(c.email)) links.push({ k, href: `mailto:${str(c.email)}`, text: str(c.email), icon: 'mail' });
    else if (k === 'linkedin' && str(c.linkedin)) {
      const u = normUrl(c.linkedin);
      links.push({ k, href: u, text: displayUrl(u), label: 'LinkedIn', icon: 'linkedin' });
    } else if (k === 'github' && str(c.github)) {
      const u = normUrl(c.github);
      links.push({ k, href: u, text: displayUrl(u), label: 'GitHub', icon: 'github' });
    } else if (k === 'twitter' && str(c.twitter)) {
      const u = normUrl(c.twitter, 'x.com');
      links.push({ k, href: u, text: displayUrl(u), label: 'X', icon: 'x' });
    } else if (k === 'telefono' && str(c.phone)) {
      links.push({ k, href: `tel:${str(c.phone).replace(/[^\d+]/g, '')}`, text: str(c.phone), icon: 'phone' });
    } else if (k === 'ubicacion' && loc) {
      links.push({ k, href: null, text: loc, icon: 'pin' });
    } else warnings.push(`contacto "${k}" está en la whitelist pero no hay dato en profile.yml: no se publica`);
  }

  // Assets compartidos.
  const css = readFileSync(join(themeDir, 'styles.css'), 'utf8');
  const accentStyle = accentCss(accent, theme);
  put('assets/styles.css', css);
  put('assets/site.js', readFileSync(join(SHARED, 'site.js'), 'utf8'));
  put('favicon.svg', fill(readFileSync(join(SHARED, 'favicon.svg.tpl'), 'utf8'), { ACCENT: accent, FG: onAccent(accent), INITIALS: esc(initialsOf(fullName)) }, 'favicon'));

  const pagePath = (lang) => (lang === idiomas[0] ? '' : `${lang}/`);
  const pageUrl = (lang) => `${baseUrl}${pagePath(lang)}`;
  const today = new Date().toLocaleDateString('sv-SE');
  const year = today.slice(0, 4);
  const modeScript = (initial) =>
    `<script>(function(){var d=document.documentElement,m=null;try{m=localStorage.getItem('${MODE_KEY}')}catch(e){}` +
    `if(m!=='light'&&m!=='dark'){m=${JSON.stringify(initial)};if(m==='auto')m=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}` +
    `d.setAttribute('data-mode',m)})();</script>`;

  const avatarHtml = (alt, prefix) =>
    photoRel
      ? `<img class="avatar" src="${prefix}${photoRel}" alt="${esc(alt)}" width="${PHOTO_PX}" height="${PHOTO_PX}">`
      : `<span class="avatar avatar--initials" role="img" aria-label="${esc(alt)}">${esc(initialsOf(fullName))}</span>`;

  const logosHtml = (names) =>
    stackCfg
      .map((s, i) => ({ ...s, svg: logos[i] }))
      .filter((s) => !names || names.includes(s.name))
      .map((s) =>
        s.svg
          ? `<li class="stack__item"><span class="stack__logo">${s.svg}</span><span class="stack__name">${esc(s.name)}</span></li>`
          : `<li class="stack__item stack__item--chip"><span class="stack__name">${esc(s.name)}</span></li>`,
      )
      .join('\n');

  const pages = [];
  const ogFiles = {};
  for (const lang of idiomas) {
    const t = i18n[lang];
    const k = byLang[lang];
    const prefix = lang === idiomas[0] ? '' : '../';
    const nav = [];

    // Hero.
    const eyebrow = stackCfg.slice(0, 3).map((s) => s.name).join(' · ');
    const linksHtml = links
      .map((l) => {
        const label = l.label ? `<span class="visually-hidden">${esc(l.label)}: </span>` : '';
        const inner = `${icon(l.icon)}<span class="link__text">${label}${esc(l.text)}</span>`;
        return l.href
          ? `<li><a class="link link--${l.k}" href="${esc(l.href)}"${l.href.startsWith('https:') ? ' rel="me noopener"' : ''}>${inner}</a></li>`
          : `<li><span class="link link--${l.k}">${inner}</span></li>`;
      })
      .join('\n');
    const pdf = pdfs[lang] || pdfs[idiomas.find((x) => pdfs[x])] || Object.values(pdfs)[0];
    const pdfLang = pdf ? Object.keys(pdfs).find((x) => pdfs[x] === pdf) : null;
    const cvButton = pdf
      ? `<a class="button button--cv" href="${prefix}${pdf.file}" download${pdfLang !== lang ? ` hreflang="${pdfLang}"` : ''}>${icon('download')}<span>${esc(t.download_cv)}${pdfLang !== lang ? ` ${esc(t.cv_lang[pdfLang])}` : ''}</span></a>`
      : '';
    const hero = fill(partial('hero'), {
      AVATAR: avatarHtml(fullName, prefix),
      EYEBROW: esc(eyebrow),
      NAME: esc(fullName),
      TITULAR: esc(k.titular),
      LINKS: linksHtml,
      CV_BUTTON: cvButton,
    }, 'hero');

    const section = (id, num, cmd, title, body, extraClass = '') => {
      nav.push({ id, title });
      return fill(partial('section'), { ID: id, CMD: cmd, TITLE: esc(title), BODY: body, CLASS: extraClass }, `section ${id}`);
    };

    const about = k.sobre_mi
      ? section('about', 1, 'cat sobre-mi.md', t.nav.about, `<div class="prose">${paragraphs(k.sobre_mi).map((p) => `<p>${inline(p)}</p>`).join('\n')}</div>`)
      : '';

    // Experiencia (agrupada por empresa).
    let ri = 0;
    const xpItems = cv.experience
      .map((co) => {
        const roles = co.roles
          .map((r) => {
            const tr = k.experiencia[ri++] || { rol: r.rol, bullets: [] };
            return fill(partial('role'), {
              TITLE: esc(tr.rol),
              DATES: esc(localizeDates(r.fechas, lang, t.present)),
              BULLETS: tr.bullets.length ? `<ul class="role__bullets">${tr.bullets.map((b) => `<li>${inline(b)}</li>`).join('')}</ul>` : '',
            }, 'role');
          })
          .join('\n');
        const coDates = co.fechas || (co.roles.length === 1 ? '' : '');
        return fill(partial('experience-item'), {
          COMPANY: esc(co.empresa),
          DATES: esc(localizeDates(coDates, lang, t.present)),
          ROLES: roles,
        }, 'experience-item');
      })
      .join('\n');
    const experience = cv.experience.length ? section('experience', 2, 'ls experiencia/', t.nav.experience, `<div class="xp">${xpItems}</div>`) : '';

    // Proyectos.
    const projects = k.proyectos.length
      ? section('projects', 3, 'ls proyectos/', t.nav.projects, `<ul class="projects">${k.proyectos
        .map((p, i) => {
          const src = cfg.proyectos[i];
          const plinks = Object.entries(src.links || {})
            .filter(([, u]) => u)
            .map(([kind, u]) => `<a class="project__link" href="${esc(str(u))}" rel="noopener">${esc(t[kind])}${icon('arrow')}<span class="visually-hidden"> ${esc(p.nombre)}</span></a>`)
            .join('');
          return fill(partial('project'), {
            NAME: esc(p.nombre),
            DESCRIPTION: inline(p.descripcion),
            TAGS: (src.stack || []).length ? `<ul class="tags">${src.stack.map((s) => `<li class="tag">${esc(str(s))}</li>`).join('')}</ul>` : '',
            LINKS: plinks ? `<p class="project__links">${plinks}</p>` : '',
          }, 'project');
        })
        .join('\n')}</ul>`)
      : '';

    // Stack + grupos de skills del cv.
    const groups = k.habilidades.length
      ? `<dl class="skills">${k.habilidades.map((g) => `<div class="skills__group">${g.grupo ? `<dt>${esc(g.grupo)}</dt>` : ''}<dd>${esc(g.items)}</dd></div>`).join('')}</dl>`
      : '';
    const stack = stackCfg.length || groups
      ? section('stack', 4, 'cat stack.txt', t.nav.stack, `${stackCfg.length ? `<ul class="stack">${logosHtml()}</ul>` : ''}${groups}`)
      : '';

    // Educación + certificaciones.
    const showEdu = cfg.secciones?.educacion !== false && k.educacion.length;
    const showCerts = cfg.secciones?.certificaciones !== false && cv.certifications.length;
    let education = '';
    if (showEdu || showCerts) {
      const edu = showEdu
        ? `<ul class="edu">${k.educacion
          .map((e, i) => {
            const fechas = cv.education[i]?.fechas || '';
            return `<li class="edu__item"><div class="edu__head"><h3 class="edu__title">${esc(e.titulo || e.institucion)}</h3>${fechas ? `<p class="edu__dates">${esc(localizeDates(fechas, lang, t.present))}</p>` : ''}</div>${e.titulo && e.institucion ? `<p class="edu__school">${esc(e.institucion)}</p>` : ''}${e.detalle ? `<p class="edu__detail">${inline(e.detalle)}</p>` : ''}</li>`;
          })
          .join('')}</ul>`
        : '';
      const certs = showCerts
        ? `<h3 class="subhead">${esc(t.certifications)}</h3><ul class="certs">${cv.certifications.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
        : '';
      education = section('education', 5, 'cat formacion.md', showEdu ? t.nav.education : t.certifications, edu + certs);
    }

    // Recomendaciones.
    const recs = cfg.secciones?.recomendaciones || [];
    const recommendations = recs.length
      ? section('recommendations', 6, 'grep -r "recomienda"', t.nav.recommendations, `<div class="quotes">${recs
        .map((r) => fill(partial('recommendation'), { TEXT: inline(str(r.texto)), AUTHOR: esc(str(r.autor)), ROLE: esc(str(r.rol)) }, 'recommendation'))
        .join('\n')}</div>`)
      : '';

    // Contacto.
    const email = links.find((l) => l.k === 'email');
    const contactBody = fill(partial('contact'), {
      LEAD: esc(email ? t.contact_lead : t.contact_lead_noemail),
      PRIMARY: email ? `<a class="contact__email" href="${esc(email.href)}">${esc(email.text)}</a>` : '',
      LINKS: links.filter((l) => l.k !== 'email').length ? `<ul class="links links--contact">${linksHtml}</ul>` : '',
      CV_BUTTON: cvButton,
    }, 'contact');
    const contact = links.length || cvButton ? section('contact', 7, 'contact --open', t.nav.contact, contactBody, ' section--contact') : '';

    // Header: nav + idiomas + toggle.
    const langLinks = idiomas
      .map((l) => {
        const target = l === idiomas[0] ? `${prefix}index.html` : lang === idiomas[0] ? `${l}/index.html` : l === lang ? 'index.html' : `../${l}/index.html`;
        return l === lang
          ? `<li><a class="lang__link" href="${target}" aria-current="true" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a></li>`
          : `<li><a class="lang__link" href="${target}" hreflang="${l}" lang="${l}"><span class="visually-hidden">${esc(i18n[l].lang_name)}: </span>${l.toUpperCase()}</a></li>`;
      })
      .join('');
    const header = fill(partial('header'), {
      HOME_HREF: '#top',
      BRAND: esc(fullName),
      INITIALS: esc(initialsOf(fullName)),
      NAV_LABEL: esc(t.nav_label),
      NAV: nav.map((n) => `<li><a href="#${n.id}">${esc(n.title)}</a></li>`).join(''),
      LANG_LABEL: esc(t.lang_label),
      LANGS: idiomas.length > 1 ? `<ul class="lang">${langLinks}</ul>` : '',
      TOGGLE_LABEL: esc(t.toggle),
      ICON_SUN: icon('sun'),
      ICON_MOON: icon('moon'),
    }, 'header');

    const footer = fill(partial('footer'), { YEAR: year, NAME: esc(fullName), TOP_LABEL: esc(t.back_to_top), ICON_UP: icon('up') }, 'footer');

    // Head / SEO.
    const description = truncate(plain(k.sobre_mi) || k.titular || fullName, 158);
    const title = k.titular ? `${fullName} — ${k.titular}` : fullName;
    const alternates = [
      ...idiomas.map((l) => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l)}">`),
      `<link rel="alternate" hreflang="x-default" href="${pageUrl(idiomas[0])}">`,
    ].join('\n');
    const ogImage = `${pageUrl(lang)}og.png`;
    const sameAs = links.filter((l) => ['linkedin', 'github', 'twitter'].includes(l.k)).map((l) => l.href);
    const jsonld = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: fullName,
      ...(k.titular ? { jobTitle: k.titular } : {}),
      url: pageUrl(lang),
      ...(photoRel ? { image: `${baseUrl}${photoRel}` } : og ? { image: ogImage } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      ...(stackCfg.length ? { knowsAbout: stackCfg.map((s) => s.name) } : {}),
      ...(showEdu ? { alumniOf: [...new Set(cv.education.map((e) => e.institucion).filter(Boolean))].map((n) => ({ '@type': 'EducationalOrganization', name: n })) } : {}),
      ...(email ? { email: email.href } : {}),
      ...(contacto.includes('ubicacion') && loc
        ? { address: { '@type': 'PostalAddress', ...(profile.location?.city ? { addressLocality: str(profile.location.city) } : {}), ...(profile.location?.country ? { addressCountry: str(profile.location.country) } : {}) } }
        : {}),
    };
    const ogTags = [
      `<meta property="og:type" content="profile">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:url" content="${pageUrl(lang)}">`,
      `<meta property="og:site_name" content="${esc(fullName)}">`,
      `<meta property="og:locale" content="${t.og_locale}">`,
      ...idiomas.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${i18n[l].og_locale}">`),
      ...(og
        ? [
          `<meta property="og:image" content="${ogImage}">`,
          `<meta property="og:image:width" content="${OG.width}">`,
          `<meta property="og:image:height" content="${OG.height}">`,
          `<meta property="og:image:alt" content="${esc(title)}">`,
        ]
        : []),
      `<meta name="twitter:card" content="${og ? 'summary_large_image' : 'summary'}">`,
      `<meta name="twitter:title" content="${esc(title)}">`,
      `<meta name="twitter:description" content="${esc(description)}">`,
      ...(og ? [`<meta name="twitter:image" content="${ogImage}">`] : []),
    ].join('\n');
    const head = fill(partial('head'), {
      TITLE: esc(title),
      DESCRIPTION: esc(description),
      AUTHOR: esc(fullName),
      CANONICAL: pageUrl(lang),
      ALTERNATES: alternates,
      OG: ogTags,
      THEME_LIGHT: theme.bg.light,
      THEME_DARK: theme.bg.dark,
      CSS_HREF: `${prefix}assets/styles.css`,
      ACCENT_CSS: accentStyle,
      FAVICON: `${prefix}favicon.svg`,
      MODE_SCRIPT: modeScript(modoInicial),
      JSONLD: JSON.stringify(jsonld).replace(/</g, '\\u003c'),
    }, 'head');

    const tpl = readFileSync(join(themeDir, 'index.html.tpl'), 'utf8');
    const html = fill(tpl, {
      LANG: lang,
      THEME: themeName,
      MODE_ATTR: modoInicial === 'auto' ? '' : ` data-mode="${modoInicial}"`,
      HEAD: head,
      SKIP_LABEL: esc(t.skip),
      HEADER: header,
      HERO: hero,
      ABOUT: about,
      EXPERIENCE: experience,
      PROJECTS: projects,
      STACK: stack,
      EDUCATION: education,
      RECOMMENDATIONS: recommendations,
      CONTACT: contact,
      FOOTER: footer,
      SCRIPTS: `<script src="${prefix}assets/site.js" defer></script>`,
    }, `themes/${themeName}/index.html.tpl`);
    const rel = `${pagePath(lang)}index.html`;
    put(rel, html.replace(/\n{3,}/g, '\n\n'));
    pages.push(rel);

    // OG.
    if (og) {
      const ogHtml = fill(readFileSync(join(SHARED, 'og.html.tpl'), 'utf8'), {
        LANG: lang,
        THEME: themeName,
        MODE: theme.og_mode || 'dark',
        THEME_CSS: css,
        ACCENT_CSS: accentStyle,
        AVATAR: photoDataUrl ? `<img class="avatar" src="${photoDataUrl}" alt="">` : `<span class="avatar avatar--initials">${esc(initialsOf(fullName))}</span>`,
        EYEBROW: esc(eyebrow),
        NAME: esc(fullName),
        TITULAR: esc(k.titular),
        LOGOS: stackCfg.map((s, i) => ({ ...s, svg: logos[i] })).filter((s) => s.svg).slice(0, 6).map((s) => `<span class="og__logo">${s.svg}</span>`).join(''),
        HOST: esc(displayUrl(pageUrl(idiomas[0]))),
      }, 'og.html.tpl');
      ogFiles[lang] = ogHtml;
    }
  }

  // 404 (CSS inline y links absolutos: GitHub Pages lo sirve en cualquier ruta).
  {
    const lang = idiomas[0];
    const t = i18n[lang];
    const html = fill(readFileSync(join(SHARED, '404.html.tpl'), 'utf8'), {
      LANG: lang,
      THEME: themeName,
      MODE_ATTR: modoInicial === 'auto' ? '' : ` data-mode="${modoInicial}"`,
      TITLE: esc(`${t.not_found_title} — ${fullName}`),
      CSS: css,
      ACCENT_CSS: accentStyle,
      MODE_SCRIPT: modeScript(modoInicial),
      HEADING: esc(t.not_found_title),
      TEXT: esc(t.not_found_text),
      HOME: baseUrl,
      HOME_LABEL: esc(t.not_found_home),
      OTHER: idiomas.slice(1).map((l) => `<a class="button button--ghost" href="${pageUrl(l)}" hreflang="${l}" lang="${l}">${esc(i18n[l].not_found_home)}</a>`).join(''),
      FAVICON: `${baseUrl}favicon.svg`,
    }, '404.html.tpl');
    put('404.html', html);
    pages.push('404.html');
  }

  // sitemap, robots, llms, .nojekyll, CNAME.
  const xmlEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  put('sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...idiomas.map((lang) => [
      '  <url>',
      `    <loc>${xmlEsc(pageUrl(lang))}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      ...idiomas.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEsc(pageUrl(l))}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEsc(pageUrl(idiomas[0]))}"/>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
    '',
  ].join('\n'));
  put('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}sitemap.xml\n`);
  {
    const lang = idiomas.includes('en') ? 'en' : idiomas[0];
    const k = byLang[lang];
    const t = i18n[lang];
    const md = [`# ${fullName}`, ''];
    if (k.titular) md.push(`> ${k.titular}`, '');
    if (k.sobre_mi) md.push(...paragraphs(k.sobre_mi).map((p) => `${plain(p)}\n`));
    if (cv.experience.length) {
      md.push(`## ${t.nav.experience}`, '');
      let ri = 0;
      for (const co of cv.experience)
        for (const r of co.roles) {
          const tr = k.experiencia[ri++];
          md.push(`- ${[tr?.rol || r.rol, co.empresa].filter(Boolean).join(', ')}${r.fechas || co.fechas ? ` (${localizeDates(r.fechas || co.fechas, lang, t.present)})` : ''}`);
        }
      md.push('');
    }
    if (k.proyectos.length) {
      md.push(`## ${t.nav.projects}`, '');
      k.proyectos.forEach((p, i) => {
        const repo = str(cfg.proyectos[i].links?.repo) || str(cfg.proyectos[i].links?.demo);
        md.push(`- ${repo ? `[${p.nombre}](${repo})` : p.nombre}: ${plain(p.descripcion)}`);
      });
      md.push('');
    }
    if (stackCfg.length) md.push(`## ${t.nav.stack}`, '', stackCfg.map((s) => s.name).join(', '), '');
    md.push(`## ${t.links}`, '');
    for (const l of idiomas) md.push(`- ${i18n[l].lang_name}: ${pageUrl(l)}`);
    for (const l of links) md.push(`- ${l.label || t.contact[l.k]}: ${l.href ? l.href.replace(/^mailto:/, '') : l.text}`);
    for (const [l, p] of Object.entries(pdfs)) md.push(`- ${t.download_cv} (${l}): ${baseUrl}${p.file}`);
    put('llms.txt', `${md.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`);
  }
  put('.nojekyll', '');
  if (cfg.dominio) put('CNAME', `${str(cfg.dominio).toLowerCase()}\n`);
  for (const f of files.values()) if (!f.binary) f.data = String(f.data);

  // Privacidad (antes de escribir y antes del OG, que se arma con el mismo texto).
  const allowedText = [
    cv.summary,
    ...cv.experience.flatMap((co) => [co.empresa, ...co.roles.flatMap((r) => [r.rol, ...r.bullets])]),
    ...cv.education.flatMap((e) => [e.titulo, e.institucion, e.detalle]),
    ...cv.certifications,
    ...cv.skills.flatMap((g) => [g.grupo, g.items]),
    contacto.includes('ubicacion') ? loc : '',
  ].join('\n');
  const rules = privacyRules({ profile, cfg, contacto, root, cvText, allowedText });
  const ogTexts = new Map(Object.entries(ogFiles).map(([l, h]) => [`og (${l})`, { data: h }]));
  const leaks = [...checkPrivacy(files, rules), ...checkPrivacy(ogTexts, rules)];
  if (leaks.length) {
    if (browserP) await (await browserP).close();
    die(`revisión de privacidad: el sitio publicaría datos privados. No escribí nada.\n${leaks.map((l) => `  - ${l}`).join('\n')}\n` +
      'Sacalos de portafolio.yml / cv.md (o de la whitelist `contacto`) y volvé a correr.');
  }

  // OG (Playwright).
  if (og) {
    for (const lang of idiomas) put(`${pagePath(lang)}og.png`, await renderPng(ogFiles[lang]), true);
  } else warnings.push('--no-og: sin imagen OG (las páginas no llevan og:image). Para publicar, corré sin --no-og');
  if (browserP) await (await browserP).close();

  // Escribir. Limpia el out anterior (salvo .git, por si el out es el repo público).
  const out = args.out ? resolve(String(args.out)) : join(root, 'output', 'portafolio');
  if (existsSync(out)) {
    if (!statSync(out).isDirectory()) die(`--out existe y no es una carpeta: ${out}`);
    const entries = readdirSync(out);
    const ours = entries.length === 0 || entries.includes('.nojekyll');
    if (!ours) die(`la carpeta ${out} no está vacía y no parece un build del portafolio (no tiene .nojekyll). Elegí otra con --out=`);
    for (const e of entries) if (e !== '.git') rmSync(join(out, e), { recursive: true, force: true });
  }
  for (const [rel, f] of files) {
    const p = join(out, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, f.data);
  }

  // Resumen.
  const publico = [{ dato: 'nombre', valor: fullName }];
  for (const l of links) {
    const tipo = { email: 'email', linkedin: 'linkedin', github: 'github', twitter: 'twitter', telefono: 'telefono', ubicacion: 'ubicacion' }[l.k];
    publico.push({ dato: tipo, valor: l.href && !l.href.startsWith('tel:') ? l.href.replace(/^mailto:/, '') : l.text });
  }
  if (contacto.includes('ubicacion') && loc) publico.push({ dato: 'ubicacion (JSON-LD address)', valor: loc });
  const empresas = cv.experience.map((co) => co.empresa).filter(Boolean);
  if (empresas.length) publico.push({ dato: 'empresas', valor: empresas });
  if (showEduAny(cfg, cv)) publico.push({ dato: 'educacion', valor: [...new Set(cv.education.map((e) => e.institucion || e.titulo).filter(Boolean))] });
  if (photoRel) publico.push({ dato: 'foto', valor: `${photoRel} (re-encodeada, sin EXIF/GPS)` });
  for (const [l, p] of Object.entries(pdfs))
    publico.push({ dato: `cv_pdf (${l})`, valor: `${p.file} ← ${p.source}`, nota: 'el PDF es el CV entero: lleva todo lo que tenga su header (teléfono, email, ubicación) aunque no esté en `contacto`' });
  const recsAll = cfg.secciones?.recomendaciones || [];
  if (recsAll.length) publico.push({ dato: 'recomendaciones', valor: recsAll.map((r) => `${str(r.autor)}${r.rol ? ` (${str(r.rol)})` : ''}`) });

  const summary = {
    out,
    url: baseUrl,
    tema: themeName,
    idiomas,
    paginas: pages,
    archivos: [...files.keys()].sort(),
    logos_chip: logosChip,
    warnings,
    publico,
  };
  writeFileSync(1, `${JSON.stringify(summary, null, 2)}\n`);
}

function showEduAny(cfg, cv) {
  return cfg.secciones?.educacion !== false && cv.education.length > 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(`coderhub-portafolio: error inesperado: ${err.stack || err.message}`);
    process.exit(1);
  });
}
