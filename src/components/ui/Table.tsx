import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("w-full border border-border rounded-md overflow-hidden", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <thead className={cn("bg-muted border-b border-border", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn("bg-card", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className }: TableProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-sm font-semibold text-muted-foreground text-left",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableProps) {
  return (
    <td className={cn("px-4 py-4 text-sm text-foreground", className)}>
      {children}
    </td>
  );
}
