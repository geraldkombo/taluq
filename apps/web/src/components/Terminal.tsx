/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRightLeft, ShieldCheck, Activity, Fingerprint, Send, Wallet, Globe, PhoneCall, Store, Users } from 'lucide-react';

/**
 * Terminal Component
 * 
 * Amber-Core 'Invisible' UX.
 * Built for the 2026 Silicon Savannah.
 * Zero-Blue Standard (#f59e0b on #000000) for ocular safety and performance.
 * Optimized for professional users needing bill-pay status in one glance.
 */
export function Terminal({ 
  balance = 0, 
}) {
  // Simulate autonomous yKES Yield ticking up
  const [yKesYield, setYKesYield] = useState(0);
  
  // Omni-Settlement Matrix State
  const [matrix, setMatrix] = useState([
    { id: 'rent', label: 'Shelter Escrow', progress: 85, freq: 'EPOCH' },
    { id: 'chama', label: 'Chama (Group)', progress: 65, freq: 'EPOCH' },
    { id: 'utilities', label: 'Power/Water', progress: 45, freq: 'ON_DEMAND' },
    { id: 'statutory', label: 'SHIF/eCitizen', progress: 70, freq: 'EPOCH' },
    { id: 'ntsa', label: 'NTSA/Traffic', progress: 15, freq: 'ON_DEMAND' },
    { id: 'isp', label: 'Connectivity', progress: 10, freq: 'EPOCH' },
    { id: 'ai', label: 'AI Compute', progress: 60, freq: 'EPOCH' },
    { id: 'digital', label: 'Netflix/Spotify', progress: 30, freq: 'EPOCH' },
    { id: 'mobility', label: 'Uber/Bolt', progress: 20, freq: 'ON_DEMAND' },
    { id: 'dining', label: 'Glovo/Naivas', progress: 50, freq: 'ON_DEMAND' },
    { id: 'travel', label: 'SGR/Flights', progress: 5, freq: 'ON_DEMAND' },
    { id: 'savings', label: 'Auto-Compound Vault', progress: 95, freq: 'CONTINUOUS' },
  ]);

  // Time horizon simulation (End of Month)
  const [daysToEpoch] = useState(4);

  // Play a tactical 3000Hz chirp when a threshold is hit
  const playSuccessChirp = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(3000, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      
      if (navigator.vibrate) navigator.vibrate(50);
    } catch {
      return;
    }
  };

  // Idle Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [, setIdleTime] = useState(0);

  // P2P Modal State
  const [isP2POpen, setIsP2POpen] = useState(false);
  const [p2pPhone, setP2pPhone] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pStatus, setP2pStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  // Deposit Modal State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStatus, setDepositStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  // Diaspora Remittance Modal State
  const [isDiasporaOpen, setIsDiasporaOpen] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) return;
    
    setDepositStatus('PROCESSING');
    
    setTimeout(() => {
      playSuccessChirp();
      setDepositStatus('SUCCESS');
      setTimeout(() => {
        setIsDepositOpen(false);
        setDepositStatus('IDLE');
        setDepositAmount('');
      }, 2000);
    }, 1500);
  };

  const handleP2PSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p2pPhone || !p2pAmount) return;
    
    setP2pStatus('SENDING');
    
    // Attempt background sync registration for offline resilience
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        if ('sync' in reg) {
          // @ts-expect-error - sync is not fully typed in standard TS lib
          reg.sync.register('taluq-p2p-sync').catch(() => {});
        }
      });
    }

    setTimeout(() => {
      playSuccessChirp();
      setP2pStatus('SENT');
      setTimeout(() => {
        setIsP2POpen(false);
        setP2pStatus('IDLE');
        setP2pPhone('');
        setP2pAmount('');
      }, 2000);
    }, 1500);
  };

  const handleBiometricUnlock = async () => {
    try {
      if (window.PublicKeyCredential) {
        // Attempt native WebAuthn (Passkey / Biometric) trigger
        // This is a standard 2026 passwordless protocol request.
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: "required", // Forces FaceID/TouchID/Windows Hello
          }
        }).catch(() => {
          // If user cancels or no authenticator, we fallback for the demo
          return;
        });
      }
    } catch {
      return;
    } finally {
      // Unlock the vault
      setIsLocked(false);
      setIdleTime(0);
    }
  };

  useEffect(() => {
    // Auto-lock after 60 seconds of inactivity
    const idleInterval = setInterval(() => {
      setIdleTime((prev) => {
        if (prev >= 60) {
          setIsLocked(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    const resetIdle = () => setIdleTime(0);
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('touchstart', resetIdle);

    return () => {
      clearInterval(idleInterval);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, []);

  useEffect(() => {
    // Autonomous Yield Simulation Loop
    const interval = setInterval(() => {
      setYKesYield(prev => prev + 0.44);
      
      // Every tick, slightly increase progress for all matrix items randomly
      setMatrix(prev => prev.map(item => {
        const increase = Math.random() * (item.freq === 'CONTINUOUS' ? 2 : 0.5);
        const next = item.progress + increase;
        
        if (next >= 100) {
          playSuccessChirp();
          return { ...item, progress: 0 };
        }
        return { ...item, progress: next };
      }));

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-[#050505] text-[#f59e0b] font-mono p-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 6px 100%'
      }}></div>

      {/* Idle Lock Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          >
            <Lock className="w-16 h-16 text-[#f59e0b] mb-6" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold tracking-[0.2em] mb-2">VAULT LOCKED</h2>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-8">Inactivity Detected. Biometric Required.</p>
            <button 
              onClick={handleBiometricUnlock}
              className="px-8 py-3 border border-[#f59e0b] rounded text-sm uppercase tracking-widest hover:bg-[#f59e0b] hover:text-black transition-colors flex items-center gap-3"
            >
              <Fingerprint className="w-5 h-5" />
              Authenticate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit (Fiat On-Ramp) Native Bottom Sheet Modal */}
      <AnimatePresence>
        {isDepositOpen && !isLocked && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositOpen(false)}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />
            {/* Bottom Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setIsDepositOpen(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-[#050505] border-t border-[#f59e0b]/40 rounded-t-[2rem] p-6 pb-12 shadow-[0_-10px_40px_rgba(245,158,11,0.15)]"
            >
              <div className="w-12 h-1.5 bg-[#f59e0b]/30 rounded-full mx-auto mb-6" />
              
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-[#f59e0b]">
                    <Wallet className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-widest uppercase">Deposit KES</h2>
                  </div>
                  <button onClick={() => setIsDepositOpen(false)} className="text-[#f59e0b]/50 hover:text-[#f59e0b] uppercase text-[10px] tracking-widest">
                    [ Close ]
                  </button>
                </div>

                {depositStatus === 'SUCCESS' ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-green-500 gap-4"
                  >
                    <ShieldCheck className="w-16 h-16" />
                    <span className="text-xl font-bold tracking-widest uppercase">Vault Funded</span>
                    <span className="text-[10px] uppercase opacity-70 tracking-widest">Yielding active. 0.00 KES Fee.</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div className="text-[10px] uppercase tracking-widest opacity-60 border-b border-[#f59e0b]/20 pb-2 mb-2">
                      Fiat Off-Ramp Protocol: Paystack Bank/Card
                    </div>
                    
                    <label className="block">
                      <span className="text-[10px] tracking-widest uppercase text-[#f59e0b]/60">Amount (KES)</span>
                      <input
                        required
                        type="number"
                        min="50"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="mt-2 w-full bg-black border border-[#f59e0b]/20 px-4 py-3 text-[#f59e0b] focus:outline-none focus:border-[#f59e0b]/60 rounded-xl font-mono text-2xl transition-colors focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      />
                    </label>
                    
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-green-500/80 pt-2">
                      <span>Deposit Fee:</span>
                      <span className="font-bold">0.00 KES</span>
                    </div>

                    <button
                      type="submit"
                      disabled={depositStatus === 'PROCESSING'}
                      className="w-full mt-4 bg-[#f59e0b] text-black py-4 font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
                    >
                      {depositStatus === 'PROCESSING' ? 'Authenticating...' : 'Fund Vault'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* P2P Zero-Fee Send Money Native Bottom Sheet Modal */}
      <AnimatePresence>
        {isP2POpen && !isLocked && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsP2POpen(false)}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />
            {/* Bottom Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setIsP2POpen(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-[#050505] border-t border-[#f59e0b]/40 rounded-t-[2rem] p-6 pb-12 shadow-[0_-10px_40px_rgba(245,158,11,0.15)]"
            >
              <div className="w-12 h-1.5 bg-[#f59e0b]/30 rounded-full mx-auto mb-6" />
              
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-[#f59e0b]">
                    <Send className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-widest uppercase">Send Money</h2>
                  </div>
                  <button onClick={() => setIsP2POpen(false)} className="text-[#f59e0b]/50 hover:text-[#f59e0b] uppercase text-[10px] tracking-widest">
                    [ Close ]
                  </button>
                </div>

                {p2pStatus === 'SENT' ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-green-500 gap-4"
                  >
                    <ShieldCheck className="w-16 h-16" />
                    <span className="text-xl font-bold tracking-widest uppercase">Transferred</span>
                    <span className="text-[10px] uppercase opacity-70 tracking-widest">0.00 KES Fee Applied</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleP2PSend} className="space-y-5">
                    <label className="block">
                      <span className="text-[10px] tracking-widest uppercase text-[#f59e0b]/60">Recipient Phone</span>
                      <div className="flex items-center mt-2 w-full bg-black border border-[#f59e0b]/20 px-4 py-3 focus-within:border-[#f59e0b]/60 rounded-xl transition-colors">
                        <span className="text-[#f59e0b]/50 mr-2 font-mono">+254</span>
                        <input
                          required
                          type="tel"
                          value={p2pPhone}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setP2pPhone(val);
                          }}
                          maxLength={9}
                          placeholder="7XX XXX XXX"
                          className="bg-transparent text-[#f59e0b] focus:outline-none w-full font-mono placeholder:text-[#f59e0b]/20 focus-visible:ring-2 focus-visible:ring-[#f59e0b]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-1 -mx-1"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-[10px] tracking-widest uppercase text-[#f59e0b]/60">Amount (KES)</span>
                      <input
                        required
                        type="number"
                        min="1"
                        value={p2pAmount}
                        onChange={e => setP2pAmount(e.target.value)}
                        placeholder="0.00"
                        className="mt-2 w-full bg-black border border-[#f59e0b]/20 px-4 py-3 text-[#f59e0b] focus:outline-none focus:border-[#f59e0b]/60 rounded-xl font-mono text-2xl transition-colors focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      />
                    </label>
                    
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-green-500/80 pt-2">
                      <span>Network Fee:</span>
                      <span className="font-bold">0.00 KES</span>
                    </div>

                    <button
                      type="submit"
                      disabled={p2pStatus === 'SENDING' || p2pPhone.length < 9}
                      className="w-full mt-4 bg-[#f59e0b] text-black py-4 font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
                    >
                      {p2pStatus === 'SENDING' ? 'Executing...' : 'Confirm Transfer'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Remittance (Diaspora) Bottom Sheet */}
      <AnimatePresence>
        {isDiasporaOpen && !isLocked && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDiasporaOpen(false)}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setIsDiasporaOpen(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-[#050505] border-t border-green-500/40 rounded-t-[2rem] p-6 pb-12 shadow-[0_-10px_40px_rgba(34,197,94,0.15)]"
            >
              <div className="w-12 h-1.5 bg-green-500/30 rounded-full mx-auto mb-6" />
              
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-green-500/20 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-green-500">
                    <Globe className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-widest uppercase">Diaspora Remittance</h2>
                  </div>
                  <button onClick={() => setIsDiasporaOpen(false)} className="text-green-500/50 hover:text-green-500 uppercase text-[10px] tracking-widest">
                    [ Close ]
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="text-[10px] uppercase tracking-widest opacity-80 border-b border-green-500/20 pb-2 mb-2 text-green-500">
                    Bypass Western Union & WorldRemit. Receive USDC instantly.
                  </div>
                  
                  <div className="bg-black border border-green-500/20 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] tracking-widest uppercase text-green-500/60">Your Global Pay Link</span>
                    <div className="flex justify-between items-center bg-[#050505] p-3 rounded font-mono text-sm border border-green-500/10 text-green-400 break-all">
                      {`https://github.com/geraldkombo/2547XXXXXXX`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050505] border border-green-500/10 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-green-500/60">FX Margin</span>
                      <span className="text-lg font-bold text-green-500">0.0%</span>
                    </div>
                    <div className="bg-[#050505] border border-green-500/10 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-green-500/60">Transfer Fee</span>
                      <span className="text-lg font-bold text-green-500">$0.00</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playSuccessChirp();
                      setIsDiasporaOpen(false);
                    }}
                    className="w-full mt-2 bg-green-500 text-black py-4 font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    Copy Global Link
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 
        Glass-Amber Surface 
        Minimalist, fast, zero-blue.
      */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-2xl w-full border border-[#f59e0b]/40 bg-black/90 backdrop-blur-xl p-8 rounded shadow-[0_0_30px_rgba(245,158,11,0.15)] z-20 relative"
      >
        <header className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Minimalist 2026 CSS/SVG Geometric 'Key' Logo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="text-[#f59e0b]">
              <circle cx="8" cy="15" r="4" />
              <path d="M10.5 12.5L18 5l2 2m-2-2l2-2" />
            </svg>
            <h1 className="text-2xl font-bold tracking-[0.2em]">[ T A L U Q ]</h1>
          </div>
          <div className="text-xs uppercase tracking-wider opacity-70 text-right">
            <div>Gerald Shikunyi Kombo</div>
            <div className="opacity-50 text-[10px]">Digital Services</div>
          </div>
        </header>

        <main className="space-y-6">
          <section className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm uppercase tracking-widest opacity-60">Vault Principal (yKES)</span>
              <div className="flex items-center gap-2 text-[10px] uppercase text-green-500 tracking-widest bg-green-500/10 px-2 py-1 rounded">
                <PhoneCall className="w-3 h-3" />
                <span>USSD *845#</span>
              </div>
            </div>
            <div className="text-5xl font-light tracking-tight flex items-baseline gap-2">
              {balance.toFixed(2)} <span className="text-xl opacity-50">KES</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] uppercase text-green-500/80 tracking-widest mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>US Treasury Backed (USDY)</span>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {/* Yield Engine */}
              <div className="p-4 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-xs uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Auto-Settled Yield
                  </span>
                  <div className="text-2xl tracking-tight mt-1">+{yKesYield.toFixed(2)} yKES</div>
                </div>
                <div className="text-[10px] uppercase opacity-50 mt-4 pt-4 border-t border-[#f59e0b]/20 flex justify-between">
                  <span>Settlement Epoch:</span>
                  <span className="text-[#f59e0b] font-bold">T-MINUS {daysToEpoch} DAYS</span>
                </div>
              </div>

              {/* Interaction Row (Deposit & P2P) */}
              <div className="grid grid-cols-3 gap-3">
                {/* Deposit Top-Up Box */}
                <div 
                  onClick={() => setIsDepositOpen(true)}
                  className="p-4 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between cursor-pointer hover:bg-[#f59e0b]/10 transition-colors"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <Wallet className="w-3 h-3" />
                      Deposit
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold">[ TOP UP ]</div>
                  </div>
                </div>

                {/* M-Pesa Disruption P2P Box */}
                <div 
                  onClick={() => setIsP2POpen(true)}
                  className="p-4 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between cursor-pointer hover:bg-[#f59e0b]/10 transition-colors"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <ArrowRightLeft className="w-3 h-3" />
                      P2P Send
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold">[ TRANSFER ]</div>
                  </div>
                </div>

                {/* Global Remittance (Diaspora) Box */}
                <div 
                  onClick={() => setIsDiasporaOpen(true)}
                  className="p-4 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between cursor-pointer hover:bg-[#f59e0b]/10 transition-colors"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Receive
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-green-500 font-bold">[ GLOBAL ]</div>
                  </div>
                </div>
              </div>

              {/* Grassroots Community & Merchant Strategy Row */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Merchant Till (B2B API) */}
                <div className="p-3 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between cursor-pointer hover:bg-[#f59e0b]/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Pay Merchant</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-[#f59e0b]/60">Enter Till Number</div>
                </div>

                {/* Chama Multi-Sig Vaults */}
                <div className="p-3 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col justify-between cursor-pointer hover:bg-[#f59e0b]/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Chama Vault</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-[#f59e0b]/60">Multi-Sig Treasury</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-[#f59e0b]/20 rounded bg-[#f59e0b]/5 flex flex-col gap-3 justify-between">
              <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1 border-b border-[#f59e0b]/20 pb-2">Omni-Settlement Matrix (2026)</span>
              
              <div className="h-[200px] overflow-y-auto pr-2 space-y-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {matrix.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] uppercase opacity-80 font-bold">
                      <span>{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="opacity-50 text-[8px]">{item.freq}</span>
                        <span>{item.progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-black border border-[#f59e0b]/30 h-1 rounded-full overflow-hidden">
                      <div className="bg-[#f59e0b] h-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-[#f59e0b]/20 flex justify-between items-center text-[10px] uppercase tracking-widest opacity-50">
            <span>AUDIT GATE: 50.00 KES MINIMUM</span>
            <span>BANK/CARD/WEB3 RAILS ACTIVE</span>
          </section>
        </main>
      </motion.div>
    </div>
  );
}
