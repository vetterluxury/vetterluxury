import { whatsappLink } from '@/lib/utils';

export default function WhatsAppButton({
  message = 'Olá! Conheci a Vetter Luxury pelo site e gostaria de receber atendimento.',
}: {
  message?: string;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-7 right-7 z-[900] w-[60px] h-[60px] rounded-full bg-[#25D366] flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.3 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-2.1 0-4-.6-5.6-1.6l-.4-.2-4.6 1.2 1.2-4.5-.3-.4C5.2 17.5 4.6 16.3 4.6 15c0-6.3 5.1-11.4 11.4-11.4S27.4 8.7 27.4 15 22.3 24.8 16 24.8zm6.2-8.5c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2s-1 1.1-1.2 1.4c-.2.2-.4.3-.8.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.2-.7.2-.2.3-.4.5-.6.2-.2.2-.4.3-.6.1-.2 0-.5 0-.7-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z" />
      </svg>
    </a>
  );
}
