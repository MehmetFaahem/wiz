"use client";

import { useState } from 'react';
import { generateQuiz, GenerateQuizInput } from '@/ai/flows/generate-quiz';
import type { Quiz } from '@/types/quiz';
import QuizGeneratorForm from '@/components/quiz-generator-form';
import QuizDisplay from '@/components/quiz-display';
import QuizResults from '@/components/quiz-results';
import { Loader2, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';


type QuizAppState = 'idle' | 'generating' | 'active' | 'completed';

export default function HomePage() {
  const [quizState, setQuizState] = useState<QuizAppState>('idle');
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number>(0);
  const { toast } = useToast();

  const handleGenerateQuiz = async (topic: string) => {
    setQuizTopic(topic);
    setQuizState('generating');
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizData(null);

    try {
      const input: GenerateQuizInput = { topic };
      const result = await generateQuiz(input);
      
      let parsedQuizCandidate;
      try {
        parsedQuizCandidate = JSON.parse(result.quiz);
      } catch (parseError) {
        console.error("Invalid JSON from AI:", result.quiz, parseError);
        toast({
          title: "Quiz Generation Error",
          description: "The AI returned an invalid format. Please try a different topic or try again later.",
          variant: "destructive",
        });
        setQuizState('idle');
        return;
      }
      
      // Validate parsedQuiz structure
      if (
        parsedQuizCandidate &&
        typeof parsedQuizCandidate.title === 'string' &&
        Array.isArray(parsedQuizCandidate.questions) &&
        parsedQuizCandidate.questions.length > 0 && // Ensure there's at least one question
        parsedQuizCandidate.questions.every(
          (q: any) =>
            q && // Ensure question object exists
            typeof q.question === 'string' &&
            Array.isArray(q.answers) &&
            q.answers.length > 0 && // Ensure there's at least one answer choice
            typeof q.correctAnswerIndex === 'number' &&
            q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.answers.length &&
            q.answers.every((a: any) => typeof a === 'string')
        )
      ) {
        setQuizData(parsedQuizCandidate as Quiz);
        setQuizState('active');
        toast({ title: "Quiz Ready!", description: `Your quiz on "${topic}" is here!` });
      } else {
        console.error("Invalid quiz structure received:", parsedQuizCandidate);
        toast({
          title: "Quiz Generation Error",
          description: "The generated quiz has an invalid structure. Please try again.",
          variant: "destructive",
        });
        setQuizState('idle');
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Quiz Generation Failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setQuizState('idle');
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };
  
  const calculateResults = () => {
    if (!quizData) return 0;
    let correctAnswers = 0;
    quizData.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    return correctAnswers; // Return for immediate use if needed
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults(); 
      setQuizState('completed');
    }
  };
  
  const handleRestartQuiz = () => {
    setQuizState('idle');
    setQuizTopic('');
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-body">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Brain className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-foreground">Quiz Wiz</h1>
        </div>
        <p className="text-muted-foreground text-lg">Generate and take quizzes on any topic!</p>
      </header>

      <main className="w-full max-w-2xl">
        {quizState === 'idle' && (
          <QuizGeneratorForm onSubmit={handleGenerateQuiz} isLoading={quizState === 'generating'} />
        )}
        {quizState === 'generating' && (
          <Card className="shadow-xl rounded-xl">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
              <p className="text-xl text-foreground font-semibold">Generating your quiz on "{quizTopic}"...</p>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </CardContent>
          </Card>
        )}
        {quizState === 'active' && quizData && (
          <QuizDisplay
            quiz={quizData}
            currentQuestionIndex={currentQuestionIndex}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={userAnswers[currentQuestionIndex]}
            onNextQuestion={handleNextQuestion}
            totalQuestions={quizData.questions.length}
          />
        )}
        {quizState === 'completed' && quizData && (
          <QuizResults
            quiz={quizData}
            userAnswers={userAnswers}
            score={score}
            onRestart={handleRestartQuiz}
            topic={quizTopic}
          />
        )}
      </main>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Quiz Wiz. Powered by AI.</p>
      </footer>
    </div>
  );
}
