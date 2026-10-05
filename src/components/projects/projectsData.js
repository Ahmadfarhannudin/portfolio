/* =========================================================
   PROJECTS DATA

   Sumber tunggal data project — dipakai oleh grid
   "Projects" di PortfolioContent maupun halaman detail
   ProjectDetail. id harus unik dan match dengan URL
   /projects/:id.

   - coverImage:      thumbnail di kartu grid Portfolio
   - carouselImages:  foto yang diputar di ImageCarousel (hero)
   - galleryImages:   foto yang ditampilkan di grid "Galeri"
   Ketiganya boleh beda isi/jumlah, tidak wajib sama.
========================================================= */
//expreship
import expreship from "@/assets/portfolio/expreship/expreship.PNG";
import expreship2 from "@/assets/portfolio/expreship/expreship2.PNG";
import expreship3 from "@/assets/portfolio/expreship/admin.PNG";
import expreship4 from "@/assets/portfolio/expreship/admin1.PNG";
import expreship5 from "@/assets/portfolio/expreship/expreship3.PNG";


import expreshipg1 from "@/assets/portfolio/expreship/expresipg1.png";
import expreshipg2 from "@/assets/portfolio/expreship/expresipg2.png";
import expreshipg3 from "@/assets/portfolio/expreship/expresipg3.png";
import expreshipg4 from "@/assets/portfolio/expreship/loging.png";

//fitforge
import fitforge1 from "@/assets/portfolio/fitforge/fitforge1.PNG";
import fitforge2 from "@/assets/portfolio/fitforge/fitforge2.PNG";
import fitforge3 from "@/assets/portfolio/fitforge/fitforge3.PNG";
import fitforge4 from "@/assets/portfolio/fitforge/fitforge4.PNG";
import fitforge5 from "@/assets/portfolio/fitforge/fitforge5.PNG";

import fitforgeg1 from "@/assets/portfolio/fitforge/fitforgeg1.png";
import fitforgeg2 from "@/assets/portfolio/fitforge/fitforgeg2.png";
import fitforgeg3 from "@/assets/portfolio/fitforge/fitforgeg3.png";
import fitforgeg4 from "@/assets/portfolio/fitforge/fitforgeg4.png";
import fitforgeg5 from "@/assets/portfolio/fitforge/fitforgeg5.png";

//prediksi nilai
import prediksi1 from "@/assets/portfolio/prediksi/predik1.jpeg";
import prediksi2 from "@/assets/portfolio/prediksi/predik2.jpeg";

//bank mini
import bankf1 from "@/assets/portfolio/bankminif/bank1.PNG";
import bankf2 from "@/assets/portfolio/bankminif/bank2.PNG";
import bankf3 from "@/assets/portfolio/bankminif/bank3.PNG";
import bankf4 from "@/assets/portfolio/bankminif/bank4.PNG";
import bankf5 from "@/assets/portfolio/bankminif/bank5.PNG";
import bankf6 from "@/assets/portfolio/bankminif/bank6.PNG";

//isp
import isp1 from "@/assets/portfolio/isp/isp1.png";
import isp2 from "@/assets/portfolio/isp/1.PNG";
import isp3 from "@/assets/portfolio/isp/2.PNG";
import isp4 from "@/assets/portfolio/isp/3.PNG";
import isp5 from "@/assets/portfolio/isp/4.PNG";
import isp6 from "@/assets/portfolio/isp/6.PNG";
import isp7 from "@/assets/portfolio/isp/7.PNG";
import isp8 from "@/assets/portfolio/isp/8.PNG";
import isp9 from "@/assets/portfolio/isp/9.PNG";
import isp10 from "@/assets/portfolio/isp/10.PNG";
import isp11 from "@/assets/portfolio/isp/11.PNG";
import isp12 from "@/assets/portfolio/isp/13.PNG";
import isp13 from "@/assets/portfolio/isp/14.PNG";
import isp14 from "@/assets/portfolio/isp/login.PNG";

import laundry from "@/assets/portfolio/laundry/laundry.png";

const expreshipCarousel = [expreship, expreship2, expreship3, expreship4, expreship5];
const expreshipGallery = [expreshipg1, expreshipg2, expreshipg3, expreshipg4];

