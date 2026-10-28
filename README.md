# Kick DVR (Stream Rewind) Plugin for Grayjay

> **Окремий плагін Kick для Grayjay з підтримкою повної перемотки (DVR) живих трансляцій.**

Цей плагін встановлюється як окреме незалежне джерело (**Kick DVR**) і не зачіпає оригінальний офіційний плагін Kick.

---

## ⚡ Швидке встановлення в Grayjay

### Варіант 1: В один клік
👉 **[Встановити Kick DVR у Grayjay](grayjay://plugin/https://raw.githubusercontent.com/MarianQQQ/grayjay-wtv/kick/KickConfig.json)**

---

### Варіант 2: За URL вручну
1. Скопіюйте посилання на конфігурацію:
   ```text
   https://raw.githubusercontent.com/MarianQQQ/grayjay-wtv/kick/KickConfig.json
   ```
2. Відкрийте **Grayjay**.
3. Перейдіть у **Sources** (Джерела) -> натисніть **`+`** (Додати джерело).
4. Оберіть **Install from URL** (Встановити за посиланням).
5. Вставте скопійовану адресу та підтвердіть встановлення.

---

## ⚙️ Окремі налаштування
* **Незалежний ID:** працює паралельно з офіційним плагіном Kick (не перезаписує його).
* **Live Stream DVR (Rewind):** увімкнено за замовчуванням у налаштуваннях джерела.
* **Повна перемотка:** підключає повнорозмірний маніфест `stream.kick.com` (`#EXT-X-PLAYLIST-TYPE:EVENT`).
* **Прямий логін:** налаштована пряма сторінка входу `https://kick.com/login` з автозбереженням сесії.
