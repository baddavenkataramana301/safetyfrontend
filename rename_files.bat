@echo off
for /r src %%f in (*.tsx) do ren "%%f" "%%~nf.jsx"
