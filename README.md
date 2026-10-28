# nahitferhat.com

Nahit Ferhat Ektaş'ın kişisel sitesi: Türkçe/İngilizce makaleler, "Hakkımda" sayfası, e-posta bülteni ve yönetim paneli.

**Teknolojiler:** Next.js 15 · Tailwind CSS 4 · Prisma 7 + PostgreSQL (Neon) · Tiptap editör · Resend · Vercel Blob

## Sayfalar

| Adres | Ne var |
| --- | --- |
| `/` · `/en` | Ana sayfa: tanıtım, son yazılar, abonelik formu |
| `/blog` · `/en/blog` | Tüm yazılar |
| `/blog/<adres>` | Yazı sayfası (varsa diğer dildeki çevirisine link) |
| `/about` · `/en/about` | Hakkımda |
| `/admin` | Yönetim paneli (girişe yönlendirir) |

Türkçe varsayılan dildir ve kök dizinde yaşar; İngilizce sayfalar `/en` altındadır. `/tr/...` adresleri otomatik olarak `/...` adresine yönlendirilir.

## Lokal geliştirme

Gerekenler: Node.js 20+, Docker.

```bash
npm install
cp .env.example .env          # AUTH_SECRET için: openssl rand -base64 32
npm run db:up                 # lokal Postgres (port 5433)
npx prisma migrate dev        # tabloları oluşturur
npm run admin:create -- sen@ornek.com "en-az-10-karakterli-sifre"
npm run dev                   # http://localhost:3000
```

- `RESEND_API_KEY` boşken mailler gönderilmez, terminale yazılır (onay ve abonelikten çıkma linkleriyle birlikte).
- `BLOB_READ_WRITE_TOKEN` boşken yüklenen resim/videolar `public/uploads` klasörüne kaydedilir.

## Yönetim paneli

- **Yazılar:** Başlık, dil, adres, özet, kapak görseli, etiketler. Editörde başlıklar, yazı boyutu, kalın/italik/altı çizili, **yazı ve vurgu rengi**, hizalama, listeler, alıntı, kod, link, **resim ve video yükleme**, **YouTube** var. Resimleri yapıştırarak ya da sürükleyerek de ekleyebilirsin.
- **Çeviri bağlama:** Bir yazıyı diğer dildeki karşılığına bağlarsan okuyucular iki dil arasında geçiş yapabilir.
- **Abonelere bildir:** Yayındaki bir yazı için "Yazılar" listesindeki butona basınca o dili seçmiş onaylı abonelerin hepsine mail gider. Her yazı için yalnızca bir kez gönderilir.
- **Hakkımda:** Profil fotoğrafı, unvan, tanıtım metni ve iki dilde zengin içerikli biyografi, linkler.
- **Aboneler:** Liste ve silme. Abonelik çift onaylıdır (ziyaretçi mailindeki linke tıklayarak onaylar); her mailde abonelikten çıkma linki vardır.

## Canlıya çıkış (Vercel + Neon + Resend)

1. **Kodu GitHub'a yükle** (özel repo olabilir).
2. **Neon:** [neon.tech](https://neon.tech) üzerinde proje oluştur, bağlantı adresini (`postgresql://...?sslmode=require`) kopyala.
3. **Vercel:** Repoyu içe aktar. *Storage → Blob* ile bir Blob deposu oluşturup projeye bağla (`BLOB_READ_WRITE_TOKEN` otomatik eklenir).
4. **Ortam değişkenleri** (Vercel → Settings → Environment Variables):
   - `DATABASE_URL`: Neon adresi
   - `AUTH_SECRET`: `openssl rand -base64 32` çıktısı
   - `SITE_URL`: `https://nahitferhat.com`
   - `RESEND_API_KEY`, `MAIL_FROM` (örn. `Nahit Ferhat Ektaş <bulten@nahitferhat.com>`)
5. **Deploy et.** `vercel-build` betiği veritabanı migration'larını otomatik çalıştırır.
6. **Admin hesabı:** Lokalde `.env` içindeki `DATABASE_URL`'i geçici olarak Neon adresiyle değiştirip `npm run admin:create -- e-posta "şifre"` çalıştır.
7. **Domain:** Vercel → Domains bölümüne `nahitferhat.com` ekle ve gösterdiği DNS kayıtlarını domain sağlayıcına gir.
8. **Resend:** *Domains* bölümüne `nahitferhat.com` ekleyip verdiği DNS kayıtlarını (SPF/DKIM) gir. Doğrulanınca mailler kendi domaininden gider.
