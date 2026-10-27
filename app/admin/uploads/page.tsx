"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  FileUp,
  User,
  Mail,
  Calendar,
  HardDrive,
  Users,
  FileCheck2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import {
  getAdminUploads,
  deleteAdminUpload,
} from "@/services/admin";
import type { AdminUploadItem, AdminUploadsStats } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getInitials } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<AdminUploadItem[]>([]);
  const [stats, setStats] = useState<AdminUploadsStats>({
    total_uploads: 0,
    total_size_bytes: 0,
    pdf_count: 0,
    docx_txt_count: 0,
    unique_users_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUploads, setTotalUploads] = useState(0);

  // Modal inspection states
  const [selectedUpload, setSelectedUpload] = useState<AdminUploadItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Deletion modal state
  const [deletingUpload, setDeletingUpload] = useState<AdminUploadItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUploads({
        page,
        limit: 10,
        search: search.trim() || undefined,
        file_type: formatFilter !== "all" ? formatFilter : undefined,
      });

      if (res.success && res.data) {
        setUploads(res.data.uploads || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.total_pages);
          setTotalUploads(res.data.pagination.total_uploads);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploaded files");
    } finally {
      setLoading(false);
    }
  }, [page, search, formatFilter]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUploads();
  };

  const handleClearFilters = () => {
    setSearch("");
    setFormatFilter("all");
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUpload) return;
    setDeleteLoading(true);
    try {
      await deleteAdminUpload(deletingUpload.upload_id);
      setDeletingUpload(null);
      await fetchUploads();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete file upload");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getFormatBadge = (docType: string, fileName: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (docType === "pdf" || ext === "pdf") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          PDF
        </span>
      );
    }
    if (docType === "docx" || ext === "docx" || ext === "doc") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          DOCX
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        TXT
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Student & User Uploads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Display and audit all syllabus files, PDFs, and learning documents uploaded by users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUploads()}
          disabled={loading}
          className="gap-2 shrink-0"
        >
          <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Uploads
              </p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {stats.total_uploads}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Across all registered accounts
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Uploading Students
              </p>
              <h3 className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.unique_users_count}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Unique active uploaders
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                PDF Syllabi
              </p>
              <h3 className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.pdf_count}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Primary course document format
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <FileCheck2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Storage Utilized
              </p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatBytes(stats.total_size_bytes)}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Disk allocation for user uploads
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by file name, student name, email, or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Document Format Filter */}
            <div className="w-full md:w-48">
              <Select
                value={formatFilter}
                onValueChange={(val) => {
                  setFormatFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Format: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="pdf">PDF Documents</SelectItem>
                  <SelectItem value="docx">Word (.docx)</SelectItem>
                  <SelectItem value="txt">Text (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default" size="default" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              {(search || formatFilter !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchUploads()}>
            Retry
          </Button>
        </div>
      )}

      {/* Uploads Data Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Uploaded Files Registry
              </CardTitle>
              <CardDescription className="text-xs">
                Showing {uploads.length} of {totalUploads} registered files
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Auditing
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size="lg" label="Loading uploaded documents..." />
            </div>
          ) : uploads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3 text-muted-foreground">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No uploads found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                No syllabus documents match your search criteria. Try modifying your search or clearing filters.
              </p>
              {(search || formatFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Document Details</th>
                    <th scope="col" className="px-6 py-3.5">Uploaded By (User Details)</th>
                    <th scope="col" className="px-6 py-3.5">Format</th>
                    <th scope="col" className="px-6 py-3.5">File Size</th>
                    <th scope="col" className="px-6 py-3.5">Date Uploaded</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {uploads.map((upload) => {
                    const u = upload.user || {
                      user_id: "unknown",
                      full_name: "Student User",
                      email: "unknown@example.com",
                      role: "user",
                      account_type: "student",
                      status: "active",
                    };

                    return (
                      <tr
                        key={upload.upload_id}
                        className="transition-colors hover:bg-muted/30 group"
                      >
                        {/* File Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 max-w-[220px] sm:max-w-[280px]">
                              <p className="font-semibold text-foreground truncate" title={upload.original_name}>
                                {upload.original_name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                                ID: {upload.upload_id}
                              </p>
                              {upload.extracted_topics_count ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium mt-1">
                                  <Sparkles className="h-3 w-3" />
                                  {upload.extracted_topics_count} extracted topics
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* User Details (Core User Request) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(u.full_name || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground leading-tight">
                                  {u.full_name}
                                </p>
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full shrink-0",
                                    u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                  )}
                                  title={`Status: ${u.status}`}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {u.email}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 capitalize"
                                >
                                  {u.account_type || "student"}
                                </Badge>
                                {u.role === "admin" && (
                                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Document Format */}
                        <td className="px-6 py-4">
                          {getFormatBadge(upload.document_type, upload.original_name)}
                        </td>

                        {/* File Size */}
                        <td className="px-6 py-4 font-mono text-xs text-foreground">
                          {formatBytes(upload.size)}
                        </td>

                        {/* Date Uploaded */}
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(upload.uploaded_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUpload(upload);
                                setIsDetailOpen(true);
                              }}
                              className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                              title="View Full User Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">User Details</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUpload(upload)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              title="Delete Upload"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || loading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || loading}
                  className="gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* USER DETAILS INSPECTION MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Uploader Information
            </DialogTitle>
            <DialogDescription>
              Detailed account and profile data for the student who uploaded this document
            </DialogDescription>
          </DialogHeader>

          {selectedUpload && (
            <div className="space-y-5 py-2">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                    {getInitials(selectedUpload.user?.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground truncate">
                    {selectedUpload.user?.full_name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedUpload.user?.email || "No email"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedUpload.user?.account_type || "student"}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-xs",
                        selectedUpload.user?.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      )}
                    >
                      {selectedUpload.user?.status === "active" ? "Active Account" : "Inactive Account"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Upload Context Details */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">File Name:</span>
                    <p className="font-semibold text-foreground mt-0.5 break-all">
                      {selectedUpload.original_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <p className="font-semibold text-foreground mt-0.5 font-mono">
                      {formatBytes(selectedUpload.size)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Format:</span>
                    <p className="font-semibold text-foreground mt-0.5 uppercase">
                      {selectedUpload.document_type}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded At:</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatDate(selectedUpload.uploaded_at)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">User ID:</span>
                    <p className="font-mono text-[11px] text-foreground bg-muted p-1.5 rounded mt-1 select-all break-all">
                      {selectedUpload.user?.user_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shortcuts */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/admin/users?search=${encodeURIComponent(selectedUpload.user?.email || "")}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Manage User in Users Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={!!deletingUpload} onOpenChange={(open) => !open && setDeletingUpload(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Document Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this uploaded document?
            </DialogDescription>
          </DialogHeader>

          {deletingUpload && (
            <div className="my-2 p-3 rounded-lg bg-muted text-sm space-y-1">
              <p className="font-semibold text-foreground break-all">
                {deletingUpload.original_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded by: {deletingUpload.user?.full_name} ({deletingUpload.user?.email})
              </p>
              <p className="text-xs text-muted-foreground">
                Size: {formatBytes(deletingUpload.size)} &bull; Uploaded: {formatDate(deletingUpload.uploaded_at)}
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            This action permanently removes the stored syllabus document and its indexing from the system.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingUpload(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="gap-2"
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Permanently Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

