"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { saveProfile } from "@/lib/storage";
import {
  newSupplementEntry,
  sanitizeSupplementStack,
} from "@/lib/supplementStack";
import { saveSupplementPreferences } from "@/lib/supplementPreferencesStorage";
import type { OnboardingAnswers } from "@/types/coach";
import type {
  UserSupplementEntry,
  UserSupplementType,
} from "@/types/supplements";
import { useCallback, useMemo, useState } from "react";

type Props = {
  profile: OnboardingAnswers;
  onSaved: () => void;
};

export function SupplementStackEditor({ profile, onSaved }: Props) {
  const { t, locale } = useTranslation();
  const [stack, setStack] = useState<UserSupplementEntry[]>(() =>
    sanitizeSupplementStack(profile.supplementStack),
  );
  const [open, setOpen] = useState(false);

  const hasProtein = useMemo(
    () => stack.some((x) => x.type === "protein_powder" && x.proteinGPerDay > 0),
    [stack],
  );

  const persist = useCallback(
    (next: UserSupplementEntry[]) => {
      const clean = sanitizeSupplementStack(next);
      setStack(clean);
      saveProfile({ ...profile, supplementStack: clean });
      saveSupplementPreferences({
        usesCreatine: clean.some((x) => x.type === "creatine"),
        usesProteinPowder: clean.some(
          (x) => x.type === "protein_powder" && x.proteinGPerDay > 0,
        ),
      });
      onSaved();
    },
    [profile, onSaved],
  );

  const addType = (type: UserSupplementType) => {
    persist([...stack, newSupplementEntry(type)]);
  };

  const updateRow = (id: string, patch: Partial<UserSupplementEntry>) => {
    persist(
      stack.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  };

  const removeRow = (id: string) => {
    persist(stack.filter((x) => x.id !== id));
  };

  return (
    <section
      className="mt-5 rounded-[var(--radius-xl)] border border-accent/25 bg-accent/[0.06] px-4 py-4"
      aria-labelledby="supp-stack-h"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2
            id="supp-stack-h"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"
          >
            {t("food.supplementStackTitle")}
          </h2>
          {hasProtein ? (
            <p className="mt-1 text-[12px] leading-snug text-muted">
              {t("food.supplementProteinFromStack")}
            </p>
          ) : (
            <p className="mt-1 text-[12px] leading-snug text-muted-2">
              {locale === "fi"
                ? "Lisää jauhe tai kreatiini — ruokamoottori vähentää proteiinitarvetta ruoasta vastaavasti."
                : "Add powder or creatine — the meal engine reduces food protein by your powder intake."}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((x) => !x)}
          className="min-h-[40px] rounded-full border border-border/70 px-3 text-[11px] font-semibold text-muted transition hover:border-accent/40"
        >
          {open
            ? locale === "fi"
              ? "Sulje"
              : "Close"
            : locale === "fi"
              ? "Muokkaa"
              : "Edit"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          {stack.map((row) => (
            <div
              key={row.id}
              className="rounded-[var(--radius-lg)] border border-border/60 bg-background/80 px-3 py-3"
            >
              <div className="flex flex-wrap gap-2">
                <select
                  className="min-h-[44px] flex-1 rounded-[var(--radius-md)] border border-border bg-background px-2 text-[14px] text-foreground"
                  value={row.type}
                  onChange={(e) =>
                    updateRow(row.id, {
                      type: e.target.value as UserSupplementType,
                      proteinGPerDay:
                        e.target.value === "protein_powder" ? 25 : 0,
                    })
                  }
                >
                  <option value="protein_powder">
                    {locale === "fi" ? "Proteiinijauhe" : "Protein powder"}
                  </option>
                  <option value="creatine">
                    {locale === "fi" ? "Kreatiini" : "Creatine"}
                  </option>
                  <option value="other">
                    {locale === "fi" ? "Muu" : "Other"}
                  </option>
                </select>
                <button
                  type="button"
                  className="min-h-[44px] rounded-[var(--radius-md)] border border-red-500/40 px-3 text-[12px] font-semibold text-red-300/90"
                  onClick={() => removeRow(row.id)}
                >
                  {locale === "fi" ? "Poista" : "Remove"}
                </button>
              </div>
              <label className="mt-2 block text-[11px] font-medium text-muted-2">
                {locale === "fi" ? "Nimi" : "Name"}
                <input
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-[15px] text-foreground"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                />
              </label>
              {row.type === "protein_powder" ? (
                <label className="mt-2 block text-[11px] font-medium text-muted-2">
                  {locale === "fi"
                    ? "Proteiinia päivässä (g)"
                    : "Protein per day (g)"}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={120}
                    className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-[15px] tabular-nums text-foreground"
                    value={row.proteinGPerDay > 0 ? String(row.proteinGPerDay) : ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (v === "") {
                        updateRow(row.id, { proteinGPerDay: 0 });
                        return;
                      }
                      const n = Number(v);
                      if (!Number.isFinite(n)) return;
                      updateRow(row.id, {
                        proteinGPerDay: Math.min(120, Math.max(0, Math.round(n))),
                      });
                    }}
                  />
                </label>
              ) : (
                <label className="mt-2 block text-[11px] font-medium text-muted-2">
                  {locale === "fi" ? "Annos" : "Dose"}
                  <input
                    className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-[15px] text-foreground"
                    value={row.doseLabel ?? ""}
                    onChange={(e) =>
                      updateRow(row.id, { doseLabel: e.target.value })
                    }
                    placeholder={locale === "fi" ? "esim. 5 g" : "e.g. 5 g"}
                  />
                </label>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-[44px] rounded-full border border-border/80 bg-card/60 px-4 text-[12px] font-semibold text-foreground"
              onClick={() => addType("protein_powder")}
            >
              + {locale === "fi" ? "Proteiini" : "Protein"}
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-full border border-border/80 bg-card/60 px-4 text-[12px] font-semibold text-foreground"
              onClick={() => addType("creatine")}
            >
              + {locale === "fi" ? "Kreatiini" : "Creatine"}
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-full border border-border/80 bg-card/60 px-4 text-[12px] font-semibold text-foreground"
              onClick={() => addType("other")}
            >
              + {locale === "fi" ? "Muu" : "Other"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
