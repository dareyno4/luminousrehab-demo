import { useState, useCallback } from 'react';
import { runOCR, parseMedicationFromText, parseMultipleMedications, getMedicationConfidence, MedicationInfo, OCRResult } from '../utils/ocrService';

export interface UseOCRResult {
  isProcessing: boolean;
  error: string | null;
  ocrResult: OCRResult | null;
  medications: Partial<MedicationInfo>[];
  scanImage: (file: File) => Promise<void>;
  scanFromCamera: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for OCR medication scanning
 */
export function useOCR(): UseOCRResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [medications, setMedications] = useState<Partial<MedicationInfo>[]>([]);

  const scanImage = useCallback(async (file: File) => {
    if (!file) {
      setError('No file provided');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please provide a valid image file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOcrResult(null);
    setMedications([]);

    try {
      // Run OCR
      const result = await runOCR(file);
      setOcrResult(result);

      console.log('📝 Raw OCR text:', result.text);

      // Parse medications from text (will intelligently detect single vs. multiple)
      const parsedMeds = parseMultipleMedications(result.text);
      
      console.log(`📦 Parsed ${parsedMeds.length} medication(s)`);
      
      // Add confidence scores
      const medsWithConfidence = parsedMeds.map(med => ({
        ...med,
        confidence: getMedicationConfidence(med),
      }));

      setMedications(medsWithConfidence);
      
      // Log results for debugging
      medsWithConfidence.forEach((med, idx) => {
        console.log(`  Medication ${idx + 1}:`, {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          route: med.route,
          confidence: med.confidence
        });
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const scanFromCamera = useCallback(async () => {
    try {
      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }

      // Create file input to trigger camera on mobile
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile

      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          await scanImage(file);
        }
      };

      input.click();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('Camera Error:', err);
    }
  }, [scanImage]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setOcrResult(null);
    setMedications([]);
  }, []);

  return {
    isProcessing,
    error,
    ocrResult,
    medications,
    scanImage,
    scanFromCamera,
    reset,
  };
}