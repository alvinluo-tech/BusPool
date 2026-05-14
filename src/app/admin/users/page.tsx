"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Icon from "@/components/ui/Icon";

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

  return (
    <div>
      <PageHeader title={t("users")} />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tCommon("search")}
        leftIcon={<Icon name="search" size={16} />}
        className="mb-4"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="block bg-card rounded-xl p-4 border border-border hover:shadow-level2 transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={user.avatar_url || undefined}
                  name={user.nickname}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{user.nickname}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{user.points_balance}</p>
                  <p className="text-xs text-muted-foreground">Rep: {user.reputation}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
