import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const key = process.env.FAL_KEY;
    if (!key) {
      return NextResponse.json({ error: 'FAL_KEY não configurada.' }, { status: 500 });
    }

    const body = await request.json();
    const prompt = String(body?.prompt ?? '').trim();
    const imageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls.filter(Boolean) : [];

    if (!prompt) {
      return NextResponse.json({ error: 'Instrução obrigatória.' }, { status: 400 });
    }
    if (imageUrls.length < 2) {
      return NextResponse.json({ error: 'Envie a referência e ao menos uma foto da cliente.' }, { status: 400 });
    }
    if (imageUrls.length > 6) {
      return NextResponse.json({ error: 'Use no máximo 1 referência + 5 fotos da cliente.' }, { status: 400 });
    }

    fal.config({ credentials: key });

    const identityInstruction = [
      'A primeira imagem é a referência de composição, pose, figurino, enquadramento, iluminação e cenário.',
      'As demais imagens mostram a cliente e devem ser usadas para preservar fielmente sua identidade facial.',
      'Não copie a identidade da pessoa da imagem de referência.',
      'Mantenha traços faciais, idade aparente, tom de pele e cabelo da cliente naturais e reconhecíveis.',
      prompt,
    ].join(' ');

    const result = await fal.subscribe('fal-ai/flux-pro/kontext/multi', {
      input: {
        prompt: identityInstruction,
        image_urls: imageUrls,
        num_images: 1,
        output_format: 'jpeg',
      },
      logs: false,
    });

    const data = result.data as any;
    const image = data?.images?.[0];
    if (!image?.url) {
      return NextResponse.json({ error: 'A IA não retornou uma imagem.' }, { status: 502 });
    }

    return NextResponse.json({ imageUrl: image.url, seed: data?.seed ?? null, requestId: result.requestId });
  } catch (error) {
    console.error('generate error', error);
    return NextResponse.json({ error: 'Falha ao gerar a imagem.' }, { status: 500 });
  }
}
