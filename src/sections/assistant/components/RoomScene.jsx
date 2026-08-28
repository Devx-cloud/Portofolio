import { RoomLamp } from "./RoomLamp";

/*
 * Latar stage Ask AI: ruangan, lampu gantung, dan karakter.
 *
 * --room-lift menaikkan isi ruangan. Kotak gambar dibuat lebih tinggi dari
 * section lalu ditambat ke tepi BAWAH, jadi kelebihannya keluar lewat atas dan
 * langit-langit terpotong, bukan menyisakan celah di bawah.
 *
 * object-position sengaja tidak dipakai: object-cover di sini selalu pas di
 * sumbu tinggi (section jauh lebih jangkung dari rasio 16:9 gambarnya), jadi
 * tidak ada potongan vertikal untuk digeser.
 */
export const RoomScene = () => (
  <>
    <img
      src="/room-without-lamp.png"
      alt=""
      aria-hidden="true"
      style={{ "--room-lift": "35px" }}
      className="sprite pointer-events-none absolute inset-x-0 bottom-0 z-0 w-full select-none object-cover
                 top-[calc(-1*var(--room-lift))] h-[calc(100%+var(--room-lift))]"
    />

    <RoomLamp />

    <img
      src="/ai-ask.png"
      alt="Deva Surya"
      className="sprite absolute left-1/2 -translate-x-1/2 top-12 w-80 h-80 md:w-[28rem] md:h-[28rem] object-cover z-[1] pointer-events-none drop-shadow-[4px_4px_0_hsl(var(--pit))]"
    />
  </>
);
