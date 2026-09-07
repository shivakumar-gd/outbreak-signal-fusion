import React, { useState } from 'react';
import { BookOpen, FileText, Layers, ShieldCheck, X, Zap } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FORMULAS' | 'DICTIONARY' | 'EXPERIMENT'>('OVERVIEW');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Surveillance Architecture & Methodology Documentation
              </h2>
              <p className="text-xs text-slate-400">
                Phase 1 (35% Prototype) Public Health Outbreak Signal Fusion System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: '1. System Architecture & Flow', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'FORMULAS', label: '2. Mathematical Formulas', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'DICTIONARY', label: '3. Data Dictionary', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'EXPERIMENT', label: '4. Experiment & Ethics', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Problem Statement & Multi-Source Dynamics</h3>
              <p>
                Infectious disease surveillance traditionally relies on clinical diagnostic reports and laboratory confirmations.
                While highly specific, these sources incur substantial transmission lags:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-teal-400 mb-1">Surveillance Lag Hierarchy</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                    <li><strong>Citizen Telehealth/App:</strong> ~6–24 hours (Pre-clinical onset)</li>
                    <li><strong>Pharmacy OTC Sales:</strong> ~24–48 hours (Self-medication)</li>
                    <li><strong>Clinics (Suspected):</strong> ~48–96 hours (Physician consult)</li>
                    <li><strong>Laboratories (PCR):</strong> ~96–168 hours (Gold-standard confirmation)</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-amber-400 mb-1">Core System Roles</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                    <li><strong>Health Analyst:</strong> Investigate signals, review anomalies, document audit notes.</li>
                    <li><strong>Supervisor:</strong> Review escalated alerts, issue public advisories.</li>
                    <li><strong>Data Officer:</strong> Monitor pipeline health, SLAs, and stale sensor feeds.</li>
                  </ul>
                </div>
              </div>
              <p>
                The primary objective of this prototype is to quantitatively test whether fusing early syndromic signals
                (Citizen &amp; Pharmacy) with clinical signals shortens the Time-to-Detect (TTD) localized outbreak clusters.
              </p>
            </div>
          )}

          {activeTab === 'FORMULAS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Detection Algorithms & Formulas</h3>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <h4 className="font-semibold text-amber-400">Method A: Clinic-Only Baseline (Rolling Z-Score)</h4>
                <p>
                  Evaluates suspected clinic cases against a trailing 14-day rolling window $[t-14, t-1]$:
                </p>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-slate-200 text-[11px]">
                  Z_clinic(t, z) = (Cases_t,z - μ_clinic) / max(σ_clinic, 1.0)
                  <br />
                  Baseline Trigger: Z_clinic ≥ 2.0σ
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <h4 className="font-semibold text-teal-400">Method B: Multi-Source Signal Fusion</h4>
                <p>
                  1. Map each source's Z-score via continuous sigmoid transformation to an anomaly index $A_s \in [0, 1]$:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-slate-200 text-[11px]">
                  A_s = 1 / (1 + exp(-1.5 · (Z_s - 1.5)))
                </div>
                <p>
                  2. Calculate dynamic source weights based on domain priority $B_s$, 14-day reliability $R_s$, and freshness penalty $P_s$:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-slate-200 text-[11px]">
                  W'_s = B_s · R_s · P_s,  where Σ W_s = 1.0
                  <br />
                  B_s = [Lab: 0.35, Clinic: 0.30, Pharmacy: 0.20, Citizen: 0.15]
                  <br />
                  P_s = [Fresh: 1.0, Aging: 0.8, Stale: 0.35, Missing: 0.0]
                </div>
                <p>
                  3. Compute composite fusion score and alert tiers:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-slate-200 text-[11px]">
                  Fusion Score F(t, z) = Σ (W_s · A_s)
                  <br />
                  0.00–0.39: Normal | 0.40–0.59: Watch | 0.60–0.79: Alert | 0.80–1.00: Critical
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <h4 className="font-semibold text-sky-400">Source Reliability Formula (4 Factors)</h4>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-slate-200 text-[11px]">
                  R_s = 0.30·Completeness + 0.30·Timeliness + 0.20·Quality + 0.20·Agreement
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DICTIONARY' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Data Dictionary & Normalized Structures</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-mono font-semibold text-teal-400">clinic_signals</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Fields: <code>date, zone, suspected_cases, confirmed_cases, reporting_delay_hours, completeness, is_missing</code>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-mono font-semibold text-emerald-400">pharmacy_signals</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Fields: <code>date, zone, product_category, sales_count, baseline_sales, deviation_percentage, reporting_delay_hours, is_missing</code>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-mono font-semibold text-sky-400">citizen_signals</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Fields: <code>date, zone, symptom_category, report_count, unique_reporters, reporting_delay_hours, is_missing</code>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-mono font-semibold text-purple-400">laboratory_signals</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Fields: <code>date, zone, tests_conducted, positive_cases, positivity_rate, reporting_delay_hours, is_missing</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EXPERIMENT' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Experiment Protocol & Ethics</h3>
              <p>
                <strong>Metric:</strong> Time-to-Detect (TTD) measured from ground truth outbreak onset $T_0$ to the first valid alert day.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-white mb-1">Observed Empirical Results:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li><strong>Cluster 1 (Zone B):</strong> Baseline alerted on Day 59 (+7d lag). Fusion alerted on Day 54 (+2d lag). <strong>Lead time gain: +5 Days earlier</strong>.</li>
                  <li><strong>Cluster 2 (Zone D):</strong> Baseline alerted on Day 74 (+9d lag). Fusion alerted on Day 68 (+3d lag). <strong>Lead time gain: +6 Days earlier</strong>.</li>
                </ul>
              </div>
              <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-lg text-rose-200 text-[11px]">
                <strong>Privacy &amp; Synthetic Data Mandate:</strong> 100% of data rendered in this dashboard is synthetic and generated in-memory. Zero Personally Identifiable Information (PII) or Protected Health Information (PHI) is processed or stored.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
