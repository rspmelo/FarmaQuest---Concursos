
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

  const reportError = () => {
    const message = encodeURIComponent(`Olá! Gostaria de reportar uma inconsistência na questão ID: ${question.id} (${question.institution} ${question.year}). Assunto: ${question.subject}`);
    window.open(`https://wa.me/5561993988470?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter border border-slate-200">{question.institution}</span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter border border-slate-200">{question.year}</span>
          </div>
          <button 
            onClick={reportError}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase flex items-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Reportar Inconsistência
          </button>
        </div>

        <p className="text-brand-navy text-lg mb-6 leading-relaxed font-medium">{question.text}</p>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => !showExplanation && setSelectedOption(option.letter)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3 ${
                selectedOption === option.letter ? 'border-brand-orange bg-brand-lightOrange' : 'border-slate-50 hover:border-brand-orange/30 hover:bg-slate-50'
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                selectedOption === option.letter ? 'bg-brand-orange text-white border-brand-orange' : 'text-slate-400 border-slate-200'
              }`}>{option.letter}</span>
              <span className={`font-medium pt-0.5 ${selectedOption === option.letter ? 'text-brand-navy' : 'text-slate-600'}`}>{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-6">
          <button
            onClick={handleShowExplanation}
            disabled={loading}
            className={`flex items-center space-x-3 px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-brand-navy text-white hover:bg-brand-hoverNavy'
            }`}
          >
            {loading ? (
              <span>O Professor está analisando...</span>
            ) : (
              <>
                <svg className={`w-5 h-5 ${!hasAccess() ? 'text-brand-orange' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
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
          
          {showExplanation && (
            <div className="text-[10px] text-slate-400 italic font-medium">
              As explicações são geradas por IA. Sempre valide com a legislação vigente.
            </div>
          )}
        </div>

        {showExplanation && analysis && (
          <div className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-200 animate-fadeIn">
            <p className="text-brand-navy leading-relaxed text-lg font-medium border-l-4 border-brand-orange pl-4 bg-white p-6 rounded-xl shadow-sm italic mb-6">
              "{analysis.overallComment}"
            </p>
            <div className="space-y-4">
              {analysis.alternativesExplanation.map((expl) => (
                <div key={expl.letter} className={`p-4 rounded-xl border-l-4 ${expl.isCorrect ? 'bg-brand-lightOrange/50 border-green-500' : 'bg-slate-100 border-red-200'}`}>
                   <p className="text-sm text-slate-600 leading-relaxed"><strong className="mr-2 uppercase text-brand-navy">{expl.letter}:</strong> {expl.explanation}</p>
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
