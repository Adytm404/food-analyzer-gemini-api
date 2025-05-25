import React from 'react';
import { NutritionData, FoodComponent } from '../types';
import { FireIcon, BeakerIcon, CubeIcon } from './icons';

interface NutritionDisplayProps {
  data: NutritionData | null;
}

const StatItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number, unit: string, colorClass: string }> = ({ icon, label, value, unit, colorClass }) => (
  <div className={`flex-1 p-4 rounded-lg shadow ${colorClass} text-white`}>
    <div className="flex items-center mb-1">
      {icon}
      <h3 className="ml-2 text-sm font-medium uppercase tracking-wider">{label}</h3>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm opacity-80">{unit}</p>
  </div>
);

const ComponentItem: React.FC<{ component: FoodComponent }> = ({ component }) => (
  <li className="flex justify-between items-center py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-md">
    <span className="text-slate-700 capitalize">{component.name}</span>
    <span className="font-semibold text-slate-600">{Math.round(component.calories)} kcal</span>
  </li>
);

export const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg text-center text-slate-500">
        <p>Upload an image to see nutrition estimates.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 sm:p-6 bg-white rounded-xl shadow-xl w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-4 capitalize text-center">
        {data.foodName === "Unknown Food" ? "Could not identify food" : data.foodName}
      </h2>
      
      {data.foodName !== "Unknown Food" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center mb-6">
            <StatItem icon={<FireIcon />} label="Total Cal" value={Math.round(data.calories)} unit="kcal" colorClass="bg-red-500"/>
            <StatItem icon={<BeakerIcon />} label="Total Fat" value={data.fat.toFixed(1)} unit="grams" colorClass="bg-yellow-500"/>
            <StatItem icon={<CubeIcon />} label="Total Sugar" value={data.sugar.toFixed(1)} unit="grams" colorClass="bg-sky-500"/>
          </div>

          {data.components && data.components.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-3 text-center sm:text-left">
                Estimated Components Breakdown
              </h3>
              <ul className="space-y-2">
                {data.components.map((component, index) => (
                  <ComponentItem key={index} component={component} />
                ))}
              </ul>
            </div>
          )}
          {data.components && data.components.length === 0 && data.calories > 0 && (
             <p className="text-sm text-slate-500 text-center mt-4">Could not break down components for this item.</p>
          )}
        </>
      ) : (
        <p className="text-slate-600 text-center">Try a clearer image or a different food item.</p>
      )}
    </div>
  );
};