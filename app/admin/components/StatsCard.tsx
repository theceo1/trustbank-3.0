interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3>{title}</h3>
        {icon}
      </div>
      <p>{value}</p>
      {description && <p>{description}</p>}
      {trend !== undefined && (
        <p className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
          {trend}%
        </p>
      )}
    </div>
  );
}