import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  dob: string;
  address: string;
  phone: string;
  chartCount: number;
  lastChart?: string;
  status?: 'active' | 'inactive';
}

interface Chart {
  id: string;
  patientName: string;
  status: string;
  type: string;
  createdDate: string;
  medicationCount: number;
}

interface Clinician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  patientCount: number;
  chartCount: number;
  assignedPatients: Array<{
    name: string;
    dob: string;
    chartCount: number;
  }>;
}

interface Props {
  clinician: Clinician;
  onBack: () => void;
  navigation: any;
}

// Mock data for demo
const mockDetailedPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Jane Test',
    dob: '1969-12-31',
    address: '123 Main St, Demo City, CA',
    phone: '555-1001',
    chartCount: 2,
    lastChart: '2025-01-17',
    status: 'active',
  },
];

const mockClinicianCharts: Chart[] = [
  {
    id: 'c1',
    patientName: 'Jane Test',
    status: 'Pending Review',
    type: 'Bottle Scan',
    createdDate: '2025-01-17',
    medicationCount: 3,
  },
  {
    id: 'c2',
    patientName: 'Jane Test',
    status: 'Verified',
    type: 'Manual Entry',
    createdDate: '2025-01-15',
    medicationCount: 2,
  },
];

export default function ClinicianDetailView({ clinician, onBack, navigation }: Props) {
  const [selectedTab, setSelectedTab] = useState<'patients' | 'charts'>('patients');

  // Calculate stats
  const pendingCharts = mockClinicianCharts.filter(c => c.status === 'Pending Review').length;
  const verifiedCharts = mockClinicianCharts.filter(c => c.status === 'Verified').length;
  const activePatients = mockDetailedPatients.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl border-2 border-[#e2e8f0] hover:bg-[#D1FAE5] hover:border-[#10B981]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl text-[#0f172a] font-semibold">Clinician Profile</h2>
          <p className="text-sm text-[#64748b]">View details and assigned patients</p>
        </div>
      </div>

      {/* Clinician Profile Card */}
      <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-white/30">
              <AvatarFallback className="bg-white text-[#10B981] text-xl font-semibold">
                {clinician.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold mb-2">{clinician.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Mail className="w-4 h-4" />
                  <span>{clinician.email}</span>
                </div>
                {clinician.phone && (
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Phone className="w-4 h-4" />
                    <span>{clinician.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            Active
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-xs text-white/70 mb-1">Patients</p>
            <p className="text-2xl font-semibold">{clinician.patientCount}</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Total Charts</p>
            <p className="text-2xl font-semibold">{clinician.chartCount}</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Pending Review</p>
            <p className="text-2xl font-semibold">{pendingCharts}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-[#10B981]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#64748b]">Active Patients</p>
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-2xl text-[#0f172a] font-semibold">{activePatients}</p>
          <p className="text-xs text-[#10B981] mt-1">Currently assigned</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-[#F59E0B]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#64748b]">Pending Charts</p>
            <Clock className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <p className="text-2xl text-[#0f172a] font-semibold">{pendingCharts}</p>
          <p className="text-xs text-[#64748b] mt-1">Awaiting review</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-[#0966CC]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#64748b]">Verified Charts</p>
            <TrendingUp className="w-5 h-5 text-[#0966CC]" />
          </div>
          <p className="text-2xl text-[#0f172a] font-semibold">{verifiedCharts}</p>
          <p className="text-xs text-[#10B981] mt-1">Ready to deliver</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedTab('patients')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'patients'
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Assigned Patients ({mockDetailedPatients.length})
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('charts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'charts'
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Recent Charts ({mockClinicianCharts.length})
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'patients' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0f172a]">Assigned Patients</h3>
            <Badge variant="outline" className="text-xs">
              {mockDetailedPatients.length} total
            </Badge>
          </div>

          {mockDetailedPatients.map((patient) => (
            <Card key={patient.id} className="p-5 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#D1FAE5] text-[#10B981]">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg text-[#0f172a] font-medium">{patient.name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          patient.status === 'active'
                            ? 'border-[#10B981] text-[#10B981] text-xs'
                            : 'border-[#64748b] text-[#64748b] text-xs'
                        }
                      >
                        {patient.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[#64748b]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">DOB: {new Date(patient.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">{patient.chartCount} chart{patient.chartCount !== 1 ? 's' : ''}</span>
                    </div>
                    {patient.lastChart && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Last: {new Date(patient.lastChart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-[#64748b] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {patient.address}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Patient detail view coming soon')}
                  className="border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </Card>
          ))}

          {mockDetailedPatients.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-1">No patients assigned</p>
              <p className="text-sm text-slate-400">This clinician has no assigned patients yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0f172a]">Recent Charts</h3>
            <Badge variant="outline" className="text-xs">
              {mockClinicianCharts.length} total
            </Badge>
          </div>

          {mockClinicianCharts.map((chart) => (
            <Card key={chart.id} className="p-5 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg text-[#0f172a] font-medium">{chart.patientName}</h4>
                    <Badge
                      className={
                        chart.status === 'Verified'
                          ? 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]'
                          : chart.status === 'Pending Review'
                          ? 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]'
                          : 'bg-[#DBEAFE] text-[#0966CC] border-[#BFDBFE]'
                      }
                    >
                      {chart.status === 'Verified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {chart.status === 'Pending Review' && <Clock className="w-3 h-3 mr-1" />}
                      {chart.status === 'Active' && <Activity className="w-3 h-3 mr-1" />}
                      {chart.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748b]">
                    <span>{chart.type}</span>
                    <span>•</span>
                    <span>{chart.medicationCount} medication{chart.medicationCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Created {new Date(chart.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigation.navigate('ChartDetailView', { chartId: chart.id, patientName: chart.patientName, mode: 'review' })}
                  className="border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
            </Card>
          ))}

          {mockClinicianCharts.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-1">No charts found</p>
              <p className="text-sm text-slate-400">This clinician hasn't created any charts yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
