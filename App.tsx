
import React, { useState, useEffect } from 'react';
import { User, Question } from './types';
import Navbar from './components/Navbar';
import QuestionCard from './components/QuestionCard';
import { searchHistoricalQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({
    isLoggedIn: false,
    isMember: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Farmacologia Clínica');

  const handleLogin = () => {
    // Simulated login for demo
    setUser({
      isLoggedIn: true,
      name: 'Dr. Farmacêutico',
      email: 'contato@farma.com',
      isMember: true
    });
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, isMember: false });
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const results = await searchHistoricalQuestions(searchQuery);
      setQuestions(results);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="md:flex md:gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Filtros</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ano</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm">
                      <option>Todos</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Instituição</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm">
                      <option>Todas</option>
                      <option>EBSERH</option>
                      <option>FGV</option>
                      <option>CESPE/Cebraspe</option>
                      <option>VUNESP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Assunto</label>
                    <div className="space-y-2">
                      {['Farmacologia', 'Legislação', 'Análises Clínicas', 'Hospitalar', 'Toxicologia'].map((sub) => (
                        <label key={sub} className="flex items-center text-sm text-gray-700">
                          <input type="checkbox" className="mr-2 rounded text-emerald-600" />
                          {sub}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-lg">
                <h4 className="font-bold mb-2">Assine o Premium</h4>
                <p className="text-sm text-emerald-50 opacity-90 mb-4">Tenha acesso a comentários ilimitados de professores IA para todas as questões do PCI Concursos e muito mais.</p>
                <button className="w-full bg-white text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  Ver Planos
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Questões de Concursos para Farmacêutico</h1>
              <p className="text-gray-600">Explore milhares de questões reais com comentários profissionais.</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex mb-8">
              <input 
                type="text" 
                placeholder="Busque por tema (ex: Farmacovigilância, RDC 44...)" 
                className="flex-1 px-4 py-2 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={fetchQuestions}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Buscar
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-gray-500 font-medium">Carregando questões atualizadas...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <QuestionCard key={q.id} question={q} user={user} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Nenhuma questão encontrada para este termo.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Placeholder */}
            {questions.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="p-2 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-50">Anterior</button>
                  <button className="w-10 h-10 rounded-md bg-emerald-600 text-white font-bold">1</button>
                  <button className="w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
                  <button className="w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
                  <button className="p-2 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-50">Próximo</button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-emerald-400">Farma</span>
                <span className="text-2xl font-bold text-white">Quest</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                A plataforma definitiva para farmacêuticos conquistarem sua vaga no serviço público através de tecnologia de ponta e didática avançada.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-emerald-400">PCI Concursos</a></li>
                <li><a href="#" className="hover:text-emerald-400">CFF - Conselho Federal</a></li>
                <li><a href="#" className="hover:text-emerald-400">ANVISA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-emerald-400">Contato</a></li>
                <li><a href="#" className="hover:text-emerald-400">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-emerald-400">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2024 FarmaQuest. Todos os direitos reservados. Informações extraídas com base em provas públicas do PCI Concursos.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
