// src/components/profile/skills-manager.tsx

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Sparkles, Code, Briefcase, Search } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { cn } from '@/lib/utils';

const SKILL_CATEGORIES = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
  'Frontend': ['React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
  'Backend': ['Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot', 'GraphQL'],
  'Database': ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase'],
  'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux'],
  'Other': ['Machine Learning', 'Data Structures', 'Algorithms', 'REST APIs', 'System Design'],
};

const ALL_SUGGESTED_SKILLS = Object.values(SKILL_CATEGORIES).flat();

export function SkillsManager() {
  const { studentProfile, addSkills, removeSkills, isUpdating } = useProfile();
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSkills = studentProfile?.skills || [];
  const remainingSlots = 20 - currentSkills.length;

  const filteredSuggestions = ALL_SUGGESTED_SKILLS.filter(
    (skill) =>
      !currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase()) &&
      skill.toLowerCase().includes(newSkill.toLowerCase())
  ).slice(0, 8);

  const handleAddSkill = async (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill || currentSkills.length >= 20) return;
    if (currentSkills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())) return;

    setIsAdding(true);
    try {
      await addSkills([trimmedSkill]);
      setNewSkill('');
      setShowSuggestions(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    setRemovingSkill(skill);
    try {
      await removeSkills([skill]);
    } finally {
      setRemovingSkill(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(newSkill);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Skills</CardTitle>
              <CardDescription>Showcase your technical expertise</CardDescription>
            </div>
          </div>
          <Badge
            variant={remainingSlots > 5 ? 'secondary' : remainingSlots > 0 ? 'outline' : 'destructive'}
            className="font-mono"
          >
            {currentSkills.length}/20
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Current Skills */}
        <div className="min-h-[60px]">
          {currentSkills.length > 0 ? (
            <motion.div className="flex flex-wrap gap-2" layout>
              <AnimatePresence mode="popLayout">
                {currentSkills.map((skill) => (
                  <motion.div
                    key={skill}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        'group h-8 gap-1.5 pl-3 pr-1.5 text-sm font-medium transition-colors',
                        removingSkill === skill && 'opacity-50'
                      )}
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={removingSkill === skill || isUpdating}
                        className="ml-0.5 rounded-full p-0.5 opacity-60 transition-all hover:bg-destructive hover:text-destructive-foreground hover:opacity-100"
                      >
                        {removingSkill === skill ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-8 text-center">
              <div className="space-y-2">
                <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No skills added yet</p>
                <p className="text-xs text-muted-foreground">Start typing to add your first skill</p>
              </div>
            </div>
          )}
        </div>

        {/* Add New Skill */}
        {currentSkills.length < 20 && (
          <div className="space-y-4">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Type a skill or search suggestions..."
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(newSkill.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                  disabled={isAdding}
                  className="h-11 pl-10 pr-12"
                />
                <Button
                  size="icon"
                  onClick={() => handleAddSkill(newSkill)}
                  disabled={!newSkill.trim() || isAdding}
                  className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-1 shadow-lg"
                  >
                    {filteredSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        {skill}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Add Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Popular skills
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_SUGGESTED_SKILLS.filter(
                  (skill) => !currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
                )
                  .slice(0, 10)
                  .map((skill) => (
                    <motion.button
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddSkill(skill)}
                      disabled={isAdding || isUpdating}
                      className="flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                      {skill}
                    </motion.button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Max Skills Warning */}
        {currentSkills.length >= 20 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
            Maximum skills reached. Remove some to add new ones.
          </div>
        )}
      </CardContent>
    </Card>
  );
}