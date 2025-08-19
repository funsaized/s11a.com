import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { categoryIcons } from '../../data/sampleData';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  className?: string;
}

export function CategoryFilter({ value, onChange, categories, className = "" }: CategoryFilterProps) {
  const handleValueChange = (newValue: string) => {
    // Convert "all" back to empty string for our filtering logic
    onChange(newValue === "all" ? "" : newValue);
  };

  // Convert empty string to "all" for the Select component
  const selectValue = value === "" ? "all" : value;

  return (
    <div className={className}>
      <Select value={selectValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <span>📝</span>
              All Categories
            </span>
          </SelectItem>
          {categories.map((category) => {
            const icon = categoryIcons[category] || '📝';
            return (
              <SelectItem key={category} value={category}>
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  {category}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}