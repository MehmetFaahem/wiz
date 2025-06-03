
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Languages } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }).max(100, {
    message: "Topic must be at most 100 characters.",
  }),
  language: z.string().min(1, { message: "Please select a language." }),
});

export type QuizGeneratorFormValues = z.infer<typeof formSchema>;

type QuizGeneratorFormProps = {
  onSubmit: (values: QuizGeneratorFormValues) => void;
  isLoading?: boolean;
};

export default function QuizGeneratorForm({ onSubmit, isLoading }: QuizGeneratorFormProps) {
  const form = useForm<QuizGeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      language: "English",
    },
  });

  function handleSubmit(values: QuizGeneratorFormValues) {
    onSubmit(values);
  }

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create a New Quiz</CardTitle>
        <CardDescription>Enter a topic, select a language, and let AI craft a quiz for you!</CardDescription>
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
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg flex items-center">
                    <Languages className="mr-2 h-5 w-5" />
                    Language
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base py-3">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Bangla">Bangla (বাংলা)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The quiz will be generated in this language.
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
