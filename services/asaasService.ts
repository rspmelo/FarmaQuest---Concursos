
/**
 * SERVIÇO DE INTEGRAÇÃO ASAAS (SIMULADO)
 * 
 * IMPORTANTE: Em um ambiente de produção, esta chamada deve ser feita via BACKEND.
 * Chamar a API do Asaas diretamente do Frontend expõe sua API Key e causa erros de CORS.
 * Esta versão simula as respostas para permitir o funcionamento do protótipo.
 */

export interface AsaasPaymentRequest {
  customer: string;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  value: number;
  dueDate: string;
  description: string;
}

export const createAsaasPayment = async (paymentData: AsaasPaymentRequest) => {
  console.log("Simulando criação de pagamento Asaas...", paymentData);
  
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Retorna um objeto mockado que segue a estrutura do Asaas
  return {
    id: `pay_${Math.random().toString(36).substr(2, 9)}`,
    object: 'payment',
    value: paymentData.value,
    netValue: paymentData.value - 0.99,
    status: 'PENDING',
    billingType: paymentData.billingType,
    invoiceUrl: 'https://www.asaas.com/i/000000000000',
    invoiceNumber: '00000000',
    dueDate: paymentData.dueDate
  };
};

export const getPixQrCode = async (paymentId: string) => {
  console.log("Simulando geração de QR Code PIX para:", paymentId);
  
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    encodedImage: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAWElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GZ6nAAByU99pAAAAABJRU5ErkJggg==', // Placeholder de imagem base64
    payload: '00020101021226820014br.gov.bcb.pix0121suporte@farmaquest.com.br520400005303986540519.905802BR5910FARMAQUEST6009SAO PAULO62070503***6304E1F2',
    expirationDate: new Date(Date.now() + 3600000).toISOString()
  };
};
