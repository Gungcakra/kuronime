<div align="center">

![Kuronime](docs/banner.png)

# Kuronime

**Website nonton anime sub indo tanpa iklan.**


![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![No Ads](https://img.shields.io/badge/iklan-0-2f8fff)

</div>

---

## Fitur

- **Beranda**: rekomendasi, anime ongoing, jadwal hari ini, dan episode terbaru.
- **Explore**: cari judul dan filter berdasarkan genre, status, tahun, dan skor.
- **Jadwal**: jadwal rilis 7 hari beserta jam update.
- **Video Player**
  - Pilihan kualitas (1080p, 720p, 480p, 360p) dan mirror
  - Kecepatan putar, picture-in-picture, dan fullscreen
  - Shortcut keyboard: `Spasi`/`K` play/pause, `J`/`L` mundur/maju, `←`/`→` 5 detik, `↑`/`↓` volume, `M` mute, `F` fullscreen
  - Navigasi episode sebelumnya/berikutnya dan download MP4
- **Bookmark**: simpan anime favorit di browser, tanpa akun.
- **Pencarian dan A-Z**: cari judul atau lihat daftar anime per huruf.
- **Movie, Ongoing, Baru Upload**: halaman terpisah dengan paginasi.
- **Responsif**: tampilan menyesuaikan HP dan desktop, bisa dipasang sebagai PWA.

---

## Menjalankan di lokal

Butuh Node.js 18.18 atau lebih baru.

```bash
# 1. Clone repo
git clone https://github.com/Gungcakra/kuronime.git
cd kuronime

# 2. Install dependency
npm install

# 3. Siapkan environment
cp .env.example .env
# lalu isi API_BASE_URL di .env dengan base URL API upstream

# 4. Jalankan
npm run dev
```

Buka http://localhost:3000.

Untuk versi production:

```bash
npm run build
npm start
```

---

<div align="center">

Dibuat oleh [@gungcakra](https://github.com/gungcakra)

</div>
