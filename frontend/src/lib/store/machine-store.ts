// src/lib/store/machine-store.ts

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type {
  DifficultyLevel,
  SessionStatus,
  QuestionDetail,
  QuestionListItem,
  CodeState,
  ProgrammingLanguage,
  RunCodeResponse,
  SubmitCodeResponse,
  SessionResultsResponse,
  DifficultyLevelInfo,
  ConfigResponse,
  ActiveTab,
} from '@/types/machine.types';

// =====================================================
// CODE TEMPLATES
// =====================================================

export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  python: `# Write your solution here
def solve():
    # Read input
    n = int(input())
    
    # Your code here
    result = n
    
    # Print output
    print(result)

solve()
`,
  javascript: `// Write your solution here
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const lines = [];

rl.on('line', (line) => {
  lines.push(line);
});

rl.on('close', () => {
  const n = parseInt(lines[0]);
  
  // Your code here
  const result = n;
  
  console.log(result);
});
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        
        // Your code here
        int result = n;
        
        System.out.println(result);
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    
    // Your code here
    int result = n;
    
    cout << result << endl;
    
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    // Your code here
    int result = n;
    
    printf("%d\\n", result);
    
    return 0;
}
`,
  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    
    var n int
    fmt.Fscan(reader, &n)
    
    // Your code here
    result := n
    
    fmt.Println(result)
}
`,
  rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    
    let n: i32 = lines.next().unwrap().unwrap().trim().parse().unwrap();
    
    // Your code here
    let result = n;
    
    println!("{}", result);
}
`,
  csharp: `using System;

class Program {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        
        // Your code here
        int result = n;
        
        Console.WriteLine(result);
    }
}
`,
  kotlin: `fun main() {
    val n = readLine()!!.toInt()
    
    // Your code here
    val result = n
    
    println(result)
}
`,
  ruby: `n = gets.to_i

# Your code here
result = n

puts result
`,
  php: `<?php
$n = intval(trim(fgets(STDIN)));

// Your code here
$result = $n;

echo $result . "\\n";
`,
  swift: `import Foundation

let n = Int(readLine()!)!

// Your code here
let result = n

print(result)
`,
  scala: `object Main extends App {
    val n = scala.io.StdIn.readInt()
    
    // Your code here
    val result = n
    
    println(result)
}
`,
  typescript: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const lines: string[] = [];

rl.on('line', (line: string) => {
  lines.push(line);
});

rl.on('close', () => {
  const n: number = parseInt(lines[0]);
  
  // Your code here
  const result: number = n;
  
  console.log(result);
});
`,
  r: `n <- as.integer(readLines("stdin", n = 1))

# Your code here
result <- n

