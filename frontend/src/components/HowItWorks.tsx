import { CalendarCheck, MessagesSquare, Video } from 'lucide-react';

const STEPS = [
  {
    icon: MessagesSquare,
    title: 'Describe how you feel',
    body: 'Chat with our AI symptom checker in plain words. It works out what kind of doctor you need.',
  },
  {
    icon: CalendarCheck,
    title: 'Pick a doctor & a time',
    body: 'See verified doctors matched to your symptoms and book an open slot in a couple of taps.',
  },
  {
    icon: Video,
    title: 'Meet by video',
    body: 'Join a secure video consultation from anywhere. Your doctor already has your summary.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-4">From “I don’t feel well” to a doctor in three steps</h2>
        </div>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* connector line behind the cards on desktop */}
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px border-t-2 border-dashed border-magenta/20 md:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-magenta/30">
                <step.icon size={26} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-royal text-xs font-bold">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-royal">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-royal/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
