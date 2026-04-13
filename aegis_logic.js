// ==========================================
// 1. MENGAMBIL RAHASIA DARI BRANKAS GOOGLE (AMAN!)
// ==========================================
const SCRIPT_PROPS = PropertiesService.getScriptProperties();
const API_KEY = SCRIPT_PROPS.getProperty('GEMINI_API_KEY'); 
const TELEGRAM_TOKEN = SCRIPT_PROPS.getProperty('TELEGRAM_TOKEN');
const WEBHOOK_URL = SCRIPT_PROPS.getProperty('WEBHOOK_URL'); // URL Web App Anda nanti

const NAMA_SHEET = 'Dashboard_Promosi'; 
const TELEGRAM_CHAT_ID = '6363302207'; // ID Telegram Desainer / Tim

// Database ID Folder Merek (Google Drive)
const FOLDER_ASSETS_ID = {
  "pedang88": "1NsgkUlB7CRu4ucN6JuI4GhNv5SJsEXIq",
  "tuna55": "16p7IUtsJS-GCpSR5OyM71e1h-qQBISQM",
  "temukanaja": "1GvZtWSTpsCvQdxsGYwBj_578l9A93Rc5",
  "formpd88": "1oP11lElIHvhWm3c4HEKEKPwTwlEVuUqp"
};

// ==========================================
// FUNGSI DEBUGGING KHUSUS
// ==========================================
function TES_TELEGRAM() {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = { chat_id: TELEGRAM_CHAT_ID, text: "Uji Coba Tembakan Langsung dari Server Google! 🚀", parse_mode: "HTML" };
  const options = { method: "POST", contentType: "application/json", payload: JSON.stringify(payload) }; // Tanpa mute agar error merah muncul
  
  const response = UrlFetchApp.fetch(url, options);
  SpreadsheetApp.getUi().alert("Hasil Tes Telegram: " + response.getContentText());
}

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('🤖 AEGIS AI')
      .addItem('Jalankan Super Agent', 'jalankanSuperAgent')
      .addSeparator()
      .addItem('Pasang Penghubung Telegram (Set Webhook)', 'setWebhookBot')
      .addToUi();
}

// ------------------------------------------
// FITUR BARU: TELEGRAM WEBHOOK (INPUT DARI CHAT)
// ------------------------------------------
function setWebhookBot() {
  if(!WEBHOOK_URL || WEBHOOK_URL === "") {
    SpreadsheetApp.getUi().alert("GAGAL: Anda belum memasukkan WEBHOOK_URL di Script Properties!");
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const response = UrlFetchApp.fetch(url);
  SpreadsheetApp.getUi().alert("Status Pemasangan Webhook: " + response.getContentText());
}

// Fungsi pintu masuk dari Telegram
function doPost(e) {
  if(e.postData.type == "application/json") {
    let data = JSON.parse(e.postData.contents);
    if(data.message && data.message.text) {
      let textUser = data.message.text;
      let chatId = data.message.chat.id;
      
      // MODE DEBUG/CEK ID: Membantu mengecek ID Chat Anda
      if(textUser === "/cekid") {
        kirimNotifTelegram(`🆔 ID Chat Anda saat ini adalah:\n\n${chatId}\n\nMasukkan angka ini ke TELEGRAM_CHAT_ID di baris 9 kode Anda!`, chatId);
        return ContentService.createTextOutput("OK");
      }

      // Keamanan Ekstra: Hanya merespons dari chat Anda saja
      if(chatId.toString() !== TELEGRAM_CHAT_ID) {
        kirimNotifTelegram(`⛔ AKSES DITOLAK!\n\nMaaf, Anda bukan otoritas sistem ini.\n\n(ID Anda: ${chatId} tidak cocok dengan sistem. Jika ini benar Anda, silakan ubah \`const TELEGRAM_CHAT_ID\` di skrip dengan angka ini!)`, chatId);
        return ContentService.createTextOutput("OK");
      }
      
      // Abaikan perintah bawaan /start
      if(textUser.startsWith("/start")) {
        kirimNotifTelegram("🤖 <b>Halo Bos!</b> Saya AEGIS. Silakan ketikkan instruksi topik atau masalah dan saya akan langsung memprosesnya ke sistem Sheet.");
        return ContentService.createTextOutput("OK");
      }
      
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAMA_SHEET);
      if(!sheet) return ContentService.createTextOutput("Sheet err");
      
      // Masukkan ke Sheet
      sheet.appendRow([textUser, "Menunggu Antrean Robot... ⏱️"]);
      
      // Kirim konfirmasi penerimaan awal ke chat
      kirimNotifTelegram(`📥 <b>Instruksi Diterima!</b>\n\nTopik Anda: <i>"${textUser}"</i> telah dimasukkan ke sistem Spreadsheet.\n\n<i>Agent sedang dipanaskan untuk meriset artikel & mendesain 3D... Mohon tunggu otomatisasinya selesai.</i>`);
      
      // PICU MESIN BEKERJA OTOMATIS:
      // Karena Telegram tidak boleh dibiarkan menunggu, kita panggil trigger 1 detik.
      try {
        ScriptApp.newTrigger('jalankanDariTelegram')
                 .timeBased()
                 .after(1000) 
                 .create();
      } catch (triggerError) {
         // JIKA ERROR (Trigger Penuh), ABAIKAN! 
         // Karena sekarang Anda sudah punya Pemicu_AutoPilot_Berkala, 
         // agen tetap akan mengeksekusinya dalam beberapa menit ke depan secara otomatis!
      }
               
      return ContentService.createTextOutput("OK");
    }
  }
}

