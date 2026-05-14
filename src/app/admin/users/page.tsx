"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Icon from "@/components/ui/Icon";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.nickname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getReputationBadge = (rep: number): "error" | "warning" | "success" => {
    if (rep < 30) return "error";
    if (rep < 50) return "warning";
    return "success";
  };

  return (
    <div>
      <PageHeader
        title={t("users")}
        description="View and manage all registered users"
      />

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tCommon("search")}
              leftIcon={<Icon name="search" size={16} />}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Reputation</TableHeaderCell>
                <TableHeaderCell>Points</TableHeaderCell>
                <TableHeaderCell className="hidden sm:table-cell">Uploads / Borrows</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found
                  </td>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                        <Avatar
                          src={user.avatar_url || undefined}
                          name={user.nickname}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {user.nickname}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getReputationBadge(user.reputation)} size="sm">
                        {user.reputation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{user.points_balance}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        <span className="text-chart-1 font-medium">{user.total_uploads}</span>
                        <span className="mx-1">/</span>
                        <span className="text-chart-2 font-medium">{user.total_borrows}</span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.reputation < 30 ? (
                        <Badge variant="error" size="sm">Restricted</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
