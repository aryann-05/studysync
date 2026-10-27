"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
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

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();

  // State for user list & filters
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals state
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    daily_max_hours: 4,
    account_type: "student" as "student" | "regular",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
        status: statusFilter !== "all" ? statusFilter : undefined,
        account_type: typeFilter !== "all" ? typeFilter : undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.total_pages);
        setTotalUsers(res.data.pagination.total_users);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // View user details
  const handleViewDetails = async (userId: string) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res = await getUserById(userId);
      if (res.success && res.data) {
        setSelectedUserDetail(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch user details.");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      daily_max_hours: user.daily_max_hours || 4,
      account_type: user.account_type || "student",
    });
    setEditError(null);
  };

  // Save Edit User
  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await updateUser(editingUser.user_id, editFormData);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === editingUser.user_id ? res.data : u))
        );
        setEditingUser(null);
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update user.");
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle user active / inactive status
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      const res = await updateUserStatus(user.user_id, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === user.user_id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update account status.");
    }
  };

  // Confirm delete user
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
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registered accounts ({totalUsers} total) across students and regular learners.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers()}
          disabled={loading}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Filter by Account Type */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by Account Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Account Types</option>
                <option value="student">Students</option>
                <option value="regular">Regular Users</option>
              </select>

              {/* Filter by Status */}
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" label="Loading users..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-destructive">
              {error}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              No registered users matched the search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="py-3.5 pl-4 sm:pl-6">Name / Email</th>
                    <th className="py-3.5 px-3">Role</th>
                    <th className="py-3.5 px-3">Classification</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Registered</th>
                    <th className="py-3.5 pr-4 sm:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => {
                    const isSelf = currentAdmin?.id === u.user_id || currentAdmin?.email === u.email;
                    return (
                      <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3.5 pl-4 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground leading-snug flex items-center gap-1.5">
                                {u.full_name}
                                {isSelf && (
                                  <span className="text-[10px] text-primary font-normal bg-primary/10 px-1 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={u.role === "admin" ? "default" : "outline"}
                            className="capitalize text-xs font-normal"
                          >
                            {u.role === "admin" ? "Admin" : "User"}
                          </Badge>
                        </td>

                        {/* Account Classification */}
                        <td className="py-3.5 px-3">
                          <Badge
                            variant="secondary"
                            className={
                              u.account_type === "student"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize text-xs"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 capitalize text-xs"
                            }
                          >
                            {u.account_type === "student" ? (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                Student
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Regular
                              </span>
                            )}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                u.status === "active" ? "bg-emerald-500" : "bg-destructive"
                              }`}
                            />
                            {u.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-3 text-xs text-muted-foreground">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions Dropdown */}
                        <td className="py-3.5 pr-4 sm:pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Open user actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(u.user_id)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(u)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Info
                              </DropdownMenuItem>

                              {!isSelf && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(u)}
                                    className="cursor-pointer"
                                  >
                                    {u.status === "active" ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                        Activate User
                                      </>
                                    )}
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => setDeletingUser(u)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
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
          )}
        </CardContent>
      </Card>

      {/* 1. View User Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile & Activity</DialogTitle>
            <DialogDescription>
              Registered user metadata and learning statistics.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : selectedUserDetail ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 border-b pb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getInitials(selectedUserDetail.user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-base leading-tight">
                    {selectedUserDetail.user.full_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{selectedUserDetail.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground block mb-0.5">Role</span>
                  <span className="font-semibold capitalize text-foreground">
                    {selectedUserDetail.user.role}
                  </span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground block mb-0.5">Classification</span>
                  <span className="font-semibold capitalize text-foreground">
                    {selectedUserDetail.user.account_type || "student"}
                  </span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground block mb-0.5">Account Status</span>
                  <span
                    className={`font-semibold capitalize ${
                      selectedUserDetail.user.status === "active"
                        ? "text-emerald-600"
                        : "text-destructive"
                    }`}
                  >
                    {selectedUserDetail.user.status}
                  </span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground block mb-0.5">Daily Max Hours</span>
                  <span className="font-semibold text-foreground">
                    {selectedUserDetail.user.daily_max_hours ?? 4.0} hrs/day
                  </span>
                </div>
              </div>

              {/* Study Stats */}
              <div className="rounded-lg border p-3 bg-card">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Academic & Learning Metrics
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-muted/30 p-2">
                    <span className="text-lg font-bold block text-primary">
                      {selectedUserDetail.stats.study_plans_count}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Study Plans</span>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <span className="text-lg font-bold block text-blue-600">
                      {selectedUserDetail.stats.study_sessions_count}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Sessions</span>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <span className="text-lg font-bold block text-emerald-600">
                      {selectedUserDetail.stats.quizzes_attempted_count}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Quizzes</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                User ID: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{selectedUserDetail.user.user_id}</code>
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>
              Update permitted user profile attributes.
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {editError}
            </div>
          )}

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs">Full Name</Label>
              <Input
                id="edit-name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-type" className="text-xs">Account Classification</Label>
                <select
                  id="edit-type"
                  value={editFormData.account_type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      account_type: e.target.value as "student" | "regular",
                    })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="student">Student</option>
                  <option value="regular">Regular User</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-hours" className="text-xs">Daily Max Hours (0.5 - 24)</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={editFormData.daily_max_hours}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, daily_max_hours: parseFloat(e.target.value) || 4 })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Confirm Delete Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user{" "}
              <strong className="text-foreground">{deletingUser?.full_name}</strong> (
              {deletingUser?.email})?
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            This action is permanent and will cascade-delete all study plans, topics, learning
            sessions, and quiz attempts associated with this user.
          </p>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingUser(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

