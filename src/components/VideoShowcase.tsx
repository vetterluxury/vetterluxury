'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { FEATURED_VIDEO, SHORT_VIDEOS, type SiteVideo } from '@/config/videos';

/**
 * Vídeo que toca sozinho (sem som), só enquanto está visível na tela.
 * - Só baixa o arquivo quando a pessoa chega perto dele (não pesa o carregamento da página)
 * - Se o navegador bloquear o autoplay, ou o vídeo falhar, mostra a imagem de capa
 * - Se a pessoa pediu "reduzir movimento" no aparelho, não toca sozinho (mostra a capa e o botão play)
 */
export function AutoVideo({
  src,
  poster,
  label,
  className = '',
  showButton = true,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  showButton?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const loader = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' });
    const watcher = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    loader.observe(el);
    watcher.observe(el);
    return () => {
      loader.disconnect();
      watcher.disconnect();
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    if (visible && !reduced && !paused) {
      v.play().catch(() => setPaused(true));
    } else {
      v.pause();
    }
  }, [visible, reduced, paused, near]);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setPaused(false);
      setReduced(false);
      v.play().catch(() => undefined);
    } else {
      setPaused(true);
    }
  }

  const isPlaying = visible && !reduced && !paused && !failed;

  return (
    <div className={`relative overflow-hidden bg-champagne-deep ${className}`}>
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <video
          ref={ref}
          src={near ? src : undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {showButton && !failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? `Pausar vídeo: ${label}` : `Reproduzir vídeo: ${label}`}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#2b0a14]/70 hover:bg-[#2b0a14] text-white flex items-center justify-center transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}
    </div>
  );
}

/** Vídeo de fundo do banner principal. */
export function HeroVideoBackground({ src, poster }: { src: string; poster: string }) {
  return <AutoVideo src={src} poster={poster} label="Vetter Luxury" className="absolute inset-0" showButton={false} />;
}

function ShortCard({ video }: { video: SiteVideo }) {
  return (
    <div className="relative shrink-0 w-[62%] sm:w-[34%] md:w-[24%] snap-start">
      <AutoVideo src={video.src} poster={video.poster} label={video.title} className="aspect-[9/16] rounded-sm" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 pr-16 bg-gradient-to-t from-[#2b0a14]/80 to-transparent">
        <p className="font-heading text-white text-sm">{video.title}</p>
        {video.subtitle && <p className="text-white/80 text-xs mt-0.5">{video.subtitle}</p>}
      </div>
    </div>
  );
}

/** Seção de vídeos da página inicial. Não aparece se src/config/videos.ts estiver vazio. */
export default function VideoShowcase() {
  if (!FEATURED_VIDEO && SHORT_VIDEOS.length === 0) return null;

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {FEATURED_VIDEO && (
          <div className="relative">
            <AutoVideo
              src={FEATURED_VIDEO.src}
              poster={FEATURED_VIDEO.poster}
              label={FEATURED_VIDEO.title}
              className="aspect-[4/5] sm:aspect-video rounded-sm shadow-[0_20px_50px_rgba(74,18,34,0.18)]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-10 pr-16 bg-gradient-to-t from-[#2b0a14]/80 to-transparent">
              <h2 className="font-heading text-2xl md:text-4xl text-white">{FEATURED_VIDEO.title}</h2>
              {FEATURED_VIDEO.subtitle && <p className="text-white/85 text-sm md:text-base mt-2 max-w-lg">{FEATURED_VIDEO.subtitle}</p>}
            </div>
          </div>
        )}

        {SHORT_VIDEOS.length > 0 && (
          <div className={FEATURED_VIDEO ? 'mt-14' : ''}>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
              {SHORT_VIDEOS.map((v) => (
                <ShortCard key={v.src} video={v} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
