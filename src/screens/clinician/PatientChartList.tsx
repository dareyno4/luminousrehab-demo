import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  SortAsc,
  CheckSquare,
  Square,
  Download,
  Mail,
  Printer,
  Archive,
  MoreVertical,
  ChevronRight,
  FileText,
  X,
  Plus,
  FileUp,
  ClipboardCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Lock,
  CheckCircle,
  Loader2,
  WifiOff,
  Camera,
  Scan,
  Upload,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Screen, NavigationParams } from '../../App';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { fetchPatientsForClinician } from '../../services/patientService';


interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';
type FilterStatus = 'all' | 'Active' | 'Verified Ready' | 'Delivered (Locked)' | 'Needs Reverification' | 'Archived';

interface Patient {
  id: string;
  name: string;
  dob: string;
  charts: Chart[];
}

interface Chart {
  id: string;
  status: 'Active' | 'Verified Ready' | 'Delivered (Locked)' | 'Needs Reverification' | 'Archived';
  type: 'Bottle Scan' | 'PDF Import' | 'Manual Entry';
  medicationCount: number;
  createdDate: string;
  createdBy: string;
  finalizedDate?: string;
}

const mapChartStatus = (status: string): Chart['status'] => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'verified_ready':
      return 'Verified Ready';
    case 'delivered_locked':
      return 'Delivered (Locked)';
    case 'needs_reverification':
      return 'Needs Reverification';
    case 'archived':
      return 'Archived';
    default:
      return 'Active';
  }
};

const mapSourceToType = (source: string): Chart['type'] => {
  switch (source) {
    case 'bottle_scan':
      return 'Bottle Scan';
    case 'pdf_import':
      return 'PDF Import';
    case 'image_upload':
    case 'empty_chart':
    default:
      return 'Manual Entry';
  }
};



