'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  GripVertical,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  useAddTestQuestion,
  useUpdateTestQuestion,
  useDeleteTestQuestion
} from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';
import { LmsTestQuestionAdmin } from '@/types/lms-admin.types';

interface TestQuestionsManagerProps {
  testId: string;
  testType: 'module' | 'final';
  questions: LmsTestQuestionAdmin[];
}

export function TestQuestionsManager({ testId, testType, questions }: TestQuestionsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);

  const addQuestionMutation = useAddTestQuestion();
  const updateQuestionMutation = useUpdateTestQuestion();
  const deleteQuestionMutation = useDeleteTestQuestion();

  const handleAddQuestion = async () => {
    try {
      const data: any = {
        questionText: 'New Question',
        explanation: '',
        order: questions.length + 1,
        points: 1,
        isActive: true,
        options: [
          { text: 'Option 1', isCorrect: true, order: 1 },
          { text: 'Option 2', isCorrect: false, order: 2 },
        ],
      };

      if (testType === 'module') data.moduleTestId = testId;
      else data.finalTestId = testId;

      await addQuestionMutation.mutateAsync(data);
      toast.success('Question added!');
      setIsAdding(false);
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Test Questions ({questions.length})</h3>
        <Button onClick={handleAddQuestion} disabled={addQuestionMutation.isPending}>
          {addQuestionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No questions added yet to this test.</p>
            <Button variant="link" onClick={handleAddQuestion} className="mt-2">
              Create your first question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onUpdate={(data) => updateQuestionMutation.mutateAsync({ id: question.id, data })}
                onDelete={() => deleteQuestionMutation.mutateAsync(question.id)}
                isUpdating={updateQuestionMutation.isPending}
                isDeleting={deleteQuestionMutation.isPending}
              />
            ))}
        </div>
      )}
    </div>
  );
}

interface QuestionEditorProps {
  question: LmsTestQuestionAdmin;
  index: number;
  onUpdate: (data: any) => Promise<any>;
  onDelete: () => Promise<any>;
  isUpdating: boolean;
  isDeleting: boolean;
}

function QuestionEditor({ question, index, onUpdate, onDelete, isUpdating, isDeleting }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localData, setLocalData] = useState(question);
  const [isDirty, setIsDirty] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setLocalData({ ...localData, [field]: value });
    setIsDirty(true);
  };

  const handleOptionChange = (optIndex: number, field: string, value: any) => {
    const newOptions = [...localData.options];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };

    // If setting isCorrect to true, set all others to false
    if (field === 'isCorrect' && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== optIndex) opt.isCorrect = false;
      });
    }

    setLocalData({ ...localData, options: newOptions });
    setIsDirty(true);
  };

  const addOption = () => {
    setLocalData({
      ...localData,
      options: [
        ...localData.options,
        { text: '', isCorrect: false, order: localData.options.length + 1 } as any
      ]
    });
    setIsDirty(true);
  };

  const removeOption = (optIndex: number) => {
    const newOptions = localData.options.filter((_, i) => i !== optIndex);
    setLocalData({ ...localData, options: newOptions });
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // Map localData to UpdateTestQuestionDto
      const updateData: any = {
        questionText: localData.questionText,
        explanation: localData.explanation,
        order: localData.order,
        points: localData.points,
        isActive: localData.isActive,
        options: localData.options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order
        }))
      };

      await onUpdate(updateData);
      setIsDirty(false);
      toast.success('Question saved');
    } catch (error) {
      toast.error('Error saving question');
    }
  };


  return (
    <Card className={`transition-all ${isExpanded ? 'ring-1 ring-primary' : ''}`}>
      <CardHeader className="p-4 flex flex-row items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary">Q{index + 1}.</span>
            <span className="font-medium line-clamp-1">{localData.questionText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{localData.options.length} options</Badge>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 border-t space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Question Text</Label>
              <Textarea
                value={localData.questionText}
                onChange={(e) => handleFieldChange('questionText', e.target.value)}
                placeholder="Enter your question here..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {localData.options.map((option, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={option.isCorrect ? 'text-green-600' : 'text-muted-foreground'}
                      onClick={() => handleOptionChange(optIdx, 'isCorrect', !option.isCorrect)}
                    >
                      {option.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </Button>
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(optIdx, 'text', e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => removeOption(optIdx)}
                      disabled={localData.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Explanation (Shown after answering)</Label>
              <Textarea
                value={localData.explanation || ''}
                onChange={(e) => handleFieldChange('explanation', e.target.value)}
                placeholder="Why is the correct answer correct?"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${question.id}`}
                    checked={localData.isActive}
                    onCheckedChange={(val) => handleFieldChange('isActive', val)}
                  />
                  <Label htmlFor={`active-${question.id}`}>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Points:</Label>
                  <Input
                    type="number"
                    className="w-16 h-8"
                    value={localData.points}
                    onChange={(e) => handleFieldChange('points', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isDirty || isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function HelpCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "secondary" | "outline", className?: string }) {
  const classes = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-input bg-background"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${classes[variant]} ${className}`}>
      {children}
    </span>
  );
}