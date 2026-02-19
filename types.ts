export type QuestionType = 'text' | 'textarea' | 'number';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  hint?: string;
}

export interface Block {
  id: number;
  title: string;
  subtitle: string;
  warning?: string;
  questions: Question[];
}

export interface FormData {
  [key: string]: string;
}
