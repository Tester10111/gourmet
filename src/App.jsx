import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

// --- Animated Counter Component ---
const AnimatedBalance = ({ value }) => {
    const count = useMotionValue(value);
    const rounded = useTransform(count, latest => latest.toFixed(2));

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 0.8,
            ease: "easeOut"
        });
        return () => controls.stop();
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
};


// --- Helper Icons ---
const LoyaltyPointsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
const InfoIcon = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors backdrop-blur-sm touch-manipulation active:scale-90">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    </button>
);

// --- Info Modal Component ---
const InfoModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85 z-40 flex items-center justify-center p-3 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-amber-300/50 w-full max-w-md shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-center mb-3 sm:mb-4 text-amber-300">{title}</h2>
                    <div className="text-slate-300 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs sm:text-sm md:text-base">
                        {children}
                    </div>
                     <motion.button 
                        onClick={onClose}
                        whileTap={{ scale: 0.95 }}
                        className="w-full mt-4 sm:mt-6 bg-amber-500 text-slate-900 p-2.5 sm:p-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                        Close
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- Player Rank Component ---
const RANKS = [
    { name: 'Newbie', threshold: 0, icon: '/rank1.png' },
    { name: 'Apprentice', threshold: 1000, icon: '/rank2.png' },
    { name: 'Pro', threshold: 10000, icon: '/rank3.png' },
    { name: 'Elite', threshold: 50000, icon: '/rank4.png' },
    { name: 'Master', threshold: 100000, icon: '/rank5.png' },
    { name: 'Legend', threshold: 500000, icon: '/rank6.png' },
];

const PlayerRank = ({ totalWagered }) => {
    const currentRank = [...RANKS].reverse().find(rank => totalWagered >= rank.threshold) || RANKS[0];
    const nextRank = RANKS.find(rank => totalWagered < rank.threshold);
    
    const progress = nextRank ? (totalWagered / nextRank.threshold) * 100 : 100;

    return (
        <div className="group relative">
            <motion.img 
                src={currentRank.icon} 
                alt={currentRank.name} 
                className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
            />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900/80 backdrop-blur-md border border-amber-300/30 rounded-lg p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
                <h4 className="font-bold text-amber-300 text-lg">{currentRank.name}</h4>
                <p className="text-xs text-slate-400">Unlocked at ${currentRank.threshold} wagered</p>
                <p className="text-sm text-slate-300 mt-2">Total Wagered: ${totalWagered.toFixed(2)}</p>
                {nextRank ? (
                    <>
                        <p className="text-xs text-slate-400 mt-2">Next: {nextRank.name} at ${nextRank.threshold} wagered</p>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-amber-300 mt-2">You have reached the highest rank!</p>
                )}
            </div>
        </div>
    );
};


