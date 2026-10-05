import { motion } from "framer-motion";
import { FolderGit2, Award, Trophy } from "lucide-react";
import GlareCard from "./GlareCard";
import "./Stats.css";

const statsData = [
  {
    title: "Projects",
    count: "6",
    subtitle: "Completed Apps & Web",
    description: "Full-stack applications",
    icon: FolderGit2,
    accent: "rgba(59, 130, 246, 0.7)",
    accentLight: "rgba(59, 130, 246, 0.1)",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    title: "Certificates",
    count: "3",
    subtitle: "Verified Credentials",
    description: "IT & Web Development",
    icon: Award,
    accent: "rgba(168, 85, 247, 0.7)",
    accentLight: "rgba(168, 85, 247, 0.1)",
    gradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
  },
  {
    title: "Awards",
    count: "4",
    subtitle: "Achievements & Honors",
    description: "Competitions & Recognition",
    icon: Trophy,
    accent: "rgba(245, 158, 11, 0.7)",
    accentLight: "rgba(245, 158, 11, 0.1)",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  },
];

export default function Stats({ onSelect }) {
  return (
    <div className="stats-section">
      <div className="stats-grid">
        {statsData.map((item, index) => {
          const Icon = item.icon;
          const ease = [0.16, 1, 0.3, 1];
          const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;
          const isRight = index % 2 === 1;
          const lateral = isDesktop ? (isRight ? 42 : -42) : 0;
          const vertical = isDesktop ? (index === 2 ? 8 : 0) : 0;
          return (
            <motion.div
              key={item.title}
              className="stats-wrapper"
              initial={{ opacity: 0, x: lateral, y: isDesktop ? vertical + 30 : 30, scale: 0.94, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: isDesktop ? 0.3 : 0.18 }}
              transition={{
                duration: 0.85,
                delay: isDesktop ? index * 0.16 : index * 0.14,
                ease,
              }}
            >
              <GlareCard 
                className="stats-glare"
                style={{ 
                  "--accent": item.accent,
                  "--accentLight": item.accentLight
                }}
              >
                <div className="stats-card" onClick={() => onSelect?.(item.title)}>
                  <div className="stats-header">
                    <motion.div
                      className="stats-icon-container"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 8,
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                    >
                      <div 
                        className="stats-icon-glow"
                        style={{ background: item.gradient }}
                      />
                      <div 
                        className="stats-icon-bg"
                        style={{ backgroundColor: item.accentLight }}
                      />
                      <Icon
                        className="stats-icon"
                        size={24}
                        strokeWidth={2}
                      />
                    </motion.div>

                    <div className="stats-meta">
                      <div className="stats-label-row">
                        <span className="stats-label">{item.title}</span>
                        <div 
                          className="stats-dot"
                          style={{ backgroundColor: item.accent }}
                        />
                      </div>
                      <p className="stats-desc">{item.description}</p>
                    </div>
                  </div>

                  <div className="stats-body">
                    <motion.div 
                      className="stats-count"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.15 + 0.3,
                        type: "spring",
                        stiffness: 150,
                      }}
                    >
                      {item.count}
                    </motion.div>
                    <p className="stats-subtitle">{item.subtitle}</p>
                  </div>

                  <div 
                    className="stats-shimmer"
                    style={{ 
                      background: `linear-gradient(90deg, transparent, ${item.accentLight}, transparent)`
                    }}
                  />
                </div>
              </GlareCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
