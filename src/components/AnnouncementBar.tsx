'use client';

import { useEffect, useState } from 'react';

const MENSAGENS = ['VOLTE AQUI!', 'Vetter Luxury'];
const INTERVALO_MS = 2000; // tempo que cada mensagem fica visível
const FADE_MS = 400; // duração do efeito de piscar (fade)

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisivel(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MENSAGENS.length);
        setVisivel(true);
      }, FADE_MS);
    }, INTERVALO_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-marsala flex items-center justify-center">
      <span
        className="text-[0.72rem] sm:text-xs font-label tracking-[0.18em] uppercase text-champagne transition-opacity duration-300"
        style={{ opacity: visivel ? 1 : 0 }}
      >
        {MENSAGENS[index]}
      </span>
    </div>
  );
}
