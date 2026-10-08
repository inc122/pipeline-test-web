# Запускает итерации PROMPT.md через `claude -p`, пока агент не вернёт DONE или BLOCKED.
# Каждая итерация — новый процесс claude со свежим контекстом.
#
#   .\loop.ps1                       # до 20 итераций
#   .\loop.ps1 -MaxIterations 5
#
# Коды выхода: 0 — DONE, 2 — BLOCKED, 3 — лимит итераций, 4 — агент не вернул статус.

param(
    [int]$MaxIterations = 20,
    [int]$MaxMissingStatus = 2,
    [string]$PromptFile = 'PROMPT.md',
    [string]$Claude = 'claude'
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# PowerShell 5.1 по умолчанию передаёт в stdin внешних программ ASCII — кириллица превратится в «?».
$utf8 = New-Object System.Text.UTF8Encoding $false
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8

$logDir = Join-Path $PSScriptRoot '.loop-logs'
New-Item -ItemType Directory -Force $logDir | Out-Null

$prompt = Get-Content $PromptFile -Raw -Encoding UTF8
$missing = 0

for ($i = 1; $i -le $MaxIterations; $i++) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $log = Join-Path $logDir "iter-$i-$stamp.log"
    Write-Host "`n=== Итерация $i / $MaxIterations ===" -ForegroundColor Cyan

    # Промпт передаём через stdin: в аргументе командной строки PS 5.1 ломает кавычки и переносы строк.
    $output = $prompt | & $Claude -p | Tee-Object -FilePath $log | ForEach-Object { Write-Host $_; $_ }
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }

    $match = [regex]::Matches(($output -join "`n"), 'LOOP_STATUS:\s*(CONTINUE|DONE|BLOCKED)')
    $status = if ($match.Count -gt 0) { $match[$match.Count - 1].Groups[1].Value } else { $null }

    if ($exitCode -ne 0 -or -not $status) {
        $missing++
        Write-Host "Нет LOOP_STATUS (exit code $exitCode), попытка $missing / $MaxMissingStatus. Лог: $log" -ForegroundColor Yellow
        if ($missing -ge $MaxMissingStatus) {
            Write-Host 'Агент несколько раз подряд не вернул статус — остановка.' -ForegroundColor Red
            exit 4
        }
        continue
    }
    $missing = 0

    Write-Host "Статус: $status" -ForegroundColor Green
    switch ($status) {
        'DONE'    { exit 0 }
        'BLOCKED' { Write-Host 'Нужен человек — см. PLAN.md' -ForegroundColor Red; exit 2 }
    }
}

Write-Host "Достигнут лимит в $MaxIterations итераций." -ForegroundColor Red
exit 3
