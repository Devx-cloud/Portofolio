import { cn } from "@/lib/utils";

/* Tiga blok berisi sebanyak `blocks` - dipakai di kartu skill dan di legenda. */
export const StatBar = ({ blocks, blockClass = "h-1.5", className }) => (
  <div className={cn("flex w-full items-center gap-1", className)}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn(
          "flex-1 border transition-colors duration-100 ease-pix",
          blockClass,
          i < blocks ? "stage-border stage-bg" : "border-border bg-transparent"
        )}
      />
    ))}
  </div>
);
