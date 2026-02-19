import React from 'react';
import { Block, FormData, Question } from '../types';
import { AlertTriangle } from 'lucide-react';

interface QuestionBlockProps {
  block: Block;
  data: FormData;
  onChange: (id: string, value: string) => void;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({ block, data, onChange }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center mb-6 pb-4 border-b-2 border-indigo-100">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 shrink-0 shadow-md">
          {block.id}
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{block.title}</h2>
          <p className="text-slate-500 text-sm mt-1">{block.subtitle}</p>
        </div>
      </div>

      {block.warning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 mr-3 shrink-0 text-amber-500" />
          <span>{block.warning}</span>
        </div>
      )}

      <div className="space-y-8">
        {block.questions.map((q, index) => (
          <div key={q.id} className="group">
            <label className="block mb-2 font-medium text-slate-700 text-sm md:text-base">
              <span className="text-indigo-600 font-bold mr-1">{block.id}.{index + 1}</span> {q.label}
            </label>
            
            {q.type === 'textarea' ? (
              <textarea
                id={q.id}
                value={data[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[120px] text-slate-700 placeholder:text-slate-400"
              />
            ) : (
              <input
                type={q.type}
                id={q.id}
                value={data[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
              />
            )}
            
            {q.hint && (
              <p className="mt-2 text-xs text-slate-400 italic flex items-start">
                <span className="mr-1">ℹ️</span> {q.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionBlock;
