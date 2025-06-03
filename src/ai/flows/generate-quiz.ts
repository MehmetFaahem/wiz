'use server';

/**
 * @fileOverview Generates a quiz from a given topic.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic to generate a quiz about.'),
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
  prompt: `You are a quiz generator. Generate a quiz about the topic: {{{topic}}}. The quiz should be returned as a JSON object with the following format:

{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question 1",
      "answers": [
        "Answer 1",
        "Answer 2",
        "Answer 3",
        "Answer 4"
      ],
      "correctAnswerIndex": 0
    },
   {
      "question": "Question 2",
      "answers": [
        "Answer 1",
        "Answer 2",
        "Answer 3",
        "Answer 4"
      ],
      "correctAnswerIndex": 2
    },
   {
      "question": "Question 3",
      "answers": [
        "Answer 1",
        "Answer 2",
        "Answer 3",
        "Answer 4"
      ],
      "correctAnswerIndex": 3
    }
  ]
}

Ensure the JSON is valid and can be parsed without errors. The quiz must contain 3 questions.
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
