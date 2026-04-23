const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-3xl border border-dashed border-clay/30 bg-white/70 p-8 text-center shadow-sm">
      <h3 className="font-display text-2xl text-forest">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-stone-600">{description}</p>
    </div>
  );
};

export default EmptyState;

