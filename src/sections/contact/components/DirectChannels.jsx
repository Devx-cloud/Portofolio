import { Download, Mail, MapPin } from "lucide-react";
import { CONTACT_EMAIL, CV_URL, LOCATION, socialLinks } from "@/data/profile";
import { Panel } from "./Panel";

const ChannelRow = ({ icon: Icon, label, value, href }) => {
  const body = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center pix-chip transition-colors duration-100 ease-pix group-hover:stage-border group-hover:stage-text">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="pixel-font block text-pix-xs uppercase text-muted-foreground">{label}</span>
        <span className="block truncate text-sm text-foreground/90 transition-colors duration-100 ease-pix group-hover:stage-text">
          {value}
        </span>
      </span>
    </>
  );

  const className = "group flex items-center gap-3";
  return href ? (
    <a href={href} className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
};

export const DirectChannels = () => (
  <Panel label="Jalur Langsung" className="h-full">
    <div className="flex h-full flex-col gap-4">
      <ChannelRow icon={Mail} label="Email" value={CONTACT_EMAIL} href={`mailto:${CONTACT_EMAIL}`} />
      <ChannelRow icon={MapPin} label="Lokasi" value={LOCATION} />

      <div className="border-t-2 border-border pt-4">
        <span className="pixel-font mb-3 block text-pix-xs uppercase text-muted-foreground">
          Sosial
        </span>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              title={name}
              className="flex h-9 w-9 items-center justify-center pix-chip text-foreground/70 transition-colors duration-100 ease-pix hover:stage-border hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <a
        href={CV_URL}
        download
        className="pixel-font mt-auto flex items-center justify-center gap-2 pix-chip px-3 py-3 text-pix-xs uppercase text-foreground/80 transition-all duration-100 ease-pix hover:stage-border hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Download className="h-4 w-4" />
        Unduh CV
      </a>
    </div>
  </Panel>
);
