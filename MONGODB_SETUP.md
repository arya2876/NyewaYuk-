# Setup MongoDB untuk Next.js Airbnb Clone

## Masalah
MongoDB lokal memerlukan konfigurasi replica set untuk mendukung transactions yang digunakan oleh Prisma.

## Solusi: Gunakan MongoDB Atlas (Gratis & Mudah)

### Langkah-langkah:

1. **Buat Akun MongoDB Atlas (Gratis)**
   - Kunjungi: https://www.mongodb.com/cloud/atlas/register
   - Daftar dengan email Google/Github atau email biasa

2. **Buat Cluster (Gratis)**
   - Pilih paket **FREE** (M0 Sandbox)
   - Pilih provider: **AWS** atau **Google Cloud**
   - Pilih region terdekat (Singapore/Jakarta)
   - Klik **Create Cluster**

3. **Setup Database Access**
   - Di sidebar klik **Database Access**
   - Klik **Add New Database User**
   - Pilih **Password** authentication
   - Username: `airbnb_user` (atau terserah Anda)
   - Password: Generate atau buat sendiri (SIMPAN PASSWORD INI!)
   - User Privileges: **Read and write to any database**
   - Klik **Add User**

4. **Setup Network Access**
   - Di sidebar klik **Network Access**
   - Klik **Add IP Address**
   - Klik **Allow Access from Anywhere** (untuk development)
   - IP: `0.0.0.0/0`
   - Klik **Confirm**

5. **Dapatkan Connection String**
   - Kembali ke **Database** (sidebar)
   - Klik tombol **Connect** di cluster Anda
   - Pilih **Drivers**
   - Pilih **Node.js** dan versi **4.1 or later**
   - Copy connection string yang muncul
   - Contoh: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update File .env**
   - Buka file `.env` di root project
   - Ganti `DATABASE_URL` dengan connection string yang Anda copy
   - Ganti `<username>` dengan username Anda
   - Ganti `<password>` dengan password Anda
   - Tambahkan nama database di akhir URL (sebelum `?`)
   
   Contoh:
   ```
   DATABASE_URL="mongodb+srv://airbnb_user:MyPassword123@cluster0.xxxxx.mongodb.net/airbnb?retryWrites=true&w=majority"
   ```

7. **Push Schema ke Database**
   ```bash
   npx prisma db push
   ```

8. **Restart Development Server**
   - Stop server yang sedang berjalan (Ctrl+C di terminal)
   - Jalankan lagi: `npm run dev`

9. **Test Website**
   - Buka http://localhost:3000
   - Coba Register akun baru
   - Seharusnya berhasil!

## Alternatif: Setup MongoDB Replica Set Lokal (Advanced)

Jika Anda tetap ingin menggunakan MongoDB lokal, ikuti panduan ini:
https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/

Namun, setup ini lebih rumit dan tidak direkomendasikan untuk development.

## Troubleshooting

### Error: "Prisma needs to perform transactions"
- MongoDB lokal Anda belum dikonfigurasi sebagai replica set
- Gunakan MongoDB Atlas (lebih mudah)

### Error: "authentication failed"
- Username atau password salah di connection string
- Pastikan user sudah dibuat di Database Access

### Error: "IP not in whitelist"
- Tambahkan IP Anda di Network Access
- Atau gunakan `0.0.0.0/0` untuk allow all (development only)

### Error: "Connection timeout"
- Check koneksi internet
- Pastikan firewall tidak memblokir MongoDB
