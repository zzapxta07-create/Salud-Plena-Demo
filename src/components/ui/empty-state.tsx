import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-12 px-6">
      {icon && <div className="mx-auto w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-500 mb-3">{icon}</div>}
      <h3 className="text-base font-medium text-ink-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
