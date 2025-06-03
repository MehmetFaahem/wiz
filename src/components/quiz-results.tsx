"use client";

import type { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RotateCcw, Share2, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type QuizResultsProps = {
  quiz: Quiz;
  userAnswers: Record<number, number>;
  score: number;
  onRestart: () => void;
  topic: string;
};

export default function QuizResults({ quiz, userAnswers, score, onRestart, topic }: QuizResultsProps) {
  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const [shareMessage, setShareMessage] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    setShareMessage(`I scored ${score}/${totalQuestions} (${percentage}%) on a Quiz Wiz quiz about "${topic}"! Create your own quiz at Quiz Wiz!`);
  }, [score, totalQuestions, percentage, topic]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Quiz Wiz Result!',
          text: shareMessage,
          url: window.location.href, 
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({ title: "Sharing cancelled or failed.", variant: "destructive" });
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareMessage);
        toast({ title: "Results copied to clipboard!" });
      } catch (error) {
        toast({ title: "Could not copy results.", description: "Please try sharing manually.", variant: "destructive" });
      }
    } else {
      toast({ title: "Sharing not supported.", description: "You can manually share your score.", variant: "destructive" });
    }
  };
  
  let feedbackMessage = "";
  if (percentage === 100) feedbackMessage = "Perfect score! You're a Quiz Wiz Master! 🎉";
  else if (percentage >= 80) feedbackMessage = "Excellent work! You really know your stuff! 👍";
  else if (percentage >= 60) feedbackMessage = "Good job! A solid performance. Keep learning! 🤓";
  else if (percentage >= 40) feedbackMessage = "Not bad! There's room for improvement. 💪";
  else feedbackMessage = "Keep practicing! Every attempt is a step forward. 🌟";

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader className="text-center items-center">
        <Award className="h-16 w-16 text-primary mb-4" />
        <CardTitle className="font-headline text-3xl sm:text-4xl">Quiz Complete!</CardTitle>
        <CardDescription className="text-xl mt-1">You scored {score} out of {totalQuestions} ({percentage}%)</CardDescription>
        <p className="text-muted-foreground mt-3 text-md">{feedbackMessage}</p>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <h3 className="text-xl font-semibold text-foreground mb-3 font-headline">Review Your Answers:</h3>
        <ScrollArea className="h-[300px] p-1 pr-4 border rounded-md bg-background">
          <div className="space-y-4 p-3">
          {quiz.questions.map((q, index) => {
            const userAnswerIndex = userAnswers[index];
            const isCorrect = userAnswerIndex === q.correctAnswerIndex;
            return (
              <div key={index} className="p-4 rounded-md bg-card border">
                <p className="font-medium text-card-foreground">{index + 1}. {q.question}</p>
                <div className={cn("flex items-center mt-1", isCorrect ? "text-green-600" : "text-red-600")}>
                  {isCorrect ? <CheckCircle className="inline mr-2 h-5 w-5 shrink-0" /> : <XCircle className="inline mr-2 h-5 w-5 shrink-0" />}
                  <span>Your answer: {userAnswerIndex !== undefined ? q.answers[userAnswerIndex] : "Not answered"}</span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-blue-600 mt-1">Correct answer: {q.answers[q.correctAnswerIndex]}</p>
                )}
                {q.explanation && (
                  <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-dashed"><em>{q.explanation}</em></p>
                )}
                {index < quiz.questions.length - 1 && <Separator className="my-4" />}
              </div>
            );
          })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto text-lg py-6">
          <RotateCcw className="mr-2 h-5 w-5" /> Try Another Quiz
        </Button>
        <Button onClick={handleShare} className="w-full sm:w-auto text-lg py-6">
          <Share2 className="mr-2 h-5 w-5" /> Share Results
        </Button>
      </CardFooter>
    </Card>
  );
}
