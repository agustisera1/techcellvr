import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-5 text-xs text-muted-foreground sm:flex-row">
        <span>Techcell</span>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
