import { useState } from "react";
import { CalendarDays, Check, Clock3, Plus, ShieldCheck } from "lucide-react";
import "./_group.css";

type RequestKind = "leave" | "permission";

function DateTimeField({
  label,
  type,
}: {
  label: string;
  type: "date" | "time";
}) {
  return (
    <label className="block min-w-0 text-[13px] font-semibold">
      <span className="mb-2 block">{label}</span>
      <input
        type={type}
        dir="ltr"
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-left text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </label>
  );
}

export function Inline() {
  const [kind, setKind] = useState<RequestKind>("permission");
  const [submitted, setSubmitted] = useState(false);
  const isLeave = kind === "leave";

  return (
    <main
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-background px-3 py-3 text-foreground sm:px-6 sm:py-3"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-dark">
              {isLeave ? (
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Clock3 aria-hidden="true" className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-primary-dark">الطلبات</p>
              <h1 className="font-display text-base font-bold leading-tight sm:text-lg">
                {isLeave ? "طلب إجازة جديد" : "طلب استئذان جديد"}
              </h1>
            </div>
          </div>
          <div
            role="group"
            aria-label="اختيار نوع الطلب للمعاينة"
            className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
          >
            {(
              [
                ["leave", "إجازة"],
                ["permission", "استئذان"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => {
                  setSubmitted(false);
                  setKind(value);
                }}
                className={`h-9 rounded-lg px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  kind === value
                    ? "bg-card text-secondary shadow-[var(--shadow-sm)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)] sm:p-4">
          {submitted && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900"
            >
              <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
              تم تجهيز المعاينة بنجاح. لم يتم إرسال طلب فعلي.
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className={`grid gap-x-3 gap-y-3 ${
              isLeave ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            <label className="block min-w-0 text-[13px] font-semibold">
              <span className="mb-2 block">
                {isLeave ? "نوع الإجازة" : "نوع الاستئذان"}
              </span>
              {isLeave ? (
                <select className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
                  <option>إجازة سنوية</option>
                  <option>إجازة مرضية</option>
                  <option>إجازة عارضة</option>
                  <option>إجازة بدون أجر</option>
                </select>
              ) : (
                <input
                  defaultValue="استئذان شخصي"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
              )}
            </label>

            {isLeave ? (
              <>
                <DateTimeField label="تاريخ البداية" type="date" />
                <DateTimeField label="تاريخ النهاية" type="date" />
              </>
            ) : (
              <>
                <DateTimeField label="تاريخ الاستئذان" type="date" />
                <DateTimeField label="وقت البداية" type="time" />
                <DateTimeField label="وقت النهاية" type="time" />
              </>
            )}

            <div className="grid gap-3 border-t border-border pt-3 sm:col-span-full lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="block text-[13px] font-semibold">
                <span className="mb-1.5 block">السبب أو ملاحظات إضافية</span>
                <textarea
                  required
                  rows={2}
                  placeholder={
                    isLeave
                      ? "اكتب سبب طلب الإجازة باختصار."
                      : "اكتب سبب طلب الاستئذان باختصار."
                  }
                  onChange={() => setSubmitted(false)}
                  className="min-h-16 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                <span className="mt-1 block text-[10px] font-normal leading-4 text-muted-foreground">
                  تساعد التفاصيل الواضحة على مراجعة طلبك أسرع.
                </span>
              </label>
              <div className="flex flex-col gap-2 lg:items-end">
                <p className="flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-dark"
                  />
                  سيظل الطلب قيد المراجعة حتى يصدر قرار بشأنه.
                </p>
                <button
                  type="submit"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-[hsl(var(--primary-dark))] focus:outline-none focus:ring-4 focus:ring-primary/25"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  إرسال الطلب
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
