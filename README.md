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

Kod GitHub'da (`main` dalı). Vercel `main`'e her push'ta siteyi otomatik yeniden yayınlar.

1. **Vercel projesi:** [vercel.com](https://vercel.com) → GitHub ile giriş → *Add New → Project* → `blog` reposunu *Import* et. İlk deploy veritabanı olmadığı için hata verebilir; sorun değil.
2. **Veritabanı (Neon):** Projede *Storage → Create Database → Neon (Postgres)* → projeye bağla. Vercel `DATABASE_URL` ve `DATABASE_URL_UNPOOLED` değişkenlerini kendisi ekler.
3. **Dosya depolama (Blob):** *Storage → Create → Blob* → erişim **Public** → projeye bağla (`BLOB_READ_WRITE_TOKEN` otomatik eklenir).
4. **Ortam değişkenleri** (*Settings → Environment Variables*):
   - `AUTH_SECRET`: `openssl rand -base64 32` çıktısı (lokaldekinden farklı olsun)
   - `SITE_URL`: şimdilik Vercel adresi (örn. `https://blog-xxx.vercel.app`), domain bağlanınca `https://nahitferhat.com`
   - `MAIL_FROM`: `Nahit Ferhat Ektaş <bulten@nahitferhat.com>`
   - `RESEND_API_KEY`: domain doğrulanınca (8. adım)
5. **Yeniden deploy:** *Deployments → … → Redeploy*. Build sırasında tablolar otomatik oluşturulur (`prisma migrate deploy`).
6. **Admin hesabı:** Neon'daki `DATABASE_URL_UNPOOLED` adresini kopyalayıp lokalde çalıştır:
   ```bash
   DATABASE_URL="postgresql://...neon.tech/..." npm run admin:create -- sen@ornek.com "guclu-bir-sifre"
   ```
7. **Domain:** *Settings → Domains* → `nahitferhat.com` ve `www.nahitferhat.com` ekle; Vercel'in gösterdiği DNS kayıtlarını domain sağlayıcına gir. Sonra `SITE_URL`'i güncelleyip yeniden deploy et.
8. **E-posta (Resend):** [resend.com](https://resend.com) → *Domains → Add* → `nahitferhat.com` → verdiği DNS kayıtlarını gir → doğrulanınca *API Keys*'ten anahtar al → `RESEND_API_KEY` olarak ekle → yeniden deploy.

**Notlar**
- Lokal veritabanındaki içerik canlıya taşınmaz; canlı site boş başlar ve içeriği canlı panelden girersin.
- LinkedIn paylaşımı `SITE_URL` gerçek bir adres olduğunda çalışır.
