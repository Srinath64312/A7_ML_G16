const LEVEL_THRESHOLDS = [
    { name: "NOVICE",     min: 0,    icon: "🌱", color: "#94a3b8" },
    { name: "APPRENTICE", min: 100,  icon: "📘", color: "#06b6d4" },
    { name: "PROFICIENT", min: 300,  icon: "⚡", color: "#6366f1" },
    { name: "EXPERT",     min: 700,  icon: "🔥", color: "#f59e0b" },
    { name: "MASTER",     min: 1500, icon: "💎", color: "#10b981" }
];
const GameStore = {
    _key: "aiTutorGame_v2",
    _defaults() { return { xp: 0, streak: 0, lastActivityDate: null, totalCorrect: 0, totalAnswered: 0, mastery: {}, sessionHistory: [] }; },
    getState() { try { const r = localStorage.getItem(this._key); return r ? { ...this._defaults(), ...JSON.parse(r) } : this._defaults(); } catch { return this._defaults(); } },
    save(s) { try { localStorage.setItem(this._key, JSON.stringify(s)); } catch {} },
    getXP() { return this.getState().xp || 0; },
    addXP(amount) {
        const s = this.getState();
        const oldL = this.getLevelFromXP(s.xp);
        s.xp = (s.xp || 0) + amount;
        const newL = this.getLevelFromXP(s.xp);
        this.save(s); this.updateHUD();
        if (oldL.name !== newL.name) this._showLevelUp(newL);
        this._showXPGain(amount); return s.xp;
    },
    getLevelFromXP(xp) { let l = LEVEL_THRESHOLDS[0]; for (const t of LEVEL_THRESHOLDS) { if (xp >= t.min) l = t; } return l; },
    getLevel() { return this.getLevelFromXP(this.getXP()); },
    getLevelProgress() {
        const xp = this.getXP(); const level = this.getLevelFromXP(xp);
        const idx = LEVEL_THRESHOLDS.indexOf(level); const next = LEVEL_THRESHOLDS[idx + 1];
        if (!next) return { pct: 100 };
        return { pct: Math.round(((xp - level.min) / (next.min - level.min)) * 100) };
    },
    getStreak() { return this.getState().streak || 0; },
    recordActivity() {
        const s = this.getState(); const today = new Date().toDateString();
        if (s.lastActivityDate === today) return;
        const yest = new Date(Date.now() - 86400000).toDateString();
        s.streak = (s.lastActivityDate === yest) ? (s.streak || 0) + 1 : 1;
        s.lastActivityDate = today; this.save(s); this.updateHUD();
    },
    getMastery(topic) { return (this.getState().mastery || {})[topic] || 0; },
    getAllMastery() { return this.getState().mastery || {}; },
    setMastery(topic, score) { const s = this.getState(); s.mastery[topic] = Math.min(1, Math.max(0, score)); this.save(s); },
    getMasteryLabel(score) {
        if (score < 0.3)  return { label: "Not Started", color: "#475569", pct: Math.round(score*100) };
        if (score < 0.55) return { label: "Practicing",  color: "#f59e0b", pct: Math.round(score*100) };
        if (score < 0.8)  return { label: "Proficient",  color: "#06b6d4", pct: Math.round(score*100) };
        return              { label: "Mastered ✓",  color: "#10b981", pct: Math.round(score*100) };
    },
    recordAnswer(correct) { const s = this.getState(); s.totalAnswered=(s.totalAnswered||0)+1; if(correct) s.totalCorrect=(s.totalCorrect||0)+1; this.save(s); },
    getAccuracy() { const s=this.getState(); return s.totalAnswered ? Math.round(s.totalCorrect/s.totalAnswered*100) : 0; },
    addSessionEntry(topic, correct, total) {
        const s = this.getState(); s.sessionHistory = s.sessionHistory || [];
        s.sessionHistory.unshift({ topic, correct, total, date: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"}), xpEarned: correct*10 });
        s.sessionHistory = s.sessionHistory.slice(0, 20); this.save(s);
    },
    updateHUD() {
        const xp=this.getXP(), streak=this.getStreak(), level=this.getLevel(), prog=this.getLevelProgress();
        const el=(id)=>document.getElementById(id);
        if(el("hud-xp"))    el("hud-xp").textContent="⚡ "+xp.toLocaleString()+" XP";
        if(el("hud-streak"))el("hud-streak").textContent="🔥 "+streak;
        if(el("hud-level")){el("hud-level").textContent=level.icon+" "+level.name;el("hud-level").style.color=level.color;el("hud-level").style.borderColor=level.color+"44";}
        if(el("hud-xp-bar-fill")){el("hud-xp-bar-fill").style.width=prog.pct+"%";el("hud-xp-bar-fill").style.background="linear-gradient(90deg,"+level.color+","+level.color+"88)";}
    },
    _showXPGain(amount) {
        const t=document.createElement("div"); t.className="xp-toast"; t.textContent="+"+amount+" XP";
        document.body.appendChild(t); setTimeout(()=>t.classList.add("xp-toast-show"),10);
        setTimeout(()=>{t.classList.remove("xp-toast-show");setTimeout(()=>t.remove(),300);},1800);
    },
    _showLevelUp(level) {
        const t=document.createElement("div"); t.className="levelup-toast";
        t.innerHTML=level.icon+" Level Up! <strong>"+level.name+"</strong>";
        document.body.appendChild(t); setTimeout(()=>t.classList.add("xp-toast-show"),10);
        setTimeout(()=>{t.classList.remove("xp-toast-show");setTimeout(()=>t.remove(),400);},3500);
    }
};
document.addEventListener("DOMContentLoaded",()=>GameStore.updateHUD());
