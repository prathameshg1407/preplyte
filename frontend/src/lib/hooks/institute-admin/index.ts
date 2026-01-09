// src/lib/hooks/institute-admin/index.ts

// Query Keys
export * from './query-keys';

// Mock Drive Hooks


// Module Hooks
export {
  useModules,
  useModulesSummary,
  useModuleDetail,
  useAddModule,
  useUpdateModule,
  useDeleteModule,
  useReorderModules,
  useDuplicateModule,
  useModulesPage,
} from './use-mockdrive-modules';

// Eligibility Hooks
export {
  useEligibilityCriteria,
  useEligibilitySummary,
  useEligibleStudents,
  useCheckStudentEligibility,
  useSetEligibility,
  useUpdateEligibility,
  useDeleteEligibility,
  useEligibilityPage,
} from './use-mockdrive-eligibility';

// Registration Hooks
export {
  useRegistrations,
  useRegistrationDetail,
  useRegistrationSummary,
  useUpdateRegistration,
  useBulkUpdateRegistrations,
  useApproveAllPending,
  useExportRegistrations,
  useRegistrationsPage,
} from './use-mockdrive-registrations';

// Batch Hooks
export {
  useBatches,
  useBatchDetail,
  useBatchStudents,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
  useAutoCreateBatches,
  useAssignStudents,
  useUnassignStudents,
  useStartBatch,
  useCompleteBatch,
  useBatchesPage,
  useBatchDetailPage,
} from './use-mockdrive-batches';

// Analytics Hooks
export {
  useFullAnalytics,
  useAnalyticsOverview,
  useScoreDistribution,
  useModulePerformance,
  useBatchComparison,
  useTimeAnalysis,
  useAnalyticsDashboard,
} from './use-mockdrive-analytics';

// Results Hooks
export {
  useResults,
  useResultDetail,
  useResultStatistics,
  useCalculateRankings,
  useExportResults,
  useGenerateReport,
  useGenerateAllReports,
  useResultsPage,
  useResultDetailPage,
} from './use-mockdrive-results';


export * from './use-departments';
