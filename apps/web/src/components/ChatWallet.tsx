/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRightLeft, Globe, Lock, Send, ShieldCheck, Wallet, X } from "lucide-react";

import { getSilentWalletInfo } from "@/app/actions";
import { getRecentTransactions } from "@/app/actions";
import { useHybridAtaBalance } from "@/hooks/useHybridAtaBalance";
import { parseChatCommand, shouldRequireSendConfirmation } from "@/lib/chat/command";
import { formatRecentTransactions } from "@/lib/chat/history";
import { buildSendConfirmationText, isConfirmMessage } from "@/lib/chat/sendConfirm";
import { tokenizeChatText } from "@/lib/chat/render";

type WalletState =
  | { ok: false; error?: string }
  | { ok: true; wallet: string; ata: string; balance: string };

type ChatRole = "user" | "taluq";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
};

type ChatWalletProps = {
  enableTts?: boolean;
};

const CHAT_STORAGE_KEY = "taluq_chat_history_v1";
const PHONE_STORAGE_KEY = "taluq_phone_v1";

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function playSuccessChirp() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
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

    if ("vibrate" in navigator) navigator.vibrate([40]);
  } catch {
    return;
  }
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9) return `+254${digits}`;
  if (digits.startsWith("254") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+254${digits.slice(1)}`;
  if (digits.startsWith("+254") && digits.length === 13) return digits;
  return phone.trim();
}

function buildGlobalLink(phoneE164: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const short = digits.startsWith("254") ? digits : digits.replace(/^0/, "254");
  return `https://github.com/geraldkombo/${short}`;
}

