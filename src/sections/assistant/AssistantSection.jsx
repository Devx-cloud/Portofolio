import { useEffect, useState } from "react";
import { useChatAgent } from "@/hooks/useChatAgent";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ChatPanel } from "./components/ChatPanel";
import { RoomScene } from "./components/RoomScene";

/* Sapaan pembuka mengikuti jam pengunjung, dan contoh pertanyaannya diambil acak.
   Kalimat yang persis sama di tiap kunjungan terbaca sebagai teks templat; contoh
   konkret juga lebih mudah ditiru daripada "tanyakan apa saja" - kotak kosong
   adalah bagian tersulit dari memulai obrolan. */
const SALAM = [
  [11, "Selamat pagi"],
  [15, "Selamat siang"],
  [19, "Selamat sore"],
  [24, "Selamat malam"],
];

const EXAMPLE_QUESTIONS = [
  "Proyek apa yang paling menarik?",
  "Deva kuliah di mana?",
  "Apa skill utama Deva?",
  "Bagaimana cara menghubungi Deva?",
  "Deva bisa bantu bikin aplikasi mobile?",
];

const makeGreeting = () => {
  const hour = new Date().getHours();
  const salam = SALAM.find(([until]) => hour < until)[1];
  const example = EXAMPLE_QUESTIONS[Math.floor(Math.random() * EXAMPLE_QUESTIONS.length)];
  return `${salam}! Saya DEV_X AI, asisten portofolio Deva Surya. Anda bisa bertanya soal skill, proyek, pendidikan, atau cara bekerja sama dengan Deva. Misalnya: "${example}"`;
};

/* Batas waktu mengetik. Balasan 400 karakter pada 20ms/karakter butuh 8 detik -
   dipadatkan supaya tidak pernah lebih lama dari ini, berapa pun panjangnya. */
const TYPE_MAX_MS = 2500;

export const AssistantSection = () => {
  // Diundi sekali per kunjungan, bukan per render - kalau tidak, sapaannya berganti saat mengetik.
  const [greeting] = useState(makeGreeting);
  const { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef } =
    useChatAgent(greeting);
  const reducedMotion = useReducedMotion();

  const lastReply = [...messages].reverse().find((m) => m.role === "assistant");
  const fullReply = lastReply?.content ?? "";

  /* "Dilewati" dicatat sebagai balasan mana yang dilewati, bukan boolean, lalu
     dilepas begitu pertanyaan baru dikirim. Yang kedua perlu karena balasan yang
     TEKS-nya persis sama dengan yang dilewati tadi tetap akan dianggap dilewati. */
  const [skippedReply, setSkippedReply] = useState(null);
  useEffect(() => {
    if (isLoading) setSkippedReply(null);
  }, [isLoading]);
  const instant = reducedMotion || skippedReply === fullReply;

  const typedReply = useTypewriter(fullReply, 20, { maxMs: TYPE_MAX_MS, instant });
  const typing = !instant && typedReply.length < fullReply.length;

  return (
    /* min-h mengisi layar di bawah bar (5rem): dengan 75vh dulu, gambar ruangan
       berakhir di tengah layar dan menyisakan pita datar dengan garis sambungan
       yang terlihat di bawahnya. svh, bukan vh, supaya tidak melebihi layar HP
       yang bilah alamatnya sedang tampil. */
    <section className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center overflow-hidden bg-background px-4 py-16">
      <RoomScene />

      <ChatPanel
        containerRef={messagesContainerRef}
        reply={lastReply ? typedReply : ""}
        fullReply={fullReply}
        typing={typing}
        onSkip={() => setSkippedReply(fullReply)}
        isLoading={isLoading}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </section>
  );
};
