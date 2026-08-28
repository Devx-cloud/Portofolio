import { TIERS } from "../data";
import { StatBar } from "./StatBar";

export const TierLegend = () => (
  <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t-2 border-border pt-5 md:mt-9">
    {Object.entries(TIERS).map(([key, tier]) => (
      <div key={key} className="flex items-center gap-2">
        <StatBar blocks={tier.blocks} blockClass="h-2" className="w-12" />
        <span className="pixel-font text-pix-xs uppercase text-muted-foreground">{tier.label}</span>
      </div>
    ))}
  </div>
);
