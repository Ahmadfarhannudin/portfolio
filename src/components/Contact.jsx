import { motion } from "./motion";
import { useCallback, useEffect, useRef, useState } from 'react';
import { BadgeCheck, ChevronDown, ChevronUp, MessageCircle, Reply, Send } from 'lucide-react';
import TerminalContact from './TerminalContact';
import FindMe from './FindMe';
import { supabase } from './supabase';
import './Contact.css';
import ScrollReveal from './ScrollReveal';

// ============================================================
// CONFIG
// ============================================================

const PAGE_SIZE = 8; // jumlah komentar utama per halaman
const COLLAPSE_AFTER = 2; // thread dengan balasan lebih dari ini dilipat
const NAME_MAX = 40;
const COMMENT_MAX = 500;
const COOLDOWN_MS = 30_000; // jeda antar komentar dari perangkat yang sama

const LS_NAME = 'portfolio:comment-name';
const LS_LAST = 'portfolio:comment-last';

const COLUMNS = 'id, name, message, created_at, parent_id, reply_to_name, is_owner';

// Dipakai HANYA jika Supabase belum dikonfigurasi (mode lokal / tidak tersimpan)
const defaultComments = [
  {
    id: 'demo-1',
    name: 'Alex',
    comment: 'Great portfolio! Loved the animations.',
    isOwner: false,
    replies: [
      {
        id: 'demo-1a',
        name: 'Farhan',
        comment: 'Thanks a lot, Alex!',
        isOwner: true,
        replies: []
      }
    ]
  },
  {
    id: 'demo-2',
    name: 'Sarah',
    comment: 'Keep creating! Your work is inspiring.',
    isOwner: false,
    replies: []
  }
];

// ============================================================
// HELPERS
// ============================================================

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* diabaikan */
    }
  }
};

// Kolom database bernama "message", di UI tetap "comment"
const toComment = (row, replies = []) => ({
  id: row.id,
  name: row.name,
  comment: row.message,
  createdAt: row.created_at,
  replyTo: row.reply_to_name ?? null,
  isOwner: Boolean(row.is_owner),
  replies: replies.map((r) => toComment(r))
});

const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const TIME_UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60]
];

// contoh: "5 menit yang lalu", "kemarin"
function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;

  for (const [unit, seconds] of TIME_UNITS) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }

  return 'baru saja';
}

// contoh: "21 Sep 2026 14.05"
const formatDate = (iso) => dateFmt.format(new Date(iso));

// Warna avatar konsisten berdasarkan nama
function hueFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

// ============================================================
// SATU KOMENTAR (komentar utama maupun balasan)
// ============================================================

