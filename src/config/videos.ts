/**
 * VÍDEOS DO SITE
 *
 * Enquanto esta lista estiver vazia (null / []), nenhuma área de vídeo aparece no site.
 * Para ativar um vídeo:
 *   1. Coloque o arquivo .mp4 dentro da pasta  public/videos/   (ex.: public/videos/hero.mp4)
 *   2. Coloque a imagem de capa (.jpg) na pasta  public/videos/   (ex.: public/videos/hero.jpg)
 *   3. Preencha abaixo (veja os exemplos comentados).
 *
 * Também pode usar um link completo (https://...) em "src" e "poster", por exemplo de um
 * arquivo no Supabase Storage. Isso evita deixar o repositório pesado.
 *
 * Formato recomendado: MP4 (H.264), sem áudio ou com áudio (o site sempre começa mudo),
 * de 8 a 20 segundos, até 8 MB cada (o GitHub não aceita upload de arquivo acima de 25 MB).
 *   - Banner/destaque: horizontal 1920x1080
 *   - Vídeos curtos: vertical 720x1280
 */

export type SiteVideo = {
  src: string; // caminho do vídeo, ex.: '/videos/destaque.mp4'
  poster: string; // imagem de capa, ex.: '/videos/destaque.jpg'
  title: string; // texto que aparece sobre o vídeo
  subtitle?: string;
};

/** Vídeo de fundo do banner principal (opcional). */
export const HERO_VIDEO: { src: string; poster: string } | null = null;
// Exemplo: export const HERO_VIDEO = { src: '/videos/hero.mp4', poster: '/videos/hero.jpg' };

/** Vídeo grande em destaque, logo abaixo da apresentação da marca. */
export const FEATURED_VIDEO: SiteVideo | null = null;
// Exemplo: export const FEATURED_VIDEO = { src: '/videos/destaque.mp4', poster: '/videos/destaque.jpg', title: 'Viva a experiência', subtitle: 'Descubra o que torna nossas peças únicas.' };

/** Vídeos curtos (vertical) mostrados em carrossel. */
export const SHORT_VIDEOS: SiteVideo[] = [];
// Exemplo: export const SHORT_VIDEOS = [{ src: '/videos/peca-1.mp4', poster: '/videos/peca-1.jpg', title: 'Conjunto Aurora' }];
