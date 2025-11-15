import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useOCR } from '../hooks/useOCR';
import type { MedicationInfo } from '../utils/ocrService';

interface Props {
  onMedicationsScanned: (medications: Partial<MedicationInfo>[]) => void;
  onCancel: () => void;
}

export default function MedicationOCRScanner({ onMedicationsScanned, onCancel }: Props) {
  const { isProcessing, error, medications, ocrResult, scanImage, scanFromCamera, reset } = useOCR();
  const [preview, setPreview] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (ocrResult?.previewImage) setPreview(ocrResult.previewImage); }, [ocrResult]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await scanImage(file);
  };

  const handleUseMedications = () => { if (medications.length) onMedicationsScanned(medications); };

  const handleReset = () => { reset(); setPreview(null); if (fileInputRef.current) fileInputRef.current.value=''; };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 relative">
            <button onClick={onCancel} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm" aria-label="Close">
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <div className="text-center pt-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Medication OCR Scanner</h2>
              <p className="text-xs text-slate-100">Scan a prescription label to extract fields</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!preview && !isProcessing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card onClick={() => scanFromCamera()} className="p-8 cursor-pointer hover:shadow-lg hover:border-blue-600 transition-all group">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Take Photo</h3>
                    <p className="text-sm text-slate-600">Use your camera to scan a label</p>
                  </div>
                </Card>
                <Card onClick={() => fileInputRef.current?.click()} className="p-8 cursor-pointer hover:shadow-lg hover:border-green-600 transition-all group">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
                    <p className="text-sm text-slate-600">Choose an existing file</p>
                  </div>
                </Card>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
            {isProcessing && (
              <Card className="p-8 text-center">
                <p className="text-sm">Processing image… extracting text</p>
              </Card>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {preview && !isProcessing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/>Scanned Image</h3>
                    <div className="flex items-center gap-2">
                      <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} id="annos" />
                      <Label htmlFor="annos" className="text-xs text-slate-600">Highlights</Label>
                    </div>
                  </div>
                  <div className="relative w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={preview} alt="Medication" className="w-full h-auto block" />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset} className="w-full mt-3">Scan Different Image</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/>Extracted Information</h3>
                  {medications.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">No data detected.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications.map((m,i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-4 space-y-1 border border-slate-200 text-sm">
                          {m.name && <p><span className="font-medium">Name:</span> {m.name}</p>}
                          {m.dosage && <p><span className="font-medium">Dosage:</span> {m.dosage}</p>}
                          {m.frequency && <p><span className="font-medium">Frequency:</span> {m.frequency}</p>}
                          {m.route && <p><span className="font-medium">Route:</span> {m.route}</p>}
                          {m.instructions && <p className="text-xs"><span className="font-medium">Instructions:</span> {m.instructions}</p>}
                          {typeof m.confidence === 'number' && <p className="text-xs text-slate-500">Confidence: {m.confidence}%</p>}
                        </div>
                      ))}
                      <Button onClick={handleUseMedications} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2"/>Use Medication<ArrowRight className="w-4 h-4 ml-2"/>
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/>Tips for Best Results</h4>
              <ul className="text-xs list-disc ml-4 space-y-1 text-slate-700">
                <li>Ensure label text is sharp and in focus.</li>
                <li>Avoid glare or heavy shadows.</li>
                <li>Include medication name and dosage in frame.</li>
                <li>Hold device steady or place bottle on flat surface.</li>
              </ul>
            </Card>
          </div>
          <div className="p-4 border-t bg-white">
            <Button variant="outline" onClick={onCancel} className="w-full">Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}
