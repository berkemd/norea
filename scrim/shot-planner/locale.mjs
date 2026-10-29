import { cards, summary, validate, FIELDS, LABELS } from "./model.mjs";
const TR = {
  "Product Photography Shot List Planner — Free, Printable | Scrim":
    "Ürün Fotoğrafı Çekim Listesi — Ücretsiz ve Yazdırılabilir | Scrim",
  "Skip to planner": "Planlayıcıya geç",
  SCRIM: "SCRIM",
  "How to repeat a shoot": "Aynı çekimi tekrarla",
  Support: "Destek (İngilizce)",
  "FREE TOOL · NO ACCOUNT": "ÜCRETSİZ ARAÇ · HESAP GEREKMEZ",
  "Product photography": "Ürün fotoğrafı",
  "shot list planner.": "çekim planlayıcısı.",
  "Cover the shots you need. Record the setup you want to repeat. Take a clear checklist to your next catalogue shoot.":
    "Gereken çekimleri belirle. Tekrarlamak istediğin kurulumu kaydet. Sonraki katalog çekimine açık bir kontrol listesiyle git.",
  "Works with your own camera. This planner does not take or measure photos. Your entries stay in this page; nothing is uploaded or saved automatically. Export a file before closing.":
    "Kendi kameranla kullan. Bu planlayıcı fotoğraf çekmez veya ölçmez. Girdilerin bu sayfada kalır; hiçbir şey yüklenmez veya otomatik kaydedilmez. Kapatmadan önce dosyanı dışa aktar.",
  "Enable JavaScript to build and export a plan. The repeat-shoot guide below also works without JavaScript.":
    "Plan oluşturmak ve dışa aktarmak için JavaScript’i etkinleştir. Aşağıdaki tekrar çekim rehberi JavaScript olmadan da okunabilir.",
  "1. Build the shot list": "1. Çekim listesini oluştur",
  "Shoot name": "Çekim adı",
  "Products — one name or SKU per line":
    "Ürünler — her satıra bir ad veya stok kodu",
  "1–20 different products. Up to 80 characters per name.":
    "1–20 farklı ürün. Her ad en fazla 80 karakter.",
  "Shots needed for each product": "Her ürün için gereken çekimler",
  Hero: "Ana görünüm",
  Detail: "Ayrıntı",
  Scale: "Boyut karşılaştırması",
  Packaging: "Ambalaj",
  "Add setup notes for your next shoot (optional)":
    "Sonraki çekim için kurulum notu ekle (isteğe bağlı)",
  "Optional notes. Use your actual settings and measurements; no exposure values are guessed.":
    "Notlar isteğe bağlıdır. Gerçek ayar ve ölçümlerini kullan; pozlama değerleri tahmin edilmez.",
  "Camera & lens": "Kamera ve objektif",
  "Camera position & distance": "Kamera konumu ve mesafe",
  "Light position & modifier": "Işığın konumu ve ışık şekillendirici",
  "Background & product marks": "Arka plan ve ürün yerleşim işaretleri",
  "White balance reference": "Beyaz dengesi referansı",
  "Exposure notes": "Pozlama notları",
  "Delivery crop & size": "Teslim kırpması ve boyutu",
  "Shoot notes": "Çekim notları",
  "Build plan": "Planı oluştur",
  "Try an example": "Örneği dene",
  "Building a changed plan resets its completion marks. Export your current plan first if you need to keep them.":
    "Değişen bir planı oluşturmak tamamlanma işaretlerini sıfırlar. İşaretleri korumak istiyorsan önce mevcut planını dışa aktar.",
  "Return to a previous shoot": "Önceki çekime dön",
  "Open a saved shot plan (.json)": "Kaydedilmiş çekim planını aç (.json)",
  "Replace with this plan": "Bu planla değiştir",
  "Cancel import": "İçe aktarmayı iptal et",
  "Your shoot plan": "Çekim planın",
  "Add your products or try the example. Your numbered shot checklist will appear here.":
    "Ürünlerini ekle veya örneği dene. Numaralı çekim listen burada görünecek.",
  "Next: check the frame before you shoot":
    "Sıradaki adım: çekimden önce kadrajı kontrol et",
  "Keep this checklist open. On your iPhone or iPad, Scrim can check highlight clipping and horizon tilt in a live preview. This web plan does not import into the app.":
    "Bu listeyi açık tut. Scrim, iPhone veya iPad’de canlı önizlemedeki patlayan parlak alanları ve ufuk eğimini kontrol edebilir. Bu web planı uygulamaya aktarılamaz.",
  "Check the frame with Scrim": "Kadrajı Scrim ile kontrol et",
  "Free download. Optional in-app subscription; see local terms in the App Store. Export your plan below before leaving this page.":
    "İndirmesi ücretsizdir. Uygulama içi abonelik isteğe bağlıdır; yerel koşulları App Store’da gör. Sayfadan ayrılmadan önce aşağıdan planını dışa aktar.",
  "Export reusable file": "Yeniden kullanılabilir dosyayı indir",
  "Copy checklist": "Listeyi kopyala",
  "Print / Save PDF": "Yazdır / PDF kaydet",
  "Export includes your setup, products, notes and completion marks. Only share it with people you choose.":
    "Dışa aktarılan dosya kurulumunu, ürünlerini, notlarını ve tamamlanma işaretlerini içerir. Yalnızca seçtiğin kişilerle paylaş.",
  "How to repeat a product photo shoot":
    "Ürün fotoğrafı çekimini nasıl tekrarlarsın?",
  "Plan the views": "Görünümleri planla",
  "A hero shot shows the whole item. Detail shots explain texture and finish. Scale and packaging views answer different buying questions. Choose the views your listing needs, rather than adding duplicates.":
    "Ana görünüm ürünün tamamını gösterir. Ayrıntı çekimleri dokuyu ve yüzeyi açıklar. Boyut karşılaştırması ve ambalaj çekimleri farklı satın alma sorularını yanıtlar. Aynı kareyi çoğaltmak yerine ilanın için gerekli görünümleri seç.",
  "Record the setup": "Kurulumu kaydet",
  "Note the camera height and distance, product position, background and light placement. Keep an actual reference image in your own files. A text plan is a reminder, not a substitute for that image.":
    "Kamera yüksekliğini ve mesafesini, ürünün yerini, arka planı ve ışığın konumunu not et. Gerçek bir referans fotoğrafını kendi dosyalarında sakla. Metin planı hatırlatıcıdır; o fotoğrafın yerini tutmaz.",
  "Check before the batch": "Seriye başlamadan kontrol et",
  "Make a test image with your camera. Compare framing, reflections, colour and crop with your reference. Daylight can change between sessions; matching the notes alone does not guarantee a visual match.":
    "Kameranla bir deneme fotoğrafı çek. Kadrajı, yansımaları, rengi ve kırpmayı referansınla karşılaştır. Gün ışığı çekimler arasında değişebilir; yalnızca notları eşleştirmek aynı görünümü garanti etmez.",
  "Reuse the plan": "Planı yeniden kullan",
  "Export the JSON file, keep it with your reference image, then open it here next time. Clear the completion marks to start a new batch while retaining the same shot list and setup.":
    "JSON dosyasını indir, referans fotoğrafınla birlikte sakla ve sonraki çekimde burada aç. Aynı çekim listesini ve kurulumu koruyarak yeni bir seriye başlamak için tamamlanma işaretlerini temizle.",
  "Clear completion marks for a new batch":
    "Yeni seri için tamamlanma işaretlerini temizle",
  "NEXT: CHECK THE FRAME": "SIRADAKİ ADIM: KADRAJI KONTROL ET",
  "Take the plan to your camera.": "Planı kameranın yanına al.",
  "Scrim for iPhone and iPad checks highlight clipping and horizon tilt in a live preview. It does not capture the photo or set your camera’s exposure. The free app keeps one scene; optional Pro adds saved-scene workflows. This web plan does not import into the app.":
    "iPhone ve iPad için Scrim, canlı önizlemede patlayan parlak alanları ve ufuk eğimini kontrol eder. Fotoğrafı çekmez veya kameranın pozlamasını ayarlamaz. Ücretsiz uygulama bir sahne saklar; isteğe bağlı Pro, kayıtlı sahne iş akışları ekler. Bu web planı uygulamaya aktarılamaz.",
  "View Scrim on the App Store": "Scrim’i App Store’da gör",
  "Free download. Optional in-app subscription; view local terms in the store.":
    "İndirmesi ücretsizdir. Uygulama içi abonelik isteğe bağlıdır; yerel koşulları mağazada gör.",
  "Made by": "Geliştiren:",
  Norea: "Norea",
  "·": "·",
  "App privacy": "Uygulama gizliliği (İngilizce)",
  "· This tool uses no analytics, cookies or photo uploads.":
    "· Bu araç analiz hizmeti, çerez veya fotoğraf yükleme kullanmaz.",
  "Build a product photography shot list with hero, detail, scale and packaging shots. Record a repeatable setup, print your checklist and reuse it next shoot. Free, no account.":
    "Ürün fotoğrafları için ana görünüm, ayrıntı, boyut ve ambalaj çekimlerini planla. Kurulumu kaydet, listeyi yazdır ve sonraki çekimde kullan. Ücretsiz; hesap gerekmez.",
  website: "website",
  "A repeatable product shoot starts with a shot plan":
    "Tekrarlanabilir ürün çekimi bir planla başlar",
  "A free product photography checklist with reusable camera, light and framing notes.":
    "Kamera, ışık ve kadraj notlarını yeniden kullanabileceğin ücretsiz ürün fotoğrafı çekim listesi.",
  Main: "Ana menü",
  "October ceramics catalogue": "Ekim seramik kataloğu",
  "Blue mug, 250 ml\nSand bowl, medium":
    "Mavi kupa, 250 ml\nKum rengi kase, orta",
  "Camera model, lens, focal length": "Kamera modeli, objektif, odak uzaklığı",
  "Tripod height, angle, distance to product":
    "Tripod yüksekliği, açı, ürüne uzaklık",
  "Window or lamp position; diffuser; reflector":
    "Pencere veya lamba konumu; difüzör; reflektör",
  "Backdrop, table height, placement marks":
    "Arka fon, masa yüksekliği, yerleşim işaretleri",
  "Recorded camera setting or reference used":
    "Kayıtlı kamera ayarı veya kullanılan referans",
  "Your tested settings; note any limits":
    "Denediğin ayarlar; varsa sınırları not et",
  "Square shop listing; leave space above handle":
    "Kare mağaza ilanı; kulbun üstünde boşluk bırak",
  "Reflections to watch; views still needed":
    "Dikkat edilecek yansımalar; eksik görünümler",
  "Not recorded": "Kaydedilmedi",
  None: "Yok",
  "Show the whole product. Leave room for the intended crop.":
    "Ürünün tamamını göster. Hedef kırpma için boşluk bırak.",
  "Show the material, finish or feature a buyer needs to inspect.":
    "Alıcının incelemesi gereken malzemeyi, yüzeyi veya özelliği göster.",
  "Use a familiar, appropriate size reference. Keep it consistent.":
    "Bilinen ve uygun bir boyut referansı kullan. Aynı referansı koru.",
  "Show what is included. Remove items that are not part of the purchase.":
    "Satın almaya dahil olanları göster. Dahil olmayan nesneleri kaldır.",
  "Plan built. Export a file to keep it for your next shoot.":
    "Plan oluşturuldu. Sonraki çekimde kullanmak için dosyanı indir.",
  "Replace the current entries with an example? Export your existing plan first if needed.":
    "Mevcut girdiler örnekle değiştirilsin mi? Gerekiyorsa önce mevcut planını indir.",
  "Ceramics catalogue — example": "Seramik kataloğu — örnek",
  "Blue mug, 250 ml": "Mavi kupa, 250 ml",
  "Sand bowl, medium": "Kum rengi kase, orta",
  "Your camera and lens": "Kameran ve objektifin",
  "Record measured tripod height and distance":
    "Ölçtüğün tripod yüksekliğini ve mesafeyi kaydet",
  "Record window direction and reflector placement":
    "Pencerenin yönünü ve reflektörün konumunu kaydet",
  "Neutral backdrop; mark product centre":
    "Nötr arka fon; ürünün merkezini işaretle",
  "Record the setting used for the reference image":
    "Referans fotoğrafı için kullanılan ayarı kaydet",
  "Record your tested camera settings": "Denediğin kamera ayarlarını kaydet",
  "Square listing; leave space around the item":
    "Kare ilan; ürünün çevresinde boşluk bırak",
  "Example only. Replace these notes with your actual setup.":
    "Yalnızca örnektir. Bu notları gerçek kurulumunla değiştir.",
  "Example loaded. Replace it with your own products and settings.":
    "Örnek yüklendi. Kendi ürünlerin ve ayarlarınla değiştir.",
  "Choose a shot plan file smaller than 32 KB.":
    "32 KB’den küçük bir çekim planı dosyası seç.",
  "The plan changed while the file was opening. Choose the file again.":
    "Dosya açılırken plan değişti. Dosyayı yeniden seç.",
  "Saved plan checked. Confirm below the file field to replace your entries.":
    "Kayıtlı plan kontrol edildi. Girdilerini değiştirmek için dosya alanının altındaki düğmeyle onayla.",
  "Current entries are unchanged.": "Mevcut girdiler değişmedi.",
  "Saved plan opened, including its completion marks.":
    "Kayıtlı plan, tamamlanma işaretleriyle birlikte açıldı.",
  "Import cancelled. Current entries are unchanged.":
    "İçe aktarma iptal edildi. Mevcut girdiler değişmedi.",
  "Entries changed. Build the plan again before exporting these edits.":
    "Girdiler değişti. Bu değişiklikleri indirmeden önce planı yeniden oluştur.",
  "Build a plan first.": "Önce bir plan oluştur.",
  "Download prepared. Keep the JSON file with your reference image for next time.":
    "İndirme hazırlandı. JSON dosyasını sonraki çekim için referans fotoğrafınla sakla.",
  "Checklist copied. Paste it into your own notes or message.":
    "Liste kopyalandı. Kendi notlarına veya mesajına yapıştır.",
  "Copy failed. Export the file or print your plan instead.":
    "Kopyalanamadı. Bunun yerine dosyayı indir veya planı yazdır.",
  "Completion marks cleared. The shot list and setup are unchanged.":
    "Tamamlanma işaretleri temizlendi. Çekim listesi ve kurulum değişmedi.",
  "Use a Scrim shot plan version 1 file.":
    "Scrim çekim planının 1. sürümündeki bir dosyayı kullan.",
  "Give the shoot a name (up to 100 characters).":
    "Çekime bir ad ver (en fazla 100 karakter).",
  "Add 1–20 product names, up to 80 characters each.":
    "Her biri en fazla 80 karakter olan 1–20 ürün adı ekle.",
  "Give each product a different name or SKU.":
    "Her ürüne farklı bir ad veya stok kodu ver.",
  "Choose at least one of the four shot types.":
    "Dört çekim türünden en az birini seç.",
  "Setup notes must be text, up to 200 characters per field.":
    "Kurulum notları metin olmalı; her alan en fazla 200 karakter olabilir.",
  "Shoot notes must be text, up to 600 characters.":
    "Çekim notları metin olmalı ve 600 karakteri geçmemeli.",
  "The completed shots do not match this plan.":
    "Tamamlanan çekimler bu planla eşleşmiyor.",
  "This file is not valid JSON. Your current plan is unchanged.":
    "Bu dosya geçerli JSON değil. Mevcut planın değişmedi.",
};
export function createLocale(language) {
  const turkish = language === "tr";
  const t = (value) => (turkish ? (TR[value] ?? value) : value);
  const viewCards = (plan) =>
    cards(plan).map((card) => ({
      ...card,
      label: t(card.label),
      prompt: t(card.prompt),
    }));
  const viewSummary = (plan) => {
    if (!turkish) return summary(plan);
    const p = validate(plan);
    return [
      `${p.title} — Scrim çekim planı`,
      "",
      ...FIELDS.map(
        (k, i) => `${t(LABELS[i])}: ${p.setup[k] || t("Not recorded")}`,
      ),
      "",
      ...viewCards(p).map(
        (c, i) =>
          `${p.completed.includes(c.id) ? "[x]" : "[ ]"} ${i + 1}. ${c.product} — ${c.label}\n    ${c.prompt}`,
      ),
      "",
      `Çekim notları: ${p.notes || "Yok"}`,
      "",
      "Tekrar çekim: kurulumu notlarınla eşleştir, bir deneme fotoğrafı çek, referansınla karşılaştır ve yeni seriye başla.",
      "Scrim’in ücretsiz çekim planlayıcısı: https://berkemd.github.io/norea/scrim/shot-planner/tr/",
    ].join("\n");
  };
  return {
    t,
    cards: viewCards,
    summary: viewSummary,
    progress: (done, total) =>
      turkish
        ? `${total} çekimin ${done} tanesi tamamlandı.`
        : `${done} of ${total} shots marked complete.`,
    notes: (value) =>
      turkish ? `Çekim notları: ${value}` : `Shoot notes: ${value}`,
    importDescription: (p) =>
      turkish
        ? `“${p.title}” açılsın mı? ${p.products.length} ürün, ${cards(p).length} çekim. Mevcut girdiler yalnızca onayladığında değişir.`
        : `Open “${p.title}”: ${p.products.length} products, ${cards(p).length} shots. Your current entries will be replaced only when you confirm.`,
  };
}
