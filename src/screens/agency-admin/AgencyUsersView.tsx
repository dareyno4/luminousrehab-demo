import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Briefcase,
  Key,
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  Shield,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

interface Props {
  // Props can be added as needed
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  role: 'clinician' | 'scheduler';
  activationCode: string;
  isActivated: boolean;
  createdDate: string;
  activatedDate?: string;
  assignedCharts?: number;
}

const mockUsers: UserAccount[] = [
  {
    id: '1',
    name: 'Anna Clinician',
    email: 'anna.clinician@hha.test',
    phone: '555-2001',
    occupation: 'Registered Nurse',
    role: 'clinician',
    activationCode: 'ACTV-2025-1001',
    isActivated: true,
    createdDate: '2025-01-05',
    activatedDate: '2025-01-05',
    assignedCharts: 5,
  },
  {
    id: '2',
    name: 'Bob Clinician',
    email: 'bob.clinician@hha.test',
    phone: '555-2002',
    occupation: 'Licensed Practical Nurse',
    role: 'clinician',
    activationCode: 'ACTV-2025-1002',
    isActivated: true,
    createdDate: '2025-01-08',
    activatedDate: '2025-01-09',
    assignedCharts: 3,
  },
  {
    id: '3',
    name: 'Carol Scheduler',
    email: 'carol.scheduler@hha.test',
    phone: '555-3001',
    role: 'scheduler',
    activationCode: 'ACTV-2025-2001',
    isActivated: true,
    createdDate: '2025-01-10',
    activatedDate: '2025-01-10',
  },
  {
    id: '4',
    name: 'David Clinician',
    email: 'david.clinician@hha.test',
    occupation: 'Physician Assistant',
    role: 'clinician',
    activationCode: 'ACTV-2025-1003',
    isActivated: false,
    createdDate: '2025-01-15',
    assignedCharts: 0,
  },
];

