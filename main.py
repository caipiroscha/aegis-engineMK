import requests
import json
import google.generativeai as genai

# ==========================================
# 1. KONFIGURASI GEMINI AI & KREDENSIAL
# ==========================================
import os

# PERINGATAN: API Key sekarang diamankan via environment variable (.env)
API_KEY = os.environ.get("GOOGLE_API_KEY", "MASUKKAN_API_KEY_ANDA_DI_SINI")
if not API_KEY or API_KEY == "MASUKKAN_API_KEY_ANDA_DI_SINI":
    print("Error: GOOGLE_API_KEY tidak ditemukan di environment.")
    exit(1)
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# ==========================================
# 2. SUPER AGENT DIGITAL MARKETING & SEO
# ==========================================
def super_agent(topik):
    prompt = f"""Kamu adalah "Super Agent Digital Marketing & SEO" tingkat ahli. Tugas utamamu adalah meriset tren, menyusun artikel, membuat copywriting media sosial, dan merancang instruksi (prompt) desain visual/video untuk 4 merek bisnis.

PENTING: Jangan pernah menggunakan awalan "http://" atau akhiran ".com" saat menyebutkan merek. Gunakan nama-nama berikut secara persis dengan fungsinya masing-masing:
1. pedang88 (Fokus: Destinasi utama bermain, branding premium/keunggulan)
2. tuna55 (Fokus: Destinasi utama bermain, branding santai, asyik, dan menghibur)
3. temukanaja (Fokus: Portal/Hub pusat informasi link. Fungsi utamanya HANYA untuk memudahkan member menemukan link login/daftar ke pedang88 dan tuna55, serta berinteraksi via live chat Tawk.to).
4. formpd88 (Fokus: Pusat bantuan dan link pengaduan resmi. Gunakan HANYA ketika topik berkaitan dengan keluhan, masalah teknis, kendala akun, atau layanan pelanggan/customer support).

Setiap kali pengguna memberikan "Topik" atau "Kata Kunci", lakukan langkah berikut:

LANGKAH 1: STRATEGI & PEMILIHAN MEREK
- Analisis niat audiens (search intent) dari topik: {topik}
- Pilih SALAH SATU dari 4 merek di atas yang paling cocok untuk topik tersebut berdasarkan fungsinya.
- Jika topik tentang "kesulitan login" atau "link alternatif", arahkan ke temukanaja dan ingatkan tentang fitur live chat Tawk.to.
- Jika topik tentang "keluhan", "masalah", atau "pengaduan", WAJIB arahkan ke formpd88.

LANGKAH 2: PEMBUATAN KONTEN (E-E-A-T)
- Buat kerangka artikel SEO yang padat dan informatif. 
- Buat copywriting sosmed yang memancing interaksi. 
- Aturan Tautan: Pastikan Call-to-Action (CTA) selalu mengarahkan ke merek yang dipilih di Langkah 1 sesuai dengan fungsinya.

LANGKAH 3: DESAIN VISUAL & VIDEO
- Buat 1 "Image Prompt" dalam Bahasa Inggris yang sangat detail untuk AI pembuat gambar (rasio 1:1 Instagram).
- Buat 1 "Video Prompt" dalam Bahasa Inggris untuk AI pembuat video (rasio 9:16 TikTok/Reels durasi 10 detik).

ATURAN OUTPUT MUTLAK:
Output HANYA boleh berupa format JSON yang valid. Tidak boleh ada teks markdown di luar format JSON.
Gunakan struktur key JSON berikut:
{{
  "target_merek": "...",
  "strategi_seo_dan_niat": "...",
  "konten_artikel": {{
    "judul": "...",
    "isi_artikel": "..."
  }},
  "copywriting_sosmed": "...",
  "visual_prompts": {{
    "image_prompt_1x1": "...",
    "video_prompt_9x16": "..."
  }}
}}
"""
    try:
        response = model.generate_content(prompt)
        ai_output = response.text.strip()
        
        # Membersihkan markdown jika ada
        if ai_output.startswith("```json"): ai_output = ai_output[7:-3].strip()
        elif ai_output.startswith("```"): ai_output = ai_output[3:-3].strip()
            
        return json.loads(ai_output)
    except Exception as e:
        print(f"Super Agent Error: {e}")
        return None

def ambil_data_dari_otak():
    # Simulasi pengujian dengan satu studi kasus kata kunci spesifik
    return ["Lupa kata sandi dan gagal login"]

# ====================
# ALUR KERJA (MAIN)
# ====================
def main():
    print("=== Menjalankan Sistem Super Agent AI (Antigraviti) ===")
    topik_spreadsheet = ambil_data_dari_otak()
    
    for topik in topik_spreadsheet:
        print(f"\n[+] Memproses Topik: {topik}")
        
        # Super Agent Bekerja
        print("-> Super Agent sedang memproses dari SEO hingga Desain Visual...")
        hasil = super_agent(topik)
        if hasil:
            print(f"\n[HASIL SUPER AGENT]")
            print(f"Target Merek     : {hasil.get('target_merek', '')}")
            
            print(f"Strategi & Niat  : {hasil.get('strategi_seo_dan_niat', '')}")
            
            konten = hasil.get('konten_artikel', {})
            print(f"Judul Artikel    : {konten.get('judul', '')}")
            
            print(f"\n[Copywriting]\n{hasil.get('copywriting_sosmed', '')}")
            
            visual = hasil.get('visual_prompts', {})
            print(f"\n[Visual Generation]")
            print(f"Prompt IG (1:1)  : {visual.get('image_prompt_1x1', '')}")
            print(f"Prompt TikTok    : {visual.get('video_prompt_9x16', '')}")
            
            # NANTINYA: Hasil JSON ini dikirim ke Google Sheet atau layanan lainnya

if __name__ == "__main__":
    main()