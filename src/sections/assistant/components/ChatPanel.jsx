import { Loader2, Send } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/hooks/useChatAgent";

/* Panel percakapan. Hanya balasan TERAKHIR yang ditampilkan - useChatAgent
   mengosongkan riwayat tiap pertanyaan baru, jadi kotak dialog ini selalu berisi
   satu pertukaran saja, seperti dialogue box di game.

   mt-68/84 menurunkannya mengikuti karakter (top-12) supaya tumpang tindih panel
   dengan tangannya tetap sama.

   Tinggi kotak pesan: tumbuh mengikuti isi, dengan batas atas 45svh lalu digulir.
   Versi lama menulis `flex-1 h-[55vh]`, tapi flex-basis pada kolom tanpa tinggi
   pasti mengalahkan `height` - terukur 71px, bukan 495px - jadi batas itu tidak
   pernah berlaku dan gulirnya mati suri.

   Aksesibilitas balasan: yang tampil diketik huruf demi huruf, dan itu
   disembunyikan dari pembaca layar (aria-hidden) supaya tidak dibacakan per huruf.
   Sebagai gantinya salinan LENGKAP ada di region aria-live: diumumkan sekali,
   sesudah balasan datang. Salinan itu sudah ada di DOM sejak awal sebagai
   sapaan, jadi tidak diumumkan saat halaman dibuka - hanya perubahannya. */
export const ChatPanel = ({
  containerRef,
  reply,
  fullReply,
  typing,
  onSkip,
  isLoading,
  input,
  onInputChange,
  onSubmit,
}) => (
  <div className="relative z-10 w-full max-w-3xl mt-68 md:mt-84 pix-panel crt flex flex-col">
    <span className="absolute -top-4 left-3 pix-chip stage-border stage-bg-soft stage-text-bright px-3 py-1 pixel-font text-pix-xs md:text-xs z-10">
      DEV_X AI
    </span>

    <div ref={containerRef} className="relative max-h-[45svh] min-h-24 overflow-y-auto p-4 pt-8">
      <div aria-live="polite" className="sr-only">
        {!isLoading && fullReply}
      </div>

      {!isLoading && reply && (
        <div
          aria-hidden="true"
          className="whitespace-pre-line text-left text-sm leading-relaxed text-foreground/90"
        >
          {reply}
        </div>
      )}

      {isLoading && (
        <div role="status" className="flex items-center gap-2 text-left text-sm text-foreground/90">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin stage-text" />
          <span className="pixel-font text-pix-sm text-muted-foreground">Mengetik...</span>
        </div>
      )}

      {/* Hanya selagi diketik. Balasan bisa cukup panjang untuk membuat pengunjung
          menunggu kalimat yang sudah selesai ditulis - dan tombol ini satu-satunya
          jalan pintas bagi yang memakai keyboard. */}
      {typing && (
        <button
          type="button"
          onClick={onSkip}
          className="pixel-font pix-chip stage-border-soft absolute bottom-2 right-3 px-2 py-1 text-pix-sm uppercase text-foreground/80 transition-colors duration-100 ease-pix hover:stage-border hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Lewati &raquo;
        </button>
      )}
    </div>

    <form onSubmit={onSubmit} className="p-3 border-t-2 stage-border-soft">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Tanya sesuatu tentang Deva..."
          aria-label="Pertanyaan untuk asisten AI"
          maxLength={MAX_MESSAGE_LENGTH}
          autoComplete="off"
          enterKeyHint="send"
          className="w-full pl-4 pr-12 py-3 pix-inset text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:stage-border"
          disabled={isLoading}
        />
        <button
          type="submit"
          aria-label="Kirim pertanyaan"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 p-2 stage-bg-soft stage-border stage-text border-2 hover:stage-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send aria-hidden="true" className="w-4 h-4" />
        </button>
      </div>
    </form>
  </div>
);
