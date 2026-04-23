const DashboardStat = ({ label, value, note }) => {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{label}</p>
      <p className="mt-4 font-display text-4xl text-forest">{value}</p>
      <p className="mt-3 text-sm text-stone-600">{note}</p>
    </div>
  );
};

export default DashboardStat;

