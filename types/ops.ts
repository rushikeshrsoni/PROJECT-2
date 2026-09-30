/**
 * AetherOps AI - Strict TypeScript Interfaces
 * Autonomous Cloud Infrastructure Incident Remediation Engine
 */

export type IncidentSeverity = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export type IncidentStatus = 
  | 'DETECTED'
  | 'TRIAGING'
  | 'ISOLATING'
  | 'REMEDIATING'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'ESCALATED';

export type ReActStepType = 
  | 'THOUGHT'       // Reason: Agent reasoning on current state
  | 'ACTION'        // Act: Executing infrastructure tool/command
  | 'OBSERVATION'   // Observe: Analyzing command telemetry/output
  | 'PATCH'         // Apply: Modifying cloud topology, configs, or autoscaling
  | 'VERIFICATION'; // Verify: Ensuring latency/health recovery

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE' | 'KUBERNETES' | 'HYBRID';

export interface AgentMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  change: string;
  isPositive: boolean;
}

export interface AgentLog {
  id: string;
  taskId: string;
  timestamp: string;
  stepType: ReActStepType;
  title: string;
  content: string;
  toolExecuted?: string;
  toolParameters?: Record<string, unknown>;
  commandOutput?: string;
  confidenceScore: number; // 0.0 - 1.0
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export interface Task {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  cloudProvider: CloudProvider;
  region: string;
  affectedServices: string[];
  blastRadiusPercentage: number;
  detectedAt: string;
  resolvedAt?: string;
  rootCauseHypothesis: string;
  autoRemediateEnabled: boolean;
  agentLogs: AgentLog[];
  metrics: {
    errorRate: number; // percentage
    p99LatencyMs: number;
    cpuSaturation: number; // percentage
    healthyReplicas: string;
  };
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  severity: IncidentSeverity;
  cloudProvider: CloudProvider;
  region: string;
  affectedServices: string[];
  initialBlastRadius: number;
  summary: string;
  rootCause: string;
  suggestedPatch: string;
  initialTask: Task;
  simulatedLogs: (Omit<AgentLog, 'id' | 'taskId' | 'timestamp'> & { timestamp?: string })[];
  targetResolution: {
    finalErrorRate: number;
    finalP99Latency: number;
    verificationNotes: string;
  };
}

export interface JudgeEvaluationMetric {
  autonomousResolutionTimeSec: number;
  blastRadiusContainmentSec: number;
  reActLoopIterations: number;
  humanInterventionRequired: boolean;
  confidenceThresholdMet: boolean;
  complianceValidationPassed: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'Judge/Evaluator' | 'Site Reliability Engineer' | 'SecOps Admin' | 'Cloud Architect';
  isDemo: boolean;
  fullName?: string;
  avatarUrl?: string;
  organization?: string;
  demoSessionStartedAt?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token?: string;
  expiresAt?: string;
  isDemo: boolean;
}
