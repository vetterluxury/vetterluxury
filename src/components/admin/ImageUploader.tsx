'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  bucket: 'products' | 'banners' | 'collections';
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}

/**
 * Faz upload para o Supabase Storage e devolve as URLs públicas.
 * Pré-requisito: os buckets "products", "banners" e "collections" devem
 * existir e estar marcados como públicos (veja README, seção Storage).
 */
export default function ImageUploader({ bucket, value, onChange, multiple = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        setError(`Falha ao enviar ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      uploaded.push(publicUrlData.publicUrl);
    }

    onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
    setUploading(false);
  }

  async function handleRemove(url: string) {
    const path = url.split(`/${bucket}/`)[1];
    if (path) {
      await supabase.storage.from(bucket).remove([path]);
    }
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-sm overflow-hidden border border-marsala-dark/15">
            <Image src={url} alt="Imagem enviada" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 w-5 h-5 bg-marsala-dark/80 text-white rounded-full text-xs flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <label className="btn-outline border-marsala-dark text-marsala-dark text-xs inline-block cursor-pointer">
        {uploading ? 'Enviando...' : 'Enviar Imagem(ns)'}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-xs text-marsala mt-2">{error}</p>}
    </div>
  );
}
