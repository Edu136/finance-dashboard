import { Mail, Hash, Calendar, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { Profile } from "@/types/domain";

type Props = {
  profile: Profile;
  transactionCount: number;
};

export function AccountInfo({ profile, transactionCount }: Props) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Item
        icon={<Mail className="h-4 w-4" />}
        label="Email"
        value={profile.email}
      />
      <Item
        icon={<Shield className="h-4 w-4" />}
        label="Login via"
        value={
          <Badge variant="outline" className="capitalize">
            {profile.provider}
          </Badge>
        }
      />
      <Item
        icon={<Hash className="h-4 w-4" />}
        label="Total de transações"
        value={transactionCount.toString()}
      />
      <Item
        icon={<Calendar className="h-4 w-4" />}
        label="Conta criada em"
        value={formatDate(profile.created_at)}
      />
    </dl>
  );
}

function Item({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-card p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
