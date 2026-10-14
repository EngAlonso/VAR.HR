import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  Info,
  Plus,
  X,
} from "lucide-react";
import "./_group.css";

type RequestKind = "leave" | "permission";

type RequestForm = {
  leaveType: string;
  from: string;
  to: string;
  permissionType: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
};

const initialForm: RequestForm = {
  leaveType: "إجازة سنوية",
  from: "",
  to: "",
  permissionType: "استئذان شخصي",
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
};

function Field({
  id,
  label,
  type,
  value,
  onChange,
  required = true,
  hint,
}: {
  id: string;
  label: string;
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-semibold text-foreground"
      >
        {label}
        {required && <span className="mr-1 text-destructive" aria-hidden="true">*</span>}
      </label>
      <div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          dir="ltr"
          className="h-[50px] w-full rounded-xl border border-input bg-background px-3.5 text-left text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BackgroundPage({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-background px-5 pb-12 pt-6 text-foreground sm:px-10 sm:pt-9">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <span className="font-display text-base font-bold">V</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-wide">VAR HR</p>
            <p className="text-[11px] text-muted-foreground">مساحة الموظف</p>
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-bold text-secondary">
          م
        </div>
      </header>
      <main className="mx-auto mt-10 max-w-5xl sm:mt-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-primary-dark">الخدمات الذاتية</p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              طلباتي
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              تابع طلباتك وقدّم طلب إجازة أو استئذان جديدًا بسهولة.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-[hsl(var(--primary-dark))] focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            طلب جديد
          </button>
        </div>
        <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] sm:p-7">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-bold">آخر الطلبات</h2>
              <p className="mt-1 text-xs text-muted-foreground">سجل طلباتك في مكان واحد</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              ٠ طلبات
            </span>
          </div>
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
              <FileCheck2 aria-hidden="true" className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-bold">لا توجد طلبات حتى الآن</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              ستظهر طلبات الإجازة والاستئذان هنا بعد إرسالها.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function PreviewPicker({
  kind,
  onChange,
}: {
  kind: RequestKind;
  onChange: (kind: RequestKind) => void;
}) {
  return (
    <aside
      aria-label="اختيار نوع المعاينة"
      className="absolute left-1/2 top-3 z-[70] w-[calc(100%-24px)] max-w-[390px] -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-2 shadow-[var(--shadow-md)] backdrop-blur sm:top-4"
    >
      <div className="flex items-center justify-between gap-2 px-2 pb-1.5">
        <span className="text-[11px] font-bold text-secondary">معاينة تفاعلية</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
          نموذج توضيحي فقط
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        <button
          type="button"
          aria-pressed={kind === "leave"}
          onClick={() => onChange("leave")}
          className={`h-9 rounded-lg px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            kind === "leave"
              ? "bg-card text-secondary shadow-[var(--shadow-sm)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          إجازة
        </button>
        <button
          type="button"
          aria-pressed={kind === "permission"}
          onClick={() => onChange("permission")}
          className={`h-9 rounded-lg px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            kind === "permission"
              ? "bg-card text-secondary shadow-[var(--shadow-sm)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          استئذان
        </button>
      </div>
    </aside>
  );
}

function RequestModal({
  kind,
  form,
  onChange,
  onClose,
}: {
  kind: RequestKind;
  form: RequestForm;
  onChange: (key: keyof RequestForm, value: string) => void;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const title = kind === "leave" ? "طلب إجازة جديد" : "طلب استئذان جديد";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function update(key: keyof RequestForm, value: string) {
    setSubmitted(false);
    onChange(key, value);
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-secondary/55 px-3 pb-5 pt-[104px] backdrop-blur-[3px] sm:px-6 sm:pt-[108px]">
      <div className="flex min-h-[calc(100dvh-124px)] items-center justify-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-modal-title"
          aria-describedby="request-modal-description"
          className="flex max-h-[calc(100dvh-124px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_24px_70px_hsl(214_84%_10%_/_0.22)] animate-in fade-in zoom-in-95 duration-200"
        >
          <header className="shrink-0 border-b border-border px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary-dark">
                  {kind === "leave" ? (
                    <CalendarDays aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Clock3 aria-hidden="true" className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-primary-dark">الطلبات · طلب جديد</p>
                  <h2
                    id="request-modal-title"
                    className="mt-1 font-display text-xl font-bold leading-tight text-foreground sm:text-[22px]"
                  >
                    {title}
                  </h2>
                  <p
                    id="request-modal-description"
                    className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground sm:text-[13px]"
                  >
                    أضف التفاصيل المطلوبة، وسنرسل طلبك إلى مسؤول الموارد البشرية.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق نافذة الطلب"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <X aria-hidden="true" className="h-[18px] w-[18px]" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            {submitted && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-emerald-900"
              >
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs font-semibold leading-5">
                  تم تجهيز الطلب بنجاح. هذه معاينة فقط، ولم يُرسل أي طلب فعلي.
                </p>
              </div>
            )}

            <form id="request-form" onSubmit={submit} className="space-y-5">
              {kind === "leave" ? (
                <>
                  <div>
                    <label
                      htmlFor="leave-type"
                      className="mb-2 block text-[13px] font-semibold text-foreground"
                    >
                      نوع الإجازة
                      <span className="mr-1 text-destructive" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="leave-type"
                      name="type"
                      value={form.leaveType}
                      onChange={(event) => update("leaveType", event.target.value)}
                      required
                      className="h-[50px] w-full appearance-none rounded-xl border border-input bg-background px-3.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    >
                      <option>إجازة سنوية</option>
                      <option>إجازة مرضية</option>
                      <option>إجازة عارضة</option>
                      <option>إجازة بدون أجر</option>
                    </select>
                    <ArrowLeft
                      aria-hidden="true"
                      className="pointer-events-none -mt-[34px] mr-auto ml-3.5 h-4 w-4 rotate-[-90deg] text-muted-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                    <Field
                      id="leave-from"
                      label="تاريخ البداية"
                      type="date"
                      value={form.from}
                      onChange={(value) => update("from", value)}
                    />
                    <Field
                      id="leave-to"
                      label="تاريخ النهاية"
                      type="date"
                      value={form.to}
                      onChange={(value) => update("to", value)}
                      hint="آخر يوم في الإجازة"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="permission-type"
                      className="mb-2 block text-[13px] font-semibold text-foreground"
                    >
                      نوع الاستئذان
                      <span className="mr-1 text-destructive" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="permission-type"
                      name="type"
                      type="text"
                      value={form.permissionType}
                      onChange={(event) => update("permissionType", event.target.value)}
                      required
                      maxLength={80}
                      className="h-[50px] w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium text-foreground outline-none transition placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="مثال: استئذان شخصي"
                    />
                  </div>
                  <Field
                    id="permission-date"
                    label="تاريخ الاستئذان"
                    type="date"
                    value={form.date}
                    onChange={(value) => update("date", value)}
                  />
                  <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                    <Field
                      id="permission-start"
                      label="وقت البداية"
                      type="time"
                      value={form.startTime}
                      onChange={(value) => update("startTime", value)}
                    />
                    <Field
                      id="permission-end"
                      label="وقت النهاية"
                      type="time"
                      value={form.endTime}
                      onChange={(value) => update("endTime", value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="request-reason"
                  className="mb-2 block text-[13px] font-semibold text-foreground"
                >
                  السبب أو ملاحظات إضافية
                  <span className="mr-1 text-destructive" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="request-reason"
                  name="reason"
                  value={form.reason}
                  onChange={(event) => update("reason", event.target.value)}
                  required
                  maxLength={500}
                  rows={3}
                  placeholder={
                    kind === "leave"
                      ? "اكتب سبب طلب الإجازة باختصار..."
                      : "أخبرنا بسبب الاستئذان..."
                  }
                  className="min-h-[96px] w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[11px] leading-5 text-muted-foreground">
                    <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    تساعد التفاصيل الواضحة على مراجعة طلبك أسرع.
                  </p>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {form.reason.length}/500
                  </span>
                </div>
              </div>
            </form>
          </div>

          <footer className="shrink-0 border-t border-border bg-card px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-2.5 min-[390px]:flex-row min-[390px]:justify-between">
              <button
                type="submit"
                form="request-form"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-[hsl(var(--primary-dark))] focus:outline-none focus:ring-4 focus:ring-primary/25"
              >
                <span>إرسال الطلب</span>
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                إلغاء
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

export function Refined() {
  const [kind, setKind] = useState<RequestKind>("leave");
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState<RequestForm>(initialForm);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function changeField(key: keyof RequestForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNewRequest() {
    setOpen(true);
  }

  return (
    <main
      dir="rtl"
      lang="ar"
      className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground"
    >
      <BackgroundPage onCreate={openNewRequest} />
      {open && (
        <RequestModal
          kind={kind}
          form={form}
          onChange={changeField}
          onClose={() => setOpen(false)}
        />
      )}
      <PreviewPicker
        kind={kind}
        onChange={(nextKind) => {
          setKind(nextKind);
          setOpen(true);
        }}
      />
    </main>
  );
}
