# 🧠 Memory OS — Cognitive Operating System (PWA)

Un sistem de operare web progresiv (PWA) de tip **Personal Knowledge Management & Second Brain**, conceput sub o interfață modernă **Glassmorphism**, cu stocare locală 100% offline (IndexedDB), vizualizare a sinapselor prin graf interactiv, căutare Spotlight (`Ctrl+K`) și motor de reamintire activă (Recall Engine).

---

## ✨ Caracteristici Principale

- **Desktop OS Metaphor & Glassmorphism:**
  - Ferestre redimensionabile, deplasabile cu mouse-ul, minimizare, maximizare și efecte translucide de sticlă mată (frosted glass).
  - Dock animat în stil macOS cu indicatori de ferestre deschise.
  - Top Bar cu statistici în timp real despre numărul de amintiri, sinapse și starea rețelei.
  - 5 teme atmosferice pentru reflexii: *Aurora Glass*, *Deep Cosmos*, *Cyberpunk Pulse*, *Emerald Neural*, *Minimal Slate*.

- **Aplicații de Sistem Incluse:**
  1. 📝 **Memory Journal & Stream:** Captură rapidă de gânduri, etichete inteligente, categorii, încărcare de imagini și conectare sinaptică bidirecțională.
  2. 🕸️ **Synapse Graph:** Harta mentală interactivă randată la 60fps pe Canvas (fizică a forțelor, noduri de memorie + hub-uri de tag-uri, zoom, pan și deschidere prin click).
  3. 🗄️ **Memory Vault:** Explorator și arhivă cu vizualizare grilă / listă, filtre avansate, sortare și căutare rapidă.
  4. ⚡ **Recall Engine:** Sesiune de reflecție zilnică (Spaced Repetition / Ebbinghaus Curve), carduri flipabile și evaluare cognitivă cu animații de celebrare.
  5. 🔍 **Spotlight Search (`⌘K` / `Ctrl+K`):** Căutare fuzzy instantanee în amintiri, concepte și comenzi de sistem.
  6. ⚙️ **Configurare & Backup:** Export complet al bazei de date în format JSON, import/restaurare, și suport pentru instalare PWA.

- **Fără API Extern & 100% Privat:**
  - Datele sunt stocate exclusiv în browserul utilizatorului prin **IndexedDB (Dexie.js)**.
  - Funcționează offline datorită Service Worker-ului configurat prin **Workbox**.
  - Zero costuri de backend, zero chei API.

---

## 🚀 Rulare Locală

```bash
# Navighează în folderul proiectului
cd memory-os

# Instalează dependențele (dacă nu au fost deja instalate)
npm install

# Pornește serverul de dezvoltare
npm run dev

# Sau construiește bundle-ul de producție și testează preview-ul
npm run build
npm run preview
```

---

## 🌐 Publicare pe GitHub & Cloudflare Pages

### 1. Salvare pe GitHub
```bash
git remote add origin https://github.com/<UTILIZATOR>/memory-os.git
git branch -M main
git push -u origin main
```

### 2. Conectare la Cloudflare Pages (Gratuit)
1. Conectează-te în [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Click pe **Create application** > **Pages** > **Connect to Git**.
3. Selectează repository-ul `memory-os`.
4. Setări de Build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click pe **Save and Deploy**. Cloudflare va genera automat un domeniu rapid și securizat HTTPS (ex: `memory-os.pages.dev`).

---

## 📱 Instalare PWA pe Dispozitive

- **Desktop (Chrome/Edge/Brave):** Apasă pe iconița de instalare din bara de adrese a browserului sau din aplicația *Configurare OS* > *Instalează PWA*.
- **iOS / Safari:** Deschide site-ul, apasă pe butonul **Share** (Partajare) > **Add to Home Screen** (Adaugă pe ecranul principal).
- **Android:** Apasă pe cele trei puncte din browser > **Install App** / **Add to Home screen**.
