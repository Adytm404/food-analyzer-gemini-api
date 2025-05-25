
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useFoodJournal } from './hooks/useFoodJournal';
import { analyzeFoodImage } from './services/geminiService';
import { NutritionData, ReportPeriod, FoodEntry, ChartDataPoint } from './types';
import { processImageForUpload } from './utils/imageProcessor';
import * as DateHelpers from './utils/dateHelpers';

import { ImageUploader } from './components/ImageUploader';
import { NutritionDisplay } from './components/NutritionDisplay';
import { FoodEntryCard } from './components/FoodEntryCard';
import { ReportChart } from './components/ReportChart';
import { CameraIcon, HistoryIcon, ChartBarIcon, LoadingSpinner, FireIcon, BeakerIcon, CubeIcon } from './components/icons';
import { PageContainer } from './components/PageContainer';

const AnalyzeView: React.FC = () => {
  const { addFoodEntry, isLoading: journalLoading, setError: setJournalError } = useFoodJournal();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImageFile(file);
    setImagePreviewUrl(previewUrl);
    setAnalysisResult(null); // Clear previous results
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImageFile) {
      setError("Please select an image first.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { forApi, mimeType } = await processImageForUpload(selectedImageFile);
      const result = await analyzeFoodImage(forApi, mimeType);
      setAnalysisResult(result);
      // Automatically add to journal if food is identified
      if (result.foodName !== "Unknown Food" && result.calories > 0) {
        await addFoodEntry(result, selectedImageFile);
      } else if (result.foodName === "Unknown Food") {
        setError("Could not identify the food. Please try another image.");
      }
    } catch (e) {
      const err = e as Error;
      console.error("Analysis error:", err);
      setError(`Analysis failed: ${err.message}`);
      setJournalError(`Analysis failed: ${err.message}`); // Also inform journal hook if needed
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <PageContainer title="Analyze Food">
      <ImageUploader onImageSelect={handleImageSelect} currentPreviewUrl={imagePreviewUrl} />
      {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {selectedImageFile && !analysisResult && !isAnalyzing && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || journalLoading}
          className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 transition-all duration-150 flex items-center justify-center"
        >
          {isAnalyzing || journalLoading ? (
            <> <LoadingSpinner className="w-5 h-5 mr-2"/> Analyzing... </>
          ) : "Analyze Food & Add to Journal"}
        </button>
      )}
      {(isAnalyzing || journalLoading && !analysisResult) && (
        <div className="mt-6 flex flex-col items-center justify-center text-slate-600">
          <LoadingSpinner />
          <p className="mt-2">Analyzing your food, please wait...</p>
        </div>
      )}
      <NutritionDisplay data={analysisResult} />
    </PageContainer>
  );
};

