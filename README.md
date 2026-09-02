# VAR HR

VAR HR هو نظام متعدد اللغات والمستأجرين لإدارة عمليات الموارد البشرية. يوفّر
مساحة عمل للشركات والمنصة لإدارة الموظفين، الأقسام، الفروع، الحضور
والانصراف، الإجازات، الأذونات، أساسيات الرواتب، الأجهزة الحيوية، التقارير
والاشتراكات، مع دعم واجهات RTL وLTR.

> **حالة المشروع:** هذه النسخة تحتوي على أساس تشغيلي متقدم ويمكن تشغيلها على
> Replit. راجع [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) لمعرفة ما تم
> التحقق منه والفجوات التي يجب تنفيذها قبل اعتبار النظام Production-ready
> بالكامل.

## الفكرة الأساسية

يعتمد النظام على عزل بيانات الشركات (multi-tenancy) داخل PostgreSQL. يحدد
السياق الحالي من جلسة المستخدم على الخادم، ثم يطبق الدور والصلاحيات قبل
الوصول إلى بيانات الشركة. الواجهة React/Vite تستهلك عقد OpenAPI مولدة إلى
React Query hooks وZod schemas، بينما ينفذ Express API قواعد العمل وعمليات
قاعدة البيانات.

## الميزات الموجودة حاليًا

- إدارة الشركات والمنصة والاشتراكات وحدود عدد الموظفين.
- إدارة الموظفين مع الإنشاء، القراءة، التعديل، الحذف، الاستيراد، والملف
  الوظيفي الإضافي.
- إدارة الأقسام والفروع والجداول الزمنية والعطلات.
- تسجيل الحضور والانصراف، تصحيح السجلات، التسويات، قواعد الحضور، وسجل
  تغييرات القواعد.
- طلبات الإجازات والأذونات، أرصدة الإجازات، وسياسة الإجازات وسجل الحركات.
- أساسيات الرواتب: دورات وفترات الرواتب، التعيينات، الحسابات، التعديلات
  والاعتماد النهائي.
- تكامل أجهزة البصمة عبر طبقة provider-neutral، مع نقاط ZKTeco ADMS وسجل
  المزامنة والربط بين رقم الجهاز والموظف.
- تقارير الحضور والتقارير التشغيلية ولوحة مؤشرات وبيانات تنبيهات مشتقة.
- Authentication بجلسات مخزنة في PostgreSQL، كلمات مرور hashed باستخدام
  `scrypt`، وHttpOnly cookies، وسجل أحداث المصادقة.
- أدوار `platform_owner` و`company_owner` و`manager` و`employee` مع منح
  صلاحيات صريحة لحسابات الموظفين.
- واجهة متعددة اللغات (منها العربية) ومتجاوبة مبنية بمكونات React وRadix UI.

## التقنية والبنية

| الطبقة | التقنية |
| --- | --- |
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS + Wouter |
| API | Express 5 + TypeScript + Pino |
| Database | PostgreSQL + Drizzle ORM |
| Contract | OpenAPI 3.1 في `lib/api-spec/openapi.yaml` |
| Validation | Zod / drizzle-zod |
| Client generation | Orval + React Query |
| Workspace | pnpm workspaces |
| Runtime | Node.js 20/24 بحسب بيئة Replit |

## المتطلبات

- Node.js متوافق مع إعداد Replit الحالي.
- pnpm 10 أو أحدث.
- PostgreSQL، أو قاعدة Replit المُدارة.
- `DATABASE_URL` في بيئة التشغيل. `SESSION_SECRET` موجود كمتغير محجوز في
  القالب لكنه غير مستخدم حاليًا من implementation الجلسات.

انسخ `.env.example` كمرجع للمتغيرات. لا تضع الأسرار في Git أو في ملفات
الواجهة الأمامية.

## التثبيت والتشغيل محليًا

```bash
pnpm install --frozen-lockfile

# تحقق من الأنواع
pnpm run typecheck

# شغّل فحص/تطبيق مخطط قاعدة البيانات في بيئة التطوير
pnpm --filter @workspace/db run push

# نافذة 1: API
PORT=8080 NODE_ENV=development \
  pnpm --filter @workspace/api-server run dev

# نافذة 2: Frontend
PORT=22077 BASE_PATH=/ \
  pnpm --filter @workspace/var-hr run dev
```

لـ component preview شغّل:

```bash
PORT=8081 BASE_PATH=/__mockup \
  pnpm --filter @workspace/mockup-sandbox run dev
```

في Replit يفضّل استخدام الـworkflows المُدارة بدل تشغيل أوامر بديلة، لأنها
تحقن `PORT` و`BASE_PATH` وتربط المسارات التالية:

- `/` — واجهة VAR HR.
- `/api` — API Server.
- `/__mockup` — Component Preview Server.

