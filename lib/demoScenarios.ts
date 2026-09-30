/**
 * AetherOps AI - Preloaded High-Stakes Cloud Incident Scenarios
 * For Judge/Evaluator demonstration and ReAct Autonomous Cycle Execution
 */

import { DemoScenario } from '@/types/ops';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'aws-dynamo-throttle-p0',
    title: 'AWS us-east-1 Cascading DynamoDB Throttling & Lambda Deadlock',
    subtitle: 'Flash-sale concurrency spike exceeding static WCU cap with synchronous blocking lambdas',
    severity: 'P0_CRITICAL',
    cloudProvider: 'AWS',
    region: 'us-east-1 (N. Virginia)',
    affectedServices: ['payments-processor', 'checkout-api-gateway', 'dynamodb-orders', 'sqs-retry-queue'],
    initialBlastRadius: 78.4,
    summary: 'Ingress checkout payments failing with HTTP 504 Gateway Timeout. 14,200 DynamoDB throttle events/sec causing downstream Lambda concurrency exhaustion.',
    rootCause: 'Static 5,000 WCU provisioned capacity saturated by flash-sale burst; CloudWatch autoscaling alarm trapped in 5-minute cooldown lag.',
    suggestedPatch: 'Switch DynamoDB billing mode to PAY_PER_REQUEST, isolate connection pool, and throttle non-critical background sync tasks.',
    initialTask: {
      id: 'task-aws-001',
      incidentId: 'INC-AWS-88219',
      title: 'Cascading DynamoDB Throttling on OrderSessionsTable',
      description: 'Critical payment checkout pipeline failing. Error rate 43.8%, P99 latency spike to 3,420ms.',
      severity: 'P0_CRITICAL',
      status: 'DETECTED',
      cloudProvider: 'AWS',
      region: 'us-east-1',
      affectedServices: ['payments-processor', 'checkout-api-gateway', 'dynamodb-orders', 'sqs-retry-queue'],
      blastRadiusPercentage: 78.4,
      detectedAt: 'Just now',
      rootCauseHypothesis: 'Analyzing CloudWatch metrics & X-Ray traces for database contention...',
      autoRemediateEnabled: true,
      agentLogs: [],
      metrics: {
        errorRate: 43.8,
        p99LatencyMs: 3420,
        cpuSaturation: 89.2,
        healthyReplicas: '24 / 96'
      }
    },
    simulatedLogs: [
      {
        stepType: 'THOUGHT',
        title: 'Triaging Ingress HTTP 504 Anomaly & Telemetry Ingestion',
        content: 'Analyzing APM stream across 4 affected microservices. HTTP 504 error rate at 43.8% on `/v2/checkout/authorize`. Lambda execution duration spiked to 14.8s (timeout threshold 15s). Hypothesizing downstream database write queue saturation.',
        confidenceScore: 0.94,
        latencyMs: 120,
        metadata: { source: 'CloudWatch Alarms', anomalyScore: '0.98' }
      },
      {
        stepType: 'ACTION',
        title: 'Executing CloudWatch & DynamoDB Diagnostic Probe',
        content: 'Querying DynamoDB metric dimensions for `OrderSessionsTable` and inspecting active Lambda pool concurrency.',
        toolExecuted: 'aws.dynamodb.describe_table + aws.cloudwatch.get_metric_data',
        toolParameters: {
          tableName: 'OrderSessionsTable',
          metricNames: ['UserErrors', 'ThrottledRequests', 'WriteThrottleEvents'],
          period: 60
        },
        commandOutput: '{\n  "TableName": "OrderSessionsTable",\n  "BillingMode": "PROVISIONED",\n  "ProvisionedThroughput": { "ReadCapacityUnits": 5000, "WriteCapacityUnits": 5000 },\n  "ThrottledRequests": 14210,\n  "AccountMaxWCU": 80000\n}',
        confidenceScore: 0.98,
        latencyMs: 340
      },
      {
        stepType: 'OBSERVATION',
        title: 'Root Cause Confirmed: Provisioned Capacity Saturation',
        content: 'DynamoDB returned 14,210 WriteThrottleEvents/sec. The table is locked into fixed 5,000 WCU mode with target tracking scaling lag. Lambda workers are backlogged in retries, causing socket starvation on the API Gateway.',
        confidenceScore: 0.99,
        latencyMs: 80
      },
      {
        stepType: 'THOUGHT',
        title: 'Formulating Autonomous Remediation Plan',
        content: 'Plan: (1) Instantly switch DynamoDB billing mode to PAY_PER_REQUEST (On-Demand) via AWS API. (2) Drain Lambda dead-letter backlog with backoff jitter. (3) Temporarily rate-limit unauthenticated telemetry probes to preserve payment bandwidth.',
        confidenceScore: 0.96,
        latencyMs: 140
      },
      {
        stepType: 'PATCH',
        title: 'Applying Autonomous Infrastructure Hot-Patch',
        content: 'Executing atomic update on DynamoDB Table billing mode and tuning API Gateway concurrency throttle.',
        toolExecuted: 'aws.dynamodb.update_table(BillingMode="PAY_PER_REQUEST")',
        toolParameters: {
          TableName: 'OrderSessionsTable',
          BillingMode: 'PAY_PER_REQUEST',
          Tags: [{ Key: 'RemediatedBy', Value: 'AetherOps-AI-ReAct-Engine' }]
        },
        commandOutput: 'SUCCESS: Table OrderSessionsTable updated to PAY_PER_REQUEST. Partition autoscaling engaged across 32 shards.',
        confidenceScore: 0.99,
        latencyMs: 480
      },
      {
        stepType: 'VERIFICATION',
        title: 'Remediation Verified: P99 Latency & Error Rate Normalized',
        content: 'Continuous synthetic health probes (500 req/sec) passing with HTTP 200 OK. DynamoDB throttling collapsed to 0/sec. P99 latency dropped from 3,420ms to 42ms. Blast radius reduced to 0.0%. Incident resolved autonomously.',
        confidenceScore: 0.998,
        latencyMs: 210,
        metadata: { status: 'RESOLVED', mttrReduction: '98.6%' }
      }
    ],
    targetResolution: {
      finalErrorRate: 0.02,
      finalP99Latency: 42,
      verificationNotes: 'On-Demand billing active. All 96 Lambda worker instances stabilized at healthy throughput.'
    }
  },
  {
    id: 'k8s-oom-storm-p0',
    title: 'Kubernetes OOMKilled Storm on Gateway Ingress & Connection Drain',
    subtitle: 'Kernel cgroup memory threshold breach causing CrashLoopBackOff across Edge Ingress proxies',
    severity: 'P0_CRITICAL',
    cloudProvider: 'KUBERNETES',
    region: 'k8s-cluster-prod-us-west',
    affectedServices: ['ingress-nginx-edge', 'auth-session-broker', 'gateway-node-pool-03'],
    initialBlastRadius: 91.2,
    summary: 'Edge ingress pods terminating with exit code 137 (OOMKilled). Node memory pressure preventing scheduler from spinning up replacement pods.',
    rootCause: 'WebSocket memory leak coupled with strict 512Mi pod memory limits under sudden 100k client reconnect wave.',
    suggestedPatch: 'Hot-patch deployment resource limits to 4Gi, activate HPA scale-out, and trigger connection drain.',
    initialTask: {
      id: 'task-k8s-002',
      incidentId: 'INC-K8S-44091',
      title: 'Edge Ingress Ingress-Nginx CrashLoopBackOff Storm',
      description: 'Ingress proxy pods failing across 3 availability zones. 91.2% blast radius. Zero healthy ingress endpoints.',
      severity: 'P0_CRITICAL',
      status: 'DETECTED',
      cloudProvider: 'KUBERNETES',
      region: 'us-west-2',
      affectedServices: ['ingress-nginx-edge', 'auth-session-broker', 'gateway-node-pool-03'],
      blastRadiusPercentage: 91.2,
      detectedAt: 'Just now',
      rootCauseHypothesis: 'Evaluating Kubernetes events for Pod Evictions and OOMKilled cgroup triggers...',
      autoRemediateEnabled: true,
      agentLogs: [],
      metrics: {
        errorRate: 88.4,
        p99LatencyMs: 8900,
        cpuSaturation: 94.6,
        healthyReplicas: '2 / 32'
      }
    },
    simulatedLogs: [
      {
        stepType: 'THOUGHT',
        title: 'Detecting Global Ingress Endpoint Unavailability',
        content: 'Prometheus alerts fired: `KubePodCrashLooping` & `KubeContainerWaiting`. Ingress traffic dropping 88.4% of client requests. Reading Kubernetes event stream in `ingress-system` namespace.',
        confidenceScore: 0.95,
        latencyMs: 95
      },
      {
        stepType: 'ACTION',
        title: 'Executing Kubectl Diagnostic Inspection',
        content: 'Querying termination reasons and cgroup memory stats across failed proxy pods.',
        toolExecuted: 'k8s.client.get_pod_status',
        toolParameters: { namespace: 'ingress-system', labelSelector: 'app.kubernetes.io/name=ingress-nginx' },
        commandOutput: '[\n  { "name": "ingress-nginx-78fbb4-9zkv", "status": "CrashLoopBackOff", "exitCode": 137, "reason": "OOMKilled", "memoryUsage": "512.4Mi" },\n  { "name": "ingress-nginx-78fbb4-m2xp", "status": "CrashLoopBackOff", "exitCode": 137, "reason": "OOMKilled", "memoryUsage": "513.1Mi" }\n]',
        confidenceScore: 0.99,
        latencyMs: 290
      },
      {
        stepType: 'OBSERVATION',
        title: 'Root Cause Confirmed: OOMKilled via Undersized Cgroup Limits',
        content: 'Container memory limit is hard-capped at 512Mi. Sudden connection spike pushed buffered TLS socket buffers above 512Mi, triggering Linux kernel cgroup OOM killer.',
        confidenceScore: 0.985,
        latencyMs: 110
      },
      {
        stepType: 'THOUGHT',
        title: 'Formulating Safe Blue/Green Kubernetes Patch',
        content: 'Will dynamically adjust resource limits to requests: 2Gi / limits: 4Gi, scale replica count from 16 to 32, and trigger a rolling update with `maxSurge: 50%` to avoid dropping live connections.',
        confidenceScore: 0.97,
        latencyMs: 130
      },
      {
        stepType: 'PATCH',
        title: 'Applying Kubernetes Deployment Resource Mutation',
        content: 'Patching deployment `ingress-nginx-controller` spec resources and triggering surge rollout.',
        toolExecuted: 'k8s.client.patch_namespaced_deployment',
        toolParameters: {
          namespace: 'ingress-system',
          name: 'ingress-nginx-controller',
          patch: {
            spec: {
              replicas: 32,
              template: {
                spec: {
                  containers: [{
                    name: 'controller',
                    resources: { requests: { memory: '2Gi', cpu: '1000m' }, limits: { memory: '4Gi', cpu: '4000m' } }
                  }]
                }
              }
            }
          }
        },
        commandOutput: 'SUCCESS: Deployment ingress-nginx-controller patched. 32 new pods scheduled on high-memory worker nodes. Pods ready.',
        confidenceScore: 0.99,
        latencyMs: 620
      },
      {
        stepType: 'VERIFICATION',
        title: 'Remediation Verified: Ingress Mesh Restored (32/32 Healthy)',
        content: 'Kubernetes readiness gates green. Endpoints synchronized across all load balancers. Error rate collapsed from 88.4% to 0.00%. Latency restored to 14ms.',
        confidenceScore: 0.999,
        latencyMs: 190,
        metadata: { status: 'RESOLVED', k8sReplicas: '32/32 READY' }
      }
    ],
    targetResolution: {
      finalErrorRate: 0.0,
      finalP99Latency: 14,
      verificationNotes: 'High-memory worker node scaling successful. Zero packet loss across edge load balancers.'
    }
  },
  {
    id: 'postgres-pool-exhaustion-p1',
    title: 'PostgreSQL Connection Pool Exhaustion & Redis Lock Desync',
    subtitle: 'Zombie analytical query lock chain blocking transactional PgBouncer pool',
    severity: 'P1_HIGH',
    cloudProvider: 'HYBRID',
    region: 'eu-central-1 (Frankfurt)',
    affectedServices: ['aurora-pg-primary', 'pgbouncer-pooler', 'redis-cluster-locks'],
    initialBlastRadius: 64.0,
    summary: 'Active client connections reached hard ceiling (5,000/5,000). Transaction latency elevated to 4,800ms. Orphaned Redis distributed locks causing cascading deadlocks.',
    rootCause: 'Unindexed analytical report query holding exclusive row-level locks for >18 minutes on the `core_accounts` ledger table.',
    suggestedPatch: 'Kill blocking backend queries, invalidate stale Redis locks, and route analytical queries to Read Replica pool.',
    initialTask: {
      id: 'task-pg-003',
      incidentId: 'INC-DB-19902',
      title: 'Database Connection Pool Exhaustion on Primary DB',
      description: '5,000 active connections saturated. PgBouncer server queue full with client waiting threads.',
      severity: 'P1_HIGH',
      status: 'DETECTED',
      cloudProvider: 'HYBRID',
      region: 'eu-central-1',
      affectedServices: ['aurora-pg-primary', 'pgbouncer-pooler', 'redis-cluster-locks'],
      blastRadiusPercentage: 64.0,
      detectedAt: 'Just now',
      rootCauseHypothesis: 'Analyzing pg_stat_activity and lock contention graphs...',
      autoRemediateEnabled: true,
      agentLogs: [],
      metrics: {
        errorRate: 28.5,
        p99LatencyMs: 4800,
        cpuSaturation: 98.1,
        healthyReplicas: '1 / 4'
      }
    },
    simulatedLogs: [
      {
        stepType: 'THOUGHT',
        title: 'Detecting Connection Saturation & Queuing Lag',
        content: 'Database connection pool at 100% saturation. Microservices unable to obtain client sockets from PgBouncer. Inspecting `pg_stat_activity` for long-running blocking queries.',
        confidenceScore: 0.93,
        latencyMs: 110
      },
      {
        stepType: 'ACTION',
        title: 'Executing PostgreSQL Lock Contention Analysis',
        content: 'Running query to identify blocking PIDs holding exclusive table locks.',
        toolExecuted: 'sql.postgres.query(pg_stat_activity + pg_locks)',
        toolParameters: { minDurationSeconds: 120, state: 'active' },
        commandOutput: '[\n  { "pid": 48102, "duration": "00:18:42", "query": "SELECT * FROM core_accounts JOIN audit_logs ...", "granted": true },\n  { "pid": 48109, "duration": "00:18:39", "waiting_for_pid": 48102 }\n]',
        confidenceScore: 0.99,
        latencyMs: 310
      },
      {
        stepType: 'OBSERVATION',
        title: 'Root Cause Identified: Orphaned Analytical Query PID 48102',
        content: 'PID 48102 has been holding exclusive row locks on `core_accounts` for 18 minutes, blocking 4,890 subsequent transactional write queries.',
        confidenceScore: 0.99,
        latencyMs: 70
      },
      {
        stepType: 'PATCH',
        title: 'Terminating Rogue Backend & Diverting Analytical Traffic',
        content: 'Issuing `pg_terminate_backend(48102)` and updating DNS service routing to direct analytical reporting queries strictly to Read Replicas.',
        toolExecuted: 'sql.postgres.terminate_backend(48102) + dns.route_update',
        toolParameters: { pid: 48102, targetReplica: 'aurora-pg-ro-replica-01' },
        commandOutput: 'SUCCESS: PID 48102 terminated. 4,890 queued transactions released. Read replica routing rules applied.',
        confidenceScore: 0.985,
        latencyMs: 250
      },
      {
        stepType: 'VERIFICATION',
        title: 'Pool Health Restored: Active Connections Down to 240/5,000',
        content: 'Transaction latency dropped from 4,800ms to 18ms. Error rate dropped to 0.01%. Redis locks automatically synchronized. Incident resolved.',
        confidenceScore: 0.995,
        latencyMs: 140,
        metadata: { status: 'RESOLVED', activeConnections: '240 / 5000' }
      }
    ],
    targetResolution: {
      finalErrorRate: 0.01,
      finalP99Latency: 18,
      verificationNotes: 'Lock contention cleared. Analytical traffic isolated to dedicated read replica.'
    }
  }
];