function CommentItem({ item, isReply = false, active = false, onReply }) {
  return (
    <div
      className={`cmt-item${isReply ? ' is-reply' : ''}${item.isOwner ? ' is-owner' : ''}`}
    >
      <span
        className="cmt-avatar"
        style={{ '--hue': hueFromName(item.name) }}
        aria-hidden="true"
      >
        {item.name.trim().charAt(0).toUpperCase()}
      </span>

      <div className="cmt-main">
        <div className="cmt-bubble">
          <div className="cmt-meta">
            <span className="cmt-name">{item.name}</span>

            {item.isOwner && (
              <span className="cmt-badge">
                <BadgeCheck size={12} aria-hidden="true" />
                Owner
              </span>
            )}
          </div>

          {item.replyTo && (
            <span className="cmt-replyto">
              <Reply size={12} aria-hidden="true" />
              membalas {item.replyTo}
            </span>
          )}

          <p className="cmt-text">{item.comment}</p>
        </div>

        <div className="cmt-foot">
          {item.createdAt && (
            <time
              className="cmt-time"
              dateTime={item.createdAt}
              title={formatDate(item.createdAt)}
            >
              <span>{timeAgo(item.createdAt)}</span>
              <span className="cmt-date">{formatDate(item.createdAt)}</span>
            </time>
          )}

          {onReply && (
            <button
              type="button"
              className={`cmt-reply${active ? ' is-active' : ''}`}
              onClick={onReply}
              aria-expanded={active}
            >
              {active ? 'Batal' : 'Balas'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORM BALASAN
// ============================================================

function ReplyForm({ target, initialName, onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const textRef = useRef(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (busy) return;

    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      setErr('nama dan balasan wajib diisi');
      return;
    }

    setBusy(true);
    setErr('');

    const result = await onSubmit({ name: cleanName, message: cleanMessage });

    // Jika sukses, parent menutup form ini (unmount). Jika gagal, tampilkan pesan.
    if (result?.errorText) {
      setErr(result.errorText);
      setBusy(false);
    }
  };

  return (
    <form className="cmt-reply-form" onSubmit={handleSubmit}>
      <p className="cmt-reply-title">
        <Reply size={14} aria-hidden="true" />
        Membalas <strong>{target.name}</strong>
      </p>

      <input
        className="cmt-reply-input"
        type="text"
        placeholder="Nama kamu"
        aria-label="Nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={NAME_MAX}
        autoComplete="name"
      />

      <textarea
        ref={textRef}
        className="cmt-reply-input"
        rows="3"
        placeholder="Tulis balasan..."
        aria-label="Balasan"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        maxLength={COMMENT_MAX}
      />

      {err && <p className="contact-form-error">{err}</p>}

      <div className="cmt-reply-actions">
        <span className="cmt-reply-count">
          {message.length}/{COMMENT_MAX}
        </span>

        <button type="button" className="cmt-reply-cancel" onClick={onCancel}>
          Batal
        </button>

        <button type="submit" className="cmt-reply-send" disabled={busy}>
          <Send size={14} aria-hidden="true" />
          {busy ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// COMPONENT UTAMA
// ============================================================

export default function Contact() {
  const configured = Boolean(supabase);

  const [threads, setThreads] = useState(configured ? [] : defaultComments);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(configured ? 'loading' : 'disabled');

  const [form, setForm] = useState(() => ({
    name: storage.get(LS_NAME) ?? '',
    comment: ''
  }));
  const [website, setWebsite] = useState(''); // honeypot anti-bot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [replyTarget, setReplyTarget] = useState(null); // { id, rootId, name, isReply }
  const [expanded, setExpanded] = useState(() => new Set());

  const [, setTick] = useState(0); // render ulang tiap menit agar waktu relatif tetap akurat
  const listRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startY: 0, startTop: 0 });

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const el = listRef.current;
      if (!el) return;
      e.preventDefault();
      el.scrollTop = dragRef.current.startTop - (e.clientY - dragRef.current.startY);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  // ----------------------------------------------------------
  // FETCH: komentar utama + balasannya
  // ----------------------------------------------------------

  const fetchPage = useCallback(async (from) => {
    const { data, error: fetchError, count } = await supabase
      .from('comments')
      .select(COLUMNS, { count: 'exact' })
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (fetchError) throw fetchError;

    const roots = data ?? [];
    let replies = [];

    if (roots.length > 0) {
      const { data: replyData, error: replyError } = await supabase
        .from('comments')
        .select(COLUMNS)
        .in('parent_id', roots.map((r) => r.id))
        .order('created_at', { ascending: true });

      if (replyError) throw replyError;
      replies = replyData ?? [];
    }

    return {
      rows: roots.map((root) =>
        toComment(root, replies.filter((r) => r.parent_id === root.id))
      ),
      count: count ?? 0
    };
  }, []);

  useEffect(() => {
    if (!configured) return;

    let ignore = false;

    fetchPage(0)
      .then(({ rows, count }) => {
        if (ignore) return;
        setThreads(rows);
        setTotal(count);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('[Comments] gagal memuat dari Supabase:', err);
        if (!ignore) setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [configured, fetchPage]);

  // ----------------------------------------------------------
  // KIRIM KOMENTAR / BALASAN (dipakai form utama & form balasan)
  // ----------------------------------------------------------

  const postComment = async ({ name, message, parentId = null, replyToName = null }) => {
    // Mode lokal (Supabase belum dikonfigurasi)
    if (!configured) {
      return {
        data: {
          id: `local-${Date.now()}`,
          name,
          comment: message,
          createdAt: new Date().toISOString(),
          replyTo: replyToName,
          isOwner: false,
          replies: []
        }
      };
    }

    const wait = COOLDOWN_MS - (Date.now() - Number(storage.get(LS_LAST) ?? 0));

    if (wait > 0) {
      return { errorText: `tunggu ${Math.ceil(wait / 1000)} detik sebelum mengirim lagi` };
    }

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({
        name,
        message,
        parent_id: parentId,
        reply_to_name: replyToName
      })
      .select(COLUMNS)
      .single();

    if (insertError) {
      console.error('[Comments] gagal mengirim ke Supabase:', insertError);
      return { errorText: 'gagal dikirim, periksa koneksi lalu coba lagi' };
    }

    storage.set(LS_NAME, name);
    storage.set(LS_LAST, String(Date.now()));

    return { data: toComment(data) };
  };

  // ----------------------------------------------------------
  // HANDLERS — FORM UTAMA
  // ----------------------------------------------------------

  const handleNameChange = (e) => {
    setForm((prev) => ({ ...prev, name: e.target.value }));
    setSuccess('');
  };

  const handleCommentChange = (e) => {
    setForm((prev) => ({ ...prev, comment: e.target.value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const name = form.name.trim();
    const comment = form.comment.trim();

    setSuccess('');

    if (!name || !comment) {
      setError('nama dan komentar wajib diisi');
      return;
    }

    // Honeypot: bot biasanya mengisi kolom tersembunyi
    if (website) {
      setForm((prev) => ({ ...prev, comment: '' }));
      setError('');
      setSuccess('komentar terkirim, terima kasih!');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await postComment({ name, message: comment });

    setSubmitting(false);

    if (result.errorText) {
      setError(result.errorText);
      return;
    }

    setThreads((prev) => [result.data, ...prev]);
    setTotal((prev) => prev + 1);

    // Mode lokal mengosongkan nama seperti versi awal; mode server mengingat nama
    setForm(configured ? (prev) => ({ ...prev, comment: '' }) : { name: '', comment: '' });
    setSuccess('komentar terkirim, terima kasih!');
  };

  // ----------------------------------------------------------
  // HANDLERS — BALASAN
  // ----------------------------------------------------------

  const openReply = (thread, item) => {
    setReplyTarget((prev) =>
      prev?.id === item.id
        ? null
        : { id: item.id, rootId: thread.id, name: item.name, isReply: item.id !== thread.id }
    );

    // pastikan thread terbuka saat membalas
    setExpanded((prev) => new Set(prev).add(thread.id));
  };

  const handleReply = async ({ name, message }) => {
    const target = replyTarget;

    if (!target) return { errorText: 'target balasan tidak ditemukan' };

    const result = await postComment({
      name,
      message,
      parentId: target.rootId,
      // "membalas X" hanya perlu jika membalas sebuah balasan
      replyToName: target.isReply ? target.name : null
    });

    if (result.errorText) return result;

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === target.rootId
          ? { ...thread, replies: [...thread.replies, result.data] }
          : thread
      )
    );
    setReplyTarget(null);

    return { ok: true };
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showList = status === 'ready' || status === 'disabled';

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <ScrollReveal direction="up" distance={50} duration={0.85}>
          <div className="contact-title">
            <h2 className="contact-heading">
              <span className="contact-heading-gradient">Let's Connect</span>
            </h2>
            <p className="contact-subtitle">Hubungi saya atau tinggalkan komentar di bawah</p>
          </div>
        </ScrollReveal>

        <motion.div
          className="contact-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <ScrollReveal direction="up" distance={40} delay={0.1} duration={0.9}>
            <div className="contact-left">
              <ScrollReveal direction="left" distance={40} delay={0.25} duration={0.9}>
                <div className="contact-terminal">
                  <TerminalContact />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" distance={40} delay={0.35} duration={0.9}>
                <div className="contact-findme">
                  <FindMe />
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" distance={40} delay={0.3} duration={0.95}>
            <div className="contact-right">
              <ScrollReveal direction="zoom" distance={0} delay={0.2} duration={0.9}>
                <div className="contact-comments">
                  <ScrollReveal direction="up" distance={30} delay={0.25} duration={0.85}>
                    <div className="contact-form-card">
                      <h3 className="contact-form-title">Tinggalkan Komentar</h3>
                      <form onSubmit={handleSubmit} className="contact-form">
                        <label htmlFor="contact-name">Nama</label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder="Masukkan nama kamu"
                          value={form.name}
                          onChange={handleNameChange}
                          maxLength={NAME_MAX}
                          autoComplete="name"
                        />
                        <label htmlFor="contact-comment">Komentar</label>
                        <textarea
                          id="contact-comment"
                          rows="3"
                          placeholder="Tulis komentar kamu..."
                          value={form.comment}
                          onChange={handleCommentChange}
                          maxLength={COMMENT_MAX}
                        />
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: '-9999px',
                            width: 1,
                            height: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <label>
                            Website
                            <input
                              type="text"
                              tabIndex={-1}
                              autoComplete="off"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                            />
                          </label>
                        </div>
                        {error && <p className="contact-form-error">{error}</p>}
                        {success && (
                          <p className="contact-form-success" role="status">
                            {success}
                          </p>
                        )}
                        <button type="submit" className="contact-submit" disabled={submitting}>
                          {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                        </button>
                      </form>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="up" distance={30} delay={0.4} duration={0.85}>
                    <div className="cmt">
                      <h3 className="cmt-title">
                        Komentar Terbaru
                        {status === 'ready' && total > 0 && (
                          <span className="cmt-count">{total}</span>
                        )}
                      </h3>

                      {status === 'loading' && (
                        <div className="cmt-skeletons" aria-busy="true">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="cmt-item is-skeleton" aria-hidden="true">
                              <span className="cmt-avatar" />
                              <div className="cmt-main">
                                <span className="cmt-sk-line short" />
                                <span className="cmt-sk-line" />
                                <span className="cmt-sk-line" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {status === 'error' && (
                        <p className="cmt-status is-error" role="alert">
                          Komentar gagal dimuat. Coba muat ulang halaman.
                        </p>
                      )}

                      {status === 'ready' && threads.length === 0 && (
                        <div className="cmt-empty">
                          <span className="cmt-empty-icon">
                            <MessageCircle size={22} />
                          </span>
                          <p>Belum ada komentar. Jadilah yang pertama menyapa!</p>
                        </div>
                      )}

                      {showList && threads.length > 0 && (
                        <div
                          ref={listRef}
                          className={`cmt-list-scroll${dragging ? ' is-dragging' : ''}`}
                          data-lenis-prevent="true"
                          onWheel={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseEnter={() => window.__lenis?.stop?.()}
                          onMouseLeave={() => window.__lenis?.start?.()}
                          onTouchStart={() => window.__lenis?.stop?.()}
                          onTouchEnd={() => window.__lenis?.start?.()}
                          onMouseDown={(e) => {
                            if (e.button !== 0) return;
                            const el = e.currentTarget;
                            dragRef.current = { startY: e.clientY, startTop: el.scrollTop };
                            setDragging(true);
                          }}
                        >
                          {threads.map((thread) => {
                            const replyCount = thread.replies.length;
                            const collapsible = replyCount > COLLAPSE_AFTER;
                            const collapsed = collapsible && !expanded.has(thread.id);
                            const replying = replyTarget?.rootId === thread.id;

                            return (
                              <article key={thread.id} className="cmt-thread">
                                <CommentItem
                                  item={thread}
                                  active={replyTarget?.id === thread.id}
                                  onReply={() => openReply(thread, thread)}
                                />

                                {(replyCount > 0 || replying) && (
                                  <div className="cmt-replies">
                                    {collapsed ? (
                                      <button
                                        className="cmt-replies-toggle"
                                        onClick={() => toggleExpanded(thread.id)}
                                      >
                                        <ChevronDown size={14} />
                                        Lihat {replyCount} balasan
                                      </button>
                                    ) : (
                                      <>
                                        {thread.replies.map((reply) => (
                                          <CommentItem
                                            key={reply.id}
                                            item={reply}
                                            isReply
                                            active={replyTarget?.id === reply.id}
                                            onReply={() => openReply(thread, reply)}
                                          />
                                        ))}
                                        {collapsible && (
                                          <button
                                            className="cmt-replies-toggle"
                                            onClick={() => toggleExpanded(thread.id)}
                                          >
                                            <ChevronUp size={14} />
                                            Sembunyikan balasan
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {replying && (
                                      <ReplyForm
                                        key={replyTarget.id}
                                        target={replyTarget}
                                        initialName={form.name}
                                        onSubmit={handleReply}
                                        onCancel={() => setReplyTarget(null)}
                                      />
                                    )}
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </motion.div>
      </div>
    </section>
  );
}