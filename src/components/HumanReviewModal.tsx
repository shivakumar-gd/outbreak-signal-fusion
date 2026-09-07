import React, { useState } from 'react';
import { Check, ShieldAlert, UserCheck, X } from 'lucide-react';
import { FusionResult, HumanReviewRecord, ReviewStatus } from '../types';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fusionResult: FusionResult;
  existingReview?: HumanReviewRecord;
  onSaveReview: (review: HumanReviewRecord) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  fusionResult,
  existingReview,
  onSaveReview,
}) => {
  if (!isOpen) return null;

  const [status, setStatus] = useState<ReviewStatus>(
    existingReview?.status || 'UNDER_INVESTIGATION'
  );
  const [reviewerName, setReviewerName] = useState(
    existingReview?.reviewerName || 'Dr. E. Vance, Epidemiologist'
  );
  const [decisionNotes, setDecisionNotes] = useState(
    existingReview?.decisionNotes ||
      `Corroborated elevated ${fusionResult.primaryDriver} signals in ${fusionResult.zone}. Initiating targeted rapid antigen screening protocol.`
  );
  const [escalatedTo, setEscalatedTo] = useState(
    existingReview?.escalatedTo || 'Public Health Supervisor — Emergency Ops'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HumanReviewRecord = {
      id: existingReview?.id || `rev-${fusionResult.zone}-${fusionResult.dayIndex}-${Date.now()}`,
      zone: fusionResult.zone,
      dayIndex: fusionResult.dayIndex,
      date: fusionResult.date,
      alertLevel: fusionResult.alertLevel,
      status,
      reviewerName,
      reviewedAt: new Date().toISOString(),
      decisionNotes,
      escalatedTo: status === 'ESCALATED' ? escalatedTo : undefined,
    };
    onSaveReview(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-base font-semibold text-white">
                Human Analyst Review Workflow
              </h3>
              <p className="text-xs text-slate-400">
                {fusionResult.zone} • Day {fusionResult.dayIndex} ({fusionResult.date}) • Alert Level:{' '}
                <strong className="text-amber-300">{fusionResult.alertLevel}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Status Selector */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Review Classification & Decision:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'UNDER_INVESTIGATION' as ReviewStatus,
                  label: 'Under Investigation',
                  desc: 'Assigned analyst reviewing clinic & lab queues',
                },
                {
                  id: 'ESCALATED' as ReviewStatus,
                  label: 'Escalate to Supervisor',
                  desc: 'High severity; requires city command action',
                },
                {
                  id: 'PENDING_REVIEW' as ReviewStatus,
                  label: 'Pending Review',
                  desc: 'Awaiting secondary confirmation logs',
                },
                {
                  id: 'DISMISSED' as ReviewStatus,
                  label: 'Dismiss as Artifact',
                  desc: 'Verified data entry glitch or retail campaign',
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStatus(item.id)}
                  className={`p-2.5 text-left rounded-lg border transition-colors ${
                    status === item.id
                      ? 'bg-teal-950/60 border-teal-500 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Reviewing Health Official:</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Decision Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Epidemiological Findings & Notes:
            </label>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-teal-500"
              placeholder="Detail reasons for decision, lab batch IDs checked, and requested actions..."
              required
            />
          </div>

          {/* Conditional Escalation Target */}
          {status === 'ESCALATED' && (
            <div>
              <label className="block font-medium text-rose-300 mb-1">
                Escalation Target / Authority:
              </label>
              <input
                type="text"
                value={escalatedTo}
                onChange={(e) => setEscalatedTo(e.target.value)}
                className="w-full bg-slate-950 border border-rose-800/80 rounded-md px-3 py-2 text-white outline-none focus:border-rose-500"
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-md shadow transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Record Official Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
