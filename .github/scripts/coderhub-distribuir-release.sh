#!/usr/bin/env bash
# coderhub (D24): lleva un release de CoderHub OS a los repos de clientes activos.
#
# Los clientes actualizan desde su propio repo (coderhub-os/coderhub-<nombre>),
# no desde el template. Este script empuja el tag del release y crea el release
# de GitHub (con las mismas notas) en cada repo con el topic `mentoria-activa`.
# Un repo sin el topic deja de recibir versiones nuevas y conserva la que tiene.
#
# Uso (desde el clon del template, con `gh` logueado como admin de coderhub-os):
#   .github/scripts/coderhub-distribuir-release.sh coderhub-v2.3.0
#   .github/scripts/coderhub-distribuir-release.sh coderhub-v2.3.0 --dry-run
#   NOTES_FILE=notas.md .github/scripts/coderhub-distribuir-release.sh coderhub-v2.3.0
#
# Es idempotente: un repo que ya tiene el tag y el release se saltea.
set -euo pipefail

TAG="${1:?Uso: $0 coderhub-vX.Y.Z [--dry-run]}"
DRY_RUN="${2:-}"
ORG="coderhub-os"
TOPIC="mentoria-activa"
TEMPLATE="$ORG/coderhub"

[[ "$TAG" =~ ^coderhub-v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Tag inválido: $TAG" >&2; exit 1; }

git fetch --quiet origin "refs/tags/$TAG:refs/tags/$TAG" 2>/dev/null || true
git rev-parse --verify --quiet "refs/tags/$TAG^{commit}" >/dev/null || { echo "No existe el tag $TAG en $TEMPLATE" >&2; exit 1; }

# Las notas salen del release del template. Con NOTES_FILE se pueden pasar antes
# de publicarlo: así el tag llega a los clientes antes de que el template anuncie
# la versión (un cliente en v2.2.0 o antes ve el release del template y, desde
# v2.3.0, el updater lo baja de su propio repo).
NOTES="$(mktemp)"
trap 'rm -f "$NOTES"' EXIT
if [ -n "${NOTES_FILE:-}" ]; then
  cp "$NOTES_FILE" "$NOTES"
  TITLE="CoderHub OS ${TAG#coderhub-}"
else
  gh release view "$TAG" --repo "$TEMPLATE" --json body --jq .body > "$NOTES"
  TITLE="$(gh release view "$TAG" --repo "$TEMPLATE" --json name --jq .name)"
fi

# `gh repo list --topic` y no `gh search`: el índice de búsqueda tarda en ver los topics nuevos.
REPOS="$(gh repo list "$ORG" --limit 500 --topic "$TOPIC" --json name --jq '.[].name' | sort)"
[ -n "$REPOS" ] || { echo "Ningún repo tiene el topic $TOPIC" >&2; exit 1; }

ok=0; skip=0; fail=0
for repo in $REPOS; do
  [ "$repo" = "coderhub" ] && continue
  url="https://github.com/$ORG/$repo.git"
  if [ -n "$(git ls-remote --tags "$url" "refs/tags/$TAG" 2>/dev/null)" ] \
     && gh release view "$TAG" --repo "$ORG/$repo" >/dev/null 2>&1; then
    echo "= $repo (ya lo tiene)"; skip=$((skip+1)); continue
  fi
  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "~ $repo (se le empujaría $TAG)"; ok=$((ok+1)); continue
  fi
  if git push --quiet "$url" "refs/tags/$TAG:refs/tags/$TAG" \
     && { gh release view "$TAG" --repo "$ORG/$repo" >/dev/null 2>&1 \
          || gh release create "$TAG" --repo "$ORG/$repo" --verify-tag --latest --title "$TITLE" --notes-file "$NOTES" >/dev/null; }; then
    echo "+ $repo"; ok=$((ok+1))
  else
    echo "! $repo (falló)" >&2; fail=$((fail+1))
  fi
done

echo "Listo: $ok actualizados, $skip ya lo tenían, $fail fallaron."
[ "$fail" -eq 0 ]
