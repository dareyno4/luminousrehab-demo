import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  Search,
  Plus,
  FileText,
  Clock,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  User,
  ChevronRight,
  Camera,
  Download,
  Scan,
  UserPlus,
  CheckCircle2,
  Send,
  Eye,
  ChevronDown,
  Star,
  AlertCircle,
  TrendingUp,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Edit,
  EyeOff,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Switch } from '../../components/ui/switch';
import { Screen, NavigationParams } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner';
import SchedulerProfile from './SchedulerProfile';
import SchedulerSettings from './SchedulerSettings';

interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
}

type TabType = 'charts' | 'scan' | 'assign' | 'profile' | 'settings';

interface Chart {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  status: 'Needs Assignment' | 'Assigned' | 'Docs Available' | 'Completed';
  createdDate: string;
  assignedTo?: string;
  documentCount: number;
  isNew?: boolean;
  waitingDays?: number;
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  address: string;
  phone: string;
}

interface Clinician {
  id: string;
  name: string;
  assignedCharts: number;
}

const mockCharts: Chart[] = [
  {
    id: 'c1',
    patientId: 'PT-1001',
    patientName: 'Jane Test',
    patientDob: '1969-12-31',
    status: 'Assigned',
    createdDate: '2025-01-15',
    assignedTo: 'Anna Clinician',
    documentCount: 2,
    isNew: false,
    waitingDays: 0,
  },
  {
    id: 'c2',
    patientId: 'PT-1002',
    patientName: 'John Sample',
    patientDob: '1972-02-01',
    status: 'Needs Assignment',
    createdDate: '2025-11-03',
    documentCount: 0,
    isNew: true,
    waitingDays: 2,
  },
  {
    id: 'c3',
    patientId: 'PT-1003',
    patientName: 'Mary Johnson',
    patientDob: '1985-05-12',
    status: 'Docs Available',
    createdDate: '2025-11-04',
    documentCount: 3,
    isNew: false,
    waitingDays: 1,
  },
  {
    id: 'c4',
    patientId: 'PT-1004',
    patientName: 'Robert Williams',
    patientDob: '1978-09-20',
    status: 'Completed',
    createdDate: '2025-10-28',
    assignedTo: 'Bob Clinician',
    documentCount: 4,
    isNew: false,
    waitingDays: 0,
  },
  {
    id: 'c5',
    patientId: 'PT-1005',
    patientName: 'Lisa Anderson',
    patientDob: '1992-03-15',
    status: 'Needs Assignment',
    createdDate: '2025-11-02',
    documentCount: 2,
    isNew: false,
    waitingDays: 3,
  },
];

const mockPatients: Patient[] = [
  { id: '1', name: 'Jane Test', dob: '1969-12-31', address: '101 Test Ave, Test City, CA', phone: '555-1001' },
  { id: '2', name: 'John Sample', dob: '1972-02-01', address: '202 Sample St, Sample Town, CA', phone: '555-1002' },
];

const mockClinicians: Clinician[] = [
  { id: '1', name: 'Anna Clinician', assignedCharts: 5 },
  { id: '2', name: 'Bob Clinician', assignedCharts: 3 },
  { id: '3', name: 'Carol Clinician', assignedCharts: 7 },
];

