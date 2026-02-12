'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Download,
  Star,
  Zap,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  CheckCircle,
} from 'lucide-react';

const RESUME_TEMPLATES = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'Professional',
    description: 'Clean, modern design perfect for corporate roles',
    image: '/templates/modern-professional.jpg',
    features: ['ATS Optimized', 'Clean Layout', 'Professional'],
    rating: 4.9,
    downloads: 2500,
    recommended: true,
    color: 'blue',
  },
  {
    id: 'tech-focused',
    name: 'Tech Focused',
    category: 'Technology',
    description: 'Designed specifically for software developers and engineers',
    image: '/templates/tech-focused.jpg',
    features: ['Code Sections', 'Project Showcase', 'Skills Matrix'],
    rating: 4.8,
    downloads: 1800,
    recommended: false,
    color: 'green',
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    category: 'Creative',
    description: 'Stylish template for designers and creative professionals',
    image: '/templates/creative-designer.jpg',
    features: ['Portfolio Section', 'Visual Appeal', 'Color Accents'],
    rating: 4.7,
    downloads: 1200,
    recommended: false,
    color: 'purple',
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    category: 'Minimalist',
    description: 'Simple, elegant design that focuses on content',
    image: '/templates/minimalist-clean.jpg',
    features: ['Minimal Design', 'Easy to Read', 'ATS Friendly'],
    rating: 4.9,
    downloads: 3200,
    recommended: true,
    color: 'gray',
  },
  {
    id: 'business-executive',
    name: 'Business Executive',
    category: 'Executive',
    description: 'Professional template for senior-level positions',
    image: '/templates/business-executive.jpg',
    features: ['Executive Summary', 'Achievement Focus', 'Premium Look'],
    rating: 4.6,
    downloads: 900,
    recommended: false,
    color: 'indigo',
  },
  {
    id: 'fresh-graduate',
    name: 'Fresh Graduate',
    category: 'Entry Level',
    description: 'Perfect for new graduates and entry-level positions',
    image: '/templates/fresh-graduate.jpg',
    features: ['Education Focus', 'Skills Highlight', 'Project Section'],
    rating: 4.8,
    downloads: 2100,
    recommended: true,
    color: 'emerald',
  },
];

const CATEGORIES = ['All', 'Professional', 'Technology', 'Creative', 'Minimalist', 'Executive', 'Entry Level'];

interface ResumeTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate: string | null;
}

export function ResumeTemplates({ onSelectTemplate, selectedTemplate }: ResumeTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = selectedCategory === 'All' 
    ? RESUME_TEMPLATES 
    : RESUME_TEMPLATES.filter(template => template.category === selectedCategory);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
      green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
      purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
      gray: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950',
      indigo: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950',
      emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-xs"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className={`relative h-48 rounded-t-lg ${getColorClasses(template.color)} flex items-center justify-center`}>
                  {template.recommended && (
                    <Badge className="absolute top-3 left-3 gap-1 text-xs">
                      <Star className="h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                  
                  {selectedTemplate === template.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  {/* Mock Resume Preview */}
                  <div className="w-32 h-40 bg-white dark:bg-gray-900 rounded shadow-sm border p-2 text-xs">
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                      <div className="space-y-0.5">
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
                      </div>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                      <div className="space-y-0.5">
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        {template.rating}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs px-2 py-0.5">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.downloads.toLocaleString()} downloads</span>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template.id);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle download
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Template Actions */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">
                    {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                  </span>
                  <span className="text-muted-foreground"> selected</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Zap className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}