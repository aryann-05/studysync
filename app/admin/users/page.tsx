"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  UserCheck,
  RefreshCw,
  Phone,
  BookOpen,
  Building,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "@/services/admin";
import type { AdminUser, AdminUserDetailResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

const ACADEMIC_CATEGORIES = [
  "all",
  "Computer Science",
  "Artificial Intelligence & Machine Learning",
  "Data Science",
  "Information Technology",
  "Software Engineering",
  "Cyber Security",
  "Cloud Computing",
  "MCA",
  "BCA",
  "B.Tech",
];

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();

  // State for user list & filters
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Quick Edit Modal
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
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
    account_type: "student" as "student" | "regular",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status Change Dialog
  const [statusTargetUser, setStatusTargetUser] = useState<AdminUser | null>(null);
  const [statusAction, setStatusAction] = useState<"active" | "inactive" | "suspended">("active");
  const [statusLoading, setStatusLoading] = useState(false);

  // Role Change Dialog
  const [roleTargetUser, setRoleTargetUser] = useState<AdminUser | null>(null);
  const [roleAction, setRoleAction] = useState<"super_admin" | "admin" | "moderator" | "user">("user");
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete User Dialog
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users list from backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        account_type: typeFilter !== "all" ? typeFilter : undefined,
        specialization: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.total_pages);
        setTotalUsers(res.data.pagination.total_users);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Edit User
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      academic_qualification: user.academic_qualification || "Undergraduate",
      university_college: user.university_college || "",
      course_name: user.course_name || "Computer Science",
      specialization: user.specialization || "Computer Science & Engineering",
      current_semester_year: user.current_semester_year || "Semester 4",
      daily_max_hours: user.daily_max_hours || 4,
      account_type: user.account_type || "student",
    });
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditSaving(true);
    setEditError(null);

    try {
      const res = await updateUser(editingUser.user_id, editFormData);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === editingUser.user_id ? { ...u, ...res.data } : u))
        );
        setEditingUser(null);
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to save user updates.");
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Status Update
  const handleConfirmStatus = async () => {
    if (!statusTargetUser) return;
    setStatusLoading(true);
    try {
      const res = await updateUserStatus(statusTargetUser.user_id, statusAction);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === statusTargetUser.user_id ? { ...u, status: statusAction } : u))
        );
        setStatusTargetUser(null);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update account status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Role Change
  const handleConfirmRole = async () => {
    if (!roleTargetUser) return;
    setRoleLoading(true);
    try {
      const res = await updateUserRole(roleTargetUser.user_id, roleAction);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === roleTargetUser.user_id ? { ...u, role: roleAction } : u))
        );
        setRoleTargetUser(null);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to change user role.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      const res = await deleteUser(deletingUser.user_id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== deletingUser.user_id));
        setTotalUsers((prev) => Math.max(0, prev - 1));
        setDeletingUser(null);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              User Directory & Academic Management
            </h1>
            <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
              {totalUsers} {totalUsers === 1 ? "User" : "Users"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Comprehensive control over registered students, academic qualifications, study categories, and access permissions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers()}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh Directory
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID, university..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                aria-label="Filter by administrative role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">Student User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                aria-label="Filter by account status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Inactive Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>

            {/* Category / Specialization Filter */}
            <div>
              <select
                aria-label="Filter by academic category or specialization"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {ACADEMIC_CATEGORIES.filter((c) => c !== "all").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" label="Loading student directory..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-[#DC2626]">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={fetchUsers} className="mt-3">
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-medium">No users match your filter criteria.</p>
              <p className="text-xs text-muted-foreground mt-1">Try resetting your search query or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4">User / Contact</th>
                    <th className="py-3 px-4">Academic Profile</th>
                    <th className="py-3 px-4">Institution</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {users.map((u) => {
                    const isSelf = currentAdmin?.id === u.user_id || currentAdmin?.email === u.email;
                    return (
                      <tr key={u.user_id} className="hover:bg-[#EFF4FF]/30 transition-colors">
                        {/* Name & Contact */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-1 ring-[#1E40AF]/20">
                              <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-xs font-bold">
                                {getInitials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/users/${u.user_id}`}
                                className="font-semibold text-[#1E40AF] hover:underline"
                              >
                                {u.full_name}
                              </Link>
                              <p className="text-[11px] text-[#64748B] truncate">{u.email}</p>
                              {u.phone && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Phone className="h-2.5 w-2.5" />
                                  {u.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Academic Profile */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#334155]">
                            {u.specialization || u.course_name || "Computer Science"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mt-0.5">
                            <span>{u.course_name || "B.Tech"}</span>
                            <span>•</span>
                            <span>{u.current_semester_year || "Semester 4"}</span>
                          </div>
                        </td>

                        {/* Institution */}
                        <td className="py-3 px-4 text-[#334155]">
                          <span className="font-medium truncate max-w-[160px] block">
                            {u.university_college || "Technical University"}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            {u.academic_qualification || "Undergraduate"}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              u.role === "super_admin"
                                ? "bg-[#DC2626] text-white border-[#DC2626] font-bold uppercase text-[10px]"
                                : u.role === "admin"
                                ? "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20 font-bold uppercase text-[10px]"
                                : u.role === "moderator"
                                ? "bg-amber-100 text-amber-900 border-amber-300 font-bold uppercase text-[10px]"
                                : "bg-[#EFF4FF] text-[#1E40AF] border-[#1E40AF]/20 uppercase text-[10px]"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
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
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4 text-[#64748B]">
                          {u.last_active_at
                            ? new Date(u.last_active_at).toLocaleDateString()
                            : new Date(u.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                              <Link href={`/admin/users/${u.user_id}`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Dossier
                              </Link>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs w-44">
                                <DropdownMenuItem onClick={() => openEditModal(u)}>
                                  <Edit className="mr-2 h-3.5 w-3.5 text-[#1E40AF]" />
                                  Edit Information
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setStatusTargetUser(u);
                                    setStatusAction(u.status === "active" ? "inactive" : "active");
                                  }}
                                  disabled={isSelf}
                                >
                                  {u.status === "active" ? (
                                    <>
                                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-600" />
                                      Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                                      Activate User
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setStatusTargetUser(u);
                                    setStatusAction(u.status === "suspended" ? "active" : "suspended");
                                  }}
                                  disabled={isSelf}
                                  className="text-[#DC2626]"
                                >
                                  <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                                  {u.status === "suspended" ? "Lift Suspension" : "Suspend Account"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setRoleTargetUser(u);
                                    setRoleAction(u.role === "admin" ? "user" : "admin");
                                  }}
                                  disabled={isSelf}
                                >
                                  <Shield className="mr-2 h-3.5 w-3.5 text-[#1E40AF]" />
                                  Change Role ({u.role})
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => setDeletingUser(u)}
                                  disabled={isSelf}
                                  className="text-[#DC2626] focus:text-[#DC2626]"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalUsers} total registered)
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="h-8 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="h-8 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1E40AF]">Edit User Academic Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update credentials and verified educational details for this account.
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="rounded-lg bg-[#FEE2E2] p-2.5 text-xs text-[#DC2626] border border-[#DC2626]/20">
              {editError}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
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
                <Label className="text-xs">Phone Number</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91..."
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={editSaving}
                className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white text-xs"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Status Dialog */}
      <Dialog open={!!statusTargetUser} onOpenChange={(open) => !open && setStatusTargetUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Confirm Status Change: {statusAction.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to change account status for{" "}
              <strong>{statusTargetUser?.full_name}</strong> to{" "}
              <Badge className="ml-1 uppercase text-[10px]">{statusAction}</Badge>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusTargetUser(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmStatus}
              disabled={statusLoading}
              className={
                statusAction === "suspended"
                  ? "bg-[#DC2626] hover:bg-[#DC2626]/90 text-white text-xs"
                  : "bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white text-xs"
              }
            >
              {statusLoading ? "Updating..." : "Confirm Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={!!roleTargetUser} onOpenChange={(open) => !open && setRoleTargetUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Update Administrative Role</DialogTitle>
            <DialogDescription className="text-xs">
              Assign role privileges for <strong>{roleTargetUser?.full_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="text-xs">Selected Role</Label>
            <select
              aria-label="Select administrative role"
              value={roleAction}
              onChange={(e) => setRoleAction(e.target.value as any)}
              className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="user">User (Student Access)</option>
              <option value="moderator">Moderator (Uploads & Read Analytics)</option>
              <option value="admin">Admin (Full Administrative Access)</option>
              <option value="super_admin">Super Admin (System Governance)</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleTargetUser(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRole}
              disabled={roleLoading}
              className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white text-xs"
            >
              {roleLoading ? "Assigning..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#DC2626]">
              Permanent Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>{deletingUser?.full_name}</strong> ({deletingUser?.email})?
              All associated study plans, sessions, uploads, and quiz records will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingUser(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white text-xs"
            >
              {deleteLoading ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
