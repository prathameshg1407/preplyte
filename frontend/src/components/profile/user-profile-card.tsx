// src/components/profile/user-profile-card.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X, Loader2, Mail, Building2, Calendar } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { format } from 'date-fns';

export function UserProfileCard() {
  const { userProfile, updateUserProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');

  const handleSave = async () => {
    try {
      await updateUserProfile({ name });
      setIsEditing(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleCancel = () => {
    setName(userProfile?.name || '');
    setIsEditing(false);
  };

  if (!userProfile) {
    return null;
  }

  const initials = (userProfile.name || userProfile.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-8 w-48"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="h-8 w-8"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    {userProfile.name || 'No name set'}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Badge variant="outline" className="mt-1">
                {userProfile.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {userProfile.email}
        </div>
        {userProfile.instituteName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {userProfile.instituteName}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Joined {format(new Date(userProfile.createdAt), 'MMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
}