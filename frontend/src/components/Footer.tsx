export function Footer() {
  return (
    <footer className="border-t border-royal/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-royal/60 sm:flex-row">
        <p>© {new Date().getFullYear()} DocuCare. Open-source telemedicine.</p>
        <div className="flex gap-5">
          <a href="/about" className="transition-colors hover:text-royal">About</a>
          <a href="/contact" className="transition-colors hover:text-royal">Contact</a>
        </div>
      </div>
    </footer>
  );
}
