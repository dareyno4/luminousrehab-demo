import { useState, useCallback } from 'react';
import { runOCR, parseMultipleMedications, getMedicationConfidence, MedicationInfo, OCRResult } from '../utils/ocrService';

export interface UseOCRResult {
  isProcessing: boolean;
  error: string | null;
  ocrResult: OCRResult | null;
  medications: Partial<MedicationInfo>[];
  scanImage: (file: File) => Promise<void>;
  scanFromCamera: () => Promise<void>;
  reset: () => void;
}

export function useOCR(): UseOCRResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [medications, setMedications] = useState<Partial<MedicationInfo>[]>([]);

  const scanImage = useCallback(async (file: File) => {
    if (!file) { setError('No file provided'); return; }
    if (!file.type.startsWith('image/')) { setError('Please provide an image'); return; }
    setIsProcessing(true); setError(null); setOcrResult(null); setMedications([]);
    try {
      const result = await runOCR(file);
      setOcrResult(result);
      const parsed = parseMultipleMedications(result.text).map(m => ({ ...m, confidence: getMedicationConfidence(m) }));
      setMedications(parsed);
    } catch (e: any) {
      setError(e.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const scanFromCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera not supported'); return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) await scanImage(file);
    };
    input.click();
  }, [scanImage]);

  const reset = useCallback(() => { setIsProcessing(false); setError(null); setOcrResult(null); setMedications([]); }, []);

  return { isProcessing, error, ocrResult, medications, scanImage, scanFromCamera, reset };
}
