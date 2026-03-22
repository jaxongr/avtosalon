import { createWorker } from 'tesseract.js';
import { Logger } from '@nestjs/common';

const logger = new Logger('OCR');

let worker: any = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('rus+eng', 1, {
      logger: () => {},
    });
  }
  return worker;
}

/**
 * Rasm buffer'dan OCR orqali matn o'qish
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const w = await getWorker();
    const { data } = await w.recognize(imageBuffer);
    const text = data.text?.trim() || '';
    logger.debug(`OCR extracted ${text.length} chars`);
    return text;
  } catch (error) {
    logger.error(`OCR error: ${(error as any).message}`);
    return '';
  }
}
