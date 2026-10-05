import { cn } from "@/lib/utils";
import { TIER_LABEL } from "../data";

/*
 * Satu petak inventory: ikon saja, tanpa nama.
 *
 * Namanya dilepas karena di papan lima kolom slotnya cuma ~60-70px - "Android
 * Studio" tidak muat di sana tanpa jadi 8px yang tidak terbaca. Game memecahkan
 * hal yang sama dengan cara yang sama: petak berisi ikon, nama dan keterangan di
 * panel detail. aria-label dan title tetap membawa namanya.
 *
 * Dua wujud:
 *   terkunci - revealed=false: petak cekung kosong. Bingkainya sudah ada sejak
 *              awal, jadi papan tidak berubah ukuran saat ikon terbuka satu per
 *              satu - yang bergerak hanya isinya.
 *   terbuka  - bingkai tebal dan ikonnya.
 *
 * Membuka = memasang tombolnya. Karena itu kedua animasi masuknya (ikon yang
 * meletup dan kilat bingkai) cukup class CSS yang jalan saat dipasang: menggulir
 * balik mengunci petaknya lagi, dan menggulir turun meletupkannya ulang - tanpa
 * state atau timer untuk melepas class.
 *
 * Ikon abu-abu sampai slotnya aktif atau disentuh kursor - 15 warna merek
 * sekaligus membuat halaman ini berisik dibanding bagian lain yang disiplin
 * navy+merah.
 */
export const SkillSlot = ({ skill, revealed = true, isActive = false, onSelect }) => {
  if (!revealed) {
    return (
      <li className="list-none">
        <div aria-hidden="true" className="pix-inset aspect-square w-full" />
      </li>
    );
  }

  return (
    <li className="list-none">
      <button
        type="button"
        /* pointerenter, bukan mouseenter: satu penangan untuk kursor maupun
           sentuhan. onClick tetap ada supaya keyboard dan layar sentuh yang
           tidak mengirim pointerenter tetap bisa memilih. */
        onPointerEnter={onSelect}
        onFocus={onSelect}
        onClick={onSelect}
        aria-pressed={isActive}
        aria-label={`${skill.name} - ${TIER_LABEL[skill.tier]}`}
        title={skill.name}
        className={cn(
          "group equip-flash pix-lift pix-panel relative flex aspect-square w-full items-center justify-center",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          isActive ? "stage-border pix-lift-active" : "hover:pix-lift-hover"
        )}
      >
        <span className="slot-pop block">
          <skill.Icon
            className={cn(
              "h-6 w-6 transition-[filter] duration-200 ease-pix sm:h-7 sm:w-7",
              skill.color,
              isActive ? "grayscale-0 animate-bob motion-reduce:animate-none" : "grayscale group-hover:grayscale-0"
            )}
          />
        </span>
      </button>
    </li>
  );
};
