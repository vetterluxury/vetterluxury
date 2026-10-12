import { EMAIL, INSTAGRAM_URL, LINKEDIN_URL, PINTEREST_URL } from '@/config/social';

type Item = { label: string; href: string; external: boolean; icon: React.ReactNode };

const stroke = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const solid = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;

const ALL_ITEMS: Item[] = [
  {
    label: 'Instagram da Vetter Luxury',
    href: INSTAGRAM_URL,
    external: true,
    icon: (
      <svg {...stroke}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn da Vetter Luxury',
    href: LINKEDIN_URL,
    external: true,
    icon: (
      <svg {...solid}>
        <path d="M4 9h4v12H4zM6 3a2 2 0 110 4 2 2 0 010-4zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.4 2.6 4.4 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z" />
      </svg>
    ),
  },
  {
    label: 'Pinterest da Vetter Luxury',
    href: PINTEREST_URL,
    external: true,
    icon: (
      <svg {...solid}>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
      </svg>
    ),
  },
  {
    label: 'Enviar e-mail para a Vetter Luxury',
    href: EMAIL ? `mailto:${EMAIL}` : '',
    external: false,
    icon: (
      <svg {...stroke}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

/**
 * Botões redondos das redes sociais, empilhados acima do botão do WhatsApp.
 * Só aparecem as redes que tiverem link preenchido em src/config/social.ts.
 */
export default function SocialButtons() {
  const items = ALL_ITEMS.filter((item) => item.href);
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Redes sociais e contato"
      className="fixed bottom-[104px] right-7 z-[900] w-[60px] flex flex-col items-center gap-2.5"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          title={item.label}
          aria-label={item.label}
          {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-marsala flex items-center justify-center shadow-lg hover:scale-105 hover:bg-marsala-dark transition"
        >
          {item.icon}
        </a>
      ))}
    </nav>
  );
}
