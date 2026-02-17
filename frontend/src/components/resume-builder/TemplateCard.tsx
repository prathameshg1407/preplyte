import React from 'react';
import { ResumeTemplate } from '@/types/resume.types';
import { TemplatePreview } from './TemplatePreview';

interface TemplateCardProps {
  template: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
  isSelected?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  isSelected = false,
}) => {
  return (
    <div
      className={`group relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(template)}
    >
      {/* Preview Container */}
      <div className="relative w-full aspect-[8.5/11] bg-white overflow-hidden">
        <TemplatePreview template={template} />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Use Template
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
          {template.isPremium && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Premium
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            {template.category}
          </span>
          
          {isSelected && (
            <span className="text-blue-600 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
