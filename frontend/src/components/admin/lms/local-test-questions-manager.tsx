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
    GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { NestedQuestionDto } from '@/types/lms-admin.types';

interface LocalTestQuestionsManagerProps {
    questions: NestedQuestionDto[];
    onChange: (questions: NestedQuestionDto[]) => void;
    maxQuestions?: number;
}

export function LocalTestQuestionsManager({ questions = [], onChange, maxQuestions }: LocalTestQuestionsManagerProps) {
    const handleAddQuestion = () => {
        if (maxQuestions && questions.length >= maxQuestions) {
            toast.error(`Maximum ${maxQuestions} questions allow.`);
            return;
        }

        const newQuestion: NestedQuestionDto = {
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

        onChange([...questions, newQuestion]);
        toast.success('Question added locally');
    };

    const handleUpdateQuestion = (index: number, updatedQuestion: NestedQuestionDto) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        onChange(newQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        // Reorder remaining questions
        const reordered = newQuestions.map((q, i) => ({ ...q, order: i + 1 }));
        onChange(reordered);
        toast.success('Question removed');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Test Questions ({questions.length})</h3>
                <Button onClick={handleAddQuestion} type="button" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {questions.length === 0 ? (
                <Card className="border-dashed py-8">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <HelpCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground text-sm">No questions added yet.</p>
                        <Button variant="link" onClick={handleAddQuestion} type="button" className="mt-2">
                            Add your first question
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <QuestionEditor
                            key={index}
                            question={question}
                            index={index}
                            onUpdate={(data) => handleUpdateQuestion(index, data)}
                            onDelete={() => handleDeleteQuestion(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface QuestionEditorProps {
    question: NestedQuestionDto;
    index: number;
    onUpdate: (data: NestedQuestionDto) => void;
    onDelete: () => void;
}

function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // We operate directly on props because parent manages state, but to avoid too many re-renders 
    // we could use local state. However, for simplicity and correctness with RHF, let's bubble up changes immediately
    // or use local state and "Save" button? 
    // User expects "Save" usually. Let's stick to local state and explicit save to parent.

    const [localData, setLocalData] = useState<NestedQuestionDto>(question);
    const [isDirty, setIsDirty] = useState(false);

    const handleFieldChange = (field: keyof NestedQuestionDto, value: any) => {
        setLocalData({ ...localData, [field]: value });
        setIsDirty(true);
    };

    const handleOptionChange = (optIndex: number, field: string, value: any) => {
        const newOptions = [...localData.options];
        newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };

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
                { text: '', isCorrect: false, order: localData.options.length + 1 }
            ]
        });
        setIsDirty(true);
    };

    const removeOption = (optIndex: number) => {
        const newOptions = localData.options.filter((_, i) => i !== optIndex);
        setLocalData({ ...localData, options: newOptions });
        setIsDirty(true);
    };

    const handleSave = () => {
        onUpdate(localData);
        setIsDirty(false);
        toast.success('Question updated locally');
        setIsExpanded(false);
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
                        <span className="text-xs text-muted-foreground">{localData.options.length} options</span>
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
                                <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Explanation</Label>
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
                                        id={`active-${index}`}
                                        checked={localData.isActive}
                                        onCheckedChange={(val) => handleFieldChange('isActive', val)}
                                    />
                                    <Label htmlFor={`active-${index}`}>Active</Label>
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
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!isDirty}
                                >
                                    <Save className="h-4 w-4 mr-2" />
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
