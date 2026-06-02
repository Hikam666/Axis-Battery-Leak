# Axis Robotics: Battery Leak 🤖🔋

![Axis Robotics Logo](public/logo.avif)

A thrilling 3D survival-platformer game built with **React Three Fiber** and **Rapier Physics**. Play as **LFG BOT**, a cute but desperate robotic assistant whose battery is critically leaking in a high-tech facility corridor. 

*Sebuah game 3D survival-platformer mendebarkan yang dibangun menggunakan **React Three Fiber** dan **Rapier Physics**. Bermainlah sebagai **LFG BOT**, asisten robot imut yang baterainya bocor parah di sebuah lorong fasilitas canggih.*

---

## 🎮 Gameplay (English)

### The Objective
Your battery is constantly draining! To survive, you must navigate the laboratory corridor and recover scattered **Data Modules**. Collecting a module restores a chunk of your battery. Collect all the required modules to proceed to the next sector (level). 

### The Challenge
As you progress through the **10 Sectors**:
1. **Battery Drain:** The battery leakage accelerates significantly. In later levels, you only have seconds to find the next module.
2. **Security Lasers:** Starting from Level 2, automated high-energy security lasers will spawn in the corridor. They spin faster and multiply in numbers as you progress.
3. **Instant Death:** Touching a laser beam results in immediate destruction (Game Over).

### Controls
* **W, A, S, D:** Move the robot.
* **Arrow Keys (Up, Down, Left, Right):** Look around / Aim camera (Strafing).
* **Spacebar:** Activate high-jump thrusters (useful for jumping onto 2-meter tall server tables to avoid floor lasers).
* **'E' or Left Click:** Grab a Data Module. *(Note: You must be close to the module and standing on the same elevation/table to grab it).*
* **HUD Buttons:** Use the on-screen terminal to Mute/Unmute audio or restart the current level if you are stuck.

---

## 🎮 Cara Bermain (Bahasa Indonesia)

### Tujuan Utama
Baterai robot Anda terus menerus bocor! Untuk bertahan hidup, Anda harus menyusuri lorong laboratorium dan mengumpulkan **Modul Data** yang tersebar. Setiap kali Anda memungut modul, sebagian baterai Anda akan terisi kembali. Kumpulkan semua modul yang diminta untuk maju ke sektor (level) berikutnya.

### Tantangan
Seiring Anda melewati **10 Sektor**:
1. **Kebocoran Baterai:** Baterai akan terkuras semakin cepat. Di level-level akhir, Anda hanya punya waktu hitungan detik untuk mencari modul berikutnya.
2. **Laser Keamanan:** Mulai dari Level 2, pilar laser keamanan berenergi tinggi akan muncul di tengah lorong. Jumlah laser akan semakin banyak dan putarannya makin ganas seiring tingginya level Anda.
3. **Kematian Instan:** Menyentuh sedikit saja sinar laser akan membuat robot langsung hancur (*Game Over*).

### Kendali
* **W, A, S, D:** Bergerak / Berjalan.
* **Tombol Panah (Atas, Bawah, Kiri, Kanan):** Mengarahkan pandangan kamera (Mode *Strafing*).
* **Spasi:** Mengaktifkan pendorong lompat tinggi (sangat berguna untuk naik ke atas meja operasi setinggi 2 meter demi menghindari sapuan laser di lantai).
* **'E' atau Klik Kiri:** Memungut Modul Data. *(Catatan: Anda harus berada sangat dekat dengan modul dan berdiri di ketinggian/meja yang sama untuk bisa memungutnya).*
* **Tombol Layar:** Gunakan antarmuka di pojok layar untuk mematikan suara atau memulai ulang level saat ini jika Anda terjebak.

---

## 🛠️ Technology Stack
* **React** (Vite)
* **Three.js** & **@react-three/fiber** (3D Rendering)
* **@react-three/drei** (3D Helpers & Textures)
* **@react-three/rapier** (3D Physics Engine & Collisions)
* **@react-three/postprocessing** (Bloom & Visual Effects)

## 🚀 How to Run Locally / Cara Menjalankan
1. Clone the repository / *Unduh kode program*.
2. Run `npm install` to install dependencies / *Jalankan perintah ini untuk mengunduh modul*.
3. Run `npm run dev` to start the local development server / *Jalankan perintah ini untuk memulai server*.
4. Open the provided `localhost` URL in your browser / *Buka tautan localhost di peramban Anda*.
