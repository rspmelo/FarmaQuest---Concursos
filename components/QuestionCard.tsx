
import React, { useState } from 'react';
import { Question, QuestionAnalysis, User } from '../types';
import { analyzeQuestion } from '../services/geminiService';

interface QuestionCardProps {
  question: Question;
  user: User;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, user }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptionClick = (letter: string) => {
    if (!showExplanation) {
      setSelectedOption(letter);
    }
  };

  const handleShowExplanation = async () => {
    if (!user.isMember) {
      alert("Acesso restrito a membros! Por favor, torne-se um membro para ver os comentários detalhados.");
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
      console.error("Error analyzing question:", error);
      alert("Erro ao carregar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">{question.institution}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">{question.year}</span>
          </div>
          <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">{question.subject}</span>
        </div>

        <p className="text-gray-800 text-lg mb-6 leading-relaxed whitespace-pre-wrap">
          {question.text}
        </p>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => handleOptionClick(option.letter)}
              className={`w-full text-left p-4 rounded-lg border transition-all flex items-start space-x-3 ${
                selectedOption === option.letter
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
              } ${showExplanation && option.letter === question.correctAnswer ? 'bg-green-100 border-green-500 ring-1 ring-green-500' : ''}
                ${showExplanation && selectedOption === option.letter && option.letter !== question.correctAnswer ? 'bg-red-50 border-red-500' : ''}
              `}
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold ${
                selectedOption === option.letter ? 'bg-emerald-500 text-white border-emerald-500' : 'text-gray-500 border-gray-300'
              }`}>
                {option.letter}
              </span>
              <span className="text-gray-700">{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-gray-100 pt-6">
          <button
            onClick={handleShowExplanation}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
              </>
            ) : (
              showExplanation ? 'Ocultar Explicação' : 'Ver Comentários do Professor'
            )}
          </button>

          {!user.isMember && (
            <p className="text-xs text-amber-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
              Exclusivo para Membros Premium
            </p>
          )}
        </div>

        {showExplanation && analysis && (
          <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200 animate-fadeIn">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Comentário Geral
            </h4>
            <p className="text-gray-700 mb-6 italic">{analysis.overallComment}</p>

            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Justificativas Detalhadas
            </h4>
            <div className="space-y-4">
              {analysis.alternativesExplanation.map((alt) => (
                <div key={alt.letter} className={`p-4 rounded-lg border ${alt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center mb-1">
                    <span className={`font-bold mr-2 ${alt.isCorrect ? 'text-green-700' : 'text-slate-700'}`}>
                      Alternativa {alt.letter}:
                    </span>
                    <span className={`text-xs font-bold uppercase ${alt.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {alt.isCorrect ? 'Correta' : 'Incorreta'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{alt.explanation}</p>
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