## أوامر مهمة

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-server test
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/var-hr run build
```

`pnpm run build` من جذر المستودع يحتاج متغيرات `PORT` و`BASE_PATH` لأن إعدادات
Vite تتحقق منهما عند تحميل configuration. في Replit يتولى workflow ذلك. عند
التشغيل اليدوي استخدم متغيرات كل artifact كما في الأوامر أعلاه.

## توثيق API

مصدر العقد هو [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)، ويضم
حاليًا 88 مسارًا و121 عملية موصوفة. الملفات المولدة موجودة في:

- `lib/api-client-react/src/generated` — React Query client hooks.
- `lib/api-zod/src/generated` — مخططات Zod وأنواع الاستجابة.

بعد تعديل OpenAPI لا تعدّل الملفات المولدة يدويًا؛ شغّل:

```bash
pnpm --filter @workspace/api-spec run codegen
```

تستخدم الاستجابات الحالية غالبًا JSON مباشرًا (كائن أو مصفوفة)، مع `{ error,
code }` للأخطاء. توحيد envelope وmetadata الخاصة بالـpagination من الفجوات
المقترحة للمرحلة التالية.

دليل Phase 2 الخاص بـ Web Push والإشعارات موجود في
[`docs/WEB_PUSH.md`](docs/WEB_PUSH.md)، ويشرح توليد VAPID keys وإعداد الأسرار
وأمثلة curl والاستجابات والأخطاء المتوقعة.

## قاعدة البيانات وERD

مخطط Drizzle موزع في `lib/db/src/schema/` ويحتوي على 40 جدولًا فعليًا، بما
في ذلك `var_hr_notifications` و`var_hr_notification_subscriptions`. يوجد وصف
بصري للعلاقات الحالية في [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md).
يوجد baseline migration مولد في `lib/db/migrations/0000_same_stryfe.sql`.
لأن قاعدة التطوير الحالية أُنشئت سابقًا بواسطة `push` دون سجل migrations،
يستمر تطبيق التغييرات عليها عبر `drizzle-kit push` غير القسري؛ استخدم baseline
مع قاعدة جديدة فقط ولا تستخدم `push-force` على بيانات حقيقية.

## شرح المجلدات الرئيسية

| المجلد | المسؤولية |
| --- | --- |
| `artifacts/var-hr` | تطبيق الواجهة الرئيسي، routing، شاشات HR، الترجمة، الثيم والمكونات |
| `artifacts/api-server` | خادم Express، routes المصادقة والمنصة وHR والنسخ والأجهزة |
| `artifacts/api-server/src/lib` | المصادقة، سياق المستأجر، التسجيل، الترجمة، النسخ ومزود الأجهزة |
| `artifacts/api-server/tests` | اختبارات Node.js الحالية لقواعد الأعمال والصلاحيات والمزامنة |
| `lib/db` | اتصال PostgreSQL، إعداد Drizzle، ومخططات الجداول |
| `lib/db/src/schema` | مخططات المؤسسة، العمليات، الرواتب، الجداول، المصادقة، الأجهزة والنسخ |
| `lib/api-spec` | عقد OpenAPI وإعداد Orval لإعادة التوليد |
| `lib/api-client-react` | عميل React Query مولد من OpenAPI |
| `lib/api-zod` | schemas وأنواع Zod مولدة من OpenAPI |
| `artifacts/mockup-sandbox` | خادم معاينة مكونات التصميم على Canvas |
| `scripts` | أدوات TypeScript المساعدة والموصل المحلي للأجهزة |
| `.replit` و`*.replit-artifact` | إعداد Replit والـartifact workflows ومسارات المعاينة |
| `attached_assets` | الشعارات والأصول المرئية المستخدمة في الواجهة |
| `screenshots` | لقطات تحقق أو تصميم محفوظة للمشروع |
| `hand-off` | مواد التسليم والسياق التاريخي المستورد؛ ليست نقطة تشغيل |

توجد أيضًا مجلدات `*-Var-Hr-System-main` وملفات رقمية في جذر المشروع تبدو
لقطات/نسخ مستوردة قديمة. لا تعتمد عليها في التشغيل؛ المصدر الحالي هو
`artifacts/` و`lib/` و`scripts/`.

## الأمان

- جلسات الخادم مخزنة في قاعدة البيانات مع token hash، مدة صلاحية، وتجديد
  `lastSeenAt`.
- ملفات الارتباط HttpOnly وSameSite=Lax، وتستخدم Secure في production.
- كلمات المرور لا تحفظ كنص صريح؛ تستخدم `scrypt` مع salt.
- التحقق من المدخلات موجود في الـroutes المهمة عبر Zod.
- سياق الشركة يحل على الخادم، ولا ينبغي الوثوق بمعرّف شركة يرسله العميل.
- توجد صلاحيات على مستوى الحساب، وسجلات تدقيق للعمليات وأحداث المصادقة.

قبل production يجب إضافة rate limiting، سياسة CORS صريحة، security headers،
سياسة تدوير/إدارة مفاتيح واضحة، واختبارات أمنية آلية.

## المساهمة

1. أنشئ فرعًا يصف التغيير.
2. حافظ على contract-first workflow: عدّل OpenAPI أولًا عند تغيير API ثم شغّل
   codegen.
3. حافظ على عزل المستأجرين ولا تمرر `companyId` من العميل كمصدر ثقة.
4. أضف أو حدّث الاختبارات مع كل تغيير في قاعدة عمل حرجة.
5. شغّل `pnpm run typecheck` وbuild والاختبارات المتاحة.
6. استخدم commit message واضحًا بصيغة فعلية، مثل:
   `feat(payroll): add effective-dated allowance rules`.
7. افتح Pull Request يشرح المشكلة، الحل، اختبارات التحقق، وأي migration أو
   متغيرات بيئية مطلوبة.

## خارطة الطريق المختصرة

تم تنفيذ Phase 1 وPhase 2 من نظام الإشعارات: المخطط، اشتراكات الأجهزة، حفظ
السجل، وWeb Push من الخادم. المرحلة التالية المقترحة هي Phase 3: Service
Worker وواجهة الإشعارات في React وربطها بأحداث HR، مع إضافة rate limiting
وsecurity headers واختبارات API المتكاملة وDocker/CI/CD قبل النشر الإنتاجي.