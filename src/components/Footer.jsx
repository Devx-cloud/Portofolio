import { useEffect, useState } from "react";
import {
  Home,
  Phone,
  Github,
  Instagram,
  Linkedin,
  MessageCircle,
} from "lucide-react";

// type FooterProps = {
//   /** contoh: "/mountain-footer.png" (letakkan file di /public) */
//   mountainSrc?: string;
// };

export function Footer({ mountainSrc = "/hotel.png" }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return (
    <footer className="relative overflow-hidden text-white">
      {/* Gambar gunung di ATAS footer
      <img
        src={mountainSrc}
        alt=""
        // aria-hidden="true"
        className="block w-full max-h-56 object-cover object-top select-none pointer-events-none"
      /> */}
      {isDarkTheme ? (
        <img src="/gunung-dark.png" alt="Gunung" style={{ width: "100%", height: "auto", }} className=""/>
      ) : (
        <img src="/gunung-light.png" alt="Gunung" style={{ width: "100%", height: "auto", }} className=""/>
      )}

        <div className={isDarkTheme ? "bg-[#2e0808]" : "bg-[#11416a]"}>

      {/* Konten footer */}
      <div className="container pb-12 mt-[-5px] grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* Profil */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight pixel-font">DEVA SURYA</h2>
          <p className="mt-1 text-white/70">Junior Developer</p>
        </div>

        {/* Navigations */}
        <div>
          <h3 className="text-lg font-semibold mb-3 pixel-font">Navigations</h3>
          <ul className="space-y-2 text-white/80">
            <li>
              <a
                href="/"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Home className="h-4 w-4" /> Home
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Phone className="h-4 w-4" /> Contact
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" /> Project
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3 pixel-font">Social Media</h3>
          <ul className="space-y-2 text-white/80">
            <li>
              <a
                href="https://github.com/Devx-cloud"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Github className="h-4 w-4" /> Github
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/devx.sun/"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/deva-surya-5a6568380/"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Linkedin className="h-4 w-4" /> Linkedin
              </a>
            </li>
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-3 pixel-font">Address</h3>
          <p className="text-white/80">
            Tabanan, Bali, Indonesia
            <br />
            <a
                    href="mailto:devasur2006@gmail.com"
                    className="text-muted-white hover:text-white transition-colors"
                  >
                    devasur2006@gmail.com
                  </a>
          </p>
        </div>
      </div>

      {/* Garis & Copyright */}
      <div className="container">
        {/* <div className="border-t border-border/40" /> */}
        <div className="bg-gradient-to-r from-transparent via-zinc-100 to-transparent h-[1px] w-full" />
      </div>
      <p className="text-center text-sm text-white/60 py-6">
        Copyright 2025 | Deva Surya Pratama. All Rights Reserved.
      </p>
        </div>
    </footer>
  );
}
