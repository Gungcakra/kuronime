# Kuronime

Situs streaming anime sub indo berbasis Next.js (App Router). Logika API diambil dari **AmbaFlix-api** dan template UI dari **kuropoi**. Video diputar langsung dari link MP4 (480p/720p), tanpa iframe dan tanpa iklan.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
```

Salin `.env.example` ke `.env` lalu isi `API_BASE_URL` dengan base URL API upstream. Base URL sengaja tidak disimpan di repo.

## Struktur

```
app/
  page.jsx                     # Beranda: carousel rekomendasi, ongoing, jadwal hari ini, baru upload
  ongoing/  latest/            # Daftar ongoing (lengkap) & baru upload (berhalaman)
  movie/                       # Daftar anime movie
  explore/                     # Explore katalog lengkap dengan filter genre/status/tahun/skor
  schedule/  az/  search/      # Jadwal rilis per hari, daftar A-Z, pencarian
  anime/[slug]/                # Detail anime + daftar episode
  watch/[slug]/                # Player MP4, pilih kualitas, download, prev/next (?anime=<slug>)
  api/                         # Route Handlers (pengganti server Express AmbaFlix)
components/  views/  hooks/
lib/upstream.js                # Server-only: fetch + normalisasi data upstream (port animeService.js)
lib/catalog.js                 # Server-only: indeks katalog untuk /api/explore
lib/api.js, lib/utils.js       # Client helpers
```

## Endpoint API

| Endpoint | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `/api/home` | - | Rekomendasi, ongoing, baru upload, movie, jadwal hari ini |
| `/api/ongoing` | - | Semua anime ongoing (10 terbaru + semua di jadwal minggu ini) |
| `/api/latest` | `page` | Baru upload, 25 per halaman |
| `/api/search` | `q`, `page` | Pencarian judul, 20 per halaman (`total`, `totalPages`) |
| `/api/explore` | `q`, `genre` (koma, harus cocok semua), `status`, `year`, `score` (minimum), `sort` (`newest`/`oldest`/`score`/`title`/`episodes`), `page` | Filter seluruh katalog, 30 per halaman, plus `facets` (genre, status, tahun). Mengembalikan `{ building, progress }` selama indeks pertama dibuat |
| `/api/movie` | - | 50 anime movie |
| `/api/anime/:slug` | - | Detail anime + episode (terbaru dulu) |
| `/api/episode/:slug` | - | Link MP4 per kualitas (`sources`) |
| `/api/schedule` | - | Jadwal rilis 7 hari |
| `/api/recommendations` | - | Rekomendasi |
| `/api/anime-list` | - | Semua judul dikelompokkan per huruf |
| `/api/image-proxy` | `url` | Proxy gambar cover |

Upstream mewajibkan header `User-Agent: Dart/3.4 (dart:io)`; sudah dipasang di `lib/upstream.js`.

### Indeks Explore

Upstream tidak punya endpoint genre/filter. `lib/catalog.js` mengambil seluruh hasil `search.php?keyword=a` (sekitar 241 halaman × 20, ~99,9% katalog; 8 request paralel, ~10 detik), menormalkan genre (typo dan beda huruf besar-kecil digabung) dan status, lalu memfilter di server. Indeks disimpan di memori selama 12 jam dan di-refresh di background. Tiap halaman upstream juga masuk data cache Next (12 jam), jadi build ulang dan instance serverless lain kebanyakan membaca cache. Route-nya memakai `after()` dan `maxDuration = 60` agar build tetap selesai di Vercel.

## Deploy ke Vercel

Import repo di Vercel (terdeteksi otomatis sebagai Next.js), lalu deploy.

> **Penting:** upstream API memblokir IP datacenter, dan Vercel berjalan di atas AWS, jadi tanpa proxy semua route API akan **502** di production. Lihat bagian di bawah.

### Proxy via Cloudflare Worker (wajib untuk production)

Request diteruskan lewat Cloudflare Worker di `worker/` (IP Cloudflare lolos dari blokir):

```bash
cd worker
npx wrangler login
npx wrangler secret put UPSTREAM_BASE # base URL API upstream (sama dengan API_BASE_URL lokal)
npx wrangler secret put PROXY_TOKEN   # isi string acak, mis. hasil: openssl rand -hex 24
npx wrangler deploy                   # -> https://kuronime-proxy.<akun>.workers.dev
```

Lalu di Vercel (Project → Settings → Environment Variables, Production), kemudian redeploy:

| Variable | Nilai |
| --- | --- |
| `API_BASE_URL` | `https://kuronime-proxy.<akun>.workers.dev` |
| `API_PROXY_TOKEN` | sama persis dengan `PROXY_TOKEN` di Worker |

Worker hanya menerima `GET`/`HEAD` ke path `*.php`, menambahkan User-Agent Dart, dan menolak request tanpa token yang cocok. Tanpa env di atas, aplikasi tetap jalan di lokal (langsung ke upstream) tapi 502 di Vercel.
