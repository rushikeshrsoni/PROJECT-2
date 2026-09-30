'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  History, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Download,
  Check
} from 'lucide-react';
import { HistoricalIncident } from '@/types/ops';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIncident?: (incident: HistoricalIncident) => void;
  additionalIncidents?: HistoricalIncident[];
}

const DEFAULT_HISTORICAL_INCIDENTS: HistoricalIncident[] = [
  {
    id: 'inc-hist-001',
    taskId: 'TASK-AWS-9921',
    title: 'AWS us-east-1 Cascading DynamoDB Throttling & Lambda Deadlock',
    description: 'Flash-sale burst saturated static 5,000 WCU cap on OrderSessionsTable. 14,200 throttle events/sec caused Lambda queue exhaustion.',
    severity: 'P0_CRITICAL',
    cloudProvider: 'AWS',
    region: 'us-east-1 (N. Virginia)',
    status: 'RESOLVED',
    detectedAt: '2026-09-30 21:14:02',
    resolvedAt: '2026-09-30 21:14:03',
    mttrSeconds: 1.1,
    blastRadiusSaved: 78.4,
    logsCount: 4,
    steps: [
      {
        stepNumber: 1,
        stepType: 'THOUGHT',
        thought: 'Correlating CloudWatch throttle metrics and Lambda timeout alarms. Bottleneck isolated to DynamoDB WCU cap.',
        action: 'Inspect DynamoDB partition telemetry and table describe output.',
        output: '{"TableName": "OrderSessionsTable", "BillingMode": "PROVISIONED", "ThrottledRequests": 14210}'
      },
      {
        stepNumber: 2,
        stepType: 'ACTION',
        thought: 'Triggering atomic billing mode switch to PAY_PER_REQUEST on DynamoDB Table.',
        action: 'Execute aws dynamodb update-table BillingMode=PAY_PER_REQUEST.',
        toolUsed: 'switchDynamoBillingMode',
        output: 'SUCCESS: Table updated to PAY_PER_REQUEST. Auto-scaling across 32 shards engaged.'
      },
      {
        stepNumber: 3,
        stepType: 'PATCH',
        thought: 'Evicting stale retry queue locks from Redis distributed lock cache.',
        action: 'Flush expired retry locks via flushRedisCache.',
        toolUsed: 'flushRedisCache',
        output: '{"locksEvicted": 418, "status": "CACHE_SYNCHRONIZED"}'
      },
      {
        stepNumber: 4,
        stepType: 'VERIFICATION',
        thought: 'Synthetic payment authorizations passing HTTP 200 OK. P99 latency recovered to 24ms. Zero errors.',
        action: 'Emit resolved status and release topology lock.',
        output: '{"status": "RESOLVED", "blastRadius": 0.0, "finalLatencyMs": 24}'
      }
    ]
  },
  {
    id: 'inc-hist-002',
    taskId: 'TASK-K8S-4412',
    title: 'Kubernetes OOMKilled Storm on Gateway Ingress & Connection Drain',
    description: 'Ingress controller pods crashlooping across 3 availability zones due to 512Mi memory cap breach during DDoS.',
    severity: 'P0_CRITICAL',
    cloudProvider: 'KUBERNETES',
    region: 'us-west-2 (Oregon)',
    status: 'RESOLVED',
    detectedAt: '2026-09-30 19:42:15',
    resolvedAt: '2026-09-30 19:42:16',
    mttrSeconds: 1.4,
    blastRadiusSaved: 91.2,
    logsCount: 4,
    steps: [
      {
        stepNumber: 1,
        stepType: 'THOUGHT',
        thought: 'Prometheus KubePodCrashLooping alert received. Kernel cgroup memory limit breached by WebSocket TLS buffers.',
        action: 'Query kubectl pod status in namespace ingress-system.',
        output: '[{"name": "ingress-nginx-01", "exitCode": 137, "reason": "OOMKilled"}]'
      },
      {
        stepNumber: 2,
        stepType: 'ACTION',
        thought: 'Applying dynamic resource mutation: increasing pod memory limits from 512Mi to 4Gi and scaling replicas to 32.',
        action: 'Apply kubectl patch deployment ingress-nginx-controller.',
        toolUsed: 'scaleK8sDeployment',
        output: 'SUCCESS: 32 pods scheduled and healthy on high-memory worker pool.'
      },
      {
        stepNumber: 3,
        stepType: 'PATCH',
        thought: 'Flushing ingress connection drains and restarting proxy worker threads.',
        action: 'Trigger rolling restart with zero connection drop.',
        toolUsed: 'restartService',
        output: 'SUCCESS: 12 workers restarted. Readiness gates 32/32 green.'
      },
      {
        stepNumber: 4,
        stepType: 'VERIFICATION',
        thought: 'Ingress traffic restored across edge load balancers. Latency normalized to 14ms.',
        action: 'Mark incident as RESOLVED.',
        output: '{"status": "RESOLVED", "healthyPods": "32/32"}'
      }
    ]
  },
  {
    id: 'inc-hist-003',
    taskId: 'TASK-DB-8819',
    title: 'PostgreSQL Aurora Primary Connection Pool Saturation',
    description: 'Max active connections ceiling (5,000/5,000) reached. Long-running analytical query PID 48102 holding exclusive row locks.',
    severity: 'P1_HIGH',
    cloudProvider: 'AWS',
    region: 'eu-central-1 (Frankfurt)',
    status: 'RESOLVED',
    detectedAt: '2026-09-30 16:20:00',
    resolvedAt: '2026-09-30 16:20:01',
    mttrSeconds: 1.2,
    blastRadiusSaved: 64.0,
    logsCount: 4,
    steps: [
      {
        stepNumber: 1,
        stepType: 'THOUGHT',
        thought: 'Analyzing pg_stat_activity. PID 48102 has been blocking 4,890 write queries for >18 minutes.',
        action: 'Run lock contention query on postgres primary.',
        output: '{"blockingPid": 48102, "query": "SELECT * FROM core_accounts ... FOR UPDATE"}'
      },
      {
        stepNumber: 2,
        stepType: 'ACTION',
        thought: 'Terminating rogue analytical query PID 48102 and isolating transactional pool.',
        action: 'Invoke pg_terminate_backend(48102).',
        toolUsed: 'checkDatabaseConnections',
        output: 'SUCCESS: PID 48102 terminated. 4,890 transactions released.'
      },
      {
        stepNumber: 3,
        stepType: 'PATCH',
        thought: 'Diverting analytical queries to Read Replica pool aurora-pg-ro-01.',
        action: 'Update DNS service routing table.',
        toolUsed: 'flushRedisCache',
        output: 'SUCCESS: Analytical routing rules applied.'
      },
      {
        stepNumber: 4,
        stepType: 'VERIFICATION',
        thought: 'Active connections normalized to 240/5,000. Latency recovered to 18ms.',
        action: 'Confirm incident resolution.',
        output: '{"activeConnections": "240/5000", "p99Latency": "18ms"}'
      }
    ]
  }
];

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  additionalIncidents = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<HistoricalIncident | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const allIncidents = [...additionalIncidents, ...DEFAULT_HISTORICAL_INCIDENTS];
  const filtered = allIncidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.cloudProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.taskId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportIncident = (incident: HistoricalIncident) => {
    const blob = new Blob([JSON.stringify(incident, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherops-incident-${incident.taskId.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedId(incident.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-950/60 border border-violet-800/60 text-violet-300">
              <History className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Incident History & Cryptographic Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Audited autonomous ReAct remediations recorded in Supabase <code className="text-cyan-400 font-mono">tasks</code> table.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical incidents by title, cloud provider, or task ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <History className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
              <p className="text-sm font-semibold text-slate-400">No matching incidents found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            filtered.map((incident) => {
              const isP0 = incident.severity.includes('P0');

              return (
                <div
                  key={incident.id}
                  className="glass-card rounded-xl p-4 border border-slate-800 hover:border-violet-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isP0 ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        }`}>
                          {incident.severity.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 font-semibold">
                          {incident.cloudProvider} • {incident.region}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {incident.taskId}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => setSelectedIncident(incident)}>
                        {incident.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center space-x-1.5">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>RESOLVED</span>
                      </span>
                    </div>
                  </div>

                  {/* Incident Stats Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span>MTTR: <strong className="text-cyan-400">{incident.mttrSeconds}s</strong></span>
                      <span>Blast Saved: <strong className="text-emerald-400">{incident.blastRadiusSaved}%</strong></span>
                      <span className="text-slate-500">{incident.detectedAt}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportIncident(incident)}
                        className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        {copiedId === incident.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Exported</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 text-slate-400" />
                            <span>Export Audit</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="p-1 px-2.5 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 text-[10px] font-semibold border border-violet-800/60 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Inspect ReAct Logs ({incident.steps.length})</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Detailed Step-by-Step ReAct Inspector */}
        <AnimatePresence>
          {selectedIncident && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[85vh] glass-card rounded-2xl border border-slate-700 p-6 flex flex-col shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                      ReAct Execution Log Audit
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {selectedIncident.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1">
                  {selectedIncident.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-bold text-[10px]">
                          STEP {step.stepNumber}: {step.stepType}
                        </span>
                        {step.toolUsed && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                            Tool: {step.toolUsed}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-300 leading-relaxed font-sans">
                        {step.thought}
                      </p>

                      <div className="p-2 rounded-lg bg-black/70 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{step.output}</pre>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                  >
                    Close Inspector
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
