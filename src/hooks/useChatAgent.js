import { useEffect, useRef, useState } from "react";

/* Harus sama dengan MAX_MESSAGE_LENGTH di api/chat.js - server tetap memeriksanya
   sendiri, batas di sini hanya supaya pengunjung tidak mengetik sesuatu yang
   pasti ditolak. */
export const MAX_MESSAGE_LENGTH = 500;

/* Sedikit di bawah maxDuration fungsi (30 detik): kalau server sampai menggantung,
   yang tampil adalah pesan kita, bukan "Mengetik..." tanpa ujung. */
const REQUEST_TIMEOUT_MS = 28_000;

const STATUS_MESSAGES = {
  429: "Terlalu banyak pertanyaan dalam waktu singkat. Tunggu sebentar lalu coba lagi ya.",
  503: "Server AI lagi sibuk. Coba tanya lagi beberapa saat lagi ya.",
};

export const useChatAgent = (initialMessage) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: initialMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const controllerRef = useRef(null);

  /* Pesan baru = pertukaran baru: kotak dibaca dari awal, bukan dari ujung
     bawahnya. Riwayat memang dikosongkan tiap pertanyaan (lihat handleSubmit),
     jadi yang perlu direset adalah posisi gulirnya. */
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({ top: 0 });
  }, [messages]);

  // Pindah halaman saat permintaan masih jalan: hentikan, jangan biarkan menggantung.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    // Reset history on every question so the dialogue box only ever shows the latest exchange.
    setMessages([{ role: "user", content: userMessage }]);
    setIsLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    const showReply = (content) =>
      setMessages([{ role: "user", content: userMessage }, { role: "assistant", content }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = STATUS_MESSAGES[response.status] ?? "Gagal menghubungi server. Coba lagi ya.";
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
        } catch {
          // Badan bukan JSON (mis. halaman galat milik platform): pakai pesan bawaan di atas.
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      showReply(data.reply || "Balasannya kosong. Coba tanya dengan cara lain ya.");
    } catch (error) {
      // Ditinggalkan karena halaman ditutup, bukan karena kehabisan waktu: tidak ada yang perlu ditampilkan.
      if (controller.signal.aborted && !timedOut) return;

      console.error(error);
      // TypeError = fetch gagal total (offline / server mati), belum sempat dapat respons.
      const friendly = timedOut
        ? "Balasannya terlalu lama datang. Coba tanya lagi ya."
        : error.name === "TypeError"
          ? "Nggak bisa terhubung ke server. Cek koneksi internetmu lalu coba lagi."
          : error.message || "Terjadi kesalahan. Coba lagi ya.";
      showReply(friendly);
    } finally {
      clearTimeout(timer);
      if (controllerRef.current === controller) controllerRef.current = null;
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef };
};
