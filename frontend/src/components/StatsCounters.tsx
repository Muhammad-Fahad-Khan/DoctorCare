import { useEffect, useRef, useState } from 'react';
import { StatsContent } from '../types/cms';

function AnimatedStat({ value }: { value: string }) {
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  const [display, setDisplay] = useState(match ? '0' : value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits.replace(/,/g, ''), 10);
    const duration = 900;
    const start = performance.now();

    let frame: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(target * (1 - Math.pow(1 - progress, 3))); // ease-out cubic
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className="text-3xl font-extrabold text-magenta sm:text-4xl">
      {display}
    </span>
  );
}

export function StatsCounters({ content }: { content: StatsContent }) {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
        {content.items.map((stat) => (
          <div key={stat.label} className="interactive-card p-6 text-center">
            <AnimatedStat value={stat.value} />
            <p className="mt-2 text-sm text-royal/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
