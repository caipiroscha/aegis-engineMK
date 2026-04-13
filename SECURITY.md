# Kebijakan Keamanan (Security Policy)

Terima kasih telah berkontribusi dan menjaga keamanan proyek **AEGIS Super Agent Marketing & SEO**. Kami menangani keamanan dengan sangat serius.

## Versi yang Didukung
Hanya versi terbaru (branch `main`) dari kode sumber ini yang saat ini menerima pembaruan keamanan.

| Versi | Didukung |
|-------|----------|
| `main`| ✅ Ya    |
| Lama  | ❌ Tidak |

## Pedoman Keamanan Khusus Proyek AEGIS
Karena proyek ini mengelola integrasi AI (Gemini) dan otomatisasi layanan pihak ketiga (Telegram, Google Cloud), perhatikan hal-hal krusial berikut:

1. **JANGAN PERNAH** mempublikasikan file atau catatan komit lokal yang berisi `GEMINI_API_KEY` atau `TELEGRAM_TOKEN` Anda ke repositori publik ini.
2. Semua kredensial sistem harus selalu diamankan eksklusif melalui fitur **Script Properties** (Roda Gigi) pada dashboard eksekusi Google Apps Script (bukan ditulis *hardcode* dalam file `aegis_logic.js`).
3. Selalu validasi bahwa variabel interupsi `TELEGRAM_CHAT_ID` telah Anda ubah ke ID pribadi/tim yang valid demi memastikan intersep data tidak terjadi.

## Melaporkan Kerentanan
Jika Anda menemukan kerentanan keamanan atau kelemahan bypass otorisasi pada *webhook* atau eksekusi *agent*, mohon untuk **TIDAK** membukanya sebagai *Issue* publik di GitHub.

Silakan kirimkan laporan Anda secara privat kepada pengelola repositori ini melalui email atau jalur kontak langsung pengembang utama. 

Kami akan berupaya keras untuk:
* Mengonfirmasi penerimaan laporan Anda dalam waktu 48 jam.
* Memberikan perkiraan jadwal kapan perbaikan atau *patch* akan dirilis.
* Memberitahu Anda sebelum perbaikan resmi diluncurkan.

Terima kasih atas bantuan Anda dalam menjaga keamanan AEGIS Intelligence.
