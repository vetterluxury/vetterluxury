const ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M12 2l1.9 5.8L20 9l-5.5 2.5L12 17l-2.5-5.5L4 9l6.1-1.2L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Design Exclusivo',
    text: 'Peças autorais, sem repetições em massa.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M12 2l8 3.5v5c0 5-3.4 8.8-8 10.5-4.6-1.7-8-5.5-8-10.5v-5L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Materiais Premium',
    text: 'Rendas e tecidos selecionados a dedo.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Acabamento de Alta Qualidade',
    text: 'Costura fina, acabamento impecável.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <rect x="5" y="10" width="14" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Compra 100% Segura',
    text: 'Pagamento protegido em todas as etapas.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M4 6h11v10H4z" />
        <path d="M15 10h3.5L21 13v3h-6z" />
        <circle cx="8" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
    title: 'Entrega para Todo o Brasil',
    text: 'Embalagem discreta, em qualquer endereço.',
  },
];

export default function Differentials() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="eyebrow">Diferenciais</p>
          <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">Por que Vetter Luxury</h2>
          <div className="gold-rule" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-14 text-center">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center text-marsala mb-5">
                {item.icon}
              </div>
              <h3 className="font-heading text-base text-marsala-dark mb-1.5">{item.title}</h3>
              <p className="text-[0.82rem] text-[#6a5f57] max-w-[160px]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
