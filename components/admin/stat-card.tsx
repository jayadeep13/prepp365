const toneClasses = {
  orange: "bg-orange-500/10 text-orange-400",
  purple: "bg-purple-500/10 text-purple-400",
  green: "bg-green-500/10 text-green-400",
  blue: "bg-blue-500/10 text-blue-400",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "orange",
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClasses[tone]}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}
