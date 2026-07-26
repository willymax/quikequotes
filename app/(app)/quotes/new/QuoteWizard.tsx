"use client";

import { useState, useTransition } from "react";
import { createQuote } from "@/app/actions/quotes";

type Template = {
  id: string;
  name: string;
  tradeType: string;
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

export function QuoteWizard({ templates }: { templates: Template[] }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [clientFields, setClientFields] = useState<ClientFields>({
    title: "", clientName: "", clientPhone: "", clientEmail: "", jobAddress: "", notes: "",
  });
  const [isPending, startTransition] = useTransition();

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(clientFields).forEach(([k, v]) => fd.set(k, v));
    if (selectedTemplate) fd.set("templateId", selectedTemplate);
    startTransition(() => { void createQuote(fd); });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step >= s.num
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-sm font-medium ${
                step === s.num ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-zinc-200" />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={step === 1 ? advanceFromStep1 : handleSubmit}>
        {/* Step 1 — Client Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Client Info</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="title">
                Quote Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={clientFields.title}
                placeholder="Exterior Painting — 123 Main St"
                className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="clientName">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                defaultValue={clientFields.clientName}
                placeholder="John Smith"
                className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="clientPhone">
                Client Phone
              </label>
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                placeholder="+1 555 000 0000"
                className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="clientEmail">
                Client Email
              </label>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="john@example.com"
                className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="jobAddress">
                Job Address
              </label>
              <input
                id="jobAddress"
                name="jobAddress"
                type="text"
                placeholder="123 Main St, City, State"
                className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any special instructions or scope details..."
                className="w-full px-4 py-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2 — Template Picker */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Pick a Template</h2>
            <p className="text-sm text-zinc-500">
              Templates pre-fill your line items. You can customize everything after.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setSelectedTemplate(""); setStep(3); }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${
                  selectedTemplate === ""
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <p className="font-semibold">Start Blank</p>
                <p className="text-sm text-zinc-500 mt-0.5">Add line items manually</p>
              </button>

              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTemplate(t.id); setStep(3); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${
                    selectedTemplate === t.id
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <p className="font-semibold">{t.name}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={back}
              className="w-full h-12 rounded-xl border border-zinc-300 text-zinc-700 font-medium text-base"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3 — Review & Create */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Create Quote</h2>
            <p className="text-sm text-zinc-500">
              Your quote will be created with{" "}
              <span className="font-medium text-zinc-700">Good / Better / Best</span> tiers.
              You&apos;ll add photos and customize pricing on the next screen.
            </p>

            <div className="rounded-2xl bg-zinc-50 p-4 space-y-2 text-sm">
              <p className="text-zinc-500">Template</p>
              <p className="font-medium">
                {selectedTemplate
                  ? templates.find((t) => t.id === selectedTemplate)?.name
                  : "Blank"}
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base disabled:opacity-60"
            >
              {isPending ? "Creating..." : "Create Quote"}
            </button>

            <button
              type="button"
              onClick={back}
              className="w-full h-12 rounded-xl border border-zinc-300 text-zinc-700 font-medium text-base"
            >
              Back
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
