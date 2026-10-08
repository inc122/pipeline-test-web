# Запускает итерации PROMPT.md через `claude -p`, пока агент не вернёт DONE или BLOCKED.
# Каждая итерация — новый процесс claude со свежим контекстом. Цикл бесконечный: прервать — Ctrl+C.
#
#   .\loop.ps1
#
# Коды выхода: 0 — DONE, 2 — BLOCKED.

param(
    [string]$PromptFile = 'PROMPT.md',
    [string]$Claude = 'claude',
    [int]$RetryDelaySeconds = 10
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# PowerShell 5.1 по умолчанию передаёт в stdin внешних программ ASCII — кириллица превратится в «?».
$utf8 = New-Object System.Text.UTF8Encoding $false
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8

$prompt = Get-Content $PromptFile -Raw -Encoding UTF8

for ($i = 1; ; $i++) {
    Write-Host "`n=== Итерация $i ===" -ForegroundColor Cyan

    # Промпт передаём через stdin: в аргументе командной строки PS 5.1 ломает кавычки и переносы строк.
    $output = $prompt | & $Claude -p | ForEach-Object { Write-Host $_; $_ }
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }

    $match = [regex]::Matches(($output -join "`n"), 'LOOP_STATUS:\s*(CONTINUE|DONE|BLOCKED)')
    $status = if ($match.Count -gt 0) { $match[$match.Count - 1].Groups[1].Value } else { $null }

    if ($exitCode -ne 0 -or -not $status) {
        # Пауза, чтобы при постоянной ошибке claude (сеть, авторизация) цикл не крутился вхолостую.
        Write-Host "Нет LOOP_STATUS (exit code $exitCode) — повтор через $RetryDelaySeconds с." -ForegroundColor Yellow
        Start-Sleep -Seconds $RetryDelaySeconds
        continue
    }

    Write-Host "Статус: $status" -ForegroundColor Green
    switch ($status) {
        'DONE'    { exit 0 }
        'BLOCKED' { Write-Host 'Нужен человек — см. PLAN.md' -ForegroundColor Red; exit 2 }
    }
}
