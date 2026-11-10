import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, BadgeCheck, BarChart3, CalendarClock, Check, Fingerprint, Globe2, LockKeyhole, Menu, MousePointer2, ShieldCheck, Users, Wallet, X, MapPin, Clock3, Building2 } from "lucide-react";
import { useState } from "react";
import horizontalLogo from "@assets/file_0000000052c481f4a6f60006dda3c286_1787188042959.png";
import arabicLoginLogo from "@assets/file_000000001fc4820a8874d7fbcbaf001b_1787189698147.png";

const content = {
  ar: {
    nav: ["المميزات", "كيف يعمل", "الأمان", "عن النظام"],
    login: "دخول النظام",
    eyebrow: "إدارة موارد بشرية بمستوى جديد",
    title: "كل فريقك.\nفي مكان واحد.",
    desc: "من الحضور والانصراف إلى الرواتب وإدارة الموظفين — رؤية أوضح، قرارات أسرع، وتشغيل أكثر انضباطًا.",
    primary: "ابدأ من هنا — تسجيل الدخول",
    secondary: "اكتشف إمكانيات النظام",
    preview: "معاينة توضيحية للمنصة",
    live: "منصة موحدة لإدارة فريق العمل",
    modules: "كل ما تحتاجه لإدارة فريقك",
    modulesDesc: "أدوات مترابطة تمنحك تحكمًا كاملًا في دورة العمل اليومية.",
    items: [
      ["الحضور والانصراف", "متابعة الحضور وساعات العمل والحركات اليومية بوضوح.", "attendance"],
      ["إدارة الموظفين", "ملفات منظمة وبيانات وظيفية وصلاحيات حسب الدور.", "people"],
      ["الورديات والجداول", "تنظيم الورديات وتوزيع الموظفين ومتابعة الجداول.", "schedule"],
      ["الرواتب والاستحقاقات", "حسابات الرواتب والخصومات والإضافي في مكان واحد.", "payroll"],
      ["الفروع ومواقع العمل", "إدارة الفروع ومواقع العمل ومتابعة الحركة.", "locations"],
      ["التقارير والتحليلات", "صورة تشغيلية تساعدك على فهم الأداء واتخاذ القرار.", "reports"],
    ],
    workflow: "إدارة مترابطة، من أول يوم",
    workflowDesc: "ابدأ ببيانات موظفيك، نظّم جداول العمل، تابع الحضور، ثم راجع المستحقات والتقارير من مساحة واحدة.",
    steps: ["أضف الموظفين ونظّم بياناتهم", "حدّد الورديات ومواقع العمل", "تابع الحضور والطلبات اليومية", "راجع الرواتب والتقارير"],
    trust: "بياناتك في مساحة عمل آمنة",
    trustDesc: "صلاحيات حسب نوع الحساب، ومساحات عمل منفصلة للشركات، وأدوات لمتابعة العمليات.",
    cta: "جاهز تدير فريقك بصورة أوضح؟",
    ctaDesc: "ادخل إلى مساحة العمل وتابع كل التفاصيل من لوحة واحدة.",
    footer: "إدارة أذكى. تشغيل أكثر سلاسة.",
    previewLabel: "لوحة التحكم",
    today: "ملخص التشغيل",
    attendance: "الحضور",
    payroll: "الرواتب",
    requests: "الطلبات",
    employees: "الموظفون",
    branches: "الفروع",
    reports: "التقارير",
    language: "EN",
  },
  en: {
    nav: ["Features", "How it works", "Security", "About"],
    login: "Sign in",
    eyebrow: "A smarter way to manage people",
    title: "Your entire team.\nOne clear picture.",
    desc: "From attendance and shifts to payroll and employee records — bring everyday people operations into one connected workspace.",
    primary: "Open your workspace",
    secondary: "Explore the platform",
    preview: "Illustrative platform preview",
    live: "One connected workforce platform",
    modules: "Everything your team needs",
    modulesDesc: "Connected tools that bring clarity and control to everyday operations.",
    items: [
      ["Attendance & time", "Track attendance, working hours and daily movements.", "attendance"],
      ["Employee management", "Organized employee records, job details and role-based access.", "people"],
      ["Shifts & schedules", "Plan shifts, assign employees and manage working patterns.", "schedule"],
      ["Payroll & adjustments", "Keep payroll calculations, deductions and additions together.", "payroll"],
      ["Branches & locations", "Manage branches, workplaces and workforce movement.", "locations"],
      ["Reports & insights", "Understand operations with clear, useful reporting.", "reports"],
    ],
    workflow: "One connected workflow",
    workflowDesc: "Set up your people, organize schedules, follow attendance, then review payroll and reports in one place.",
    steps: ["Add employees and their details", "Set shifts and work locations", "Follow attendance and requests", "Review payroll and reports"],
    trust: "A secure space for your workforce",
    trustDesc: "Role-based access, separate company workspaces and tools to review operational activity.",
    cta: "Ready for a clearer way to manage your team?",
    ctaDesc: "Sign in to your workspace and bring the details together.",
    footer: "Better people operations start here.",
    previewLabel: "Workspace overview",
    today: "Operations snapshot",
    attendance: "Attendance",
    payroll: "Payroll",
    requests: "Requests",
    employees: "Employees",
    branches: "Branches",
    reports: "Reports",
    language: "ع",
  },
} as const;

