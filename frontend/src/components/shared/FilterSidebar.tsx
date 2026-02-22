// src/components/shared/FilterSidebar.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X,
  ChevronDown
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range' | 'select';
}

interface FilterSidebarProps {
  sections: FilterSection[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (sectionId: string, value: string) => void;
  onClearAll: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sections,
  selectedFilters,
  onFilterChange,
  onClearAll,
  onSearchChange,
  searchQuery,
}) => {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="border-2 dark:bg-card/50 dark:backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-muted/50 border-none transition-all focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <Separator />

          <Accordion type="multiple" defaultValue={sections.map(s => s.id)}>
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm">
                  {section.label}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    {section.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${section.id}-${option.value}`}
                          checked={selectedFilters[section.id]?.includes(option.value)}
                          onCheckedChange={() => onFilterChange(section.id, option.value)}
                          className="h-4 w-4 rounded border-primary/30 data-[state=checked]:bg-primary"
                        />
                        <Label 
                          htmlFor={`${section.id}-${option.value}`}
                          className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Active Filters Summary (Visible on Desktop) */}
      {Object.values(selectedFilters).some(f => f.length > 0) && (
        <div className="flex flex-wrap gap-2">
           {Object.entries(selectedFilters).map(([sectionId, values]) => 
             values.map(val => (
               <Badge key={`${sectionId}-${val}`} variant="secondary" className="gap-1 pr-1">
                 {val.replace('_', ' ').toLowerCase()}
                 <X 
                   className="h-3 w-3 cursor-pointer hover:text-primary" 
                   onClick={() => onFilterChange(sectionId, val)}
                 />
               </Badge>
             ))
           )}
        </div>
      )}
    </div>
  );
};
