import React, { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Building2, Pill, TestTube2, Users, Layers, Sliders } from 'lucide-react';
import { FusionResult, ZoneDailySignals, ZoneId } from '../types';

interface SignalTrendChartProps {
  selectedZone: ZoneId;
  zoneHistory: ZoneDailySignals[];
  zoneFusionResults: FusionResult[];
  currentDay: number;
  onSelectDay: (day: number) => void;
}

export const SignalTrendChart: React.FC<SignalTrendChartProps> = ({
  selectedZone,
  zoneHistory,
  zoneFusionResults,
  currentDay,
  onSelectDay,
}) => {
  const [viewMode, setViewMode] = useState<'NORMALIZED' | 'RAW'>('NORMALIZED');

  // Build combined chart data
  const chartData = zoneHistory.map((h) => {
    const fRes = zoneFusionResults.find((r) => r.dayIndex === h.dayIndex);
    return {
      day: h.dayIndex,
      date: h.date,
      // Raw values
      clinicRaw: h.clinic.isMissing ? null : h.clinic.suspectedCases,
      pharmacyRaw: h.pharmacy.isMissing ? null : h.pharmacy.salesCount,
      citizenRaw: h.citizen.isMissing ? null : h.citizen.reportCount,
      labPosRateRaw: h.laboratory.isMissing || h.laboratory.positivityRate === null ? null : Number((h.laboratory.positivityRate * 100).toFixed(1)),
      // Normalized Anomaly Indices (0.00 to 1.00)
      clinicNorm: fRes?.sourceAnomalies?.clinic?.normalizedAnomaly ?? null,
      pharmacyNorm: fRes?.sourceAnomalies?.pharmacy?.normalizedAnomaly ?? null,
      citizenNorm: fRes?.sourceAnomalies?.citizen?.normalizedAnomaly ?? null,
      labNorm: fRes?.sourceAnomalies?.laboratory?.normalizedAnomaly ?? null,
      fusionScore: fRes ? fRes.fusionScore : null,
      alertLevel: fRes ? fRes.alertLevel : 'NORMAL',
      baselineTriggered: fRes ? fRes.baselineTriggered : false,
    };
  });

  const isZoneBCluster = selectedZone === 'Zone B';
  const isZoneDCluster = selectedZone === 'Zone D';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Surveillance Stream Trends — {selectedZone}
            </h3>
            <span className="px-2 py-0.5 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700">
              90-Day Time Horizon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click anywhere on the chart to scrub simulation timeline to that calendar day
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('NORMALIZED')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'NORMALIZED'
                ? 'bg-teal-500/20 text-teal-300 font-medium border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Normalized Index (0–1)</span>
          </button>
          <button
            onClick={() => setViewMode('RAW')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'RAW'
                ? 'bg-teal-500/20 text-teal-300 font-medium border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Raw Surveillance Counts</span>
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const day = e.activePayload[0].payload?.day;
                if (day) onSelectDay(day);
              }
            }}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => `Day ${v}`}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={viewMode === 'NORMALIZED' ? [0, 1] : ['auto', 'auto']}
              tickFormatter={(v) => (viewMode === 'NORMALIZED' ? v.toFixed(1) : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: any, name: string) => {
                if (value === null || value === undefined) return ['Missing', name];
                if (viewMode === 'NORMALIZED') return [Number(value).toFixed(2), name];
                if (name.includes('Positivity')) return [`${value}%`, name];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                const item = payload[0]?.payload;
                return `Day ${label} (${item?.date || ''})`;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />

            {/* Injected Cluster Onset Markers */}
            {isZoneBCluster && (
              <ReferenceLine
                x={52}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'Cluster 1 Onset (T₀ Day 52)',
                  fill: '#fda4af',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}
            {isZoneDCluster && (
              <ReferenceLine
                x={65}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'Cluster 2 Onset (T₀ Day 65)',
                  fill: '#fcd34d',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {/* Current Day Scrubber Line */}
            <ReferenceLine
              x={currentDay}
              stroke="#2dd4bf"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `Selected Day ${currentDay}`,
                fill: '#2dd4bf',
                fontSize: 10,
                position: 'top',
              }}
            />

            {/* Normalized View Lines */}
            {viewMode === 'NORMALIZED' && (
              <>
                <ReferenceLine
                  y={0.60}
                  stroke="#f97316"
                  strokeDasharray="3 3"
                  label={{ value: 'Alert (0.60)', fill: '#fb923c', fontSize: 10 }}
                />
                <ReferenceLine
                  y={0.80}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{ value: 'Critical (0.80)', fill: '#fb7185', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="citizenNorm"
                  name="Citizen Anomaly Index (Fastest)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pharmacyNorm"
                  name="Pharmacy Anomaly Index"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="clinicNorm"
                  name="Clinic Anomaly Index"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="labNorm"
                  name="Laboratory Anomaly Index"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="fusionScore"
                  name="Composite Fusion Score"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={false}
                />
              </>
            )}

            {/* Raw Surveillance Counts */}
            {viewMode === 'RAW' && (
              <>
                <Line
                  type="monotone"
                  dataKey="citizenRaw"
                  name="Citizen Reports (Counts)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pharmacyRaw"
                  name="Pharmacy OTC Sales (Units)"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="clinicRaw"
                  name="Clinic Suspected (Cases)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="labPosRateRaw"
                  name="Lab Positivity Rate (%)"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Sequence Guide */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span><strong>Citizen</strong>: Lag ~8h (Pre-clinical)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span><strong>Pharmacy</strong>: Lag ~24h (Symptomatic)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span><strong>Clinic</strong>: Lag ~48h (Doctor visit)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <TestTube2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span><strong>Laboratory</strong>: Lag ~96h (PCR confirm)</span>
        </div>
      </div>
    </div>
  );
};
