import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
  phase: number;
}

const ELLIPSES: Ellipse[] = [
  { cx: 0.25, cy: 0.3, rx: 0.28, ry: 0.22, color: "#8b1a2f", opacity: 0.18, speedX: 0.0003, speedY: 0.0004, phase: 0 },
  { cx: 0.72, cy: 0.6, rx: 0.32, ry: 0.26, color: "#5f6937", opacity: 0.15, speedX: 0.0002, speedY: 0.0003, phase: 1.2 },
  { cx: 0.5, cy: 0.2, rx: 0.24, ry: 0.18, color: "#8b1a2f", opacity: 0.22, speedX: 0.00035, speedY: 0.00025, phase: 2.4 },
  { cx: 0.8, cy: 0.25, rx: 0.2, ry: 0.3, color: "#5f6937", opacity: 0.2, speedX: 0.00025, speedY: 0.00035, phase: 3.6 },
  { cx: 0.35, cy: 0.75, rx: 0.3, ry: 0.2, color: "#8b1a2f", opacity: 0.16, speedX: 0.0004, speedY: 0.0002, phase: 4.8 },
  { cx: 0.6, cy: 0.85, rx: 0.22, ry: 0.25, color: "#5f6937", opacity: 0.28, speedX: 0.00015, speedY: 0.00045, phase: 0.8 },
];

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f5f0e8";
      ctx.fillRect(0, 0, w, h);

      const t = performance.now();
      const mx = (mouseRef.current.x - 0.5) * 0.06;
      const my = (mouseRef.current.y - 0.5) * 0.06;

      for (const el of ELLIPSES) {
        const cx = (el.cx + Math.sin(t * el.speedX + el.phase) * 0.04 + mx) * w;
        const cy = (el.cy + Math.cos(t * el.speedY + el.phase) * 0.04 + my) * h;
        const rx = el.rx * w;
        const ry = el.ry * h;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        gradient.addColorStop(0, el.color + Math.round(el.opacity * 255).toString(16).padStart(2, "0"));
        gradient.addColorStop(1, el.color + "00");

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <img src={logo} alt="dotCasting" className="h-8 mb-2" />
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-[#1a1a1a] normal-case tracking-normal">
            La piattaforma di casting
            <br />
            più elegante d'Italia
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Connetti talenti e opportunità in un unico spazio.
          </p>
          <Separator className="w-16 my-2" />
          <Link to="/auth">
            <Button className="bg-[#8b1a2f] hover:bg-[#6e1525] text-white rounded-full px-10 h-12 text-base">
              Accedi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
