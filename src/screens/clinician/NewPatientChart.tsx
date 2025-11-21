import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Calendar as CalendarIcon, Phone, MapPin, FileText, ChevronRight, Check, Circle, Save, FileDown } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Screen, NavigationParams } from '../../App';
import { supabaseClient } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// US States list
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Phone number auto-formatting
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    const parts = [match[1], match[2], match[3]].filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  }
  return value;
};

interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
  route?: {
    params?: NavigationParams;
  };
}

export default function NewPatientChart({ navigation, route }: Props) {
  const prefillData = route?.params?.prefillData;
  const scannedMedications = route?.params?.scannedMedications;
  const scanType = route?.params?.scanType;

  const [firstName, setFirstName] = useState(prefillData?.firstName || '');
  const [lastName, setLastName] = useState(prefillData?.lastName || '');
  const [dob, setDob] = useState(prefillData?.dateOfBirth || '');
  const [medicalRecordNumber, setMedicalRecordNumber] = useState(prefillData?.medicalRecordNumber || '');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showScanBanner, setShowScanBanner] = useState(!!prefillData);
  
  const firstNameRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto-focus first field on mount (unless pre-filled)
  useEffect(() => {
    if (!prefillData) {
      firstNameRef.current?.focus();
    }
  }, [prefillData]);

  // Phone formatting handler
  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumber(value));
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    if (!address1.trim()) newErrors.address1 = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = () => {
    if (validateForm()) {
      // In real app, save patient data to database
      // Pass patient data to next step
      navigation.navigate('NewPatientChartMedications', { 
        patientId: 'new-patient-id',
        chartId: 'new-chart-id',
        patient: {
          first_name: firstName,
          last_name: lastName,
          dob,
          phone,
          address1,
          address2,
          city,
          state,
          zip_code: zipCode,
          notes
        },
        scannedMedications,
        scanType
      });
    }
  };

  const handleSaveAsDraft = () => {
    // In real app, save as draft without validation
    console.log('Saving as draft...');
    navigation.goBack();
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFormValid = firstName && lastName && dob && address1;


  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0966CC] to-[#0C4A6E] p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigation.goBack()}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg text-white">New Patient Chart</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content with bottom padding for sticky footer */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          
          {/* Context Bar */}
          <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-slate-900 mb-1">Patient Information</h2>
                <p className="text-sm text-slate-600">Creating new chart — required details first</p>
              </div>
            </div>
          </div>

          {/* Scan Success Banner */}
          {showScanBanner && scanType && (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] text-emerald-900 font-medium">
                      {scanType} Completed
                    </p>
                    <p className="text-sm text-emerald-700">
                      Patient info captured. Please verify and complete remaining fields.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScanBanner(false)}
                  className="w-8 h-8 rounded-lg hover:bg-emerald-200 flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Dismiss banner"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-700 rotate-45" />
                </button>
              </div>
            </div>
          )}

          {/* Required Fields Helper */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-slate-600">
              <span className="text-red-500">*</span> Required fields
            </span>
          </div>

          {/* Patient Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Basic Info Section */}
            <div className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="firstName" className="text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    ref={firstNameRef}
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    placeholder="Enter first name"
                    className={`mt-2 h-12 rounded-xl border-2 ${
                      touched.firstName && errors.firstName 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:ring-sky-200'
                    }`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    placeholder="Enter last name"
                    className={`mt-2 h-12 rounded-xl border-2 ${
                      touched.lastName && errors.lastName 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:ring-sky-200'
                    }`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="text-slate-700">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onBlur={() => handleBlur('dob')}
                    className={`pl-12 h-12 rounded-xl border-2 ${
                      touched.dob && errors.dob 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:ring-sky-200'
                    }`}
                  />
                </div>
                {touched.dob && errors.dob && (
                  <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.dob}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="medicalRecordNumber" className="text-slate-700">
                  Medical Record Number (MRN)
                </Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="medicalRecordNumber"
                    value={medicalRecordNumber}
                    onChange={(e) => setMedicalRecordNumber(e.target.value)}
                    placeholder="Enter MRN (optional)"
                    className="pl-12 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Unique patient identifier from medical records</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    className="pl-12 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Format: (555) 123-4567</p>
              </div>

            </div>

            {/* Address Section */}
            <div className="pt-6 pb-6 px-6 border-t border-slate-200 space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Address</h3>
              
              <div>
                <Label htmlFor="address1" className="text-slate-700">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="address1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    onBlur={() => handleBlur('address1')}
                    placeholder="123 Main Street"
                    className={`pl-12 h-12 rounded-xl border-2 ${
                      touched.address1 && errors.address1 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:ring-sky-200'
                    }`}
                  />
                </div>
                {touched.address1 && errors.address1 && (
                  <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.address1}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address2" className="text-slate-700">Address Line 2</Label>
                <Input
                  id="address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="mt-2 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="city" className="text-slate-700">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="mt-2 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-slate-700">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {US_STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-slate-700">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="12345"
                    maxLength={5}
                    className="mt-2 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200"
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="pt-6 pb-6 px-6 border-t border-slate-200 space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Additional Notes</h3>
              
              <div>
                <Label htmlFor="notes" className="text-slate-700">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this patient (e.g., special considerations, allergies, communication preferences)..."
                  className="mt-2 min-h-[120px] rounded-xl border-2 border-slate-200 bg-slate-50 focus:ring-sky-200 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1.5">Optional field for additional context</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSaveAsDraft}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              disabled={!isFormValid}
              className="flex-1 h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
          {!isFormValid && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Complete required fields to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
