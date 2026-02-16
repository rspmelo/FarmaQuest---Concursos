
import React, { useState } from 'react';
import { createAsaasPayment, getPixQrCode } from '../services/asaasService';
import { User } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onActivateTrial: () => void;
  user: User;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess, onActivateTrial, user }) => {
  const [step, setStep] = useState<'plans' | 'checkout' | 'processing' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState({ name: 'Plano Anual', price: 19.90, label: 'R$ 19,90/mês' });
  const [pixData, setPixData] = useState<{ payload: string, qrCode: string } | null>(null);

  if (!isOpen) return null;

  const handleStartCheckout = (planName: string, planPrice: number, label: string) => {
    setSelectedPlan({ name: planName, price: planPrice, label });
    setStep('checkout');
  };

  const handleFinalizePayment = async () => {
    setStep('processing');
    try {
      const payment = await createAsaasPayment({
        customer: 'cus_demo',
        billingType: 'PIX',
        value: selectedPlan.price,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: `Assinatura FarmaQuest - ${selectedPlan.name}`
      });
      const qrCode = await getPixQrCode(payment.id);
      setPixData({ payload: qrCode.payload, qrCode: qrCode.encodedImage });
      setTimeout(() => setStep('success'), 8000); 
    } catch (err) {
      setStep('checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <span className="text-sm font-black text-brand-navy uppercase tracking-widest">Acesso à Plataforma</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {step === 'plans' && (
          <div className="p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-brand-navy mb-2">Passe em Farmácia</h2>
              <p className="text-slate-500">Escolha como quer começar sua jornada rumo à aprovação.</p>
            </div>

            {/* Opção Trial - Destaque */}
            {!user.trialStartedAt && (
              <div className="bg-brand-navy rounded-2xl p-6 text-white mb-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-slate-300">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-black text-xl mb-1">Deseja Testar Primeiro?</h3>
                  <p className="text-xs text-slate-200 font-medium">Libere TODAS as funções por 24h agora mesmo.</p>
                </div>
                <button 
                  onClick={onActivateTrial}
                  className="bg-brand-orange text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-brand-hoverOrange transition-all uppercase tracking-tighter"
                >
                  Ativar 24h Grátis
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="border-2 border-slate-100 p-6 rounded-2xl hover:border-brand-navy transition-all cursor-pointer" onClick={() => handleStartCheckout('Plano Mensal', 29.90, 'R$ 29,90')}>
                 <h4 className="font-bold text-slate-800">Mensal</h4>
                 <p className="text-2xl font-black mt-2 text-brand-navy">R$ 29,90</p>
               </div>
               <div className="border-2 border-brand-orange bg-brand-lightOrange/30 p-6 rounded-2xl relative cursor-pointer" onClick={() => handleStartCheckout('Plano Anual', 19.90, 'R$ 19,90')}>
                 <span className="absolute -top-3 right-4 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded">ECONOMIZE 33%</span>
                 <h4 className="font-bold text-slate-800">Anual</h4>
                 <p className="text-2xl font-black mt-2 text-brand-navy">R$ 19,90<span className="text-sm font-normal text-slate-400">/mês</span></p>
               </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400 mb-2">Está com alguma dúvida sobre os planos?</p>
              <a 
                href="https://wa.me/5561993988470" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-brand-orange font-bold text-sm hover:underline"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-.72 2.628 2.688-.705c.813.447 1.745.701 2.736.701 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.38 8.057c-.15.42-.766.766-1.081.825-.315.06-.69.09-2.055-.48-1.74-.72-2.85-2.49-2.94-2.61-.09-.12-.735-.975-.735-1.875 0-.9.465-1.35.63-1.53.165-.18.36-.225.48-.225s.24 0 .345.015c.105.015.255-.045.39.285.15.36.51 1.245.555 1.335.045.09.075.195.015.315s-.09.18-.18.285c-.09.105-.195.24-.27.315-.09.09-.18.195-.075.375.105.18.465.765.99 1.23.675.6 1.245.795 1.425.885.18.09.285.075.39-.045s.45-.525.57-.705c.12-.18.24-.15.405-.09s1.05.495 1.23.585c.18.09.3.135.345.21.045.075.045.42-.105.84z"/></svg>
                Fale com um consultor no WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ... Outros passos de Checkout/Processamento ... */}
        {step === 'checkout' && (
           <div className="p-8">
              <h3 className="text-xl font-bold mb-6 text-brand-navy">Finalizar Pagamento</h3>
              <div className="bg-slate-50 p-4 rounded-xl mb-6">
                <p className="text-sm font-bold text-slate-700">{selectedPlan.name}</p>
                <p className="text-xs text-slate-400">Pagamento recorrente, cancele quando quiser.</p>
              </div>
              <button onClick={handleFinalizePayment} className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold shadow-lg hover:bg-brand-hoverOrange transition-colors">Pagar com PIX</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
