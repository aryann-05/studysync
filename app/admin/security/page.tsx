"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Lock,
  UserCheck,
  Check,
  X,
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { getAuditLogs } from "@/services/admin";
import type { AuditLogsResponse, AuditLogItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

const ROLE_PERMISSIONS = [
  {
    capability: "View Super Admin Dashboard & Global Analytics",
    super_admin: true,
    admin: true,
    moderator: true,
  },
  {
    capability: "Inspect Student Profiles & Academic Dossiers",
    super_admin: true,
    admin: true,
    moderator: true,
  },
  {
    capability: "Edit User Academic Info & Target Hours",
    super_admin: true,
    admin: true,
    moderator: false,
  },
  {
    capability: "Toggle User Status (Activate, Deactivate, Suspend)",
    super_admin: true,
    admin: true,
    moderator: false,
  },
  {
    capability: "Promote / Demote Roles (RBAC Management)",
    super_admin: true,
    admin: false,
    moderator: false,
  },
  {
    capability: "Permanently Delete Student Accounts & Records",
    super_admin: true,
    admin: true,
    moderator: false,
  },
  {
    capability: "Moderate, Approve, Flag & Remove Uploads",
    super_admin: true,
    admin: true,
    moderator: true,
  },
  {
    capability: "Generate & Download System Data Exports (CSV/JSON)",
    super_admin: true,
    admin: true,
    moderator: false,
  },
  {
    capability: "Inspect Administrative Security & Audit Logs",
    super_admin: true,
    admin: true,
    moderator: false,
  },
];

export default function SecurityAuditPage() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchAudit = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getAuditLogs(page, 20);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Security Governance & Administrative Audit Trail
            </h1>
            <Badge className="bg-[#1E40AF] text-white">RBAC Matrix</Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Role-Based Access Control specifications, credential protection checks, and immutable administrative audit logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAudit(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Audit Trail
        </Button>
      </div>

      {/* Role-Based Access Control Matrix */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#334155]">
                Role-Based Access Control (RBAC) Permissions Matrix
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Enforced by backend route guards and JSON Web Token role verification.
              </CardDescription>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
              <Lock className="h-3 w-3" />
              Token Encrypted
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">Administrative Capability</th>
                  <th className="py-3 px-4 text-center">Super Admin</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                  <th className="py-3 px-4 text-center">Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {ROLE_PERMISSIONS.map((perm, i) => (
                  <tr key={i} className="hover:bg-[#EFF4FF]/20 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-[#334155]">{perm.capability}</td>
                    <td className="py-2.5 px-4 text-center">
                      {perm.super_admin ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {perm.admin ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {perm.moderator ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#334155]">
                Administrative Action Audit Logs
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Immutable records of every user status change, role update, deletion, and file moderation.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
              {data?.pagination?.total ?? 0} Recorded Actions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner size="md" label="Loading security audit records..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-[#DC2626]">{error}</div>
          ) : !data || data.logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No administrative audit records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.logs.map((log) => (
                    <tr key={log.audit_id} className="hover:bg-[#EFF4FF]/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <Badge
                          variant="outline"
                          className="font-bold text-[10px] uppercase text-[#1E40AF] border-[#1E40AF]/30 bg-[#EFF4FF]"
                        >
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#334155]">
                        {log.admin_name}
                        {log.admin_email && (
                          <span className="block text-[10px] text-[#64748B] font-normal">
                            {log.admin_email}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#64748B]">
                        {log.target_resource} {log.target_id ? `(#${log.target_id.slice(0, 10)})` : ""}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#64748B]">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="py-2.5 px-4 text-[#64748B] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

