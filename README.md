# Vocentra - Voice & Video AI Call Center

## 🗓️ Otonom Takvim & Asistan Entegrasyonu (Calendar Module)

Bu proje, hem Ultravox (Ses) hem de Anam AI (Video) asistanları için "Single Source of Truth" olan bir Takvim modülü içerir. Asistanlar, web sitenizdeki bu takvim altyapısını kullanarak doğrudan uygunluk kontrolü yapabilir ve randevu oluşturabilir.

### 1. Veritabanı Kurulumu (Supabase)

Supabase projenizde `SQL Editor` bölümüne giderek aşağıdaki tabloyu ve RLS iznini çalıştırın:

```sql
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: RLS disabled for testing. To enable, define your security policies.
```

### 2. Ortam Değişkenleri (Environment Variables)

`.env.local` dosyanızda şu değişkenlerin olduğundan emin olun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # Production'da kendi domain'iniz
TZ=Europe/Istanbul
```

### 3. Local Run Adımları

```bash
npm install
npm run dev
```
Uygulama `localhost:3000` portunda açılacaktır. Anasayfaya indiğinizde "Otonom Takvim Yönetimi" alanını göreceksiniz. Burada manuel test formunu kullanarak randevu ekleyip silebilirsiniz.

### 4. Asistan (Webhook) Kurulumu

Proje klasörünüzdeki `config/assistant-tools/calendar-tools.json` dosyasını inceleyin.

**Ultravox.ai için:**
1. Agent yapılandırma (Configuration) sayfasına gidin.
2. `Tools -> Add Tool -> Custom Tool` kısmına JSON dosyasındaki tanımları kopyalayın.
3. System Prompt'unuza JSON'daki "systemPromptAdditions" kısmını ekleyin.

**Anam.ai için:**
1. Action/Webhook ayarları kısmından her bir endpoint'i (GET availability, POST appointments, POST cancel) ekleyin.
2. Endpoint URL olarak uygulamanızın public dışa açık adresini (ngrok vs.) girin.

### 5. API'leri Test Etmek (cURL Örnekleri)

**Uygunluk Kontrolü (Availability)**
```bash
curl -X GET "http://localhost:3000/api/calendar/availability?date=2025-10-15&durationMin=30"
```

**Randevu Oluşturma (Create Booking)**
```bash
curl -X POST http://localhost:3000/api/calendar/appointments \
-H "Content-Type: application/json" \
-d '{
  "customer_name": "Kaan Test",
  "phone": "+905554443322",
  "start_time": "2025-10-15T10:00:00.000Z",
  "duration_min": 30,
  "notes": "Voice AI Test"
}'
```

**Randevu İptali (Cancel Booking)**
```bash
curl -X POST http://localhost:3000/api/calendar/cancel \
-H "Content-Type: application/json" \
-d '{
  "appointment_id": "<APPOINTMENT_ID_BURAYA>"
}'
```

### 6. Test Senaryoları (Acceptance Criteria)
1. **Çakışma Kontrolü:** İki sekme açın. Aynı saate (örn 15:00) manuel test formundan randevu almaya çalışın. İkincisinde `Slot is already booked` (409) hatası almanız gerekir.
2. **Asistan ile Canlı Test (Ultravox):** Asistana "Bana yarın için randevu oluştur" deyin. Uygun saatleri okumasını, birini seçtiğinizde adınızı vermenizi ve randevuyu onaylamasını bekleyin.
3. **Gerçek Zamanlı UI Güncellemesi:** Anasayfadaki Calendar modülü her 10 saniyede bir poll yapar. Asistan konuşurken veya işlem tamamlandığında sekmede randevunun belirdiğini doğrulayın.