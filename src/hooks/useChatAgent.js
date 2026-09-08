import { useCallback, useEffect, useRef, useState } from "react";

/*
 * State percakapan untuk bagian Tanya AI.
 *
 * Riwayat disimpan penuh dan ditampilkan sebagai transkrip. Perlu dicatat
 * bahwa /api/chat TIDAK menerima riwayat - tiap pertanyaan dikirim sendirian,
 * jadi model tidak mengingat giliran sebelumnya. Transkrip di layar murni
 * untuk pengunjung (supaya bisa membaca ulang jawaban tadi), bukan konteks
 * untuk modelnya. Kalau suatu saat pertanyaan lanjutan ("tadi yang mana?")
 * perlu benar-benar bekerja, `messages` harus ikut dikirim di body dan
 * api/chat.js harus diubah menerimanya.
 *
 * Kegagalan diperlakukan sebagai keadaan yang BISA DIPULIHKAN, bukan sebagai
 * pesan mati. Bagian ini bergantung pada API pihak ketiga yang memang kadang
 * penuh (429/503), jadi gagal sesekali bukan kejadian luar biasa - ia harus
 * punya jalan keluar. Pesan error ditandai `isError` supaya antarmuka bisa
 * menawarkan "coba lagi", dan `lastQuestion` disimpan supaya tombol itu tidak
 * menuntut pengunjung mengetik ulang pertanyaannya.
 */
const INITIAL_GREETING =
  "Halo. Saya asisten portofolio Deva - tanya apa saja soal pengalaman, stack, atau proyeknya.";

const greeting = () => [{ role: "assistant", content: INITIAL_GREETING }];

export const useChatAgent = () => {
  const [messages, setMessages] = useState(greeting);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const lastQuestion = useRef("");

  /* Gulung ke bawah tiap transkrip berubah. Dijalankan juga saat isLoading
     berubah supaya baris "Mengetik..." ikut terlihat, bukan tersembunyi di
     bawah lipatan. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const send = useCallback(async (question) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok) {
        /* Server sudah mengirim pesan yang ramah untuk sebagian besar
           kegagalan; pakai itu kalau ada, dan siapkan cadangan kalau badan
           responsnya ternyata bukan JSON. */
        let message =
          response.status === 503
            ? "Server AI lagi sibuk. Coba tanya lagi beberapa saat lagi ya."
            : "Gagal menghubungi server. Coba lagi ya.";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          /* badan bukan JSON - pakai pesan cadangan di atas */
        }
        throw new Error(message);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      /* TypeError = fetch gagal total (offline / server mati), belum sempat
         dapat respons sama sekali - penyebabnya beda dan saran perbaikannya
         juga beda, jadi dipisah dari error dengan status. */
      const friendly =
        error.name === "TypeError"
          ? "Nggak bisa terhubung ke server. Cek koneksi internetmu lalu coba lagi."
          : error.message || "Terjadi kesalahan. Coba lagi ya.";
      setMessages((prev) => [...prev, { role: "assistant", content: friendly, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ask = useCallback(
    (raw) => {
      const question = raw.trim();
      if (!question || isLoading) return;

      lastQuestion.current = question;
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      send(question);
    },
    [isLoading, send]
  );

  /* Coba lagi membuang pesan error terakhir lalu mengirim ulang pertanyaan
     yang sama - pertanyaan pengunjung TIDAK diulang di transkrip, karena ia
     memang tidak bertanya dua kali. Yang gagal adalah jawabannya. */
  const retry = useCallback(() => {
    if (isLoading || !lastQuestion.current) return;
    setMessages((prev) => {
      const trimmed = [...prev];
      if (trimmed[trimmed.length - 1]?.isError) trimmed.pop();
      return trimmed;
    });
    send(lastQuestion.current);
  }, [isLoading, send]);

  const reset = useCallback(() => {
    if (isLoading) return;
    lastQuestion.current = "";
    setInput("");
    setMessages(greeting());
  }, [isLoading]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      ask(input);
    },
    [ask, input]
  );

  const canRetry = !isLoading && Boolean(messages[messages.length - 1]?.isError);

  return {
    messages,
    input,
    setInput,
    isLoading,
    ask,
    retry,
    reset,
    canRetry,
    handleSubmit,
    scrollRef,
  };
};
