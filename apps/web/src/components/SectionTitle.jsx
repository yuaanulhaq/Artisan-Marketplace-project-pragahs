const SectionTitle = ({ eyebrow, title, description }) => {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl text-forest sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
    </div>
  );
};

export default SectionTitle;

