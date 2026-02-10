'use client';

import { Resume, ResumeSectionType } from '@/types/resume.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Languages,
  Trophy,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sectionIcons: Record<ResumeSectionType, React.ElementType> = {
  personalInfo: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderKanban,
  certifications: Award,
  languages: Languages,
  achievements: Trophy,
  customSections: Plus,
};

const sectionLabels: Record<ResumeSectionType, string> = {
  personalInfo: 'Personal Info',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  achievements: 'Achievements',
  customSections: 'Custom Sections',
};

interface EditorSidebarProps {
  resume: Resume;
  activeSection: ResumeSectionType | null;
  onSectionSelect: (section: ResumeSectionType) => void;
}

export function EditorSidebar({
  resume,
  activeSection,
  onSectionSelect,
}: EditorSidebarProps) {
  const { updateCustomization } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleSections = resume.customization.sectionOrder.filter(
    (s) => !resume.customization.hiddenSections.includes(s)
  ) as ResumeSectionType[];

  const hiddenSections = resume.customization.hiddenSections as ResumeSectionType[];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleSections.indexOf(active.id as ResumeSectionType);
      const newIndex = visibleSections.indexOf(over.id as ResumeSectionType);

      const newOrder = arrayMove(visibleSections, oldIndex, newIndex);
      updateCustomization({
        sectionOrder: [...newOrder, ...hiddenSections],
      });
    }
  };

  const toggleSectionVisibility = (section: ResumeSectionType) => {
    if (hiddenSections.includes(section)) {
      // Show section
      updateCustomization({
        hiddenSections: hiddenSections.filter((s) => s !== section),
        sectionOrder: [...visibleSections, section, ...hiddenSections.filter((s) => s !== section)],
      });
    } else {
      // Hide section
      updateCustomization({
        hiddenSections: [...hiddenSections, section],
      });
    }
  };

  const getSectionStatus = (section: ResumeSectionType): 'complete' | 'incomplete' | 'empty' => {
    const content = resume.content[section];
    
    if (!content) return 'empty';
    
    if (Array.isArray(content)) {
      return content.length > 0 ? 'complete' : 'empty';
    }
    
    if (section === 'personalInfo') {
      const info = content as any;
      return info.firstName && info.lastName && info.email ? 'complete' : 'incomplete';
    }
    
    if (section === 'summary') {
      const summary = content as any;
      return summary.content ? 'complete' : 'empty';
    }
    
    if (section === 'customSections') {
      const customSections = resume.content.customSections;
      return customSections && customSections.length > 0 ? 'complete' : 'empty';
    }
    
    return 'complete';
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/30">
      <div className="border-b p-4">
        <h2 className="font-semibold">Sections</h2>
        <p className="text-sm text-muted-foreground">
          Drag to reorder, click to edit
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Visible Sections */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Active Sections
            </h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleSections}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {visibleSections.map((section) => (
                    <SortableSectionItem
                      key={section}
                      section={section}
                      isActive={activeSection === section}
                      status={getSectionStatus(section)}
                      onSelect={() => onSectionSelect(section)}
                      onToggleVisibility={() => toggleSectionVisibility(section)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Hidden Sections */}
          {hiddenSections.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                Hidden Sections
              </h3>
              <div className="space-y-1">
                {hiddenSections.map((section) => (
                  <SectionItem
                    key={section}
                    section={section}
                    isActive={false}
                    isHidden
                    status={getSectionStatus(section)}
                    onSelect={() => onSectionSelect(section)}
                    onToggleVisibility={() => toggleSectionVisibility(section)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Section */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSectionSelect('customSections')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Section
          </Button>
        </div>
      </ScrollArea>

      {/* Completion Status */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completion</span>
          <Badge variant={resume.isComplete ? 'default' : 'secondary'}>
            {resume.isComplete ? 'Complete' : 'Incomplete'}
          </Badge>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${calculateCompletionPercentage(resume)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface SortableSectionItemProps {
  section: ResumeSectionType;
  isActive: boolean;
  status: 'complete' | 'incomplete' | 'empty';
  onSelect: () => void;
  onToggleVisibility: () => void;
}

function SortableSectionItem({
  section,
  isActive,
  status,
  onSelect,
  onToggleVisibility,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg border bg-background p-2 transition-all',
        isActive && 'border-primary bg-primary/5',
        isDragging && 'opacity-50'
      )}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <SectionItemContent
        section={section}
        status={status}
        onSelect={onSelect}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
      >
        <EyeOff className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface SectionItemProps {
  section: ResumeSectionType;
  isActive: boolean;
  isHidden?: boolean;
  status: 'complete' | 'incomplete' | 'empty';
  onSelect: () => void;
  onToggleVisibility: () => void;
}

function SectionItem({
  section,
  isActive,
  isHidden,
  status,
  onSelect,
  onToggleVisibility,
}: SectionItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border bg-background p-2 transition-all',
        isActive && 'border-primary bg-primary/5',
        isHidden && 'opacity-60'
      )}
    >
      <div className="w-4" /> {/* Spacer for alignment */}

      <SectionItemContent
        section={section}
        status={status}
        onSelect={onSelect}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
      >
        <Eye className="h-3 w-3" />
      </Button>
    </div>
  );
}

function SectionItemContent({
  section,
  status,
  onSelect,
}: {
  section: ResumeSectionType;
  status: 'complete' | 'incomplete' | 'empty';
  onSelect: () => void;
}) {
  const Icon = sectionIcons[section];

  return (
    <button
      className="flex flex-1 items-center gap-2 text-left"
      onClick={onSelect}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">
        {sectionLabels[section]}
      </span>
      {status === 'complete' && (
        <Check className="h-3 w-3 text-green-500" />
      )}
      {status === 'incomplete' && (
        <AlertCircle className="h-3 w-3 text-yellow-500" />
      )}
    </button>
  );
}

function calculateCompletionPercentage(resume: Resume): number {
  const requiredSections = ['personalInfo', 'experience', 'education', 'skills'];
  let completed = 0;

  requiredSections.forEach((section) => {
    const content = resume.content[section as ResumeSectionType];
    if (content) {
      if (Array.isArray(content) && content.length > 0) {
        completed++;
      } else if (section === 'personalInfo') {
        const info = content as any;
        if (info.firstName && info.lastName && info.email) {
          completed++;
        }
      }
    }
  });

  return Math.round((completed / requiredSections.length) * 100);
}