cat(result, "\\n")
`,
};

// Default language ID (Python)
export const DEFAULT_LANGUAGE_ID = 71;

// =====================================================
// STORE INTERFACE
// =====================================================

interface MachineState {
  // Session State
  sessionId: string | null;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  numberOfQuestions: number;
  questions: QuestionListItem[];
  currentQuestionIndex: number;
  currentQuestion: QuestionDetail | null;
  codeState: CodeState;
  solvedQuestionIds: string[]; // Changed from Set to array for serialization

  // Language State
  selectedLanguageId: number;
  languages: ProgrammingLanguage[];

  // Config State
  config: ConfigResponse | null;
  difficultyLevels: DifficultyLevelInfo[];
  configLoaded: boolean;
  configLoading: boolean;
  configError: string | null;

  // Timer State - ALL IN SECONDS for consistency
  timeLimit: number; // in seconds
  startedAt: string | null;
  expiresAt: string | null;
  timeRemaining: number; // in seconds

  // Execution State
  isRunning: boolean;
  isSubmitting: boolean;
  runResult: RunCodeResponse | null;
  submitResult: SubmitCodeResponse | null;
  submitResults: Record<string, SubmitCodeResponse>;

  // Result State
  result: SessionResultsResponse | null;

  // UI State
  isLoading: boolean;
  activeTab: ActiveTab;
  customInput: string;
  outputPanelHeight: number;

  // Error State
  error: string | null;
  
  // Hydration State
  _hasHydrated: boolean;
}

interface MachineActions {
  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Config Actions
  setConfig: (config: ConfigResponse) => void;
  setLanguages: (languages: ProgrammingLanguage[]) => void;
  setDifficultyLevels: (levels: DifficultyLevelInfo[]) => void;
  setConfigLoaded: (loaded: boolean) => void;
  setConfigLoading: (loading: boolean) => void;
  setConfigError: (error: string | null) => void;

  // Session Actions
  initSession: (data: {
    sessionId: string;
    difficulty: DifficultyLevel;
    status: SessionStatus;
    numberOfQuestions: number;
    timeLimit: number;
    startedAt: string;
    expiresAt: string;
  }) => void;
  setQuestions: (questions: QuestionListItem[]) => void;
  setCurrentQuestion: (question: QuestionDetail | null) => void;
  updateTimeRemaining: (seconds: number) => void;
  setSessionStatus: (status: SessionStatus) => void;

  // Language Actions
  setSelectedLanguageId: (languageId: number) => void;
  getSelectedLanguageMonacoId: () => string;

  // Code Actions
  setCode: (questionId: string, code: string) => void;
  resetCode: (questionId: string) => void;
  getCodeForQuestion: (questionId: string) => string;
  getLanguageIdForQuestion: (questionId: string) => number;

  // Navigation Actions
  goToQuestion: (index: number) => void;
  goToQuestionById: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Execution Actions
  setRunning: (isRunning: boolean) => void;
  setRunResult: (result: RunCodeResponse | null) => void;

  // Submission Actions
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitResult: (result: SubmitCodeResponse | null) => void;
  addSubmitResult: (questionId: string, result: SubmitCodeResponse) => void;
  markAsSolved: (questionId: string) => void;

  // Result Actions
  setResult: (result: SessionResultsResponse) => void;

  // UI Actions
  setLoading: (isLoading: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setCustomInput: (input: string) => void;
  setOutputPanelHeight: (height: number) => void;
  setError: (error: string | null) => void;

  // Computed Getters
  getCurrentQuestionId: () => string | null;
  getCurrentSessionQuestionId: () => string | null;
  getAttemptedCount: () => number;
  getSolvedCount: () => number;
  isQuestionSolved: (questionId: string) => boolean;
  hasActiveSession: () => boolean;
  canRunCode: () => boolean;
  canSubmitCode: () => boolean;

  // Reset Actions
  resetExecution: () => void;
  resetSession: () => void;
  clearStore: () => void;
}

type MachineStore = MachineState & MachineActions;

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: MachineState = {
  sessionId: null,
  difficulty: 'MEDIUM',
  status: 'in_progress',
  numberOfQuestions: 0,
  questions: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  codeState: {},
  solvedQuestionIds: [], // Array instead of Set
  selectedLanguageId: DEFAULT_LANGUAGE_ID,
  languages: [],
  config: null,
  difficultyLevels: [],
  configLoaded: false,
  configLoading: false,
  configError: null,
  timeLimit: 0,
  startedAt: null,
  expiresAt: null,
  timeRemaining: 0,
  isRunning: false,
  isSubmitting: false,
  runResult: null,
  submitResult: null,
  submitResults: {},
  result: null,
  isLoading: false,
  activeTab: 'description',
  customInput: '',
  outputPanelHeight: 300,
  error: null,
  _hasHydrated: false,
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getMonacoIdFromLanguageId = (
  languageId: number,
  languages: ProgrammingLanguage[]
): string => {
  const language = languages.find((l) => l.judge0Id === languageId);
  return language?.monacoId || 'python';
};

const getMonacoIdFromJudge0Id = (judge0Id: number): string => {
  const mapping: Record<number, string> = {
    71: 'python',
    63: 'javascript',
    62: 'java',
    54: 'cpp',
    50: 'c',
    51: 'csharp',
    60: 'go',
    73: 'rust',
    72: 'ruby',
    83: 'swift',
    78: 'kotlin',
    74: 'typescript',
    68: 'php',
    81: 'scala',
    80: 'r',
  };
  return mapping[judge0Id] || 'python';
};

const getDefaultTemplate = (monacoId: string): string => {
  return DEFAULT_CODE_TEMPLATES[monacoId] || DEFAULT_CODE_TEMPLATES.python;
};

// Helper to calculate time remaining in seconds
const calculateTimeRemainingSeconds = (expiresAt: string): number => {
  const expiresTime = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expiresTime - now) / 1000));
};

// =====================================================
// STORE
// =====================================================

export const useMachineStore = create<MachineStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // -------------------------------------------
        // HYDRATION
        // -------------------------------------------
        
        setHasHydrated: (state) => {
          set({ _hasHydrated: state });
        },

        // -------------------------------------------
        // CONFIG ACTIONS
        // -------------------------------------------

        setConfig: (config) => set({ config }),

        setLanguages: (languages) => set({ languages }),

        setDifficultyLevels: (difficultyLevels) => set({ difficultyLevels }),

        setConfigLoaded: (configLoaded) => set({ configLoaded }),

        setConfigLoading: (configLoading) => set({ configLoading }),
        
        setConfigError: (configError) => set({ configError }),

        // -------------------------------------------
        // SESSION ACTIONS
        // -------------------------------------------

        initSession: (data) => {
          // Calculate time remaining in SECONDS
          const timeRemaining = calculateTimeRemainingSeconds(data.expiresAt);

          set({
            sessionId: data.sessionId,
            difficulty: data.difficulty,
            status: data.status,
            numberOfQuestions: data.numberOfQuestions,
            timeLimit: data.timeLimit, // Already in seconds from backend
            startedAt: data.startedAt,
            expiresAt: data.expiresAt,
            timeRemaining,
            currentQuestionIndex: 0,
            currentQuestion: null,
            runResult: null,
            submitResult: null,
            submitResults: {},
            result: null,
            activeTab: 'description',
            customInput: '',
            error: null,
          });
        },

        setQuestions: (questions) => {
          const { codeState, selectedLanguageId, languages, solvedQuestionIds } = get();
          const monacoId = getMonacoIdFromLanguageId(selectedLanguageId, languages);
          const newCodeState = { ...codeState };
          const newSolvedIds = [...solvedQuestionIds];

          questions.forEach((q) => {
            if (!newCodeState[q.id]) {
              newCodeState[q.id] = {
                code: getDefaultTemplate(monacoId),
                languageId: selectedLanguageId,
              };
            }
            if (q.isSolved && !newSolvedIds.includes(q.id)) {
              newSolvedIds.push(q.id);
            }
          });

          set({
            questions,
            codeState: newCodeState,
            solvedQuestionIds: newSolvedIds,
          });
        },

        setCurrentQuestion: (question) => set({ currentQuestion: question }),

        updateTimeRemaining: (seconds) => {
          const newTimeRemaining = Math.max(0, seconds);
          set({ timeRemaining: newTimeRemaining });
          
          // Auto-expire if time runs out
          if (newTimeRemaining <= 0) {
            const { status } = get();
            if (status === 'in_progress') {
              set({ status: 'expired' });
            }
          }
        },

        setSessionStatus: (status) => set({ status }),

        // -------------------------------------------
        // LANGUAGE ACTIONS
        // -------------------------------------------

        setSelectedLanguageId: (languageId) => {
          const { questions, codeState, languages } = get();
          const monacoId = getMonacoIdFromLanguageId(languageId, languages);
          const newCodeState = { ...codeState };

          questions.forEach((q) => {
            const existing = newCodeState[q.id];
            const isDefaultCode =
              existing &&
              Object.values(DEFAULT_CODE_TEMPLATES).includes(existing.code);

            if (!existing || isDefaultCode) {
              newCodeState[q.id] = {
                code: getDefaultTemplate(monacoId),
                languageId,
              };
            }
          });

          set({ selectedLanguageId: languageId, codeState: newCodeState });
        },

        getSelectedLanguageMonacoId: () => {
          const { selectedLanguageId, languages } = get();
          if (languages.length > 0) {
            return getMonacoIdFromLanguageId(selectedLanguageId, languages);
          }
          return getMonacoIdFromJudge0Id(selectedLanguageId);
        },

        // -------------------------------------------
        // CODE ACTIONS
        // -------------------------------------------

        setCode: (questionId, code) => {
          const { selectedLanguageId } = get();
          set((state) => ({
            codeState: {
              ...state.codeState,
              [questionId]: {
                code,
                languageId: selectedLanguageId,
              },
            },
          }));
        },

        resetCode: (questionId) => {
          const { selectedLanguageId, languages } = get();
          const monacoId = getMonacoIdFromLanguageId(selectedLanguageId, languages);

          set((state) => ({
            codeState: {
              ...state.codeState,
              [questionId]: {
                code: getDefaultTemplate(monacoId),
                languageId: selectedLanguageId,
              },
            },
            runResult: null,
            submitResult: null,
          }));
        },

        getCodeForQuestion: (questionId) => {
          const { codeState, selectedLanguageId, languages } = get();
          const monacoId = getMonacoIdFromLanguageId(selectedLanguageId, languages);
          return codeState[questionId]?.code || getDefaultTemplate(monacoId);
        },

        getLanguageIdForQuestion: (questionId) => {
          const { codeState, selectedLanguageId } = get();
          return codeState[questionId]?.languageId || selectedLanguageId;
        },

        // -------------------------------------------
        // NAVIGATION ACTIONS
        // -------------------------------------------

        goToQuestion: (index) => {
          const { questions } = get();
          if (index >= 0 && index < questions.length) {
            set({
              currentQuestionIndex: index,
              currentQuestion: null,
              runResult: null,
              submitResult: null,
              activeTab: 'description',
              customInput: '',
            });
          }
        },

        goToQuestionById: (questionId) => {
          const { questions } = get();
          const index = questions.findIndex((q) => q.id === questionId);
          if (index !== -1) {
            set({
              currentQuestionIndex: index,
              currentQuestion: null,
              runResult: null,
              submitResult: null,
              activeTab: 'description',
              customInput: '',
            });
          }
        },

        nextQuestion: () => {
          const { currentQuestionIndex, questions } = get();
          if (currentQuestionIndex < questions.length - 1) {
            set({
              currentQuestionIndex: currentQuestionIndex + 1,
              currentQuestion: null,
              runResult: null,
              submitResult: null,
              activeTab: 'description',
              customInput: '',
            });
          }
        },

        previousQuestion: () => {
          const { currentQuestionIndex } = get();
          if (currentQuestionIndex > 0) {
            set({
              currentQuestionIndex: currentQuestionIndex - 1,
              currentQuestion: null,
              runResult: null,
              submitResult: null,
              activeTab: 'description',
              customInput: '',
            });
          }
        },

        // -------------------------------------------
        // EXECUTION ACTIONS
        // -------------------------------------------

        setRunning: (isRunning) => set({ isRunning }),

        setRunResult: (runResult) =>
          set({
            runResult,
            activeTab: runResult ? 'output' : get().activeTab,
            error: null,
          }),

        // -------------------------------------------
        // SUBMISSION ACTIONS
        // -------------------------------------------

        setSubmitting: (isSubmitting) => set({ isSubmitting }),

        setSubmitResult: (submitResult) =>
          set({
            submitResult,
            activeTab: submitResult ? 'output' : get().activeTab,
            error: null,
          }),

        addSubmitResult: (questionId, result) => {
          set((state) => {
            const newSolvedIds = [...state.solvedQuestionIds];
            if (result.isSolved && !newSolvedIds.includes(questionId)) {
              newSolvedIds.push(questionId);
            }

            const updatedQuestions = state.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    isSolved: result.isSolved || q.isSolved,
                    submissionCount: q.submissionCount + 1,
                    bestSubmission: result.isSolved
                      ? {
                          status: result.status,
                          executionTime: result.executionTime ?? undefined,
                          memoryUsed: result.memoryUsed ?? undefined,
                          testCasesPassed: result.testCasesPassed,
                          testCasesTotal: result.testCasesTotal,
                          submittedAt: result.submittedAt,
                        }
                      : q.bestSubmission,
                  }
                : q
            );

            return {
              submitResults: {
                ...state.submitResults,
                [questionId]: result,
              },
              submitResult: result,
              solvedQuestionIds: newSolvedIds,
              questions: updatedQuestions,
              activeTab: 'output',
              error: null,
            };
          });
        },

        markAsSolved: (questionId) => {
          set((state) => {
            const newSolvedIds = state.solvedQuestionIds.includes(questionId)
              ? state.solvedQuestionIds
              : [...state.solvedQuestionIds, questionId];

            const updatedQuestions = state.questions.map((q) =>
              q.id === questionId ? { ...q, isSolved: true } : q
            );

            return {
              solvedQuestionIds: newSolvedIds,
              questions: updatedQuestions,
            };
          });
        },

        // -------------------------------------------
        // RESULT ACTIONS
        // -------------------------------------------

        setResult: (result) => set({ result, status: 'completed' }),

        // -------------------------------------------
        // UI ACTIONS
        // -------------------------------------------

        setLoading: (isLoading) => set({ isLoading }),

        setActiveTab: (activeTab) => set({ activeTab }),

        setCustomInput: (customInput) => set({ customInput }),

        setOutputPanelHeight: (outputPanelHeight) => set({ outputPanelHeight }),

        setError: (error) => set({ error }),

        // -------------------------------------------
        // COMPUTED GETTERS
        // -------------------------------------------

        getCurrentQuestionId: () => {
          const { questions, currentQuestionIndex } = get();
          return questions[currentQuestionIndex]?.id || null;
        },

        getCurrentSessionQuestionId: () => {
          const { questions, currentQuestionIndex } = get();
          return questions[currentQuestionIndex]?.sessionQuestionId || null;
        },

        getAttemptedCount: () => {
          const { codeState, questions, selectedLanguageId, languages } = get();
          const monacoId = getMonacoIdFromLanguageId(selectedLanguageId, languages);
          const defaultCode = getDefaultTemplate(monacoId);

          return questions.filter((q) => {
            const code = codeState[q.id]?.code || '';
            const trimmedCode = code.trim();
            return (
              trimmedCode !== '' &&
              trimmedCode !== defaultCode.trim() &&
              !Object.values(DEFAULT_CODE_TEMPLATES)
                .map((t) => t.trim())
                .includes(trimmedCode)
            );
          }).length;
        },

        getSolvedCount: () => {
          const { solvedQuestionIds } = get();
          return solvedQuestionIds.length;
        },

        isQuestionSolved: (questionId) => {
          const { solvedQuestionIds } = get();
          return solvedQuestionIds.includes(questionId);
        },

        hasActiveSession: () => {
          const { sessionId, status, expiresAt } = get();
          if (!sessionId || status === 'completed') return false;
          if (!expiresAt) return false;
          return new Date(expiresAt).getTime() > Date.now();
        },

        canRunCode: () => {
          const { isRunning, isSubmitting, status, timeRemaining } = get();
          return (
            !isRunning &&
            !isSubmitting &&
            status === 'in_progress' &&
            timeRemaining > 0
          );
        },

        canSubmitCode: () => {
          const { isRunning, isSubmitting, status, timeRemaining } = get();
          return (
            !isRunning &&
            !isSubmitting &&
            status === 'in_progress' &&
            timeRemaining > 0
          );
        },

        // -------------------------------------------
        // RESET ACTIONS
        // -------------------------------------------

        resetExecution: () => {
          set({
            runResult: null,
            submitResult: null,
            isRunning: false,
            isSubmitting: false,
            error: null,
          });
        },

        resetSession: () => {
          const { languages, config, difficultyLevels, selectedLanguageId, configLoaded } = get();
          set({
            ...initialState,
            languages,
            config,
            difficultyLevels,
            selectedLanguageId,
            configLoaded,
            _hasHydrated: true,
          });
        },

        clearStore: () => {
          set({
            ...initialState,
            _hasHydrated: true,
          });
        },
      }),
      {
        name: 'machine-coding-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Session data
          sessionId: state.sessionId,
          codeState: state.codeState,
          currentQuestionIndex: state.currentQuestionIndex,
          startedAt: state.startedAt,
          expiresAt: state.expiresAt,
          selectedLanguageId: state.selectedLanguageId,
          difficulty: state.difficulty,
          status: state.status,
          solvedQuestionIds: state.solvedQuestionIds,
          customInput: state.customInput,
          // Config data - persist to avoid refetching
          config: state.config,
          languages: state.languages,
          difficultyLevels: state.difficultyLevels,
          configLoaded: state.configLoaded,
        }),
        onRehydrateStorage: () => (state) => {
          // Called when storage is rehydrated
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'MachineStore' }
  )
);

// =====================================================
// SELECTOR HOOKS
// =====================================================

export const useMachineSession = () =>
  useMachineStore((state) => ({
    sessionId: state.sessionId,
    difficulty: state.difficulty,
    status: state.status,
    numberOfQuestions: state.numberOfQuestions,
    questions: state.questions,
    currentQuestionIndex: state.currentQuestionIndex,
    currentQuestion: state.currentQuestion,
    error: state.error,
  }));

export const useMachineTimerState = () =>
  useMachineStore((state) => ({
    timeLimit: state.timeLimit,
    startedAt: state.startedAt,
    expiresAt: state.expiresAt,
    timeRemaining: state.timeRemaining,
    updateTimeRemaining: state.updateTimeRemaining,
  }));

export const useMachineCode = () =>
  useMachineStore((state) => ({
    codeState: state.codeState,
    selectedLanguageId: state.selectedLanguageId,
    languages: state.languages,
    setCode: state.setCode,
    resetCode: state.resetCode,
    getCodeForQuestion: state.getCodeForQuestion,
    getLanguageIdForQuestion: state.getLanguageIdForQuestion,
    setSelectedLanguageId: state.setSelectedLanguageId,
    getSelectedLanguageMonacoId: state.getSelectedLanguageMonacoId,
  }));

export const useMachineExecution = () =>
  useMachineStore((state) => ({
    isRunning: state.isRunning,
    isSubmitting: state.isSubmitting,
    runResult: state.runResult,
    submitResult: state.submitResult,
    submitResults: state.submitResults,
    setRunning: state.setRunning,
    setRunResult: state.setRunResult,
    setSubmitting: state.setSubmitting,
    setSubmitResult: state.setSubmitResult,
    addSubmitResult: state.addSubmitResult,
    canRunCode: state.canRunCode,
    canSubmitCode: state.canSubmitCode,
  }));

export const useMachineUI = () =>
  useMachineStore((state) => ({
    isLoading: state.isLoading,
    activeTab: state.activeTab,
    customInput: state.customInput,
    outputPanelHeight: state.outputPanelHeight,
    setLoading: state.setLoading,
    setActiveTab: state.setActiveTab,
    setCustomInput: state.setCustomInput,
    setOutputPanelHeight: state.setOutputPanelHeight,
  }));

export const useMachineProgressState = () =>
  useMachineStore((state) => ({
    solvedQuestionIds: state.solvedQuestionIds,
    getSolvedCount: state.getSolvedCount,
    getAttemptedCount: state.getAttemptedCount,
    isQuestionSolved: state.isQuestionSolved,
    markAsSolved: state.markAsSolved,
  }));

export const useMachineConfig = () =>
  useMachineStore((state) => ({
    config: state.config,
    difficultyLevels: state.difficultyLevels,
    languages: state.languages,
    configLoaded: state.configLoaded,
    configLoading: state.configLoading,
    configError: state.configError,
    setConfig: state.setConfig,
    setLanguages: state.setLanguages,
    setDifficultyLevels: state.setDifficultyLevels,
    setConfigLoaded: state.setConfigLoaded,
    setConfigLoading: state.setConfigLoading,
    setConfigError: state.setConfigError,
  }));

export const useMachineNavigation = () =>
  useMachineStore((state) => ({
    currentQuestionIndex: state.currentQuestionIndex,
    questions: state.questions,
    goToQuestion: state.goToQuestion,
    goToQuestionById: state.goToQuestionById,
    nextQuestion: state.nextQuestion,
    previousQuestion: state.previousQuestion,
    getCurrentQuestionId: state.getCurrentQuestionId,
    getCurrentSessionQuestionId: state.getCurrentSessionQuestionId,
  }));

export const useMachineHydration = () =>
  useMachineStore((state) => ({
    hasHydrated: state._hasHydrated,
  }));