import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, fieldClass, labelClass } from "./Panel";

const Field = ({ id, label, type = "text", className, ...props }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <input type={type} id={id} name={id} className={cn(fieldClass, className)} {...props} />
  </div>
);

export const MessageForm = () => (
  <Panel label="Kirim Pesan">
    {/* NOTE: submit belum terhubung ke mana pun - pasang handler/action di sini nanti. */}
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Nama" required autoComplete="name" placeholder="Nama kamu" />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
        />
      </div>

      <Field
        id="subject"
        label="Subjek"
        placeholder="Kolaborasi proyek, tawaran kerja, dll."
      />

      <div>
        <label htmlFor="message" className={labelClass}>
          Pesan
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={cn(fieldClass, "resize-none")}
          placeholder="Halo Deva, saya ingin membahas tentang..."
        />
      </div>

      <button
        type="submit"
        className="pixel-font flex w-full items-center justify-center gap-2 pix-chip stage-border stage-bg-soft stage-text-bright stage-shadow px-4 py-3 text-pix-xs uppercase transition-all duration-100 ease-pix hover:stage-glow active:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Kirim Pesan
        <Send size={14} />
      </button>
    </form>
  </Panel>
);
