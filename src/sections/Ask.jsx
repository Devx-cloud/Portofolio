import { CornerDownLeft, Loader2, RotateCcw, RefreshCw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useChatAgent } from "@/hooks/useChatAgent";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* Pertanyaan pancingan. Bukan sekadar hiasan: bagian ini menerima input bebas,
   dan tanpa contoh kebanyakan pengunjung tidak pernah mengetik apa pun karena
   tidak tahu apa yang boleh ditanyakan. Ketiganya sengaja dijawab dengan baik
   oleh system prompt di api/profile.js. */
const SUGGESTIONS = [
  "Apa keahlian utama Deva?",
  "Ceritakan proyek Loka Pura",
  "Bagaimana cara menghubunginya?",
];

/*
 * Tanya AI. Satu-satunya bagian halaman ini yang interaktif dua arah, dan
 * satu-satunya yang punya bingkai penuh - bingkainya justru yang menandai
 * "di sini kamu boleh mengetik" tanpa perlu instruksi apa pun.
 */
export const Ask = () => {
  const { messages, input, setInput, isLoading, ask, retry, reset, canRetry, handleSubmit, scrollRef } =
    useChatAgent();
  const started = messages.length > 1;
  const reduced = useReducedMotion();

  return (
    <section id="tanya" data-rail="Tanya AI" className="shell py-24 md:py-36">
      <SectionHead index="04" title="Tanya AI" meta="Ditenagai Gemini" />

      <Reveal className="mt-12 md:mt-16">
        <div className="mx-auto max-w-4xl border border-line bg-panel">
          {/* Bar kepala: menyatakan ini mesin, bukan Deva sendiri. Pembedaan
              itu penting supaya jawaban yang keliru tidak terbaca sebagai
              pernyataan langsung dari orangnya. */}
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
            <span className="eyebrow text-ink">Asisten Portofolio</span>

            <span className="flex items-center gap-5">
              {/* Jalan keluar. Percakapan yang sudah panjang atau melenceng
                  tidak punya cara dibereskan selain memuat ulang halaman -
                  dan memuat ulang halaman berarti kehilangan posisi gulungan
                  di halaman sepanjang ini. */}
              {started && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={isLoading}
                  className="eyebrow flex items-center gap-2 transition-colors duration-300 hover:text-red disabled:opacity-40"
                >
                  <RefreshCw size={12} />
                  Mulai ulang
                </button>
              )}

              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "block size-1.5 rounded-full",
                    isLoading ? "bg-red animate-blink" : "bg-red"
                  )}
                />
                <span className="eyebrow">{isLoading ? "Memproses" : "Daring"}</span>
              </span>
            </span>
          </div>

          {/* Transkrip.
              aria-live="polite": jawaban datang secara asinkron, dan tanpa ini
              pengguna pembaca layar tidak pernah diberi tahu bahwa jawabannya
              sudah tiba. */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="h-[24rem] space-y-6 overflow-y-auto px-4 py-6 md:h-[26rem] md:px-6"
          >
            {messages.map((message, i) => (
              <Bubble key={i} message={message} reduced={reduced} />
            ))}

            {canRetry && (
              <motion.button
                type="button"
                onClick={retry}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="flex items-center gap-2 border border-red px-3 py-2 text-red transition-colors duration-300 hover:bg-red hover:text-on-red"
              >
                <RotateCcw size={13} />
                <span className="eyebrow">Coba lagi</span>
              </motion.button>
            )}

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-muted"
                >
                  <Loader2 className="size-4 animate-spin text-red" />
                  <span className="eyebrow">Mengetik</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Saran hilang begitu percakapan dimulai: setelah ada jawaban di
              layar, tombol-tombol ini berubah dari petunjuk jadi gangguan. */}
          {!started && (
            <div className="flex flex-wrap gap-2 border-t border-line px-4 py-4 md:px-6">
              {SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  disabled={isLoading}
                  className="border border-line px-3 py-2 text-left text-xs text-muted transition-colors duration-300 hover:border-red hover:text-ink disabled:opacity-40"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-line px-4 py-3 md:px-6">
            <span aria-hidden="true" className="font-mono text-sm text-red">
              &gt;
            </span>
            <label htmlFor="ask-input" className="sr-only">
              Pertanyaan untuk asisten portofolio
            </label>
            <input
              id="ask-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang Deva..."
              disabled={isLoading}
              autoComplete="off"
              className="field flex-1 border-b-0 py-2 font-mono text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Kirim pertanyaan"
              className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition-colors duration-300 hover:border-red hover:text-red disabled:pointer-events-none disabled:opacity-40"
            >
              <CornerDownLeft size={15} />
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
};

const Bubble = ({ message, reduced }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className={cn("max-w-[46rem]", isUser && "ml-auto text-right")}
    >
      <span className={cn("eyebrow mb-2 block", isUser ? "text-muted" : "text-red")}>
        {isUser ? "Kamu" : message.isError ? "Gagal" : "Asisten"}
      </span>
      {/* whitespace-pre-line: model sering membalas dengan daftar bernomor
          yang dipisah baris baru; tanpa ini semuanya menempel jadi satu
          paragraf panjang. */}
      {/* Error tidak dibedakan cuma lewat warna - labelnya di atas juga
          berubah jadi "Gagal". Status yang hanya disampaikan warna tidak
          terbaca oleh sebagian pengunjung. */}
      <p
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed md:text-base",
          isUser ? "text-ink" : message.isError ? "text-red" : "text-muted"
        )}
      >
        {message.content}
      </p>
    </motion.div>
  );
};
