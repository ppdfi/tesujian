# Panduan Aplikasi CBT Interaktif SMP Darul Fawaid Ilmiyah

Selamat datang di repositori webapp Ujian Interaktif CBT **SMP Darul Fawaid Ilmiyah**. Webapp ini dirancang ringan, modern, dan sangat mudah digunakan langsung melalui browser di HP maupun komputer tanpa perlu membuka spreadsheet.

---

## 1. Akun Masuk Bawaan (Demo Login)

Untuk mencoba aplikasi, Anda dapat menggunakan tombol login 1-klik atau kredensial berikut:

| Peran (Role) | Username | Password | Keterangan |
|---|---|---|---|
| **Admin / Panitia** | `admin` | `admin123` | Akses penuh: manajemen siswa, cetak kartu ujian, berita acara, sinkronisasi DB |
| **Guru (Matematika)** | `guru.budi` | `guru123` | Buat soal (PG & Esai), unggah foto ke Drive, koreksi esai, rekap nilai per kelas |
| **Guru (IPA)** | `guru.siti` | `guru123` | Buat soal, koreksi nilai IPA |
| **Siswa (Kelas 7A)** | `andi.pratama` | `123` | Mengerjakan ujian CBT, anti-cheat, konfirmasi selesai |
| **Siswa (Kelas 7A)** | `anisa.rahma` | `123` | Mengerjakan ujian CBT |

---

## 2. Struktur Folder & Kode (Sederhana & Mudah Dipahami)

Struktur file dibuat rapi dan tidak bertingkat-tingkat agar Anda yang masih pemula dapat mudah mengubahnya di masa depan:

- **`src/data/initialData.ts`**: Berisi data awal sekolah, data siswa (Kelas 7, 8, 9), data guru (dengan nomor HP), dan contoh paket soal ujian SMP (Matematika, IPA, Bahasa Indonesia, dll).
- **`src/types.ts`**: Definisi format data (Siswa, Guru, Ujian, Soal, Lembar Jawaban).
- **`src/services/appScriptService.ts`**: Kode penghubung ke Google Spreadsheet & Google Drive, serta template kode Apps Script lengkap.
- **`src/components/auth/`**: Tampilan login dengan pilihan peran dan tombol 1-klik.
- **`src/components/siswa/`**: 
  - `SiswaDashboard.tsx`: Dasbor siswa untuk memilih ujian aktif.
  - `CbtPlayer.tsx`: Ruang ujian interaktif responsif HP (layar penuh, tombol ragu-ragu, zoom foto soal, deteksi anti-curang, tanpa menampilkan nilai ke siswa).
- **`src/components/guru/`**: Dasbor guru untuk membuat paket ujian, input soal + upload foto ke Drive, koreksi jawaban uraian, dan **Rekap Nilai Siswa Per Kelas**.
- **`src/components/admin/`**: Dasbor panitia untuk kelola data siswa/guru, cetak kartu ujian resmi, dan cetak berita acara.

---

## 3. Cara Menghubungkan Google Spreadsheet & Google Drive

Webapp ini sudah otomatis terhubung dengan Google Apps Script:
- **URL Web App Script**: `https://script.google.com/macros/s/AKfycbxXFaiwQDGXMeuKCnNrvaM4AgVPavw96uMfYQazIYM6JFLRYp68mVrnwJAhL9QYoJGS5w/exec`
- **Folder Google Drive Gambar Soal**: `https://drive.google.com/drive/folders/1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh?usp=sharing`

### Langkah Setup Spreadsheet (Hanya Sekali):
1. Buka [Google Sheets](https://sheets.new) baru.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus kode bawaan dan salin (paste) seluruh kode dari template yang ada di modal aplikasi (tombol **"Konfigurasi Database"** di pojok kanan atas aplikasi atau di `src/services/appScriptService.ts`).
4. Klik **Deploy** > **New Deployment** > pilih jenis **Web App**.
5. Atur:
   - **Execute as**: *Me (email Anda)*
   - **Who has access**: *Anyone (Siapa saja)*
6. Klik **Deploy**, izinkan akses, lalu salin URL Web App yang dihasilkan ke aplikasi.

---

## 4. Fitur Utama yang Telah Disesuaikan

1. **Logo Resmi SMP**: Telah terpasang logo resmi SMP pada kop ujian, kartu peserta, berita acara, dan header webapp.
2. **Tanpa Tulisan Arab & Menggunakan Mapel Dinas SMP**: Mapel disesuaikan untuk kurikulum SMP (Kelas 7, 8, dan 9).
3. **Penilaian Ganda & Koreksi Manual Esai**: Soal Pilihan Ganda dinilai otomatis oleh sistem sesuai kunci jawaban, sedangkan Isian Singkat dan Uraian dikoreksi manual oleh guru pada dasbor guru.
4. **Tanpa KKM & Nilai Disembunyikan dari Siswa**: Siswa hanya menerima konfirmasi selesai ujian tanpa melihat skor.
5. **Rekap Nilai Lengkap untuk Guru**: Guru dapat melihat tabel rekap nilai per kelas (Kelas 7A, 7B, 8A, 8B, 9A, 9B), melihat perolehan skor PG & Esai, serta mengunduh rekap dalam format CSV/Excel.
6. **Nomor HP / WhatsApp**: Menggantikan NIP untuk data pengajar dan panitia.
7. **Tampilan Mobile (HP) Optimal**: Navigasi nomor soal fleksibel (drawer bawah geser), tombol sentuh minimal 44px, teks jelas, dan ruang ujian bebas distraksi.

---

## 5. Menjalankan & Mengunggah ke GitHub

### Menjalankan di Komputer Lokal:
```bash
npm install
npm run dev
```
Akses di browser pada: `http://localhost:3000`

### Build untuk Produksi (Vercel / Netlify / GitHub Pages):
```bash
npm run build
```
Hasil build akan berada di folder `dist/` dan siap di-hosting di mana saja.
