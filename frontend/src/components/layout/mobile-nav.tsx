// src/components/layout/mobile-nav.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Bell,
  LogOut,
  Settings,
  User,
  Zap,
  Trophy,
  BarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  links: any[];
  adminLinks?: any[];
  isAuthenticated: boolean;
  user: any;
  notifications?: number;
  onClose: () => void;
}

export function MobileNav({
  links,
  adminLinks = [],
  isAuthenticated,
  user,
  notifications = 0,
  onClose,
}: MobileNavProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="md:hidden border-t bg-background">
      <div className="container py-4 space-y-3">
        {/* User Info (if authenticated) */}
        {isAuthenticated && user && (
          <>
            <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name || user.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1 text-orange-500" />
                      7 day streak
                    </Badge>
                  </div>
                </div>
              </div>
              {notifications > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => handleNavigation('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    {notifications}
                  </span>
                </Button>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Quick Actions (if authenticated) */}
        {isAuthenticated && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleNavigation('/practice/aptitude')}
              >
                <Zap className="h-4 w-4" />
                Quick Practice
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleNavigation('/leaderboard')}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </div>
            <Separator />
          </>
        )}

        {/* Navigation Links */}
        <Accordion type="single" collapsible className="w-full">
          {links.map((link, index) => {
            if (link.children) {
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-6">
                      {link.children.map((child: any) => (
                        <button
                          key={child.href}
                          onClick={() => handleNavigation(child.href)}
                          className="w-full flex items-start gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                          <child.icon className="h-4 w-4 mt-0.5" />
                          <div className="text-left">
                            <div>{child.label}</div>
                            {child.description && (
                              <div className="text-xs opacity-70">
                                {child.description}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            return (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </button>
            );
          })}

          {/* Admin Links */}
          {adminLinks.length > 0 && (
            <>
              <Separator className="my-2" />
              {adminLinks.map((link: any) => (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link.href)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              ))}
            </>
          )}
        </Accordion>

        {/* Auth Section */}
        <Separator />
        {isAuthenticated ? (
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation('/performance')}
            >
              <BarChart className="h-4 w-4" />
              My Performance
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={() => {
                // Handle logout
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleNavigation('/login')}
            >
              Login
            </Button>
            <Button onClick={() => handleNavigation('/register')}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}