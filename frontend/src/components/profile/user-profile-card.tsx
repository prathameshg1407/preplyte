// src/components/profile/user-profile-card.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Check,
  X,
  Loader2,
  Mail,
  Building2,
  Calendar,
  Settings,
  Shield,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  PLACEMENT_CELL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  ADMIN: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export function UserProfileCard() {
  const { userProfile, updateUserProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    try {
      await updateUserProfile({ name });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleCancel = () => {
    setName(userProfile?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!userProfile) {
    return null;
  }

  const initials = (userProfile.name || userProfile.email)
    .split(/[\s@]/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = userProfile.role.replace('_', ' ');

  return (
    <Card className="overflow-hidden">
      {/* Header Background */}
      <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute right-3 top-3 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Link href="/profile/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
      </div>

      <CardContent className="pt-14 pb-6 px-6 space-y-6">
        {/* Name Section */}
        <div className="space-y-1">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your name"
                  className="h-9 text-lg font-semibold"
                  autoFocus
                  disabled={isUpdating}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isUpdating || !name.trim()}
                  className="h-9 w-9 shrink-0"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="h-9 w-9 shrink-0"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group flex items-center gap-2"
              >
                <h2 className="text-xl font-semibold">
                  {userProfile.name || 'No name set'}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-xs text-emerald-600"
                    >
                      <Check className="h-3 w-3" />
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Badge */}
          <Badge
            variant="outline"
            className={cn('font-normal', ROLE_COLORS[userProfile.role] || ROLE_COLORS.STUDENT)}
          >
            <Shield className="mr-1 h-3 w-3" />
            {roleLabel}
          </Badge>
        </div>

        {/* Info Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="truncate font-medium text-sm">{userProfile.email}</p>
            </div>
          </div>

          {userProfile.instituteName && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Institute</p>
                <p className="truncate font-medium text-sm">{userProfile.instituteName}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="font-medium text-sm">
                {format(new Date(userProfile.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}