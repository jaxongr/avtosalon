import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '@nestjs/common';

const logger = new Logger('CarVision');

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      logger.warn('ANTHROPIC_API_KEY not set, car vision disabled');
      return null;
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface CarVisionResult {
  carBrand: string | null;
  carModel: string | null;
  carYear: number | null;
  carColor: string | null;
  carBody: string | null;
  confidence: string;
}

/**
 * Rasm buffer'dan mashina brendi, modeli, rangi va yilini aniqlash
 * Claude Haiku orqali - har bir rasm ~$0.001
 */
export async function recognizeCarFromImage(imageBuffer: Buffer): Promise<CarVisionResult> {
  const empty: CarVisionResult = {
    carBrand: null, carModel: null, carYear: null,
    carColor: null, carBody: null, confidence: 'none',
  };

  const anthropic = getClient();
  if (!anthropic) return empty;

  try {
    const base64 = imageBuffer.toString('base64');
    const mediaType = 'image/jpeg';

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Bu rasmdagi mashinani aniqla. Faqat JSON formatda javob ber, boshqa hech narsa yozma:
{"brand":"brend","model":"model","year":yil_taxminiy,"color":"rang","body":"sedan/suv/hatchback/minivan/truck","confidence":"high/medium/low"}
Agar mashina ko'rinmasa: {"brand":null,"model":null,"year":null,"color":null,"body":null,"confidence":"none"}`,
            },
          ],
        },
      ],
    });

    const text = (response.content[0] as any).text || '';
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) return empty;

    const parsed = JSON.parse(jsonMatch[0]);
    logger.log(`Car recognized: ${parsed.brand} ${parsed.model} (${parsed.confidence})`);

    return {
      carBrand: parsed.brand || null,
      carModel: parsed.model || null,
      carYear: parsed.year ? parseInt(parsed.year) : null,
      carColor: parsed.color || null,
      carBody: parsed.body || null,
      confidence: parsed.confidence || 'low',
    };
  } catch (error) {
    logger.error(`Car vision error: ${(error as any).message}`);
    return empty;
  }
}
