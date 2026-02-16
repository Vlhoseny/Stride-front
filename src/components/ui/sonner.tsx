import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "bottom-center" : "bottom-right"}
      style={isMobile ? { width: "90%" } : undefined}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:backdrop-blur-xl group-[.toaster]:bg-white/70 dark:group-[.toaster]:bg-black/60 group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-white/20 dark:group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.25)] group-[.toaster]:rounded-2xl group-[.toaster]:w-full",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
