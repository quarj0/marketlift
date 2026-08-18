"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function ReportProblem() {
  const [done, setDone] = useState(false);
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {done ? (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto size-12 text-brand-600" />
            <h1 className="mt-4 text-2xl font-black">Report received</h1>
            <p className="mt-2 text-slate-500">
              Our support and moderation team will review your submission.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Submit another
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
              Support
            </p>
            <h1 className="mt-2 text-3xl font-black">Report a problem</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              For a specific listing, seller or message, use the Report action
              on that item. Use this form for general platform problems.
            </p>
            <div className="mt-7 space-y-4">
              <label>
                <span className="mb-1.5 block text-sm font-bold">Topic</span>
                <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
                  <option>Account problem</option>
                  <option>Payment for Marketlift services</option>
                  <option>Listing moderation</option>
                  <option>Safety concern</option>
                  <option>Technical issue</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Email</span>
                <Input type="email" placeholder="you@example.com" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Subject</span>
                <Input placeholder="Briefly describe the problem" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Details</span>
                <textarea
                  className="min-h-40 w-full rounded-xl border p-3 text-sm"
                  placeholder="Tell us what happened and include any relevant listing or payment reference..."
                />
              </label>
              <Button onClick={() => setDone(true)}>Submit report</Button>
            </div>
          </div>
        )}
      </main>
    </MarketplaceShell>
  );
}
