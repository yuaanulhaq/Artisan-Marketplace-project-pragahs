const LoadingState = () => {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/85 p-6 text-sm text-stone-600 shadow-sm">
      <div className="h-3 w-28 animate-pulse rounded-full bg-stone-200" />
      <div className="mt-4 h-3 w-3/4 animate-pulse rounded-full bg-stone-200" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-stone-200" />
    </div>
  );
};

export default LoadingState;

