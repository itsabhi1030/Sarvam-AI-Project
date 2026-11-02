import React from 'react';
import { Sparkles, AlertOctagon, Play } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../constants/demoScenarios';

interface StageScenarioBarProps {
  isProcessing: boolean;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const StageScenarioBar: React.FC<StageScenarioBarProps> = ({
  isProcessing,
  onSelectScenario
}) => {
  return (
    <div className="w-full bg-[#080D1A]/60 backdrop-blur-sm border-b border-slate-800/60 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Quick Scenarios:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            disabled={isProcessing}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border disabled:opacity-50 ${
              scenario.isAlert
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40 hover:border-rose-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            {scenario.isAlert ? (
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <Play className="w-3 h-3 text-cyan-400" />
            )}
            <span>{scenario.title}</span>
            <span className="text-[10px] text-slate-500 font-normal">({scenario.badge.split('•')[1]?.trim() || 'Demo'})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
