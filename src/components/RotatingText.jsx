import { useState, useEffect } from "react";

export default function RotatingText({
  words = ["Front End Developer", "Backend Developer", "Tech Enthusiast"],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseTime = 1500,
}) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];

    let timeout;

    if (!isDeleting && displayText.length < currentWord.length) {
      // sedang mengetik
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayText.length === currentWord.length) {
      // selesai ketik, jeda sebentar sebelum hapus
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayText.length > 0) {
      // sedang menghapus
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // pindah ke kata berikutnya
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="inline-flex items-center">
      {displayText}
      <span className="ml-0.5 w-[2px] h-[1em] bg-current animate-pulse" />
    </span>
  );
}