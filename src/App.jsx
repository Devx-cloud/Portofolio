import { SmoothScroll } from "@/components/SmoothScroll";
import { Intro } from "@/components/Intro";
import { Masthead } from "@/components/Masthead";
import { ScrollRail } from "@/components/ScrollRail";
import { Cursor } from "@/components/Cursor";
import { Grain } from "@/components/Grain";
import { Footer } from "@/components/Footer";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Skills } from "@/sections/Skills";
import { Work } from "@/sections/Work";
import { Ask } from "@/sections/Ask";
import { Contact } from "@/sections/Contact";

/*
 * Seluruh situs: satu halaman, satu gulungan, tanpa router.
 *
 * Versi sebelumnya memecah isi ini jadi enam route dengan menu pemilih stage.
 * Yang hilang saat menu dibuang cuma satu - kemampuan melompat - dan itu
 * ditukar dengan sesuatu yang lebih berharga di portofolio: urutan yang
 * dijamin. Semua orang membaca bagian yang sama dalam urutan yang sama, jadi
 * setiap bagian boleh mengandalkan apa yang sudah dibaca sebelumnya.
 *
 * Yang TIDAK boleh ikut hilang bersama menunya adalah orientasi. Gulungan
 * panjang tanpa penanda membuat pengunjung kehilangan rasa "ada di mana" dan
 * "masih berapa lagi"; itu ditangani ScrollRail, yang sengaja tidak bisa
 * diklik supaya tidak berubah jadi menu.
 *
 * Urutan komponen di bawah = urutan lapisan (tidak ada z-index yang saling
 * berebut karena semuanya sudah dinyatakan eksplisit di komponennya):
 *   Intro   z-100  tirai pembuka, sekali per sesi
 *   Grain   z-9999 butiran di atas segalanya, tidak pernah menangkap klik
 *   Cursor  z-9998 tepat di bawah butiran supaya ikut terkena teksturnya
 *   Masthead/Rail z-50/40  di atas konten, di bawah tirai
 */
function App() {
  return (
    <>
      {/* Lewati langsung ke konten. Tersembunyi sampai difokus lewat Tab -
          pengguna keyboard kalau tidak harus melewati bar identitas di tiap
          kali menekan Tab dari awal halaman. */}
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border focus:border-line focus:bg-page focus:px-4 focus:py-3 focus:eyebrow focus:text-ink"
      >
        Langsung ke konten
      </a>

      <SmoothScroll />
      <Intro />

      <Masthead />
      <ScrollRail />

      <main id="konten">
        <Hero />
        <About />
        <Skills />
        <Work />
        <Ask />
        <Contact />
      </main>

      <Footer />

      <Cursor />
      <Grain />
    </>
  );
}

export default App;
