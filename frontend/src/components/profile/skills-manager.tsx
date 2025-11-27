// src/components/profile/skills-manager.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';

const SUGGESTED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'Git',
  'AWS',
  'Docker',
  'Machine Learning',
  'Data Structures',
  'Algorithms',
  'REST APIs',
  'GraphQL',
];

export function SkillsManager() {
  const { studentProfile, addSkills, removeSkills, isUpdating } = useProfile();
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);

  const currentSkills = studentProfile?.skills || [];
  const suggestedToShow = SUGGESTED_SKILLS.filter(
    (skill) => !currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
  ).slice(0, 8);

  const handleAddSkill = async (skill: string) => {
    if (!skill.trim() || currentSkills.length >= 20) return;

    setIsAdding(true);
    try {
      await addSkills([skill.trim()]);
      setNewSkill('');
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
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skills</CardTitle>
        <CardDescription>
          {currentSkills.length}/20 skills added
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Skills */}
        <div className="flex flex-wrap gap-2">
          {currentSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="pl-3 pr-1 py-1 flex items-center gap-1"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                disabled={removingSkill === skill || isUpdating}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                {removingSkill === skill ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </Badge>
          ))}
          {currentSkills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>

        {/* Add New Skill */}
        {currentSkills.length < 20 && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAdding}
              className="flex-1"
            />
            <Button
              onClick={() => handleAddSkill(newSkill)}
              disabled={!newSkill.trim() || isAdding}
              size="icon"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Suggested Skills */}
        {suggestedToShow.length > 0 && currentSkills.length < 20 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggested skills:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedToShow.map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSkill(skill)}
                  disabled={isAdding || isUpdating}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}