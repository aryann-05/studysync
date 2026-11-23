"use client";

import { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  Download,
  Database,
  Users,
  Award,
  BookOpen,
  Activity,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const REPORT_DATASETS = [
  {
    id: "users",
    title: "Registered Users Directory",
    desc: "Complete dossier with academic credentials, specializations, phone numbers, and account statuses.",
    icon: Users,
  },
  {
    id: "categories",
    title: "Academic Categories & Breakdown",
    desc: "Enrolled student counts, active vs inactive ratio, upload metrics, and test performance per category.",
    icon: BookOpen,
  },
  {
    id: "tests",
    title: "Test Management & Examination Results",
    desc: "Assessment attempts, scores, percentage, pass/fail status, and completion timestamps.",
    icon: Award,
  },
  {
    id: "uploads",
    title: "User Uploads & Study Materials",
    desc: "Syllabus documents, PDFs, size in bytes, moderation status, and uploader identities.",
    icon: Layers,
  },
];

export default function ReportsExportPage() {
  const [selectedDataset, setSelectedDataset] = useState("users");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [lastExport, setLastExport] = useState<{ filename: string; timestamp: string } | null>(null);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const query = new URLSearchParams();
      query.set("report_type", selectedDataset);
      query.set("format", exportFormat);
      if (startDate) query.set("start_date", startDate);
      if (endDate) query.set("end_date", endDate);
      if (categoryFilter !== "all") query.set("category", categoryFilter);

      // Trigger export endpoint
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await fetch(`/api/v1/admin/reports/export?${query.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate export file.");
      }

      const blob = await response.blob();
      const filename =
        response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
        `studysync_${selectedDataset}.${exportFormat}`;

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLastExport({
        filename,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      alert(err?.message || "Export generation failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
            Reports & Comprehensive Data Export
          </h1>
          <Badge className="bg-[#1E40AF] text-white">CSV & JSON Engine</Badge>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          Generate exportable reports across user profiles, academic categories, examination attempts, and study content.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Dataset Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">
                1. Select Report Dataset
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Choose the system domain and records you wish to compile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {REPORT_DATASETS.map((ds) => {
                  const Icon = ds.icon;
                  const isSelected = selectedDataset === ds.id;
                  return (
                    <div
                      key={ds.id}
                      onClick={() => setSelectedDataset(ds.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all text-xs ${
                        isSelected
                          ? "border-[#1E40AF] bg-[#EFF4FF]/60 shadow-sm ring-2 ring-[#1E40AF]/20"
                          : "border-[#E2E8F0] bg-card hover:border-[#1E40AF]/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected ? "bg-[#1E40AF] text-white" : "bg-[#EFF4FF] text-[#1E40AF]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-sm text-[#334155]">{ds.title}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{ds.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Filters */}
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">
                2. Scope & Date Criteria (Optional)
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Filter records by creation date or academic category before compiling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Academic Category Filter</Label>
                <select
                  aria-label="Filter export by academic category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence & Machine Learning">AI & Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Export Generation Sidebar */}
        <div className="space-y-4">
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#334155]">
                3. File Format & Download
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Download compatible spreadsheets or raw JSON data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <Label className="text-xs">Format Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("csv")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 font-semibold transition-all ${
                      exportFormat === "csv"
                        ? "border-[#1E40AF] bg-[#EFF4FF] text-[#1E40AF]"
                        : "border-[#E2E8F0] hover:bg-muted"
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("json")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 font-semibold transition-all ${
                      exportFormat === "json"
                        ? "border-[#1E40AF] bg-[#EFF4FF] text-[#1E40AF]"
                        : "border-[#E2E8F0] hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    JSON Format
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-[#F8FAFC] border p-3 text-[11px] text-[#64748B] space-y-1">
                <p>
                  <strong>Target Dataset:</strong>{" "}
                  <span className="uppercase text-[#1E40AF] font-bold">{selectedDataset}</span>
                </p>
                <p>
                  <strong>Target Format:</strong>{" "}
                  <span className="uppercase text-[#334155] font-bold">{exportFormat}</span>
                </p>
                <p>
                  <strong>Privacy & Sanitization:</strong> Passwords and raw JWT tokens are automatically stripped.
                </p>
              </div>

              <Button
                onClick={handleExport}
                disabled={downloading}
                className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white font-semibold"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Compiling Export..." : "Generate & Download File"}
              </Button>

              {lastExport && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{lastExport.filename}</p>
                    <p className="text-[10px] text-emerald-700">Downloaded at {lastExport.timestamp}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

