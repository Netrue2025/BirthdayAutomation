import { cn } from "@/utils/cn";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ title, eyebrow, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-bold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}
