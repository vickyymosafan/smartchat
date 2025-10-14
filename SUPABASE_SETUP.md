# Setup Supabase untuk SmartChat

Panduan lengkap untuk setup Supabase Authentication dan Database untuk aplikasi SmartChat.

## 📋 Prerequisites

- Akun Supabase (gratis di [supabase.com](https://supabase.com))
- Project Supabase sudah dibuat
- Credentials Supabase (URL dan Anon Key)

## 🚀 Langkah Setup

### 1. Setup Database Schema

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file `supabase-schema.sql` ke SQL Editor
6. Klik **Run** untuk execute query

File `supabase-schema.sql` akan membuat:
- ✅ Tabel `conversations` untuk menyimpan daftar percakapan
- ✅ Tabel `messages` untuk menyimpan semua pesan
- ✅ Row Level Security (RLS) policies untuk keamanan data
- ✅ Indexes untuk performa query optimal
- ✅ Triggers untuk auto-update timestamps
- ✅ Functions untuk update conversation timestamp

### 2. Verifikasi Setup

Setelah menjalankan SQL schema, verifikasi bahwa:

1. **Tabel sudah dibuat:**
   - Navigasi ke **Table Editor**
   - Pastikan tabel `conversations` dan `messages` muncul

2. **RLS sudah aktif:**
   - Klik pada tabel `conversations`
   - Scroll ke bawah ke section **Policies**
   - Pastikan ada 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - Lakukan hal yang sama untuk tabel `messages`

3. **Test Authentication:**
   - Navigasi ke **Authentication** > **Users**
   - Klik **Add User** untuk membuat test user
   - Atau gunakan aplikasi untuk register user baru

### 3. Environment Variables

Pastikan file `.env.local` sudah berisi credentials Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yzpjlmdbothjshwpzqxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4
```

⚠️ **PENTING:** Jangan commit credentials ke Git! File `.env.local` sudah ada di `.gitignore`.

## 🔐 Row Level Security (RLS)

RLS memastikan setiap user hanya bisa mengakses data miliknya sendiri. Berikut penjelasan policies:

### Conversations Table Policies:

1. **SELECT Policy:** User hanya bisa melihat conversations miliknya
   ```sql
   auth.uid() = user_id
   ```

2. **INSERT Policy:** User hanya bisa membuat conversations untuk dirinya
   ```sql
   auth.uid() = user_id
   ```

3. **UPDATE Policy:** User hanya bisa update conversations miliknya
   ```sql
   auth.uid() = user_id
   ```

4. **DELETE Policy:** User hanya bisa delete conversations miliknya
   ```sql
   auth.uid() = user_id
   ```

### Messages Table Policies:

Semua policies menggunakan subquery untuk memastikan message belongs to user's conversation:

```sql
EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
)
```

## 📊 Database Schema

### Tabel: conversations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Foreign key ke auth.users |
| title | TEXT | Judul percakapan |
| created_at | TIMESTAMPTZ | Waktu dibuat (auto) |
| updated_at | TIMESTAMPTZ | Waktu diupdate (auto) |

### Tabel: messages

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| conversation_id | UUID | Foreign key ke conversations |
| role | TEXT | 'user', 'assistant', atau 'system' |
| content | TEXT | Isi pesan |
| created_at | TIMESTAMPTZ | Waktu dibuat (auto) |

## 🧪 Testing

### Test Authentication:

1. Jalankan aplikasi: `npm run dev`
2. Buka browser: `http://localhost:3000`
3. Klik **Daftar** untuk membuat akun baru
4. Masukkan email dan password (min 6 karakter)
5. Check email untuk verifikasi (jika email confirmation enabled)

### Test Database Operations:

1. Login ke aplikasi
2. Kirim pesan pertama → akan create conversation baru
3. Kirim beberapa pesan lagi → akan save ke conversation yang sama
4. Refresh page → messages harus tetap ada
5. Buka sidebar → conversation harus muncul di list
6. Klik conversation → messages harus load
7. Klik delete icon → conversation dan messages harus terhapus

### Verify di Supabase Dashboard:

1. Navigasi ke **Table Editor** > **conversations**
2. Pastikan ada row dengan `user_id` yang sesuai
3. Navigasi ke **Table Editor** > **messages**
4. Pastikan ada messages dengan `conversation_id` yang sesuai

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solusi:** Pastikan `.env.local` ada dan berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Row Level Security policy violation"

**Solusi:** 
1. Pastikan RLS policies sudah dibuat dengan benar
2. Check apakah user sudah login (auth.uid() harus ada)
3. Verify policies di Supabase Dashboard

### Messages tidak tersimpan

**Solusi:**
1. Check browser console untuk error
2. Verify RLS policies untuk tabel messages
3. Pastikan conversation_id valid

### Tidak bisa login

**Solusi:**
1. Check Supabase Dashboard > Authentication > Settings
2. Pastikan email confirmation tidak required (untuk testing)
3. Check email spam folder untuk verification email

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎉 Selesai!

Setelah setup selesai, aplikasi SmartChat siap digunakan dengan:
- ✅ Authentication (Email/Password)
- ✅ Database untuk menyimpan conversations dan messages
- ✅ Row Level Security untuk keamanan data
- ✅ Auto-save messages ke database
- ✅ Load conversations dari database
- ✅ Delete conversations

Selamat menggunakan SmartChat! 🚀