const featureIcons = [Clock3, Users, CalendarClock, Wallet, MapPin, BarChart3];
const featureTones = ["gold", "blue", "violet", "green", "cyan", "rose"];

export default function PublicLandingPage({ onLogin, locale, onLocaleChange }: { onLogin: () => void; locale: "ar" | "en" | "fr" | "de"; onLocaleChange: (locale: "ar" | "en") => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isArabic = locale === "ar";
  const c = isArabic ? content.ar : content.en;
  const dir = isArabic ? "rtl" : "ltr";
  const login = () => { setMenuOpen(false); onLogin(); };
  const previewMetrics = [{ Icon: Users, label: c.employees }, { Icon: Clock3, label: c.attendance }, { Icon: Wallet, label: c.payroll }];
  const securityItems = [{ Icon: LockKeyhole, label: isArabic ? "وصول منظم" : "Controlled access" }, { Icon: Building2, label: isArabic ? "فصل مساحات الشركات" : "Company separation" }, { Icon: ShieldCheck, label: isArabic ? "متابعة العمليات" : "Operational oversight" }];
  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <main dir={dir} className="var-public min-h-screen overflow-hidden bg-[#f7f8fa] text-[#17202d]">
      <style>{`
        .var-public { font-family: inherit; }
        .var-public .gold-text { background:linear-gradient(110deg,#f4d77a,#d7a72b 58%,#f5df9a);-webkit-background-clip:text;background-clip:text;color:transparent; }
        .var-public .hero-grid { background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent 92%); }
        .var-public .glass { background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(18px); }
        .var-public .feature-card { transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease; }
        .var-public .feature-card:hover { transform:translateY(-5px);border-color:rgba(216,171,57,.5);box-shadow:0 22px 55px rgba(22,32,48,.09); }
        .var-public .gold-button { background:linear-gradient(135deg,#f3d77f,#d9ad3e);color:#171b22;box-shadow:0 10px 30px rgba(218,174,61,.22); }
        .var-public .gold-button:hover { filter:brightness(1.04);transform:translateY(-1px); }
        .var-public .tone-gold {background:#fff5d8;color:#a87913}.var-public .tone-blue{background:#e9f2ff;color:#3974c8}.var-public .tone-violet{background:#f0eaff;color:#7856c8}.var-public .tone-green{background:#e5f7ed;color:#268452}.var-public .tone-cyan{background:#e2f6f8;color:#238797}.var-public .tone-rose{background:#ffedf0;color:#c45c72}
        .var-public .float-card { animation:var-float 6s ease-in-out infinite; }
        @keyframes var-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @media(prefers-reduced-motion:reduce){.var-public *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
      `}</style>

      <header className="relative z-30 border-b border-white/10 bg-[#111923] text-white">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" aria-label="VAR HR home" className="flex items-center gap-3 rounded-xl bg-white px-3 py-1.5 shadow-sm transition hover:opacity-90">
            <img src={isArabic ? arabicLoginLogo : horizontalLogo} alt="VAR HR" className="h-11 w-auto max-w-[190px] object-contain" />
          </a>
          <nav className="hidden items-center gap-9 text-[13px] font-medium text-white/65 lg:flex">
            <button onClick={() => scrollTo("features")} className="transition hover:text-[#f0cf73]">{c.nav[0]}</button>
            <button onClick={() => scrollTo("workflow")} className="transition hover:text-[#f0cf73]">{c.nav[1]}</button>
            <button onClick={() => scrollTo("security")} className="transition hover:text-[#f0cf73]">{c.nav[2]}</button>
            <button onClick={() => scrollTo("about")} className="transition hover:text-[#f0cf73]">{c.nav[3]}</button>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={() => onLocaleChange(isArabic ? "en" : "ar")} className="rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/75 transition hover:border-[#dfb747] hover:text-[#f1d47c]">{c.language}</button>
            <button onClick={login} className="gold-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition">
              {c.login}{isArabic ? <ArrowLeft size={15}/> : <ArrowRight size={15}/>}
            </button>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={() => onLocaleChange(isArabic ? "en" : "ar")} className="rounded-full border border-white/20 px-3 py-2 text-xs">{c.language}</button>
            <button aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/15 p-2.5">{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
          </div>
        </div>
        {menuOpen && <div className="absolute inset-x-0 top-full border-t border-white/10 bg-[#111923] p-5 shadow-2xl sm:hidden">
          <div className="flex flex-col gap-4 text-sm text-white/80">
            <button onClick={() => scrollTo("features")} className="text-start">{c.nav[0]}</button>
            <button onClick={() => scrollTo("workflow")} className="text-start">{c.nav[1]}</button>
            <button onClick={() => scrollTo("security")} className="text-start">{c.nav[2]}</button>
            <button onClick={() => scrollTo("about")} className="text-start">{c.nav[3]}</button>
            <button onClick={login} className="gold-button rounded-xl px-4 py-3 font-bold">{c.login}</button>
          </div>
        </div>}
      </header>

      <section className="relative isolate overflow-hidden bg-[#111923] text-white">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70"/>
        <div className="pointer-events-none absolute -end-40 -top-48 h-[540px] w-[540px] rounded-full bg-[#c99b32]/15 blur-[110px]"/>
        <div className="pointer-events-none absolute -start-40 bottom-[-240px] h-[500px] w-[500px] rounded-full bg-[#3d6489]/20 blur-[100px]"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[.92fr_1.08fr] lg:gap-16 lg:pb-32 lg:pt-28">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dfb747]/25 bg-[#dfb747]/10 px-4 py-2 text-xs font-semibold text-[#f0d98f]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e6bd54] shadow-[0_0_12px_#e6bd54]"/>{c.eyebrow}
            </div>
            <h1 className="whitespace-pre-line text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[1.12] tracking-[-.045em]">{c.title.split("\n")[0]}<br/><span className="gold-text">{c.title.split("\n")[1]}</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/60 sm:text-lg">{c.desc}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={login} className="gold-button inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-7 text-sm font-extrabold transition">
                {c.primary}{isArabic ? <ArrowLeft size={17}/> : <ArrowRight size={17}/>}
              </button>
              <button onClick={() => scrollTo("features")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:bg-white/5">
                {c.secondary}{isArabic ? <ArrowLeft size={16}/> : <ArrowRight size={16}/>}
              </button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/45">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#e5c46b]"/> {isArabic ? "صلاحيات منظمة" : "Role-based access"}</span>
              <span className="inline-flex items-center gap-2"><Building2 size={15} className="text-[#e5c46b]"/> {isArabic ? "مساحات عمل للشركات" : "Company workspaces"}</span>
              <span className="inline-flex items-center gap-2"><Globe2 size={15} className="text-[#e5c46b]"/> {isArabic ? "عربي وإنجليزي" : "Arabic & English"}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] lg:me-0">
            <div className="absolute -inset-8 rounded-[40px] bg-[#d8ad43]/10 blur-3xl"/>
            <div className="relative rounded-[26px] border border-white/15 bg-[#202b39] p-2 shadow-[0_35px_100px_rgba(0,0,0,.45)] sm:rounded-[30px] sm:p-3">
              <div className="overflow-hidden rounded-[19px] bg-[#f5f7fa] text-[#17202d]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#17202d] text-[#e7c66d]"><BarChart3 size={17}/></div><div><div className="text-[11px] font-extrabold tracking-wide">VAR HR</div><div className="text-[9px] text-slate-400">{c.previewLabel}</div></div></div>
                  <div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">{isArabic ? "مساحة العمل" : "Workspace"}</span><div className="h-7 w-7 rounded-full bg-[#e9d9ad]"/></div>
                </div>
                <div className="grid min-h-[320px] grid-cols-[76px_1fr] sm:grid-cols-[112px_1fr]">
                  <aside className="bg-[#17202d] px-2 py-4 text-white sm:px-3">
                    <div className="mb-5 flex justify-center"><div className="h-7 w-7 rounded-lg border border-[#e0b64a]/40 bg-[#e0b64a]/15"/></div>
                    {[Users, Clock3, CalendarClock, Wallet, BarChart3].map((Icon,i)=><div key={i} className={`mb-2 flex items-center gap-2 rounded-lg px-2 py-2.5 ${i===0?"bg-white/10 text-[#f0d17a]":"text-white/45"}`}><Icon size={14}/><span className="hidden text-[9px] sm:inline">{[c.employees,c.attendance,c.requests,c.payroll,c.reports][i]}</span></div>)}
                  </aside>
                  <div className="min-w-0 p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-2"><div><div className="text-[9px] font-semibold text-slate-400">{c.live}</div><div className="mt-1 text-sm font-extrabold sm:text-lg">{c.today}</div></div><div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[8px] text-slate-500">{isArabic ? "اليوم" : "Today"}⌄</div></div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {previewMetrics.map(({Icon,label},i)=><div key={i} className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-medium text-slate-400">{label}</span><span className="text-[#bd9230]"><Icon size={13}/></span></div><div className="mt-2 text-lg font-black text-slate-800">—</div><div className="mt-1 h-1 w-full rounded-full bg-slate-100"><div className={`h-1 rounded-full ${i===0?"w-3/4":i===1?"w-1/2":"w-2/3"} bg-[#d9b34e]`}/></div></div>)}
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold">{isArabic ? "نظرة على الحضور" : "Attendance overview"}</span><span className="text-[8px] text-slate-400">{isArabic ? "عرض توضيحي" : "Illustrative view"}</span></div>
                      <div className="flex h-[88px] items-end gap-2 border-b border-slate-100 px-1">{[38,56,48,72,62,86,68,92,60,78,52,82].map((h,i)=><div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#b98d2c] to-[#f0d783]" style={{height:`${h}%`,opacity:.55+i*.035}}/>)}</div>
                      <div className="mt-2 flex justify-between text-[8px] text-slate-400"><span>{isArabic ? "الأسبوع الماضي" : "Last week"}</span><span>{isArabic ? "هذا الأسبوع" : "This week"}</span></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="text-[9px] font-bold">{c.branches}</div><div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400"><Building2 size={12}/> {isArabic ? "إدارة مواقع متعددة" : "Multi-location view"}</div></div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="text-[9px] font-bold">{c.requests}</div><div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400"><Check size={12}/> {isArabic ? "متابعة ومراجعة" : "Review and follow up"}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-card glass absolute -bottom-7 -start-5 hidden items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl sm:flex">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e1b94f]/15 text-[#f0d17a]"><Fingerprint size={20}/></div>
              <div><div className="text-xs font-bold">{isArabic ? "إدارة الحضور" : "Attendance control"}</div><div className="mt-1 text-[10px] text-white/50">{isArabic ? "سجل واضح ومتابعة منظمة" : "Clear records, organized follow-up"}</div></div>
            </div>
            <div className="float-card glass absolute -end-3 -top-6 hidden items-center gap-2 rounded-xl px-3 py-2.5 text-white shadow-xl sm:flex" style={{animationDelay:"-3s"}}>
              <BadgeCheck className="text-[#e9ca75]" size={17}/><span className="text-[10px] font-semibold">{isArabic ? "مساحة عمل موحدة" : "One connected workspace"}</span>
            </div>
          </div>
        </div>
        <div className="relative mx-auto -mt-8 max-w-7xl px-5 pb-10 sm:px-8">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[.045] p-4 sm:grid-cols-4 sm:p-5">
            {[["01",c.employees],["02",c.attendance],["03",c.payroll],["04",c.reports]].map(([n,label])=><div key={n} className="flex items-center gap-3 px-2 py-2"><span className="text-xs font-black text-[#dfb747]">{n}</span><span className="text-xs font-semibold text-white/70">{label}</span></div>)}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#b78b2d]">{isArabic ? "منصة متكاملة" : "One complete platform"}</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#17202d] sm:text-5xl">{c.modules}</h2>
          <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">{c.modulesDesc}</p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((item,i)=>{const title=item[0];const desc=item[1];const Icon=featureIcons[i];return <article key={title} className="feature-card rounded-[22px] border border-slate-200/80 bg-white p-6 sm:p-7"><div className={`tone-${featureTones[i]} grid h-12 w-12 place-items-center rounded-2xl`}><Icon size={22}/></div><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p><div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-[#a77c25]">{isArabic?"جزء من مساحة عمل واحدة":"Part of one workspace"}<span>↗</span></div></article>})}
        </div>
      </section>

      <section id="workflow" className="scroll-mt-20 border-y border-slate-200/70 bg-white py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div><div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#b78b2d]">{isArabic?"سير عمل واضح":"A clearer workflow"}</div><h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{c.workflow}</h2><p className="mt-5 max-w-xl text-sm leading-8 text-slate-500 sm:text-base">{c.workflowDesc}</p><button onClick={login} className="gold-button mt-8 inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-sm font-extrabold transition">{c.login}{isArabic?<ArrowLeft size={16}/>:<ArrowRight size={16}/>}</button></div>
          <div className="relative"><div className="absolute bottom-8 top-8 start-[27px] w-px bg-gradient-to-b from-[#d9b34e] via-slate-200 to-transparent sm:start-[31px]"/><div className="space-y-4">{c.steps.map((step,i)=><div key={step} className="relative flex items-center gap-5 rounded-2xl border border-slate-200 bg-[#fafbfc] p-5 sm:p-6"><div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#e5d4a4] bg-white text-sm font-black text-[#ad8127] shadow-sm">{String(i+1).padStart(2,"0")}</div><div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{isArabic?"الخطوة":"STEP"} 0{i+1}</div><div className="mt-1 text-sm font-extrabold sm:text-base">{step}</div></div><div className="ms-auto text-slate-300">{isArabic?<ArrowUpLeft size={18}/>:<ArrowUpRight size={18}/>}</div></div>)}</div></div>
        </div>
      </section>

      <section id="security" className="scroll-mt-20 bg-[#111923] py-20 text-white lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e4c36c]">{isArabic?"الثقة والتحكم":"Trust & control"}</div><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{c.trust}</h2><p className="mt-5 text-sm leading-8 text-white/55">{c.trustDesc}</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {securityItems.map(({Icon,label},i)=><div key={i} className="glass rounded-2xl p-5"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#e1b94f]/15 text-[#f0d17a]"><Icon size={20}/></div><div className="text-sm font-bold">{label as string}</div></div>)}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-24 sm:px-8 lg:py-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[30px] bg-[#202b39] px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(23,32,45,.16)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -end-20 -top-36 h-80 w-80 rounded-full bg-[#d7aa3d]/20 blur-[90px]"/>
          <div className="relative mx-auto max-w-3xl"><div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-[#e1b94f]/25 bg-[#e1b94f]/10 text-[#f0d17a]"><MousePointer2 size={23}/></div><h2 className="text-3xl font-black leading-tight sm:text-5xl">{c.cta}</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">{c.ctaDesc}</p><button onClick={login} className="gold-button mt-9 inline-flex min-h-14 items-center gap-3 rounded-2xl px-8 text-sm font-extrabold transition">{c.login}{isArabic?<ArrowLeft size={17}/>:<ArrowRight size={17}/>}</button></div>
        </div>
      </section>

      <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#101923] text-white">
        <div className="pointer-events-none absolute -top-28 end-1/4 h-64 w-64 rounded-full bg-[#d7aa3d]/10 blur-[100px]"/>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16 md:py-14" dir={dir}>
          <div className="max-w-md">
            <a href="/" aria-label="VAR HR home" className="inline-flex rounded-xl bg-white px-3 py-2 transition-opacity hover:opacity-85">
              <img src={isArabic ? arabicLoginLogo : horizontalLogo} alt="VAR HR" className="h-10 w-auto max-w-[175px] object-contain"/>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300/70">{isArabic ? "منصة متكاملة لتنظيم وإدارة الموارد البشرية، ومتابعة فريق العمل من الحضور وحتى الرواتب." : "A connected platform to organize workforce operations, from attendance to payroll."}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d7aa3d]/25 bg-[#d7aa3d]/10 px-3 py-2 text-xs font-semibold text-[#f0d17a]"><ShieldCheck size={15}/>{isArabic ? "إدارة أوضح. قرارات أفضل." : "Clearer management. Better decisions."}</div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-white">{isArabic ? "استكشف المنصة" : "Explore"}</h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-300/70">
              <a href="#features" className="transition-colors hover:text-[#f0d17a]">{isArabic ? "المميزات" : "Features"}</a>
              <a href="#workflow" className="transition-colors hover:text-[#f0d17a]">{isArabic ? "كيف يعمل النظام" : "How it works"}</a>
              <a href="#security" className="transition-colors hover:text-[#f0d17a]">{isArabic ? "الأمان" : "Security"}</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-white">{isArabic ? "ابدأ الآن" : "Get started"}</h3>
            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300/70">{isArabic ? "اكتشف طريقة أكثر تنظيمًا لإدارة فريقك ومتابعة تفاصيل العمل اليومية." : "Discover a more organized way to manage your team and daily operations."}</p>
            <button onClick={login} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f0d17a] transition hover:text-white">{c.login}{isArabic?<ArrowLeft size={16}/>:<ArrowRight size={16}/>}</button>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/15 px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center">
            <p className="text-xs font-medium text-slate-400">{isArabic ? "جميع الحقوق محفوظة لـ VAR HR" : "All rights reserved to VAR HR"}</p>
            <p className="text-sm font-bold tracking-wide text-[#f0d17a]">{isArabic ? "صُنع بـ ❤️ في مصر" : "Made with ❤️ in Egypt"}</p>
          </div>
        </div>
      </footer>>
    </main>
  );
}
