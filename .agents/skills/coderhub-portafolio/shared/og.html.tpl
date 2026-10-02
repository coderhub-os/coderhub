<!doctype html>
<html lang="{{LANG}}" data-theme="{{THEME}}" data-mode="{{MODE}}">
<head>
<meta charset="utf-8">
<style>
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
.og { box-sizing: border-box; width: 1200px; height: 630px; padding: 72px 80px; display: grid; grid-template-columns: auto 1fr; grid-template-rows: 1fr auto; column-gap: 64px; row-gap: 32px; align-items: center; }
.og__media .avatar { width: 240px; height: 240px; font-size: 88px; }
.og__eyebrow { margin: 0 0 18px; font-size: 24px; }
.og__name { margin: 0; font-size: 76px; line-height: 1.02; letter-spacing: -0.02em; }
.og__title { margin: 20px 0 0; font-size: 32px; line-height: 1.3; max-width: 26ch; }
.og__rule { width: 96px; height: 6px; margin-top: 32px; background: var(--accent); border-radius: 3px; }
.og__foot { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.og__logos { display: flex; gap: 28px; color: var(--muted); }
.og__logo svg { width: 44px; height: 44px; display: block; }
.og__host { font-size: 24px; color: var(--muted); }
</style>
<style>{{THEME_CSS}}</style>
<style>{{ACCENT_CSS}}</style>
</head>
<body>
<div class="og">
  <div class="og__media">{{AVATAR}}</div>
  <div class="og__body">
    <p class="eyebrow og__eyebrow">{{EYEBROW}}</p>
    <h1 class="og__name">{{NAME}}</h1>
    <p class="og__title">{{TITULAR}}</p>
    <div class="og__rule"></div>
  </div>
  <div class="og__foot">
    <div class="og__logos">{{LOGOS}}</div>
    <div class="og__host">{{HOST}}</div>
  </div>
</div>
</body>
</html>
