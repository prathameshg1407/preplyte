// src/lib/api/services/mock-drive/attempt.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  GetAttemptResponse,
  StartAttemptResponse,
  StartModuleResponse,
  SubmitModuleResponse,
  ModuleActionResponse,
  AptitudeAnswerPayload,
  AptitudeClearPayload,
  AptitudeMarkReviewPayload,
  MachineSubmitPayload,
  MachineRunPayload,
  InterviewRespondPayload,
  InterviewSkipPayload,
  ModuleStateResponse,
} from '@/types/mockdrive.types';

export const attemptService = {
  // =====================================================
  // Attempt Lifecycle
  // =====================================================

  /**
   * Get the current attempt state for a mock drive
   */
  getAttemptState: async (driveId: string): Promise<GetAttemptResponse | null> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.ATTEMPT(driveId));
    return response.data.data;
  },

  /**
   * Start a new attempt for a mock drive
   */
  startAttempt: async (driveId: string): Promise<StartAttemptResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.MOCK_DRIVES.START(driveId));
    return response.data.data;
  },

  /**
   * Submit/End an attempt
   */
  submitAttempt: async (
    driveId: string,
    payload?: { terminationReason?: string; remarks?: string }
  ): Promise<void> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.SUBMIT_ATTEMPT(driveId),
      payload
    );
    return response.data.data;
  },

  // =====================================================
  // Module Lifecycle
  // =====================================================

  /**
   * Get module state
   */
  getModuleState: async (
    driveId: string,
    moduleId: string
  ): Promise<ModuleStateResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.MOCK_DRIVES.MODULE(driveId, moduleId)
    );
    return response.data.data;
  },

  /**
   * Start a specific module within an attempt
   */
  startModule: async (driveId: string, moduleId: string): Promise<StartModuleResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.MODULE_START(driveId, moduleId)
    );
    return response.data.data;
  },

  /**
   * Submit a module (mark as completed)
   */
  submitModule: async (driveId: string, moduleId: string): Promise<SubmitModuleResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.MODULE_SUBMIT(driveId, moduleId)
    );
    return response.data.data;
  },

  // =====================================================
  // Aptitude Module Actions
  // =====================================================

  /**
   * Submit an answer for an aptitude question
   */
  submitAptitudeAnswer: async (
    driveId: string,
    moduleId: string,
    payload: AptitudeAnswerPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.APTITUDE_ANSWER(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  /**
   * Clear an answer for an aptitude question
   */
  clearAptitudeAnswer: async (
    driveId: string,
    moduleId: string,
    payload: AptitudeClearPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.APTITUDE_CLEAR(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  /**
   * Mark/unmark a question for review
   */
  markAptitudeForReview: async (
    driveId: string,
    moduleId: string,
    payload: AptitudeMarkReviewPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.APTITUDE_MARK_REVIEW(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  // =====================================================
  // Machine Coding Module Actions
  // =====================================================

  /**
   * Run code (test execution without submission)
   */
  runMachineCode: async (
    driveId: string,
    moduleId: string,
    payload: MachineRunPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.MACHINE_RUN(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  /**
   * Submit code for a machine coding question
   */
  submitMachineCode: async (
    driveId: string,
    moduleId: string,
    payload: MachineSubmitPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.MACHINE_SUBMIT(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  // =====================================================
  // AI Interview Module Actions
  // =====================================================

  /**
   * Submit a response for an interview question
   */
  submitInterviewResponse: async (
    driveId: string,
    moduleId: string,
    payload: InterviewRespondPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_RESPOND(driveId, moduleId),
      payload
    );
    return response.data.data;
  },

  /**
   * Skip an interview question
   */
  skipInterviewQuestion: async (
    driveId: string,
    moduleId: string,
    payload?: InterviewSkipPayload
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_SKIP(driveId, moduleId),
      payload || {}
    );
    return response.data.data;
  },

  /**
   * Get audio for the current question
   */
  getInterviewAudioQuestion: async (
    driveId: string,
    moduleId: string
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_AUDIO_QUESTION(driveId, moduleId)
    );
    return response.data.data;
  },

  /**
   * Get next interview question
   */
  getNextInterviewQuestion: async (
    driveId: string,
    moduleId: string
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_NEXT(driveId, moduleId)
    );
    return response.data.data;
  },

  /**
   * Start voice mode for interview
   */
  startInterviewVoiceMode: async (
    driveId: string,
    moduleId: string
  ): Promise<ModuleActionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_VOICE_START(driveId, moduleId)
    );
    return response.data.data;
  },


};