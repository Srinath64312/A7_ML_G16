/**
 * sound-fx.js — Web Audio API Synthesizer & Canvas Confetti
 * 100% self-contained, 0 external audio files or dependencies.
 */

const SoundFX = {
    _ctx: null,
    _enabled: true,

    init() {
        const stored = localStorage.getItem("aiTutorSound_enabled");
        if (stored !== null) {
            this._enabled = stored === "true";
        }
        this._updateMuteButtonUI();
    },

    _getCtx() {
        if (!this._ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this._ctx = new AudioCtx();
            }
        }
        if (this._ctx && this._ctx.state === "suspended") {
            this._ctx.resume();
        }
        return this._ctx;
    },

    toggleMute() {
        this._enabled = !this._enabled;
        localStorage.setItem("aiTutorSound_enabled", this._enabled);
        this._updateMuteButtonUI();
        if (this._enabled) {
            this.playClick();
        }
        return this._enabled;
    },

    _updateMuteButtonUI() {
        const btns = document.querySelectorAll(".sound-toggle-btn");
        btns.forEach(btn => {
            btn.innerHTML = this._enabled ? "🔊 Sound ON" : "🔇 Sound OFF";
            btn.classList.toggle("muted", !this._enabled);
        });
    },

    playTone(freq, type = "sine", duration = 0.15, gainVal = 0.1, delay = 0) {
        if (!this._enabled) return;
        try {
            const ctx = this._getCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = ctx.currentTime + delay;

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(gainVal, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        } catch (e) {
            console.warn("Audio error:", e);
        }
    },

    playCorrect() {
        // High upbeat chord: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        this.playTone(523.25, "triangle", 0.2, 0.12, 0);
        this.playTone(659.25, "triangle", 0.25, 0.12, 0.08);
        this.playTone(783.99, "sine", 0.35, 0.15, 0.16);
    },

    playWrong() {
        // Low gentle buzz: 160Hz -> 120Hz downward pitch
        if (!this._enabled) return;
        try {
            const ctx = this._getCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(130, now + 0.3);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    },

    playLevelUp() {
        // Fanfare: C5 -> E5 -> G5 -> C6 high flourish
        this.playTone(523.25, "triangle", 0.15, 0.15, 0);
        this.playTone(659.25, "triangle", 0.15, 0.15, 0.1);
        this.playTone(783.99, "triangle", 0.18, 0.15, 0.2);
        this.playTone(1046.50, "sine", 0.5, 0.2, 0.3);
        this.triggerConfetti();
    },

    playClick() {
        this.playTone(800, "sine", 0.05, 0.04, 0);
    },

    playStreak() {
        this.playTone(440, "sine", 0.1, 0.1, 0);
        this.playTone(880, "sine", 0.2, 0.15, 0.07);
    },

    // ── Particle Confetti Explosion (Pure Canvas) ──
    triggerConfetti(count = 70) {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "99999";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#a855f7"];
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 1.2) * 14,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 15,
                alpha: 1
            });
        }

        let animationFrame;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = 0;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.45; // gravity
                p.vx *= 0.98;
                p.rotation += p.vRot;
                p.alpha -= 0.012;

                if (p.alpha > 0) {
                    alive++;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    ctx.restore();
                }
            });

            if (alive > 0) {
                animationFrame = requestAnimationFrame(render);
            } else {
                cancelAnimationFrame(animationFrame);
                canvas.remove();
            }
        };

        render();
    }
};

document.addEventListener("DOMContentLoaded", () => SoundFX.init());
