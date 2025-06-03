export interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  explanation?: string; 
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}
