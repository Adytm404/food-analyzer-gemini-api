
import React from 'react';
import { FoodEntry } from '../types';
import { formatDateTime } from '../utils/dateHelpers';
import { FireIcon, BeakerIcon, CubeIcon, TrashIcon } from './icons';

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete: (id: string) => void;
}

export const FoodEntryCard: React.FC<FoodEntryCardProps> = ({ entry, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row mb-4 transition-shadow hover:shadow-xl">
      <img 
        src={entry.imageBase64} 
        alt={entry.foodName} 
        className="w-full sm:w-1/3 h-48 sm:h-auto object-cover" 
      />
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-slate-800 capitalize">{entry.foodName}</h3>
            <button 
              onClick={() => onDelete(entry.id)}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
              aria-label="Delete entry"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">{formatDateTime(entry.timestamp)}</p>
          
          <div className="grid grid-cols-3 gap-2 text-xs mt-2 text-slate-600">
            <div className="flex items-center">
              <FireIcon className="text-red-500 mr-1" /> 
              <span>{Math.round(entry.calories)} kcal</span>
            </div>
            <div className="flex items-center">
              <BeakerIcon className="text-yellow-500 mr-1" />
              <span>{entry.fat.toFixed(1)}g fat</span>
            </div>
            <div className="flex items-center">
              <CubeIcon className="text-sky-500 mr-1" />
              <span>{entry.sugar.toFixed(1)}g sugar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
