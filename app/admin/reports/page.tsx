"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

interface ReportUser {
  id: string;
  email: string;
  profile: { name: string | null; birthDate: string | null } | null;
}

interface Report {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  resolved: boolean;
  reporter: Omit<ReportUser, "id"> & { profile: ReportUser["profile"] };
  reported: ReportUser;
}

const REASON_LABELS: Record<string, string> = {
  spam: "Spam / Scam",
  harassment: "Harassment",
  fake_profile: "Fake Profile",
  inappropriate_content: "Inappropriate Content",
  underage: "Appears Underage",
  other: "Other",
};

const REASON_COLORS: Record<string, string> = {
  spam: "bg-yellow-100 text-yellow-800",
  harassment: "bg-red-100 text-red-800",
  fake_profile: "bg-orange-100 text-orange-800",
  inappropriate_content: "bg-purple-100 text-purple-800",
  underage: "bg-rose-100 text-rose-800",
  other: "bg-stone-100 text-stone-700",
};

type Filter = "all" | "open" | "resolved";

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("open");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userEmail = (session?.user as { email?: string })?.email;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "hello.kindredstars@gmail.com";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && userEmail?.toLowerCase() !== adminEmail) {
      router.replace("/discover");
    }
  }, [status, userEmail, router]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReports(data.reports);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && userEmail?.toLowerCase() === adminEmail) {
      fetchReports();
    }
  }, [status, userEmail, fetchReports]);

  const toggleResolved = async (report: Report) => {
    setTogglingId(report.id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, resolved: !report.resolved }),
      });
      if (!res.ok) throw new Error("Failed");
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, resolved: !r.resolved } : r))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Delete this report permanently?")) return;
    setDeletingId(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) throw new Error("Failed");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && userEmail?.toLowerCase() !== adminEmail)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = reports.filter((r) => {
    if (filter === "open") return !r.resolved;
    if (filter === "resolved") return r.resolved;
    return true;
  });

  const openCount = reports.filter((r) => !r.resolved).length;
  const resolvedCount = reports.filter((r) => r.resolved).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <div>
              <h1 className="text-lg font-semibold text-stone-900 leading-none">Reports</h1>
              <p className="text-xs text-stone-500 mt-0.5">Kindred Stars Admin</p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{reports.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">Total Reports</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{openCount}</p>
            <p className="text-xs text-stone-500 mt-0.5">Open</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
            <p className="text-xs text-stone-500 mt-0.5">Resolved</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-5 bg-stone-100 p-1 rounded-lg w-fit">
          {(["open", "all", "resolved"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {f}
              {f === "open" && openCount > 0 && (
                <span className="ml-1.5 bg-red-100 text-red-600 text-xs rounded-full px-1.5 py-0.5">
                  {openCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-10 w-10 text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm">
              {filter === "open" ? "No open reports — all clear ✓" : "Nothing here yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border transition-all ${
                  report.resolved
                    ? "border-stone-200 opacity-60"
                    : "border-stone-200 shadow-sm"
                }`}
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          REASON_COLORS[report.reason] ?? REASON_COLORS.other
                        }`}
                      >
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                      {report.resolved ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Open
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-stone-400 text-xs whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Users */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                        Reported
                      </p>
                      <p className="font-semibold text-stone-900 text-sm">
                        {report.reported.profile?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-stone-500">{report.reported.email}</p>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">
                        {report.reported.id}
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                        Reported By
                      </p>
                      <p className="font-semibold text-stone-900 text-sm">
                        {report.reporter.profile?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-stone-500">{report.reporter.email}</p>
                    </div>
                  </div>

                  {/* Details */}
                  {report.details && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                        Details
                      </p>
                      <p className="text-sm text-stone-700">{report.details}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleResolved(report)}
                      disabled={togglingId === report.id}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                        report.resolved
                          ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {togglingId === report.id
                        ? "Saving…"
                        : report.resolved
                        ? "Mark Open"
                        : "Mark Resolved"}
                    </button>

                    <a
                      href={`mailto:${report.reported.email}?subject=Your Kindred Stars account&body=Hi ${report.reported.profile?.name ?? "there"},`}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Email User
                    </a>

                    <button
                      onClick={() => deleteReport(report.id)}
                      disabled={deletingId === report.id}
                      className="ml-auto flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === report.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
