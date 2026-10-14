import "./_group.css";

function Field({
  label,
  type = "text",
  value = "",
}: {
  label: string;
  type?: string;
  value?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span className="block">{label}</span>
      <input
        type={type}
        readOnly
        value={value}
        className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-normal outline-none"
      />
    </label>
  );
}

function CurrentModal() {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-secondary/45 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-md)] sm:p-6"
        >
          <div className="mb-5 flex shrink-0 items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              طلب إجازة جديد
            </h2>
            <button
              type="button"
              aria-label="إغلاق"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <form className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="block">النوع</span>
                <select
                  defaultValue="إجازة سنوية"
                  className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option>إجازة سنوية</option>
                </select>
              </label>
              <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                <Field label="من" type="date" />
                <Field label="إلى" type="date" />
              </div>
              <label className="block text-sm font-semibold">
                <span className="block">السبب</span>
                <textarea
                  readOnly
                  className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Current() {
  return (
    <main dir="rtl" lang="ar" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold text-primary">الطلبات</p>
          <h1 className="mt-1 font-display text-2xl font-bold">الطلبات</h1>
          <div className="mt-7 rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold">لا توجد طلبات إجازة</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ستظهر طلباتك الجديدة هنا.
            </p>
          </div>
        </div>
      </div>
      <CurrentModal />
    </main>
  );
}
