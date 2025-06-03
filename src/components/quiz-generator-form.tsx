"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }).max(100, {
    message: "Topic must be at most 100 characters.",
  }),
});

type QuizGeneratorFormProps = {
  onSubmit: (topic: string) => void;
  isLoading?: boolean;
};

export default function QuizGeneratorForm({ onSubmit, isLoading }: QuizGeneratorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.topic);
  }

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create a New Quiz</CardTitle>
        <CardDescription>Enter a topic and let AI craft a quiz for you!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Quiz Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Solar System, React Hooks, World History" {...field} className="text-base py-3"/>
                  </FormControl>
                  <FormDescription>
                    Be specific for better results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? "Generating..." : "Generate Quiz"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