export function ChatWallet(props: ChatWalletProps) {
  const reduceMotion = useReducedMotion();
  const enableTts = props.enableTts ?? false;
  const rpcUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    [],
  );

  const [phoneInput, setPhoneInput] = useState("");
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);

  const [walletState, walletAction, walletPending] = useActionState(
    async (_prevState: WalletState, formData: FormData): Promise<WalletState> => {
      const raw = String(formData.get("phone") ?? "").trim();
      const phone = normalizePhone(raw);
      if (!phone) return { ok: false as const, error: "Phone number required" };
      const info = await getSilentWalletInfo(phone);
      return { ok: true as const, ...info };
    },
    { ok: false },
  );

  const ata = walletState.ok ? walletState.ata : undefined;
  const { balance, status } = useHybridAtaBalance({ rpcUrl, ata });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const [ttsBusyId, setTtsBusyId] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const [idleSeconds, setIdleSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendPhone, setSendPhone] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendStatus, setSendStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [pendingSendConfirm, setPendingSendConfirm] = useState<null | { phoneE164: string; amountKes: number }>(null);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY);
      if (savedPhone) {
        setPhoneInput(savedPhone.replace(/^\+254/, ""));
        setConnectedPhone(savedPhone);
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed)) setMessages(parsed);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-200)));
    } catch {
      return;
    }
  }, [messages]);

  useEffect(() => {
    if (!walletState.ok) return;
    const phone = normalizePhone(connectedPhone ?? `+254${phoneInput}`);
    setConnectedPhone(phone);
    try {
      localStorage.setItem(PHONE_STORAGE_KEY, phone);
    } catch {
      return;
    }
  }, [walletState.ok, connectedPhone, phoneInput]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isDepositOpen, isSendOpen]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIdleSeconds((s) => {
        const next = s + 1;
        if (next >= 60) setIsLocked(true);
        return next;
      });
    }, 1000);

    const reset = () => setIdleSeconds(0);
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);
    window.addEventListener("pointerdown", reset);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
      window.removeEventListener("pointerdown", reset);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) return;
    const seed: ChatMessage[] = [
      {
        id: nowId(),
        role: "taluq",
        ts: Date.now(),
        text:
          "Taluq Chat Wallet is online. Say: balance, send, receive, deposit. Or tap the quick actions.",
      },
    ];
    setMessages(seed);
  }, [messages.length]);

  const connected = walletState.ok && Boolean(connectedPhone);
  const globalLink = connectedPhone ? buildGlobalLink(connectedPhone) : null;

  const append = (role: ChatRole, text: string) => {
    setMessages((m) => [...m, { id: nowId(), role, text, ts: Date.now() }]);
  };

  const respond = async (input: string) => {
    if (!connected) {
      return append("taluq", "Link your phone first to activate the vault.");
    }

    if (pendingSendConfirm && isConfirmMessage(input)) {
      const digits = pendingSendConfirm.phoneE164.replace(/\D/g, "");
      const local = digits.startsWith("254") ? digits.slice(3) : digits;
      setSendPhone(local);
      setSendAmount(String(pendingSendConfirm.amountKes));
      setPendingSendConfirm(null);
      setIsSendOpen(true);
      return append("taluq", "Confirm screen opened. Review and submit.");
    }

    const cmd = parseChatCommand(input);

    if (cmd.kind === "help") {
      return append(
        "taluq",
        'Commands: balance • send <phone> <amount> • receive • deposit <amount> • history • lock. For high amounts, type "confirm".',
      );
    }

    if (cmd.kind === "lock") {
      setIsLocked(true);
      return append("taluq", "Vault locked.");
    }

    if (cmd.kind === "balance") {
      return append("taluq", `Vault balance: ${balance || "0"} yKES.`);
    }

    if (cmd.kind === "receive") {
      if (!globalLink) return append("taluq", "Missing phone link.");
      return append("taluq", `Global Receive Link: ${globalLink}`);
    }

    if (cmd.kind === "history") {
      const txs = await getRecentTransactions().catch(() => []);
      const normalized = (txs as Array<{ id: string; amount: string; phoneNumber: string; createdAt: string }>).map((t) => ({
        id: t.id,
        amountKes: Number(t.amount),
        phoneE164: t.phoneNumber,
        createdAtIso: t.createdAt,
      }));
      const lines = formatRecentTransactions(normalized);
      if (lines.length === 0) return append("taluq", "No completed transactions yet.");
      append("taluq", "Recent transactions:");
      for (const line of lines.slice(0, 6)) append("taluq", line);
      return;
    }

    if (cmd.kind === "deposit") {
      const amount = cmd.amountKes ? String(cmd.amountKes) : "";
      setDepositAmount(amount);
      setIsDepositOpen(true);
      return append("taluq", "Deposit modal opened. Enter amount and confirm.");
    }

    if (cmd.kind === "send") {
      const phoneE164 = cmd.phoneE164;
      const amountKes = cmd.amountKes;

      if (!phoneE164 && !amountKes) {
        setSendPhone("");
        setSendAmount("");
        setIsSendOpen(true);
        return append("taluq", "Send modal opened. Enter recipient and amount.");
      }

      if (phoneE164) {
        const digits = phoneE164.replace(/\D/g, "");
        const local = digits.startsWith("254") ? digits.slice(3) : digits;
        setSendPhone(local);
      }
      if (typeof amountKes === "number") setSendAmount(String(amountKes));

      if (phoneE164 && typeof amountKes === "number" && shouldRequireSendConfirmation(amountKes)) {
        setPendingSendConfirm({ phoneE164, amountKes });
        return append("taluq", buildSendConfirmationText({ phoneE164, amountKes }));
      }

      setIsSendOpen(true);
      return append("taluq", "Send modal opened. Confirm recipient and amount.");
    }

    return append("taluq", "Type help for commands.");
  };

  const onSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    append("user", text);
    await respond(text);
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      playSuccessChirp();
      append("taluq", "Copied.");
    } catch {
      append("taluq", "Copy failed.");
    }
  };

  const quick = async (text: string) => {
    append("user", text);
    await respond(text);
  };

  const speak = async (id: string, text: string) => {
    if (!enableTts) return;
    setTtsError(null);
    setTtsBusyId(id);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "TTS failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : "TTS failed");
    } finally {
      setTtsBusyId(null);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) return;
    setDepositStatus("PROCESSING");
    window.setTimeout(() => {
      playSuccessChirp();
      setDepositStatus("SUCCESS");
      append("taluq", `Deposit queued: ${Number(depositAmount).toFixed(2)} KES.`);
      window.setTimeout(() => {
        setDepositStatus("IDLE");
        setDepositAmount("");
        setIsDepositOpen(false);
      }, 1400);
    }, 1100);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendPhone.length < 9 || !sendAmount) return;
    setSendStatus("SENDING");
    window.setTimeout(() => {
      playSuccessChirp();
      setSendStatus("SENT");
      append("taluq", `Transfer executed: +254${sendPhone} ← ${Number(sendAmount).toFixed(2)} KES (0.00 fee).`);
      window.setTimeout(() => {
        setSendStatus("IDLE");
        setSendPhone("");
        setSendAmount("");
        setIsSendOpen(false);
      }, 1400);
    }, 1100);
  };

  const unlock = async () => {
    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        await navigator.credentials.get({
          publicKey: { challenge, timeout: 45000, userVerification: "required" },
        });
      }
    } catch {
      return;
    } finally {
      setIsLocked(false);
      setIdleSeconds(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f59e0b] font-mono flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-xl focus:bg-black focus:px-4 focus:py-3 focus:text-[#f59e0b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Skip to content
      </a>
      <header className="px-4 py-4 border-b border-[#f59e0b]/15 bg-black/60 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="w-5 h-5" strokeWidth={1.5} />
          <div className="leading-tight">
            <div className="text-sm tracking-[0.3em] font-bold">[ T A L U Q ]</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">
              {status === "websocket" ? "Realtime" : status === "polling" ? "Hybrid" : "Offline"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected && globalLink ? (
            <button
              type="button"
              onClick={() => copy(globalLink)}
              className="text-[10px] uppercase tracking-widest border border-green-500/30 text-green-500 px-3 py-2 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Globe className="w-4 h-4" />
              Copy Receive
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsLocked(true)}
            className="text-[10px] uppercase tracking-widest border border-[#f59e0b]/25 px-3 py-2 rounded-xl bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Lock className="w-4 h-4" />
            Lock
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isLocked ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <div className="w-full max-w-sm border border-[#f59e0b]/25 rounded-2xl bg-black p-6 text-center space-y-4">
              <Lock className="w-12 h-12 mx-auto" strokeWidth={1.5} />
              <div className="text-sm font-bold tracking-[0.2em] uppercase">Vault Locked</div>
              <div className="text-[10px] uppercase tracking-widest opacity-60">Biometric required</div>
              <button
                type="button"
                onClick={unlock}
                className="w-full rounded-xl bg-[#f59e0b] text-black py-3 font-bold tracking-widest uppercase active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Authenticate
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!connected ? (
        <main id="main" className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md border border-[#f59e0b]/15 rounded-2xl bg-black/60 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Link Phone
              </div>
              <div className="text-[10px] uppercase tracking-widest opacity-60">No seed phrases</div>
            </div>

            <form
              action={(formData) => {
                const raw = String(formData.get("phone") ?? "");
                setConnectedPhone(normalizePhone(raw));
                return walletAction(formData);
              }}
              className="mt-5 space-y-4"
            >
              <label className="block">
                <div className="text-[10px] uppercase tracking-widest opacity-60">Phone Number</div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#f59e0b]/15 bg-black px-4 py-3 focus-within:border-[#f59e0b]/40 transition-colors">
                  <span className="text-[#f59e0b]/50">+254</span>
                  <input
                    name="phone"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    maxLength={9}
                    autoComplete="tel-national"
                    spellCheck={false}
                    placeholder="7XX XXX XXX…"
                    className="flex-1 min-w-0 bg-transparent focus:outline-none text-[#f59e0b] placeholder:text-[#f59e0b]/20 focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-1 -mx-1"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={walletPending || phoneInput.length < 9}
                className="w-full rounded-xl bg-[#f59e0b] text-black py-3 font-bold tracking-widest uppercase active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Lock className="w-4 h-4" />
                Enter Chat Wallet
              </button>
            </form>

            {!walletState.ok && walletState.error ? (
              <div className="mt-4 text-xs text-red-400">{walletState.error}</div>
            ) : null}

            <div className="mt-6 text-[10px] uppercase tracking-widest opacity-50">
              Privacy: Zero phonebook access.
            </div>
          </div>
        </main>
      ) : (
        <>
          <main id="main" className="flex-1 flex flex-col">
            <div className="px-4 pt-4 pb-3 flex items-end justify-between gap-4">
              <div className="text-[10px] uppercase tracking-widest opacity-60">
                {connectedPhone}
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest opacity-60">Vault</div>
                <div className="text-xl font-bold tabular-nums">{balance || "0"}</div>
              </div>
            </div>

            <div ref={listRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`w-full flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border",
                      m.role === "user"
                        ? "bg-[#f59e0b] text-black border-[#f59e0b]/40"
                        : "bg-black text-[#f59e0b] border-[#f59e0b]/20",
                    ].join(" ")}
                  >
                    {m.role === "taluq"
                      ? tokenizeChatText(m.text).map((t, idx) =>
                          t.kind === "link" ? (
                            <a
                              key={`${m.id}_${idx}`}
                              href={t.value.startsWith("https://github.com/geraldkombo/") ? t.value : t.value}
                              target={t.value.startsWith("https://github.com/geraldkombo/") ? "_blank" : undefined}
                              rel={t.value.startsWith("https://github.com/geraldkombo/") ? "noreferrer" : undefined}
                              className="underline underline-offset-4"
                            >
                              {t.value}
                            </a>
                          ) : (
                            <span key={`${m.id}_${idx}`}>{t.value}</span>
                          ),
                        )
                      : m.text}
                    {m.role === "taluq" && enableTts ? (
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => speak(m.id, m.text)}
                          disabled={Boolean(ttsBusyId)}
                          className="text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl disabled:opacity-40"
                        >
                          {ttsBusyId === m.id ? "Listening..." : "Listen"}
                        </button>
                        {ttsError ? (
                          <span className="text-[10px] uppercase tracking-widest text-red-400">
                            {ttsError}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 border-t border-[#f59e0b]/15 bg-black/80 backdrop-blur-xl px-4 pt-3 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => quick("balance")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Balance
              </button>
              <button
                type="button"
                onClick={() => quick("send")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => quick("receive")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-green-500/25 bg-green-500/5 hover:bg-green-500/10 text-green-500 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Receive
              </button>
              <button
                type="button"
                onClick={() => quick("deposit")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => quick("help")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Help
              </button>
              <button
                type="button"
                onClick={() => quick("history")}
                className="shrink-0 text-[10px] uppercase tracking-widest border border-[#f59e0b]/20 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                History
              </button>
              {pendingSendConfirm ? (
                <button
                  type="button"
                  onClick={() => quick("confirm")}
                  className="shrink-0 text-[10px] uppercase tracking-widest border border-green-500/25 bg-green-500/5 hover:bg-green-500/10 text-green-500 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Confirm
                </button>
              ) : null}
            </div>

            <form onSubmit={onSubmitChat} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-2xl border border-[#f59e0b]/15 bg-black px-4 py-3 focus-within:border-[#f59e0b]/40 transition-colors">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Message Taluq…"
                  name="message"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-transparent focus:outline-none text-[#f59e0b] placeholder:text-[#f59e0b]/25 focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-1 -mx-1"
                />
                {draft ? (
                  <button
                    type="button"
                    onClick={() => setDraft("")}
                    className="text-[#f59e0b]/50 hover:text-[#f59e0b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
                    aria-label="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              <button
                type="submit"
                className="shrink-0 rounded-2xl bg-[#f59e0b] text-black px-4 py-3 font-bold uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>

          <AnimatePresence>
            {isDepositOpen ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => {
                    if (depositStatus !== "PROCESSING") setIsDepositOpen(false);
                  }}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={
                    reduceMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 200 }
                  }
                  className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-[#f59e0b]/30 rounded-t-[2rem] p-6 pb-10"
                >
                  <div className="w-12 h-1.5 bg-[#f59e0b]/30 rounded-full mx-auto mb-6" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm tracking-widest uppercase">
                      <Wallet className="w-4 h-4" />
                      Deposit
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(false)}
                      className="text-[10px] uppercase tracking-widest opacity-60"
                      disabled={depositStatus === "PROCESSING"}
                    >
                      [ Close ]
                    </button>
                  </div>

                  {depositStatus === "SUCCESS" ? (
                    <div className="py-8 text-center space-y-3">
                      <ShieldCheck className="w-12 h-12 mx-auto text-green-500" />
                      <div className="text-sm font-bold uppercase tracking-widest text-green-500">
                        Vault Funded
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-60">
                        0.00 KES fee
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleDeposit} className="space-y-4">
                      <label className="block">
                        <div className="text-[10px] uppercase tracking-widest opacity-60">Amount (KES)</div>
                        <input
                          required
                          type="number"
                          min="50"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          name="depositAmount"
                          inputMode="decimal"
                          autoComplete="off"
                          className="mt-2 w-full bg-black border border-[#f59e0b]/15 rounded-xl px-4 py-3 text-[#f59e0b] focus:outline-none focus:border-[#f59e0b]/40 text-2xl focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={depositStatus === "PROCESSING"}
                        className="w-full rounded-xl bg-[#f59e0b] text-black py-3 font-bold uppercase tracking-widest disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        {depositStatus === "PROCESSING" ? "Authenticating..." : "Confirm"}
                      </button>
                    </form>
                  )}
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isSendOpen ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => {
                    if (sendStatus !== "SENDING") setIsSendOpen(false);
                  }}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={
                    reduceMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 200 }
                  }
                  className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-[#f59e0b]/30 rounded-t-[2rem] p-6 pb-10"
                >
                  <div className="w-12 h-1.5 bg-[#f59e0b]/30 rounded-full mx-auto mb-6" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm tracking-widest uppercase">
                      <ArrowRightLeft className="w-4 h-4" />
                      Send
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSendOpen(false)}
                      className="text-[10px] uppercase tracking-widest opacity-60"
                      disabled={sendStatus === "SENDING"}
                    >
                      [ Close ]
                    </button>
                  </div>

                  {sendStatus === "SENT" ? (
                    <div className="py-8 text-center space-y-3">
                      <ShieldCheck className="w-12 h-12 mx-auto text-green-500" />
                      <div className="text-sm font-bold uppercase tracking-widest text-green-500">
                        Transferred
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-60">
                        0.00 KES fee
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSend} className="space-y-4">
                      <label className="block">
                        <div className="text-[10px] uppercase tracking-widest opacity-60">Recipient</div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#f59e0b]/15 bg-black px-4 py-3 focus-within:border-[#f59e0b]/40 transition-colors">
                          <span className="text-[#f59e0b]/50">+254</span>
                          <input
                            required
                            value={sendPhone}
                            onChange={(e) => setSendPhone(e.target.value.replace(/\D/g, ""))}
                            inputMode="numeric"
                            maxLength={9}
                            name="recipientPhone"
                            autoComplete="tel-national"
                            spellCheck={false}
                            placeholder="7XX XXX XXX…"
                            className="flex-1 min-w-0 bg-transparent focus:outline-none text-[#f59e0b] placeholder:text-[#f59e0b]/20 focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-1 -mx-1"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <div className="text-[10px] uppercase tracking-widest opacity-60">Amount (KES)</div>
                        <input
                          required
                          type="number"
                          min="1"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          name="sendAmount"
                          inputMode="decimal"
                          autoComplete="off"
                          className="mt-2 w-full bg-black border border-[#f59e0b]/15 rounded-xl px-4 py-3 text-[#f59e0b] focus:outline-none focus:border-[#f59e0b]/40 text-2xl focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={sendStatus === "SENDING" || sendPhone.length < 9}
                        className="w-full rounded-xl bg-[#f59e0b] text-black py-3 font-bold uppercase tracking-widest disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        {sendStatus === "SENDING" ? "Executing..." : "Confirm"}
                      </button>
                    </form>
                  )}
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>

          <div className="hidden">{idleSeconds}</div>
        </>
      )}
    </div>
  );
}
