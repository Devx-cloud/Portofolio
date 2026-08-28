import { Download } from "lucide-react";
import { CV_URL, socialLinks } from "@/data/profile";
import { actionClass } from "../../constants";
import { ActLink, ActPanel, ActText, ActTitle } from "../ActPanel";

export const ContactAct = ({ index }) => (
  <ActPanel index={index} label="Contact" hint="end">
    <ActTitle>
      Get In <span className="stage-text">Touch</span>
    </ActTitle>
    <ActText>
      Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Saya selalu
      senang menerima pesan baru.
    </ActText>

    <div className="flex w-full flex-wrap items-center gap-2">
      {socialLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          title={name}
          className="flex h-9 w-9 items-center justify-center pix-chip stage-border-soft text-foreground/80 transition-colors duration-100 ease-pix hover:stage-border hover:stage-bg-soft hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}

      <a href={CV_URL} download className={actionClass}>
        <Download className="h-4 w-4 stage-text transition-colors group-hover:text-foreground" />
        UNDUH CV
      </a>
    </div>

    <ActLink to="/contact">KIRIM PESAN</ActLink>
  </ActPanel>
);
