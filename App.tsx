import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import QuestionBlock from './components/QuestionBlock';
import CompletionScreen from './components/CompletionScreen';
import MeetingMinutes from './components/MeetingMinutes';
import { blocks } from './data/questions';
import { FormData } from './types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const STORAGE_KEY = 'business_dna_data_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'questionnaire' | 'minutes'>('questionnaire');
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from local storage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (isCompleted) {
      setIsCompleted(false);
    } else if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentBlock = blocks[currentBlockIndex];

  if (!isLoaded) return null; // Prevent flash of empty state

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden my-4 md:my-8 min-h-[600px] flex flex-col">
        <Header />

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === 'questionnaire'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            onClick={() => setActiveTab('questionnaire')}
          >
            Анкета
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === 'minutes'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            onClick={() => setActiveTab('minutes')}
          >
            Протоколы встреч
          </button>
        </div>

        {activeTab === 'questionnaire' ? (
          <>
            <ProgressBar
              current={isCompleted ? blocks.length : currentBlockIndex + 1}
              total={blocks.length}
            />

            <div className="flex-grow p-6 md:p-10">
              {isCompleted ? (
                <CompletionScreen
                  data={formData}
                  blocks={blocks}
                  onReset={() => {
                    setIsCompleted(false);
                    setCurrentBlockIndex(0);
                  }}
                />
              ) : (
                <QuestionBlock
                  block={currentBlock}
                  data={formData}
                  onChange={handleInputChange}
                />
              )}
            </div>

            {!isCompleted && (
              <div className="bg-slate-50 border-t border-slate-200 p-6 md:px-10 flex gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentBlockIndex === 0}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center ${currentBlockIndex === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Назад
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center"
                >
                  {currentBlockIndex === blocks.length - 1 ? 'Завершить' : 'Далее'}
                  {currentBlockIndex !== blocks.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
                </button>
              </div>
            )}
          </>
        ) : (
          <MeetingMinutes />
        )}
      </div>

      <div className="text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Студия Кровли — Кровельный Штаб
      </div>
    </div>
  );
};

export default App;
