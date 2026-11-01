import { PROFILE } from "@shared/portfolio";
import { projects, skills } from "@/sections/experience/data";
import { cn } from "@/lib/utils";
import { panelSlot, panelWrap } from "../constants";

/*
 * Titik singgah di antara dua panel babak. Scroll yang panjang membuat jarak antar
 * panel lama terlihat, jadi jarak itu diisi jalur dan keterangan singkat - dibaca
 * sebagai perjalanan dari satu babak ke babak berikutnya.
 *
 * Isinya dibaca dari data asli (skill, project, profil), bukan teks hiasan: ikut
 * berubah saat datanya berubah, dan tidak mengarang apa pun.
 *
 * Sengaja lebih sederhana dari ActPanel (pix-chip, tanpa siku dan garis pindai)
 * supaya panel tetap jadi hal pertama yang dibaca.
 */
const CORE_SKILLS = skills.filter((skill) => skill.tier === "core");

const WORK_STATUS = [PROFILE.work.type, PROFILE.work.mode, PROFILE.location];

const Waypoint = ({ label, children }) => (
  <>
    {/* Jalur memanjang melewati kedua tepi jarak, ujungnya tertutup panel di
        atas dan bawah - jadi ia selalu tersambung, setinggi apa pun panelnya. */}
    <div aria-hidden="true" className="act-rail absolute inset-y-0 left-6 w-1" />
    <div
      aria-hidden="true"
      className="absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 border-2 border-pit stage-bg"
    />
    <div className="pix-chip flex w-fit max-w-full flex-col gap-2.5 px-3 py-2.5">
      <p className="pixel-font text-pix-sm uppercase leading-none stage-text-bright">{label}</p>
      {children}
    </div>
  </>
);

const SkillsWaypoint = () => (
  <Waypoint label="Inventaris · Skill utama">
    <ul className="flex flex-wrap gap-1">
      {CORE_SKILLS.map(({ id, name, Icon, color }) => (
        <li key={id} title={name} className="pix-inset flex h-8 w-8 items-center justify-center">
          <Icon aria-hidden="true" className={cn("h-4 w-4", color)} />
          <span className="sr-only">{name}</span>
        </li>
      ))}
    </ul>
  </Waypoint>
);

const ProjectsWaypoint = () => (
  <Waypoint label="Jejak · Project">
    <ul className="flex flex-col gap-1.5">
      {projects.map(({ id, year, title, role }) => (
        <li key={id} className="flex items-baseline gap-2">
          <span className="pixel-font shrink-0 text-pix-sm leading-none stage-text">{year}</span>
          <span className="pixel-font shrink-0 text-pix-sm leading-none text-foreground">
            {title}
          </span>
          <span className="hidden truncate text-xs text-foreground/60 md:inline">{role}</span>
        </li>
      ))}
    </ul>
  </Waypoint>
);

const StatusWaypoint = () => (
  <Waypoint label="Status · Kerja sama">
    <ul className="flex flex-wrap gap-1">
      {WORK_STATUS.map((item) => (
        <li key={item} className="pix-inset px-2 py-1 text-xs text-foreground/80">
          {item}
        </li>
      ))}
    </ul>
  </Waypoint>
);

const WAYPOINTS = [SkillsWaypoint, ProjectsWaypoint, StatusWaypoint];

/* Tiap titik singgah memakai panelWrap yang sama dengan baris panel, digeser
   setengah baris: titik tengahnya jatuh tepat di antara dua panel, dan rata
   kiri-kanannya otomatis mengikuti panel di semua breakpoint. */
export const ActInterludes = () =>
  WAYPOINTS.map((Waypoint, i) => (
    <div
      key={i}
      className={cn(panelWrap, "absolute inset-x-0 h-1/4")}
      style={{ top: `${(i + 0.5) * 25}%` }}
    >
      <div className={cn(panelSlot, "relative flex items-center self-stretch pl-12")}>
        <Waypoint />
      </div>
    </div>
  ));
