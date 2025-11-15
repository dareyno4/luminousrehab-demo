import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit,
  Clock,
  CheckCircle,
  Users,
  FileText,
  ChevronRight,
  Camera,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Screen, NavigationParams } from '../../App';
import { toast } from 'sonner';

interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
}

export default function SchedulerProfile({ navigation }: Props) {
  const profileData = {
    name: 'Jessica Martinez',
    role: 'Scheduler',
    email: 'jessica.martinez@healthcarepartners.com',
    phone: '(555) 345-6789',
    address: '789 Scheduling Center, Healthcare City, HC 12345',
    agency: 'HealthCare Partners LLC',
    agencyLicense: 'HHA-789456',
    joinDate: 'February 20, 2024',
    accountCreated: 'Jan 07, 2025',
    lastUpdated: 'Feb 01, 2025',
    // Scheduler-specific stats
    totalAssignments: 2,
    totalCharts: 2,
    pendingReview: 0,
    thisWeekScheduled: 18,
  };

  const handleAvatarUpload = () => {
    toast.success('Avatar upload feature coming soon');
  };

  const handleAvatarRemove = () => {
    toast.info('Avatar removed');
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg text-[#0f172a]">My Profile</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#D1FAE5] rounded-full">
              <div className="w-2 h-2 bg-[#10B981] rounded-full" />
              <span className="text-xs text-[#10B981]">Online</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#64748b]">View and manage your profile</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white/30">
                <AvatarFallback className="bg-white text-[#F59E0B] text-2xl">
                  JM
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAvatarUpload}
                        className="w-8 h-8 rounded-full bg-white text-[#F59E0B] flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload photo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAvatarRemove}
                        className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove photo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-white mb-1">{profileData.name}</h2>
              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                {profileData.role}
              </Badge>
              <button
                onClick={() => toast.info('Agency details coming soon')}
                className="text-sm text-white/90 hover:text-white flex items-center gap-1 transition-colors"
              >
                {profileData.agency}
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        {/* Assignment Overview */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-[#0f172a]">Assignment Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl text-[#F59E0B] font-semibold">{profileData.totalAssignments}</p>
              <p className="text-xs text-[#64748b]">Total Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#0966CC] font-semibold">{profileData.totalCharts}</p>
              <p className="text-xs text-[#64748b]">Total Charts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#10B981] font-semibold">{profileData.pendingReview}</p>
              <p className="text-xs text-[#64748b]">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#F59E0B] font-semibold">{profileData.thisWeekScheduled}</p>
              <p className="text-xs text-[#64748b]">This Week</p>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm font-semibold text-[#0f172a]">User Details</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Edit profile coming soon')}
              className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit
            </Button>
          </div>
          
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#64748b] mb-1">Email Address</p>
                  <p className="text-sm text-[#0f172a]">{profileData.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#64748b] mb-1">Phone Number</p>
                  <p className="text-sm text-[#0f172a]">{profileData.phone}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Agency Information Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm font-semibold text-[#0f172a]">Agency Information</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info('Agency details coming soon')}
              className="text-[#F59E0B] hover:text-[#D97706] hover:bg-[#FEF3C7]"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#64748b] mb-1">Agency Name</p>
                  <p className="text-sm text-[#0f172a]">{profileData.agency}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#64748b] mb-1">License Number</p>
                  <p className="text-sm text-[#0f172a]">{profileData.agencyLicense}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-[#0f172a]">Contact Information</h3>
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#64748b] mb-1">Address</p>
                <p className="text-sm text-[#0f172a]">{profileData.address}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Audit Metadata */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-start gap-2 text-xs text-[#64748b]">
            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>🕑 Account created: {profileData.accountCreated}</p>
              <p>✏️ Last updated: {profileData.lastUpdated}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
