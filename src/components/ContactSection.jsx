import { Send, Mail, MapPin, Download, Github, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* Ganti dengan alamat email yang ingin ditampilkan publik */
const CONTACT_EMAIL = "devx.surya@gmail.com";

const socialLinks = [
  { name: "Github", href: "https://github.com/Devx-cloud", icon: Github },
  { name: "Instagram", href: "https://www.instagram.com/devx.sun/", icon: Instagram },
  { name: "Linkedin", href: "https://www.linkedin.com/in/deva-surya-5a6568380/", icon: Linkedin },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const labelClass = "pixel-font mb-2 block text-pix-xs uppercase text-muted-foreground md:text-pix-xs";

const fieldClass =
  "w-full pix-inset px-3 py-3 text-sm transition-colors duration-100 ease-pix placeholder:text-muted-foreground/60 focus:stage-border focus:outline-none";

/* Panel bertab, mengikuti bahasa visual stage Profile & Skills */
const Panel = ({ label, className, children }) => (
  <div className={cn("relative pix-panel crt px-5 pt-7 pb-5", className)}>
    <span className="pixel-font absolute -top-3 left-4 pix-chip stage-border stage-bg-soft stage-text px-3 py-1 text-pix-xs uppercase whitespace-nowrap">
      {label}
    </span>
    {children}
  </div>
);

const ChannelRow = ({ icon: Icon, label, value, href }) => {
  const body = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center pix-chip transition-colors duration-100 ease-pix group-hover:stage-border group-hover:stage-text">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="pixel-font block text-pix-xs uppercase text-muted-foreground md:text-pix-xs">
          {label}
        </span>
        <span className="block truncate text-sm text-foreground/90 transition-colors duration-100 ease-pix group-hover:stage-text">
          {value}
        </span>
      </span>
    </>
  );

  return href ? (
    <a href={href} className="group flex items-center gap-3">
      {body}
    </a>
  ) : (
    <div className="group flex items-center gap-3">{body}</div>
  );
};

export const ContactSection = () => {
  return (
    <section id="contact" className="relative px-4 pt-4 pb-16 md:pt-6 md:pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-5xl"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10"
        >
          <h2 className="pixel-font text-pix-lg font-bold md:text-pix-xl">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Pilih
            jalur tercepat di kiri, atau tinggalkan pesan lewat form.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-5">
          {/* Kolom kiri: jalur kontak langsung */}
          <motion.div variants={itemVariants}>
            <Panel label="Jalur Langsung" className="h-full">
              <div className="flex h-full flex-col gap-4">
                <ChannelRow
                  icon={Mail}
                  label="Email"
                  value={CONTACT_EMAIL}
                  href={`mailto:${CONTACT_EMAIL}`}
                />
                <ChannelRow icon={MapPin} label="Lokasi" value="Tabanan, Bali — Indonesia" />

                <div className="border-t-2 border-border pt-4">
                  <span className="pixel-font mb-3 block text-pix-xs uppercase text-muted-foreground md:text-pix-xs">
                    Sosial
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(({ name, href, icon: Icon }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={name}
                        title={name}
                        className="flex h-9 w-9 items-center justify-center pix-chip text-foreground/70 transition-colors duration-100 ease-pix hover:stage-border hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>

                <a
                  href="/cv/cv-1.pdf"
                  download
                  className="pixel-font mt-auto flex items-center justify-center gap-2 pix-chip px-3 py-3 text-pix-xs uppercase text-foreground/80 transition-all duration-100 ease-pix hover:stage-border hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:text-pix-xs"
                >
                  <Download className="h-4 w-4" />
                  Unduh CV
                </a>
              </div>
            </Panel>
          </motion.div>

          {/* Kolom kanan: form pesan */}
          <motion.div variants={itemVariants}>
            <Panel label="Kirim Pesan">
              {/* NOTE: submit belum terhubung ke mana pun - pasang handler/action di sini nanti */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Nama
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      className={fieldClass}
                      placeholder="Nama kamu"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      className={fieldClass}
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}>
                    Subjek
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={fieldClass}
                    placeholder="Kolaborasi proyek, tawaran kerja, dll."
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className={cn(fieldClass, "resize-none")}
                    placeholder="Halo Deva, saya ingin membahas tentang..."
                  />
                </div>

                <button
                  type="submit"
                  className="pixel-font flex w-full items-center justify-center gap-2 pix-chip stage-border stage-bg-soft stage-text stage-shadow px-4 py-3 text-pix-xs uppercase transition-all duration-100 ease-pix hover:stage-glow active:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:text-xs"
                >
                  Kirim Pesan
                  <Send size={14} />
                </button>
              </form>
            </Panel>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
