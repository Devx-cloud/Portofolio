import { useEffect } from "react";

/* Judul tab per halaman. Situs ini SPA: tanpa ini judulnya tetap satu untuk
   semua rute, riwayat peramban jadi deretan entri bernama sama, dan pembaca
   layar tidak mendengar apa pun saat pindah stage.

   useEffect biasa, bukan <title> di dalam komponen: yang terakhir bergantung pada
   cara React memungut elemen <title> di head, dan dengan transisi yang menunggu
   halaman lama keluar dulu, sesaat tidak ada satu pun <title> yang dirender. */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
