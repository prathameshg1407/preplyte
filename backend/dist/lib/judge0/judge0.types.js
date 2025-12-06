"use strict";
// src/lib/judge0/judge0.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapJudge0StatusToSubmissionStatus = exports.Judge0StatusId = void 0;
// =====================================================
// STATUS ENUMS
// =====================================================
var Judge0StatusId;
(function (Judge0StatusId) {
    Judge0StatusId[Judge0StatusId["IN_QUEUE"] = 1] = "IN_QUEUE";
    Judge0StatusId[Judge0StatusId["PROCESSING"] = 2] = "PROCESSING";
    Judge0StatusId[Judge0StatusId["ACCEPTED"] = 3] = "ACCEPTED";
    Judge0StatusId[Judge0StatusId["WRONG_ANSWER"] = 4] = "WRONG_ANSWER";
    Judge0StatusId[Judge0StatusId["TIME_LIMIT_EXCEEDED"] = 5] = "TIME_LIMIT_EXCEEDED";
    Judge0StatusId[Judge0StatusId["COMPILATION_ERROR"] = 6] = "COMPILATION_ERROR";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_SIGSEGV"] = 7] = "RUNTIME_ERROR_SIGSEGV";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_SIGXFSZ"] = 8] = "RUNTIME_ERROR_SIGXFSZ";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_SIGFPE"] = 9] = "RUNTIME_ERROR_SIGFPE";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_SIGABRT"] = 10] = "RUNTIME_ERROR_SIGABRT";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_NZEC"] = 11] = "RUNTIME_ERROR_NZEC";
    Judge0StatusId[Judge0StatusId["RUNTIME_ERROR_OTHER"] = 12] = "RUNTIME_ERROR_OTHER";
    Judge0StatusId[Judge0StatusId["INTERNAL_ERROR"] = 13] = "INTERNAL_ERROR";
    Judge0StatusId[Judge0StatusId["EXEC_FORMAT_ERROR"] = 14] = "EXEC_FORMAT_ERROR";
})(Judge0StatusId || (exports.Judge0StatusId = Judge0StatusId = {}));
const mapJudge0StatusToSubmissionStatus = (statusId) => {
    switch (statusId) {
        case Judge0StatusId.IN_QUEUE:
        case Judge0StatusId.PROCESSING:
            return 'PENDING';
        case Judge0StatusId.ACCEPTED:
            return 'ACCEPTED';
        case Judge0StatusId.WRONG_ANSWER:
            return 'WRONG_ANSWER';
        case Judge0StatusId.TIME_LIMIT_EXCEEDED:
            return 'TIME_LIMIT_EXCEEDED';
        case Judge0StatusId.COMPILATION_ERROR:
            return 'COMPILATION_ERROR';
        default:
            return 'RUNTIME_ERROR';
    }
};
exports.mapJudge0StatusToSubmissionStatus = mapJudge0StatusToSubmissionStatus;
//# sourceMappingURL=judge0.types.js.map