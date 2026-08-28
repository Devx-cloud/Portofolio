import { cn } from "@/lib/utils";

/* Panel bertab, mengikuti bahasa visual stage Profile & Skills. */
export const Panel = ({ label, className, children }) => (
  <div className={cn("relative pix-panel crt px-5 pt-7 pb-5", className)}>
    <span className="pixel-font absolute -top-3 left-4 pix-chip stage-border stage-bg-soft stage-text px-3 py-1 text-pix-xs uppercase whitespace-nowrap">
      {label}
    </span>
    {children}
  </div>
);

export const labelClass = "pixel-font mb-2 block text-pix-xs uppercase text-muted-foreground";

export const fieldClass =
  "w-full pix-inset px-3 py-3 text-sm transition-colors duration-100 ease-pix placeholder:text-muted-foreground/60 focus:stage-border focus:outline-none";
