import { Loader2, Send } from "lucide-react";

/* Panel percakapan. Hanya balasan TERAKHIR yang ditampilkan - useChatAgent
   mengosongkan riwayat tiap pertanyaan baru, jadi kotak dialog ini selalu berisi
   satu pertukaran saja, seperti dialogue box di game.

   mt-68/84 menurunkannya mengikuti karakter (top-12) supaya tumpang tindih panel
   dengan tangannya tetap sama. */
export const ChatPanel = ({
  containerRef,
  reply,
  isLoading,
  input,
  onInputChange,
  onSubmit,
}) => (
  <div className="relative z-10 w-full max-w-3xl mt-68 md:mt-84 pix-panel crt flex flex-col">
    <span className="absolute -top-4 left-3 pix-chip stage-border stage-bg-soft stage-text-bright px-3 py-1 pixel-font text-pix-xs md:text-xs z-10">
      DEV_X AI
    </span>

    <div ref={containerRef} className="flex-1 h-[55vh] overflow-y-auto p-4 pt-8 space-y-4">
      {!isLoading && reply && (
        <div className="text-left text-sm leading-relaxed text-foreground/90">{reply}</div>
      )}
      {isLoading && (
        <div className="text-left text-sm text-foreground/90 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin stage-text" />
          <span className="pixel-font text-muted-foreground">Mengetik...</span>
        </div>
      )}
    </div>

    <form onSubmit={onSubmit} className="p-3 border-t-2 stage-border-soft">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
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
);
