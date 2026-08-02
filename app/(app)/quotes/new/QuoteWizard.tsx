"use client";

import { useRef, useState, useTransition } from "react";
import { createQuote } from "@/app/actions/quotes";
import { matchesTrade, tradeLabel } from "@/lib/trades";
import { TradeFilterChips } from "@/app/components/TradeFilterChips";
import { buttonClass, inputClass, labelClass, PAGE_SHELL } from "@/lib/ui";

type Template = {
  id: string;
  name: string;
  tradeType: string;
  userId: string | null;
};

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: "Client" },
  { num: 2, label: "Template" },
  { num: 3, label: "Details" },
];

type ClientFields = {
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  jobAddress: string;
  notes: string;
};

export function QuoteWizard({
  templates,
  userTradeType,
}: {
  templates: Template[];
  userTradeType: string;
}) {
  const step1FormRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [allTrades, setAllTrades] = useState(false);
  const visibleTemplates = templates.filter((t) =>
    matchesTrade(t, userTradeType, allTrades)
  );
  const [clientFields, setClientFields] = useState<ClientFields>({
    title: "", clientName: "", clientPhone: "", clientEmail: "", jobAddress: "", notes: "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const back = () => setStep((s) => (s > 1 ? (s - 1) as Step : 1));

  function advanceFromStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setClientFields({
      title: fd.get("title") as string ?? "",
      clientName: fd.get("clientName") as string ?? "",
      clientPhone: fd.get("clientPhone") as string ?? "",
      clientEmail: fd.get("clientEmail") as string ?? "",
      jobAddress: fd.get("jobAddress") as string ?? "",
      notes: fd.get("notes") as string ?? "",
    });
    setStep(2);
  }

  function fillTestData() {
    const form = step1FormRef.current;
    if (!form) return;
    (form.elements.namedItem("title") as HTMLInputElement).value = "Lorem Ipsum Job — 123 Main St";
    (form.elements.namedItem("clientName") as HTMLInputElement).value = "Jane Doe";
    (form.elements.namedItem("clientPhone") as HTMLInputElement).value = "+1 555 987 6543";
    (form.elements.namedItem("clientEmail") as HTMLInputElement).value = "jane.doe@example.com";
    (form.elements.namedItem("jobAddress") as HTMLInputElement).value = "123 Main St, Springfield, ST";
    (form.elements.namedItem("notes") as HTMLTextAreaElement).value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(clientFields).forEach(([k, v]) => fd.set(k, v));
    if (selectedTemplate) fd.set("templateId", selectedTemplate);
    setError(null);
    startTransition(async () => {
      // On success createQuote() redirects, so nothing comes back here
      const result = await createQuote(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className={PAGE_SHELL}>
      {/* Progress. The current step is amber, completed steps ink, so at a
          glance you can tell where you are and how much is left. */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step === s.num
                  ? "bg-amber text-ink"
                  : step > s.num
                    ? "bg-ink text-paper"
                    : "bg-line text-ink-muted"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-sm font-semibold ${
                step === s.num ? "text-ink" : "text-ink-muted"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-line" />}
          </div>
        ))}
      </div>

      <form ref={step1FormRef} onSubmit={step === 1 ? advanceFromStep1 : handleSubmit}>
        {/* Step 1 — Client Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="type-display text-2xl font-extrabold">Who&apos;s it for?</h2>

            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={fillTestData}
                className={buttonClass({
                  variant: "dashed",
                  size: "sm",
                  block: true,
                })}
              >
                Fill test data (dev only)
              </button>
            )}

            <div>
              <label className={labelClass()} htmlFor="title">
                Quote title <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                defaultValue={clientFields.title}
                placeholder="Exterior painting — 123 Main St"
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="clientName">
                Client name <span className="text-danger">*</span>
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                maxLength={100}
                defaultValue={clientFields.clientName}
                placeholder="John Smith"
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="clientPhone">
                Client phone
              </label>
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                maxLength={30}
                placeholder="+1 555 000 0000"
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="clientEmail">
                Client email
              </label>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="john@example.com"
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="jobAddress">
                Job address
              </label>
              <input
                id="jobAddress"
                name="jobAddress"
                type="text"
                maxLength={200}
                placeholder="123 Main St, City, State"
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder="Special instructions or scope details…"
                className={inputClass({ size: "area" })}
              />
            </div>

            <button
              type="submit"
              className={buttonClass({ size: "lg", block: true })}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2 — Template Picker */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="type-display text-2xl font-extrabold">
              Start from a template
            </h2>
            <p className="text-sm text-ink-muted">
              Templates pre-fill your line items. You can change everything
              afterwards.
            </p>

            <TradeFilterChips
              userTradeType={userTradeType}
              allTrades={allTrades}
              onChange={setAllTrades}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setSelectedTemplate(""); setStep(3); }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${
                  selectedTemplate === ""
                    ? "border-ink bg-surface-sunk"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <p className="font-semibold">Start blank</p>
                <p className="text-sm text-ink-muted mt-0.5">
                  Add line items yourself
                </p>
              </button>

              {visibleTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTemplate(t.id); setStep(3); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${
                    selectedTemplate === t.id
                      ? "border-ink bg-surface-sunk"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-ink-muted mt-0.5">
                    {tradeLabel(t.tradeType)}
                    {t.userId !== null && " · Mine"}
                  </p>
                </button>
              ))}

              {visibleTemplates.length === 0 && (
                <p className="text-sm text-ink-muted px-1">
                  No {tradeLabel(userTradeType)} templates yet — tap{" "}
                  <strong className="text-ink">All trades</strong> to browse the
                  rest.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={back}
              className={buttonClass({
                variant: "outline",
                size: "lg",
                block: true,
              })}
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3 — Review & Create */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="type-display text-2xl font-extrabold">
              Ready to build it
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              You&apos;ll get{" "}
              <span className="font-semibold text-ink">Good / Better / Best</span>{" "}
              options to price. Photos and line items come next.
            </p>

            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="type-eyebrow text-[10px] text-ink-muted mb-1.5">
                Template
              </p>
              <p className="font-semibold">
                {selectedTemplate
                  ? templates.find((t) => t.id === selectedTemplate)?.name
                  : "Blank"}
              </p>
            </div>

            {error && <p className="text-sm text-danger font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className={buttonClass({
                variant: "accent",
                size: "lg",
                block: true,
              })}
            >
              {isPending ? "Creating…" : "Create quote"}
            </button>

            <button
              type="button"
              onClick={back}
              className={buttonClass({
                variant: "outline",
                size: "lg",
                block: true,
              })}
            >
              Back
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
