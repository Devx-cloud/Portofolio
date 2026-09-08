import { ArrowUpRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHead } from "@/components/SectionHead";
import { MaskLines, Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { useMagnetic } from "@/hooks/useMagnetic";
import {
  AVAILABILITY,
  CONTACT_EMAIL,
  COUNTRY,
  CV_URL,
  LOCATION,
  socialLinks,
} from "@/data/profile";

/*
 * Penutup. Dibangun terbalik dari bagian lain: ajakan yang paling besar lebih
 * dulu, detailnya belakangan.
 *
 * Alamat email ditulis sebagai teks berukuran display, bukan disembunyikan di
 * balik tombol "Hubungi Saya". Pengunjung yang sudah menggulung sejauh ini
 * sudah memutuskan; yang mereka butuhkan adalah alamatnya - bisa disalin,
 * bisa diklik - bukan satu lapisan klik lagi.
 */
export const Contact = () => (
  <section id="kontak" data-rail="Kontak" className="shell py-24 md:py-36">
    <SectionHead index="05" title="Kontak" meta={AVAILABILITY} />

    <div className="mt-16 md:mt-24">
      {/* Pola yang sama dengan Hero: titik merah sebagai karakter di dalam
          mask yang sama, outline hanya di span dalam. Lihat catatan di
          Hero.jsx untuk alasannya. */}
      <h3 className="text-d2">
        <MaskLines lines={["Mari"]} />
        <MaskLines
          lines={[
            <>
              <span className="display-outline">Bicara</span>
              <span className="text-red">.</span>
            </>,
          ]}
          delay={0.08}
        />
      </h3>
    </div>

    {/* --- Alamat email ---
        Dua jalur berdampingan dan itu disengaja: mailto melayani yang mau
        mengirim SEKARANG, tombol salin melayani yang mau menyimpan alamatnya
        untuk dipakai di tempat lain. Menyediakan satu saja memaksa separuh
        pengunjung menyeleksi teks setinggi 56px dengan tangan. */}
    <Reveal className="mt-12 md:mt-16" delay={0.15}>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="link-sweep font-display text-[clamp(1.5rem,5vw,3.5rem)] uppercase leading-none tracking-tight text-ink transition-colors duration-500 hover:text-red"
        >
          {CONTACT_EMAIL}
        </a>
        <CopyButton value={CONTACT_EMAIL} label="Salin alamat" />
      </div>
    </Reveal>

    <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-12 md:gap-10">
      {/* --- Jalur langsung ---
          flex-col + h-full supaya blok CV di bawah bisa didorong ke dasar
          kolom dengan mt-auto. Tanpa itu, daftar sosial yang pendek berhenti
          di tengah dan menyisakan lubang kosong setinggi ~200px di sebelah
          form yang jauh lebih panjang. */}
      <Stagger className="flex h-full flex-col md:col-span-5">
        <StaggerItem>
          <span className="eyebrow">Jalur langsung</span>
          <div className="rule mt-4" />
        </StaggerItem>

        <ul className="mt-6 space-y-1">
          {socialLinks.map(({ name, handle, href, icon: Icon }) => (
            <StaggerItem key={name} as="li">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 border-b border-line-soft py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-2"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0 text-muted transition-colors duration-500 group-hover:text-red" />
                <span className="flex-1 text-base leading-none">{name}</span>
                <span className="eyebrow truncate">{handle}</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted transition-colors duration-500 group-hover:text-red"
                />
              </a>
            </StaggerItem>
          ))}
        </ul>

        <StaggerItem className="mt-8 flex flex-wrap items-center gap-4 md:mt-auto md:pt-10">
          <a href={CV_URL} download className="btn btn-ghost">
            <Download size={14} />
            Unduh CV
          </a>
          <span className="eyebrow">
            {LOCATION}, {COUNTRY}
          </span>
        </StaggerItem>
      </Stagger>

      {/* --- Form --- */}
      <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
        <span className="eyebrow">Kirim pesan</span>
        <div className="rule mt-4" />
        <MessageForm />
      </Reveal>
    </div>
  </section>
);

/*
 * Form ini TIDAK punya backend, dan sengaja tidak berpura-pura punya.
 *
 * Versi sebelumnya memanggil preventDefault lalu berhenti di situ - tombolnya
 * bisa ditekan dan tidak terjadi apa-apa, yang jauh lebih merugikan daripada
 * tidak ada form sama sekali. Sekarang isinya dirakit jadi tautan mailto dan
 * diserahkan ke aplikasi email pengunjung: pesannya benar-benar sampai, tanpa
 * perlu server, kunci API, atau layanan pihak ketiga.
 *
 * Komprominya jujur: pengunjung tanpa klien email terpasang akan melihat
 * dialog "pilih aplikasi". Karena itu alamat emailnya tetap ditulis lengkap
 * dan bisa disalin tepat di atas form ini.
 */
const MessageForm = () => {
  const magnet = useMagnetic();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const name = data.get("name")?.toString().trim() ?? "";
    const email = data.get("email")?.toString().trim() ?? "";
    const subject = data.get("subject")?.toString().trim() || "Halo Deva";
    const message = data.get("message")?.toString().trim() ?? "";

    const body = `${message}\n\n---\n${name}\n${email}`;

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Nama" autoComplete="name" placeholder="Nama kamu" required />
        <Field
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="nama@email.com"
          required
        />
      </div>

      <Field id="subject" label="Subjek" placeholder="Kolaborasi, tawaran kerja, dll." />

      <div>
        <label htmlFor="message" className="eyebrow mb-2 block">
          Pesan
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Halo Deva, saya ingin membahas tentang..."
          className="field resize-none"
        />
      </div>

      <motion.button
        type="submit"
        ref={magnet.ref}
        style={magnet.style}
        className="btn w-full sm:w-auto"
      >
        Kirim lewat email
        <ArrowUpRight size={14} />
      </motion.button>
    </form>
  );
};

const Field = ({ id, label, type = "text", ...rest }) => (
  <div>
    <label htmlFor={id} className="eyebrow mb-2 block">
      {label}
    </label>
    <input id={id} name={id} type={type} className="field" {...rest} />
  </div>
);
