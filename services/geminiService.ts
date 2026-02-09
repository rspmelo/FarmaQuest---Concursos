
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionAnalysis, Exam } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeQuestion(question: Question): Promise<QuestionAnalysis> {
  const prompt = `
    Como um professor especialista em concursos para Farmacêuticos no Brasil, analise a seguinte questão de concurso:
    Instituição: ${question.institution} | Ano: ${question.year} | Assunto: ${question.subject}
    Questão: ${question.text}
    Gabarito: ${question.correctAnswer}
    Retorne um JSON com overallComment e alternativesExplanation detalhadas.
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
    const prompt = `Gere 5 questões baseadas em concursos reais de Farmacêutico no Brasil sobre: ${query}. Retorne em JSON.`;
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
  const prompt = `Liste 5 provas famosas reais de concursos de farmacêutico (ex: EBSERH 2023, Marinha, etc). 
  Para cada uma, adicione um campo aiAnalysis curto descrevendo o perfil da prova.`;
  
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
  const prompt = `Gere 10 questões que compõem a prova real de concurso de Farmacêutico: ${examTitle}. 
  As questões devem ser fiéis ao estilo da banca e ao conteúdo cobrado naquela edição.`;
  
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
