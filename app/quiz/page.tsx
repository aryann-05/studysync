"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Award,
  ArrowRight,
  BookOpen,
  Sparkles,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useStudyContext } from "@/context/StudyContext";
import { fetchQuizzes, fetchQuizDetails, submitQuizAnswers } from "@/services/quiz";
import type { Quiz, QuizQuestion, QuizSubmissionResult, WeakTopicFocus } from "@/types";
import { cn } from "@/lib/utils";

export default function QuizSectionPage() {
  const router = useRouter();
  const { activePlan, topics, setCurrentTopic } = useStudyContext();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [focusTopics, setFocusTopics] = useState<WeakTopicFocus[]>([]);
  const [courseInfo, setCourseInfo] = useState<{
    course_name: string;
    start_date: string;
    exam_date: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  // Load quizzes
  const loadQuizzesData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchQuizzes();
      if (res.success && res.data) {
        setQuizzes(res.data.quizzes || []);
        setFocusTopics(res.data.focus_topics || []);
        if (res.data.plan) {
          setCourseInfo(res.data.plan);
        }
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzesData();
  }, []);

  // Group quizzes by module
  const moduleGroups = useMemo(() => {
    const groups = new Map<string, Quiz[]>();
    for (const q of quizzes) {
      const mod = q.module_name || "General Module";
      if (!groups.has(mod)) {
        groups.set(mod, []);
      }
      groups.get(mod)!.push(q);
    }
    return Array.from(groups.entries()).map(([moduleName, moduleQuizzes]) => ({
      moduleName,
      quizzes: moduleQuizzes.sort((a, b) => a.quiz_number - b.quiz_number),
    }));
  }, [quizzes]);

  // Overall statistics
  const completedCount = useMemo(
    () => quizzes.filter((q) => q.is_completed).length,
    [quizzes]
  );

  const averageScore = useMemo(() => {
    const completed = quizzes.filter((q) => q.latest_attempt);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, q) => acc + (q.latest_attempt?.percentage || 0), 0);
    return Math.round(sum / completed.length);
  }, [quizzes]);

  // Start taking a quiz
  const handleStartQuiz = async (quizId: string) => {
    try {
      setIsLoading(true);
      const res = await fetchQuizDetails(quizId);
      if (res.success && res.data) {
        setActiveQuiz(res.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizResult(null);
      }
    } catch (err) {
      console.error("Failed to load quiz details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const answersPayload = (activeQuiz.questions || []).map((q) => ({
        question_id: q.question_id,
        selected_index:
          selectedAnswers[q.question_id] !== undefined
            ? selectedAnswers[q.question_id]
            : -1,
      }));

      const res = await submitQuizAnswers(activeQuiz.quiz_id, answersPayload);
      if (res.success && res.data) {
        setQuizResult(res.data);
        // Reload quizzes in background to refresh marks & focus topics
        loadQuizzesData();
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudyFocusTopic = (topicTitle: string) => {
    const matched = topics.find(
      (t) => t.name.toLowerCase() === topicTitle.toLowerCase()
    );
    if (matched) {
      setCurrentTopic(matched);
    }
    router.push("/study");
  };

  // 1. QUIZ TAKING & RESULTS VIEW
  if (activeQuiz) {
    const currentQuestions = activeQuiz.questions || [];
    const currentQ = currentQuestions[currentQuestionIndex];
    const totalQuestions = currentQuestions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="space-y-6">
        <PageHeader
          title={activeQuiz.title}
          description={`Module: ${activeQuiz.module_name} · Total Marks: ${activeQuiz.total_marks}`}
          showBackButton={false}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveQuiz(null);
              setQuizResult(null);
            }}
          >
            Exit Quiz
          </Button>
        </PageHeader>

        {/* RESULTS SCREEN */}
        {quizResult ? (
          <div className="space-y-6 animate-fade-in">
            {/* Marks Banner */}
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="flex flex-col items-center p-6 text-center sm:p-8">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <Award className="h-8 w-8" />
                </span>
                <Badge
                  variant={
                    quizResult.grade === "Mastered"
                      ? "success"
                      : quizResult.grade === "Needs Revision"
                      ? "warning"
                      : "destructive"
                  }
                  className="mb-2 text-xs px-3 py-1 font-semibold"
                >
                  Grade: {quizResult.grade}
                </Badge>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
                  {quizResult.score} / {quizResult.total_marks} Marks
                </h2>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {quizResult.percentage}% Score Achieved
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {quizResult.feedback}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      setActiveQuiz(null);
                      setQuizResult(null);
                    }}
                    className="gap-2"
                  >
                    Back to All Quizzes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStartQuiz(activeQuiz.quiz_id)}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ACTIONABLE FOCUS TOPICS FEEDBACK */}
            {quizResult.weak_topics && quizResult.weak_topics.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/[0.03]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <CardTitle className="text-base text-foreground">
                      Targeted Focus Feedback: Topics to Prioritize
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Based on your incorrect quiz responses, we recommend reinforcing these syllabus topics before your exam:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quizResult.weak_topics.map((wt, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-lg border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {wt.topic_title}
                          </span>
                          <Badge
                            variant={wt.priority === "HIGH" ? "destructive" : "warning"}
                            className="text-[10px]"
                          >
                            {wt.priority === "HIGH" ? "Critical Focus" : "Review Recommended"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Accuracy: {wt.accuracy_percent}% ({wt.mistakes} mistake{wt.mistakes > 1 ? "s" : ""})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {wt.recommendation}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStudyFocusTopic(wt.topic_title)}
                        className="shrink-0 gap-1.5 text-xs font-medium"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Study Topic Now
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* QUESTION BY QUESTION DETAILED BREAKDOWN */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Detailed Question & Answer Analysis
              </h3>
              {quizResult.questions.map((q, idx) => (
                <Card
                  key={q.question_id}
                  className={cn(
                    "border transition-all",
                    q.is_correct ? "border-emerald-500/30" : "border-destructive/30"
                  )}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Question {idx + 1} · Topic: {q.topic_title}
                        </span>
                        <p className="font-medium text-sm sm:text-base text-foreground">
                          {q.question_text}
                        </p>
                      </div>
                      {q.is_correct ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" /> +1 Mark
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full shrink-0">
                          <XCircle className="h-3.5 w-3.5" /> 0 Marks
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOption = optIdx === q.correct_index;
                        const isUserChoice = optIdx === q.selected_index;

                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs sm:text-sm",
                              isCorrectOption && "border-emerald-500 bg-emerald-500/10 font-medium text-emerald-900 dark:text-emerald-200",
                              isUserChoice && !isCorrectOption && "border-destructive bg-destructive/10 text-destructive line-through",
                              !isCorrectOption && !isUserChoice && "border-border text-muted-foreground"
                            )}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectOption && (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500">
                                Correct Answer
                              </Badge>
                            )}
                            {isUserChoice && !isCorrectOption && (
                              <Badge variant="destructive" className="text-[10px]">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTIONS QUESTIONNAIRE */
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span>
                  {answeredCount} of {totalQuestions} answered
                </span>
              </div>
              <Progress
                value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                className="h-2"
              />
            </div>

            {/* Current Question Card */}
            {currentQ && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Topic: {currentQ.topic_title}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Mark: {currentQ.marks || 1}
                    </span>
                  </div>
                  <CardTitle className="text-base sm:text-lg mt-2 text-foreground font-semibold leading-relaxed">
                    {currentQ.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected =
                      selectedAnswers[currentQ.question_id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          handleSelectOption(currentQ.question_id, optIdx)
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                            : "border-border text-foreground hover:bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Navigator Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(totalQuestions - 1, prev + 1)
                      )
                    }
                    className="gap-1.5"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting || answeredCount === 0}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    {isSubmitting ? "Submitting & Grading..." : "Submit Quiz & View Marks"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. MAIN QUIZZES OVERVIEW SCREEN
  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Quizzes & Assessments"
        description="2 to 3 milestone quizzes per syllabus module held before your exam date to assess retention and highlight weak topics."
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Total Quizzes
              </span>
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {quizzes.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {completedCount} of {quizzes.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Average Marks Score
              </span>
              <Award className="h-4 w-4 text-secondary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-secondary">
              {averageScore}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all completed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Topics Requiring Focus
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-500">
              {focusTopics.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Identified from quiz evaluation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Target Exam Date
              </span>
              <Calendar className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 text-lg font-bold text-foreground truncate">
              {courseInfo?.exam_date || activePlan?.examDate || "Scheduled Soon"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All quizzes held before exam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FOCUS TOPICS SECTION */}
      {focusTopics.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <CardTitle className="text-base font-semibold">
                Personalized Topic Focus Feedback
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Based on your quiz performance, focus more on these topics before your upcoming exam:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {focusTopics.slice(0, 4).map((ft, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {ft.topic_title}
                    </span>
                    <Badge
                      variant={ft.priority === "HIGH" ? "destructive" : "warning"}
                      className="text-[10px]"
                    >
                      {ft.priority === "HIGH" ? "High Focus" : "Review Topic"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Lowest score: {ft.lowest_accuracy}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ft.recommendation}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStudyFocusTopic(ft.topic_title)}
                  className="shrink-0 gap-1.5 text-xs font-medium hover:bg-primary hover:text-white"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Study Topic
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* MODULE QUIZZES LIST */}
      <div className="space-y-6">
        {moduleGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {groupIdx + 1}
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                {group.moduleName}
              </h3>
              <Badge variant="outline" className="text-xs font-normal">
                {group.quizzes.length} Quizzes Scheduled
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.quizzes.map((quiz) => {
                const attempt = quiz.latest_attempt;
                const isDone = quiz.is_completed;

                return (
                  <Card
                    key={quiz.quiz_id}
                    className={cn(
                      "flex flex-col justify-between border transition-all hover:border-primary/40 hover:shadow-md",
                      isDone && "border-emerald-500/30 bg-emerald-500/[0.02]"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          Quiz {quiz.quiz_number}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          Before Exam: {quiz.scheduled_date}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold mt-1 text-foreground leading-snug">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {isDone && attempt ? (
                        <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              Marks Scored
                            </span>
                            <Badge
                              variant={
                                attempt.grade === "Mastered"
                                  ? "success"
                                  : attempt.grade === "Needs Revision"
                                  ? "warning"
                                  : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {attempt.grade}
                            </Badge>
                          </div>
                          <div className="text-xl font-extrabold text-foreground">
                            {attempt.score} / {attempt.total_marks} Marks
                            <span className="text-xs font-normal text-muted-foreground ml-1.5">
                              ({attempt.percentage}%)
                            </span>
                          </div>
                          {attempt.weak_topics && attempt.weak_topics.length > 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              Focus topic: {attempt.weak_topics[0].topic_title}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between font-medium">
                            <span>Total Marks: {quiz.total_marks}</span>
                            <span>{quiz.question_count || 5} Questions</span>
                          </div>
                          <p className="text-[11px]">
                            Assessment scheduled to test core concepts before your final exam.
                          </p>
                        </div>
                      )}

                      <div className="pt-1">
                        {isDone ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartQuiz(quiz.quiz_id)}
                            className="w-full gap-1.5 text-xs font-semibold"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Review & Retake Quiz
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleStartQuiz(quiz.quiz_id)}
                            className="w-full gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
                          >
                            Start Module Quiz
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
