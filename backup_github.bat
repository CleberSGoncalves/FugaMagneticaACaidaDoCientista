@echo off
echo [*] Sincronizando backup no GitHub...
git add .
git commit -m "auto: deploy e build Fuga Magnetica: A Queda do Cientista (CrazyGames HTML5)"
git push -u origin main
echo [OK] Backup concluido com sucesso!
