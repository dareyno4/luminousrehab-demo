// Basic OCR & parsing service adapted from provided implementation (simplified for integration)
import Tesseract from 'tesseract.js';

export interface OCRWordBox {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  previewImage?: string;
  previewImageWidth?: number;
  previewImageHeight?: number;
  words?: OCRWordBox[];
}

export interface MedicationInfo {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  quantity: string;
  refills: string;
  instructions: string;
  confidence: number;
}

// Run OCR (lightweight preprocessing only)
export async function runOCR(file: File | Blob | string): Promise<OCRResult> {
  const image = typeof file === 'string' ? file : URL.createObjectURL(file as Blob);
  const worker = await Tesseract.createWorker('eng');
  try {
    const result = await worker.recognize(image);
    const data: any = result.data;
    await worker.terminate();
    // Extract words (flat map)
    let words: OCRWordBox[] = [];
    if (data.lines) {
      for (const line of data.lines) {
        if (line.words) {
          for (const w of line.words) {
            words.push({
              text: w.text,
              bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
              confidence: w.confidence ?? 0,
            });
          }
        }
      }
    }
    return {
      text: data.text ?? '',
      confidence: Math.round(data.confidence ?? 0),
      previewImage: image,
      words,
    };
  } catch (e) {
    await worker.terminate();
    throw new Error('Failed to extract text from image');
  }
}

// Very simple single medication parse (placeholder; can be replaced by advanced logic)
export function parseMedicationFromText(text: string): Partial<MedicationInfo> {
  const med: Partial<MedicationInfo> = {};
  // Name: first non-empty line without digits
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  med.name = lines.find(l => /[A-Za-z]{3,}/.test(l) && !/\d{4,}/.test(l)) || 'Unknown';
  // Dosage pattern
  const dosageMatch = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)/i);
  if (dosageMatch) med.dosage = dosageMatch[0];
  // Frequency
  const freqMatch = text.match(/(once|twice|three times|daily|BID|TID|QID)/i);
  if (freqMatch) med.frequency = freqMatch[0];
  // Route
  const routeMatch = text.match(/(oral|by mouth|topical|IV|IM|inhalation)/i);
  if (routeMatch) med.route = routeMatch[0];
  // Instructions (first sentence starting with Take)
  const instrMatch = text.match(/take[^.]+\./i);
  if (instrMatch) med.instructions = instrMatch[0];
  return med;
}

export function parseMultipleMedications(text: string): Partial<MedicationInfo>[] {
  // For now always return single
  return [parseMedicationFromText(text)];
}

export function getMedicationConfidence(med: Partial<MedicationInfo>): number {
  let score = 0; let total = 0;
  if (med.name) { score += 3; total += 3; }
  if (med.dosage) { score += 2; total += 2; }
  if (med.frequency) { score += 2; total += 2; }
  if (med.route) { score += 1; total += 1; }
  if (med.instructions) { score += 2; total += 2; }
  return total ? Math.round((score / total) * 100) : 0;
}
