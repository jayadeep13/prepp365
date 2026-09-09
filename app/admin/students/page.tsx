"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

type StudentRow = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  purchasedCourses: string[];
  createdAt: string;
};

export default function AdminStudentsPage() {
  const [users, setUsers] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Students</h1>
      <p className="mt-1 text-sm text-white/50">
        {users.length} {users.length === 1 ? "student has" : "students have"} created an account.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3.5 font-semibold">Name</th>
              <th className="px-5 py-3.5 font-semibold">Email</th>
              <th className="px-5 py-3.5 font-semibold">Phone</th>
              <th className="px-5 py-3.5 font-semibold">Address</th>
              <th className="px-5 py-3.5 font-semibold">Courses</th>
              <th className="px-5 py-3.5 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u._id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5 font-medium text-white/90">{u.name}</td>
                <td className="px-5 py-3.5 text-white/60 text-xs">{u.email ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/60 text-xs">{u.phone ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/40 text-xs max-w-xs truncate">{u.address ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/60 font-mono text-xs">{u.purchasedCourses?.length ?? 0}</td>
                <td className="px-5 py-3.5 text-white/40 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {loadError && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-sm text-red-300">Couldn't load students. Check your connection and try again.</p>
                  <button onClick={() => window.location.reload()} className="mt-3 text-sm font-semibold text-purple-400">
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {!loading && !loadError && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Users className="mx-auto text-white/20" size={28} />
                  <p className="mt-3 text-sm text-white/40">No students yet.</p>
                  <p className="mt-1 text-xs text-white/25">Anyone who registers on the site will show up here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
