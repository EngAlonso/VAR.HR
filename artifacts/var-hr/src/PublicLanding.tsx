import { Link } from "wouter";
import {
  ArrowDown,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Menu,
  WalletCards,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

type PublicLandingProps = {
  locale: "ar" | "en";
  onLocaleChange: (locale: "ar" | "en") => void;
  siteName: string;
  logoSrc: string;
};

const copy = {
  en: {
    nav: ["How it works", "For teams", "What you can manage"],
    language: "العربية",
    signIn: "Sign in",
    eyebrow: "People operations, made clearer",
    headline: "Good work starts with",
    headlineAccent: "people in sync.",
    intro:
      "The everyday work of managing a team, brought together in one considered place—from employee records to attendance, payroll, schedules, and requests.",
    explore: "Explore the platform",
    note: "For employees and the people who support them",
    overview: "A clearer view of the workday",
    overviewSub: "The essentials, connected.",
    today: "Today",
    attendance: "Attendance",
    present: "Present",
    schedule: "My schedule",
    shift: "Morning shift",
    payroll: "Payroll",
    organized: "Ready when you need it",
    employees: "Employee records",
    recordsDetail: "People and their details, kept together.",
    time: "Attendance & schedules",
    timeDetail: "A shared view of time at work.",
    pay: "Payroll",
    payDetail: "Payroll information, organized in one place.",
    requests: "Employee requests",
    requestsDetail: "A clear path for everyday requests.",
    sectionEyebrow: "One connected workspace",
    sectionTitle: "The details that keep a team moving.",
    sectionBody:
      "Bring essential people operations into a shared rhythm. Employees can stay informed, while administrators keep the day-to-day organized.",
    employeeLabel: "For employees",
    employeeTitle: "Know where things stand.",
    employeeBody:
      "See your work details and schedule, keep up with attendance, and make requests through a more straightforward experience.",
    adminLabel: "For company administrators",
    adminTitle: "Keep the moving parts together.",
    adminBody:
      "Manage employee information and coordinate attendance, payroll, schedules, and requests from one operational home.",
    employeesList: ["Personal work information", "Attendance and schedules", "Requests and updates"],
    adminList: ["Employee records", "Attendance and scheduling", "Payroll and employee requests"],
    howEyebrow: "A more connected routine",
    howTitle: "Less looking around. More clarity.",
    steps: [
      ["Bring the essentials together", "Employee details and core operations live in a shared workspace."],
      ["Keep people in the loop", "Employees and administrators can follow the information that matters to them."],
      ["Move through the day with confidence", "Schedules, attendance, payroll, and requests stay part of the same picture."],
    ],
    languageEyebrow: "Made for the way your team works",
    languageTitle: "Two languages. One shared understanding.",
    languageBody:
      "Switch between Arabic and English to make the experience more natural for every member of your team.",
    finalEyebrow: "A better-organized workday begins here",
    finalTitle: "Bring your people operations into focus.",
    finalBody: "Sign in to continue to your VAR HR workspace.",
    footerLine: "People operations, with room for everyone.",
    backTop: "Back to top",
    menuOpen: "Open navigation menu",
    menuClose: "Close navigation menu",
    visualAlt:
      "Illustrated VAR HR workspace preview showing attendance, a work schedule, and organized employee information",
    preview: "Workspace preview",
    live: "Illustrative preview",
    week: "This week",
    requestLabel: "Requests",
    requestStatus: "In review",
    detailLabel: "Employee details",
    detailValue: "Organized",
  },
  ar: {
    nav: ["كيف يعمل", "للفرق", "ما يمكنك إدارته"],
    language: "English",
    signIn: "تسجيل الدخول",
    eyebrow: "عمليات الموارد البشرية بوضوح أكبر",
    headline: "يبدأ العمل الجيد عندما",
    headlineAccent: "يتواصل الجميع.",
    intro:
      "اجمع أعمال إدارة الفريق اليومية في مساحة واحدة مدروسة؛ من سجلات الموظفين إلى الحضور والرواتب والجداول والطلبات.",
    explore: "اكتشف المنصة",
    note: "للموظفين ولمن يدعمونهم",
    overview: "رؤية أوضح ليوم العمل",
    overviewSub: "أساسيات العمل، في مكان واحد.",
    today: "اليوم",
    attendance: "الحضور",
    present: "حاضر",
    schedule: "جدولي",
    shift: "الفترة الصباحية",
    payroll: "الرواتب",
    organized: "جاهز عند الحاجة",
    employees: "سجلات الموظفين",
    recordsDetail: "معلومات الموظفين وتفاصيلهم معاً.",
    time: "الحضور والجداول",
    timeDetail: "رؤية مشتركة لأوقات العمل.",
    pay: "الرواتب",
    payDetail: "معلومات الرواتب منظمة في مكان واحد.",
    requests: "طلبات الموظفين",
    requestsDetail: "مسار واضح للطلبات اليومية.",
    sectionEyebrow: "مساحة عمل مترابطة",
    sectionTitle: "تفاصيل تساعد الفريق على التقدم.",
    sectionBody:
      "اجمع أساسيات عمليات الموظفين ضمن إيقاع مشترك. ليبقى الموظفون على اطلاع، ويحافظ المسؤولون على تنظيم العمل اليومي.",
    employeeLabel: "للموظفين",
    employeeTitle: "اعرف ما يجري.",
    employeeBody:
      "اطّلع على تفاصيل عملك وجدولك، وتابع الحضور، وقدّم الطلبات ضمن تجربة أكثر وضوحاً.",
    adminLabel: "لمسؤولي الشركة",
    adminTitle: "اجمع تفاصيل العمل في مكان واحد.",
    adminBody:
      "أدر معلومات الموظفين ونسّق الحضور والرواتب والجداول والطلبات من مساحة تشغيلية واحدة.",
    employeesList: ["معلومات العمل الشخصية", "الحضور والجداول", "الطلبات والتحديثات"],
    adminList: ["سجلات الموظفين", "الحضور وتنظيم الجداول", "الرواتب وطلبات الموظفين"],
    howEyebrow: "روتين عمل أكثر ترابطاً",
    howTitle: "بحث أقل. وضوح أكثر.",
    steps: [
      ["اجمع الأساسيات", "تجتمع تفاصيل الموظفين والعمليات الأساسية في مساحة عمل مشتركة."],
      ["أبقِ الجميع على اطلاع", "يمكن للموظفين والمسؤولين متابعة المعلومات التي تهمهم."],
      ["تابع يومك بثقة", "تبقى الجداول والحضور والرواتب والطلبات ضمن صورة واحدة."],
    ],
    languageEyebrow: "مصمم لطريقة عمل فريقك",
    languageTitle: "لغتان، وفهم مشترك.",
    languageBody:
      "انتقل بين العربية والإنجليزية لتكون التجربة أقرب وأسهل لكل فرد في فريقك.",
    finalEyebrow: "يوم عمل أكثر تنظيماً يبدأ من هنا",
    finalTitle: "امنح عمليات فريقك رؤية أوضح.",
    finalBody: "سجّل الدخول للمتابعة إلى مساحة VAR HR الخاصة بك.",
    footerLine: "عمليات الموارد البشرية، بمساحة تتسع للجميع.",
    backTop: "العودة إلى الأعلى",
    menuOpen: "فتح قائمة التنقل",
    menuClose: "إغلاق قائمة التنقل",
    visualAlt:
      "معاينة توضيحية لمساحة VAR HR تعرض الحضور وجدول العمل ومعلومات الموظفين المنظمة",
    preview: "معاينة مساحة العمل",
    live: "معاينة توضيحية",
    week: "هذا الأسبوع",
    requestLabel: "الطلبات",
    requestStatus: "قيد المراجعة",
    detailLabel: "تفاصيل الموظفين",
    detailValue: "منظمة",
  },
};

export default function PublicLanding({
  locale,
  onLocaleChange,
  siteName,
  logoSrc,
}: PublicLandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isArabic = locale === "ar";
  const t = copy[locale];
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  const closeMenu = () => setMenuOpen(false);
  const navItems = [
    { label: t.nav[0], href: "#how-it-works" },
    { label: t.nav[1], href: "#for-teams" },
    { label: t.nav[2], href: "#capabilities" },
  ];
  const features = [
    { icon: UsersRound, title: t.employees, body: t.recordsDetail, tone: "bg-[#f0e7d3] text-[#71561e]" },
    { icon: Clock3, title: t.time, body: t.timeDetail, tone: "bg-[#dce9e5] text-[#315c50]" },
    { icon: WalletCards, title: t.pay, body: t.payDetail, tone: "bg-[#e7e4f0] text-[#51476f]" },
    { icon: FileText, title: t.requests, body: t.requestsDetail, tone: "bg-[#f1e2dd] text-[#814f42]" },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      lang={locale}
      className="min-h-[100dvh] overflow-hidden bg-[#f7f5ef] text-[#142c45] selection:bg-[#e8c879] selection:text-[#142c45]"
    >
      <header className="relative z-20 border-b border-[#142c45]/10 bg-[#f7f5ef]/95">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="#home" aria-label={siteName} className="flex min-w-0 items-center gap-3">
            <img
              src={logoSrc}
              alt={`${siteName} logo`}
              className="h-10 max-w-[145px] object-contain object-start sm:h-11"
              data-testid="img-brand-logo"
            />
            <span className="sr-only" data-testid="text-site-name">{siteName}</span>
          </a>

          <nav aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"} className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-[#445667] transition-colors hover:text-[#a27b2d]"
                data-testid={`link-nav-${item.href.slice(1)}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onLocaleChange(isArabic ? "en" : "ar")}
              className="rounded-full px-3 py-2 text-xs font-semibold text-[#526171] transition hover:bg-[#ece8dd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a37]"
              aria-label={isArabic ? "Switch language to English" : "تغيير اللغة إلى العربية"}
              data-testid="button-language-switch"
            >
              {t.language}
            </button>
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#142c45] px-4 text-xs font-semibold text-[#fffdf7] transition hover:bg-[#203d5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a37] sm:px-5 sm:text-sm"
              data-testid="link-sign-in-header"
            >
              {t.signIn}
              <Arrow size={15} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#142c45]/15 text-[#142c45] lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? t.menuClose : t.menuOpen}
              aria-expanded={menuOpen}
              data-testid="button-mobile-menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="absolute inset-x-0 top-full border-b border-[#142c45]/10 bg-[#f7f5ef] px-5 py-4 shadow-lg lg:hidden" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
            <div className="mx-auto flex max-w-7xl flex-col">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={closeMenu} className="border-b border-[#142c45]/[.08] py-3 text-sm font-medium text-[#344b60]" data-testid={`link-mobile-${item.href.slice(1)}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section id="home" className="relative">
        <div className="pointer-events-none absolute -top-20 end-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#ebdfc4]/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[.94fr_1.06fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="relative z-10 max-w-[570px]">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.19em] text-[#98752d] sm:text-xs">
              <span className="h-px w-8 bg-[#bd9a51]" />
              {t.eyebrow}
            </p>
            <h1 className="font-display text-[2.8rem] font-semibold leading-[1.12] tracking-[-.045em] text-[#142c45] sm:text-6xl lg:text-[4.25rem]">
              {t.headline}
              <span className="mt-1 block text-[#a27d34]">{t.headlineAccent}</span>
            </h1>
            <p className="mt-7 max-w-[520px] text-[15px] leading-7 text-[#5b6873] sm:text-base sm:leading-8">{t.intro}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#capabilities"
                className="group inline-flex min-h-12 items-center gap-4 rounded-full bg-[#142c45] px-6 text-sm font-semibold text-[#fffdf7] transition hover:bg-[#203d5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a37]"
                data-testid="link-explore-platform"
              >
                {t.explore}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4bd68] text-[#142c45] transition-transform group-hover:translate-y-0.5">
                  <ArrowDown size={14} aria-hidden="true" />
                </span>
              </a>
              <span className="text-xs font-medium text-[#78818a]">{t.note}</span>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-[#142c45]/10 pt-5 text-xs font-medium text-[#687580]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9e4d8] text-[#8a6b2c]">
                <Check size={14} aria-hidden="true" />
              </span>
              <span>{isArabic ? "مساحة عمل واحدة، تدعم اللغتين" : "One workspace, ready in both languages"}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px]" role="group" aria-label={t.visualAlt} data-testid="visual-workspace-preview">
            <div className="absolute -inset-3 rotate-[-3deg] rounded-[2rem] border border-[#cbb984]/40 bg-[#eee7d5]/55 sm:-inset-5" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[#dcd7ca] bg-[#fffefa] p-4 shadow-[0_26px_70px_-35px_rgba(20,44,69,.28)] sm:rounded-[2rem] sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[#e9e5da] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#142c45] text-[#e7c572]">
                    <UsersRound size={17} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#87909a]">{t.preview}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#20384f]">{siteName}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf1e9] px-2.5 py-1.5 text-[10px] font-semibold text-[#496d50]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6a966c]" />
                  {t.live}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 sm:gap-4">
                <div className="col-span-2 rounded-2xl bg-[#f6f4ee] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-[#7d858c]">{t.today}</p>
                      <p className="mt-1 text-base font-semibold text-[#1d344b]">{t.attendance}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7dfcb] text-[#896b2c]">
                      <Clock3 size={17} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl font-semibold tracking-tight text-[#19334c]">08:42</p>
                      <p className="mt-1 text-[10px] text-[#7e878d]">{isArabic ? "بدء الدوام" : "Workday started"}</p>
                    </div>
                    <div className="mb-1 flex items-center gap-1.5 rounded-full bg-[#e5eee5] px-2.5 py-1.5 text-[10px] font-semibold text-[#4d7052]">
                      <Check size={12} /> {t.present}
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e6e1d5]">
                    <div className="h-full w-[63%] rounded-full bg-[#b9954d]" />
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e9e5da] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#344b60]">{t.schedule}</p>
                    <CalendarDays size={15} className="text-[#a28448]" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-[#1c354d]">{t.shift}</p>
                  <p className="mt-1 text-[10px] text-[#87909a]">08:00 — 16:00</p>
                  <div className="mt-4 flex gap-1.5">
                    {[0, 1, 2, 3, 4].map((day, index) => (
                      <span key={day} className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] ${index === 1 ? "bg-[#142c45] text-[#fffdf7]" : "bg-[#f2f0e9] text-[#74808a]"}`}>
                        {isArabic ? ["ح", "ن", "ث", "ر", "خ"][index] : ["M", "T", "W", "T", "F"][index]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#142c45] p-4 text-[#fffdf7] sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#e7e1d3]">{t.payroll}</p>
                    <WalletCards size={15} className="text-[#e7c572]" />
                  </div>
                  <p className="mt-4 text-[11px] text-[#c0cbd2]">{t.organized}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-sm font-semibold">{t.week}</span>
                    <span className="h-7 w-7 rounded-full bg-[#e7c572]/15 p-1.5 text-[#e7c572]"><ArrowUp size={15} /></span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-xl border border-[#e9e5da] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0e7d3] text-[#80652f]"><FileText size={15} /></span>
                    <div>
                      <p className="text-xs font-semibold text-[#344b60]">{t.requestLabel}</p>
                      <p className="mt-0.5 text-[10px] text-[#899199]">{t.detailLabel}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f3eee1] px-2.5 py-1 text-[10px] font-medium text-[#80652f]">{t.requestStatus}</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 start-4 hidden items-center gap-3 rounded-2xl border border-[#e6e0d1] bg-[#fffefa] px-4 py-3 shadow-[0_14px_35px_-20px_rgba(20,44,69,.32)] sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5eee5] text-[#496d50]"><Check size={17} /></span>
              <div><p className="text-[10px] text-[#818a90]">{t.detailLabel}</p><p className="mt-0.5 text-xs font-semibold text-[#31485d]">{t.detailValue}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="bg-[#142c45] py-20 text-[#fffdf7] sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.19em] text-[#e2c275]">
                <span className="h-px w-8 bg-[#c8a958]" />{t.sectionEyebrow}
              </p>
              <h2 className="font-display max-w-xl text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{t.sectionTitle}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#c5cdd2] sm:text-base sm:leading-8">{t.sectionBody}</p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-4">
            {features.map(({ icon: Icon, title, body, tone }, index) => (
              <article key={title} className="group min-h-[205px] rounded-2xl border border-white/10 bg-white/[.045] p-5 transition-colors hover:bg-white/[.08] sm:p-6" data-testid={`card-capability-${index + 1}`}>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
                <h3 className="mt-7 text-base font-semibold text-[#fffdf7]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#c1cbd1]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="for-teams" className="relative py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute start-[-8rem] top-20 h-72 w-72 rounded-full bg-[#e9dfc7]/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-2xl">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.19em] text-[#98752d]">
              <span className="h-px w-8 bg-[#bd9a51]" />{isArabic ? "تجربة مشتركة" : "A shared experience"}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-[-.035em] text-[#142c45] sm:text-5xl">{isArabic ? "واضحة لكل دور في الفريق." : "Clear for every role on the team."}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
            <article className="relative overflow-hidden rounded-[1.7rem] bg-[#e9e3d4] p-7 sm:p-10">
              <div className="absolute -end-10 -top-12 h-44 w-44 rounded-full border border-[#c9b98f]/50" />
              <div className="absolute -end-2 -top-4 h-28 w-28 rounded-full border border-[#c9b98f]/50" />
              <p className="relative text-xs font-bold uppercase tracking-[.17em] text-[#8c6e31]">{t.employeeLabel}</p>
              <h3 className="relative mt-5 max-w-md font-display text-3xl font-semibold tracking-[-.03em] text-[#142c45] sm:text-4xl">{t.employeeTitle}</h3>
              <p className="relative mt-4 max-w-md text-sm leading-7 text-[#596673]">{t.employeeBody}</p>
              <ul className="relative mt-7 space-y-3">
                {t.employeesList.map((item) => <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#354b60]"><Check size={15} className="shrink-0 text-[#94722e]" />{item}</li>)}
              </ul>
            </article>
            <article className="relative overflow-hidden rounded-[1.7rem] bg-[#dfe8e5] p-7 sm:p-10">
              <div className="absolute -end-16 -bottom-24 h-64 w-64 rounded-full border border-[#b7c9c1]/70" />
              <div className="absolute -end-7 -bottom-16 h-44 w-44 rounded-full border border-[#b7c9c1]/70" />
              <p className="relative text-xs font-bold uppercase tracking-[.17em] text-[#42665a]">{t.adminLabel}</p>
              <h3 className="relative mt-5 max-w-md font-display text-3xl font-semibold tracking-[-.03em] text-[#142c45] sm:text-4xl">{t.adminTitle}</h3>
              <p className="relative mt-4 max-w-md text-sm leading-7 text-[#596a68]">{t.adminBody}</p>
              <ul className="relative mt-7 space-y-3">
                {t.adminList.map((item) => <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#354b60]"><Check size={15} className="shrink-0 text-[#416c5e]" />{item}</li>)}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#142c45]/10 bg-[#f0eee7] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
            <div>
              <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.19em] text-[#98752d]"><span className="h-px w-8 bg-[#bd9a51]" />{t.howEyebrow}</p>
              <h2 className="font-display max-w-md text-3xl font-semibold leading-tight tracking-[-.035em] text-[#142c45] sm:text-5xl">{t.howTitle}</h2>
            </div>
            <ol className="divide-y divide-[#142c45]/10">
              {t.steps.map(([title, body], index) => (
                <li key={title} className="grid grid-cols-[42px_1fr] gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[52px_1fr] sm:gap-6">
                  <span className="font-display text-sm font-semibold text-[#9a7938]">0{index + 1}</span>
                  <div>
                    <h3 className="text-base font-semibold text-[#20384f]">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#68737c]">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#ede7d9] py-20 sm:py-24">
        <div className="absolute inset-y-0 end-0 hidden w-[38%] bg-[#e5dcc7] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-12">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.19em] text-[#98752d]"><span className="h-px w-8 bg-[#bd9a51]" />{t.languageEyebrow}</p>
            <h2 className="font-display max-w-xl text-3xl font-semibold leading-tight tracking-[-.035em] text-[#142c45] sm:text-5xl">{t.languageTitle}</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#616d76] sm:text-base">{t.languageBody}</p>
          </div>
          <div className="relative flex min-h-52 items-center justify-center gap-3 sm:gap-5">
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-2xl border border-[#d3c7a9] bg-[#f8f5ed] shadow-[0_12px_35px_-22px_rgba(20,44,69,.3)] sm:h-40 sm:w-40">
              <span className="font-display text-4xl font-semibold text-[#142c45]">ع</span>
              <span className="mt-2 text-xs font-semibold text-[#6c7377]">العربية</span>
            </div>
            <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#b18a37] text-[#fffdf7] shadow-sm"><ChevronDown size={17} className="-rotate-90" /></div>
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-2xl border border-[#d3c7a9] bg-[#f8f5ed] shadow-[0_12px_35px_-22px_rgba(20,44,69,.3)] sm:h-40 sm:w-40">
              <span className="font-display text-4xl font-semibold text-[#142c45]">Aa</span>
              <span className="mt-2 text-xs font-semibold text-[#6c7377]">English</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#142c45] px-5 py-20 text-center text-[#fffdf7] sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.19em] text-[#e2c275]">{t.finalEyebrow}</p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#c5cdd2]">{t.finalBody}</p>
          <Link href="/login" className="group mt-8 inline-flex min-h-12 items-center gap-4 rounded-full bg-[#e2c275] px-6 text-sm font-semibold text-[#142c45] transition hover:bg-[#eed28c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2c275]" data-testid="link-sign-in-final">
            {t.signIn}
            <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#10243a] text-[#c6cdd1]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={`${siteName} logo`} className="h-8 max-w-[120px] object-contain brightness-0 invert" />
            <span className="text-xs text-[#aeb8bf]">{t.footerLine}</span>
          </div>
          <div className="flex items-center justify-between gap-5 text-xs">
            <span>{siteName}</span>
            <a href="#home" className="inline-flex items-center gap-2 font-medium text-[#e2c275] hover:text-[#f1d995]" data-testid="link-back-to-top">
              {t.backTop}<ArrowUp size={13} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