// ------------------------------------------
// 2. FUNGSI UTAMA AEGIS
// ------------------------------------------
function kirimNotifTelegram(pesan, targetChatId = TELEGRAM_CHAT_ID) {
  if(!TELEGRAM_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = { chat_id: targetChatId.toString(), text: pesan, parse_mode: "HTML" };
  const options = { method: "POST", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
  UrlFetchApp.fetch(url, options);
}

function kirimFotoTelegram(blobGambar, judulMerek, rasio, targetChatId = TELEGRAM_CHAT_ID) {
  if(!TELEGRAM_TOKEN || !blobGambar) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
  
  const payload = {
    chat_id: targetChatId.toString(),
    photo: blobGambar,
    caption: `🎨 <b>[Tugas Desain: Ukuran ${rasio}]</b>\nKonsep Visual Merek: <b>${judulMerek}</b>`,
    parse_mode: "HTML"
  };
  const options = {
    method: "POST",
    payload: payload, 
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, options);
}

function jalankanSuperAgent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAMA_SHEET);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let topik = data[i][0]; 
    let status = data[i][1]; 
    
    // Proses semua baris yang kosong atau ada status "Menunggu Antrean Robot..." dari Telegram
    if (topik !== "" && (status === "" || status.includes("Menunggu"))) { 
      // Update UI
      sheet.getRange(i + 1, 2).setValue('Menganalisis & Menggambar...');
      SpreadsheetApp.flush(); 
      
      try {
        let hasilJSON = panggilGeminiTeks(topik); 
        
        if(hasilJSON) {
          const merek = (hasilJSON.target_merek || "").toLowerCase().trim();
          let folderIdTarget = FOLDER_ASSETS_ID[merek] || FOLDER_ASSETS_ID["temukanaja"];
          let folderLinkUrl = "";
          
          if (folderIdTarget) {
            const folderMerek = DriveApp.getFolderById(folderIdTarget);
            const tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM");
            let topikPendek = topik.substring(0, 35).replace(/[^a-zA-Z0-9 ]/g, ""); 
            const subFolder = folderMerek.createFolder(`[${tanggal}] ${topikPendek}`);
            folderLinkUrl = subFolder.getUrl();
            
            const promptAjaib = `IMAGE PROMPT IG (1:1):\n${hasilJSON.visual_prompts?.image_prompt_1x1}\n\n=======================\nVIDEO PROMPT TIKTOK (9:16):\n${hasilJSON.visual_prompts?.video_prompt_9x16}`;
            subFolder.createFile("Bahan_Prompt_Designer.txt", promptAjaib);
            
            // FASE GAMBAR (IMAGEN 3) - LOOP 3 UKURAN SOSMED
            const daftarRasio = ["1:1", "9:16", "16:9"];
            
            daftarRasio.forEach(rasio => {
              try {
                let namaFileBase = topikPendek.replace(/\s+/g, '_');
                let promptUtama = hasilJSON.visual_prompts?.image_prompt_1x1;
                
                let blobGambar = panggilGeminiGambar(promptUtama, namaFileBase, rasio);
                if (blobGambar) {
                  blobGambar.setName(`Desain_${rasio.replace(":", "x")}_${namaFileBase}.jpeg`);
                  subFolder.createFile(blobGambar); 
                  kirimFotoTelegram(blobGambar, merek.toUpperCase(), rasio);
                }
              } catch (errGambar) {
                 kirimNotifTelegram(`❌ Gagal generate gambar rasio ${rasio}: ${errGambar.message}`);
              }
            });
          }
          
          sheet.getRange(i + 1, 3).setValue(hasilJSON.target_merek || ""); 
          sheet.getRange(i + 1, 4).setValue(hasilJSON.strategi_seo_dan_niat || ""); 
          sheet.getRange(i + 1, 5).setValue(`${hasilJSON.konten_artikel?.judul || ""}\n\n${hasilJSON.konten_artikel?.isi_artikel || ""}`); 
          sheet.getRange(i + 1, 6).setValue(hasilJSON.copywriting_sosmed || ""); 
          sheet.getRange(i + 1, 7).setValue(folderLinkUrl); 
          sheet.getRange(i + 1, 2).setValue('Eksekusi Agent Selesai ✅');
          
          // Kirim Hasil Akhir Ke Telegram
          kirimNotifTelegram(`✅ <b>MISI AEGIS SELESAI!</b>\n\n<b>Topik:</b> ${topik}\n\nMerek ideal: <b>${merek.toUpperCase()}</b>.\nKonten Teks & Folder selesai!\n\n📁 <a href="${folderLinkUrl}">Buka Folder Drive</a>`);
          SpreadsheetApp.flush();
          
        } else {
          sheet.getRange(i + 1, 2).setValue('Error Format JSON');
        }
      } catch (e) {
        sheet.getRange(i + 1, 2).setValue('Error: ' + e.message);
      }
    }
  }
  
  // Membersihkan sampah pemicu (trigger) otomatis Telegram agar tidak menumpuk (Trigger autopilot tidak akan dihapus)
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if(trigger.getHandlerFunction() === 'jalankanDariTelegram') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

