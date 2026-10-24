import {
  Bell,
  BriefcaseBusiness,
  Database,
  Globe2,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import "./_group.css";

const items = [
  { icon: BriefcaseBusiness, label: "مالك المنصة", compact: "مالك المنصة", active: true },
  { icon: Database, label: "إدارة قاعدة البيانات", compact: "قاعدة البيانات" },
  { icon: BriefcaseBusiness, label: "اسم ولوجو وتذييل الموقع", compact: "هوية الموقع" },
  { icon: Settings, label: "إعدادات الحساب", compact: "الحساب" },
];

export function At100Percent() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen overflow-hidden bg-background font-sans text-foreground"
    >
      <header className="sticky top-0 z-30 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/80 bg-background/90 px-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="فتح القائمة"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card"
          >
            <span aria-hidden="true" className="flex w-5 flex-col gap-1">
              <span className="h-0.5 w-full rounded-full bg-foreground" />
              <span className="h-0.5 w-full rounded-full bg-foreground" />
              <span className="h-0.5 w-full rounded-full bg-foreground" />
            </span>
          </button>
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden">
            <img
              src="/__mockup/var-hr-mark.png"
              alt="VAR HR"
              className="block size-full object-contain"
            />
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1">
          <button
            type="button"
            aria-label="الإشعارات"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card"
          >
            <Bell size={18} />
          </button>
          <div className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground">
            <Globe2 size={14} />
            <span>العربية</span>
          </div>
          <button
            type="button"
            aria-label="الملف الشخصي"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-xs font-bold"
          >
            أ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 pb-28 pt-5">
        <div className="text-end">
          <p className="text-xs font-semibold text-primary-dark">النسخ الاحتياطي والاستعادة</p>
          <h1 className="mt-2 text-2xl font-semibold">النسخ الاحتياطي والاستعادة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ نسخة كاملة من المنصة أو استعدها بأمان.
          </p>
        </div>
        <section className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4 text-end">
            <h2 className="text-lg font-semibold">حالة تشغيل النسخ التلقائي</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              آخر تشغيل للجدولة ونتيجته، وآخر محاولة لكل نسخة من المنصة والشركات.
            </p>
            <button className="mt-3 rounded-xl border border-border px-4 py-2 text-sm">
              تحديث الحالة
            </button>
          </div>
          <div className="grid gap-3 p-4">
            {["وقت التشغيل · ٢٤/١٠/٢٠٢٦، ٧:٣٤ م", "مصدر التشغيل · Vercel Cron", "حالة التشغيل · اكتمل"].map((row) => (
              <div key={row} className="rounded-2xl bg-muted p-4 text-end text-sm">
                {row}
              </div>
            ))}
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 end-4 z-40 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-xl">
        تثبيت التطبيق
      </button>

      <nav
        aria-label="التنقل"
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-1 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-md backdrop-blur-md"
      >
        {items.map(({ icon: Icon, label, compact, active }) => (
          <a
            key={label}
            href="#"
            onClick={(event) => event.preventDefault()}
            aria-label={label}
            title={label}
            className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center text-[10px] font-semibold leading-tight ${active ? "bg-primary/15 text-primary-dark" : "text-muted-foreground"}`}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
            <span className="max-w-full whitespace-normal break-words text-center">
              {compact}
            </span>
          </a>
        ))}
        <button className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-semibold leading-tight text-muted-foreground">
          <MoreHorizontal size={18} />
          <span className="max-w-full whitespace-normal break-words text-center">
            المزيد
          </span>
        </button>
      </nav>
    </div>
  );
}
