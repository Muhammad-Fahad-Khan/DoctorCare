export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="glass-card px-8 py-6 text-center">
        <p className="text-sm font-semibold text-royal/50">Coming up next</p>
        <h1 className="mt-1 text-xl font-bold text-royal">{title}</h1>
      </div>
    </div>
  );
}
