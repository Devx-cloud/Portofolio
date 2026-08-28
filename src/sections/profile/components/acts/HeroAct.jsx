import { Crosshair, MapPin, Signal } from "lucide-react";
import { LOCATION } from "@/data/profile";
import { ActPanel, ActText, ActTitle, StatRow } from "../ActPanel";

export const HeroAct = ({ index }) => (
  <ActPanel index={index} label="Data Diri">
    <div>
      <ActTitle as="h1" size="xl">
        Deva <span className="stage-text">Surya</span>
      </ActTitle>
      <p className="pixel-font-null mt-2 text-pix-sm md:text-pix-md uppercase tracking-[2px] stage-text">
        Web &amp; Mobile Developer
      </p>
    </div>

    <div className="flex w-full flex-col gap-2 border-y-2 stage-border-soft py-3">
      <StatRow icon={MapPin} label="Lokasi">
        {LOCATION}
      </StatRow>
      <StatRow icon={Crosshair} label="Fokus">
        Laravel &middot; Flutter &middot; React
      </StatRow>
      <StatRow icon={Signal} label="Status">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 shrink-0 stage-bg animate-pulse-subtle" />
          Terbuka untuk proyek &amp; kolaborasi
        </span>
      </StatRow>
    </div>

    <ActText>
      Saya membangun aplikasi web dengan Laravel dan aplikasi mobile dengan Flutter, dengan
      perhatian besar pada struktur data agar setiap fitur tetap rapi, ringan, dan mudah
      dikembangkan. Di luar itu saya mengeksplorasi React dan mengasah kemampuan lewat kontribusi
      ke proyek open&#8209;source.
    </ActText>
  </ActPanel>
);
