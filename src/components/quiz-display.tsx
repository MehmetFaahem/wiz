"use client";

import type { Quiz } from '@/types/quiz';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, ChevronRight, HelpCircle } from 'lucide-react';

type QuizDisplayProps = {
  quiz: Quiz;
  currentQuestionIndex: number;
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  selectedAnswer: number | undefined; 
  onNextQuestion: () => void;
  totalQuestions: number;
};

export default function QuizDisplay({
  quiz,
  currentQuestionIndex,
  onAnswerSelect,
  selectedAnswer,
  onNextQuestion,
  totalQuestions,
}: QuizDisplayProps) {
  const question = quiz.questions[currentQuestionIndex];
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | undefined>(undefined);

  useEffect(() => {
    setShowFeedback(false);
    setIsCorrect(null);
    setLocalSelectedAnswer(undefined); 
  }, [currentQuestionIndex]);
  
  useEffect(() => {
    // This effect ensures that if the parent's selectedAnswer changes (e.g. due to state restoration or debugging),
    // the local component reflects this, but only if feedback isn't currently shown.
    // This might be relevant if implementing features like "previous question" or saving/loading quiz state.
    if (!showFeedback) {
        setLocalSelectedAnswer(selectedAnswer);
    }
  }, [selectedAnswer, showFeedback]);


  const handleAnswerSubmission = () => {
    if (localSelectedAnswer === undefined) {
      // This should ideally be handled by disabling the button, but as a fallback:
      alert("Please select an answer.");
      return;
    }
    onAnswerSelect(currentQuestionIndex, localSelectedAnswer);
    const correct = localSelectedAnswer === question.correctAnswerIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const progressValue = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <Card className="w-full shadow-xl rounded-xl transition-all duration-500 ease-in-out">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="font-headline text-2xl sm:text-3xl">{quiz.title}</CardTitle>
          <span className="text-sm text-muted-foreground font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <p className="text-xl sm:text-2xl font-semibold text-foreground min-h-[3em]">{question.question}</p>
        
        <RadioGroup
          value={localSelectedAnswer !== undefined ? String(localSelectedAnswer) : undefined}
          onValueChange={(value) => setLocalSelectedAnswer(Number(value))}
          disabled={showFeedback}
          className="space-y-3"
          aria-label='Answers'
        >
          {question.answers.map((answer, index) => {
            const isSelectedByPlayer = localSelectedAnswer === index;
            const isCorrectAnswerChoice = question.correctAnswerIndex === index;
            
            return (
              <Label
                key={index}
                htmlFor={`answer-${index}-${currentQuestionIndex}`} // Ensure unique ID across questions
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300 ease-in-out",
                  "hover:border-primary",
                  showFeedback ? 
                    (isCorrectAnswerChoice ? "border-green-500 bg-green-500/10" : 
                     (isSelectedByPlayer ? "border-red-500 bg-red-500/10" : "border-border opacity-70"))
                    : (isSelectedByPlayer ? "border-primary bg-primary/10" : "border-input"),
                  showFeedback && isSelectedByPlayer && !isCorrectAnswerChoice && "ring-2 ring-red-500",
                  showFeedback && isCorrectAnswerChoice && "ring-2 ring-green-500",
                  !showFeedback && isSelectedByPlayer && "ring-2 ring-primary"
                )}
              >
                <RadioGroupItem value={String(index)} id={`answer-${index}-${currentQuestionIndex}`} className="h-5 w-5 shrink-0" />
                <span className="text-base sm:text-lg flex-grow">{answer}</span>
                {showFeedback && isSelectedByPlayer && isCorrect && <CheckCircle className="ml-auto h-6 w-6 text-green-600 shrink-0" />}
                {showFeedback && isSelectedByPlayer && !isCorrect && <XCircle className="ml-auto h-6 w-6 text-red-600 shrink-0" />}
                {showFeedback && !isSelectedByPlayer && isCorrectAnswerChoice && <HelpCircle data-ai-hint="information help" className="ml-auto h-6 w-6 text-green-700 opacity-80 shrink-0" />}
              </Label>
            );
          })}
        </RadioGroup>

        {showFeedback && question.explanation && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md border border-dashed">
            <h4 className="font-semibold text-sm mb-1 text-foreground">Explanation:</h4>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        {!showFeedback ? (
          <Button onClick={handleAnswerSubmission} className="text-lg py-6 px-8" disabled={localSelectedAnswer === undefined}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={onNextQuestion} className="text-lg py-6 px-8">
            {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
