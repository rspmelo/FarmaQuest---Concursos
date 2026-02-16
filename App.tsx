
import React, { useState, useEffect } from 'react';
import { User, Question, Exam, AppTab } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuestionCard from './components/QuestionCard';
import SubscriptionModal from './components/SubscriptionModal';
import LoginModal from './components/LoginModal';
import { searchHistoricalQuestions, fetchExams, fetchQuestionsByExam } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ isLoggedIn: false, isMember: false });
  const [activeTab, setActiveTab] = useState<AppTab>('questoes');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Farmacologia e Farmácia Clínica');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
        name: 'Colega Farmacêutico',
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

  const handleLoginSuccess = () => {
    // Simula login bem sucedido
    setIsLoginModalOpen(false);
    setUser(prev => ({ ...prev, isLoggedIn: true, name: 'Usuário' }));
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
      alert("Erro ao carregar prova histórica.");
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
      const qs = await searchHistoricalQuestions(`Simulado focado em ${topic} com ${count} questões de alto nível`);
      setSimuladoQuestions(qs);
      setSimuladoStep('running');
      setCurrentSimuladoIndex(0);
      setUserAnswers({});
    } catch (e) {
      alert("Erro ao gerar simulado com IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar 
        user={user} 
        onLogin={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout} 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'simulados') setSimuladoStep('setup');
        }}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
            <span className="w-2 h-2 bg-brand-orange rounded-full mr-2 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base de Dados Histórica: {lastSync}</span>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
            title="Atualizar via Professor IA"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {activeTab === 'questoes' && (
          <div className="md:flex md:gap-8 animate-fadeIn">
            <aside className="hidden md:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-brand-navy mb-4 text-sm">Bancas Frequentes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['FGV', 'CEBRASPE', 'VUNESP', 'IBFC', 'IADES', 'AOCP'].map(banca => (
                       <button key={banca} onClick={() => setSearchQuery(`Questões da banca ${banca} para farmacêutico`)} className="text-center px-2 py-2 rounded-lg text-[10px] font-black border border-slate-100 text-slate-500 hover:bg-brand-lightOrange hover:text-brand-orange hover:border-brand-orange transition-all uppercase tracking-tighter">
                        {banca}
                       </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-brand-navy mb-4 text-sm">Grandes Eixos</h3>
                  <div className="space-y-2">
                    {['Farmacologia Clínica', 'Análises Clínicas', 'Legislação Farmacêutica', 'Deontologia', 'Saúde Pública / SUS', 'Farmacotécnica'].map(area => (
                       <button key={area} onClick={() => setSearchQuery(area)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-orange transition-colors border border-transparent hover:border-slate-200">
                        {area}
                       </button>
                    ))}
                  </div>
                </div>

                {!hasFullAccess() && (
                  <div className="bg-brand-navy p-6 rounded-2xl text-white shadow-xl shadow-slate-300">
                    <h4 className="font-black mb-2 text-lg leading-tight">Acesso Completo às Provas</h4>
                    <p className="text-xs text-slate-300 mb-4 font-medium">Veja o gabarito comentado de todas as questões históricas.</p>
                    <button onClick={() => setIsSubscriptionModalOpen(true)} className="w-full bg-brand-orange text-white font-black py-3 rounded-xl hover:bg-brand-hoverOrange transition-all uppercase text-xs tracking-tighter shadow-lg">Garantir Aprovação</button>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-4xl font-black text-brand-navy mb-2 tracking-tight">O que já caiu?</h1>
                <p className="text-slate-500 font-medium">Estude através de questões reais que definiram os últimos concursos.</p>
              </div>

              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg flex mb-8 focus-within:ring-4 focus-within:ring-brand-orange/20 transition-all">
                <div className="flex items-center pl-4 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Pesquise por tema, banca ou ano (ex: FGV 2024)..." 
                  className="flex-1 px-4 py-4 focus:outline-none text-brand-navy bg-transparent font-medium placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                />
                <button onClick={fetchData} className="bg-brand-navy text-white px-10 py-4 rounded-xl font-black hover:bg-brand-orange transition-all shadow-md active:scale-95">BUSCAR AGORA</button>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center">
                  <div className="w-16 h-16 border-8 border-brand-lightOrange border-t-brand-orange rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Consultando arquivos históricos...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.length > 0 ? (
                    questions.map((q) => <QuestionCard key={q.id} question={q} user={user} onLockedClick={() => setIsSubscriptionModalOpen(true)} />)
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma questão encontrada para este termo.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'provas' && (
           <div className="animate-fadeIn">
             {selectedExam ? (
               <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                      <button onClick={() => setSelectedExam(null)} className="text-brand-orange font-black text-xs mb-4 flex items-center hover:underline uppercase tracking-tighter">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                        Voltar para Lista de Provas
                      </button>
                      <h1 className="text-3xl font-black text-brand-navy tracking-tight">{selectedExam.title}</h1>
                      <div className="flex items-center mt-2 space-x-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase">{selectedExam.institution}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm text-slate-500 font-bold">{selectedExam.location} ({selectedExam.year})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-brand-lightOrange text-brand-orange px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-brand-orange/20">
                        {examQuestions.length} QUESTÕES REAIS
                      </span>
                    </div>
                 </div>

                 <div className="space-y-10">
                    {examQuestions.map((q, idx) => (
                      <div key={q.id} className="relative group">
                        <div className="absolute -left-14 top-4 hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-2xl text-brand-navy font-black text-sm shadow-sm group-hover:border-brand-orange transition-colors">
                          {idx + 1}
                        </div>
                        <QuestionCard question={q} user={user} onLockedClick={() => setIsSubscriptionModalOpen(true)} />
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <>
                <div className="mb-16 text-center max-w-4xl mx-auto">
                  <h1 className="text-5xl font-black text-brand-navy mb-4 tracking-tighter">Provas na Íntegra</h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed">Não estude apenas por tópicos soltos. Resolva o conjunto completo das provas que já aconteceram e entenda o padrão de cada banca.</p>
                </div>
                {loading ? (
                   <div className="py-24 flex flex-col items-center">
                    <div className="w-16 h-16 border-8 border-brand-lightOrange border-t-brand-orange rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mapeando concursos recentes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exams.map((exam) => (
                      <div key={exam.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col border-b-4 border-b-slate-100 hover:border-b-brand-orange">
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black text-brand-orange uppercase bg-brand-lightOrange px-3 py-1 rounded-full border border-orange-100">{exam.year}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${exam.difficulty === 'Difícil' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{exam.difficulty}</span>
                          </div>
                          <h3 className="text-2xl font-black text-brand-navy mb-3 group-hover:text-brand-orange transition-colors leading-tight tracking-tight">{exam.title}</h3>
                          <p className="text-xs text-slate-400 mb-6 font-black uppercase tracking-widest">{exam.institution}</p>
                          <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
                            <div className="flex items-center mb-2">
                              <svg className="w-3 h-3 text-brand-orange mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                              <span className="text-[10px] font-black text-slate-800 uppercase">Perfil da Banca</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{exam.aiAnalysis}"</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleResolveExam(exam)} 
                          className="w-full bg-brand-navy text-white py-5 rounded-[1.25rem] font-black text-sm hover:bg-brand-orange transition-all shadow-xl hover:shadow-orange-200 uppercase tracking-widest"
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
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lightOrange rounded-full -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10 text-center mb-12">
                  <div className="inline-block px-4 py-1.5 bg-brand-lightOrange text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-100">Novidade</div>
                  <h1 className="text-4xl font-black text-brand-navy mb-4 tracking-tight">Simulado Customizado com IA</h1>
                  <p className="text-lg text-slate-500 font-medium">A IA do FarmaQuest gera testes inéditos seguindo RIGOROSAMENTE o padrão das questões históricas que você escolher.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                   <div className="p-8 border-2 border-slate-50 rounded-3xl bg-slate-50/50 hover:border-brand-orange transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Focar em:</p>
                      <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-brand-orange outline-none">
                        <option>Mix Farmacêutico Geral</option>
                        <option>Farmacologia e Toxicologia</option>
                        <option>Farmácia Hospitalar e Clínica</option>
                        <option>Análises Clínicas e Bioquímica</option>
                        <option>Legislação e Saúde Coletiva</option>
                      </select>
                   </div>
                   <div className="p-8 border-2 border-slate-50 rounded-3xl bg-slate-50/50 hover:border-brand-orange transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Volume de Prova:</p>
                      <div className="flex items-center space-x-4">
                        {[10, 20, 30].map(n => (
                          <button key={n} className={`flex-1 py-3 rounded-xl font-black transition-all ${n === 10 ? 'bg-brand-navy text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-brand-navy'}`}>
                            {n} Q
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={() => startSimulado("Farmacologia", 10)}
                  disabled={loading}
                  className="w-full py-6 bg-brand-orange text-white rounded-2xl font-black text-xl shadow-2xl shadow-orange-200 hover:bg-brand-hoverOrange hover:scale-[1.02] transition-all uppercase tracking-tighter"
                >
                  {loading ? 'A IA ESTÁ ELABORANDO SUA PROVA...' : 'INICIAR SIMULADO AGORA'}
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Botão de WhatsApp Flutuante - Mantido verde pois é a cor da marca WhatsApp */}
      <a 
        href="https://wa.me/5561993988470" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[90] bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group flex items-center justify-center border-4 border-white"
        aria-label="Falar com suporte no WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.5-14.7-27.6-32.8-30.8-38.3-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-11.1-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
        <span className="absolute right-full mr-6 bg-slate-900 text-white text-[10px] font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-2xl uppercase tracking-widest border border-slate-700 translate-x-4 group-hover:translate-x-0">
          Suporte ao Aluno
        </span>
      </a>
      
      <Footer />
    </div>
  );
};

export default App;