export default function PatientChartList({ navigation }: Props) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Quick filter chips
  const [quickFilterChips, setQuickFilterChips] = useState<FilterStatus[]>([]);
  
  // Table sorting
  const [sortByColumn, setSortByColumn] = useState<'created' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  
  // Scan sheet
  const [isScanSheetOpen, setIsScanSheetOpen] = useState(false);

  // Toggle quick filter chip
  const toggleQuickFilterChip = (status: FilterStatus) => {
    if (quickFilterChips.includes(status)) {
      setQuickFilterChips(quickFilterChips.filter(s => s !== status));
    } else {
      setQuickFilterChips([...quickFilterChips, status]);
    }
  };

  // Handle column sort
  const handleColumnSort = (column: 'created' | 'status') => {
    if (sortByColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortByColumn(column);
      setSortDirection('desc');
    }
  };

  // Handle scan option
  const handleScanOption = (scanType: string) => {
    setIsScanSheetOpen(false);
    toast.info(`${scanType} feature coming soon`);
  };

    useEffect(() => {
    const loadPatients = async () => {
      try {
        if (!user?.id) return;

        const data = await fetchPatientsForClinician(user.id);

        const mapped: Patient[] = (data || []).map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          dob: p.date_of_birth,
          charts: (p.charts || []).map((c: any) => ({
            id: c.id,
            status: mapChartStatus(c.status),
            type: mapSourceToType(c.source),
            medicationCount: c.medication_count ?? 0,
            createdDate: c.created_at,
            createdBy: c.created_by ?? 'Unknown',
            finalizedDate: c.finalized_at ?? undefined,
          })),
        }));

        setPatients(mapped);
        setError(null);
      } catch (e: any) {
        console.error('Error loading patient charts list', e);
        setError(e.message || 'Failed to load charts');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [user?.id]);


  // Get all charts with patient info
    // Get all charts with patient info
  const getAllChartsWithPatients = () => {
    let allCharts: Array<{ patient: Patient; chart: Chart; chartKey: string }> = [];

    patients.forEach(patient => {
      patient.charts.forEach(chart => {
        allCharts.push({
          patient,
          chart,
          chartKey: `${patient.id}-${chart.id}`,
        });
      });
    });


    // Apply search filter
    if (searchQuery) {
      allCharts = allCharts.filter(item =>
        item.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter from dropdown
    if (filterStatus !== 'all') {
      allCharts = allCharts.filter(item => item.chart.status === filterStatus);
    }

    // Apply quick filter chips (OR logic - show if matches any chip)
    if (quickFilterChips.length > 0) {
      allCharts = allCharts.filter(item => quickFilterChips.includes(item.chart.status as FilterStatus));
    }

    // Apply column sorting (overrides dropdown sorting when active)
    if (sortByColumn === 'created') {
      allCharts.sort((a, b) => {
        const dateA = new Date(a.chart.createdDate).getTime();
        const dateB = new Date(b.chart.createdDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortByColumn === 'status') {
      const statusOrder = { 'Needs Reverification': 0, 'Active': 1, 'Verified Ready': 2, 'Delivered (Locked)': 3, 'Archived': 4 };
      allCharts.sort((a, b) => {
        const orderA = statusOrder[a.chart.status] || 999;
        const orderB = statusOrder[b.chart.status] || 999;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      });
    } else {
      // Apply dropdown sorting
      allCharts.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.chart.createdDate).getTime() - new Date(a.chart.createdDate).getTime();
          case 'oldest':
            return new Date(a.chart.createdDate).getTime() - new Date(b.chart.createdDate).getTime();
          case 'name-asc':
            return a.patient.name.localeCompare(b.patient.name);
          case 'name-desc':
            return b.patient.name.localeCompare(a.patient.name);
          case 'status':
            const statusOrder = { 'Needs Reverification': 0, 'Active': 1, 'Verified Ready': 2, 'Delivered (Locked)': 3, 'Archived': 4 };
            return (statusOrder[a.chart.status] || 999) - (statusOrder[b.chart.status] || 999);
          default:
            return 0;
        }
      });
    }

    return allCharts;
  };

  const allCharts = getAllChartsWithPatients();

  const handleToggleChart = (chartKey: string) => {
    const newSelected = new Set(selectedCharts);
    if (newSelected.has(chartKey)) {
      newSelected.delete(chartKey);
    } else {
      newSelected.add(chartKey);
    }
    setSelectedCharts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCharts.size === allCharts.length) {
      setSelectedCharts(new Set());
    } else {
      setSelectedCharts(new Set(allCharts.map(item => item.chartKey)));
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedCharts(new Set());
  };

  const handleBatchExport = () => {
    alert(`Exporting ${selectedCharts.size} charts to PDF...`);
    handleCancelSelection();
  };

  const handleBatchEmail = () => {
    alert(`Preparing to email ${selectedCharts.size} charts...`);
    handleCancelSelection();
  };

  const handleBatchArchive = () => {
    if (confirm(`Are you sure you want to archive ${selectedCharts.size} charts?`)) {
      alert(`Archived ${selectedCharts.size} charts`);
      handleCancelSelection();
    }
  };

  const handleSelectChart = (patientId: string, chartId: string) => {
    if (!isSelectionMode) {
      navigation.navigate('ChartDetail', { patientId, chartId });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0966CC] to-[#0C4A6E] p-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigation.goBack()}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg text-white">All Patient Charts</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Batch Action Bar */}
      {isSelectionMode && (
        <div className="bg-gradient-to-r from-[#0966CC] to-[#0C4A6E] px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancelSelection}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-white">
                {selectedCharts.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBatchExport}
                disabled={selectedCharts.size === 0}
                size="sm"
                className="bg-white/10 border-0 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={handleBatchEmail}
                disabled={selectedCharts.size === 0}
                size="sm"
                className="bg-white/10 border-0 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleBatchArchive}
                disabled={selectedCharts.size === 0}
                size="sm"
                className="bg-white/10 border-0 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                <Input
                  id="charts-search"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 rounded-xl border border-[#e2e8f0] bg-white"
                />
              </div>

              {/* Filter by Status */}
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                  <SelectTrigger className="h-11 rounded-xl border border-[#e2e8f0] bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Needs Reverification">Needs Reverification</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Verified Ready">Verified Ready</SelectItem>
                    <SelectItem value="Delivered (Locked)">Delivered (Locked)</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="h-11 rounded-xl border border-[#e2e8f0] bg-white">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || filterStatus !== 'all') && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f1f5f9]">
                <span className="text-xs text-[#64748b]">Active filters:</span>
                {searchQuery && (
                  <Badge variant="outline" className="bg-[#f8fafc] text-xs">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {filterStatus !== 'all' && (
                  <Badge variant="outline" className="bg-[#f8fafc] text-xs">
                    Status: {filterStatus}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="ml-auto text-xs text-[#0966CC] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-sky-600" />
              <div>
                <h2 className="text-lg text-slate-900">All Charts ({allCharts.length})</h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Manage and review patient charts
                </p>
              </div>
            </div>

            {/* Sync Status & Select Button */}
            <div className="flex items-center gap-3">
              {syncStatus === 'synced' ? (
                <div className="flex items-center gap-1.5 text-emerald-700 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Synced</span>
                </div>
              ) : syncStatus === 'syncing' ? (
                <div className="flex items-center gap-1.5 text-sky-700 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline • 3 pending</span>
                </div>
              )}
              
              <Button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                variant={isSelectionMode ? 'default' : 'outline'}
                className={isSelectionMode ? 'bg-[#0966CC] hover:bg-[#0C4A6E] text-white' : ''}
              >
                {isSelectionMode ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigation.navigate('NewPatientChart')}
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chart
            </Button>
            <Button
              onClick={() => setIsScanSheetOpen(true)}
              variant="outline"
              className="border-violet-200 text-violet-700 hover:bg-violet-50 shadow-sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan
            </Button>
            <Button
              onClick={() => handleScanOption('Import PDF')}
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Import PDF
            </Button>
            <Button
              onClick={() => toast.info('Bulk review feature coming soon')}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Bulk Review
            </Button>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600 mr-1">Quick filters:</span>
            {(['Active', 'Needs Reverification', 'Verified Ready', 'Archived'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => toggleQuickFilterChip(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  quickFilterChips.includes(status)
                    ? status === 'Needs Reverification'
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : status === 'Active'
                      ? 'bg-sky-100 border-sky-300 text-sky-700'
                      : status === 'Verified Ready'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'Needs Reverification' ? 'Needs Review' : status}
              </button>
            ))}
            {quickFilterChips.length > 0 && (
              <button
                onClick={() => setQuickFilterChips([])}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium ml-1"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selection Mode Actions */}
          {isSelectionMode && (
            <div className="bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] border-0 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-[#0966CC] hover:text-[#0C4A6E] transition-colors"
                  >
                    {selectedCharts.size === allCharts.length ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    <span className="text-sm">
                      {selectedCharts.size === allCharts.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                  {selectedCharts.size > 0 && (
                    <span className="text-sm text-[#0966CC]">
                      {selectedCharts.size} of {allCharts.length} selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {allCharts.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl text-slate-900 mb-2">No charts match your filters</h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                Try adjusting status or date range
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setQuickFilterChips([]);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20"
              >
                <X className="w-4 h-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}

          {/* Charts Table */}
          {allCharts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-600">
                {isSelectionMode && (
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={selectedCharts.size === allCharts.length && allCharts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                )}
                <div className={`${isSelectionMode ? 'col-span-3' : 'col-span-4'}`}>
                  Patient
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleColumnSort('status')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    Status
                    {sortByColumn === 'status' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </button>
                </div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1">Meds</div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleColumnSort('created')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    Created
                    {sortByColumn === 'created' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </button>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-100">
                {allCharts.map(({ patient, chart, chartKey }, index) => {
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case 'Needs Reverification':
                        return <AlertCircle className="w-3.5 h-3.5" />;
                      case 'Active':
                        return <FileText className="w-3.5 h-3.5" />;
                      case 'Verified Ready':
                        return <CheckCircle2 className="w-3.5 h-3.5" />;
                      case 'Delivered (Locked)':
                        return <Lock className="w-3.5 h-3.5" />;
                      case 'Archived':
                        return <Archive className="w-3.5 h-3.5" />;
                      default:
                        return null;
                    }
                  };

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Needs Reverification':
                        return 'bg-red-100 text-red-700 border-red-200';
                      case 'Active':
                        return 'bg-sky-100 text-sky-700 border-sky-200';
                      case 'Verified Ready':
                        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      case 'Delivered (Locked)':
                        return 'bg-purple-100 text-purple-700 border-purple-200';
                      case 'Archived':
                        return 'bg-slate-100 text-slate-600 border-slate-200';
                      default:
                        return '';
                    }
                  };

                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case 'Needs Reverification':
                        return 'Needs Review';
                      case 'Verified Ready':
                        return 'Verified';
                      case 'Delivered (Locked)':
                        return 'Locked';
                      default:
                        return status;
                    }
                  };

                  const getStatusTooltip = (status: string) => {
                    switch (status) {
                      case 'Needs Reverification':
                        return 'Chart awaiting review before medication verification';
                      case 'Active':
                        return 'Currently in progress';
                      case 'Verified Ready':
                        return 'All medications verified and ready for delivery';
                      case 'Delivered (Locked)':
                        return 'Chart has been finalized and locked';
                      case 'Archived':
                        return 'Chart has been archived';
                      default:
                        return status;
                    }
                  };

                  // Get patient initials
                  const initials = patient.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={chartKey}
                      className={`group cursor-pointer ${
                        index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      } ${
                        chart.status === 'Needs Reverification' ? 'border-l-4 border-l-red-400' : ''
                      }`}
                      onClick={() => {
                        if (isSelectionMode) {
                          handleToggleChart(chartKey);
                        } else {
                          handleSelectChart(patient.id, chart.id);
                        }
                      }}
                    >
                      {/* Desktop View */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 active:scale-[0.998] transition-all">
                        {isSelectionMode && (
                          <div className="col-span-1 flex items-center">
                            <Checkbox
                              checked={selectedCharts.has(chartKey)}
                              onCheckedChange={() => handleToggleChart(chartKey)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        <div className={`${isSelectionMode ? 'col-span-3' : 'col-span-4'} flex items-center gap-3 min-w-0`}>
                          <Avatar className="w-10 h-10 border-2 border-slate-200 flex-shrink-0">
                            <AvatarFallback className={`text-sm ${
                              chart.status === 'Needs Reverification'
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                : 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
                            }`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-slate-900 truncate">{patient.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              DOB: {new Date(patient.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Badge className={`${getStatusColor(chart.status)} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border`}>
                                    {getStatusIcon(chart.status)}
                                    <span className="whitespace-nowrap">{getStatusLabel(chart.status)}</span>
                                  </Badge>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p>{getStatusTooltip(chart.status)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="col-span-2 text-sm text-slate-700">
                          {chart.type}
                        </div>
                        <div className="col-span-1 text-sm text-slate-700">
                          {chart.medicationCount}
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <div className="text-sm text-slate-700">
                            {new Date(chart.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {!isSelectionMode && (
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                          )}
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          {isSelectionMode && (
                            <div className="pt-1">
                              <Checkbox
                                checked={selectedCharts.has(chartKey)}
                                onCheckedChange={() => handleToggleChart(chartKey)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                          <Avatar className="w-10 h-10 border-2 border-slate-200 flex-shrink-0">
                            <AvatarFallback className={`text-sm ${
                              chart.status === 'Needs Reverification'
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                : 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
                            }`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="text-sm font-medium text-slate-900">{patient.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  DOB: {new Date(patient.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <Badge className={`${getStatusColor(chart.status)} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border flex-shrink-0`}>
                                {getStatusIcon(chart.status)}
                                <span className="whitespace-nowrap">{getStatusLabel(chart.status)}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{chart.type}</span>
                              <span>•</span>
                              <span>{chart.medicationCount} med{chart.medicationCount !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{new Date(chart.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          {!isSelectionMode && (
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Scan Options Sheet */}
      <Sheet open={isScanSheetOpen} onOpenChange={setIsScanSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] sm:h-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">Scan Medication Information</SheetTitle>
            <SheetDescription>
              Choose how you want to capture medication data
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {/* Bottle Scan */}
            <button
              onClick={() => handleScanOption('Bottle Scan')}
              className="w-full bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                  <Scan className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 font-medium mb-1">Scan Barcode</h4>
                  <p className="text-sm text-slate-600">Quick medication lookup via barcode</p>
                </div>
              </div>
            </button>

            {/* Bottle OCR */}
            <button
              onClick={() => handleScanOption('Bottle OCR')}
              className="w-full bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-violet-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 transition-colors">
                  <Camera className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 font-medium mb-1">Scan Bottle (OCR)</h4>
                  <p className="text-sm text-slate-600">Capture text from medication bottle labels</p>
                </div>
              </div>
            </button>

            {/* Import PDF */}
            <button
              onClick={() => handleScanOption('Import PDF')}
              className="w-full bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-amber-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 font-medium mb-1">Import PDF/Image</h4>
                  <p className="text-sm text-slate-600">Upload discharge summaries or med lists</p>
                </div>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
