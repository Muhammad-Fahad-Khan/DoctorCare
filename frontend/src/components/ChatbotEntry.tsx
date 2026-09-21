import { Link } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import { ChatbotIntroContent } from '../types/cms';

export function ChatbotEntry({ content }: { content: ChatbotIntroContent }) {
  return (
    <section id="chatbot" className="scroll-mt-24 px-6 py-8">
      <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-5 overflow-hidden rounded-3xl bg-dark-gradient p-7 text-white shadow-lift sm:flex-row sm:items-center sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(184,122,182,0.55), transparent 70%)' }}
          aria-hidden
        />

        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-orchid ring-1 ring-white/15">
          <Bot size={26} />
        </div>

        <div className="relative flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-orchid">AI Symptom Checker</p>
          <p className="mt-1.5 text-base font-medium leading-relaxed text-white/90 sm:text-lg">{content.promptText}</p>
        </div>

        <Link to="/patient" className="btn-light relative shrink-0">
          Start chat <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
