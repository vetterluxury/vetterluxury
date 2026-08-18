import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-marsala-dark text-champagne pt-20 pb-8 text-center">
      <div className="max-w-6xl mx-auto px-6">
        <Image
          src="/logo-vetter.png"
          alt="Vetter Luxury"
          width={120}
          height={120}
          className="h-12 w-auto mx-auto mb-4 brightness-0 invert opacity-90"
        />
        <p className="font-heading italic text-champagne-soft mb-2">Luxo, exclusividade e feminilidade.</p>
        <div className="gold-rule" />

        <div className="flex flex-wrap justify-center gap-20 my-9 text-left">
          <div>
            <h4 className="text-gold text-[0.82rem] tracking-[0.1em] uppercase mb-4">Navegue</h4>
            <Link href="/" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Início</Link>
            <Link href="/produtos" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Coleções</Link>
            <Link href="/contato" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Contato</Link>
            <Link href="/conta/pedidos" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Meus Pedidos</Link>
          </div>
          <div>
            <h4 className="text-gold text-[0.82rem] tracking-[0.1em] uppercase mb-4">Institucional</h4>
            <Link href="/privacidade" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Política de Privacidade</Link>
            <Link href="/termos" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Termos de Uso</Link>
            <Link href="/trocas" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">Trocas e Devoluções</Link>
          </div>
          <div>
            <h4 className="text-gold text-[0.82rem] tracking-[0.1em] uppercase mb-4">Contato</h4>
            <a href="https://api.whatsapp.com/send?phone=5551996767044" target="_blank" rel="noopener" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">
              WhatsApp: +55 51 99676-7044
            </a>
            <a href="https://instagram.com/vetterluxury" target="_blank" rel="noopener" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">
              Instagram: @vetterluxury
            </a>
            <a href="mailto:vetterluxury@gmail.com" className="block text-sm text-champagne/75 mb-2.5 hover:text-gold transition-colors">
              vetterluxury@gmail.com
            </a>
          </div>
        </div>

        <p className="text-xs text-champagne/45">&copy; {new Date().getFullYear()} Vetter Luxury. Todos os direitos reservados.</p>
        <p className="text-xs text-champagne/30 mt-2">Criado por Karine Vetter</p>
      </div>
    </footer>
  );
}
