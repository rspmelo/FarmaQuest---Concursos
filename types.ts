
export interface Question {
  id: string;
  institution: string;
  year: number;
  role: string;
  subject: string;
  text: string;
  options: {
    letter: string;
    text: string;
  }[];
  correctAnswer: string;
}

export interface QuestionAnalysis {
  overallComment: string;
  alternativesExplanation: {
    letter: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface User {
  isLoggedIn: boolean;
  name?: string;
  email?: string;
  isMember: boolean;
}
