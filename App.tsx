
import React, { useState, useEffect } from 'react';
import { User, Question, Exam, AppTab } from './types';
import Navbar from './components/Navbar';
import QuestionCard from './components/QuestionCard';
import SubscriptionModal from './components/SubscriptionModal';
import { searchHistoricalQuestions, fetchExams, fetchQuestionsByExam } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ isLoggedIn: false, isMember: false });
  const [activeTab, setActiveTab] = useState<AppTab>('questoes');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Farmacologia Clínica');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  // Estados de Visualização de Prova
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);

  // Estados do Simulado
  const [simuladoStep, setSimuladoStep] = useState<'setup' | 'running' | 'results'>('setup');
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [currentSimuladoIndex, setCurrentSimuladoIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedTrial = localStorage.getItem('farmaquest_trial_start');
    const isMember = localStorage.getItem('farmaquest_is_member') === 'true';
    
    if (savedTrial || isMember) {
      setUser({
        isLoggedIn: true,
        name: 'Dr. Farmacêutico',
        isMember: isMember,
        trialStartedAt: savedTrial ? parseInt(savedTrial) : undefined
      });
    }
  }, []);

  const hasFullAccess = () => {
    if (user.isMember) return true;
    if (user.trialStartedAt) {
      const hoursPassed = (Date.now() - user.trialStartedAt) / (1000 * 60 * 60);
      return hoursPassed < 24;
    }
    return false;
  };

  const handleActivateTrial = () => {
    const startTime = Date.now();
    localStorage.setItem('farmaquest_trial_start', startTime.toString());
    setUser(prev => ({ ...prev, isLoggedIn: true, trialStartedAt: startTime }));
    setIsSubscriptionModalOpen(false);
  };

  const handleUpgradeSuccess = () => {
    localStorage.setItem('farmaquest_is_member', 'true');
    setUser(prev => ({ ...prev, isMember: true }));
  };

  const handleLogout = () => {
    localStorage.removeItem('farmaquest_trial_start');
    localStorage.removeItem('farmaquest_is_member');
    setUser({ isLoggedIn: false, isMember: false });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'questoes') {
        const results = await searchHistoricalQuestions(searchQuery);
        setQuestions(results);
      } else if (activeTab === 'provas') {
        const results = await fetchExams();
        setExams(results);
        setSelectedExam(null);
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleResolveExam = async (exam: Exam) => {
    if (!hasFullAccess()) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const qs = await fetchQuestionsByExam(exam.title);
      setExamQuestions(qs);
      setSelectedExam(exam);
      window.scrollTo(0, 0);
    } catch (e) {
      alert("Erro ao carregar prova.");
    } finally {
      setLoading(false);
    }
  };

  const startSimulado = async (topic: string, count: number) => {
    if (!hasFullAccess()) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const qs = await searchHistoricalQuestions(`Simulado de ${topic} com ${count} questões`);
      setSimuladoQuestions(qs);
      setSimuladoStep('running');
      setCurrentSimuladoIndex(0);
      setUserAnswers({});
    } catch (e) {
      alert("Erro ao gerar simulado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        user={user} 
        onLogin={() => setIsSubscriptionModalOpen(true)} 
        onLogout={handleLogout} 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'simulados') setSimuladoStep('setup');
        }}
      />

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={handleUpgradeSuccess}
        onActivateTrial={handleActivateTrial}
        user={user}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-end mb-6 space-x-4">
          <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IA Sincronizada: {lastSync}</span>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
            title="Atualizar Banco de Dados"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {activeTab === 'questoes' && (
          <div className="md:flex md:gap-8 animate-fadeIn">
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm">Filtros de Disciplina</h3>
                  <div className="space-y-2">
                    {['Farmacologia', 'Legislação', 'Bioquímica', 'Toxicologia', 'SUS'].map(area => (
                       <button key={area} onClick={() => setSearchQuery(area)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        {area}
                       </button>
                    ))}
                  </div>
                </div>
                {!hasFullAccess() && (
                  <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-xl shadow-emerald-100">
                    <h4 className="font-bold mb-2">Acesso Ilimitado</h4>
                    <p className="text-xs text-emerald-50 mb-4">Veja comentários da IA em todas as questões.</p>
                    <button onClick={() => setIsSubscriptionModalOpen(true)} className="w-full bg-white text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-50 transition-all">Começar Agora</button>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Banco de Questões</h1>
                <p className="text-slate-500">Explore questões reais comentadas por IA.</p>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex mb-8 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <input 
                  type="text" 
                  placeholder="Busque por tema..." 
                  className="flex-1 px-4 py-3 focus:outline-none text-slate-700 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                />
                <button onClick={fetchData} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">Buscar</button>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400">Sincronizando com a base de dados da IA...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q) => <QuestionCard key={q.id} question={q} user={user} onLockedClick={() => setIsSubscriptionModalOpen(true)} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'provas' && (
           <div className="animate-fadeIn">
             {selectedExam ? (
               <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <button onClick={() => setSelectedExam(null)} className="text-emerald-600 font-bold text-sm mb-2 flex items-center hover:underline">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                        Voltar para Provas
                      </button>
                      <h1 className="text-2xl font-black text-slate-900">{selectedExam.title}</h1>
                      <p className="text-sm text-slate-500">{selectedExam.institution} • {selectedExam.location} • {selectedExam.year}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                        {examQuestions.length} Questões
                      </span>
                    </div>
                 </div>

                 <div className="space-y-8">
                    {examQuestions.map((q, idx) => (
                      <div key={q.id} className="relative">
                        <div className="absolute -left-12 top-4 hidden lg:flex items-center justify-center w-8 h-8 bg-slate-200 rounded-lg text-slate-600 font-black text-xs">
                          {idx + 1}
                        </div>
                        <QuestionCard question={q} user={user} onLockedClick={() => setIsSubscriptionModalOpen(true)} />
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <>
                <div className="mb-12 text-center max-w-3xl mx-auto">
                  <h1 className="text-4xl font-black text-slate-900 mb-4">Provas na Íntegra</h1>
                  <p className="text-lg text-slate-500">Estude examinando o conjunto completo das provas reais (atualizado via IA).</p>
                </div>
                {loading ? (
                   <div className="py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Buscando histórico recente...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exams.map((exam) => (
                      <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">{exam.year}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.difficulty}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{exam.title}</h3>
                          <p className="text-sm text-slate-500 mb-4 font-medium">{exam.institution}</p>
                          <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <p className="text-xs text-slate-600 leading-relaxed italic">"{exam.aiAnalysis}"</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleResolveExam(exam)} 
                          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200"
                        >
                          Resolver Prova
                        </button>
                      </div>
                    ))}
                  </div>
                )}
               </>
             )}
           </div>
        )}

        {activeTab === 'simulados' && simuladoStep === 'setup' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
             <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Simulado Personalizado</h1>
                  <p className="text-slate-500">A IA gera testes inéditos baseados no estilo das bancas atuais.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-6 border-2 border-slate-100 rounded-2xl bg-slate-50">
                      <p className="text-xs font-black text-slate-400 uppercase mb-2">Tópico</p>
                      <p className="font-bold text-slate-800">Mix Farmacêutico</p>
                   </div>
                   <div className="p-6 border-2 border-slate-100 rounded-2xl bg-slate-50">
                      <p className="text-xs font-black text-slate-400 uppercase mb-2">Questões</p>
                      <p className="font-bold text-slate-800">10 Questões</p>
                   </div>
                </div>
                <button 
                  onClick={() => startSimulado("Farmacologia", 10)}
                  disabled={loading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  {loading ? 'Gerando Questões...' : 'INICIAR SIMULADO AGORA'}
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Botão de WhatsApp Flutuante */}
      <a 
        href="https://wa.me/5561993988470" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group flex items-center justify-center"
        aria-label="Falar com suporte no WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.5-14.7-27.6-32.8-30.8-38.3-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-11.1-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
        <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Dúvidas? Fale conosco!
        </span>
      </a>
    </div>
  );
};

export default App;
