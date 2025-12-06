import { Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { AttemptService } from './attempt.service';
import { MockDriveIdInput, ModuleIdInput, AptitudeAnswerInput, AptitudeClearInput, AptitudeMarkReviewInput, MachineSubmitInput, MachineRunInput, InterviewRespondInput, InterviewSkipInput } from './attempt.validation';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
type TypedRequest<P extends ParamsDictionary = ParamsDictionary, B = unknown> = AuthenticatedRequest & {
    params: P;
    body: B;
};
export declare class AttemptController {
    private readonly service;
    constructor(service: AttemptService);
    getAttemptState: (req: TypedRequest<MockDriveIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    startAttempt: (req: TypedRequest<MockDriveIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    startModule: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    submitModule: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    getModuleState: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    submitAptitudeAnswer: (req: TypedRequest<AptitudeAnswerInput["params"], AptitudeAnswerInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    clearAptitudeAnswer: (req: TypedRequest<AptitudeClearInput["params"], AptitudeClearInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    markForReview: (req: TypedRequest<AptitudeMarkReviewInput["params"], AptitudeMarkReviewInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    submitMachineCode: (req: TypedRequest<MachineSubmitInput["params"], MachineSubmitInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    runMachineCode: (req: TypedRequest<MachineRunInput["params"], MachineRunInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    submitInterviewResponse: (req: TypedRequest<InterviewRespondInput["params"], InterviewRespondInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    skipInterviewQuestion: (req: TypedRequest<InterviewSkipInput["params"], InterviewSkipInput["body"]>, res: Response, next: NextFunction) => Promise<void>;
    getNextInterviewQuestion: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    startVoiceMode: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
    getAudioQuestion: (req: TypedRequest<ModuleIdInput["params"]>, res: Response, next: NextFunction) => Promise<void>;
}
export {};
//# sourceMappingURL=attempt.controller.d.ts.map