import {
  useState,
  useRef,
  useEffect
} from "react";

import {
  clickWavUris,
  successWavUri
} from "./terminalSoundManual";

import "./Terminal.css";

// ============================================================
// INITIAL TERMINAL LOGS
// ============================================================

const INITIAL_LOGS = [
  { type: "command", text: "contact --init" },
  { type: "output", text: "✔ Terminal contact service started." },
  { type: "output", text: "Silakan isi formulir di bawah ini:" }
];


// ============================================================
// LIMITER: 1 email = 1 pesan sampai dibalas
// ------------------------------------------------------------
// - Setelah sukses kirim, email dicatat di localStorage.
// - Kunci dibuka kalau hash SHA-256 email itu ada di
//   public/replied.json (kamu tambahkan setelah membalas).
// ============================================================

const SENT_KEY = "contact_sent_emails";

const normalizeEmail = (email) => email.trim().toLowerCase();

const getSent = () => {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY)) || {};
  } catch {
    return {};
  }
};

const markSent = (email) => {
  try {
    const sent = getSent();
    sent[normalizeEmail(email)] = Date.now();
    localStorage.setItem(SENT_KEY, JSON.stringify(sent));
  } catch {
    // storage diblokir, abaikan
  }
};

const clearSent = (email) => {
  try {
    const sent = getSent();
    delete sent[normalizeEmail(email)];
    localStorage.setItem(SENT_KEY, JSON.stringify(sent));
  } catch {
    // abaikan
  }
};

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// true = email ini masih harus menunggu balasan
async function isBlocked(email) {
  const key = normalizeEmail(email);

  if (!getSent()[key]) return false;

  try {
    const res = await fetch("/replied.json", { cache: "no-store" });

    if (res.ok) {
      const list = await res.json();

      if (list.includes(await sha256(key))) {
        clearSent(key); // sudah dibalas, buka kunci
        return false;
      }
    }
  } catch {
    // file tidak ada / bukan JSON: tetap terkunci
  }

  return true;
}


// ============================================================
// TERMINAL CONTACT COMPONENT
// ============================================================

