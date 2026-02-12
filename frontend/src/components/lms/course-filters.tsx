'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Filter,
  X,
  Star,
  Clock,
  DollarSign,
} from 'lucide-react';

interface FilterOptions {
  categories: string[];
  levels: string[];
  durations: string[];
  priceRange: [number, number];
  ratings: number[];
}

interface CourseFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function CourseFilters({ filters, onFiltersChange, onClearFilters }: CourseFiltersProps) {
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Programming',
    'Design',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  
  const durations = [
    'Under 10 hours',
    '10-30 hours',
    '30-50 hours',
    'Over 50 hours',
  ];

  const ratings = [4.5, 4.0, 3.5, 3.0];

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filters.levels, level]
      : filters.levels.filter(l => l !== level);
    
    onFiltersChange({
      ...filters,
      levels: newLevels,
    });
  };

  const handleDurationChange = (duration: string, checked: boolean) => {
    const newDurations = checked
      ? [...filters.durations, duration]
      : filters.durations.filter(d => d !== duration);
    
    onFiltersChange({
      ...filters,
      durations: newDurations,
    });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const newRatings = checked
      ? [...filters.ratings, rating]
      : filters.ratings.filter(r => r !== rating);
    
    onFiltersChange({
      ...filters,
      ratings: newRatings,
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.levels.length > 0 ||
    filters.durations.length > 0 ||
    filters.ratings.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <h4 className="font-medium mb-3">Level</h4>
          <div className="space-y-2">
            {levels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={filters.levels.includes(level)}
                  onCheckedChange={(checked) => 
                    handleLevelChange(level, checked as boolean)
                  }
                />
                <label
                  htmlFor={`level-${level}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="font-medium mb-3">Duration</h4>
          <div className="space-y-2">
            {durations.map((duration) => (
              <div key={duration} className="flex items-center space-x-2">
                <Checkbox
                  id={`duration-${duration}`}
                  checked={filters.durations.includes(duration)}
                  onCheckedChange={(checked) => 
                    handleDurationChange(duration, checked as boolean)
                  }
                />
                <label
                  htmlFor={`duration-${duration}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {duration}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </h4>
          <div className="space-y-3">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating
          </h4>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={(checked) => 
                    handleRatingChange(rating, checked as boolean)
                  }
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  {rating}
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  & up
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}