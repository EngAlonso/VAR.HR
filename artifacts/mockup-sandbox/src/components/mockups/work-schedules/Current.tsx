import "./_group.css";

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
    good: "bg-primary/10 text-primary",
    accent: "bg-secondary/10 text-secondary",
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

function OutlineButton({ children }: { children: string }) {
  return <button type="button" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground">{children}</button>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export function Current() {
  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5 text-right">
          <p className="text-xs font-semibold text-primary">قواعد الحضور</p>
          <h1 className="mt-1 font-display text-3xl font-bold">تنظيم الشيفتات</h1>
          <p className="mt-2 text-sm text-muted-foreground">أنشئ وأدر الشيفتات ومواعيدها والاستراحات والضوابط الافتراضية للشركة.</p>
        </header>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-sm)]">
          <div className="border-b border-border p-5 text-right">
            <h2 className="font-display text-lg font-semibold">تنظيم الشيفتات</h2>
            <p className="text-sm text-muted-foreground">وقت البدء ← وقت الانتهاء</p>
          </div>
          <div className="divide-y divide-border">
            {schedules.map((schedule) => (
              <article key={schedule.name} className="p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                    <span>{schedule.name}</span>
                    {schedule.isDefault && <Badge tone="accent">الشيفت الافتراضي للشركة</Badge>}
                    <Badge tone={schedule.active ? "good" : "neutral"}>{schedule.active ? "شيفت نشط" : "غير نشط"}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!schedule.isDefault && <OutlineButton>تعيين كشيفت افتراضي</OutlineButton>}
                    <OutlineButton>تعديل الشيفت</OutlineButton>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="وقت البدء" value={schedule.start} />
                  <Info label="وقت الانتهاء" value={schedule.end} />
                  <Info label="الساعات المطلوبة" value={`${schedule.hours}h`} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
