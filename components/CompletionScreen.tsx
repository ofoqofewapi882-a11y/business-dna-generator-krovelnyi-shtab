import React, { useState } from 'react';
import { Block, FormData } from '../types';
import { FileText, FileJson, FileSpreadsheet, FileCode, Edit3, CheckCircle2, Send, Loader2 } from 'lucide-react';
import * as exporter from '../utils/exporter';
import { blocks as allBlocks } from '../data/questions';

interface CompletionScreenProps {
  data: FormData;
  blocks: Block[];
  onReset: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ data, blocks, onReset }) => {
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Calculate stats
  const totalQuestions = blocks.reduce((acc, b) => acc + b.questions.length, 0);
  const answers = Object.values(data) as string[];
  const filledQuestions = answers.filter(v => v.trim() !== '').length;
  const totalChars = answers.reduce((acc, v) => acc + v.length, 0);

  const handleDownload = (type: 'excel' | 'pdf' | 'md' | 'json') => {
    switch (type) {
      case 'excel':
        exporter.downloadFile(exporter.generateCSV(data, blocks), 'Business_DNA.csv', 'text/csv');
        break;
      case 'pdf':
        exporter.downloadFile(exporter.generatePDFText(data, blocks), 'Business_DNA.txt', 'text/plain');
        break;
      case 'md':
        exporter.downloadFile(exporter.generateMarkdown(data, blocks), 'Business_DNA.md', 'text/markdown');
        break;
      case 'json':
        exporter.downloadFile(exporter.generateJSON(data), 'Business_DNA.json', 'application/json');
        break;
    }
  };

  const handleSendToNotion = async () => {
    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, blocks: allBlocks }),
      });

      const result = await response.json();

      if (result.success) {
        setSendResult({
          success: true,
          message: `✅ Отправлено ${result.sent} ответов в Notion!`,
        });
      } else {
        setSendResult({
          success: false,
          message: `❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`,
        });
      }
    } catch (e) {
      setSendResult({
        success: false,
        message: '❌ Не удалось связаться с сервером',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-center py-8 animate-fade-in-up">
      <div className="mb-6 flex justify-center">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Отлично! Анкета заполнена</h2>
      <p className="text-slate-500 mb-8">Ваша Business DNA готова к экспорту</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">{blocks.length}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Блоков</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">{filledQuestions}/{totalQuestions}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Вопросов</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">{totalChars.toLocaleString()}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Символов</div>
        </div>
      </div>

      {/* Send to Notion Button */}
      <div className="mb-10">
        <button
          onClick={handleSendToNotion}
          disabled={sending || filledQuestions === 0}
          className={`w-full max-w-md mx-auto py-4 px-8 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${sending
              ? 'bg-slate-400 cursor-wait'
              : sendResult?.success
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:translate-y-[-2px] cursor-pointer'
            }`}
        >
          {sending ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Отправка в Notion...
            </>
          ) : sendResult?.success ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Отправлено!
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              📤 Отправить в Notion
            </>
          )}
        </button>
        {sendResult && (
          <p className={`mt-3 text-sm font-medium ${sendResult.success ? 'text-green-600' : 'text-red-500'}`}>
            {sendResult.message}
          </p>
        )}
      </div>

      <p className="text-slate-400 text-sm mb-4 font-medium uppercase tracking-wide">Или скачать файл</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => handleDownload('excel')}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
        >
          <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-green-600 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Скачать Excel (CSV)</span>
        </button>

        <button
          onClick={() => handleDownload('pdf')}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
        >
          <FileText className="w-8 h-8 text-slate-400 group-hover:text-red-500 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Скачать Текст (PDF)</span>
        </button>

        <button
          onClick={() => handleDownload('md')}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
        >
          <FileCode className="w-8 h-8 text-slate-400 group-hover:text-slate-800 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Скачать Markdown</span>
        </button>

        <button
          onClick={() => handleDownload('json')}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
        >
          <FileJson className="w-8 h-8 text-slate-400 group-hover:text-orange-500 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Скачать JSON</span>
        </button>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Вернуться и отредактировать
      </button>
    </div>
  );
};

export default CompletionScreen;
