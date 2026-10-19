# Disco — Music Discovery PWA

TikTok-подобная лента превью реальных треков из iTunes Store.
Каждый свайп — осознанное действие; всё пишется в `userTaste.events`
и раз в 5 действий выводится в консоль как B2B-вектор предпочтений.

## Deploy to GitHub Pages

1. Создайте репозиторий, положите в корень:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `README.md`
2. `git push` в ветку `main`.
3. GitHub → Settings → Pages → **Deploy from a branch** → `main` / `(root)` → Save.
4. Через ~1 мин: `https://<username>.github.io/<repo>/`.

## Что работает

- ✅ вертикальный свайп (touch + мышь + клавиши ↑↓)
- ✅ реальные превью из iTunes Search API (CORS ✅)
- ✅ лайк / шеринг / шторка комментариев (с drag-to-dismiss)
- ✅ плавный fade-in/fade-out аудио при смене трека
- ✅ PWA: installable, offline-кэш обложек и HTML
- ✅ B2B-вектор вкусов → консоль (`F12`)

## Ограничения

- первый трек не автоплеится (autoplay-policy) — любой тап/свайп включает звук
- B2B-синк пока `console.log`, реальные эндпоинты требуют OAuth-прокси
- превью — 30/90 сек по правилам Apple