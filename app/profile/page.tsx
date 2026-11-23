"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileCard } from "@/components/profile/profile-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStudyContext } from "@/context/StudyContext";
import { getProgressData, getTotalStudyHours } from "@/lib/helpers";
import { profileSchema, type ProfileFormData } from "@/lib/validators";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { topics, sessions } = useStudyContext();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const progress = user ? getProgressData(topics, sessions) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      examDate: user?.examDate ?? "",
      studyHoursPerDay: user?.studyHoursPerDay ?? 4,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateUser({
      name: data.name,
      email: data.email,
      examDate: data.examDate,
      studyHoursPerDay: data.studyHoursPerDay,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and study preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {user && (
            <ProfileCard
              user={user}
              stats={
                progress
                  ? {
                      completedTopics: progress.completedTopics,
                      totalTopics: progress.totalTopics,
                      studyHours: Math.round(getTotalStudyHours(sessions)),
                      streak: progress.studyStreak,
                    }
                  : undefined
              }
            />
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name, email, and study preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {saved && (
                <div
                  className="mb-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam Date</Label>
                    <Input
                      id="examDate"
                      type="date"
                      aria-invalid={!!errors.examDate}
                      {...register("examDate")}
                    />
                    {errors.examDate && (
                      <p className="text-xs text-destructive">
                        {errors.examDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studyHoursPerDay">
                      Daily Study Goal (hours)
                    </Label>
                    <Input
                      id="studyHoursPerDay"
                      type="number"
                      min={1}
                      max={12}
                      aria-invalid={!!errors.studyHoursPerDay}
                      {...register("studyHoursPerDay", {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.studyHoursPerDay && (
                      <p className="text-xs text-destructive">
                        {errors.studyHoursPerDay.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Email notifications",
                  description: "Receive study reminders and updates via email.",
                  default: user?.emailNotifications ?? true,
                  key: "emailNotifications" as const,
                },
                {
                  label: "Push notifications",
                  description: "Get browser push notifications for sessions.",
                  default: true,
                  key: "pushNotifications" as const,
                },
                {
                  label: "Exam countdown alerts",
                  description: "Daily countdown reminders as your exam approaches.",
                  default: true,
                  key: "countdownAlerts" as const,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    defaultChecked={item.default}
                    onCheckedChange={(checked) => {
                      if (item.key === "emailNotifications") {
                        updateUser({ emailNotifications: checked });
                      }
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

