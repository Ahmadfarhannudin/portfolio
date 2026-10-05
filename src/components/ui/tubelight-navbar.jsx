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
    if (window.__lenis) {
      window.__lenis.on("scroll", onScroll)
    }
    updateActive()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (window.__lenis) {
        window.__lenis.off("scroll", onScroll)
      }
      if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current)
    }
  }, [items])

  const scrollTo = (url, name) => {
    setActiveTab(name)
    isClickScrolling.current = true
    if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current)

    const id = url.replace("#", "")
    const el = document.getElementById(id)
    if (!el) {
      isClickScrolling.current = false
      return
    }

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
    <motion.div
      className={cn(
        "fixed left-1/2 z-[90] pointer-events-none w-[min(100%,calc(100vw-12px))] max-w-[calc(100vw-12px)] sm:w-auto sm:max-w-[98vw]",
        "top-[max(1rem,env(safe-area-inset-top,0px))] sm:top-5",
        "pt-8",
        className
      )}
      initial={{ opacity: 0, x: "-50%", y: -120 }}
      animate={
        ready
          ? { opacity: 1, x: "-50%", y: 0 }
          : { opacity: 0, x: "-50%", y: -120 }
      }
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 18,
        mass: 0.9,
        delay: 0.1,
        opacity: { duration: 0.4, delay: 0.1 },
      }}
    >
      <div className="pointer-events-auto mx-auto flex w-max max-w-full items-center justify-start gap-0.5 min-[380px]:gap-1 sm:gap-2 overflow-visible bg-slate-950/80 border border-white/15 backdrop-blur-md sm:backdrop-blur-xl py-1 px-1 min-[380px]:py-1.5 min-[380px]:px-1.5 sm:py-2 sm:px-2.5 rounded-full shadow-[0_0_28px_-8px_rgba(59,130,246,0.5)]">
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
                "relative cursor-pointer text-[11px] min-[400px]:text-xs sm:text-base font-medium rounded-full transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap select-none shrink-0",
                "px-2.5 py-1.5 min-[400px]:px-3 min-[400px]:py-2 sm:px-6 sm:py-2.5",
                "text-white/60 hover:text-white",
                isActive && "bg-white/10 text-white font-semibold"
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 opacity-90 shrink-0" strokeWidth={2.2} />
              <span className="hidden min-[360px]:inline">{item.name}</span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full -z-10 overflow-visible"
                  initial={false}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  <div className="absolute -top-[26px] sm:-top-[30px] left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center pointer-events-none">
                    {/* UFO Saucer */}
                    <div className="relative w-7 sm:w-8 h-2 sm:h-2 bg-gradient-to-r from-slate-300 via-cyan-100 to-slate-300 rounded-full border border-cyan-300/80 shadow-[0_0_8px_#38bdf8,0_0_16px_#22d3ee] animate-pulse">
                      {/* Cockpit Dome */}
                      <div className="absolute -top-1 sm:-top-1.5 left-1/2 -translate-x-1/2 w-3 sm:w-3.5 h-1.5 sm:h-2 bg-cyan-200 rounded-t-full blur-[0.3px] shadow-[0_0_6px_#67e8f9]" />
                      {/* UFO Light */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse shadow-[0_0_6px_#fef08a]" />
                    </div>

                    {/* Beam Cone */}
                    <div className="w-10 sm:w-12 h-6 sm:h-7 bg-gradient-to-b from-cyan-300/60 via-blue-500/25 to-transparent blur-[1.5px] [clip-path:polygon(32%_0%,68%_0%,100%_100%,0%_100%)] -mt-0.5 shadow-[0_8px_16px_rgba(34,211,238,0.4)] animate-pulse" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/20 to-purple-500/15 rounded-full blur-xs" />
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </motion.div>
  )
}