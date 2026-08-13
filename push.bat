@echo off
echo ===================================================
echo   Karl ^& Lezil Photo Library GitHub Push Helper
echo ===================================================
echo.
echo Initializing Git...
git init
echo Adding files...
git add .
echo Committing files...
git commit -m "update and deploy photolibrary"
echo Setting branch to main...
git branch -M main
echo Linking to remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Eroscodex/Photolibrary.git
echo.
echo Pushing files to GitHub (Force Push)...
git push -u origin main --force
echo.
echo ===================================================
echo   Upload complete! Close this window.
echo ===================================================
pause
