
import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4 bg-white/5 p-2 rounded-xl inline-block">
               <Logo className="h-10 w-auto filter brightness-0 invert" />
            </div>
            <div className="text-slate-400 text-sm leading-relaxed mb-6 space-y-1">
              <p className="font-bold text-white">Federação Interestadual dos Farmacêuticos – Feifar</p>
              <p className="text-xs">CNPJ: 03.297.311/0001-52</p>
              <p className="pt-2">A plataforma oficial de preparação para concursos farmacêuticos.</p>
            </div>
            <div className="flex space-x-4">
              {/* Ícones sociais simulados */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692 1.197 0 1.968.129 1.968.129v2.192z"/></svg>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-brand-orange mb-6">Plataforma</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Banco de Questões</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Provas na Íntegra</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Simulados IA</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planos e Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-brand-orange mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Cancelamento</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sobre a IA</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-brand-orange mb-6">Fale Conosco</h4>
            <p className="text-slate-400 text-sm mb-1">Dúvidas ou problemas?</p>
            <p className="text-white font-bold text-lg mb-4 tracking-tight">(61) 99398-8470</p>
            <a 
              href="https://wa.me/5561993988470" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-white/10 border border-white/20 hover:bg-brand-orange hover:border-brand-orange text-white py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-wider"
            >
              Atendimento WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Feifar. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0 flex items-center">
            Desenvolvido com <span className="text-red-500 mx-1">❤</span> e Inteligência Artificial
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-brand-navy/50 rounded-xl border border-white/5 text-[10px] text-slate-500 text-center leading-relaxed">
          <strong>Isenção de Responsabilidade:</strong> As questões e comentários são gerados e compilados por Inteligência Artificial baseada em histórico público. Embora nos esforcemos pela precisão, recomendamos sempre a conferência com a legislação vigente (RDC/Anvisa) e gabaritos oficiais das bancas.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
