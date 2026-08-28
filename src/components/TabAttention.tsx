'use client';

import { useEffect, useRef } from 'react';

const MENSAGEM_ALERTA = 'VOLTE AQUI! 🍒';
const INTERVALO_MS = 1200; // velocidade da piscada na aba

export default function TabAttention() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tituloOriginal = useRef('');

  useEffect(() => {
    tituloOriginal.current = document.title;

    function handleVisibilityChange() {
      if (document.hidden) {
        let mostrandoAlerta = true;
        intervalRef.current = setInterval(() => {
          document.title = mostrandoAlerta ? MENSAGEM_ALERTA : tituloOriginal.current;
          mostrandoAlerta = !mostrandoAlerta;
        }, INTERVALO_MS);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.title = tituloOriginal.current;
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
