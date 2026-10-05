import { useEffect, useRef, useState, useCallback } from 'react';
import './Terminal.css';

export default function Terminal({
  commands = [],
  outputs = {},
  typingSpeed = 45,
  delayBetweenCommands = 1000,
  prompt = '>',
  className = ''
}) {
  const [displayed, setDisplayed] = useState([]);
  const containerRef = useRef(null);
  const timerRefs = useRef([]);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    setDisplayed([]);
    clearTimers();

    let globalDelay = 0;

    commands.forEach((cmd, cmdIndex) => {
      const lines = cmd.split('\n');
      let lineDelay = globalDelay;

      lines.forEach((line) => {
        timerRefs.current.push(setTimeout(() => {
          setDisplayed(prev => [...prev, { type: 'command', text: line }]);
        }, lineDelay));
        lineDelay += typingSpeed * (line.length || 1);
      });

      const outputLines = outputs[cmdIndex] || [];
      timerRefs.current.push(setTimeout(() => {
        outputLines.forEach((outLine, oi) => {
          timerRefs.current.push(setTimeout(() => {
            setDisplayed(prev => [...prev, { type: 'output', text: outLine }]);
          }, oi * 30));
        });
      }, lineDelay));

      globalDelay = lineDelay + delayBetweenCommands;
    });

    return clearTimers;
  }, [commands, outputs, typingSpeed, delayBetweenCommands, clearTimers]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayed]);

  return (
    <div className={`terminal ${className}`} ref={containerRef}>
      <div className="terminal-header">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">hubungi-saya</span>
      </div>
      <div className="terminal-body">
        {displayed.map((item, i) => (
          <div key={i} className={`terminal-line ${item.type}`}>
            {item.type === 'command' && <span className="terminal-prompt">{prompt}</span>}
            <span>{item.text}</span>
          </div>
        ))}
        <div className="terminal-line terminal-cursor">
          <span className="terminal-prompt">{prompt}</span>
          <span className="blinking-cursor">_</span>
        </div>
      </div>
    </div>
  );
}