// --- Premium Animations & Styles (Mobile-Optimized) ---
const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');
  * { 
    font-family: 'Poppins', sans-serif; 
    -webkit-tap-highlight-color: transparent;
  }
  body { 
    user-select: none; 
    overflow-x: hidden; 
    touch-action: manipulation;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .main-bg { background-color: #020617; }
  .tile { perspective: 1000px; cursor: pointer; }
  .tile-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); transform-style: preserve-3d; }
  .tile.flipped .tile-inner { transform: rotateY(180deg); }
  .tile-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; border-radius: 1rem; overflow: hidden;}
  .tile-front { background: linear-gradient(to bottom right, #22c55e, #16a34a); }
  .tile-back { transform: rotateY(180deg); background-color: #1e293b; }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
  @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.7)); } 50% { filter: drop-shadow(0 0 16px rgba(250, 204, 21, 1)); } }
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); } }
  @keyframes bounce-in { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 60% { transform: scale(1.2) rotate(10deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes pulse-glow { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.05); filter: brightness(1.2); } }
  @keyframes smoke-trail { 0% { transform: translateY(0) scale(0.5); opacity: 0.8; } 100% { transform: translateY(100px) scale(2); opacity: 0; } }
  @keyframes candy-bounce { 0% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-30px) rotate(90deg); } 50% { transform: translateY(0) rotate(180deg); } 75% { transform: translateY(-15px) rotate(270deg); } 100% { transform: translateY(0) rotate(360deg); } }
  @keyframes peg-hit { 0% { transform: scale(1); } 50% { transform: scale(1.5); } 100% { transform: scale(1); } }
  @keyframes slide-up { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scale-in { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(4); opacity: 0; } }
  @keyframes coin-flip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(1080deg); } }
  @keyframes neon-pulse { 0%, 100% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; } 50% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; } }
  @keyframes win-burst { 0% { transform: scale(0.5) rotate(0deg); opacity: 0; } 50% { transform: scale(1.5) rotate(180deg); opacity: 1; } 100% { transform: scale(1) rotate(360deg); opacity: 1; } }
  @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }
  .shimmer { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%); background-size: 1000px 100%; animation: shimmer 2s infinite; }
  .premium-shadow { box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(139, 92, 246, 0.2); }
  .glass-effect { 
    background: rgba(15, 23, 42, 0.6); 
    backdrop-filter: blur(20px); 
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1); 
  }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-glow { animation: glow 2.5s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 1s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .animate-neon { animation: neon-pulse 2s ease-in-out infinite; }
  .candy-trail { animation: glow 1.5s ease-in-out infinite; }
  
  /* Mobile-specific optimizations */
  @media (max-width: 640px) {
    .main-bg { padding: 0.75rem; }
    .mobile-compact { padding: 1rem !important; }
    .mobile-text-lg { font-size: 1.125rem !important; }
    .mobile-text-xl { font-size: 1.25rem !important; }
    .mobile-text-2xl { font-size: 1.5rem !important; }
    .mobile-text-3xl { font-size: 1.875rem !important; }
    .mobile-gap { gap: 0.5rem !important; }
    .mobile-p-3 { padding: 0.75rem !important; }
    .mobile-p-4 { padding: 1rem !important; }
  }
`;

// --- Confetti Component with Enhanced Particles ---
const Confetti = ({ show, duration = 3000 }) => {
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        if (!show) return;
        const newParticles = Array.from({ length: 120 }, (_, i) => ({ 
            id: i, 
            x: Math.random() * 100, 
            y: -10, 
            color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#fbbf24', '#ef4444'][Math.floor(Math.random() * 7)], 
            rotation: Math.random() * 360, 
            delay: Math.random() * 500, 
            size: Math.random() * 12 + 6,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        }));
        setParticles(newParticles);
        const timer = setTimeout(() => setParticles([]), duration);
        return () => clearTimeout(timer);
    }, [show, duration]);
    if (!show) return null;
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => ( 
                <div key={p.id} className="absolute" 
                    style={{ 
                        left: `${p.x}%`, 
                        top: `${p.y}%`, 
                        width: `${p.size}px`, 
                        height: `${p.size}px`, 
                        backgroundColor: p.color, 
                        animation: `confetti ${Math.random() * 2 + 2}s ease-out ${p.delay}ms forwards`, 
                        transform: `rotate(${p.rotation}deg)`, 
                        borderRadius: p.shape === 'circle' ? '50%' : '20%',
                        boxShadow: `0 0 ${p.size}px ${p.color}`
                    }} 
                /> 
            ))}
        </div>
    );
};

// --- Sound Manager with Enhanced Audio ---
const soundManager = {
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
    effects: { 
        crash: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0 } }).toDestination(), 
        win: new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 }).toDestination(), 
        click: new Tone.PluckSynth({ attackNoise: 1, dampening: 4000, resonance: 0.9 }).toDestination(),
        metallic: new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination()
    },
    playWin(amount) { 
        this.effects.win.triggerAttackRelease("C2", "8n", Tone.now()); 
        const frequency = 300 + Math.min(amount * 2, 800);
        this.synth.triggerAttackRelease(frequency, '16n', Tone.now() + 0.1); 
        this.synth.triggerAttackRelease(frequency * 1.25, '16n', Tone.now() + 0.2);
    },
    playBigWin() { 
        const now = Tone.now();
        this.synth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '4n', now); 
        this.synth.triggerAttackRelease(['E4', 'G4', 'B4', 'E5'], '4n', now + 0.3); 
        this.synth.triggerAttackRelease(['G4', 'B4', 'D5', 'G5'], '4n', now + 0.6);
        this.synth.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '2n', now + 0.9);
    },
    playCashout() { 
        this.effects.metallic.triggerAttackRelease("16n");
        this.synth.triggerAttackRelease(['C4', 'E4', 'G4'], '8n'); 
    },
    playCrash() { this.effects.crash.triggerAttackRelease("4n"); },
    playDrop() { this.synth.triggerAttackRelease('C6', '32n'); },
    playPegHit(row) { this.synth.triggerAttackRelease(200 + row * 20, '64n'); },
    playAppleGood() { this.synth.triggerAttackRelease(['E5', 'G5'], '16n'); },
    playAppleBad() { this.effects.crash.triggerAttackRelease("8n"); this.synth.triggerAttackRelease(['C2', 'D#2'], '8n'); },
    playButtonClick() { this.effects.click.triggerAttackRelease("E5", "32n"); },
    playReelStop() { this.effects.click.triggerAttackRelease("G4", "16n"); },
    playReelSpin() { this.synth.triggerAttackRelease(['C4', 'D4', 'E4', 'G4'], '64n'); },
    playNearMiss() { this.synth.triggerAttackRelease(['E4', 'G#4', 'E4'], '8n'); },
    playScratch() { this.effects.crash.triggerAttackRelease("64n"); },
    playRocketLaunch() { const now = Tone.now(); for (let i = 0; i < 15; i++) { this.synth.triggerAttackRelease(100 + i * 40, '64n', now + i * 0.04); } },
    playRocketExplode() { this.effects.crash.triggerAttackRelease("2n"); this.synth.triggerAttackRelease(['C1', 'E1', 'G1'], '4n'); }
};

// --- Custom Hooks ---
const useGameSounds = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);
    useEffect(() => {
        const initializeAudio = async () => { if (!audioInitialized) { await Tone.start(); setAudioInitialized(true); } document.removeEventListener('click', initializeAudio); };
        document.addEventListener('click', initializeAudio);
        return () => document.removeEventListener('click', initializeAudio);
    }, [audioInitialized]);
    const toggleMute = () => { setIsMuted(prev => { const newMutedState = !prev; Tone.Destination.mute = newMutedState; return newMutedState; }); };
    const playSound = useCallback((sound, ...args) => { if (!isMuted && soundManager[sound]) { soundManager[sound](...args); } }, [isMuted]);
    return { isMuted, toggleMute, playSound, audioInitialized };
};

// --- Quick Bet Buttons Component with Mobile Optimization ---
const QuickBetButtons = ({ wager, setWager, balance, disabled }) => (
    <div className="flex gap-2 mt-2 sm:mt-3">
        <motion.button 
            whileHover={{ scale: disabled ? 1 : 1.02 }} 
            whileTap={{ scale: disabled ? 1 : 0.95 }} 
            onClick={() => setWager(Math.max(1, Math.floor(wager / 2)))} 
            disabled={disabled} 
            className="flex-1 text-xs sm:text-sm bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-black disabled:opacity-30 transition-all text-white shadow-lg disabled:hover:scale-100 touch-manipulation active:scale-90"
        >
            ½ HALF
        </motion.button>
        <motion.button 
            whileHover={{ scale: disabled ? 1 : 1.02 }} 
            whileTap={{ scale: disabled ? 1 : 0.95 }} 
            onClick={() => setWager(Math.min(balance, wager * 2))} 
            disabled={disabled} 
            className="flex-1 text-xs sm:text-sm bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-black disabled:opacity-30 transition-all text-white shadow-lg disabled:hover:scale-100 touch-manipulation active:scale-90"
        >
            2× DOUBLE
        </motion.button>
        <motion.button 
            whileHover={{ scale: disabled ? 1 : 1.02 }} 
            whileTap={{ scale: disabled ? 1 : 0.95 }} 
            onClick={() => setWager(Math.floor(balance))} 
            disabled={disabled} 
            className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-black disabled:opacity-30 transition-all text-slate-900 shadow-lg disabled:hover:scale-100 touch-manipulation active:scale-90"
        >
            💰 MAX
        </motion.button>
    </div>
);

// --- Game: Fruit Frenzy (Optimized for frequent small wins + mobile, RTP 90%) ---
const FruitFrenzy = ({ balance, setBalance, playSound, logGameResult, user, promptLogin }) => {
    const REELS_COUNT = 5;
    const ROWS_COUNT = 3;
    const SYMBOL_SIZE = 80;
    const SPIN_DURATION_BASE = 2000;
    const SPIN_DURATION_INCREMENT = 250;

    const [wager, setWager] = useState(10);
    const [spinning, setSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [lastWin, setLastWin] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [winningLines, setWinningLines] = useState([]);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const reelRefs = useRef([]);
    const [visualReelStrips, setVisualReelStrips] = useState(Array(REELS_COUNT).fill([]));

    const SYMBOLS = useMemo(() => ({
        'CHERRY': { key: 'CHERRY', src: '/ff1.png' },
        'LEMON': { key: 'LEMON', src: '/ff2.png' },
        'ORANGE': { key: 'ORANGE', src: '/ff3.png' },
        'GRAPE': { key: 'GRAPE', src: '/ff4.png' },
        'DIAMOND': { key: 'DIAMOND', src: '/ff5.png' },
        'SEVEN': { key: 'SEVEN', src: '/ff6.png' },
        'SCATTER': { key: 'SCATTER', src: '/ff7.png' },
    }), []);

    // OPTIMIZED PAYTABLE: Higher frequency of small wins (3-of-a-kind), lower multipliers to maintain 90% RTP
    const PAYTABLE = useMemo(() => ({
        [SYMBOLS.SEVEN.key]:   { 5: 500, 4: 25, 3: 3 }, 
        [SYMBOLS.DIAMOND.key]: { 5: 20, 4: 3, 3: 0.8 }, 
        [SYMBOLS.GRAPE.key]:   { 5: 8, 4: 1.5, 3: 0.6 }, 
        [SYMBOLS.ORANGE.key]:  { 5: 5, 4: 1.2, 3: 0.5 }, 
        [SYMBOLS.LEMON.key]:   { 5: 3, 4: 0.8, 3: 0.4 }, 
        [SYMBOLS.CHERRY.key]:  { 5: 2, 4: 0.6, 3: 0.3 }, 
    }), [SYMBOLS]);
    
    // OPTIMIZED VIRTUAL_REELS: Heavily favor CHERRY and LEMON for frequent 3-of-a-kind wins
    const VIRTUAL_REELS = useMemo(() => {
        const createReel = (weights) => Object.entries(weights).flatMap(([symbolKey, count]) => Array(count).fill(SYMBOLS[symbolKey]));
        return [
            createReel({ 'CHERRY': 50, 'LEMON': 40, 'ORANGE': 25, 'GRAPE': 15, 'DIAMOND': 5, 'SEVEN': 1, 'SCATTER': 2 }),
            createReel({ 'CHERRY': 48, 'LEMON': 38, 'ORANGE': 23, 'GRAPE': 14, 'DIAMOND': 4, 'SEVEN': 1, 'SCATTER': 2 }),
            createReel({ 'CHERRY': 45, 'LEMON': 35, 'ORANGE': 22, 'GRAPE': 12, 'DIAMOND': 3, 'SEVEN': 1, 'SCATTER': 2 }),
            createReel({ 'CHERRY': 40, 'LEMON': 32, 'ORANGE': 20, 'GRAPE': 10, 'DIAMOND': 3, 'SEVEN': 2, 'SCATTER': 3 }),
            createReel({ 'CHERRY': 38, 'LEMON': 30, 'ORANGE': 18, 'GRAPE': 10, 'DIAMOND': 2, 'SEVEN': 2, 'SCATTER': 4 }),
        ];
    }, [SYMBOLS]);

    useEffect(() => {
        setVisualReelStrips(VIRTUAL_REELS.map(reel => {
            const strip = [];
            for (let i=0; i < 50; i++) {
                strip.push(reel[Math.floor(Math.random() * reel.length)]);
            }
            return strip;
        }));
    }, [VIRTUAL_REELS]);

    const spin = () => {
        if (wager <= 0 || wager > balance || spinning) return;
        playSound('playButtonClick');
        setBalance(prev => prev - wager);
        setSpinning(true);
        setShowResult(false);
        setLastWin(0);
        setWinningLines([]);
        playSound('playReelSpin');

        let finalReels = [];
        let newVisualReels = [];
        const longestAnimation = SPIN_DURATION_BASE + (REELS_COUNT - 1) * SPIN_DURATION_INCREMENT;

        for (let i = 0; i < REELS_COUNT; i++) {
            const reel = VIRTUAL_REELS[i];
            const finalSymbolIndex = Math.floor(Math.random() * reel.length);
            const finalReelView = [];
            for (let j = 0; j < ROWS_COUNT; j++) {
                finalReelView.push(reel[(finalSymbolIndex + j) % reel.length]);
            }
            finalReels.push(finalReelView);

            const animationStrip = [];
            const animationLength = 50 + i * 5;
            for (let k = 0; k < animationLength; k++) {
                animationStrip.push(reel[Math.floor(Math.random() * reel.length)]);
            }
            animationStrip.push(...finalReelView);
            newVisualReels.push(animationStrip);
        }

        setVisualReelStrips(newVisualReels);

        reelRefs.current.forEach((reel, i) => {
            if (!reel) return;
            reel.style.transform = 'translateY(0)';
            const animationDuration = SPIN_DURATION_BASE + i * SPIN_DURATION_INCREMENT + Math.random() * 300;
            const finalPosition = -(newVisualReels[i].length - ROWS_COUNT) * SYMBOL_SIZE;
            const easings = ['cubic-bezier(0.25, 1, 0.5, 1)', 'ease-out', 'cubic-bezier(0.34, 1.56, 0.64, 1)'];
            const randomEasing = easings[Math.floor(Math.random() * easings.length)];

            reel.animate(
                [ { transform: 'translateY(0px)' }, { transform: `translateY(${finalPosition}px)` } ],
                { duration: animationDuration, easing: randomEasing, fill: 'forwards' }
            );
            setTimeout(() => playSound('playReelStop'), animationDuration - 100);
        });

        setTimeout(() => {
            const paylines = [
                finalReels.map(r => r[0]), // Top row
                finalReels.map(r => r[1]), // Middle row
                finalReels.map(r => r[2]), // Bottom row
            ];
            let totalWinnings = 0;
            const winningLineIndices = new Set();
            let nearMissDetected = false;
            paylines.forEach((line, lineIndex) => {
                const lineSymbol = line[0];
                if (!PAYTABLE[lineSymbol.key]) return;
                let matchCount = 1;
                for (let i = 1; i < line.length; i++) {
                    if (line[i].key === lineSymbol.key) matchCount++;
                    else break;
                }
                if (PAYTABLE[lineSymbol.key][matchCount]) {
                    totalWinnings += wager * PAYTABLE[lineSymbol.key][matchCount];
                    winningLineIndices.add(lineIndex);
                } else if (matchCount === 2 && !nearMissDetected) {
                    nearMissDetected = true;
                    playSound('playNearMiss');
                }
            });

            if (totalWinnings > 0) {
                setBalance(prev => prev + totalWinnings);
                setLastWin(totalWinnings);
                setWinningLines(Array.from(winningLineIndices));
                if (totalWinnings >= wager * 10) { 
                    setShowConfetti(true); 
                    playSound('playBigWin'); 
                    setTimeout(() => setShowConfetti(false), 4000); 
                } else { 
                    playSound('playWin', totalWinnings); 
                }
            }
            logGameResult('Fruit Frenzy', wager, totalWinnings);
            setShowResult(true);
            setSpinning(false);
        }, longestAnimation + 500);
    };

    return (
        <div className="flex flex-col items-center p-3 sm:p-8 bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-violet-500/30 premium-shadow animate-scale-in relative">
            <InfoIcon onClick={() => setIsInfoOpen(true)} />
            <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Fruit Frenzy Info">
                <h3 className="font-bold text-lg sm:text-xl text-white">How to Play</h3>
                <p className="text-sm sm:text-base">Set your bet amount and press SPIN. Win by matching 3 or more symbols from left to right on any of the 3 paylines (top, middle, bottom).</p>
                <h3 className="font-bold text-lg sm:text-xl text-white mt-4">Paytable</h3>
                <div className="space-y-2">
                    {Object.entries(PAYTABLE).map(([symbolKey, payouts]) => (
                        <div key={symbolKey} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                            <img src={SYMBOLS[symbolKey].src} alt={symbolKey} className="w-10 h-10 sm:w-12 sm:h-12" />
                            <div className="flex gap-2 sm:gap-4 text-right text-xs sm:text-sm">
                                <div><span className="font-bold">5x:</span> <span className="text-amber-300">{payouts[5]}x</span></div>
                                <div><span className="font-bold">4x:</span> <span className="text-amber-300">{payouts[4]}x</span></div>
                                <div><span className="font-bold">3x:</span> <span className="text-amber-300">{payouts[3]}x</span></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-violet-500/20 rounded-lg border border-violet-500/30">
                    <p className="text-xs sm:text-sm text-center text-violet-200">💡 Aces & 7s pay out most frequently!</p>
                </div>
            </InfoModal>
            <Confetti show={showConfetti} />
            <div className="w-full bg-gradient-to-b from-violet-900/50 via-black to-black rounded-2xl sm:rounded-3xl p-3 sm:p-6 mb-4 sm:mb-6 border-2 sm:border-4 border-violet-500/50 shadow-2xl relative overflow-hidden">
                <div className="shimmer absolute inset-0"></div>
                <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-2 sm:p-5 flex justify-center gap-1 sm:gap-3 overflow-hidden h-[240px] sm:h-[260px] relative">
                     {winningLines.includes(0) && <div className="absolute top-[40px] left-0 w-full h-1 bg-amber-300 z-20 animate-pulse-glow"></div>}
                     {winningLines.includes(1) && <div className="absolute top-1/2 left-0 w-full h-1 bg-amber-300 -translate-y-1/2 z-20 animate-pulse-glow"></div>}
                     {winningLines.includes(2) && <div className="absolute bottom-[40px] left-0 w-full h-1 bg-amber-300 z-20 animate-pulse-glow"></div>}
                    {visualReelStrips.map((strip, i) => (
                        <div key={i} className="w-1/5 h-full overflow-hidden">
                            <div ref={el => reelRefs.current[i] = el} style={{ transform: 'translateY(0px)' }} className="relative">
                                {strip.map((symbol, j) => (
                                    <div key={j} className="w-full h-[80px] flex items-center justify-center text-5xl transition-all">
                                        <img src={symbol.src} alt={symbol.key} className="w-12 h-12 sm:w-14 sm:h-14" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 {showResult && lastWin > 0 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                        <div className="text-center animate-bounce-in px-4">
                            <div className="text-4xl sm:text-7xl font-black text-amber-300 animate-neon mb-2">WIN!</div>
                            <div className="text-3xl sm:text-5xl font-black text-green-300 animate-pulse-glow">+${lastWin.toFixed(2)}</div>
                            <div className="text-base sm:text-xl text-amber-200 mt-2">{(lastWin/wager).toFixed(2)}x</div>
                        </div>
                    </div>
                )}
            </div>
             <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm text-slate-300 font-bold">Bet Amount</label>
                    <div className="text-xs text-slate-400">Balance: ${balance.toFixed(2)}</div>
                </div>
                <input type="number" value={wager} onChange={e => setWager(Math.max(0, Math.min(balance, parseInt(e.target.value) || 0)))} disabled={spinning || !user} className="w-full bg-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-violet-500/40 text-lg sm:text-2xl font-black shadow-inner mb-2 sm:mb-3 focus:border-violet-400 focus:outline-none transition-all"/>
                <QuickBetButtons wager={wager} setWager={setWager} balance={balance} disabled={spinning || !user} />
                
                {user ? (
                    <motion.button 
                        onClick={spin} 
                        disabled={spinning || wager <= 0 || wager > balance}
                        whileHover={{ scale: spinning ? 1 : 1.02 }}
                        whileTap={{ scale: spinning ? 1 : 0.98 }}
                        className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all touch-manipulation active:scale-95"
                    >
                        {spinning ? <span className="animate-pulse">SPINNING...</span> : 'SPIN 🎰'}
                    </motion.button>
                ) : (
                    <button onClick={promptLogin} className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-amber-500/50 transition-all touch-manipulation">
                        Sign In to Spin
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Game: Sugar Scratch ---
const SugarScratch = ({ balance, setBalance, playSound, logGameResult, user, promptLogin }) => {
    const [wager, setWager] = useState(5);
    const [playing, setPlaying] = useState(false);
    const [scratched, setScratched] = useState(new Set());
    const [winningNumbers, setWinningNumbers] = useState([]);
    const [playerNumbers, setPlayerNumbers] = useState([]);
    const [totalWin, setTotalWin] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const PAYOUTS = { 1: 0.5, 2: 2, 3: 5, 4: 25 };

    const startGame = () => {
        if (wager <= 0 || wager > balance || playing) return;
        playSound('playButtonClick');
        setBalance(prev => prev - wager);
        setPlaying(true);
        setScratched(new Set());
        setTotalWin(0);
        setShowConfetti(false);
        setRevealed(false);
        
        const outcomeDistribution = [
            { matches: 4, prob: 0.01 },
            { matches: 3, prob: 0.04 },
            { matches: 2, prob: 0.15 },
            { matches: 1, prob: 0.30 },
            { matches: 0, prob: 0.50 },
        ];
        
        let numMatches = 0;
        const rand = Math.random();
        let cumulativeProb = 0;
        for (const outcome of outcomeDistribution) {
            cumulativeProb += outcome.prob;
            if (rand < cumulativeProb) {
                numMatches = outcome.matches;
                break;
            }
        }
        
        const allPossibleNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const shuffled = allPossibleNumbers.sort(() => 0.5 - Math.random());
        
        const winners = shuffled.slice(0, 4);
        const losers = shuffled.slice(4);

        let pNumbers = [];
        pNumbers.push(...winners.slice(0, numMatches));
        pNumbers.push(...losers.slice(0, 12 - numMatches));

        pNumbers.forEach((pNum, index) => {
            if (!winners.includes(pNum)) {
                if (Math.random() < 0.5) {
                    const randomWinner = winners[Math.floor(Math.random() * winners.length)];
                    let nearMissNum = randomWinner + (Math.random() < 0.5 ? 1 : -1);
                    if (nearMissNum < 1) nearMissNum = randomWinner + 1;
                    if (nearMissNum > 50) nearMissNum = randomWinner - 1;
                    
                    if (!winners.includes(nearMissNum) && !pNumbers.includes(nearMissNum)) {
                        pNumbers[index] = nearMissNum;
                    }
                }
            }
        });

        setWinningNumbers(winners);
        setPlayerNumbers(pNumbers.sort(() => 0.5 - Math.random()));
    };

    const scratch = (index) => {
        if (!playing || scratched.has(index)) return;
        playSound('playScratch');
        const newScratched = new Set(scratched).add(index);
        setScratched(newScratched);
        if (newScratched.size === playerNumbers.length) {
            revealResults();
        }
    };
    
    const revealAll = () => {
        if (!playing || revealed) return;
        const allScratched = new Set(Array.from({length: playerNumbers.length}, (_, i) => i));
        setScratched(allScratched);
        revealResults();
    }

    const revealResults = useCallback(() => {
        let matchCount = 0;
        playerNumbers.forEach(pNum => {
            if (winningNumbers.includes(pNum)) {
                matchCount++;
            }
        });

        const finalWinnings = wager * (PAYOUTS[matchCount] || 0);

        setTotalWin(finalWinnings);
        setRevealed(true);
        
        if (finalWinnings > 0) {
            setBalance(prev => prev + finalWinnings);
            if (finalWinnings >= wager * 10) {
                playSound('playBigWin');
                setShowConfetti(true);
            } else {
                playSound('playWin', finalWinnings);
            }
        }
        logGameResult('Sugar Scratch', wager, finalWinnings);
        setTimeout(() => setPlaying(false), 3000);
    }, [playerNumbers, winningNumbers, setBalance, playSound, logGameResult, wager]);

    return (
        <div className="flex flex-col items-center p-3 sm:p-8 bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-pink-500/30 premium-shadow animate-scale-in relative">
            <InfoIcon onClick={() => setIsInfoOpen(true)} />
            <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Sugar Scratch Info">
                <h3 className="font-bold text-lg sm:text-xl text-white">How to Play</h3>
                <p className="text-sm sm:text-base">Buy a card for the selected bet amount. Scratch all 12 spots on your card. Match your numbers to any of the 4 winning numbers to win a prize!</p>
                <h3 className="font-bold text-lg sm:text-xl text-white mt-4">Payouts</h3>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                    <li>Match 1 Number: <span className="font-bold text-amber-300">0.5x</span> your bet</li>
                    <li>Match 2 Numbers: <span className="font-bold text-amber-300">2x</span> your bet</li>
                    <li>Match 3 Numbers: <span className="font-bold text-amber-300">5x</span> your bet</li>
                    <li>Match 4 Numbers: <span className="font-bold text-amber-300">25x</span> your bet</li>
                </ul>
            </InfoModal>
            <Confetti show={showConfetti} />
            <div className="w-full glass-effect p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 text-center">
                <h3 className="text-base sm:text-xl font-bold text-amber-300 mb-2">Winning Numbers</h3>
                <div className="flex justify-center gap-2 sm:gap-4">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-2xl font-black transition-all duration-500 ${revealed && playerNumbers.includes(winningNumbers[i]) ? 'bg-green-500 text-white animate-pulse-glow' : 'bg-slate-900/50 text-amber-300'}`}>
                            {playing ? winningNumbers[i] : '?'}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} onClick={() => scratch(i)}
                         className="aspect-square rounded-xl sm:rounded-2xl bg-gray-400 cursor-pointer flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-black relative overflow-hidden shadow-lg hover:scale-105 active:scale-95 transition-all touch-manipulation">
                        <div className={`absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700 transition-all duration-300 ${scratched.has(i) ? 'opacity-0 scale-0' : 'opacity-100'} flex items-center justify-center text-white/60 text-3xl sm:text-5xl`}>?</div>
                        <span className={`transition-all duration-300 ${scratched.has(i) ? 'scale-100' : 'scale-0'} ${winningNumbers.includes(playerNumbers[i]) && revealed ? 'text-green-300 animate-neon' : ''} text-lg sm:text-2xl md:text-3xl`}>
                            {playing ? playerNumbers[i] : ''}
                        </span>
                    </div>
                ))}
            </div>

            <div className="w-full">
                {revealed && (
                    <div className={`text-center text-xl sm:text-3xl font-black mb-4 sm:mb-5 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-bounce-in ${totalWin > 0 ? 'bg-green-500/20 text-green-300 border-2 border-green-500' : 'bg-slate-800/50 text-slate-400'}`}>
                        {totalWin > 0 ? `You Won $${totalWin.toFixed(2)}!` : 'No Matches This Time!'}
                    </div>
                )}
                
                {playing && !revealed && (
                    <motion.button 
                        onClick={revealAll}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-amber-400 text-slate-900 p-2.5 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-3 font-bold text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                        Reveal All
                    </motion.button>
                )}

                {!playing && (
                    <>
                        <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Bet Amount</label>
                        <input type="number" value={wager} onChange={e => setWager(Math.max(0, Math.min(balance, parseInt(e.target.value) || 0)))} disabled={playing || !user} className="w-full bg-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-pink-500/40 text-lg sm:text-2xl font-black shadow-inner mb-2 sm:mb-3 focus:border-pink-400 focus:outline-none transition-all"/>
                        <QuickBetButtons wager={wager} setWager={setWager} balance={balance} disabled={playing || !user} />
                    </>
                )}
                
                 {user ? (
                    <motion.button 
                        onClick={playing ? null : startGame} 
                        disabled={playing || balance < wager || wager <= 0}
                        whileTap={{ scale: playing ? 1 : 0.95 }}
                        className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all touch-manipulation active:scale-95"
                    >
                        {playing ? 'Good Luck! 🍀' : `Buy Card ($${wager.toFixed(2)})`}
                    </motion.button>
                ) : (
                    <button onClick={promptLogin} className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-amber-500/50 transition-all touch-manipulation">
                        Sign In to Play
                    </button>
                )}
            </div>
        </div>
    );
};


