
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeQuestion(question: Question): Promise<QuestionAnalysis> {
  const prompt = `
    Como um professor especialista em concursos para Farmacêuticos no Brasil, analise a seguinte questão de concurso:
    
    Instituição: ${question.institution}
    Ano: ${question.year}
    Assunto: ${question.subject}
    Questão: ${question.text}
    
    Alternativas:
    ${question.options.map(opt => `${opt.letter}) ${opt.text}`).join('\n')}
    
    Gabarito Correto: ${question.correctAnswer}
    
    Por favor, forneça:
    1. Um comentário geral sobre o tema da questão.
    2. Uma explicação detalhada para cada alternativa, justificando por que está correta ou errada de acordo com a legislação farmacêutica, farmacologia ou área técnica correspondente.
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
              },
              required: ["letter", "isCorrect", "explanation"]
            }
          }
        },
        required: ["overallComment", "alternativesExplanation"]
      }
    }
  });

  return JSON.parse(response.text) as QuestionAnalysis;
}

export async function searchHistoricalQuestions(query: string): Promise<Question[]> {
    // In a real scenario, this would call a backend. 
    // Here we use Gemini to "simulate" or find representative historical questions.
    const prompt = `Gere 3 questões reais ou baseadas em concursos reais de Farmacêutico no Brasil (como EBSERH, Prefeituras, ANVISA, etc) sobre o tema: ${query}. 
    Retorne em formato JSON estruturado.`;

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
                                properties: {
                                    letter: { type: Type.STRING },
                                    text: { type: Type.STRING }
                                }
                            }
                        },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["id", "institution", "year", "text", "options", "correctAnswer"]
                }
            }
        }
    });

    return JSON.parse(response.text) as Question[];
}