const HistoryView: React.FC = () => {
  const { entries, isLoading, error, deleteEntry, clearJournal } = useFoodJournal();

  if (isLoading && entries.length === 0) {
    return <PageContainer title="History"><div className="text-center"><LoadingSpinner /> <p>Loading history...</p></div></PageContainer>;
  }
  if (error) {
    return <PageContainer title="History"><p className="text-center text-red-500">{error}</p></PageContainer>;
  }

  return (
    <PageContainer title="Food Log History">
      {entries.length === 0 ? (
        <div className="text-center text-slate-500 py-10">
          <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-xl">Your food log is empty.</p>
          <p>Add some entries from the 'Analyze' tab!</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-right">
            <button 
              onClick={() => { if(window.confirm("Are you sure you want to delete all entries? This cannot be undone.")) clearJournal()}}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Clearing...' : 'Clear All History'}
            </button>
          </div>
          <div className="space-y-6">
            {entries.map((entry) => (
              <FoodEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
};

interface IntakeSummaryCardProps {
  title: string;
  data: ChartDataPoint | null;
  bgColorClass?: string;
}

const IntakeSummaryCard: React.FC<IntakeSummaryCardProps> = ({ title, data, bgColorClass = "bg-white" }) => {
  if (!data) return null;

  return (
    <div className={`p-4 rounded-xl shadow-lg ${bgColorClass}`}>
      <h4 className="text-lg font-semibold text-slate-700 mb-3 text-center">{title}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <div className="flex items-center text-red-600">
            <FireIcon className="w-4 h-4 mr-2"/>
            <span>Calories</span>
          </div>
          <span className="font-bold text-slate-700">{Math.round(data.calories)} kcal</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <div className="flex items-center text-yellow-600">
            <BeakerIcon className="w-4 h-4 mr-2"/>
            <span>Fat</span>
          </div>
          <span className="font-bold text-slate-700">{data.fat.toFixed(1)} g</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <div className="flex items-center text-sky-600">
            <CubeIcon className="w-4 h-4 mr-2"/>
            <span>Sugar</span>
          </div>
          <span className="font-bold text-slate-700">{data.sugar.toFixed(1)} g</span>
        </div>
      </div>
    </div>
  );
};


const ReportsView: React.FC = () => {
  const { getReportData, entries, isLoading } = useFoodJournal();
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>(ReportPeriod.DAILY);

  const today = new Date();
  const startOfToday = DateHelpers.getStartOfDay(today);
  const endOfToday = DateHelpers.getEndOfDay(today);
  const todaysTotals = DateHelpers.aggregateDataForPeriod(entries, startOfToday, endOfToday, "Today");

  const startOfThisWeek = DateHelpers.getStartOfWeek(today);
  const endOfThisWeekDate = new Date(startOfThisWeek);
  endOfThisWeekDate.setDate(startOfThisWeek.getDate() + 6); // Sunday of current week
  const endOfThisWeek = DateHelpers.getEndOfDay(endOfThisWeekDate);
  const thisWeeksTotals = DateHelpers.aggregateDataForPeriod(entries, startOfThisWeek, endOfThisWeek, "This Week");

  const startOfThisMonth = DateHelpers.getStartOfMonth(today);
  const endOfThisMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
  const endOfThisMonth = DateHelpers.getEndOfDay(endOfThisMonthDate);
  const thisMonthsTotals = DateHelpers.aggregateDataForPeriod(entries, startOfThisMonth, endOfThisMonth, "This Month");

  const dailyChartData = getReportData(ReportPeriod.DAILY);
  const weeklyChartData = getReportData(ReportPeriod.WEEKLY);
  const monthlyChartData = getReportData(ReportPeriod.MONTHLY);

  const renderReportChart = () => {
    switch (activePeriod) {
      case ReportPeriod.DAILY:
        return <ReportChart data={dailyChartData} title="Daily Nutrition Log (Last 7 Days)" />;
      case ReportPeriod.WEEKLY:
        return <ReportChart data={weeklyChartData} title="Weekly Nutrition Log (Last 4 Weeks)" />;
      case ReportPeriod.MONTHLY:
        return <ReportChart data={monthlyChartData} title="Monthly Nutrition Log (Last 6 Months)" />;
      default:
        return null;
    }
  };
  
  if (isLoading && entries.length === 0) {
    return <PageContainer title="Nutrition Reports"><div className="text-center"><LoadingSpinner /> <p>Loading report data...</p></div></PageContainer>;
  }

  return (
    <PageContainer title="Nutrition Reports">
       {entries.length === 0 ? (
         <div className="text-center text-slate-500 py-10">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-xl">No data for reports yet.</p>
          <p>Log some food items to see your nutrition breakdown.</p>
        </div>
       ) : (
        <>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <IntakeSummaryCard title="Today's Intake" data={todaysTotals} bgColorClass="bg-emerald-50" />
            <IntakeSummaryCard title="This Week's Intake" data={thisWeeksTotals} bgColorClass="bg-sky-50" />
            <IntakeSummaryCard title="This Month's Intake" data={thisMonthsTotals} bgColorClass="bg-amber-50" />
          </div>

          <div className="mb-6 flex justify-center space-x-2 sm:space-x-4 border-b border-slate-200 pb-3 pt-4">
            {(Object.keys(ReportPeriod) as Array<keyof typeof ReportPeriod>).map((periodKey) => (
              <button
                key={periodKey}
                onClick={() => setActivePeriod(ReportPeriod[periodKey])}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium rounded-md transition-colors duration-150
                  ${activePeriod === ReportPeriod[periodKey] ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                {ReportPeriod[periodKey].charAt(0) + ReportPeriod[periodKey].slice(1).toLowerCase() + ' Log'}
              </button>
            ))}
          </div>
          {renderReportChart()}
        </>
       )}
    </PageContainer>
  );
};


const BottomNavbar: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: "/analyze", label: "Analyze", icon: <CameraIcon /> },
    { path: "/history", label: "History", icon: <HistoryIcon /> },
    { path: "/reports", label: "Reports", icon: <ChartBarIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-top z-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-150
              ${location.pathname === item.path || (location.pathname === "/" && item.path === "/analyze")
                ? "text-emerald-500"
                : "text-slate-500 hover:text-emerald-400"
              }`}
          >
            {React.cloneElement(item.icon, { className: 'w-6 h-6 mb-0.5' })}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pb-16"> {/* padding-bottom to avoid overlap with navbar */}
          <Routes>
            <Route path="/" element={<Navigate to="/analyze" replace />} />
            <Route path="/analyze" element={<AnalyzeView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="*" element={<Navigate to="/analyze" replace />} /> {/* Fallback route */}
          </Routes>
        </main>
        <BottomNavbar />
      </div>
    </HashRouter>
  );
};

export default App;
