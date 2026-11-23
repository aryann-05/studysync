"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  FileUp,
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getCategories, getCategoryUsers } from "@/services/admin";
import type { AcademicCategoryItem, CategoriesAnalyticsResponse, CategoryUsersResponse, AdminUser } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function AcademicCategoriesPage() {
  const [data, setData] = useState<CategoriesAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Category Detail state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryUsers, setCategoryUsers] = useState<AdminUser[]>([]);
  const [categoryUsersLoading, setCategoryUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const fetchCategories = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getCategories();
      if (res.success && res.data) {
        setData(res.data);
        if (!selectedCategory && res.data.categories.length > 0) {
          setSelectedCategory(res.data.categories[0].category_name);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load academic categories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch users when a category is selected
  useEffect(() => {
    if (!selectedCategory) return;
    let isCancelled = false;

    const fetchUsers = async () => {
      setCategoryUsersLoading(true);
      try {
        const res = await getCategoryUsers(selectedCategory);
        if (!isCancelled && res.success && res.data) {
          setCategoryUsers(res.data.users);
        }
      } catch (e) {
        // Fallback
      } finally {
        if (!isCancelled) setCategoryUsersLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Analyzing academic categories & enrollment breakdown..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-6 text-center">
        <p className="text-sm font-semibold text-[#DC2626]">{error || "Failed to load categories."}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCategories()}
          className="mt-4 border-[#DC2626]/30 text-[#DC2626] hover:bg-[#FEE2E2]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Analysis
        </Button>
      </div>
    );
  }

  const filteredCategoryUsers = categoryUsers.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.specialization || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Academic Categories & Specializations
            </h1>
            <Badge className="bg-[#1E40AF] text-white">
              {data.categories.length} Categories
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Data-driven segmentation based on verified student courses, specializations, upload volume, and test performance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCategories(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Analytics
        </Button>
      </div>

      {/* Category Comparison Chart */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#334155]">
                Cross-Category Comparison Analysis
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Registered students vs test attempts vs average test scores across academic branches.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
              Verified Academic Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparison} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="users" name="Total Students" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tests" name="Tests Attempted" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_score" name="Avg Score (%)" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#334155] mb-4">
          All Academic Categories ({data.categories.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.categories.map((cat) => {
            const isSelected = selectedCategory === cat.category_name;
            return (
              <div
                key={cat.category_name}
                onClick={() => setSelectedCategory(cat.category_name)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 text-xs ${
                  isSelected
                    ? "border-[#1E40AF] bg-[#EFF4FF]/60 shadow-md ring-2 ring-[#1E40AF]/20"
                    : "border-[#E2E8F0] bg-card hover:border-[#1E40AF]/40 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-[#334155] line-clamp-1">{cat.category_name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                      <span>{cat.total_users} {cat.total_users === 1 ? "User" : "Users"}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{cat.active_users} Active</span>
                    </div>
                  </div>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isSelected ? "bg-[#1E40AF] text-white" : "bg-[#EFF4FF] text-[#1E40AF]"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                  <div>
                    <p className="font-extrabold text-[#334155]">{cat.total_uploads}</p>
                    <p className="text-[10px] text-[#64748B] uppercase">Uploads</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-[#1E40AF]">{cat.total_tests_attempted}</p>
                    <p className="text-[10px] text-[#64748B] uppercase">Tests</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-emerald-600">{cat.average_test_score}%</p>
                    <p className="text-[10px] text-[#64748B] uppercase">Avg Score</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#1E40AF] pt-1">
                  <span>{isSelected ? "Currently Viewing" : "Click to View Users"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Category Drill-Down: Users in this Category */}
      {selectedCategory && (
        <Card className="border-[#1E40AF]/30 shadow-md">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-[#1E40AF]">
                  Students Enrolled in {selectedCategory}
                </CardTitle>
                <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
                  {filteredCategoryUsers.length} students
                </Badge>
              </div>
              <CardDescription className="text-xs text-[#64748B]">
                Direct drill-down into all registered accounts belonging to this academic stream.
              </CardDescription>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter students in category..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {categoryUsersLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner size="sm" label="Fetching category students..." />
              </div>
            ) : filteredCategoryUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No students match your filter in this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Degree & Semester</th>
                      <th className="py-2.5 px-4">Institution</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Last Active</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredCategoryUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-[#EFF4FF]/20 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 ring-1 ring-[#1E40AF]/20">
                              <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-[10px] font-bold">
                                {getInitials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-[#334155]">{u.full_name}</p>
                              <p className="text-[11px] text-[#64748B]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[#334155]">
                          <span className="font-medium">{u.course_name || "B.Tech"}</span>
                          <span className="text-[10px] text-[#64748B] block">
                            {u.current_semester_year || "Semester 4"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[#334155]">
                          {u.university_college || "Technical University"}
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge
                            className={
                              u.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B]">
                          {u.last_active_at
                            ? new Date(u.last_active_at).toLocaleDateString()
                            : new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                            <Link href={`/admin/users/${u.user_id}`}>
                              Inspect Profile
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

