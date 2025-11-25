'use client';

import { useRouter } from 'next/navigation';
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuGroup,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import {
User,
Settings,
Trophy,
LogOut,
HelpCircle,
} from 'lucide-react';

export function UserMenu() {
const router = useRouter();
const { user, logout } = useAuth();

if (!user) return null;

const initials = user.name
? user.name
.split(' ')
.map((n) => n)
.join('')
.toUpperCase()
.slice(0, 2)
: user.email.slice(0, 2).toUpperCase();

// Safely format role label
const rawRole = user.role ?? 'USER'; // or 'Member' or anything you prefer
const roleLabel = rawRole
.toString()
.replace(/_/g, ' ')
.toLowerCase()
.replace(/\b\w/g, (l) => l.toUpperCase());

const handleLogout = () => {
logout();
// optionally redirect after logout:
// router.push('/login');
};

return (
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="ghost" className="relative h-10 w-10 rounded-full">
<Avatar className="h-10 w-10">
<AvatarFallback className="bg-primary text-primary-foreground">
{initials}
</AvatarFallback>
</Avatar>
</Button>
</DropdownMenuTrigger>


  <DropdownMenuContent className="w-56" align="end">
    <DropdownMenuLabel>
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">{user.name || 'User'}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <span className="text-xs text-primary">{roleLabel}</span>
      </div>
    </DropdownMenuLabel>

    <DropdownMenuSeparator />

    <DropdownMenuGroup>
      <DropdownMenuItem onClick={() => router.push('/profile')}>
        <User className="mr-2 h-4 w-4" />
        My Profile
      </DropdownMenuItem>

      {rawRole === 'USER' && (
        <DropdownMenuItem
          onClick={() => router.push('/dashboard/performance')}
        >
          <Trophy className="mr-2 h-4 w-4" />
          Performance
        </DropdownMenuItem>
      )}

      <DropdownMenuItem onClick={() => router.push('/settings')}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => router.push('/help')}>
        <HelpCircle className="mr-2 h-4 w-4" />
        Help &amp; Support
      </DropdownMenuItem>
    </DropdownMenuGroup>

    <DropdownMenuSeparator />

    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
);
}