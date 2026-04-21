const steps = [
  {
    number: "01",
    title: "Subscribe",
    description:
      "Choose monthly or yearly. A portion of every subscription funds the prize pool and your chosen charity.",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
  {
    number: "02",
    title: "Enter your scores",
    description:
      "Log your last 5 Stableford scores. Keep them updated — your most recent 5 are what count each draw.",
    color: "bg-blue-500",
    textColor: "text-blue-400",
  },
  {
    number: "03",
    title: "Enter the draw",
    description:
      "Once per month, enter the prize draw. Your 5 scores become your numbers — the closer to the draw, the better.",
    color: "bg-violet-500",
    textColor: "text-violet-400",
  },
  {
    number: "04",
    title: "Win & give back",
    description:
      "Match 3, 4 or all 5 numbers to win a share of the prize pool — while your charity receives your contribution.",
    color: "bg-amber-500",
    textColor: "text-amber-400",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-zinc-950 py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Simple by design
          </p>
          <h2 className="font-display text-4xl text-white sm:text-5xl">
            How Golf Heroes works
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Four steps from signup to winning — with your chosen charity benefiting every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              {/* Number */}
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${step.color} font-mono text-sm font-bold text-white`}>
                {step.number}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{step.description}</p>

              {/* Connector line */}
              <div className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-zinc-700 lg:block last:hidden" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
