'use client';

import { useState } from 'react';
import type { Testimonial } from '@/types/database';

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  return (
    <section className="py-24 bg-champagne-soft/50">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="eyebrow">Depoimentos</p>
        <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">Quem já viveu a experiência</h2>
        <div className="gold-rule" />

        <div className="text-gold text-xl tracking-widest mt-6 mb-6" aria-hidden>
          {'★'.repeat(current.rating)}
          {'☆'.repeat(5 - current.rating)}
        </div>

        <p className="font-heading italic text-marsala-dark text-lg md:text-xl leading-relaxed mb-6">
          &ldquo;{current.quote}&rdquo;
        </p>
        <p className="text-[0.78rem] tracking-[0.1em] uppercase text-[#6a5f57]">
          {current.customer_name}
          {current.customer_location ? ` — ${current.customer_location}` : ''}
        </p>

        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-9">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                aria-label={`Ver depoimento ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? 'bg-marsala-dark' : 'bg-marsala-dark/25'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