export default function AgencyUsersView({}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'clinician' | 'scheduler'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<'clinician' | 'scheduler'>('clinician');
  const [generatedActivationCode, setGeneratedActivationCode] = useState('');
  const [showActivationCode, setShowActivationCode] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
  });

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const cliniciansCount = mockUsers.filter(u => u.role === 'clinician').length;
  const schedulersCount = mockUsers.filter(u => u.role === 'scheduler').length;
  const activatedCount = mockUsers.filter(u => u.isActivated).length;
  const pendingCount = mockUsers.filter(u => !u.isActivated).length;

  const generateActivationCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ACTV-2025-${timestamp}-${random}`;
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const code = generateActivationCode();
    setGeneratedActivationCode(code);
    setShowActivationCode(true);
    toast.success(`${selectedUserRole === 'clinician' ? 'Clinician' : 'Scheduler'} "${newUser.name}" added successfully`);
  };

  const handleCopyActivationCode = async (code: string) => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(code);
      toast.success('Activation code copied to clipboard');
    } catch (err) {
      // Fallback for browsers/contexts where clipboard API is blocked
      try {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          toast.success('Activation code copied to clipboard');
        } else {
          // If all else fails, just show the code
          toast.info(`Activation Code: ${code}`, { duration: 10000 });
        }
      } catch (fallbackErr) {
        // If all else fails, just show the code
        toast.info(`Activation Code: ${code}`, { duration: 10000 });
      }
    }
  };

  const handleRegenerateCode = (userId: string, userName: string) => {
    const newCode = generateActivationCode();
    toast.success(`New activation code generated for ${userName}`);
    // In a real app, this would update the backend
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    setShowActivationCode(false);
    setGeneratedActivationCode('');
    setNewUser({ name: '', email: '', phone: '', occupation: '' });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-[#0f172a]">Users & Onboarding</h2>
          <p className="text-sm text-[#64748b]">Manage clinicians and schedulers</p>
        </div>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">Clinicians</p>
              <p className="text-2xl text-[#0f172a] mt-1">{cliniciansCount}</p>
            </div>
            <User className="w-8 h-8 text-[#0966CC]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">Schedulers</p>
              <p className="text-2xl text-[#0f172a] mt-1">{schedulersCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">Activated</p>
              <p className="text-2xl text-[#0f172a] mt-1">{activatedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748b]">Pending</p>
              <p className="text-2xl text-[#0f172a] mt-1">{pendingCount}</p>
            </div>
            <Key className="w-8 h-8 text-[#DC2626]" />
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRole === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRole('all')}
            className={filterRole === 'all' ? 'bg-[#10B981] hover:bg-[#059669]' : ''}
          >
            All
          </Button>
          <Button
            variant={filterRole === 'clinician' ? 'default' : 'outline'}
            onClick={() => setFilterRole('clinician')}
            className={filterRole === 'clinician' ? 'bg-[#0966CC] hover:bg-[#075985]' : 'border-[#0966CC] text-[#0966CC]'}
          >
            Clinicians
          </Button>
          <Button
            variant={filterRole === 'scheduler' ? 'default' : 'outline'}
            onClick={() => setFilterRole('scheduler')}
            className={filterRole === 'scheduler' ? 'bg-[#F59E0B] hover:bg-[#D97706]' : 'border-[#F59E0B] text-[#F59E0B]'}
          >
            Schedulers
          </Button>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className={`h-12 w-12 ${user.role === 'clinician' ? 'bg-gradient-to-br from-[#0966CC] to-[#075985]' : 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]'}`}>
                      <AvatarFallback className="text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg text-[#0f172a]">{user.name}</h3>
                        <Badge className={user.role === 'clinician' 
                          ? 'bg-[#DBEAFE] text-[#0966CC] border-[#BFDBFE]'
                          : 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]'
                        }>
                          {user.role === 'clinician' ? 'Clinician' : 'Scheduler'}
                        </Badge>
                        {user.isActivated ? (
                          <Badge className="bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activated
                          </Badge>
                        ) : (
                          <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending Activation
                          </Badge>
                        )}
                      </div>
                      {user.occupation && (
                        <p className="text-sm text-[#64748b] mt-1">{user.occupation}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#64748b]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Added: {new Date(user.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {user.isActivated && user.activatedDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Activated: {new Date(user.activatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {user.role === 'clinician' && user.assignedCharts !== undefined && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{user.assignedCharts} assigned chart{user.assignedCharts !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Activation Code Section */}
                  <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Key className="w-4 h-4 text-[#64748b]" />
                        <span className="text-sm text-[#64748b]">Activation Code:</span>
                        <code className="text-sm bg-white px-2 py-1 rounded border border-[#e2e8f0]">
                          {user.activationCode}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyActivationCode(user.activationCode)}
                          className="h-8"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!user.isActivated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateCode(user.id, user.name)}
                            className="h-8 text-[#0966CC] hover:text-[#075985] hover:bg-[#DBEAFE]"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
              ? 'No users found matching your search.'
              : 'No users yet. Add a user to get started.'}
          </p>
        </Card>
      )}

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Onboard a new clinician or scheduler to your organization
            </DialogDescription>
          </DialogHeader>

          {!showActivationCode ? (
            <>
              <Tabs value={selectedUserRole} onValueChange={(value:any) => setSelectedUserRole(value as 'clinician' | 'scheduler')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clinician">Clinician</TabsTrigger>
                  <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name *</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11 rounded-xl"
                  />
                </div>
                {selectedUserRole === 'clinician' && (
                  <div className="space-y-2">
                    <Label htmlFor="user-occupation">Occupation *</Label>
                    <Input
                      id="user-occupation"
                      value={newUser.occupation}
                      onChange={(e) => setNewUser({ ...newUser, occupation: e.target.value })}
                      placeholder="e.g., Registered Nurse"
                      className="h-11 rounded-xl"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone">Phone Number</Label>
                  <Input
                    id="user-phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="555-1234"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#10B981] hover:bg-[#059669]"
                  onClick={handleAddUser}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedUserRole === 'clinician' ? 'Clinician' : 'Scheduler'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-lg text-[#0f172a] mb-2">User Added Successfully!</h3>
                  <p className="text-sm text-[#64748b]">
                    {newUser.name} has been added as a {selectedUserRole}. Share the activation code below.
                  </p>
                </div>
                <div className="bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl p-6">
                  <p className="text-sm text-[#64748b] mb-3">Activation Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl bg-white px-4 py-3 rounded-lg border-2 border-[#10B981] text-[#0f172a]">
                      {generatedActivationCode}
                    </code>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyActivationCode(generatedActivationCode)}
                      className="border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-[#64748b] mt-3">
                    The user will need this code to activate their account
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-[#10B981] hover:bg-[#059669]"
                  onClick={handleCloseModal}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
