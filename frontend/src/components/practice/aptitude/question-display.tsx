// src/components/practice/aptitude/question-display.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import type { SessionQuestion } from '../../../types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
} from '../../../lib/constants/aptitude.constants';
import { cn } from '../../../lib/utils';

interface QuestionDisplayProps {
  question: SessionQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (optionId: string) => void;
  showResult?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  isSaving = false,
  disabled = false,
}: QuestionDisplayProps) {
  const typeConfig = QUESTION_TYPE_CONFIG[question.questionType];
  const difficultyConfig = DIFFICULTY_CONFIG[question.difficulty];

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const handleSelectAnswer = (optionId: string) => {
    if (!showResult && !isSaving && !disabled) {
      onSelectAnswer(optionId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{questionNumber}</span>
          <span className="text-muted-foreground">of {totalQuestions}</span>
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          {typeConfig && (
            <Badge variant="secondary" className="font-normal">
              {typeConfig.label}
            </Badge>
          )}
          {difficultyConfig && (
            <Badge variant="outline" className="font-normal">
              {difficultyConfig.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="rounded-xl bg-muted/50 p-6">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.isCorrect;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showResult || isSaving || disabled}
              whileHover={!showResult && !isSaving && !disabled ? { scale: 1.01 } : {}}
              whileTap={!showResult && !isSaving && !disabled ? { scale: 0.99 } : {}}
              className={cn(
                'group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
                // Default state
                !isSelected && !showResult && 'border-transparent bg-muted/50 hover:bg-muted',
                // Selected state (during test)
                isSelected && !showResult && 'border-primary bg-primary/5',
                // Correct answer (after submit)
                showCorrect && 'border-emerald-500 bg-emerald-500/10',
                // Wrong answer (after submit)
                showWrong && 'border-rose-500/50 bg-rose-500/5',
                // Unselected after result
                showResult && !isCorrect && !isSelected && 'opacity-50',
                // Disabled state
                (disabled || isSaving) && !showResult && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Option Letter/Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                  // Default
                  !isSelected && !showResult && 'bg-background',
                  // Selected during test
                  isSelected && !showResult && 'bg-primary text-primary-foreground',
                  // Correct
                  showCorrect && 'bg-emerald-500 text-white',
                  // Wrong
                  showWrong && 'bg-rose-500 text-white',
                  // Unselected after result
                  showResult && !isCorrect && !isSelected && 'bg-muted'
                )}
              >
                {showCorrect ? (
                  <Check className="h-5 w-5" />
                ) : showWrong ? (
                  <X className="h-5 w-5" />
                ) : (
                  getOptionLetter(index)
                )}
              </div>

              {/* Option Text */}
              <span
                className={cn(
                  'flex-1',
                  showCorrect && 'font-medium text-emerald-700 dark:text-emerald-300',
                  showWrong && 'text-rose-700 dark:text-rose-300'
                )}
              >
                {option.text}
              </span>

              {/* Result Label */}
              <AnimatePresence>
                {showCorrect && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    Correct
                  </motion.span>
                )}
                {showWrong && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-rose-600 dark:text-rose-400"
                  >
                    Your answer
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Result Summary */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-xl p-4 text-center',
              question.options.find((o) => o.id === selectedAnswer)?.isCorrect
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            )}
          >
            <span className="font-medium">
              {question.options.find((o) => o.id === selectedAnswer)?.isCorrect
                ? '✓ Correct Answer!'
                : '✗ Incorrect Answer'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}