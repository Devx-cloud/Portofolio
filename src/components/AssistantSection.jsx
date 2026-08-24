import { Send, Loader2 } from "lucide-react";
import { useChatAgent } from "../hooks/useChatAgent";
import { useTypewriter } from "../hooks/useTypewriter";
import { RoomLamp } from "./RoomLamp";

export const AssistantSection = () => {
  const { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef } = useChatAgent(
    "Halo! Saya asisten AI Deva Surya. Tanyakan apa saja tentang profil, skill, atau proyek Deva."
  );

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const typedReply = useTypewriter(lastAssistantMessage?.content ?? "");

  return (
    /* night-scene: ruangannya selalu malam. Tanpa ini, di tema terang panel
       chat jadi putih di depan ruangan gelap - dua dunia yang bertabrakan. */
    <section
      className="night-scene relative flex min-h-[75vh] flex-col items-center overflow-hidden bg-background px-4 py-16"
      /* Aksen dideklarasikan ULANG di sini, bukan diwarisi dari LevelLayout:
         custom property menyubstitusi var() di elemen tempat ia ditulis, jadi
         warisan akan membawa --primary tema terang ke dalam adegan malam. */
      style={{ "--stage-accent": "var(--primary)" }}
    >
      {/* Ruangan: lapisan paling belakang.

          --room-lift menaikkan isinya. Kotak gambar dibuat lebih tinggi dari
          section lalu ditambat ke tepi BAWAH, jadi kelebihannya keluar lewat
          atas dan langit-langit terpotong, bukan menyisakan celah di bawah.

          object-position sengaja tidak dipakai: object-cover di sini selalu
          pas di sumbu tinggi (section jauh lebih jangkung dari rasio 16:9
          gambarnya), jadi tidak ada potongan vertikal untuk digeser dan
          object-top/-bottom tidak akan berefek apa pun. */}
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

      {/* Turun 48px mengikuti karakter (top-12), supaya tumpang tindih panel
          dengan tangannya tetap sama seperti sebelumnya */}
      <div className="relative z-10 w-full max-w-3xl mt-68 md:mt-84 pix-panel crt flex flex-col">
        <span className="absolute -top-4 left-3 pix-chip stage-border stage-bg-soft stage-text px-3 py-1 pixel-font text-pix-xs md:text-xs z-10">
          DEV_X AI
        </span>

        <div ref={messagesContainerRef} className="flex-1 h-[55vh] overflow-y-auto p-4 pt-8 space-y-4">
          {!isLoading && lastAssistantMessage && (
            <div className="text-left text-sm leading-relaxed text-foreground/90">
              {typedReply}
            </div>
          )}
          {isLoading && (
            <div className="text-left text-sm text-foreground/90 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin stage-text" />
              <span className="pixel-font text-muted-foreground">Mengetik...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t-2 stage-border-soft">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang Deva..."
              className="w-full pl-4 pr-12 py-3 pix-inset text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 stage-bg-soft stage-border stage-text border-2 hover:stage-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
