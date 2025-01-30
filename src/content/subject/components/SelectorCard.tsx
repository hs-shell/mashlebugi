import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectorCardProps {
  title: string;
  items: string[];
  selectedItem: string | null;
  onSelect: (item: string) => void;
}

const SelectorCard: React.FC<SelectorCardProps> = ({ title, items, selectedItem, onSelect }) => {
  return (
    <Card className="bg-white shadow-md border-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 gap-2">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className={`p-3 rounded-lg text-left transition-colors duration-200 ${
                  selectedItem === item ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SelectorCard;
