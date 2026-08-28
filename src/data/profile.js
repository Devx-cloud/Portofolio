import { Github, Instagram, Linkedin } from "lucide-react";

/* Identitas dipakai di banyak tempat (Profile, Contact, Title Screen).
   Ditulis sekali supaya tidak ada dua versi yang bisa lepas sinkron. */
export const CONTACT_EMAIL = "devx.surya@gmail.com";
export const LOCATION = "Tabanan, Bali — Indonesia";
export const CV_URL = "/cv/cv-1.pdf";
export const GITHUB_URL = "https://github.com/Devx-cloud";

export const socialLinks = [
  { name: "Github", href: GITHUB_URL, icon: Github },
  { name: "Instagram", href: "https://www.instagram.com/devx.sun/", icon: Instagram },
  { name: "Linkedin", href: "https://www.linkedin.com/in/deva-surya-5a6568380/", icon: Linkedin },
];
