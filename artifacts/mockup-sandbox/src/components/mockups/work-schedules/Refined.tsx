import "./_group.css";
import { Activity, Clock3, Pencil, Plus } from "lucide-react";

const schedules = [
  { name: "خاص 1", start: "18:00", end: "21:00", hours: "3", active: true },
  { name: "خاص 2", start: "14:00", end: "18:00", hours: "4", active: true },
  { name: "صباحي", start: "09:00", end: "17:00", hours: "8", active: true, isDefault: true },
  { name: "مسائي", start: "15:00", end: "23:00", hours: "8", active: true },
  { name: "مسائي تسويق", start: "13:00", end: "21:00", hours: "8", active: true },
];

function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "good" | "accent" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accent: "bg-primary/10 text-primary-dark dark:text-primary",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

function Metric({ icon: Icon, label, value, wide = false }: { icon: typeof Clock3; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-border/80 bg-muted/35 px-3.5 py-3 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon size={15} className="shrink-0 text-primary-dark dark:text-primary" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export function Refined() {
  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-primary-dark dark:text-primary">قواعد الحضور</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">تنظيم الشيفتات</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">إدارة مواعيد الدوام والساعات المطلوبة لكل شيفت من مكان واحد.</p>
          </div>
          <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 sm:self-auto">
            <Plus size={16} />
            إضافة شيفت
          </button>
        </header>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">قائمة الشيفتات</h2>
            <p className="mt-1 text-xs text-muted-foreground">اختر شيفتًا لتعديله أو تعيينه افتراضيًا.</p>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">5 شيفتات</span>
        </div>

        <div className="space-y-3">
          {schedules.map((schedule) => (
            <article key={schedule.name} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-primary/40 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark dark:text-primary">
                    <Clock3 size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-6">{schedule.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {schedule.isDefault && <Badge tone="accent">الشيفت الافتراضي للشركة</Badge>}
                      <Badge tone={schedule.active ? "good" : "neutral"}>{schedule.active ? "شيفت نشط" : "غير نشط"}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {!schedule.isDefault && (
                    <button type="button" className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-muted/50">
                      تعيين كشيفت افتراضي
                    </button>
                  )}
                  <button type="button" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground transition hover:opacity-90">
                    <Pencil size={14} />
                    تعديل الشيفت
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/70 pt-4 sm:grid-cols-3 sm:gap-3">
                <Metric icon={Clock3} label="وقت البدء" value={schedule.start} />
                <Metric icon={Clock3} label="وقت الانتهاء" value={schedule.end} />
                <Metric icon={Activity} label="الساعات المطلوبة" value={`${schedule.hours} ساعات`} wide />
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