const fitforgeCarousel = [fitforge1, fitforge2, fitforge3, fitforge4, fitforge5];
const fitforgeGallery = [fitforgeg1, fitforgeg2, fitforgeg3, fitforgeg4, fitforgeg5];

const prediksiCarousel = [prediksi1, prediksi2];

const bankminifCarousel = [bankf1, bankf2, bankf3, bankf4, bankf5, bankf6];

const ispCarousel = [isp1];
const ispgallery= [isp2, isp3, isp4, isp5, isp6, isp7, isp8, isp9, isp10, isp11, isp12, isp13, isp14];

const laundryCarousel = [laundry];
export const PROJECTS_DATA = [
  {
    id: "Expreship",
    title: "Expreship",
    role: "",
    duration: "2025",

    shortDescription:
      "Expresship hadir sebagai layanan pengiriman modern",

    description:
      "Platform pengiriman modern yang memudahkan pengguna untuk mengelola pengiriman barang dengan cepat dan efisien. dashboard admin real-time, dan optimasi performa, Expreship memberikan pengalaman pengiriman yang seamless bagi pengguna dan admin.",

    coverImage: expreship,

    carouselImages: expreshipCarousel,
    galleryImages: expreshipGallery,

    techStack: ["html5", "javascript", "bootstrap", "php", "mysql"],

    highlights: [
      "Dashboard admin real-time untuk memantau pengiriman",
      "Pembeli mengecek status pengiriman secara instan melalui resi",
      "gps tracking real time oleh kurir, memudahkan admin dan pembeli untuk mengetahui lokasi paket",
    ],

    liveUrl: "#",
    githubUrl: "#",
  },

  {
    id: "FitForge",
    title: "Fitforge",
    role: "Frontend Developer",
    duration: "2025",

    shortDescription:
      "Platform untuk gym secara mandiri serta fitur scan barcode untuk mengetahui kandungan nutrisi dari makanan yang dikonsumsi",

    description:
      "fiforge adalah flatform untuk gym dan personal trainer untuk mengelola jadwal latihan, progress, dan komunikasi dengan klien serta fitur menanyakan AI untuk rekomendasi latihan dan nutrisi dan juga fitur scan barcode untuk mengetahui kandungan nutrisi dari makanan yang dikonsumsi.",

    coverImage:
      fitforge1,

    // Carousel hero: cukup 2 foto pilihan
    carouselImages: fitforgeCarousel,
     

    // Galeri: bisa lebih banyak / kombinasi berbeda
    galleryImages: fitforgeGallery,

    techStack: ["html5", "javascript", "bootstrap", "php", "mysql", "fastapi"],

    highlights: [
      "Platform untuk gym secara mandiri dan personal trainer untuk penjadwalan secara offline",
      "Fitur scan barcode untuk mengetahui kandungan nutrisi dari makanan yang dikonsumsi",
      "Fitur menanyakan AI untuk rekomendasi latihan dan nutrisi",
      "dashboard admin untuk memantau progress latihan dan nutrisi klien ",
      "dashboard admin untuk menambahkan member baru dan mengelola jadwal",
    ],

    liveUrl: "#",
    githubUrl: "#",
  },

  {
    id: "prediksi-nilai",
    title: "prediksi-nilai",
    role: "",
    duration: "2024",

    shortDescription:
      "prediksi nilai dan perhitungan rata rata menggunakan python",

    description:
      "platform prediksi nilai dan perhitungan rata rata menggunakan python, dengan fitur input data nilai, prediksi nilai, dan perhitungan rata rata dan progress bar. Platform ini memudahkan pengguna untuk memprediksi nilai dan menghitung rata rata dengan cepat dan akurat.",

    coverImage: prediksi1,

    carouselImages: prediksiCarousel,

    galleryImages: [
    ],

    techStack: ["python"],

    highlights: [
      "Platform prediksi nilai dan perhitungan rata rata menggunakan python",
      "Fitur input data nilai, prediksi nilai, dan perhitungan rata rata dan progress bar",
    ],

    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "Sistem Manajemen ISP",
    title: "Sistem Manajemen ISP",
    role: "",
    duration: "2025",

    shortDescription:
      "Sistem manajemen ISP untuk mengelola pelanggan, paket layanan, dan pembayaran dengan efisien",

    description:
      "Platform ini memudahkan ISP untuk mengelola pelanggan, paket layanan, dan pembayaran dengan efisien. Dengan fitur manajemen pelanggan, paket layanan, dan pembayaran, platform ini membantu ISP meningkatkan produktivitas dan memberikan layanan yang lebih baik kepada pelanggan.",

    coverImage: isp1,

    carouselImages: ispCarousel,

    galleryImages: ispgallery,

    techStack: ["kotlin", "firebase"],

    highlights: [
      "login untuk admin dan pelanggan, memastikan keamanan dan akses yang tepat",
      "Pelanggan dapat melihat paket layanan yang tersedia dan memilih paket yang sesuai dengan kebutuhan mereka",
      "Pelangganb bisa membayar tagihan secara online melalui platform, memudahkan proses pembayaran dan mengurangi risiko keterlambatan pembayaran",
      "admin dapat mengelola pelanggan, paket layanan, dan pembayaran dengan efisien melalui dashboard admin",
      "admin dapat mengelola odp dan olt, memudahkan proses instalasi dan pemeliharaan jaringan",
    ],

    liveUrl: "#",
    githubUrl: "https://github.com/Ahmadfarhannudin/UAS-kelompok-2-Pemograman-Mobile-1.git",
  },

  {
    id: "bank-mini",
    title: "bank-mini",
    role: "",
    duration: "2024",

    shortDescription:
      "bank mini adalah platform perbankan digital menggunakan java yang memungkinkan pengguna untuk melakukan transaksi perbankan secara online",

    description:
      "platform bank mini adalah platform perbankan digital yang memungkinkan pengguna untuk melakukan transaksi perbankan secara online, termasuk transfer dana, pembayaran tagihan, dan pengelolaan akun. Dengan fitur keamanan yang canggih dan antarmuka pengguna yang intuitif, bank mini memberikan pengalaman perbankan yang aman dan nyaman bagi penggunanya.",

    coverImage: bankf1,

    carouselImages: bankminifCarousel,

    galleryImages: [
    ],

    techStack: ["java"],

    highlights: [
      "login untuk admin dan pengguna, memastikan keamanan dan akses yang tepat",
      "filehandler sebagai penyimpanan data pengguna maupun transaksi",
      "Platform perbankan digital menggunakan java",
      "fitur transfter, setor, tarik, dan cek saldo",
      "pengguna bisa membuka rekening baru secara online melalui platform, memudahkan proses pembukaan rekening tanpa harus mengunjungi cabang bank",
      "statistik transaksi pada nasabah dan admin untuk melihat grafik transaksi dan analisis data, membantu pengguna dan admin untuk memahami pola transaksi dan membuat keputusan yang lebih baik",
      "admin dapat mengelola akun pengguna, termasuk menambahkan, menghapus, dan memperbarui informasi akun melalui dashboard admin",
    ],

    liveUrl: "#",
    githubUrl: "#",
  },

   {
    id: "LaundryQueue",
    title: "LaundryQueue",
    role: "UI/UX",
    duration: "2025",

    shortDescription:
      "LaundryQueue berbasis UI/UX untuk mengelola pesanan laundry",

    description:
      "Platform ini berfungsi mengelola pesanan laundry dan bekerja sama dengan mitra laundry terdekat",
    coverImage: laundry,

    carouselImages: laundryCarousel,

    galleryImages: [
    ],

    techStack: ["figma"],

    highlights: [
      "LaundryQueue ini Berbasis UI/UX",
      "Pelanggan Bisa Berlanggan Laundry",
      "Terintegrasi Payment Gateway Untuk Pembayaran",
      "Bisa Diantar Atau Datang Ke Tempat",
      "Monitoring Real time Untuk memantau progres cucian",
      "Halaman Admin Untuk Memantau Dan Mengelola Berbagai Fitur",
    ],

    liveUrl: "https://www.figma.com/proto/NcS4I1lGsvy5kWmosne2jY/laundry?node-id=111-201&t=aPFJWHlI0yXrLQ1j-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=101%3A2",
    githubUrl: "",
  },
];

export function getProjectById(id) {
  return PROJECTS_DATA.find(
    (project) => String(project.id) === String(id)
  );
}