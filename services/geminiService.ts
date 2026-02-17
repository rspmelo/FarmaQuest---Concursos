
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionAnalysis, Exam } from "../types";

// Variável para armazenar a instância da IA (Singleton)
let aiInstance: GoogleGenAI | null = null;

// Função para obter ou criar a instância da IA com segurança
const getAI = (): GoogleGenAI => {
  if (aiInstance) return aiInstance;

  // Obtém a chave definida pelo Vite no build
  const apiKey = process.env.API_KEY;

  // Verifica se a chave é válida
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
    throw new Error("CONFIGURAÇÃO_PENDENTE: A API Key do Google Gemini não foi encontrada. Crie um arquivo .env na raiz do projeto com API_KEY=sua_chave_aqui e faça o build novamente.");
  }

  aiInstance = new GoogleGenAI({ apiKey: apiKey });
  return aiInstance;
};

export async function analyzeQuestion(question: Question): Promise<QuestionAnalysis> {
  const ai = getAI(); // Inicializa aqui, dentro da função

  const prompt = `
    Você é um Professor Doutor em Farmácia, especialista em concursos públicos (estilo Estratégia/Gran).
    Analise a questão da banca ${question.institution} (${question.year}) sobre ${question.subject}.
    
    Questão: ${question.text}
    Gabarito Oficial: ${question.correctAnswer}
    
    Forneça:
    1. Um comentário geral (overallComment) explicando o tópico e o que a banca costuma cobrar.
    2. Uma explicação detalhada para cada alternativa (A, B, C, D, E), justificando o erro ou o acerto baseado na farmacopeia brasileira, legislação do CRF/CFF ou literatura padrão (Goodman & Gilman, Rang & Dale, etc).
    
    Retorne estritamente em JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallComment: { type: Type.STRING },
          alternativesExplanation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                letter: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text) as QuestionAnalysis;
}

export async function searchHistoricalQuestions(query: string): Promise<Question[]> {
    const ai = getAI(); // Inicializa aqui
    
    const prompt = `
      Atue como um banco de dados de concursos. Recupere 5 questões REAIS que já caíram em provas de Farmacêutico no Brasil.
      Tema: ${query}.
      Priorize questões de 2023, 2024 e 2025 de bancas como FGV, CEBRASPE, VUNESP, IBFC ou AOCP.
      Inclua o nome da instituição (ex: EBSERH, Pref. de São Paulo, Marinha).
      Retorne em formato JSON.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        institution: { type: Type.STRING },
                        year: { type: Type.NUMBER },
                        role: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        text: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { letter: { type: Type.STRING }, text: { type: Type.STRING } }
                            }
                        },
                        correctAnswer: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text) as Question[];
}

export async function fetchExams(): Promise<Exam[]> {
  const ai = getAI(); // Inicializa aqui
  
  const prompt = `
    Liste 6 concursos históricos REAIS e famosos para o cargo de Farmacêutico no Brasil que ocorreram recentemente (2023-2025).
    Exemplos obrigatórios se existirem: EBSERH Nacional, Fiocruz, Anvisa, Perito Criminal Federal/Estadual, Marinha/Exército.
    Para cada um, forneça uma 'aiAnalysis' (perfil da banca: se é decoreba, se foca em casos clínicos, se cobra muito SUS).
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            institution: { type: Type.STRING },
            year: { type: Type.NUMBER },
            location: { type: Type.STRING },
            totalQuestions: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            aiAnalysis: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text) as Exam[];
}

export async function fetchQuestionsByExam(examTitle: string): Promise<Question[]> {
  const ai = getAI(); // Inicializa aqui
  
  const prompt = `
    Gere 10 questões que reproduzam fielmente a prova de Farmacêutico do concurso: ${examTitle}.
    Mantenha o rigor técnico, vocabulário acadêmico e estilo de pegadinhas da banca original.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            institution: { type: Type.STRING },
            year: { type: Type.NUMBER },
            role: { type: Type.STRING },
            subject: { type: Type.STRING },
            text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { letter: { type: Type.STRING }, text: { type: Type.STRING } }
              }
            },
            correctAnswer: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text) as Question[];
}
