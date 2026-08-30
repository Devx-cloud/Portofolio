import { ActLink, ActPanel, ActText, ActTitle } from "../ActPanel";

export const ContactAct = ({ index }) => (
  <ActPanel index={index} label="Contact" hint="end">
    <ActTitle>
      Get In <span className="stage-text">Touch</span>
    </ActTitle>
    <ActText>
      Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Saya selalu
      senang menerima pesan baru &mdash; jalur langsung dan form pesan ada di stage Contact.
    </ActText>

    <ActLink to="/contact">KIRIM PESAN</ActLink>
  </ActPanel>
);
