
'use server';

/**
 * @fileOverview Generates a quiz from a given topic in a specified language.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic to generate a quiz about.'),
  language: z.string().describe('The language for the quiz (e.g., English, Bangla).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz in JSON format.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are a quiz generator. Generate a quiz about the topic: {{{topic}}} in {{language}}. The quiz should be returned as a JSON object with the following format:

{
  "title": "Quiz Title (in {{language}})",
  "questions": [
    {
      "question": "Question 1 (in {{language}})",
      "answers": [
        "Answer 1 (in {{language}})",
        "Answer 2 (in {{language}})",
        "Answer 3 (in {{language}})",
        "Answer 4 (in {{language}})"
      ],
      "correctAnswerIndex": 0,
      "explanation": "Optional explanation for the answer (in {{language}})."
    },
    // ... more questions ...
    {
      "question": "Question 20 (in {{language}})",
      "answers": [
        "Answer 1 (in {{language}})",
        "Answer 2 (in {{language}})",
        "Answer 3 (in {{language}})",
        "Answer 4 (in {{language}})"
      ],
      "correctAnswerIndex": 2,
      "explanation": "Optional explanation for why this is correct (in {{language}})."
    }
  ]
}

Ensure the JSON is valid and can be parsed without errors. The quiz must contain 20 questions. Each question should have between 2 and 4 answer choices. All text content (title, questions, answers, explanations) must be in {{language}}. Include a brief 'explanation' field for each question, explaining the correct answer, also in {{language}}.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await generateQuizPrompt(input);
    return output!;
  }
);
