// app/practice/mockdrive/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Brain, 
  Code2, 
  Mic, 
  Save, 
  Layers,
  Settings2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../../../components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { apiClient } from '../../../../lib/api/axios-instance';
import { API_ENDPOINTS } from '../../../../lib/api/endpoints';

// Constants
const MODULE_TYPES = [
  { id: 'APTITUDE', name: 'Aptitude Test', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'MACHINE_CODING', name: 'Machine Coding', icon: Code2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'AI_INTERVIEW', name: 'AI Interview', icon: Mic, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];

export default function CreateMockDrive() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modules: [] as any[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addModule = (type: string) => {
    const newModule = {
      moduleType: type,
      order: formData.modules.length,
      name: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      timeLimit: type === 'APTITUDE' ? 30 : type === 'MACHINE_CODING' ? 60 : 15,
      config: type === 'APTITUDE' ? {
        difficulty: 'MEDIUM',
        questionTypes: ['QUANTITATIVE', 'LOGICAL'],
        numberOfQuestions: 20
      } : type === 'MACHINE_CODING' ? {
        difficulty: 'MEDIUM',
        numberOfQuestions: 2
      } : {
        difficulty: 'MID', // AI Interview uses AIInterviewDifficulty enum
        jobTitle: formData.title || 'Software Engineer',
        focusAreas: ['Data Structures', 'System Design'],
        targetQuestions: 10
      }
    };
    setFormData(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i }))
    }));
  };

  const updateModule = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => i === index ? { ...m, ...updates } : m)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) return alert('Title is required');
    if (formData.modules.length === 0) return alert('Please add at least one module');

    try {
      setIsSubmitting(true);
      await apiClient.post(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.BASE, formData);
      router.push('/practice/mockdrive');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create mockdrive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">New MockDrive</h1>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={cn(
                "h-2 w-12 rounded-full transition-all duration-300",
                step >= s ? "bg-primary" : "bg-muted"
              )} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }}
          >
            <Card className="rounded-3xl border-2 p-4">
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>Give your mockdrive a name and a description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                  <Input 
                    placeholder="e.g. SDE-1 Preparation Marathon" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 border-2 text-lg focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                  <Textarea 
                    placeholder="What is this drive about?" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[150px] border-2 text-base focus:border-primary/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button size="lg" className="h-12 gap-2" onClick={() => formData.title && setStep(2)} disabled={!formData.title}>
                  Continue to Modules
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">MockDrive Rounds</h2>
              <div className="flex gap-2">
                {MODULE_TYPES.map(type => (
                  <Button 
                    key={type.id}
                    variant="outline" 
                    size="sm" 
                    className="gap-1 rounded-full hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => addModule(type.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add {type.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>

            {formData.modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center">
                <Layers className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No rounds added yet</h3>
                <p className="max-w-xs text-sm text-muted-foreground">Add aptitude, coding, or interview rounds from the buttons above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.modules.map((m, index) => {
                  const type = MODULE_TYPES.find(t => t.id === m.moduleType)!;
                  return (
                    <Card key={index} className="overflow-hidden border-2 transition-all hover:border-primary/20">
                      <div className="flex items-center gap-4 border-b bg-muted/30 px-6 py-4">
                        <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl", type.bg)}>
                          <type.icon className={cn("h-5 w-5", type.color)} />
                        </div>
                        <div className="flex-1">
                          <Input 
                            value={m.name} 
                            onChange={e => updateModule(index, { name: e.target.value })}
                            className="h-9 border-none bg-transparent p-0 font-bold focus-visible:ring-0"
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeModule(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Limit (Min)</label>
                          <Input 
                            type="number"
                            value={m.timeLimit}
                            onChange={e => updateModule(index, { timeLimit: parseInt(e.target.value) || 0 })}
                            className="border-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                          <Select 
                            value={m.config.difficulty} 
                            onValueChange={val => updateModule(index, { config: { ...m.config, difficulty: val } })}
                          >
                            <SelectTrigger className="border-2 uppercase">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="uppercase">
                              {m.moduleType === 'AI_INTERVIEW' 
                                ? ['ENTRY', 'MID', 'SENIOR'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)
                                : DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                             {m.moduleType === 'AI_INTERVIEW' ? 'Target Questions' : 'Num Questions'}
                           </label>
                           <Input 
                            type="number"
                            value={m.moduleType === 'AI_INTERVIEW' ? m.config.targetQuestions : m.config.numberOfQuestions}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              const field = m.moduleType === 'AI_INTERVIEW' ? 'targetQuestions' : 'numberOfQuestions';
                              updateModule(index, { config: { ...m.config, [field]: val } });
                            }}
                            className="border-2"
                          />
                        </div>
                        {m.moduleType === 'AI_INTERVIEW' && (
                          <>
                            <div className="space-y-2 col-span-full">
                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Role / Job Title</label>
                              <Input 
                                value={m.config.jobTitle}
                                onChange={e => updateModule(index, { config: { ...m.config, jobTitle: e.target.value } })}
                                className="border-2"
                                placeholder="e.g. Frontend Developer, Backend Engineer..."
                              />
                            </div>
                            <div className="space-y-2 col-span-full">
                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus Areas (Comma separated)</label>
                              <Input 
                                value={m.config.focusAreas.join(', ')}
                                onChange={e => updateModule(index, { 
                                  config: { 
                                    ...m.config, 
                                    focusAreas: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') 
                                  } 
                                })}
                                className="border-2"
                                placeholder="e.g. React, Node.js, System Design..."
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-8">
              <Button variant="outline" size="lg" className="h-12" onClick={() => setStep(1)}>
                Back to Details
              </Button>
              <Button size="lg" className="h-12 gap-2" onClick={() => formData.modules.length > 0 && setStep(3)} disabled={formData.modules.length === 0}>
                Review & Create
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }}
          >
             <Card className="rounded-3xl border-2">
              <CardHeader className="text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
                <CardTitle>Ready to Save?</CardTitle>
                <CardDescription>Review your mockdrive configuration before creating.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border-2 bg-muted/20 p-6">
                  <h3 className="text-lg font-bold">{formData.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{formData.description || "No description."}</p>
                  
                  <div className="mt-6 space-y-3">
                    {formData.modules.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                        <Badge variant="outline" className="h-6 w-6 shrink-0 justify-center rounded-full p-0">
                          {i + 1}
                        </Badge>
                        <span className="font-semibold">{m.name}</span>
                        <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
                           <Badge variant="secondary" className="scale-90">{m.moduleType}</Badge>
                           <span>•</span>
                           <span>{m.timeLimit} MIN</span>
                           <span>•</span>
                           <span>{m.config.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="h-14 w-full gap-2 text-lg font-bold shadow-lg" onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="h-5 w-5" />
                  {isSubmitting ? 'Creating MockDrive...' : 'Create Individual MockDrive'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                  Change Round Configuration
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
