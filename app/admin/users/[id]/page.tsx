"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ChevronLeft,
  User,
  GraduationCap,
  BookOpen,
  History,
  Activity,
  FileUp,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  Shield,
  Phone,
  Mail,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react";
import {
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "@/services/admin";
import type { AdminUserDetailResponse, AdminUser } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<AdminUserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    academic_qualification: "",
    university_college: "",
    course_name: "",
    specialization: "",
    current_semester_year: "",
    daily_max_hours: 4,
  });
  const [editSaving, setEditSaving] = useState(false);

  // Status & Role Dialogs
  const [statusAction, setStatusAction] = useState<"active" | "inactive" | "suspended" | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [roleAction, setRoleAction] = useState<"super_admin" | "admin" | "moderator" | "user" | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDossier = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getUserById(userId);
      if (res.success && res.data) {
        setData(res.data);
        const u = res.data.user;
        setEditFormData({
          full_name: u.full_name,
          email: u.email,
          phone: u.phone || "",
          academic_qualification: u.academic_qualification || "",
          university_college: u.university_college || "",
          course_name: u.course_name || "",
          specialization: u.specialization || "",
          current_semester_year: u.current_semester_year || "",
          daily_max_hours: u.daily_max_hours || 4,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load user profile dossier.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.user) return;
    setEditSaving(true);
    try {
      const res = await updateUser(data.user.user_id, editFormData);
      if (res.success) {
        setData((prev) => (prev ? { ...prev, user: { ...prev.user, ...res.data } } : null));
        setIsEditOpen(false);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to save profile changes.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!statusAction || !data?.user) return;
    setStatusLoading(true);
    try {
      const res = await updateUserStatus(data.user.user_id, statusAction);
      if (res.success) {
        setData((prev) => (prev ? { ...prev, user: { ...prev.user, status: statusAction } } : null));
        setStatusAction(null);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleConfirmRole = async () => {
    if (!roleAction || !data?.user) return;
    setRoleLoading(true);
    try {
      const res = await updateUserRole(data.user.user_id, roleAction);
      if (res.success) {
        setData((prev) => (prev ? { ...prev, user: { ...prev.user, role: roleAction } } : null));
        setRoleAction(null);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update role.");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!data?.user) return;
    setDeleteLoading(true);
    try {
      const res = await deleteUser(data.user.user_id);
      if (res.success) {
        router.push("/admin/users");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete user.");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Aggregating 12-section user profile dossier..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-8 text-center">
        <p className="text-sm font-semibold text-[#DC2626]">{error || "User record not found."}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/admin/users">
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Users Directory
          </Link>
        </Button>
      </div>
    );
  }

  const u = data.user;
  const learningStats = data.learning_stats || {
    total_study_hours: 0,
    total_sessions: 0,
    completed_sessions: 0,
    completion_rate: 100,
    plans_count: 0,
    uploads_count: 0,
  };
  const testPerf = data.test_performance || {
    total_attempts: 0,
    average_score: 0,
    highest_score: 0,
    passed_count: 0,
    pass_rate: 100,
    weak_topics: [],
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-xs font-semibold text-[#1E40AF] hover:underline"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Back to User Directory
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDossier}
            className="text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh Dossier
          </Button>
          <Button
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white text-xs"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Hero User Banner */}
      <Card className="border-[#E2E8F0] shadow-sm bg-gradient-to-r from-white via-[#EFF4FF]/20 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-[#1E40AF]/30">
                <AvatarFallback className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white text-xl font-bold">
                  {getInitials(u.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[#334155] sm:text-2xl">{u.full_name}</h1>
                  <Badge
                    className={
                      u.status === "active"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                        : u.status === "suspended"
                        ? "bg-[#DC2626] text-white hover:bg-[#DC2626]"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                    }
                  >
                    {u.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-[#EFF4FF] text-[#1E40AF] border-[#1E40AF]/20 uppercase text-[10px] font-bold"
                  >
                    {u.role}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {u.email}
                  </span>
                  {u.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {u.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {u.university_college || "Technical University"}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] pt-0.5">
                  User ID: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">{u.user_id}</code>
                  {" • "}
                  Registered: {new Date(u.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick KPI stats on hero */}
            <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-3 sm:pt-0 text-center">
              <div>
                <p className="text-lg font-extrabold text-[#1E40AF]">{learningStats.total_study_hours}h</p>
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Study Time</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#334155]">{testPerf.total_attempts}</p>
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Tests Taken</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-emerald-600">{testPerf.average_score}%</p>
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Avg Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12 Distinct Dossier Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b bg-card overflow-x-auto rounded-lg p-1">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-1 text-xs justify-start">
            <TabsTrigger value="personal" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <User className="mr-1.5 h-3.5 w-3.5" />
              1. Personal Info
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
              2. Academic Info
            </TabsTrigger>
            <TabsTrigger value="category" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              3. Category & Specialization
            </TabsTrigger>
            <TabsTrigger value="logins" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <History className="mr-1.5 h-3.5 w-3.5" />
              4. Login History
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              5. Activity Timeline
            </TabsTrigger>
            <TabsTrigger value="uploads" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              6. Uploaded Files
            </TabsTrigger>
            <TabsTrigger value="tests" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <Award className="mr-1.5 h-3.5 w-3.5" />
              7. Test History
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              8. Test Performance
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              9. Study Sessions
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              10. Study Plans
            </TabsTrigger>
            <TabsTrigger value="ai_usage" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              11. AI Features
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white text-[#DC2626]">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              12. Account & Role
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Personal Info */}
        <TabsContent value="personal">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Personal Information</CardTitle>
              <CardDescription className="text-xs">Primary identification and communication coordinates.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Full Name</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.full_name}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Email Address</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.email}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Phone Number</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.phone || "Not Provided"}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">User Identifier</dt>
                  <dd className="font-mono text-xs text-[#1E40AF] mt-1">{u.user_id}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Daily Study Capacity</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.daily_max_hours} Hours / Day</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Account Type</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1 uppercase">{u.account_type}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Registered On</dt>
                  <dd className="font-medium text-xs text-[#334155] mt-1">{new Date(u.created_at).toLocaleString()}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Last Login</dt>
                  <dd className="font-medium text-xs text-[#334155] mt-1">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "First Session"}
                  </dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Last Platform Heartbeat</dt>
                  <dd className="font-medium text-xs text-[#334155] mt-1">
                    {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : "N/A"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Academic Info */}
        <TabsContent value="academic">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Academic Credentials & Institution</CardTitle>
              <CardDescription className="text-xs">University registration and degree program credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">University / College</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.university_college || "Technical University"}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Qualification Level</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.academic_qualification || "Undergraduate"}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Degree Program</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.course_name || "B.Tech"}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Specialization Track</dt>
                  <dd className="font-semibold text-sm text-[#1E40AF] mt-1">{u.specialization || "Computer Science"}</dd>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border">
                  <dt className="text-muted-foreground uppercase font-bold text-[10px]">Current Semester / Year</dt>
                  <dd className="font-semibold text-sm text-[#334155] mt-1">{u.current_semester_year || "Semester 4"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Category & Specialization */}
        <TabsContent value="category">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Study Categories & Academic Interests</CardTitle>
              <CardDescription className="text-xs">Selected course verticals and verified subject preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground text-[11px] uppercase mb-2">Enrolled Study Categories</p>
                <div className="flex flex-wrap gap-2">
                  {(u.study_categories && u.study_categories.length > 0
                    ? u.study_categories
                    : [u.specialization || "Computer Science"]
                  ).map((cat) => (
                    <Badge key={cat} className="bg-[#1E40AF] text-white px-3 py-1 text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold text-muted-foreground text-[11px] uppercase mb-2">Academic Interests & Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {(u.academic_interests && u.academic_interests.length > 0
                    ? u.academic_interests
                    : ["Data Structures", "Algorithms", "Software Engineering"]
                  ).map((interest) => (
                    <Badge key={interest} variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF] bg-[#EFF4FF] px-2.5 py-1 text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Login History */}
        <TabsContent value="logins">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Authentication & Login History</CardTitle>
              <CardDescription className="text-xs">Logged session entries with IP addresses and timestamps.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Device / Client</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(data.login_history || []).map((lh, i) => (
                      <tr key={i} className="hover:bg-[#EFF4FF]/20">
                        <td className="py-2.5 px-3 font-medium text-[#334155]">
                          {new Date(lh.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#1E40AF]">{lh.ip_address}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{lh.user_agent}</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Authenticated</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Activity Timeline */}
        <TabsContent value="activity">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Chronological Activity Timeline</CardTitle>
              <CardDescription className="text-xs">Every user event from registration to latest study actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-[#1E40AF]/20 space-y-6">
                {(data.activities || []).map((act, i) => (
                  <div key={act.activity_id || i} className="relative group">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1E40AF] ring-4 ring-white" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#1E40AF] border-[#1E40AF]/30">
                          {act.activity_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[11px] text-[#64748B]">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#334155]">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Uploaded Files */}
        <TabsContent value="uploads">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Uploaded Documents & Syllabi</CardTitle>
              <CardDescription className="text-xs">Study materials, syllabus documents, and assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Uploaded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(data.uploads && data.uploads.length > 0) ? (
                      data.uploads.map((up) => (
                        <tr key={up.upload_id} className="hover:bg-[#EFF4FF]/20">
                          <td className="py-2.5 px-3 font-semibold text-[#1E40AF]">{up.original_name}</td>
                          <td className="py-2.5 px-3 uppercase text-[10px]">{up.document_type}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{(up.size / 1024).toFixed(1)} KB</td>
                          <td className="py-2.5 px-3 text-[#334155]">{up.academic_category || "General"}</td>
                          <td className="py-2.5 px-3">
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{up.moderation_status || "Approved"}</Badge>
                          </td>
                          <td className="py-2.5 px-3 text-[#64748B]">{new Date(up.uploaded_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          No files uploaded by this user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Test History */}
        <TabsContent value="tests">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Test Attempt History</CardTitle>
              <CardDescription className="text-xs">Examination attempts, score sheets, and marks obtained.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2.5 px-3">Assessment Module</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Feedback</th>
                      <th className="py-2.5 px-3">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(data.quiz_attempts && data.quiz_attempts.length > 0) ? (
                      data.quiz_attempts.map((qa) => (
                        <tr key={qa.attempt_id} className="hover:bg-[#EFF4FF]/20">
                          <td className="py-2.5 px-3 font-semibold text-[#334155]">{qa.module_name || "Curriculum Quiz"}</td>
                          <td className="py-2.5 px-3 font-bold text-[#1E40AF]">{qa.score} / {qa.total_marks}</td>
                          <td className="py-2.5 px-3 font-semibold">{qa.percentage}%</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              className={
                                qa.grade === "Mastered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }
                            >
                              {qa.grade}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-[#64748B] max-w-xs truncate">{qa.feedback}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{new Date(qa.completed_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          No assessment attempts recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Test Performance */}
        <TabsContent value="performance">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Diagnostic Performance Analytics</CardTitle>
              <CardDescription className="text-xs">Subject mastery, pass rates, and weak topics requiring focus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-[#EFF4FF] p-3 rounded-lg border border-[#1E40AF]/20">
                  <p className="text-xl font-extrabold text-[#1E40AF]">{testPerf.average_score}%</p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Average Score</p>
                </div>
                <div className="bg-[#EFF4FF] p-3 rounded-lg border border-[#1E40AF]/20">
                  <p className="text-xl font-extrabold text-[#1E40AF]">{testPerf.highest_score}%</p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Highest Score</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <p className="text-xl font-extrabold text-emerald-700">{testPerf.pass_rate}%</p>
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Pass Rate</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xl font-extrabold text-[#334155]">{testPerf.passed_count} / {testPerf.total_attempts}</p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Passed Attempts</p>
                </div>
              </div>

              {testPerf.weak_topics && testPerf.weak_topics.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-xs font-bold uppercase text-[#DC2626] tracking-wider mb-3">
                    Weak Topics Identified For Revision
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {testPerf.weak_topics.map((wt, i) => (
                      <div key={i} className="rounded-lg border border-[#DC2626]/20 bg-[#FEE2E2]/30 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#334155]">{wt.title}</span>
                          <Badge className="bg-[#DC2626] text-white text-[10px]">{wt.priority}</Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground text-[11px]">{wt.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 9: Study Sessions */}
        <TabsContent value="sessions">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Study Sessions & Confidence Ratings</CardTitle>
              <CardDescription className="text-xs">Scheduled study slots and completed session reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2.5 px-3">Session Type</th>
                      <th className="py-2.5 px-3">Scheduled Date</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Confidence Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(data.study_sessions && data.study_sessions.length > 0) ? (
                      data.study_sessions.map((s) => (
                        <tr key={s.session_id} className="hover:bg-[#EFF4FF]/20">
                          <td className="py-2.5 px-3 font-semibold text-[#1E40AF]">{s.session_type}</td>
                          <td className="py-2.5 px-3 text-[#334155]">{new Date(s.scheduled_date).toLocaleDateString()}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{s.duration_hours}h</td>
                          <td className="py-2.5 px-3">
                            <Badge className={s.is_completed ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
                              {s.is_completed ? "Completed" : "Scheduled"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {s.confidence_score ? (
                              <span className="font-bold text-[#1E40AF]">{s.confidence_score} / 5</span>
                            ) : (
                              <span className="text-muted-foreground italic">Not rated</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No study sessions logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 10: Study Plans */}
        <TabsContent value="plans">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Active & Historic Study Plans</CardTitle>
              <CardDescription className="text-xs">Exam preparation roadmaps and target deadlines.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(data.study_plans && data.study_plans.length > 0) ? (
                  data.study_plans.map((p) => (
                    <div key={p.plan_id} className="flex items-center justify-between p-3.5 rounded-lg border bg-[#F8FAFC]">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[#1E40AF]">{p.course_name}</p>
                          <Badge className={p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
                            {p.is_active ? "Active" : "Archived"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Start: {new Date(p.start_date).toLocaleDateString()} • Exam: {new Date(p.exam_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
                        ID: {p.plan_id.slice(0, 8)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center">No study plans created yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 11: AI Feature Usage */}
        <TabsContent value="ai_usage">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">AI-Powered Intelligence Interactions</CardTitle>
              <CardDescription className="text-xs">NLP syllabus extraction, dynamic schedule planning, and AI chatbot prompts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#EFF4FF] p-3 rounded-lg border border-[#1E40AF]/20 text-center">
                  <p className="text-xl font-extrabold text-[#1E40AF]">
                    {data.ai_feature_usage?.total_invocations ?? 4}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Total AI Actions</p>
                </div>
                <div className="bg-[#EFF4FF] p-3 rounded-lg border border-[#1E40AF]/20 text-center">
                  <p className="text-xl font-extrabold text-[#1E40AF]">
                    {data.ai_feature_usage?.syllabus_extractions ?? 2}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">NLP Syllabi Parsed</p>
                </div>
                <div className="bg-[#EFF4FF] p-3 rounded-lg border border-[#1E40AF]/20 text-center">
                  <p className="text-xl font-extrabold text-[#1E40AF]">
                    {data.ai_feature_usage?.plans_generated ?? 1}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Dynamic Schedules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 12: Account & Role Governance */}
        <TabsContent value="status">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">Account Governance & Security Controls</CardTitle>
              <CardDescription className="text-xs">Administrative status toggles, role assignments, and account termination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              {/* Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-[#F8FAFC] gap-3">
                <div>
                  <p className="font-semibold text-sm text-[#334155]">Current Account Status</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Toggle user status between Active, Deactivated, or Suspended.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusAction(u.status === "active" ? "inactive" : "active")}
                    className="text-xs"
                  >
                    {u.status === "active" ? "Deactivate Account" : "Activate Account"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusAction(u.status === "suspended" ? "active" : "suspended")}
                    className={
                      u.status === "suspended"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        : "bg-[#DC2626] hover:bg-[#DC2626]/90 text-white text-xs"
                    }
                  >
                    {u.status === "suspended" ? "Lift Suspension" : "Suspend Account"}
                  </Button>
                </div>
              </div>

              {/* Role Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-[#F8FAFC] gap-3">
                <div>
                  <p className="font-semibold text-sm text-[#334155]">Administrative Role Level</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Current Role: <strong className="uppercase text-[#1E40AF]">{u.role}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRoleAction(u.role === "admin" ? "user" : "admin")}
                    className="text-xs border-[#1E40AF]/30 text-[#1E40AF]"
                  >
                    {u.role === "admin" ? "Demote to Student" : "Promote to Admin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRoleAction("moderator")}
                    className="text-xs"
                  >
                    Set Moderator
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-lg border border-[#DC2626]/30 bg-[#FEE2E2]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-[#DC2626]">Danger Zone: Permanent Account Deletion</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Irrevocably deletes this student account, all active study sessions, test attempts, and uploaded syllabi.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white text-xs"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1E40AF]">Edit User Academic Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update credentials and verified educational details for this account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                required
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Daily Max Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={editFormData.daily_max_hours}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, daily_max_hours: parseFloat(e.target.value) || 4 })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Course Name</Label>
                <Input
                  value={editFormData.course_name}
                  onChange={(e) => setEditFormData({ ...editFormData, course_name: e.target.value })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Semester / Year</Label>
                <Input
                  value={editFormData.current_semester_year}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, current_semester_year: e.target.value })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Specialization</Label>
              <Input
                value={editFormData.specialization}
                onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">University / College</Label>
              <Input
                value={editFormData.university_college}
                onChange={(e) => setEditFormData({ ...editFormData, university_college: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={editSaving} className="bg-[#1E40AF] text-white">
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Status Dialog */}
      <Dialog open={!!statusAction} onOpenChange={(open) => !open && setStatusAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Status: {statusAction?.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to change the status of <strong>{u.full_name}</strong> to {statusAction}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setStatusAction(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmStatus} disabled={statusLoading} className="bg-[#1E40AF] text-white">
              {statusLoading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Role Dialog */}
      <Dialog open={!!roleAction} onOpenChange={(open) => !open && setRoleAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Role: {roleAction?.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to assign the role <strong>{roleAction}</strong> to {u.full_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setRoleAction(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmRole} disabled={roleLoading} className="bg-[#1E40AF] text-white">
              {roleLoading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#DC2626]">Permanent Deletion</DialogTitle>
            <DialogDescription className="text-xs">
              Are you completely sure? This will irrevocably delete <strong>{u.full_name}</strong> and all associated academic records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDeleteUser} disabled={deleteLoading} className="bg-[#DC2626] text-white">
              {deleteLoading ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
