// ==========================================
// 1. MENGAMBIL RAHASIA DARI BRANKAS GOOGLE (AMAN!)
// ==========================================
const SCRIPT_PROPS = PropertiesService.getScriptProperties();
const API_KEY = SCRIPT_PROPS.getProperty('GEMINI_API_KEY'); 
const TELEGRAM_TOKEN = SCRIPT_PROPS.getProperty('TELEGRAM_TOKEN');

const NAMA_SHEET = 'Dashboard_Promosi'; 
const TELEGRAM_CHAT_ID = '6363302207'; // ID Telegram Desainer / Tim

// Database ID Folder Merek (Google Drive)
const FOLDER_ASSETS_ID = {
  "pedang88": "1NsgkUlB7CRu4ucN6JuI4GhNv5SJsEXIq",
  "tuna55": "16p7IUtsJS-GCpSR5OyM71e1h-qQBISQM",
  "temukanaja": "1GvZtWSTpsCvQdxsGYwBj_578l9A93Rc5",
  "formpd88": "1oP11lElIHvhWm3c4HEKEKPwTwlEVuUqp"
};

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('🤖 AEGIS AI')
      .addItem('Jalankan Super Agent', 'jalankanSuperAgent')
      .addToUi();
}

function kirimNotifTelegram(pesan) {
  if(!TELEGRAM_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = { chat_id: TELEGRAM_CHAT_ID, text: pesan, parse_mode: "Markdown" };
  const options = { method: "POST", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
  UrlFetchApp.fetch(url, options);
}

function kirimFotoTelegram(blobGambar, judulMerek) {
  if(!TELEGRAM_TOKEN || !blobGambar) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
  
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    photo: blobGambar,
    caption: `🎨 *[Tugas Desain Baru]*\nDesain kasar/konsep untuk: *${judulMerek}*\n_Bot telah melampirkan konsep AI otomatis yang bisa diperhalus oleh tim kreatif!_`,
    parse_mode: "Markdown"
  };
  const options = {
    method: "POST",
    payload: payload, 
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, options);
}

// ------------------------------------------
// 2. FUNGSI UTAMA AEGIS
// ------------------------------------------
function jalankanSuperAgent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAMA_SHEET);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let topik = data[i][0]; 
    let status = data[i][1]; 
    
    if (topik !== "" && status === "") { 
      kirimNotifTelegram(`⏳ *AEGIS AI BEKERJA*\n\n*Topik:* ${topik}\n_Generasi teks, pembuatan folder, dan menggambar aset desain visual..._`);
      sheet.getRange(i + 1, 2).setValue('Menganalisis & Menggambar...');
      SpreadsheetApp.flush(); 
      
      try {
        let hasilJSON = panggilGeminiTeks(topik); 
        
        if(hasilJSON) {
          const merek = (hasilJSON.target_merek || "").toLowerCase().trim();
          let folderIdTarget = FOLDER_ASSETS_ID[merek];
          let folderLinkUrl = "";
          
          if (folderIdTarget) {
            const folderMerek = DriveApp.getFolderById(folderIdTarget);
            const tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM");
            let topikPendek = topik.substring(0, 35).replace(/[^a-zA-Z0-9 ]/g, ""); 
            const subFolder = folderMerek.createFolder(`[${tanggal}] ${topikPendek}`);
            folderLinkUrl = subFolder.getUrl();
            
            const promptAjaib = `IMAGE PROMPT IG (1:1):\n${hasilJSON.visual_prompts?.image_prompt_1x1}\n\n=======================\nVIDEO PROMPT TIKTOK (9:16):\n${hasilJSON.visual_prompts?.video_prompt_9x16}`;
            subFolder.createFile("Bahan_Prompt_Designer.txt", promptAjaib);
            
            // Generate & Send Image
            try {
              let blobGambar = panggilGeminiGambar(hasilJSON.visual_prompts.image_prompt_1x1, topikPendek);
              if (blobGambar) {
                subFolder.createFile(blobGambar); 
                kirimFotoTelegram(blobGambar, merek.toUpperCase());
              }
            } catch (errGambar) {
               kirimNotifTelegram(`❌ Gagal generate gambar: ${errGambar.message}`);
            }
          }
          
          sheet.getRange(i + 1, 3).setValue(hasilJSON.target_merek || ""); 
          sheet.getRange(i + 1, 4).setValue(hasilJSON.strategi_seo_dan_niat || ""); 
          sheet.getRange(i + 1, 5).setValue(`${hasilJSON.konten_artikel?.judul || ""}\n\n${hasilJSON.konten_artikel?.isi_artikel || ""}`); 
          sheet.getRange(i + 1, 6).setValue(hasilJSON.copywriting_sosmed || ""); 
          sheet.getRange(i + 1, 7).setValue(folderLinkUrl); 
          sheet.getRange(i + 1, 2).setValue('Selesai ✅');
          
          kirimNotifTelegram(`✅ *AEGIS SELESAI*\n\n*Topik:* ${topik}\n📝 Seluruh konten teks & Foto Desain sukses diekspor!\n📁 [Buka Folder Drive](${folderLinkUrl})`);
          SpreadsheetApp.flush();
          
        } else {
          sheet.getRange(i + 1, 2).setValue('Error Format JSON');
        }
      } catch (e) {
        sheet.getRange(i + 1, 2).setValue('Error: ' + e.message);
      }
    }
  }
}

// ------------------------------------------
// 3. MESIN TEKS (GEMINI FLASH)
// ------------------------------------------
function panggilGeminiTeks(topik) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const prompt = `Kamu adalah "Super Agent Digital Marketing & SEO" tingkat ahli. Tugas utamamu adalah meriset tren, menyusun artikel, membuat copywriting media sosial, dan merancang instruksi (prompt) desain visual/video untuk 4 merek bisnis.

PENTING: Jangan pernah menggunakan awalan "http://" atau akhiran ".com". Gunakan nama berikut: pedang88, tuna55, temukanaja, formpd88.

Setiap kali pengguna memberikan "Topik", lakukan:
1. Pilih SALAH SATU dari 4 merek di atas (main=pedang88/tuna55, link alternatif=temukanaja, masalah=formpd88).
2. Buat kerangka artikel SEO dan copywriting sosmed.
3. Buat 1 "Image Prompt" dalam B.Inggris sangat detail (rasio 1:1) dan 1 "Video Prompt" (rasio 9:16).

OUTPUT JSON MURNI:
{
  "target_merek": "...", "strategi_seo_dan_niat": "...",
  "konten_artikel": { "judul": "...", "isi_artikel": "..." },
  "copywriting_sosmed": "...",
  "visual_prompts": { "image_prompt_1x1": "...", "video_prompt_9x16": "..." }
}`;

  const payload = { "contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.7} };
  const response = UrlFetchApp.fetch(url, { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true });
  const result = JSON.parse(response.getContentText());
  
  if (result.error) throw new Error(result.error.message);
  let textOut = result.candidates[0].content.parts[0].text.trim();
  if (textOut.startsWith("```json")) textOut = textOut.substring(7, textOut.length - 3).trim();
  else if (textOut.startsWith("```")) textOut = textOut.substring(3, textOut.length - 3).trim();
  return JSON.parse(textOut);
}

// ------------------------------------------
// 4. MESIN GAMBAR (IMAGEN 3)
// ------------------------------------------
function panggilGeminiGambar(promptInggris, namaTopik) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`;
  const payload = {
    "instances": [{ "prompt": promptInggris }],
    "parameters": { "sampleCount": 1 }
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
