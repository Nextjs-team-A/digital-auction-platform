"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/page.module.css";

const animationState = {
    w: 0,
    h: 0,
    dpr: 1,
    reducedMotion: false,
    pointer: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        active: false,
        down: false,
        lastX: 0,
        lastY: 0,
    },
};

class Star {
    constructor(
        private c: CanvasRenderingContext2D,
        public layer: number,
        public x = Math.random() * animationState.w,
        public y = Math.random() * animationState.h,
        public vx = (Math.random() - 0.5) * (layer === 0 ? 0.05 : layer === 1 ? 0.09 : 0.13),
        public vy = (Math.random() - 0.5) * (layer === 0 ? 0.05 : layer === 1 ? 0.09 : 0.13),
        public r = (layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.4) + Math.random() * 0.9,
        public a = (layer === 0 ? 0.12 : layer === 1 ? 0.16 : 0.22) + Math.random() * 0.12
    ) { }

    step() {
        if (animationState.reducedMotion) return;

        this.x += this.vx;
        this.y += this.vy;

        if (animationState.pointer.active) {
            const dx = animationState.pointer.x - this.x;
            const dy = animationState.pointer.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 260) {
                const pull = (animationState.pointer.down ? 0.18 : 0.08) * (1 - dist / 260);
                this.vx += (dx / dist) * pull;
                this.vy += (dy / dist) * pull;
            }
        }

        this.vx *= 0.985;
        this.vy *= 0.985;

        if (this.x < -30) this.x = animationState.w + 30;
        if (this.x > animationState.w + 30) this.x = -30;
        if (this.y < -30) this.y = animationState.h + 30;
        if (this.y > animationState.h + 30) this.y = -30;
    }

    draw() {
        this.c.save();
        this.c.globalAlpha = this.a;
        this.c.fillStyle = "rgba(15, 23, 42, 0.9)";
        this.c.beginPath();
        this.c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        this.c.fill();
        this.c.restore();
    }
}

export default function StarsCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);
        animationState.reducedMotion =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const resize = () => {
            animationState.w = window.innerWidth;
            animationState.h = window.innerHeight;
            canvas.width = animationState.w * animationState.dpr;
            canvas.height = animationState.h * animationState.dpr;
            ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);
        };

        resize();
        const stars: Star[] = [];
        const count = Math.max(120, Math.floor((animationState.w * animationState.h) / 14000));

        for (let i = 0; i < count; i++) {
            stars.push(new Star(ctx, i % 3));
        }

        const loop = () => {
            ctx.clearRect(0, 0, animationState.w, animationState.h);
            stars.forEach((s) => {
                s.step();
                s.draw();
            });
            requestAnimationFrame(loop);
        };

        loop();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return <canvas ref={canvasRef} className={styles.starsBg} />;
}
