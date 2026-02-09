
import React, { useState } from 'react';
import { Question, QuestionAnalysis, User } from '../types';
import { analyzeQuestion } from '../services/geminiService';

interface QuestionCardProps {
  question: Question;
  user: User;
  onLockedClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, user, onLockedClick }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const hasAccess = () => {
    if (user.isMember) return true;
    if (user.trialStartedAt) {
      const hoursPassed = (Date.now() - user.trialStartedAt) / (1000 * 60 * 60);
      return hoursPassed < 24;
    }
    return false;
  };

  const handleShowExplanation = async () => {
    if (!hasAccess()) {
      onLockedClick();
      return;
    }

    if (analysis) {
      setShowExplanation(!showExplanation);
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeQuestion(question);
      setAnalysis(result);
      setShowExplanation(true);
    } catch (error) {
      alert("Houve um problema ao conectar com o Professor IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter">{question.institution}</span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter">{question.year}</span>
          </div>
          <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{question.subject}</span>
        </div>

        <p className="text-slate-800 text-lg mb-6 leading-relaxed font-medium">{question.text}</p>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => !showExplanation && setSelectedOption(option.letter)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3 ${
                selectedOption === option.letter ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                selectedOption === option.letter ? 'bg-emerald-500 text-white border-emerald-500' : 'text-slate-400 border-slate-200'
              }`}>{option.letter}</span>
              <span className="text-slate-700 font-medium pt-0.5">{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-6">
          <button
            onClick={handleShowExplanation}
            disabled={loading}
            className={`flex items-center space-x-3 px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <span>O Professor está analisando...</span>
            ) : (
              <>
                <svg className={`w-5 h-5 ${!hasAccess() ? 'text-amber-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  {!hasAccess() ? (
                    <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{showExplanation ? 'Ocultar Explicação' : (hasAccess() ? 'Ver Comentários do Professor' : 'Ativar Acesso para Ver Comentários')}</span>
              </>
            )}
          </button>
        </div>

        {showExplanation && analysis && (
          <div className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-200 animate-fadeIn">
            <p className="text-slate-700 leading-relaxed text-lg font-medium border-l-4 border-emerald-500 pl-4 bg-white p-6 rounded-xl shadow-sm italic mb-6">
              "{analysis.overallComment}"
            </p>
            <div className="space-y-4">
              {analysis.alternativesExplanation.map((expl) => (
                <div key={expl.letter} className={`p-4 rounded-xl border-l-4 ${expl.isCorrect ? 'bg-green-50/50 border-green-500' : 'bg-red-50/30 border-red-200'}`}>
                   <p className="text-sm text-slate-600 leading-relaxed"><strong className="mr-2 uppercase">{expl.letter}:</strong> {expl.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
