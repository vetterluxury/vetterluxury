'use client';

import Script from 'next/script';

export default function InstagramFeed() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="eyebrow">Instagram</p>
        <h2 className="font-heading text-3xl text-marsala-dark mt-3">@vetterluxury</h2>
        <div className="gold-rule" />
        <div className="mt-10">
          <div className="elfsight-app-88899158-f09b-4cae-af2f-3d721382cca9" data-elfsight-app-lazy />
        </div>
        <a
          href="https://instagram.com/vetterluxury"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline border-marsala-dark text-marsala-dark inline-block mt-9"
        >
          Seguir no Instagram
        </a>
      </div>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
    </section>
  );
}

