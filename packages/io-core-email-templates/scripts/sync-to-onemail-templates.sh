#!/usr/bin/env bash
# Purpose: Copy the generated <name>/<name>.json templates into the onemail-template
#          repo as <TARGET_DIR>/<name>/v<N>/template.json, versioning on content change.
# Usage:   bash scripts/sync-to-onemail-templates.sh [-n|--dry-run]
#          TARGET_DIR=<onemail-template>/templates/<client> bash scripts/sync-to-onemail-templates.sh
#          (SOURCE_DIR is optional and defaults to this package's src/ folder)
set -euo pipefail

# Root paths (set via environment variables). TARGET_DIR has no default.
SOURCE_DIR="${SOURCE_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../src" && pwd)}"
TARGET_DIR="${TARGET_DIR:-}"

name_pattern='^[a-z][a-z0-9]*(-[a-z0-9]+)*$'
dry_run=0

case "${1-}" in
    -n | --dry-run) dry_run=1 ;;
    "") ;;
    *)
        printf 'Usage: %s [-n|--dry-run]\n' "$0" >&2
        exit 1
        ;;
esac

if ! command -v jq >/dev/null 2>&1; then
    printf '❌ jq is required.\n' >&2
    exit 1
fi
if [[ -z $TARGET_DIR ]]; then
    printf '❌ TARGET_DIR is not set: the path of the onemail-template repo must be specified.\n' >&2
    printf '   Point it at the client templates folder, e.g.:\n' >&2
    printf '   TARGET_DIR=~/work/onemail-template/templates/ced bash %s\n' "$0" >&2
    exit 1
fi
if [[ ! -d $SOURCE_DIR ]]; then
    printf '❌ Source directory not found: %s\n' "$SOURCE_DIR" >&2
    exit 1
fi
if [[ ! -d $TARGET_DIR ]]; then
    printf '❌ Target directory not found: %s\n' "$TARGET_DIR" >&2
    exit 1
fi

# onemail requires TemplateName to be <client>_<template>_<version>, where the
# client is the folder name under templates/ (e.g. "ced").
client=$(basename "$TARGET_DIR")

sha256() {
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | cut -d' ' -f1
    else
        sha256sum "$1" | cut -d' ' -f1
    fi
}

# Print the source template with TemplateName set to the given value.
render() {
    jq --arg name "$2" '.TemplateName = $name' "$1"
}

# Print the highest vN number found in a template folder (0 when none).
latest_version() {
    local max=0 entry number
    for entry in "$1"/v*/; do
        [[ -d $entry ]] || continue
        number=$(basename "$entry")
        number=${number#v}
        if [[ $number =~ ^[1-9][0-9]*$ ]] && ((number > max)); then
            max=$number
        fi
    done
    printf '%s' "$max"
}

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

created=0 updated=0 unchanged=0 failed=0

for source_folder in "$SOURCE_DIR"/*/; do
    name=$(basename "$source_folder")
    source_file="$source_folder$name.json"
    # Shared folders (partials, assets, ...) have no <name>.json
    [[ -f $source_file ]] || continue

    if [[ ! $name =~ $name_pattern ]]; then
        printf '❌ %s: invalid template name\n' "$name" >&2
        failed=$((failed + 1))
        continue
    fi

    target_folder="$TARGET_DIR/$name"
    version=1
    latest=0
    if [[ -d $target_folder ]]; then
        latest=$(latest_version "$target_folder")
    fi

    if ((latest > 0)); then
        latest_file="$target_folder/v$latest/template.json"
        # Compare against the content as it would be stored in the latest version.
        if ! render "$source_file" "${client}_${name}_v${latest}" >"$tmp"; then
            printf '❌ %s: invalid JSON in %s\n' "$name" "$source_file" >&2
            failed=$((failed + 1))
            continue
        fi
        if [[ -f $latest_file && $(sha256 "$tmp") == "$(sha256 "$latest_file")" ]]; then
            printf '= %s: unchanged (v%s)\n' "$name" "$latest"
            unchanged=$((unchanged + 1))
            continue
        fi
        version=$((latest + 1))
    fi

    if ! render "$source_file" "${client}_${name}_v${version}" >"$tmp"; then
        printf '❌ %s: invalid JSON in %s\n' "$name" "$source_file" >&2
        failed=$((failed + 1))
        continue
    fi

    destination="$target_folder/v$version"
    if ((latest > 0)); then
        label="updated v$latest -> v$version"
        updated=$((updated + 1))
    else
        label="created v$version"
        created=$((created + 1))
    fi

    if ((dry_run)); then
        printf '~ %s: would be %s (%s/template.json)\n' "$name" "$label" "$destination"
    else
        mkdir -p "$destination"
        install -m 644 "$tmp" "$destination/template.json"
        printf '✅ %s: %s (%s/template.json)\n' "$name" "$label" "$destination"
    fi
done

printf '\nCreated: %s, updated: %s, unchanged: %s, failed: %s%s\n' \
    "$created" "$updated" "$unchanged" "$failed" "$([[ $dry_run -eq 1 ]] && printf ' (dry run)')"

((failed == 0))
