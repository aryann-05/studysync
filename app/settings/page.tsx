"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  CheckCircle2,
  LogOut,
  Palette,
  Bell,
  Clock,
  Shield,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminderTime, setReminderTime] = useState(user?.reminderTime ?? "09:00");
  const [studyHours, setStudyHours] = useState(
    String(user?.studyHoursPerDay ?? 4)
  );
  const [emailNotif, setEmailNotif] = useState(
    user?.emailNotifications ?? true
  );

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateUser({
      theme,
      reminderTime,
      studyHoursPerDay: Number(studyHours),
      emailNotifications: emailNotif,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Customize your StudySync experience."
      />

      {saved && (
        <div
          className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4" />
          Settings saved successfully!
        </div>
      )}

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Choose how StudySync looks. You can switch between light, dark,
                or system preference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { value: "light" as const, label: "Light", icon: Sun },
                  { value: "dark" as const, label: "Dark", icon: Moon },
                  { value: "system" as const, label: "System", icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        theme === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      aria-pressed={theme === option.value}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          theme === option.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders */}
        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Reminders & Notifications
              </CardTitle>
              <CardDescription>
                Set when you'd like to be reminded about study sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Daily Reminder Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-40"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive a reminder to study at this time each day.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive session reminders and updates via email.
                  </p>
                </div>
                <Switch
                  checked={emailNotif}
                  onCheckedChange={setEmailNotif}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study */}
        <TabsContent value="study" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Study Preferences
              </CardTitle>
              <CardDescription>
                Configure your daily study goals and schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studyHours">Daily Study Goal (hours)</Label>
                <Input
                  id="studyHours"
                  type="number"
                  min={1}
                  max={12}
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="w-40"
                />
                <p className="text-xs text-muted-foreground">
                  StudySync will plan sessions to fit within this daily limit.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Study Mode</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="intensive">Intensive</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>
                Manage your account and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Signed in as</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.name} · {user?.email}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Log out of StudySync</p>
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to the home page.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}

