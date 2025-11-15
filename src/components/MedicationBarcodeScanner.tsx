import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Maximize2, Minimize2, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FDAMedicationData {
  brand_name?: string;
  generic_name?: string;
  route?: string[];
  active_ingredients?: Array<{ name: string; strength: string }>;
}

export interface ScannedMedication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
}

interface Props {
  onMedicationsScanned: (medications: ScannedMedication[]) => void;
  onCancel: () => void;
}

// Lightweight NDC formatting (subset)
function ndcCandidates(code: string): string[] {
  const digits = code.replace(/\D/g, '');
  const out: string[] = [];
  if (digits.length === 12) {
    const ndc11 = digits.slice(1, 12);
    out.push(`${ndc11.slice(0,4)}-${ndc11.slice(4,8)}`);
    out.push(`${ndc11.slice(0,5)}-${ndc11.slice(5,8)}`);
  } else if (digits.length === 11) {
    out.push(`${digits.slice(0,4)}-${digits.slice(4,8)}`);
    out.push(`${digits.slice(0,5)}-${digits.slice(5,8)}`);
  }
  return [...new Set(out)];
}

async function lookupFDA(code: string): Promise<FDAMedicationData | null> {
  for (const candidate of ndcCandidates(code)) {
    try {
      const url = `https://api.fda.gov/drug/ndc.json?search=product_ndc:"${candidate}"&limit=1`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results?.length) return data.results[0];
    } catch {}
  }
  return null;
}

export default function MedicationBarcodeScanner({ onMedicationsScanned, onCancel }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string>('');
  const [status, setStatus] = useState<string>('Upload an image');
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [zoom, setZoom] = useState(false); // toggle full-size preview
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const url = ev.target?.result as string;
      setImage(url);
      await scan(url);
    };
    reader.readAsDataURL(file);
  };

  async function scan(dataUrl: string) {
    setStatus('Scanning...'); setError(''); setScanning(true);
    try {
      const { BrowserMultiFormatReader, BarcodeFormat } = await import('@zxing/library');
      const img = new Image(); img.src = dataUrl; await new Promise(r => { img.onload = r; });
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);
      const raw = result.getText();
      setBarcode(raw);
      setStatus(`Detected ${BarcodeFormat[result.getBarcodeFormat()]}`);
      const fda = await lookupFDA(raw);
      if (fda) {
        const med: ScannedMedication = {
          name: fda.brand_name || fda.generic_name || 'Unknown',
            dosage: fda.active_ingredients?.[0]?.strength || '',
            frequency: 'Once daily',
            route: fda.route?.[0] || 'Oral',
        };
        onMedicationsScanned([med]);
      } else {
        setError('Medication not found in FDA database');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to detect barcode');
      setStatus('Failed');
    }
    finally {
      setScanning(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 relative">
            <button onClick={onCancel} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm" aria-label="Close">
              <X className="w-5 h-5 text-emerald-700" />
            </button>
            <div className="text-center pt-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Scan Medication Barcode</h2>
              <p className="text-xs text-emerald-50">Upload an image with a clear barcode</p>
            </div>
          </div>
          {/* Scrollable content area */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {!image && (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm mb-3">{status}</p>
                <Button onClick={() => inputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 text-white">Select Image</Button>
                <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleSelect} />
              </div>
            )}
            {image && (
              <div className="space-y-4">
                <div className={`relative w-full ${zoom ? 'h-[60vh]' : 'h-64'} rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center overflow-hidden`}>
                  <img
                    src={image}
                    alt="Barcode"
                    className={`max-w-full max-h-full object-contain transition-transform ${zoom ? 'scale-100' : 'scale-100'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setZoom(z => !z)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-md p-2 shadow"
                    aria-label={zoom ? 'Exit full image view' : 'Expand image'}
                  >
                    {zoom ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {barcode && <Badge className="bg-emerald-100 text-emerald-700">{barcode}</Badge>}
                  <span className="text-xs text-slate-600">{status}{scanning && ' • working...'}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="flex-1">Choose Different Image</Button>
                  <Button size="sm" variant="ghost" disabled={scanning || !image} onClick={() => image && scan(image)} className="flex items-center gap-1">
                    <RefreshCcw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                    Re-scan
                  </Button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button variant="outline" onClick={onCancel} className="w-full">Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}
