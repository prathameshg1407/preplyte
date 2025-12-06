import { CreateBatchDTO, UpdateBatchDTO, AutoCreateBatchesDTO, AssignStudentsDTO, ListBatchesQuery, BatchDetails, PaginatedBatches, BatchStudent, AssignResult, UnassignResult } from './batch.types';
export declare class BatchService {
    createBatch(mockDriveId: string, instituteId: string, data: CreateBatchDTO): Promise<BatchDetails>;
    getBatchById(mockDriveId: string, batchId: string, instituteId: string): Promise<BatchDetails>;
    listBatches(mockDriveId: string, instituteId: string, query: ListBatchesQuery): Promise<PaginatedBatches>;
    updateBatch(mockDriveId: string, batchId: string, instituteId: string, data: UpdateBatchDTO): Promise<BatchDetails>;
    deleteBatch(mockDriveId: string, batchId: string, instituteId: string): Promise<void>;
    autoCreateBatches(mockDriveId: string, instituteId: string, data: AutoCreateBatchesDTO): Promise<BatchDetails[]>;
    assignStudents(mockDriveId: string, batchId: string, instituteId: string, data: AssignStudentsDTO): Promise<AssignResult>;
    unassignStudents(mockDriveId: string, batchId: string, instituteId: string, registrationIds: string[]): Promise<UnassignResult>;
    getBatchStudents(mockDriveId: string, batchId: string, instituteId: string): Promise<BatchStudent[]>;
    startBatch(mockDriveId: string, batchId: string, instituteId: string): Promise<BatchDetails>;
    completeBatch(mockDriveId: string, batchId: string, instituteId: string): Promise<BatchDetails>;
    private verifyAccess;
    private validateStatusForBatchOps;
    private validateTimeWithinDrive;
    private validateStatusTransition;
    private validateActiveUpdateFields;
    private checkScheduleConflict;
    private getNextBatchNumber;
    private buildUpdateData;
    private getBatchDetails;
    private getBatchStats;
    private getAttemptCountsByBatch;
}
export declare const batchService: BatchService;
//# sourceMappingURL=batch.service.d.ts.map