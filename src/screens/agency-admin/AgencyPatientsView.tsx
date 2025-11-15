import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  Eye,
  Edit,
  ChevronRight,
  Paperclip,
  Check,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

interface Props {
  // Props can be added as needed
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  address: string;
  phone: string;
  email?: string;
  chartCount: number;
  assignedClinician?: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  size: string;
}

interface Clinician {
  id: string;
  name: string;
  assignedCharts: number;
}

const mockClinicians: Clinician[] = [
  { id: '1', name: 'Anna Clinician', assignedCharts: 5 },
  { id: '2', name: 'Bob Clinician', assignedCharts: 3 },
  { id: '3', name: 'Carol Clinician', assignedCharts: 7 },
];

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Jane Test',
    dob: '1969-12-31',
    address: '101 Test Ave, Test City, CA 90210',
    phone: '555-1001',
    email: 'jane.test@email.com',
    chartCount: 2,
    assignedClinician: 'Anna Clinician',
    documents: [
      { id: 'd1', name: 'Insurance Card Front.pdf', type: 'PDF', uploadedDate: '2025-01-10', size: '1.2 MB' },
      { id: 'd2', name: 'Medical History.pdf', type: 'PDF', uploadedDate: '2025-01-11', size: '850 KB' },
    ],
  },
  {
    id: '2',
    name: 'John Sample',
    dob: '1972-02-01',
    address: '202 Sample St, Sample Town, CA 90211',
    phone: '555-1002',
    email: 'john.sample@email.com',
    chartCount: 1,
    assignedClinician: 'Bob Clinician',
    documents: [],
  },
  {
    id: '3',
    name: 'Sarah Martinez',
    dob: '1955-07-12',
    address: '303 Demo Rd, Demo City, CA 90212',
    phone: '555-1003',
    chartCount: 0,
    documents: [
      { id: 'd3', name: 'Consent Form.pdf', type: 'PDF', uploadedDate: '2025-01-05', size: '520 KB' },
    ],
  },
];

export default function AgencyPatientsView({}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    dob: '',
    address: '',
    phone: '',
    email: '',
    assignedClinician: '',
  });

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.dob) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success(`Patient "${newPatient.name}" added successfully`);
    setIsAddPatientModalOpen(false);
    setNewPatient({ name: '', dob: '', address: '', phone: '', email: '', assignedClinician: '' });
  };

  const handleUploadDocument = () => {
    toast.success('Document uploaded successfully');
    setIsUploadDocModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-[#0f172a]">Patients</h2>
          <p className="text-sm text-[#64748b]">Manage patient records and assignments</p>
        </div>
        <Button
          onClick={() => setIsAddPatientModalOpen(true)}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">Total Patients</p>
              <p className="text-2xl text-[#0f172a] mt-1">{mockPatients.length}</p>
            </div>
            <Users className="w-8 h-8 text-[#10B981]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">With Assigned Clinician</p>
              <p className="text-2xl text-[#0f172a] mt-1">
                {mockPatients.filter(p => p.assignedClinician).length}
              </p>
            </div>
            <User className="w-8 h-8 text-[#0966CC]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">With Documents</p>
              <p className="text-2xl text-[#0f172a] mt-1">
                {mockPatients.filter(p => p.documents.length > 0).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
        <Input
          placeholder="Search patients by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-white"
        />
      </div>

      {/* Patients List */}
      {filteredPatients.length > 0 ? (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-[#10B981] to-[#059669]">
                      <AvatarFallback className="text-white">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg text-[#0f172a]">{patient.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {patient.assignedClinician && (
                          <Badge className="bg-[#DBEAFE] text-[#0966CC] border-[#BFDBFE]">
                            {patient.assignedClinician}
                          </Badge>
                        )}
                        {patient.chartCount > 0 && (
                          <Badge variant="outline" className="border-[#10B981] text-[#10B981]">
                            {patient.chartCount} chart{patient.chartCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {patient.documents.length > 0 && (
                          <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B]">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {patient.documents.length} doc{patient.documents.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#64748b]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {new Date(patient.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{patient.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!patient.assignedClinician && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info('Assign clinician feature');
                      }}
                      className="border-[#0966CC] text-[#0966CC] hover:bg-[#DBEAFE]"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Assign Clinician
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsUploadDocModalOpen(true);
                    }}
                    className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {patient.documents.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info('View documents');
                      }}
                      className="border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Docs
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info('Edit patient');
                    }}
                    className="border-[#64748b] text-[#64748b] hover:bg-[#f8fafc]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
          <p className="text-[#64748b]">
            {searchQuery
              ? 'No patients found matching your search.'
              : 'No patients yet. Add a patient to get started.'}
          </p>
        </Card>
      )}

      {/* Add Patient Modal */}
      <Dialog open={isAddPatientModalOpen} onOpenChange={setIsAddPatientModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information and optionally assign to a clinician
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name *</Label>
              <Input
                id="patient-name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Full name"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-dob">Date of Birth *</Label>
              <Input
                id="patient-dob"
                type="date"
                value={newPatient.dob}
                onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-phone">Phone Number</Label>
              <Input
                id="patient-phone"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                placeholder="555-1234"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-email">Email</Label>
              <Input
                id="patient-email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                placeholder="patient@email.com"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patient-address">Address</Label>
              <Input
                id="patient-address"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                placeholder="Street, City, State, ZIP"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assigned-clinician">Assign to Clinician (Optional)</Label>
              <Select
                value={newPatient.assignedClinician}
                onValueChange={(value) => setNewPatient({ ...newPatient, assignedClinician: value })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {mockClinicians.map((clinician) => (
                    <SelectItem key={clinician.id} value={clinician.name}>
                      {clinician.name} ({clinician.assignedCharts} charts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPatientModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#10B981] hover:bg-[#059669]"
              onClick={handleAddPatient}
            >
              <Check className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={isUploadDocModalOpen} onOpenChange={setIsUploadDocModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-8 text-center hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
              <p className="text-sm text-[#64748b] mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-[#94a3b8]">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadDocModalOpen(false);
              setSelectedPatient(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-[#10B981] hover:bg-[#059669]"
              onClick={handleUploadDocument}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
