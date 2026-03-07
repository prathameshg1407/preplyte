// src/components/hackathons/HackathonCard.tsx

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Globe, 
  ArrowRight,
  Zap,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hackathon, HackathonStatus } from '@/types/event.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HackathonCardProps {
  hackathon: Hackathon;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
  const startDate = new Date(hackathon.eventStartDate);
  const isRegistrationOpen = hackathon.status === HackathonStatus.REGISTRATION_OPEN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-xl dark:bg-card/50 dark:backdrop-blur-sm">
        <div className="relative aspect-video w-full overflow-hidden">
          {hackathon.bannerUrl ? (
            <img 
              src={hackathon.bannerUrl} 
              alt={hackathon.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent">
              <Trophy className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none">
              {hackathon.mode}
            </Badge>
            {isRegistrationOpen && (
              <Badge className="bg-emerald-500 text-white border-none animate-pulse">
                Registration Open
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <h3 className="line-clamp-1 text-xl font-bold tracking-tight">
            {hackathon.title}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground italic">
            {hackathon.tagline || 'Innovation begins here'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {hackathon.themes.slice(0, 3).map(theme => (
              <Badge key={theme} variant="outline" className="text-[10px] sm:text-xs">
                {theme}
              </Badge>
            ))}
            {hackathon.themes.length > 3 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                +{hackathon.themes.length - 3}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(startDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{hackathon.minTeamSize}-{hackathon.maxTeamSize} per team</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button asChild className="w-full gap-2 group" variant={isRegistrationOpen ? 'default' : 'outline'}>
            <Link href={`/hackathons/${hackathon.id}`}>
              {isRegistrationOpen ? 'Register Now' : 'View Details'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