// --- Game: Icicle Pop ---
const IciclePop = ({ balance, setBalance, playSound, logGameResult, user, promptLogin }) => {
    const [wager, setWager] = useState(10);
    const [gameState, setGameState] = useState('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const multiplierRef = useRef(1.00);
    const [crashPoint, setCrashPoint] = useState(1.00);
    const [lastGameResult, setLastGameResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [countdown, setCountdown] = useState(5);
    const [placedBet, setPlacedBet] = useState(null);
    const [cashoutDisplay, setCashoutDisplay] = useState(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const runGameCycle = useCallback(() => {
        setGameState('betting');
        setCountdown(5);
        setCashoutDisplay(null);
        setLastGameResult(null);
        setMultiplier(1.00);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setGameState('running');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if(gameState === 'waiting') {
            const timer = setTimeout(runGameCycle, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState, runGameCycle]);
    
    const placeBet = () => {
        if(wager > 0 && wager <= balance && gameState === 'betting') {
            playSound('playButtonClick');
            setBalance(prev => prev - wager);
            setPlacedBet(wager);
        }
    }

    const cashOut = useCallback(() => {
        if (gameState !== 'running' || !placedBet) return;
        playSound('playCashout');
        const currentMultiplier = multiplierRef.current;
        const winnings = placedBet * currentMultiplier;
        setBalance(prev => prev + winnings);
        setLastGameResult({ type: 'cashout', multiplier: currentMultiplier, winnings: winnings });
        setCashoutDisplay({ multiplier: currentMultiplier, height: (currentMultiplier - 1) * 25 });
        logGameResult('Icicle Pop', placedBet, winnings);
        setPlacedBet(null);
        if (currentMultiplier >= 10) playSound('playBigWin');
    }, [gameState, placedBet, setBalance, playSound, logGameResult]);

    useEffect(() => {
        let animationFrameId;
        if (gameState === 'running') {
            const startTime = Date.now();
            
            const houseEdge = 10;
            const r = Math.random();
            let crashPointValue = (100 - houseEdge) / (100 - r * (100-houseEdge));

            if (crashPointValue < 1) crashPointValue = 1.00;
            const finalCrashPoint = parseFloat(crashPointValue.toFixed(2));
            setCrashPoint(finalCrashPoint);
            
            playSound('playRocketLaunch');

            const animate = () => {
                const elapsedTime = (Date.now() - startTime) / 1000;
                const rawMultiplier = Math.pow(Math.E, elapsedTime * 0.25);
                
                if (rawMultiplier >= finalCrashPoint) {
                    setMultiplier(finalCrashPoint);
                    multiplierRef.current = finalCrashPoint;
                    setGameState('crashed');
                    setHistory(prev => [finalCrashPoint, ...prev.slice(0, 4)]);
                    setLastGameResult({ type: 'crash', multiplier: finalCrashPoint });
                    playSound('playRocketExplode');
                    if(placedBet) {
                       logGameResult('Icicle Pop', placedBet, 0);
                    }
                    setPlacedBet(null);
                    setTimeout(() => setGameState('waiting'), 3000);
                } else {
                    setMultiplier(rawMultiplier);
                    multiplierRef.current = rawMultiplier;
                    animationFrameId = requestAnimationFrame(animate);
                }
            };
            animationFrameId = requestAnimationFrame(animate);
        }
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, playSound, logGameResult, placedBet]);

    const rocketHeight = gameState === 'running' ? Math.min((multiplier - 1) * 25, 240) : 0;
    const rocketX = gameState === 'running' ? Math.min((multiplier - 1) * 10, 80) : 0;

    return (
        <div className="flex flex-col items-center p-3 sm:p-8 bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-orange-500/30 premium-shadow animate-scale-in relative">
            <InfoIcon onClick={() => setIsInfoOpen(true)} />
            <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Icicle Pop Info">
                <h3 className="font-bold text-lg sm:text-xl text-white">How to Play</h3>
                <p className="text-sm sm:text-base">Place your bet before the round begins. Watch the multiplier increase as the icicle flies higher. Click "EJECT" to cash out your winnings at the current multiplier.</p>
                <p className="mt-2 text-sm sm:text-base">Be careful! If you don't eject before the icicle "POPS!", you lose your bet. The multiplier can pop at any time.</p>
            </InfoModal>
            <div className="w-full flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {history.map((h, i) => (
                    <div key={i} className={`text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-md ${h >= 2 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {h.toFixed(2)}x
                    </div>
                ))}
            </div>
            <div className="relative w-full h-72 sm:h-96 bg-gradient-to-b from-slate-950 to-gray-950 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 flex items-center justify-center overflow-hidden border-2 sm:border-4 border-orange-500/30 shadow-2xl">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: `url('/ipbackground.png')` }}
                ></div>
                {gameState === 'betting' && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-white font-bold glass-effect px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base">
                        Next round in {countdown}s
                    </div>
                )}
                
                <div className="absolute bottom-10 left-1/2" style={{ transform: `translate(-50%, -${rocketHeight}px) translateX(${rocketX}px) rotate(15deg)` }}>
                    <div className={`w-16 h-auto sm:w-20 ${gameState === 'running' ? 'animate-pulse-glow' : ''}`}>
                        <img src="/rocket.png" alt="Icicle Pop" />
                    </div>
                </div>

                {cashoutDisplay && (
                    <div className="absolute bottom-10 left-1/2 text-center" style={{transform: `translate(-50%, -${cashoutDisplay.height}px) translateX(${Math.min((cashoutDisplay.multiplier - 1) * 10, 80)}px)`}}>
                        <div className="text-xs font-bold bg-green-500/50 text-white p-1 rounded">Cashed Out @{cashoutDisplay.multiplier.toFixed(2)}x</div>
                    </div>
                )}
                
                <div className="text-center z-10 relative px-4">
                     {lastGameResult ? (
                        lastGameResult.type === 'crash' ? (
                            <div className="animate-shake">
                                <div className="text-4xl sm:text-7xl font-black text-red-500 mb-2 sm:mb-3 animate-neon">POPPED!</div>
                                <div className="text-xl sm:text-4xl font-bold text-red-400">@{lastGameResult.multiplier.toFixed(2)}x</div>
                            </div>
                        ) : (
                            <div className="animate-bounce-in">
                                <div className="text-4xl sm:text-7xl font-black text-green-400 mb-2 sm:mb-3 animate-neon">SUCCESS!</div>
                                <div className="text-xl sm:text-4xl font-bold text-green-300">@{lastGameResult.multiplier.toFixed(2)}x</div>
                                <div className="text-lg sm:text-3xl font-black text-amber-300 mt-2">+${lastGameResult.winnings.toFixed(2)}</div>
                            </div>
                        )
                    ) : (
                         <div className={`text-5xl sm:text-8xl font-black tabular-nums transition-all duration-200 ${multiplier > 10 ? 'text-amber-300 animate-neon' : multiplier > 5 ? 'text-orange-400' : 'text-white'}`}>
                            {multiplier.toFixed(2)}x
                        </div>
                    )}
                </div>
            </div>
            
            <div className="w-full">
                {gameState === 'running' && placedBet ? (
                    <motion.button 
                        onClick={cashOut}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl transition-all animate-glow touch-manipulation active:scale-95"
                    >
                        EJECT @ ${(placedBet * multiplier).toFixed(2)}
                    </motion.button>
                ) : (
                    <>
                        <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Bet Amount</label>
                        <input type="number" value={wager} onChange={e => setWager(Math.max(0, Math.min(balance, parseInt(e.target.value) || 0)))} disabled={gameState !== 'betting' || !user || placedBet} className="w-full bg-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-orange-500/40 text-lg sm:text-2xl font-black shadow-inner mb-2 sm:mb-3 focus:border-orange-400 focus:outline-none transition-all"/>
                        <QuickBetButtons wager={wager} setWager={setWager} balance={balance} disabled={gameState !== 'betting' || !user || placedBet} />
                        {user ? (
                            <motion.button 
                                onClick={placeBet} 
                                disabled={gameState !== 'betting' || placedBet || wager <= 0 || wager > balance}
                                whileTap={{ scale: gameState !== 'betting' || placedBet ? 1 : 0.95 }}
                                className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all touch-manipulation active:scale-95"
                            >
                                {placedBet ? `BET PLACED: $${placedBet}` : 'PLACE BET 🚀'}
                            </motion.button>
                        ) : (
                             <button onClick={promptLogin} className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-amber-500/50 transition-all touch-manipulation">
                                Sign In to Bet
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Game: Candy Drop ---
const CandyDrop = ({ balance, setBalance, playSound, logGameResult, user, promptLogin }) => {
    const [wager, setWager] = useState(10);
    const [isDropping, setIsDropping] = useState(false);
    const [risk, setRisk] = useState('high');
    const [hitPegs, setHitPegs] = useState({});
    const [showConfetti, setShowConfetti] = useState(false);
    const [ballCount, setBallCount] = useState(1);
    const [lastResults, setLastResults] = useState([]);
    const [batchTotalWin, setBatchTotalWin] = useState(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    const candyRefs = useRef([]);
    const pegBoardRef = useRef(null);
    const animationSpeed = 150;

    const ROWS = 13;

    const MULTIPLIERS = useMemo(() => ({
        low:    [5.5, 3, 2, 1.2, 0.9, 0.6, 0.5, 0.5, 0.6, 0.9, 1.2, 2, 3, 5.5],
        medium: [22, 9, 4, 2, 0.8, 0.4, 0.3, 0.3, 0.4, 0.8, 2, 4, 9, 22],
        high:   [130, 35, 10, 1.5, 0, 0, 0, 0, 0, 0, 1.5, 10, 35, 130]
    }), []);
    
    const multipliers = MULTIPLIERS[risk];

    const runSingleDrop = useCallback((candyIndex, startCol) => {
        return new Promise(resolve => {
            if (!pegBoardRef.current) {
                resolve({ multiplier: 0, winnings: 0, bucketIndex: Math.floor(multipliers.length / 2) });
                return;
            }

            let path = [{ row: -1, col: startCol }];
            let currentCol = startCol;
            for (let row = 0; row < ROWS; row++) {
                currentCol += (Math.random() < 0.5 ? -0.5 : 0.5);
                path.push({ row, col: currentCol });
            }
            
            const { width, height } = pegBoardRef.current.getBoundingClientRect();
            const rowHeight = height / (ROWS + 1);
            const colWidth = width / (ROWS + 1);
            const candySize = width < 400 ? 18 : 28;

            const keyframes = path.map(pos => {
                const top = (pos.row + 1.5) * rowHeight;
                const left = (pos.col + 0.5) * colWidth - (candySize / 2);
                return { transform: `translate(${left}px, ${top}px)` };
            });

            const candy = candyRefs.current[candyIndex];
            if (!candy) return;

            candy.style.width = `${candySize}px`;
            candy.style.height = `${candySize}px`;
            candy.style.opacity = 1;
            candy.classList.add('candy-trail');

            const duration = path.length * animationSpeed;
            const candyAnimation = candy.animate(keyframes, {
                duration: duration,
                easing: 'ease-in',
                fill: 'forwards'
            });

            for (let i = 1; i < path.length; i++) {
                const step = path[i];
                const pegRow = step.row;
                const pegCol = Math.round(step.col); 
                const pegId = `${pegRow}-${pegCol}`;

                setTimeout(() => {
                    playSound('playPegHit', pegRow);
                    setHitPegs(prev => ({ ...prev, [pegId]: true }));
                    setTimeout(() => {
                        setHitPegs(prev => ({ ...prev, [pegId]: false }));
                    }, 200);
                }, i * animationSpeed);
            }
            
            candyAnimation.onfinish = () => {
                const finalCol = path[path.length - 1].col;
                const bucketIndex = Math.floor(finalCol);
                const safeBucketIndex = Math.max(0, Math.min(multipliers.length - 1, bucketIndex));
                
                const multiplier = multipliers[safeBucketIndex];
                const winnings = wager * multiplier;
                candy.classList.remove('candy-trail');
                resolve({ multiplier, winnings, bucketIndex: safeBucketIndex });
            };
        });
    }, [wager, multipliers, playSound, animationSpeed, ROWS]);

    const dropCandies = async () => {
        const totalWager = wager * ballCount;
        if (totalWager <= 0 || totalWager > balance || isDropping) return;

        playSound('playButtonClick');
        setBalance(prev => prev - totalWager);
        setIsDropping(true);
        setLastResults([]);
        setShowConfetti(false);
        setHitPegs({});
        setBatchTotalWin(null);

        candyRefs.current.forEach(c => {
            if (c) {
                c.getAnimations().forEach(anim => anim.cancel());
                c.style.opacity = 0;
                c.style.transform = `translate(calc(50vw - 50%), -50px)`;
            }
        });
        
        await new Promise(res => setTimeout(res, 100));

        let totalWinnings = 0;
        const dropPromises = [];

        for (let i = 0; i < ballCount; i++) {
            const startCol = (ROWS / 2) + (i - (ballCount - 1) / 2) * 0.6;
            dropPromises.push(runSingleDrop(i, startCol));
            await new Promise(res => setTimeout(res, 80)); 
        }

        const results = await Promise.all(dropPromises);
        results.forEach(result => {
            totalWinnings += result.winnings;
        });
        
        setLastResults(results);
        setBalance(prev => prev + totalWinnings);
        logGameResult('Candy Drop', totalWager, totalWinnings);

        if (totalWinnings >= totalWager * 5) {
            playSound('playBigWin');
            setShowConfetti(true);
        } else if (totalWinnings > 0) {
            playSound('playWin', totalWinnings);
        }

        setTimeout(() => {
            setIsDropping(false);
            setShowConfetti(false);
            setBatchTotalWin(totalWinnings);
        }, 3000);
    };
    
    return (
        <div className="flex flex-col items-center p-3 sm:p-8 bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-blue-500/30 premium-shadow animate-scale-in relative">
            <InfoIcon onClick={() => setIsInfoOpen(true)} />
            <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Candy Drop Info">
                <h3 className="font-bold text-lg sm:text-xl text-white">How to Play</h3>
                <p className="text-sm sm:text-base">Choose your bet amount, number of candies to drop, and a risk level. Press "DROP" to release the candies from the top. You win the multiplier of the bucket the candy lands in.</p>
                <h3 className="font-bold text-lg sm:text-xl text-white mt-4">Risk Levels</h3>
                <p className="text-sm sm:text-base">Higher risk levels have lower odds of winning, but offer much larger potential prize multipliers.</p>
            </InfoModal>
            <Confetti show={showConfetti} />
            <div className="w-full flex justify-center gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-5 glass-effect p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-blue-400/20">
                {['low', 'medium', 'high'].map(r => (
                    <motion.button 
                        key={r}
                        onClick={() => !isDropping && setRisk(r)}
                        whileTap={{ scale: isDropping ? 1 : 0.95 }}
                        className={`px-3 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-black capitalize transition-all touch-manipulation active:scale-95 ${
                            risk === r 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-105 shadow-lg shadow-blue-500/50' 
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                        }`}>
                        {r} Risk
                    </motion.button>
                ))}
            </div>
            
            <div className="relative w-full aspect-square bg-gradient-to-b from-slate-950 to-gray-950 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 flex flex-col justify-between p-2 sm:p-4 border-2 sm:border-4 border-blue-500/30 shadow-2xl overflow-hidden">
                <AnimatePresence>
                    {batchTotalWin !== null && !isDropping && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.5 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 backdrop-blur-sm rounded-2xl sm:rounded-3xl"
                        >
                            <div className="text-center px-4">
                                <div className={`text-3xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 animate-neon ${
                                    batchTotalWin >= (wager * ballCount) ? 'text-green-400' : 'text-amber-300'
                                }`}>
                                    Total Win!
                                </div>
                                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white">
                                    +$<AnimatedBalance value={batchTotalWin} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} ref={el => candyRefs.current[i] = el} className="absolute z-20" style={{ opacity: 0, width: '28px', height: '28px' }}>
                        <div className="w-full h-full rounded-full shadow-lg" style={{ background: 'radial-gradient(circle at 30% 30%, #fde047, #f59e0b)' }}></div>
                    </div>
                ))}

                <div ref={pegBoardRef} className="flex-grow relative -mt-2">
                    {Array.from({ length: ROWS }).map((_, r) => (
                        <div key={r} className="flex justify-center" style={{ marginBottom: '3.5%' }}>
                            {Array.from({ length: r + 2 }).map((_, c) => {
                                const pegId = `${r}-${c}`;
                                return (
                                    <div key={c} 
                                        className={`w-1 h-1 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                                            hitPegs[pegId] 
                                                ? 'bg-amber-300 scale-150 shadow-lg shadow-amber-300/50' 
                                                : 'bg-slate-500'
                                        }`} 
                                        style={{margin: '0 1.2%'}}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center relative z-10">
                    {multipliers.map((m, i) => {
                        const isHit = lastResults.some(res => res.bucketIndex === i);
                        return (
                            <div key={i} 
                                className={`text-[7px] sm:text-[10px] md:text-xs font-black text-center w-[calc(100%/14)] py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-xl transition-all duration-300 ${
                                    isHit && !isDropping
                                        ? 'scale-125 bg-amber-300/70 shadow-lg shadow-amber-300/50 animate-pulse-glow' 
                                        : 'bg-slate-800/70'
                                }`} 
                                style={{ 
                                    color: m >= 5 ? '#4ade80' : m > 1 ? '#fbbf24' : m < 1 ? '#f87171' : '#cbd5e1',
                                    border: `1px solid ${m >= 5 ? '#4ade80' : m > 1 ? '#fbbf24' : m < 1 ? '#f87171' : '#475569'}`
                                }}>
                                {m}x
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="w-full">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                        <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Bet Amount</label>
                        <input type="number" value={wager} onChange={e => setWager(Math.max(0, Math.min(balance, parseInt(e.target.value) || 0)))} disabled={isDropping || !user}
                            className="w-full bg-slate-800 p-2.5 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-blue-500/40 text-base sm:text-lg md:text-2xl font-black shadow-inner focus:border-blue-400 focus:outline-none transition-all"/>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Candies</label>
                        <select value={ballCount} onChange={e => setBallCount(Number(e.target.value))} disabled={isDropping || !user}
                            className="w-full bg-slate-800 p-2.5 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-blue-500/40 text-base sm:text-lg md:text-2xl font-black shadow-inner focus:border-blue-400 focus:outline-none transition-all">
                                {[1, 5, 10].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <QuickBetButtons wager={wager} setWager={setWager} balance={balance} disabled={isDropping || !user} />
                {user ? (
                    <motion.button 
                        whileTap={{ scale: isDropping ? 1 : 0.95 }}
                        onClick={dropCandies} 
                        disabled={isDropping || wager * ballCount <= 0 || wager * ballCount > balance} 
                        className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all touch-manipulation active:scale-95"
                    >
                        {isDropping ? <span className="animate-pulse">DROPPING...</span> : `DROP ${ballCount} CAND${ballCount > 1 ? 'IES' : 'Y'} 🍬`}
                    </motion.button>
                ) : (
                    <button onClick={promptLogin} className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-amber-500/50 transition-all touch-manipulation">
                        Sign In to Drop
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Game: Sour Apple ---
const SourApple = ({ balance, setBalance, playSound, logGameResult, user, promptLogin }) => {
    const GRID_SIZE = 5;
    const [wager, setWager] = useState(10);
    const [numBadApples, setNumBadApples] = useState(3);
    const [gameState, setGameState] = useState('betting');
    const [grid, setGrid] = useState([]);
    const [revealed, setRevealed] = useState(new Set());
    const [goodApplesFound, setGoodApplesFound] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const factorial = useCallback((n) => (n <= 1 ? 1 : n * factorial(n - 1)), []);
    const combinations = useCallback((n, k) => (k < 0 || k > n) ? 0 : factorial(n) / (factorial(k) * factorial(n - k)), [factorial]);
    
    const calculateMultiplier = useCallback((picks) => {
        if (picks === 0) return 1.00;
        const totalTiles = GRID_SIZE * GRID_SIZE;
        const safeTiles = totalTiles - numBadApples;
        if (picks > safeTiles) return 0;
        const trueOdds = combinations(totalTiles, picks) / combinations(safeTiles, picks);
        return (trueOdds * 0.90).toFixed(2);
    }, [numBadApples, combinations]);
    
    const currentMultiplier = useMemo(() => calculateMultiplier(goodApplesFound), [goodApplesFound, calculateMultiplier]);
    
    const startGame = () => {
        if (wager <= 0 || wager > balance) return;
        playSound('playButtonClick');
        setBalance(prev => prev - wager);
        const newGrid = Array(GRID_SIZE * GRID_SIZE).fill(false);
        let minesPlaced = 0;
        while(minesPlaced < numBadApples) {
            const index = Math.floor(Math.random() * newGrid.length);
            if (!newGrid[index]) { newGrid[index] = true; minesPlaced++; }
        }
        setGrid(newGrid);
        setRevealed(new Set());
        setGoodApplesFound(0);
        setGameState('playing');
    };

    const handleTileClick = (index) => {
        if (gameState !== 'playing' || revealed.has(index)) return;
        
        setRevealed(prev => new Set(prev).add(index));
        
        if (grid[index]) {
            playSound('playAppleBad');
            setGameState('busted');
            logGameResult('Sour Apple', wager, 0);
            setTimeout(() => {
                const allBadApples = new Set();
                grid.forEach((isBad, idx) => {
                    if (isBad) allBadApples.add(idx);
                });
                setRevealed(prev => new Set([...prev, ...allBadApples]));
            }, 500);
        } else {
            playSound('playAppleGood');
            setGoodApplesFound(g => g + 1);
        }
    };
    
    const cashOut = () => {
        if (gameState !== 'playing' || goodApplesFound === 0) return;
        const winnings = wager * currentMultiplier;
        setBalance(b => b + winnings);
        playSound('playCashout');
        logGameResult('Sour Apple', wager, winnings);

        if(currentMultiplier >= 10) {
            playSound('playBigWin');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
        const allBadApples = new Set(revealed);
        grid.forEach((isBad, idx) => {
            if (isBad) allBadApples.add(idx);
        });
        setRevealed(allBadApples);
        setTimeout(() => setGameState('betting'), 2000);
    };
    
    const isBetting = gameState === 'betting';

    return (
        <div className="flex flex-col items-center p-3 sm:p-8 bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-green-500/30 premium-shadow animate-scale-in relative">
            <InfoIcon onClick={() => setIsInfoOpen(true)} />
            <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Sour Apple Info">
                <h3 className="font-bold text-lg sm:text-xl text-white">How to Play</h3>
                <p className="text-sm sm:text-base">Set your bet and the number of Sour Apples on the grid. Click tiles to reveal Good Apples. Each Good Apple you find increases your prize multiplier.</p>
                <p className="mt-2 text-sm sm:text-base">You can "CASH OUT" at any time to collect your current winnings. If youreveal a Sour Apple, you lose your bet for that round.</p>
            </InfoModal>
            <Confetti show={showConfetti} />
            <div className="relative w-full aspect-square bg-gradient-to-br from-slate-950 to-gray-950 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-5 border-2 sm:border-4 border-green-500/30 shadow-2xl">
                {gameState === 'busted' && (
                    <div className="absolute inset-0 bg-black/90 z-10 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl backdrop-blur-sm animate-scale-in px-4">
                        <div className="text-5xl sm:text-7xl md:text-8xl font-black text-red-500 mb-3 sm:mb-4 animate-shake">SOUR!</div>
                        <div className="text-base sm:text-xl md:text-2xl text-red-300 mb-4 sm:mb-6">Better luck next time!</div>
                        <motion.button 
                            onClick={() => setGameState('betting')}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl mt-2 font-black text-base sm:text-xl text-white shadow-xl touch-manipulation active:scale-95"
                        >
                            Try Again
                        </motion.button>
                    </div>
                )}
                {Array.from({ length: GRID_SIZE*GRID_SIZE }).map((_, i) => (
                    <div key={i} 
                        className={`tile ${revealed.has(i) ? 'flipped' : ''} ${gameState !== 'playing' || revealed.has(i) ? '' : 'cursor-pointer active:scale-95'}`} 
                        onClick={() => handleTileClick(i)}
                    >
                        <div className="tile-inner">
                            <div className="tile-face tile-front"></div>
                            <div className="tile-face tile-back">
                                <img src={grid[i] ? '/sour.png' : '/apples.png'} alt={grid[i] ? 'Sour Apple' : 'Good Apple'} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isBetting ? (
                 <div className="w-full">
                     <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                         <div>
                            <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Bet Amount</label>
                            <input type="number" value={wager} onChange={e => setWager(Math.max(0, Math.min(balance, parseInt(e.target.value) || 0)))} disabled={!user} className="w-full bg-slate-800 p-2.5 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl text-base sm:text-lg md:text-2xl font-black border-2 border-green-500/40 shadow-inner focus:border-green-400 focus:outline-none transition-all" />
                         </div>
                         <div>
                            <label className="text-xs sm:text-sm text-slate-300 mb-2 block font-bold">Sour Apples</label>
                            <select value={numBadApples} onChange={e => setNumBadApples(Number(e.target.value))} disabled={!user} className="w-full bg-slate-800 p-2.5 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-2xl border-2 border-green-500/40 focus:border-green-400 focus:outline-none transition-all">
                                {[1, 3, 5, 10, 15, 20, 24].map(n => <option key={n} value={n}>{n} Sour</option>)}
                            </select>
                         </div>
                     </div>
                     <QuickBetButtons wager={wager} setWager={setWager} balance={balance} disabled={!user} />
                     {user ? (
                        <motion.button 
                            onClick={startGame} 
                            disabled={wager <= 0 || wager > balance}
                            whileTap={{ scale: wager <= 0 || wager > balance ? 1 : 0.95 }}
                            className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-lg sm:text-2xl md:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all touch-manipulation active:scale-95"
                        >
                            START PICKING 🍎
                        </motion.button>
                     ) : (
                         <button onClick={promptLogin} className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xl sm:text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-amber-500/50 transition-all touch-manipulation">
                            Sign In to Pick
                        </button>
                     )}
                </div>
            ) : (
                <div className="w-full">
                    <div className="text-center mb-3 sm:mb-4 p-3 sm:p-4 md:p-6 glass-effect rounded-xl sm:rounded-2xl border-2 border-green-400/30">
                        <div className="text-xs sm:text-sm text-green-300 mb-1 font-bold">Current Multiplier</div>
                        <div className="text-3xl sm:text-5xl md:text-6xl font-black text-green-400 mb-2 tabular-nums">{currentMultiplier}x</div>
                        <div className="text-sm sm:text-base md:text-lg text-amber-300 font-bold">Next: {calculateMultiplier(goodApplesFound + 1)}x</div>
                        <div className="text-xs sm:text-sm text-slate-400 mt-2">Good Apples: {goodApplesFound}</div>
                    </div>
                    <motion.button 
                        onClick={cashOut} 
                        disabled={goodApplesFound === 0}
                        whileTap={{ scale: goodApplesFound === 0 ? 1 : 0.95 }}
                        className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-lg sm:text-2xl md:text-3xl font-black shadow-2xl disabled:opacity-50 disabled:hover:scale-100 transition-all animate-glow touch-manipulation active:scale-95"
                    >
                        CASH OUT +${(wager * currentMultiplier).toFixed(2)}
                    </motion.button>
                </div>
            )}
        </div>
    );
};

// --- Authentication Modal (Mobile Optimized) ---
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTZm6aXwsv4kJ2TZqsT8LWO-3Wqvrr3PPZYj87eWp_gQBTKEJBijJYsYRZUPWWa22B/exec';

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || pin.length !== 4) {
            setError('Username is required and PIN must be 4 digits.');
            return;
        }
        setError('');
        setIsLoading(true);

        const action = isLogin ? 'login' : 'signup';

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ action, username, pin }),
            });

            const textResponse = await response.text();
            const result = JSON.parse(textResponse);

            if (result.status === 'success') {
                onAuthSuccess(result.data);
                onClose();
            } else {
                setError(result.message || 'An unknown error occurred.');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('Could not connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-3 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-violet-500/30 premium-shadow w-full max-w-sm shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-amber-300">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="text-center text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">{isLogin ? 'Enter your credentials to play.' : 'Join the fun in just a few seconds.'}</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 sm:mb-4">
                            <label className="block text-slate-300 text-xs sm:text-sm font-bold mb-2">Chef Name</label>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-violet-500/40 shadow-inner focus:border-violet-400 focus:outline-none transition-all text-sm sm:text-base"
                                placeholder="e.g., GordonRamsay"
                            />
                        </div>
                        <div className="mb-4 sm:mb-6">
                            <label className="block text-slate-300 text-xs sm:text-sm font-bold mb-2">4-Digit PIN</label>
                            <input 
                                type="password"
                                value={pin}
                                maxLength="4"
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-violet-500/40 shadow-inner focus:border-violet-400 focus:outline-none transition-all text-sm sm:text-base"
                                placeholder="****"
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs sm:text-sm text-center mb-3 sm:mb-4">{error}</p>}

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 p-3 sm:p-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-black shadow-lg hover:shadow-amber-500/40 disabled:opacity-50 transition-all touch-manipulation active:scale-95"
                        >
                            {isLoading ? <span className="animate-pulse">...</span> : (isLogin ? 'Login 🎮' : 'Sign Up 🎮')}
                        </motion.button>
                    </form>

                    <div className="text-center mt-4 sm:mt-6">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-xs sm:text-sm text-slate-400 hover:text-amber-300 transition-colors touch-manipulation">
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- Main App Component ---
export default function App() {
    const [balance, setBalance] = useState(0);
    const [totalWagered, setTotalWagered] = useState(0);
    const [activeGame, setActiveGame] = useState(null);
    const { isMuted, toggleMute, playSound, audioInitialized } = useGameSounds();
    const [showSelection, setShowSelection] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTZm6aXwsv4kJ2TZqsT8LWO-3Wqvrr3PPZYj87eWp_gQBTKEJBijJYsYRZUPWWa22B/exec';
    const LOCAL_STORAGE_KEY = 'gourmetFunUserSession';

    useEffect(() => {
        try {
            const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedSession) {
                const userData = JSON.parse(savedSession);
                setUser(userData);
                setBalance(userData.balance);
                setTotalWagered(userData.totalWagered || 0);
            }
        } catch (error) {
            console.error("Could not load user session:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (user) {
            try {
                const sessionData = JSON.stringify({ ...user, balance, totalWagered });
                localStorage.setItem(LOCAL_STORAGE_KEY, sessionData);
            } catch (error) {
                console.error("Could not save user session:", error);
            }
        }
    }, [user, balance, totalWagered]);

    const logGameResult = useCallback(async (game, bet, reward) => {
        if (!user) return; 

        setTotalWagered(prev => prev + bet);

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ 
                    action: 'logGame', 
                    username: user.username,
                    game,
                    bet,
                    reward
                }),
            });
        } catch (err) {
            console.error("Failed to log game result:", err);
        }
    }, [user]);

    const selectGame = (gameId) => {
        playSound('playButtonClick');
        setActiveGame(gameId);
        setShowSelection(false);
    };

    const backToSelection = () => {
        playSound('playButtonClick');
        setShowSelection(true);
        setActiveGame(null);
    };
    
    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setBalance(userData.balance);
        setTotalWagered(userData.totalWagered || 0);
    };

    const handleLogout = () => {
        setUser(null);
        setBalance(0);
        setTotalWagered(0);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error("Could not remove user session:", error);
        }
    };

    const promptLogin = () => setIsAuthModalOpen(true);

    const gameComponents = {
        slots: <FruitFrenzy balance={balance} setBalance={setBalance} playSound={playSound} logGameResult={logGameResult} user={user} promptLogin={promptLogin} />,
        scratch: <SugarScratch balance={balance} setBalance={setBalance} playSound={playSound} logGameResult={logGameResult} user={user} promptLogin={promptLogin} />,
        rocket: <IciclePop balance={balance} setBalance={setBalance} playSound={playSound} logGameResult={logGameResult} user={user} promptLogin={promptLogin} />,
        candy: <CandyDrop balance={balance} setBalance={setBalance} playSound={playSound} logGameResult={logGameResult} user={user} promptLogin={promptLogin} />,
        apple: <SourApple balance={balance} setBalance={setBalance} playSound={playSound} logGameResult={logGameResult} user={user} promptLogin={promptLogin} />,
    };

    const navItems = [
        { id: 'slots', label: 'Fruit Frenzy', icon: '/slots.png', color: 'from-violet-500 to-purple-600', desc: 'Classic slots with massive jackpots' },
        { id: 'scratch', label: 'Sugar Scratch', icon: '/scratch.png', color: 'from-pink-500 to-rose-600', desc: 'Instant wins with custom bets' },
        { id: 'rocket', label: 'Icicle Pop', icon: '/rocket2.png', color: 'from-orange-500 to-amber-600', desc: 'Cash out before the crash' },
        { id: 'candy', label: 'Candy Drop', icon: '/candy.png', color: 'from-blue-500 to-cyan-600', desc: 'Watch candy bounce to riches' },
        { id: 'apple', label: 'Sour Apple', icon: '/apple.png', color: 'from-green-500 to-emerald-600', desc: 'Avoid the sour, find the sweet' },
    ];


    return (
        <main className="main-bg text-white min-h-screen p-2 sm:p-4 flex flex-col items-center relative overflow-hidden">
            <style>{premiumStyles}</style>
            
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <div className="fixed inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-64 h-64 sm:w-96 sm:h-96 bg-violet-600 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-600 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-rose-600 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            <header className="w-full max-w-6xl mb-4 sm:mb-6 glass-effect p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl z-20 animate-slide-up">
                <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-violet-400">Gourmet Fun</h1>
                        {!showSelection && (
                            <motion.button 
                                onClick={backToSelection}
                                whileTap={{ scale: 0.9 }}
                                className="text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 p-2 sm:p-2.5 rounded-full transition-all touch-manipulation active:scale-90"
                            >
                                <BackIcon />
                            </motion.button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                         {user ? (
                             <>
                                <PlayerRank totalWagered={totalWagered} />
                                <div className="text-sm sm:text-lg md:text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full border-2 border-amber-300/30 shadow-inner flex items-center gap-1.5 sm:gap-2 tabular-nums">
                                     <LoyaltyPointsIcon /> <AnimatedBalance value={balance} />
                                </div>
                                <motion.button 
                                    onClick={handleLogout}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 p-2 sm:p-2.5 rounded-full transition-all touch-manipulation active:scale-90"
                                >
                                    <LogoutIcon />
                                </motion.button>
                             </>
                         ) : (
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-black shadow-lg touch-manipulation active:scale-90"
                            >
                                Login / Sign Up
                            </motion.button>
                         )}
                        <motion.button 
                            onClick={toggleMute}
                            whileTap={{ scale: 0.9 }}
                            className="text-slate-400 hover:text-amber-300 bg-slate-800/50 hover:bg-slate-700/50 p-2 sm:p-3 rounded-full transition-all shadow-lg touch-manipulation active:scale-90 text-lg sm:text-xl"
                        >
                            {isMuted ? '🔇' : '🔊'}
                        </motion.button>
                    </div>
                </div>
            </header>

            {showSelection ? (
                <div className="w-full max-w-6xl z-10 animate-fade-in px-2 sm:px-0">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-300">Choose Your Game</h2>
                        <p className="text-slate-400 text-sm sm:text-base">Tap a game to start playing</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {navItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] premium-shadow touch-manipulation"
                            >
                                <img src={item.icon} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-active:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                                <motion.button 
                                    onClick={() => selectGame(item.id)}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative h-full w-full flex flex-col justify-end p-5 sm:p-8 text-left touch-manipulation active:scale-95 transition-transform"
                                >
                                    <h3 className="text-2xl sm:text-3xl font-black mb-1 text-white drop-shadow-lg">{item.label}</h3>
                                    <p className="text-slate-300 mb-3 sm:mb-4 text-xs sm:text-sm">{item.desc}</p>
                                    <div className={`self-start px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r ${item.color} text-white font-bold text-xs sm:text-sm shadow-lg group-active:shadow-2xl transition-all`}>
                                        Play Now →
                                    </div>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full z-10 animate-slide-up px-2 sm:px-0">
                    {gameComponents[activeGame]}
                </div>
            )}
            
            {!audioInitialized && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 glass-effect text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-xl shadow-2xl animate-pulse z-50 border border-amber-300/50 max-w-sm sm:max-w-none mx-auto sm:mx-0"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">🔊</div>
                        <div>
                            <div className="font-bold text-sm sm:text-base">Enable Sound</div>
                            <div className="text-xs sm:text-sm text-slate-300">Tap anywhere to activate audio</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </main>
    );
}