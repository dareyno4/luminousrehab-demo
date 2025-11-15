import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  RotateCcw,
  CheckCircle,
  Eye,
  Paperclip,
  MoreVertical,
  Archive,
  LockOpen,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Screen, NavigationParams } from '../../App';

interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
  route: {
    params: NavigationParams;
  };
}

interface Medication {
  id: string;
  drugName: string;
  strength: string;
  route: string;
  frequency: string;
  prescriber: string;
  scannedDate: string;
  confidence: number;
  isVerified: boolean;
  notes?: string;
}

export default function ChartDetailView({ navigation, route }: Props) {
  const { chartId, patientName, mode } = route.params;
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReverificationModal, setShowReverificationModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [chartStatus, setChartStatus] = useState<'Active' | 'Verified' | 'Delivered' | 'Pending Review' | 'Archived'>('Verified');
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false);
  const [showUnarchiveConfirmation, setShowUnarchiveConfirmation] = useState(false);
  const [showUnlockConfirmation, setShowUnlockConfirmation] = useState(false);

  // Mock data - in real app, this would come from database based on chartId
  const patient = {
    name: patientName || 'Jane Test',
    dob: '12/31/1969',
  };

  const chartInfo = {
    type: 'Bottle Scan',
    createdBy: 'Anna Clinician',
    createdDate: '1/17/2025',
    finalizedDate: '1/17/2025',
  };

  const medications: Medication[] = [
    {
      id: '1',
      drugName: 'Metformin',
      strength: '500 mg',
      route: 'PO',
      frequency: 'BID',
      prescriber: 'Dr. Gamma',
      scannedDate: '1/17/2025',
      confidence: 92,
      isVerified: true,
    },
    {
      id: '2',
      drugName: 'Lisinopril',
      strength: '10 mg',
      route: 'PO',
      frequency: 'Daily',
      prescriber: 'Dr. Smith',
      scannedDate: '1/17/2025',
      confidence: 78,
      isVerified: true,
    },
  ];

  const attachedDocuments = [
    { id: '1', name: 'Medication Bottle - Metformin.jpg', uploadedDate: '1/17/2025' },
    { id: '2', name: 'Discharge Summary.pdf', uploadedDate: '1/17/2025' },
  ];

  const isReviewMode = mode === 'review';
  const isLocked = chartStatus === 'Delivered';
  const canApprove = chartStatus === 'Verified' || chartStatus === 'Pending Review';

  const handleApprove = () => {
    console.log('Approving chart:', chartId, 'Notes:', reviewNotes);
    setShowApprovalModal(false);
    setReviewNotes('');
    // Update status and navigate back
    alert('Chart approved successfully!');
    navigation.goBack();
  };

  const handleRequestChanges = () => {
    if (!reviewNotes.trim()) {
      alert('Please provide feedback notes for the clinician.');
      return;
    }
    console.log('Requesting changes for chart:', chartId, 'Notes:', reviewNotes);
    setShowReverificationModal(false);
    setReviewNotes('');
    alert('Reverification request sent to clinician!');
    navigation.goBack();
  };

  const handleArchiveChart = () => {
    setShowArchiveConfirmation(true);
  };

  const confirmArchiveChart = () => {
    setChartStatus('Archived');
    setShowArchiveConfirmation(false);
    alert('Chart archived successfully');
  };

  const handleUnarchiveChart = () => {
    setShowUnarchiveConfirmation(true);
  };

  const confirmUnarchiveChart = () => {
    setChartStatus('Active');
    setShowUnarchiveConfirmation(false);
    alert('Chart restored to Active status');
  };

  const handleUnlockChart = () => {
    setShowUnlockConfirmation(true);
  };

  const confirmUnlockChart = () => {
    setChartStatus('Active');
    setShowUnlockConfirmation(false);
    alert('Chart unlocked successfully');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <Badge className="bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]">
          High: {confidence}%
        </Badge>
      );
    } else if (confidence >= 70) {
      return (
        <Badge className="bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]">
          Medium: {confidence}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
          Low: {confidence}%
        </Badge>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigation.goBack()}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg text-white">{patient.name}</h1>
            <p className="text-sm text-white/80">DOB: {patient.dob}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {chartStatus === 'Delivered' && (
                <>
                  <DropdownMenuItem onClick={handleUnlockChart} className="cursor-pointer">
                    <LockOpen className="w-4 h-4 mr-2" />
                    Unlock Chart
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleArchiveChart} className="cursor-pointer text-amber-600">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Chart
                  </DropdownMenuItem>
                </>
              )}
              {(chartStatus === 'Active' || chartStatus === 'Verified' || chartStatus === 'Pending Review') && (
                <DropdownMenuItem onClick={handleArchiveChart} className="cursor-pointer text-amber-600">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Chart
                </DropdownMenuItem>
              )}
              {chartStatus === 'Archived' && (
                <DropdownMenuItem onClick={handleUnarchiveChart} className="cursor-pointer text-green-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore to Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex justify-center">
          <Badge
            className={
              chartStatus === 'Delivered'
                ? 'bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE]'
                : chartStatus === 'Verified'
                ? 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]'
                : chartStatus === 'Pending Review'
                ? 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]'
                : chartStatus === 'Archived'
                ? 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]'
                : 'bg-[#DBEAFE] text-[#0966CC] border-[#BFDBFE]'
            }
          >
            {chartStatus === 'Delivered' ? 'Delivered (Locked)' : 
             chartStatus === 'Verified' ? 'Verified (Ready to Deliver)' : 
             chartStatus === 'Archived' ? '🗄️ Archived' :
             chartStatus}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Review Mode Info */}
          {isReviewMode && canApprove && (
            <div className="bg-[#E0F2FE] border-2 border-[#BFDBFE] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-[#0966CC] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[#0C4A6E] mb-1">Review Mode</h3>
                  <p className="text-sm text-[#0C4A6E]">
                    Review all medications and their verification details. You can approve this chart or request changes from the clinician.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chart Information */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-lg text-[#0f172a] mb-4">Chart Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#64748b]">Chart Type:</span>{' '}
                <span className="text-[#0f172a]">{chartInfo.type}</span>
              </div>
              <div>
                <span className="text-[#64748b]">Created By:</span>{' '}
                <span className="text-[#0f172a]">{chartInfo.createdBy}</span>
              </div>
              <div>
                <span className="text-[#64748b]">Created Date:</span>{' '}
                <span className="text-[#0f172a]">{chartInfo.createdDate}</span>
              </div>
              {chartInfo.finalizedDate && (
                <div>
                  <span className="text-[#64748b]">Finalized Date:</span>{' '}
                  <span className="text-[#0f172a]">{chartInfo.finalizedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Medications Section */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#0f172a]">Medications ({medications.length})</h2>
            </div>

            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg text-[#0f172a] mb-2">{med.drugName}</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm text-[#64748b]">
                        <div>
                          <span className="text-xs text-[#94a3b8]">Strength:</span>{' '}
                          <span className="text-[#0f172a]">{med.strength}</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#94a3b8]">Route:</span>{' '}
                          <span className="text-[#0f172a]">{med.route}</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#94a3b8]">Frequency:</span>{' '}
                          <span className="text-[#0f172a]">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#94a3b8]">Prescriber:</span>{' '}
                          <span className="text-[#0f172a]">{med.prescriber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {med.isVerified && (
                        <Badge className="bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* OCR Confidence Score */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">OCR Confidence:</span>
                    {getConfidenceBadge(med.confidence)}
                    <span className="text-xs text-[#94a3b8] ml-auto">Scanned: {med.scannedDate}</span>
                  </div>

                  {med.notes && (
                    <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                      <p className="text-sm text-[#64748b]">
                        <span className="text-xs text-[#94a3b8]">Notes:</span> {med.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attached Documents */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#0f172a]">Attached Documents</h2>
            </div>
            {attachedDocuments.length > 0 ? (
              <div className="space-y-2">
                {attachedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <Paperclip className="w-4 h-4 text-[#64748b]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0f172a] truncate">{doc.name}</p>
                      <p className="text-xs text-[#94a3b8]">Uploaded: {doc.uploadedDate}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">No documents attached</p>
            )}
          </div>

          {/* Review Actions */}
          {isReviewMode && canApprove && !isLocked && (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-4">
              <h3 className="text-lg text-[#0f172a]">Review Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowReverificationModal(true)}
                  variant="outline"
                  className="flex-1 h-12 border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  onClick={() => setShowApprovalModal(true)}
                  className="flex-1 h-12 bg-[#10B981] hover:bg-[#059669] text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Chart
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={() => navigation.goBack()}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-[#e2e8f0]"
          >
            {isReviewMode ? 'Back to Dashboard' : 'Close'}
          </Button>
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Chart</DialogTitle>
            <DialogDescription>
              Confirm that you have reviewed all medications and want to approve this chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-[#f8fafc] rounded-xl p-4">
              <p className="text-sm text-[#0f172a] mb-2">
                <strong>Patient:</strong> {patient.name}
              </p>
              <p className="text-sm text-[#0f172a] mb-2">
                <strong>Medications:</strong> {medications.length}
              </p>
              <p className="text-sm text-[#0f172a]">
                <strong>Created by:</strong> {chartInfo.createdBy}
              </p>
            </div>
            <div>
              <Label htmlFor="approval-notes">Approval Notes (optional)</Label>
              <Textarea
                id="approval-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="mt-2 rounded-xl border-2 border-[#e2e8f0] min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverification Modal */}
      <Dialog open={showReverificationModal} onOpenChange={setShowReverificationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Send this chart back to the clinician with feedback for reverification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400E]">
                  The clinician will receive your feedback and must reverify the chart before it can be approved.
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="reverification-notes">Feedback for Clinician *</Label>
              <Textarea
                id="reverification-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Describe what needs to be corrected or verified..."
                className="mt-2 rounded-xl border-2 border-[#e2e8f0] min-h-[120px]"
              />
              <p className="text-xs text-[#64748b] mt-2">
                Be specific about which medications or fields need attention.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReverificationModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Send for Reverification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveConfirmation} onOpenChange={setShowArchiveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this chart?
              <br /><br />
              Archived charts can be restored to Active status at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveChart}
              className="h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Chart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unarchive Confirmation Dialog */}
      <AlertDialog open={showUnarchiveConfirmation} onOpenChange={setShowUnarchiveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this chart to Active status?
              <br /><br />
              The chart will be moved from Archived to Active and can be edited again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnarchiveChart}
              className="h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore to Active
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Chart Confirmation Dialog */}
      <AlertDialog open={showUnlockConfirmation} onOpenChange={setShowUnlockConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlock this chart?
              <br /><br />
              <strong className="text-amber-700">⚠️ Warning:</strong> Unlocking will allow the chart to be edited again. This should only be done if corrections are needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnlockChart}
              className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LockOpen className="w-4 h-4 mr-2" />
              Unlock Chart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
