import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Database,
  FileText,
  FlaskConical,
  Layers,
  MapPin,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  BenchmarkRecord,
  FailureScenarioType,
  FusionResult,
  HumanReviewRecord,
  JourneyScenarioType,
  SourceReliability,
  SourceType,
  ZoneDailySignals,
  ZoneId,
  ZONES,
} from './types';
import { generateSyntheticDataset } from './core/synthetic/generator';
import { groupSignalsByZone } from './core/pipeline/processor';
import { calculateSourceReliability } from './core/reliability/scorer';
import { evaluateZoneDay } from './core/detection/detector';
import { runEmpiricalExperiment } from './core/experiment/benchmark';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { ZoneMapGrid } from './components/ZoneMapGrid';
import { SignalTrendChart } from './components/SignalTrendChart';
import { SourceReliabilityPanel } from './components/SourceReliabilityPanel';
import { AlertEvidenceDrawer } from './components/AlertEvidenceDrawer';
import { HumanReviewModal } from './components/HumanReviewModal';
import { ExperimentView } from './components/ExperimentView';
import { FailureSimulator } from './components/FailureSimulator';
import { DocumentationModal } from './components/DocumentationModal';

export default function App() {
  // Navigation & Control States
  const [currentDay, setCurrentDay] = useState<number>(54); // Day 54 is where Cluster 1 fusion alert fires!
  const [selectedZone, setSelectedZone] = useState<ZoneId>('Zone B');
  const [scenario, setScenario] = useState<FailureScenarioType>('STANDARD');
  const [journey, setJourney] = useState<JourneyScenarioType>('NONE');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'EXPERIMENT' | 'FAILURES'>('MONITOR');
  const [docsModalOpen, setDocsModalOpen] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);

  // Human Review store
  const [humanReviews, setHumanReviews] = useState<Record<string, HumanReviewRecord>>({
    'Zone B-54': {
      id: 'rev-init-1',
      zone: 'Zone B',
      dayIndex: 54,
      date: '2026-08-02',
      alertLevel: 'ALERT',
      status: 'UNDER_INVESTIGATION',
      reviewerName: 'Dr. M. Chen, Lead Epidemiologist',
      reviewedAt: '2026-08-02T14:30:00Z',
      decisionNotes:
        'Concur with multi-source early warning. High citizen symptom reports confirmed by OTC antipyretic spike in North District pharmacy chains. Mobile specimen teams deployed to senior centers.',
    },
  });

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 90;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Handle Preset Journey Selections
  const handleJourneySelect = (selectedJourney: JourneyScenarioType) => {
    setJourney(selectedJourney);
    if (selectedJourney === 'JOURNEY_A') {
      // High urgency in Zone B
      setSelectedZone('Zone B');
      setCurrentDay(54);
      setActiveTab('MONITOR');
    } else if (selectedJourney === 'JOURNEY_B') {
      // Low urgency watch in Zone D
      setSelectedZone('Zone D');
      setCurrentDay(68);
      setActiveTab('MONITOR');
    }
  };

  // Generate synthetic dataset based on scenario
  const dataset = useMemo(() => {
    return generateSyntheticDataset(scenario);
  }, [scenario]);

  const groupedDataset = useMemo(() => {
    return groupSignalsByZone(dataset);
  }, [dataset]);

  // Current date string
  const currentDateStr = useMemo(() => {
    const record = dataset.find((d) => d.dayIndex === currentDay);
    return record ? record.date : `Day ${currentDay}`;
  }, [dataset, currentDay]);

  // Calculate Fusion Results for ALL zones on currentDay
  const currentDayZoneResults = useMemo(() => {
    const results: Record<ZoneId, FusionResult> = {} as any;
    for (const z of ZONES) {
      const history = groupedDataset[z];
      results[z] = evaluateZoneDay(history, currentDay, z);
    }
    return results;
  }, [groupedDataset, currentDay]);

  // Calculate Source Reliabilities for selected zone on currentDay
  const currentSourceReliabilities = useMemo(() => {
    const history = groupedDataset[selectedZone];
    const rels: Record<SourceType, SourceReliability> = {
      clinic: calculateSourceReliability(history, currentDay, 'clinic'),
      pharmacy: calculateSourceReliability(history, currentDay, 'pharmacy'),
      citizen: calculateSourceReliability(history, currentDay, 'citizen'),
      laboratory: calculateSourceReliability(history, currentDay, 'laboratory'),
    };
    return rels;
  }, [groupedDataset, selectedZone, currentDay]);

  // Pre-calculate all 90-day fusion results for selectedZone (for the trend chart)
  const selectedZoneFusionHistory = useMemo(() => {
    const history = groupedDataset[selectedZone] || [];
    const results: FusionResult[] = [];
    for (let day = 1; day <= 90; day++) {
      results.push(evaluateZoneDay(history, day, selectedZone));
    }
    return results;
  }, [groupedDataset, selectedZone]);

  // Empirical Benchmark Experiment Evaluation
  const [experimentRecords, setExperimentRecords] = useState<BenchmarkRecord[]>([]);

  useEffect(() => {
    const exp = runEmpiricalExperiment(scenario, dataset);
    setExperimentRecords(exp.records);
  }, [scenario, dataset]);

  const handleRerunExperiment = () => {
    const exp = runEmpiricalExperiment(scenario, dataset);
    setExperimentRecords(exp.records);
  };

  const handleSaveReview = (review: HumanReviewRecord) => {
    const key = `${review.zone}-${review.dayIndex}`;
    setHumanReviews((prev) => ({ ...prev, [key]: review }));
  };

  const currentReviewKey = `${selectedZone}-${currentDay}`;
  const activeHumanReview = humanReviews[currentReviewKey];
  const activeFusionResult = currentDayZoneResults[selectedZone];
  const activeZoneHistory = groupedDataset[selectedZone] || [];
  const currentRecord = activeZoneHistory.find((r) => r.dayIndex === currentDay) || activeZoneHistory[0];

  const leadTimeAdvantage = experimentRecords[0]?.leadTimeAdvantageDays ?? 5;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Header */}
      <Header
        currentDay={currentDay}
        currentDate={currentDateStr}
        onDayChange={(d) => setCurrentDay(d)}
        scenario={scenario}
        onScenarioChange={(s) => setScenario(s)}
        journey={journey}
        onJourneySelect={handleJourneySelect}
        onOpenDocs={() => setDocsModalOpen(true)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-[97px] z-20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 py-2 text-xs">
            <button
              onClick={() => setActiveTab('MONITOR')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'MONITOR'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Surveillance Dashboard &amp; Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('EXPERIMENT')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'EXPERIMENT'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Empirical Experiment (TTD Evaluation)</span>
            </button>

            <button
              onClick={() => setActiveTab('FAILURES')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'FAILURES'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Failure Test Scenarios (3 Cases)</span>
            </button>
          </div>

          {/* Quick Status Notice */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>District In Focus: <strong className="text-white">{selectedZone}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-teal-300">
              Score: {(activeFusionResult?.fusionScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {activeTab === 'MONITOR' && (
          <>
            {/* Top KPI Cards */}
            <KPICards
              zoneResults={currentDayZoneResults}
              sourceReliabilities={currentSourceReliabilities}
              onSelectZone={(z) => setSelectedZone(z)}
              leadTimeAdvantage={leadTimeAdvantage}
            />

            {/* Geographic District Matrix */}
            <ZoneMapGrid
              selectedZone={selectedZone}
              onSelectZone={(z) => setSelectedZone(z)}
              zoneResults={currentDayZoneResults}
            />

            {/* Synchronized Multi-Source Trend Visualizer */}
            <SignalTrendChart
              selectedZone={selectedZone}
              zoneHistory={activeZoneHistory}
              zoneFusionResults={selectedZoneFusionHistory}
              currentDay={currentDay}
              onSelectDay={(d) => setCurrentDay(d)}
            />

            {/* Source Reliability & Freshness Matrix */}
            <SourceReliabilityPanel reliabilities={currentSourceReliabilities} />

            {/* Alert Evidence & Human Review Drawer */}
            {activeFusionResult && (
              <AlertEvidenceDrawer
                fusionResult={activeFusionResult}
                currentDayRecord={currentRecord}
                humanReview={activeHumanReview}
                onOpenReviewModal={() => setReviewModalOpen(true)}
              />
            )}
          </>
        )}

        {activeTab === 'EXPERIMENT' && (
          <ExperimentView
            records={experimentRecords}
            onRerun={handleRerunExperiment}
          />
        )}

        {activeTab === 'FAILURES' && (
          <FailureSimulator
            scenario={scenario}
            onSelectScenario={(sc) => {
              setScenario(sc);
              if (sc === 'MISSING_CLINIC') {
                setSelectedZone('Zone B');
                setCurrentDay(55);
              } else if (sc === 'STALE_LAB') {
                setSelectedZone('Zone D');
                setCurrentDay(72);
              } else if (sc === 'CONFLICTING_SIGNALS') {
                setSelectedZone('Zone C');
                setCurrentDay(46);
              }
            }}
            onSelectJourney={handleJourneySelect}
          />
        )}
      </main>

      {/* Human Review Modal */}
      {activeFusionResult && (
        <HumanReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          fusionResult={activeFusionResult}
          existingReview={activeHumanReview}
          onSaveReview={handleSaveReview}
        />
      )}

      {/* Documentation & Specifications Modal */}
      <DocumentationModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <span>Municipal Infectious Disease Signal Fusion System</span>
            <span className="mx-2">•</span>
            <span>City Health Department Surveillance Division</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              Synthetic De-identified Data Only (No PII / PHI)
            </span>
            <button
              onClick={() => setDocsModalOpen(true)}
              className="text-teal-400 hover:text-teal-300 transition-colors underline"
            >
              Methodology Specifications
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