export default function SchedulerDashboard({ navigation }: Props) {
  const { logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('charts');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartFilter, setChartFilter] = useState<'all' | 'needs-assignment' | 'assigned' | 'completed'>('all');
  const [isCreateChartModalOpen, setIsCreateChartModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null);
  const [selectedClinician, setSelectedClinician] = useState('');
  const [newChart, setNewChart] = useState({
    patientName: '',
    patientDob: '',
    patientAddress: '',
    patientPhone: '',
  });

  // Settings states
  const [chartNotifications, setChartNotifications] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate stats
  const totalPatients = mockPatients.length;
  const totalCharts = mockCharts.length;
  const chartsNeedingAssignment = mockCharts.filter(c => c.status === 'Needs Assignment' || c.status === 'Docs Available').length;
  const newDocsToday = mockCharts.filter(c => {
    const today = new Date('2025-11-05');
    const createdDate = new Date(c.createdDate);
    return createdDate.toDateString() === today.toDateString();
  }).length;
  const avgAssignmentTime = 1.2; // Mock value in hours
  const unassignedCharts = mockCharts.filter(c => !c.assignedTo).length;

  const handleLogout = () => {
    logout();
    navigation.navigate('Landing');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  const handleCreateChart = () => {
    if (!newChart.patientName || !newChart.patientDob) {
      alert('Please fill in patient name and date of birth');
      return;
    }
    console.log('Creating empty chart:', newChart);
    alert('Empty chart created successfully!');
    setIsCreateChartModalOpen(false);
    setNewChart({ patientName: '', patientDob: '', patientAddress: '', patientPhone: '' });
  };

  const handleAssignChart = () => {
    if (!selectedClinician) {
      alert('Please select a clinician');
      return;
    }
    console.log('Assigning chart', selectedChart?.id, 'to', selectedClinician);
    alert(`Chart assigned to ${selectedClinician}!`);
    setIsAssignModalOpen(false);
    setSelectedChart(null);
    setSelectedClinician('');
  };

  // Sidebar Navigation Component
  const renderSidebarNav = () => (
    <nav className="space-y-1">
      <button
        onClick={() => handleTabChange('charts')}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
          activeTab === 'charts'
            ? 'bg-[#FEF3C7] text-[#F59E0B]'
            : 'text-[#64748b] hover:bg-[#f8fafc]'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span>Patient Charts</span>
      </button>
      <button
        onClick={() => handleTabChange('scan')}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
          activeTab === 'scan'
            ? 'bg-[#FEF3C7] text-[#F59E0B]'
            : 'text-[#64748b] hover:bg-[#f8fafc]'
        }`}
      >
        <Camera className="w-5 h-5" />
        <span>Scan Documents</span>
      </button>
      <button
        onClick={() => handleTabChange('assign')}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
          activeTab === 'assign'
            ? 'bg-[#FEF3C7] text-[#F59E0B]'
            : 'text-[#64748b] hover:bg-[#f8fafc]'
        }`}
      >
        <UserPlus className="w-5 h-5" />
        <span>Assign Charts</span>
      </button>
      <button
        onClick={() => handleTabChange('profile')}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
          activeTab === 'profile'
            ? 'bg-[#FEF3C7] text-[#F59E0B]'
            : 'text-[#64748b] hover:bg-[#f8fafc]'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>
      <button
        onClick={() => handleTabChange('settings')}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
          activeTab === 'settings'
            ? 'bg-[#FEF3C7] text-[#F59E0B]'
            : 'text-[#64748b] hover:bg-[#f8fafc]'
        }`}
      >
        <SettingsIcon className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </nav>
  );

  // Patient Charts Tab
  const renderChartsTab = () => {
    const filteredCharts = mockCharts
      .filter(chart => {
        // Filter by search query
        const matchesSearch = chart.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by status tab
        const matchesFilter = 
          chartFilter === 'all' ? true :
          chartFilter === 'needs-assignment' ? (chart.status === 'Needs Assignment' || chart.status === 'Docs Available') :
          chartFilter === 'assigned' ? chart.status === 'Assigned' :
          chartFilter === 'completed' ? chart.status === 'Completed' :
          true;
        
        return matchesSearch && matchesFilter;
      });

    return (
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#0f172a]">Patient Charts</h2>
            <p className="text-sm text-[#64748b]">Create charts and manage patient records</p>
          </div>
          <Button
            onClick={() => setIsCreateChartModalOpen(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Chart
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <Input
            placeholder="Search charts by patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-white"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setChartFilter('all')}
            variant={chartFilter === 'all' ? 'default' : 'outline'}
            className={chartFilter === 'all' 
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white' 
              : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}
          >
            All Charts
          </Button>
          <Button
            onClick={() => setChartFilter('needs-assignment')}
            variant={chartFilter === 'needs-assignment' ? 'default' : 'outline'}
            className={chartFilter === 'needs-assignment' 
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white' 
              : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Needs Assignment
          </Button>
          <Button
            onClick={() => setChartFilter('assigned')}
            variant={chartFilter === 'assigned' ? 'default' : 'outline'}
            className={chartFilter === 'assigned' 
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white' 
              : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}
          >
            Assigned
          </Button>
          <Button
            onClick={() => setChartFilter('completed')}
            variant={chartFilter === 'completed' ? 'default' : 'outline'}
            className={chartFilter === 'completed' 
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white' 
              : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}
          >
            Completed
          </Button>
        </div>

        {/* Charts List */}
        {filteredCharts.length > 0 ? (
          <div className="space-y-3">
            {filteredCharts.map((chart) => {
              const getStatusBadgeStyle = (status: Chart['status']) => {
                switch (status) {
                  case 'Needs Assignment':
                    return 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]';
                  case 'Assigned':
                    return 'bg-[#DBEAFE] text-[#0966CC] border-[#BFDBFE]';
                  case 'Docs Available':
                    return 'bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE]';
                  case 'Completed':
                    return 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]';
                  default:
                    return 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]';
                }
              };

              return (
                <div
                  key={chart.id}
                  className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg text-[#0f172a]">{chart.patientName}</h3>
                        <Badge className={getStatusBadgeStyle(chart.status)}>
                          {chart.status === 'Assigned' && chart.assignedTo 
                            ? `Assigned (${chart.assignedTo})` 
                            : chart.status}
                        </Badge>
                        
                        {/* Context Chips */}
                        {chart.isNew && (
                          <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                            <Star className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {chart.documentCount > 0 && chart.status !== 'Completed' && (
                          <Badge variant="outline" className="border-[#E0E7FF] text-[#4F46E5] bg-[#F5F3FF]">
                            <FileText className="w-3 h-3 mr-1" />
                            {chart.documentCount} Doc{chart.documentCount !== 1 ? 's' : ''} Pending
                          </Badge>
                        )}
                        {chart.waitingDays && chart.waitingDays > 0 && (
                          <Badge variant="outline" className="border-[#FDE68A] text-[#D97706] bg-[#FFFBEB]">
                            <Clock className="w-3 h-3 mr-1" />
                            Waiting {chart.waitingDays}d
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-[#64748b]">
                          ID: {chart.patientId}
                        </p>
                        <p className="text-sm text-[#64748b]">
                          DOB: {new Date(chart.patientDob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
                        <span>{chart.documentCount} document{chart.documentCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Created {new Date(chart.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      {/* Assigned Clinician with Avatar */}
                      {chart.assignedTo && (
                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-[#E0F2FE] to-[#BFDBFE] text-[#0966CC] text-xs">
                              {chart.assignedTo.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-sm text-[#0966CC] hover:underline h-auto p-0 hover:bg-transparent flex items-center gap-1">
                                Assigned to: {chart.assignedTo}
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3">
                              <div className="space-y-2">
                                <p className="text-sm text-[#64748b] mb-2">Reassign to:</p>
                                {mockClinicians.map((clinician) => (
                                  <button
                                    key={clinician.id}
                                    onClick={() => {
                                      console.log(`Reassigning chart ${chart.id} to ${clinician.name}`);
                                      alert(`Chart reassigned to ${clinician.name}!`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="bg-gradient-to-br from-[#E0F2FE] to-[#BFDBFE] text-[#0966CC] text-xs">
                                          {clinician.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-[#0f172a]">{clinician.name}</p>
                                        <p className="text-xs text-[#64748b]">{clinician.assignedCharts} charts</p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {chart.documentCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Viewing documents for chart:', chart.id);
                          alert('Document viewer would open here');
                        }}
                        className="border-[#E0E7FF] text-[#4F46E5] hover:bg-[#F5F3FF]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Docs
                      </Button>
                    )}
                    
                    {!chart.assignedTo && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign to Clinician
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3">
                          <div className="space-y-2">
                            <p className="text-sm text-[#64748b] mb-2">Select clinician:</p>
                            {mockClinicians.map((clinician) => (
                              <button
                                key={clinician.id}
                                onClick={() => {
                                  console.log(`Assigning chart ${chart.id} to ${clinician.name}`);
                                  alert(`Chart assigned to ${clinician.name}!`);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-gradient-to-br from-[#E0F2FE] to-[#BFDBFE] text-[#0966CC] text-xs">
                                      {clinician.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-[#0f172a]">{clinician.name}</p>
                                    <p className="text-xs text-[#64748b]">{clinician.assignedCharts} charts</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  {/* Future Automation Hint */}
                  {!chart.assignedTo && chart.status === 'Needs Assignment' && (
                    <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <TrendingUp className="w-3 h-3" />
                        <span>Suggested: Anna Clinician (5 charts, closest location)</span>
                        <Badge variant="outline" className="text-xs border-[#E0E7FF] text-[#4F46E5]">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
            <FileText className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-[#64748b]">
              {searchQuery 
                ? 'No charts found matching your search.' 
                : chartFilter === 'needs-assignment'
                ? 'No charts need assignment at this time.'
                : 'No charts found. Create a new chart to get started.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Scan Documents Tab
  const renderScanTab = () => {
    // Mock data for scan context
    const lastScanTime = new Date('2025-11-05T14:14:00');
    const unassignedDocs: number = 8;
    const ocrProcessingDocs: number = 2;
    const failedUploadDocs: number = 1;
    
    return (
      <div className="space-y-6">
        {/* Header with Quick Scan Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#0f172a]">Scan Documents</h2>
            <p className="text-sm text-[#64748b]">Scan and attach documents to patient charts</p>
          </div>
          <Button
            onClick={() => {
              console.log('Opening quick scan');
              alert('Camera scan would open here');
            }}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            New Scan
          </Button>
        </div>

        {/* Status Chips */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
          <p className="text-sm text-[#64748b] mb-3">Document Status</p>
          <div className="flex flex-wrap gap-2">
            {unassignedDocs > 0 && (
              <Badge className="bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]">
                <AlertCircle className="w-3 h-3 mr-1" />
                {unassignedDocs} Pending Assignment
              </Badge>
            )}
            {ocrProcessingDocs > 0 && (
              <Badge className="bg-[#E0F2FE] text-[#0966CC] border-[#BFDBFE]">
                <Scan className="w-3 h-3 mr-1" />
                {ocrProcessingDocs} OCR Processing
              </Badge>
            )}
            {failedUploadDocs > 0 && (
              <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                <AlertCircle className="w-3 h-3 mr-1" />
                {failedUploadDocs} Upload Issue
              </Badge>
            )}
            {unassignedDocs === 0 && ocrProcessingDocs === 0 && failedUploadDocs === 0 && (
              <Badge className="bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                All docs processed
              </Badge>
            )}
          </div>
        </div>

        {/* Scan Options */}
        <div className="space-y-3">
          {/* Camera Scan */}
          <button 
            onClick={() => {
              console.log('Opening camera scan');
              alert('Camera scan would open here');
            }}
            className="w-full bg-white rounded-xl border-2 border-[#e2e8f0] p-6 hover:border-[#F59E0B] hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg text-[#0f172a] mb-1">Camera Scan</h4>
                <p className="text-sm text-[#64748b] mb-2">Scan paper docs using device camera</p>
                <p className="text-xs text-[#94a3b8]">
                  Last scan: {lastScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {lastScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1] flex-shrink-0" />
            </div>
          </button>

          {/* Import File */}
          <button 
            onClick={() => {
              console.log('Opening file import');
              alert('File import would open here');
            }}
            className="w-full bg-white rounded-xl border-2 border-dashed border-[#e2e8f0] p-6 hover:border-[#F59E0B] hover:bg-[#FFFBEB] hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#E0F2FE] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-[#0966CC]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg text-[#0f172a] mb-1">Import File</h4>
                <p className="text-sm text-[#64748b] mb-2">Upload a PDF or photo from computer</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-[#94a3b8]">Supports: PDF, JPG, PNG, HEIC</p>
                  <p className="text-xs text-[#0966CC] italic">Drop files here or click to browse</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1] flex-shrink-0" />
            </div>
          </button>

          {/* Document Library */}
          <button 
            onClick={() => {
              console.log('Opening document library');
              alert('Document library would open here');
            }}
            className="w-full bg-white rounded-xl border-2 border-[#e2e8f0] p-6 hover:border-[#F59E0B] hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg text-[#0f172a] mb-1">Document Library</h4>
                <p className="text-sm text-[#64748b] mb-2">See all scanned files & match to patients</p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {unassignedDocs > 0 && (
                    <span className="text-[#F59E0B]">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] mr-1"></span>
                      {unassignedDocs} unassigned docs waiting
                    </span>
                  )}
                  {ocrProcessingDocs > 0 && (
                    <>
                      <span className="text-[#cbd5e1]">•</span>
                      <span className="text-[#0966CC]">
                        {ocrProcessingDocs} awaiting OCR
                      </span>
                    </>
                  )}
                  {failedUploadDocs > 0 && (
                    <>
                      <span className="text-[#cbd5e1]">•</span>
                      <span className="text-[#DC2626]">
                        {failedUploadDocs} failed upload
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1] flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Help CTA */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#0966CC]" />
              </div>
              <div>
                <p className="text-sm text-[#0f172a]">Need help scanning?</p>
                <p className="text-xs text-[#64748b]">Tips for better quality scans</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('Opening scan guide');
                alert('Scan quality guide would open here with tips about lighting, angle, blur, etc.');
              }}
              className="border-[#E0F2FE] text-[#0966CC] hover:bg-[#F0F9FF] flex-shrink-0"
            >
              View Guide
            </Button>
          </div>
        </div>

        {/* HIPAA Notice with Offline Sync */}
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 space-y-2">
          <p className="text-sm text-[#92400E]">
            <strong>HIPAA Compliant:</strong> All scanned documents are securely encrypted and stored. Documents can be attached to patient charts for clinician review.
          </p>
          <p className="text-xs text-[#92400E] flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            Offline scans will sync automatically once reconnected
          </p>
        </div>
      </div>
    );
  };

  // Assign Charts Tab
  const renderAssignTab = () => {
    const unassigned = mockCharts.filter(c => !c.assignedTo);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl text-[#0f172a]">Assign Charts</h2>
          <p className="text-sm text-[#64748b]">Assign charts to clinicians for review</p>
        </div>

        {unassigned.length > 0 ? (
          <div className="space-y-3">
            {unassigned.map((chart) => (
              <div
                key={chart.id}
                className="bg-white rounded-xl border border-[#e2e8f0] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg text-[#0f172a]">{chart.patientName}</h3>
                      {chart.isNew && (
                        <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                          <Star className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-[#64748b]">ID: {chart.patientId}</p>
                      <p className="text-sm text-[#64748b]">
                        DOB: {new Date(chart.patientDob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]">
                        {chart.status}
                      </Badge>
                      {chart.documentCount > 0 && (
                        <Badge variant="outline" className="border-[#E0E7FF] text-[#4F46E5] bg-[#F5F3FF]">
                          <FileText className="w-3 h-3 mr-1" />
                          {chart.documentCount} Doc{chart.documentCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {chart.waitingDays && chart.waitingDays > 0 && (
                        <Badge variant="outline" className="border-[#FDE68A] text-[#D97706] bg-[#FFFBEB]">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting {chart.waitingDays}d
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedChart(chart);
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
            <p className="text-[#0f172a] mb-1">All charts are assigned!</p>
            <p className="text-sm text-[#64748b]">All patient charts have been assigned to clinicians.</p>
          </div>
        )}

        {/* Clinicians List */}
        <div>
          <h3 className="text-lg text-[#0f172a] mb-3">Available Clinicians</h3>
          <div className="space-y-2">
            {mockClinicians.map((clinician) => (
              <div
                key={clinician.id}
                className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-[#E0F2FE] to-[#BFDBFE] text-[#0966CC]">
                      {clinician.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-[#0f172a]">{clinician.name}</p>
                    <p className="text-xs text-[#64748b]">{clinician.assignedCharts} assigned chart{clinician.assignedCharts !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Profile Tab
  const renderProfileTab = () => {
    const lastLoginDate = new Date('2025-11-05T09:30:00');
    const accountCreatedDate = new Date('2024-03-15');
    const mfaEnabled = true;

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white text-2xl">
                  JM
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F59E0B] hover:bg-[#D97706] flex items-center justify-center shadow-md transition-colors">
                <Edit className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl text-[#0f172a] mb-2">Jessica Martinez</h2>
              <p className="text-[#64748b] mb-3">Scheduler • HealthCare Partners LLC</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                {mfaEnabled && (
                  <Badge className="bg-[#E0F2FE] text-[#0966CC] border-[#BFDBFE]">
                    <Shield className="w-3 h-3 mr-1" />
                    MFA Enabled
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Edit profile');
                alert('Edit profile functionality would open here');
              }}
              className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Activity & Security Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0966CC]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Last Login</p>
                <p className="text-[#0f172a]">
                  {lastLoginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {lastLoginDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Account Created</p>
                <p className="text-[#0f172a]">
                  {accountCreatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#64748b]">Two-Factor Authentication</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={mfaEnabled ? "bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]" : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"}>
                    {mfaEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Password</p>
                <p className="text-[#0f172a]">Last changed 45 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-2xl text-[#0f172a]">{totalCharts}</p>
                <p className="text-sm text-[#64748b]">Charts Created</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0966CC]" />
              </div>
              <div>
                <p className="text-2xl text-[#0f172a]">{totalPatients}</p>
                <p className="text-sm text-[#64748b]">Patients Managed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl text-[#0f172a]">{mockCharts.filter(c => c.assignedTo).length}</p>
                <p className="text-sm text-[#64748b]">Charts Assigned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-[#0f172a]">Contact Information</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Edit contact info');
                alert('Edit contact information would open here');
              }}
              className="text-[#F59E0B] hover:text-[#D97706] hover:bg-[#FEF3C7]"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#0966CC]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Email Address</p>
                <p className="text-[#0f172a]">jessica.martinez@hcp.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Phone Number</p>
                <p className="text-[#0f172a]">(555) 987-6543</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#64748b]">Agency</p>
                <p className="text-[#0f172a]">HealthCare Partners LLC</p>
                <p className="text-sm text-[#64748b] mt-1">123 Healthcare Blvd, Medical City, CA 90210</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-lg text-[#0f172a] mb-4">Security & Account</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('Change password');
                alert('Change password dialog would open here');
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[#e2e8f0] hover:border-[#F59E0B] hover:bg-[#FFFBEB] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] flex items-center justify-center group-hover:bg-[#FEF3C7] transition-colors">
                  <Lock className="w-5 h-5 text-[#4F46E5] group-hover:text-[#F59E0B] transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#0f172a]">Change Password</p>
                  <p className="text-xs text-[#64748b]">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1]" />
            </button>

            <button
              onClick={() => {
                console.log('Manage MFA');
                alert('MFA settings would open here');
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[#e2e8f0] hover:border-[#F59E0B] hover:bg-[#FFFBEB] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center group-hover:bg-[#FEF3C7] transition-colors">
                  <Shield className="w-5 h-5 text-[#10B981] group-hover:text-[#F59E0B] transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#0f172a]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#64748b]">Manage MFA settings</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1]" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Settings Tab
  const renderSettingsTab = () => {
    const handleChangePassword = () => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      toast.success('Password changed successfully!');
      setIsChangePasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    };

    return (
      <div className="max-w-4xl space-y-6">
        {/* Account Settings */}
        <div>
          <h3 className="text-sm text-[#64748b] mb-3 px-2">ACCOUNT</h3>
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <button
              onClick={() => setIsChangePasswordDialogOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors border-b border-[#e2e8f0]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#0f172a]">Change Password</p>
                  <p className="text-xs text-[#64748b]">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1]" />
            </button>
            <button
              onClick={() => handleTabChange('profile')}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0966CC]" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#0f172a]">View Profile</p>
                  <p className="text-xs text-[#64748b]">View your profile information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cbd5e1]" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-sm text-[#64748b] mb-3 px-2">NOTIFICATIONS</h3>
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm text-[#0f172a]">Chart Notifications</p>
                  <p className="text-xs text-[#64748b]">Chart status updates</p>
                </div>
              </div>
              <Switch
                checked={chartNotifications}
                onCheckedChange={setChartNotifications}
                className="data-[state=checked]:bg-[#F59E0B]"
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#0966CC]" />
                </div>
                <div>
                  <p className="text-sm text-[#0f172a]">Assignment Alerts</p>
                  <p className="text-xs text-[#64748b]">New chart assignments</p>
                </div>
              </div>
              <Switch
                checked={assignmentAlerts}
                onCheckedChange={setAssignmentAlerts}
                className="data-[state=checked]:bg-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-12 rounded-xl border-2 border-[#e2e8f0] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-12 rounded-xl border-2 border-[#e2e8f0] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-[#64748b] mt-1">Must be at least 8 characters</p>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-12 rounded-xl border-2 border-[#e2e8f0] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangePasswordDialogOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      {/* Desktop Sidebar - Always visible on md+ */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-[#e2e8f0]">
        {/* Sidebar Header */}
        <div className="border-b border-[#e2e8f0] p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-sm text-[#64748b]">Scheduler Portal</div>
              <div className="text-[#0f172a]">Jessica Martinez</div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-4 px-3 overflow-y-auto">
          {renderSidebarNav()}
        </div>

        {/* Sidebar Footer - Logout */}
        <div className="border-t border-[#e2e8f0] p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-[#DC2626] text-[#DC2626] hover:bg-[#FEE2E2]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
          <SheetHeader className="border-b border-[#e2e8f0] p-6">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="text-sm text-[#64748b]">Scheduler Portal</div>
                  <div className="text-[#0f172a]">Jessica Martinez</div>
                </div>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu for Scheduler Portal
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 py-4 px-3 overflow-y-auto">
            {renderSidebarNav()}
          </div>

          {/* Mobile Drawer Footer */}
          <div className="border-t border-[#e2e8f0] p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-[#DC2626] text-[#DC2626] hover:bg-[#FEE2E2]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] flex items-center justify-center transition-colors"
              >
                <Menu className="w-5 h-5 text-[#64748b]" />
              </button>

              <div>
                <h1 className="text-xl text-[#0f172a]">
                  {activeTab === 'charts' && 'Patient Charts'}
                  {activeTab === 'scan' && 'Scan Documents'}
                  {activeTab === 'assign' && 'Assign Charts'}
                  {activeTab === 'profile' && 'My Profile'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-[#64748b]">
                  {activeTab === 'charts' && 'Create and manage patient charts'}
                  {activeTab === 'scan' && 'Scan and upload documents'}
                  {activeTab === 'assign' && 'Assign charts to clinicians'}
                  {activeTab === 'profile' && 'View your profile information'}
                  {activeTab === 'settings' && 'Manage your account settings'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] flex items-center justify-center relative transition-colors">
                <Bell className="w-5 h-5 text-[#64748b]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F59E0B] border-2 border-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards - Show on charts tab */}
          {activeTab === 'charts' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl text-[#0f172a]">{totalPatients}</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">Total Patients</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#DC2626]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl text-[#0f172a]">{chartsNeedingAssignment}</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">Needs Assignment</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#0966CC]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl text-[#0f172a]">{newDocsToday}</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">New Docs Today</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#D1FAE5] flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl text-[#0f172a]">{avgAssignmentTime}h</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">Avg Assignment</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'charts' && renderChartsTab()}
          {activeTab === 'scan' && renderScanTab()}
          {activeTab === 'assign' && renderAssignTab()}
          {activeTab === 'profile' && <SchedulerProfile navigation={navigation} />}
          {activeTab === 'settings' && <SchedulerSettings navigation={navigation} onNavigateToProfile={() => handleTabChange('profile')} />}
        </main>
      </div>
      
      <Toaster position="top-right" />

      {/* Create Empty Chart Modal */}
      <Dialog open={isCreateChartModalOpen} onOpenChange={setIsCreateChartModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Empty Chart</DialogTitle>
            <DialogDescription>
              Create a new chart for a patient. Clinicians will add medications later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="patient-name">Patient Name *</Label>
              <Input
                id="patient-name"
                value={newChart.patientName}
                onChange={(e) => setNewChart({ ...newChart, patientName: e.target.value })}
                placeholder="John Doe"
                className="mt-2 h-12 rounded-xl border-2 border-[#e2e8f0]"
              />
            </div>
            <div>
              <Label htmlFor="patient-dob">Date of Birth *</Label>
              <Input
                id="patient-dob"
                type="date"
                value={newChart.patientDob}
                onChange={(e) => setNewChart({ ...newChart, patientDob: e.target.value })}
                className="mt-2 h-12 rounded-xl border-2 border-[#e2e8f0]"
              />
            </div>
            <div>
              <Label htmlFor="patient-address">Address (Optional)</Label>
              <Input
                id="patient-address"
                value={newChart.patientAddress}
                onChange={(e) => setNewChart({ ...newChart, patientAddress: e.target.value })}
                placeholder="123 Main St, City, State"
                className="mt-2 h-12 rounded-xl border-2 border-[#e2e8f0]"
              />
            </div>
            <div>
              <Label htmlFor="patient-phone">Phone Number (Optional)</Label>
              <Input
                id="patient-phone"
                value={newChart.patientPhone}
                onChange={(e) => setNewChart({ ...newChart, patientPhone: e.target.value })}
                placeholder="555-1234"
                className="mt-2 h-12 rounded-xl border-2 border-[#e2e8f0]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateChartModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChart}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Chart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Chart Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Chart to Clinician</DialogTitle>
            <DialogDescription>
              Select a clinician to assign this chart for medication review.
            </DialogDescription>
          </DialogHeader>
          {selectedChart && (
            <div className="space-y-4 py-4">
              <div className="bg-[#f8fafc] rounded-xl p-4">
                <p className="text-sm text-[#0f172a] mb-1">
                  <strong>Patient:</strong> {selectedChart.patientName}
                </p>
                <p className="text-sm text-[#0f172a]">
                  <strong>DOB:</strong> {new Date(selectedChart.patientDob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <Label htmlFor="clinician">Select Clinician *</Label>
                <Select value={selectedClinician} onValueChange={setSelectedClinician}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-[#e2e8f0]">
                    <SelectValue placeholder="Choose a clinician" />
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
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedChart(null);
                setSelectedClinician('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignChart}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Assign Chart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
