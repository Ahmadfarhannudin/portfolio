import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function NavBar({ items, className, ready = true }) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "")
  const isClickScrolling = useRef(false)
  const clickScrollTimer = useRef(null)

  useEffect(() => {
    const ids = items.map((i) => i.url.replace("#", ""))
    let ticking = false

    const updateActive = () => {
      if (isClickScrolling.current) return
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= 160) current = id
      }
      const matched = items.find((i) => i.url === `#${current}`)
      if (matched) setActiveTab(matched.name)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        updateActive()
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    if (window.__lenis) window.__lenis.on("scroll", onScroll)
    updateActive()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (window.__lenis) window.__lenis.off("scroll", onScroll)
      if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current)
    }
  }, [items])

  const scrollTo = (url, name) => {
    setActiveTab(name)
    isClickScrolling.current = true
    if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current)

    const id = url.replace("#", "")
    const el = document.getElementById(id)
    if (!el) { isClickScrolling.current = false; return }

    const resetClickLock = () => {
      clickScrollTimer.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 100)
    }

    if (window.__lenis?.scrollTo) {
      window.__lenis.scrollTo(el, {
        offset: -20,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: resetClickLock,
      })
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      clickScrollTimer.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 900)
    }
  }

  return (
    /*
     * Fixed full-width row di top, flex justify-center agar pill
     * selalu tepat di tengah tanpa bergantung pada translate.
     * overflow-visible wajib agar UFO tidak ter-clip.
     */
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 z-[90] pointer-events-none overflow-visible",
        "flex justify-center items-start",
        "pt-10 sm:pt-11",
        className
      )}
      initial={{ opacity: 0, y: -140 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -140 }}
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 18,
        mass: 0.9,
        delay: 0.1,
        opacity: { duration: 0.4, delay: 0.1 },
      }}
    >
      {/* Pill bar */}
      <div className="pointer-events-auto flex items-center justify-center gap-0.5 min-[360px]:gap-1 sm:gap-2 bg-slate-950/80 border border-white/15 backdrop-blur-md sm:backdrop-blur-xl py-1 px-1 min-[360px]:py-1.5 min-[360px]:px-1.5 sm:py-2 sm:px-2.5 rounded-full shadow-[0_0_28px_-8px_rgba(59,130,246,0.5)] whitespace-nowrap">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          return (
            <a
              key={item.name}
              href={item.url}
              onClick={(e) => {
                e.preventDefault()
                scrollTo(item.url, item.name)
              }}
              aria-label={item.name}
              className={cn(
                "relative cursor-pointer font-medium rounded-full transition-colors",
                "flex items-center justify-center gap-1 sm:gap-2 select-none shrink-0",
                "text-[11px] min-[360px]:text-xs sm:text-sm",
                "px-2.5 py-1.5 min-[360px]:px-3 min-[360px]:py-1.5 sm:px-5 sm:py-2.5",
                "text-white/60 hover:text-white",
                isActive && "bg-white/10 text-white font-semibold"
              )}
            >
              <Icon className="w-[15px] h-[15px] sm:w-5 sm:h-5 opacity-90 shrink-0" strokeWidth={2.2} />
              <span className="hidden min-[340px]:inline">{item.name}</span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full -z-10 overflow-visible"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  {/* UFO */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                       style={{ bottom: "calc(100% + 2px)" }}>
                    {/* Saucer */}
                    <div className="relative w-7 min-[360px]:w-8 sm:w-10 h-1.5 sm:h-2.5 bg-gradient-to-r from-slate-300 via-cyan-100 to-slate-300 rounded-full border border-cyan-300/80 shadow-[0_0_8px_#38bdf8,0_0_16px_#22d3ee,0_0_28px_rgba(34,211,238,0.6)] animate-pulse">
                      {/* Dome */}
                      <div className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 w-3.5 sm:w-5 h-1.5 sm:h-2.5 bg-cyan-200 rounded-t-full blur-[0.5px] shadow-[0_0_8px_#67e8f9,0_0_14px_#22d3ee]" />
                      {/* Light */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-200 rounded-full animate-pulse shadow-[0_0_8px_#fef08a,0_0_14px_#fde047]" />
                    </div>
                    {/* Beam cone */}
                    <div className="w-10 min-[360px]:w-12 sm:w-16 h-5 sm:h-8 bg-gradient-to-b from-cyan-300/60 via-blue-500/25 to-transparent blur-[2px] [clip-path:polygon(35%_0%,65%_0%,100%_100%,0%_100%)] -mt-px animate-pulse" />
                  </div>

                  {/* Active glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/20 to-purple-500/15 rounded-full" />
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </motion.div>
  )
}