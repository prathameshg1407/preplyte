// src/components/mock-drive/results/score-breakdown.tsx

'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ModuleReport, 
  AptitudeAnalysis, 
  MachineAnalysis, 
  InterviewAnalysis,
  MockDriveModuleType 
} from '@/types/mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/mockdrive.constants';

interface ScoreBreakdownProps {
  moduleReports: ModuleReport[];
}

// Type guards for detailed analysis
function isAptitudeAnalysis(
  analysis: AptitudeAnalysis | MachineAnalysis | InterviewAnalysis | null,
  moduleType: MockDriveModuleType
): analysis is AptitudeAnalysis {
  return moduleType === MockDriveModuleType.APTITUDE && analysis !== null;
}

function isMachineAnalysis(
  analysis: AptitudeAnalysis | MachineAnalysis | InterviewAnalysis | null,
  moduleType: MockDriveModuleType
): analysis is MachineAnalysis {
  return moduleType === MockDriveModuleType.MACHINE_CODING && analysis !== null;
}

function isInterviewAnalysis(
  analysis: AptitudeAnalysis | MachineAnalysis | InterviewAnalysis | null,
  moduleType: MockDriveModuleType
): analysis is InterviewAnalysis {
  return moduleType === MockDriveModuleType.AI_INTERVIEW && analysis !== null;
}

export const ScoreBreakdown: FC<ScoreBreakdownProps> = ({ moduleReports }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {moduleReports.map((report) => {
            const typeConfig = MODULE_TYPE_CONFIG[report.moduleType];
            
            return (
              <div key={report.moduleId} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`font-semibold ${typeConfig.color}`}>
                    {report.moduleName || typeConfig.label}
                  </span>
                </div>

                {/* Aptitude Module Analysis */}
                {isAptitudeAnalysis(report.detailedAnalysis, report.moduleType) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/40 border dark:border-green-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {report.detailedAnalysis.correct}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Correct</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border dark:border-red-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {report.detailedAnalysis.wrong}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">Wrong</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {report.detailedAnalysis.unanswered}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Unanswered</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border dark:border-blue-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {report.detailedAnalysis.accuracy?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Accuracy</p>
                    </div>
                  </div>
                )}

                {/* Machine Coding Module Analysis */}
                {isMachineAnalysis(report.detailedAnalysis, report.moduleType) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/40 border dark:border-green-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {report.detailedAnalysis.solved}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Solved</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/40 border dark:border-yellow-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                        {report.detailedAnalysis.partial}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500">Partial</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {report.detailedAnalysis.unattempted}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Unattempted</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border dark:border-blue-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {report.detailedAnalysis.totalSubmissions}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Submissions</p>
                    </div>
                  </div>
                )}

                {/* AI Interview Module Analysis */}
                {isInterviewAnalysis(report.detailedAnalysis, report.moduleType) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border dark:border-blue-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {report.detailedAnalysis.answered}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Answered</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {report.detailedAnalysis.skipped}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Skipped</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border dark:border-purple-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {report.detailedAnalysis.communicationScore?.toFixed(0) || 0}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Communication</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/40 border dark:border-green-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {report.detailedAnalysis.technicalScore?.toFixed(0) || 0}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Technical</p>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{report.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};