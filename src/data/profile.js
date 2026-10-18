import { Github, Instagram, Linkedin } from "lucide-react";
import { PROFILE } from "@shared/portfolio";

/* Identitas dipakai di banyak tempat (Profile, Contact, Title Screen).
   Nilainya ditulis sekali di shared/portfolio.js - berkas yang sama dibaca
   asisten AI - supaya tidak ada dua versi yang bisa lepas sinkron. */
export const CONTACT_EMAIL = PROFILE.email;
export const LOCATION = PROFILE.location;
export const CV_URL = PROFILE.cvPath;
export const GITHUB_URL = PROFILE.github;

export const socialLinks = [
  { name: "Github", href: PROFILE.github, icon: Github },
  { name: "Instagram", href: PROFILE.instagram, icon: Instagram },
  { name: "Linkedin", href: PROFILE.linkedin, icon: Linkedin },
];