export default function TerminalContact() {

  // STEP: 0 = name, 1 = email, 2 = message, 3 = confirmation, 4 = sent
  const [step, setStep] = useState(0);

  const [logs, setLogs] = useState(INITIAL_LOGS);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [currentInput, setCurrentInput] = useState("");

  const [isSending, setIsSending] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const prevInputLenRef = useRef(0);
  const busyRef = useRef(false); // cegah submit ganda saat proses async

  // Audio
  const typePoolRef = useRef(null);
  const typePoolIdxRef = useRef(0);
  const successAudioRef = useRef(null);
  const audioUnlockedRef = useRef(false);


  // ==========================================================
  // AUDIO
  // ==========================================================

  const getTypePool = () => {
    if (!typePoolRef.current) {
      typePoolRef.current = clickWavUris.map((uri) => {
        const audio = new Audio(uri);
        audio.volume = 0.42;
        audio.preload = "auto";
        return audio;
      });
    }
    return typePoolRef.current;
  };

  const getSuccessAudio = () => {
    if (!successAudioRef.current) {
      const audio = new Audio(successWavUri);
      audio.volume = 0.6;
      audio.preload = "auto";
      successAudioRef.current = audio;
    }
    return successAudioRef.current;
  };

  // Browser memblokir audio sebelum ada interaksi user
  const unlockAudio = () => {
    if (audioUnlockedRef.current) return;

    audioUnlockedRef.current = true;

    [...getTypePool(), getSuccessAudio()].forEach((audio) => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    });
  };

  const playKey = () => {
    const pool = getTypePool();

    if (!pool.length) return;

    const audio = pool[typePoolIdxRef.current];

    typePoolIdxRef.current = (typePoolIdxRef.current + 1) % pool.length;

    try {
      audio.currentTime = 0;
    } catch {
      // abaikan
    }

    audio.play().catch(() => {});
  };

  const playSuccess = () => {
    const audio = getSuccessAudio();

    try {
      audio.currentTime = 0;
    } catch {
      // abaikan
    }

    audio.play().catch(() => {});
  };


  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, step]);

  useEffect(() => {
    prevInputLenRef.current = currentInput.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isEmailInvalid =
    step === 1 &&
    currentInput.trim() !== "" &&
    !isValidEmail(currentInput.trim());

  const prompts = [
    "Masukkan nama Anda:",
    "Masukkan email Anda:",
    "Tulis pesan Anda:"
  ];


  // ==========================================================
  // INPUT HANDLERS
  // ==========================================================

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (value.length !== prevInputLenRef.current) {
      playKey();
    }

    prevInputLenRef.current = value.length;

    setCurrentInput(value);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    playKey();

    const value = currentInput.trim();

    if (!value && step < 3) return;

    submitStep(value);
  };


  // ==========================================================
  // SUBMIT STEP
  // ==========================================================

  const submitStep = async (value) => {

    if (busyRef.current) return;

    // STEP 0 — NAME
    if (step === 0) {
      setFormData((previous) => ({ ...previous, name: value }));

      setLogs((previous) => [
        ...previous,
        { type: "prompt", text: prompts[0] },
        { type: "command", text: value }
      ]);

      setCurrentInput("");
      prevInputLenRef.current = 0;
      setStep(1);
      return;
    }

    // STEP 1 — EMAIL
    if (step === 1) {

      if (!isValidEmail(value)) {
        setLogs((previous) => [
          ...previous,
          {
            type: "error",
            text: "✗ Email tidak valid — format: user@example.com"
          }
        ]);
        return;
      }

      busyRef.current = true;

      let blocked = false;

      try {
        blocked = await isBlocked(value);
      } finally {
        busyRef.current = false;
      }

      if (blocked) {
        setLogs((previous) => [
          ...previous,
          {
            type: "error",
            text: "✗ Email ini sudah mengirim pesan. Mohon tunggu balasan dari saya sebelum mengirim lagi."
          }
        ]);
        return;
      }

      setFormData((previous) => ({ ...previous, email: value }));

      setLogs((previous) => [
        ...previous,
        { type: "prompt", text: prompts[1] },
        { type: "command", text: value }
      ]);

      setCurrentInput("");
      prevInputLenRef.current = 0;
      setStep(2);
      return;
    }

    // STEP 2 — MESSAGE
    if (step === 2) {
      setFormData((previous) => ({ ...previous, message: value }));

      setLogs((previous) => [
        ...previous,
        { type: "prompt", text: prompts[2] },
        { type: "command", text: value }
      ]);

      setCurrentInput("");
      prevInputLenRef.current = 0;
      setStep(3);
    }
  };


  // ==========================================================
  // SEND MESSAGE (kirim ke email via Web3Forms)
  // ==========================================================

  const handleSend = async () => {

    if (isSending) return;

    setIsSending(true);

    setLogs((previous) => [
      ...previous,
      { type: "command", text: "send --payload" },
      { type: "output", text: "⏳ Connecting to server..." }
    ]);

    try {

      // Cek ulang sebelum kirim (misal user membuka 2 tab)
      if (await isBlocked(formData.email)) {
        setLogs((previous) => [
          ...previous,
          {
            type: "error",
            text: "✗ Email ini sudah mengirim pesan. Mohon tunggu balasan dari saya sebelum mengirim lagi."
          }
        ]);
        return;
      }

      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },

          body: JSON.stringify({
            access_key: import.meta.env.VITE_WEB3FORMS_KEY,
            subject: `[Portfolio] ${formData.name} (${formData.email})`,
            from_name: `${formData.name} via Portfolio`,
            name: formData.name,
            email: formData.email, // dipakai sebagai reply-to
            message: formData.message,
            botcheck: "" // honeypot anti-spam
          })
        }
      );

      let result = null;

      try {
        result = await response.json();
      } catch {
        // respons bukan JSON
      }

      // Server merespons tapi menolak (kuota habis, key salah, dll)
      if (!response.ok || !result?.success) {

        const serverMessage = result?.message || `HTTP ${response.status}`;

        console.error("Web3Forms error:", response.status, result);

        setLogs((previous) => [
          ...previous,
          {
            type: "error",
            text: `✗ Server menolak pengiriman: ${serverMessage}`
          },
          {
            type: "error",
            text: "Layanan email sedang bermasalah. Silakan hubungi saya lewat media sosial."
          }
        ]);

        return;
      }

      // Sukses: kunci email ini sampai dibalas
      markSent(formData.email);

      playSuccess();

      setLogs((previous) => [
        ...previous,
        { type: "output", text: "✔ Preflight checks passed." },
        { type: "output", text: "✔ Validated name & email." },
        { type: "output", text: "✔ Message encrypted & dispatched." },
        {
          type: "success",
          text: "🚀 Pesan berhasil dikirim! Terima kasih telah menghubungi saya."
        }
      ]);

      setStep(4);

    } catch (error) {

      // Hanya masuk sini kalau fetch gagal total (offline, DNS, diblokir)
      console.error("Network error:", error);

      setLogs((previous) => [
        ...previous,
        {
          type: "error",
          text: "✗ Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi."
        }
      ]);

    } finally {

      setIsSending(false);
    }
  };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "" });
    setCurrentInput("");
    prevInputLenRef.current = 0;
    setStep(0);
    setLogs(INITIAL_LOGS);

    // audioUnlockedRef tidak direset: browser sudah mengizinkan audio
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="terminal interactive-terminal"
      onClick={() => {
        unlockAudio();
        inputRef.current?.focus();
      }}
      onTouchStart={unlockAudio}
    >

      {/* HEADER */}
      <div className="terminal-header">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">hubungi-saya.sh</span>
      </div>

      {/* BODY */}
      <div className="terminal-body" ref={containerRef}>

        {/* LOGS */}
        {logs.map((item, index) => (
          <div key={index} className={`terminal-line ${item.type}`}>

            {item.type === "command" && (
              <span className="terminal-prompt">&gt;</span>
            )}

            {item.type === "prompt" && (
              <span className="terminal-prompt-label">?</span>
            )}

            <span>{item.text}</span>

          </div>
        ))}

        {/* INPUT */}
        {step < 3 && (
          <div className="terminal-input-line">

            <span className="terminal-prompt-label">?</span>

            <span className="terminal-prompt-text">{prompts[step]}</span>

            <div
              className={`terminal-input-wrapper${
                isEmailInvalid ? " is-invalid" : ""
              }`}
            >
              <input
                ref={inputRef}
                type={step === 1 ? "email" : "text"}
                inputMode={step === 1 ? "email" : "text"}
                enterKeyHint={step === 2 ? "send" : "next"}
                className={`terminal-real-input${
                  isEmailInvalid ? " is-invalid" : ""
                }`}
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={unlockAudio}
                placeholder="ketik lalu tekan enter..."
                aria-invalid={isEmailInvalid}
              />

              {isEmailInvalid && (
                <span className="terminal-input-error">
                  ✗ format email salah — contoh: nama@domain.com
                </span>
              )}
            </div>

          </div>
        )}

        {/* CONFIRMATION */}
        {step === 3 && (
          <div className="terminal-summary-box">

            <div className="terminal-line output">📋 Ringkasan Data:</div>

            <div className="terminal-line output">
              {"  • Nama   : "}
              <span className="terminal-highlight">{formData.name}</span>
            </div>

            <div className="terminal-line output">
              {"  • Email  : "}
              <span className="terminal-highlight">{formData.email}</span>
            </div>

            <div className="terminal-line output">
              {"  • Pesan  : "}
              <span className="terminal-highlight">{formData.message}</span>
            </div>

            <div className="terminal-actions">

              <button
                type="button"
                className="terminal-btn primary"
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "⚡ Kirim Pesan"}
              </button>

              <button
                type="button"
                className="terminal-btn secondary"
                onClick={handleReset}
                disabled={isSending}
              >
                ↺ Edit Kembali
              </button>

            </div>

          </div>
        )}

        {/* SUCCESS */}
        {step === 4 && (
          <div className="terminal-actions">
            <button
              type="button"
              className="terminal-btn secondary"
              onClick={handleReset}
            >
              + Kirim Pesan Lain
            </button>
          </div>
        )}

      </div>
    </div>
  );
}