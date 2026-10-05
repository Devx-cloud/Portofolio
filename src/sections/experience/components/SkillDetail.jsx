import { motion } from "framer-motion";
import { pixEase } from "../constants";
import { TIER_LABEL, categoryLabel, pad2, projects, projectsUsing } from "../data";

/*
 * Panel detail - satu skill, yang sedang disorot di grid.
 *
 * Satu-satunya tempat ikon merek tampil besar dan berwarna penuh, jadi warna
 * punya satu titik fokus alih-alih tersebar di 15 petak sekaligus.
 *
 * Baris "Dipakai di" adalah jembatan ke Quest Log: tiap project yang memakai
 * skill ini jadi tombol yang menggulir ke kartunya. Skill yang belum ada di
 * project mana pun tetap diberi baris itu - kosongnya juga informasi, dan
 * baris yang muncul-hilang akan menggeser panel sticky ini naik-turun.
 *
 * Isi diberi key per skill tanpa AnimatePresence. Versi stage Skills menunggu
 * animasi keluar selesai sebelum yang baru masuk; saat kursor menyapu grid, itu
 * terasa seperti panel yang tertinggal di belakang kursor. Di sini yang baru
 * langsung menggantikan, dan yang dianimasikan hanya kedatangannya.
 */
export const SkillDetail = ({ ref, skill, onOpenProject }) => {
  const usedIn = projectsUsing(skill.id);

  return (
    <div ref={ref} className="pix-panel crt relative scroll-mt-28 px-4 pt-7 pb-4 sm:px-5">
      <span className="pixel-font absolute -top-3 left-4 pix-chip stage-border stage-bg-soft stage-text-bright px-3 py-1 text-pix-sm uppercase whitespace-nowrap">
        Detail
      </span>

      <motion.div
        key={skill.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.16, ease: pixEase }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-4">
          {/* equip-flash: cincin aksen yang melebar lalu padam setiap skill
              berganti - "barang ini baru dipasang". Ikut terpicu ulang karena
              pembungkusnya diberi key per skill. */}
          <div className="equip-flash pix-inset flex h-14 w-14 shrink-0 items-center justify-center">
            <skill.Icon className={`h-8 w-8 ${skill.color}`} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="pixel-font-null truncate text-base uppercase tracking-[1px] text-foreground">
              {skill.name}
            </h4>
            {/* Tier disebut dengan KATA saja. Stat bar tiga balok yang dulu ada
                di bawah baris ini sudah dibuang: ia mengulang keterangan yang
                sama dalam bentuk ukuran, dan karena selebar panel, ia justru
                balok merah terpanjang di kolom ini - lebih menarik perhatian
                daripada nama skill-nya sendiri. */}
            <p className="pixel-font mt-1 text-pix-sm uppercase text-muted-foreground">
              {categoryLabel(skill.category)} ·{" "}
              <span className="stage-text-bright">{TIER_LABEL[skill.tier]}</span>
            </p>
          </div>
        </div>

        {/* min-h dua baris: deskripsi satu baris dan dua baris bergantian saat
            kursor menyapu grid, dan tanpa ini baris "Dipakai di" di bawahnya
            ikut naik-turun. */}
        <p className="min-h-10 text-xs leading-relaxed text-foreground/80">{skill.desc}</p>

        <div className="border-t-2 stage-border-soft pt-3">
          <p className="pixel-font text-pix-sm uppercase text-foreground/70">
            Dipakai di {pad2(usedIn.length)} / {pad2(projects.length)} project
          </p>

          <div className="mt-2 flex min-h-8 flex-wrap items-center gap-2">
            {usedIn.length ? (
              usedIn.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onOpenProject(project.id)}
                  className="group pix-chip stage-border-soft pixel-font flex items-center gap-2 px-2 py-1.5 text-pix-sm uppercase text-foreground transition-all duration-100 ease-pix hover:stage-border hover:stage-bg-soft hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="stage-text-bright tabular-nums">
                    {pad2(projects.indexOf(project) + 1)}
                  </span>
                  {project.title}
                  <span aria-hidden="true" className="stage-text group-hover:text-foreground">
                    ▶
                  </span>
                </button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                Belum ada di project yang dipamerkan di sini.
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
