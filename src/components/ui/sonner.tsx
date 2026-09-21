import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0f0f0f] group-[.toaster]:text-white group-[.toaster]:border-0 group-[.toaster]:rounded-2xl group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-white",
          description: "group-[.toast]:text-white/70",
          icon: "group-[.toast]:text-white",
          error:
            "group-[.toaster]:bg-[var(--brand-800)] group-[.toaster]:text-white group-[.toaster]:border-0",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#0f0f0f] group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-white/15 group-[.toast]:text-white group-[.toast]:rounded-full",
          closeButton:
            "group-[.toast]:bg-[#0f0f0f] group-[.toast]:text-white group-[.toast]:border-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