// ------------------------------------------
// 3. MESIN TEKS (GEMINI FLASH)
// ------------------------------------------
function panggilGeminiTeks(topik) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const prompt = `Kamu adalah "Super Agent Digital Marketing & SEO" tingkat ahli. Tugas utamamu adalah meriset tren, menyusun artikel, membuat copywriting media sosial, dan merancang instruksi (prompt) desain visual/video untuk 4 merek bisnis.

PENTING: Jangan pernah menggunakan awalan "http://" atau akhiran ".com". Gunakan nama berikut: pedang88, tuna55, temukanaja, formpd88.

Setiap kali pengguna memberikan "Topik", lakukan:
1. ANALISIS MEREK: Jika topik secara eksplisit menyebut merek tertentu (contoh: "tuna55" atau "pedang88"), Anda WAJIB menjadikan merek tersebut sebagai opsi tunggal "target_merek"!! Jangan pernah membelot ke pedang88 jika user meminta tuna55.
2. Buat kerangka artikel SEO dan copywriting sosmed.
3. Buat 1 "Image Prompt" (Bahasa Inggris) SANGAT DETAIL untuk AI gambar. WAJIB pakai gaya: "cool modern 3D, hyper-realistic, vibrant glowing lighting, cinematic". WAJIB berikan instruksi merender teks logo misal: 'with a prominent 3D glowing text that says "[NAMA MEREK]"'. Sesuaikan PALET WARNA berdasarkan merek:
   - Pedang88: Background Hijau Tua (Dark Green) dengan teks/aksen Kuning Emas (Yellow/Gold) yang elegan.
   - Tuna55: Background gelap dengan header Merah gelap (Dark Red) dipadukan teks/aksen Biru Elektrik (Electric Blue) dan Putih bersinar.
   - Temukanaja: Desain UI minimalis ber-background Hijau Tua (Dark Green) pekat dengan tombol/aksen Kuning (Yellow) terang.
   - Formpd88: Profesional UI dengan background Hijau Tua (Dark Green) dan garis/teks panduan berwarna Kuning Emas (Yellow/Gold).
4. Buat 1 "Video Prompt" (rasio 9:16).

OUTPUT JSON MURNI:
{
  "target_merek": "...", "strategi_seo_dan_niat": "...",
  "konten_artikel": { "judul": "...", "isi_artikel": "..." },
  "copywriting_sosmed": "...",
  "visual_prompts": { "image_prompt_1x1": "...", "video_prompt_9x16": "..." }
}`;

  const payload = { 
    "contents": [{"parts": [{"text": prompt}]}], 
    "generationConfig": {
      "temperature": 0.7,
      "responseMimeType": "application/json"
    } 
  };
  const response = UrlFetchApp.fetch(url, { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true });
  const result = JSON.parse(response.getContentText());
  
  if (result.error) throw new Error(result.error.message);
  let textOut = result.candidates[0].content.parts[0].text.trim();
  
  // Deteksi blok JSON menggunakan penelusuran kurung kurawal
  const jsonMatch = textOut.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  } else {
    throw new Error("Gagal menemukan format JSON di balasan Gemini.");
  }
}

// ------------------------------------------
// 4. MESIN GAMBAR (IMAGEN 3)
// ------------------------------------------
function panggilGeminiGambar(promptInggris, namaTopik, aspectRatio = "1:1") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`;
  const payload = {
    "instances": [{ "prompt": promptInggris }],
    "parameters": { "sampleCount": 1, "aspectRatio": aspectRatio }
  };
  
  const options = {
    "method" : "post",
    "contentType": "application/json",
    "payload" : JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const jsonResponse = JSON.parse(response.getContentText());
  
  if (jsonResponse.error) throw new Error(jsonResponse.error.message);
  
  const kepinganBase64 = jsonResponse.predictions[0].bytesBase64Encoded;
  const decodeBytes = Utilities.base64Decode(kepinganBase64);
  const blob = Utilities.newBlob(decodeBytes, 'image/jpeg', `Desain_${namaTopik.replace(/\s+/g, '_')}.jpeg`);
  
  return blob;
}

// ------------------------------------------
// 5. PEMICU AUTO-PILOT & TELEGRAM
// ------------------------------------------
function jalankanDariTelegram() {
  jalankanSuperAgent();
}

function Pemicu_AutoPilot_Berkala() {
  jalankanSuperAgent();
}
