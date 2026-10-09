#!/usr/bin/env bash
# Запускает итерации PROMPT.md через `claude -p`, пока агент не вернёт DONE или BLOCKED.
# Каждая итерация — новый процесс claude со свежим контекстом. Цикл бесконечный: прервать — Ctrl+C.
#
#   ./loop.sh
#   PROMPT_FILE=OTHER.md RETRY_DELAY_SECONDS=30 ./loop.sh
#
# Коды выхода: 0 — DONE, 2 — BLOCKED.

set -uo pipefail

PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"
CLAUDE="${CLAUDE:-claude}"
RETRY_DELAY_SECONDS="${RETRY_DELAY_SECONDS:-10}"

cd "$(dirname "$0")" || exit 1

if [[ ! -f "$PROMPT_FILE" ]]; then
    echo "Нет файла $PROMPT_FILE" >&2
    exit 1
fi

cyan=$'\e[36m'; yellow=$'\e[33m'; green=$'\e[32m'; red=$'\e[31m'; reset=$'\e[0m'

for ((i = 1; ; i++)); do
    printf '\n%s=== Итерация %d ===%s\n' "$cyan" "$i" "$reset"

    # Вывод claude показываем в терминале (через stderr) и одновременно сохраняем для разбора.
    # pipefail: код выхода конвейера — код claude, а не tee.
    output=$("$CLAUDE" -p < "$PROMPT_FILE" | tee /dev/stderr)
    exit_code=$?

    status=$(grep -oE 'LOOP_STATUS:[[:space:]]*(CONTINUE|DONE|BLOCKED)' <<< "$output" \
        | tail -n 1 | grep -oE '(CONTINUE|DONE|BLOCKED)$')

    if [[ $exit_code -ne 0 || -z "$status" ]]; then
        # Пауза, чтобы при постоянной ошибке claude (сеть, авторизация) цикл не крутился вхолостую.
        printf '%sНет LOOP_STATUS (exit code %d) — повтор через %s с.%s\n' \
            "$yellow" "$exit_code" "$RETRY_DELAY_SECONDS" "$reset"
        sleep "$RETRY_DELAY_SECONDS"
        continue
    fi

    printf '%sСтатус: %s%s\n' "$green" "$status" "$reset"
    case "$status" in
        DONE)    exit 0 ;;
        BLOCKED) printf '%sНужен человек — см. PLAN.md%s\n' "$red" "$reset"; exit 2 ;;
    esac
done
