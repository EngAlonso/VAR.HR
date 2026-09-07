# إعداد VAR HR على Replit

هذا الملف يشرح تشغيل النسخة الحالية على Replit دون تغيير بنية المشروع.

## 1. تثبيت الاعتماديات

من Shell في جذر المشروع:

```bash
pnpm install --frozen-lockfile
```

يستخدم المشروع `pnpm-lock.yaml`، لذلك لا تستخدم `npm install` أو `yarn
install`. إذا ظهرت مشكلة في lockfile، أصلح سببها أولًا ولا تحذف lockfile
للتغلب على المشكلة.

## 2. قاعدة البيانات

1. فعّل PostgreSQL المُدار للمشروع.
2. تأكد من وجود `DATABASE_URL` كمتغير runtime مُدار؛ لا تنشئه يدويًا.
3. طبّق المخطط التطويري:

   ```bash
   pnpm --filter @workspace/db run push
   ```

4. خادم API يعيد تنفيذ فحص `push` غير القسري عند الإقلاع، لذلك لا توجد حاجة
   إلى `push-force`.

يوجد baseline migration مولد في `lib/db/migrations/0000_same_stryfe.sql`.
استخدمه عند إنشاء قاعدة جديدة عبر `pnpm --filter @workspace/db run migrate`.
أما قاعدة التطوير الحالية التي لم يكن لها migration history من قبل، فطبّق
التحديثات عبر `pnpm --filter @workspace/db run push` كما هو موضح أعلاه؛ لا
تشغّل baseline عليها لأنه سيحاول إنشاء الجداول الموجودة مسبقًا.

لا تستخدم `push-force` على قاعدة بها بيانات مهمة. قبل production يجب استبدال
التدفق الحالي بـSQL migrations مراجعة وقابلة للرجوع.

## 3. الأسرار والمتغيرات

أضف `SESSION_SECRET` إلى Replit Secrets، ولا تضع قيمته في Git أو في الدردشة.
`DATABASE_URL` يُدار بواسطة Replit. راجع `.env.example` للقيم الاختيارية:

- `NODE_ENV` — يحدد سلوك production مثل Secure cookies.
- `LOG_LEVEL` — مستوى Pino logging.
- `VAR_HR_ENABLE_INITIAL_PROVISIONING` — يفتح bootstrap الأولي فقط في بيئة
  تطوير مضبوطة؛ أبقه `false` في production.
- `ZKTECO_ADMS_ALLOW_UNAUTHENTICATED` — يجب أن يبقى `false` حتى لا تقبل
  أجهزة ADMS دون مفتاح تسجيل.
- `VAPID_SUBJECT` و`VAPID_PUBLIC_KEY` و`VAPID_PRIVATE_KEY` — مطلوبة لإرسال
  Web Push في Phase 2. ولّدها بالأمر الموثق في
  [`docs/WEB_PUSH.md`](docs/WEB_PUSH.md)، ثم خزّنها في Replit Secrets أو ملف
  `.env` محلي غير متتبع.

لا تضبط `PORT` أو `BASE_PATH` يدويًا داخل workflow المُدار؛ Replit يحقنهما
من artifact metadata.

## 4. الـworkflows الصحيحة

استخدم الخدمات المُدارة التالية:

| Workflow | الوظيفة | المنفذ |
| --- | --- | --- |
| `artifacts/var-hr: web` | واجهة VAR HR | 22077 |
| `artifacts/api-server: API Server` | Express API و`/iclock` | 8080 |
| `artifacts/mockup-sandbox: Component Preview Server` | معاينة Canvas | 8081 |

شغّل أو أعد تشغيل workflow من واجهة Replit. لا تنشئ workflow بديلًا لنفس
الخدمة، لأن ذلك قد يسبب `EADDRINUSE`.

## 5. التحقق من التشغيل

بعد الإقلاع:

```bash
pnpm run typecheck
PORT=22077 BASE_PATH=/ pnpm --filter @workspace/var-hr run build
PORT=8081 BASE_PATH=/__mockup pnpm --filter @workspace/mockup-sandbox run build
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server test
```

تحقق من endpoint الصحة عبر مسار API في المعاينة:

```bash
curl -i "$REPLIT_DEV_DOMAIN/api/healthz"
```

يجب أن تعرض الواجهة شاشة تسجيل الدخول. طلب `401` إلى `/api/auth/me` قبل
تسجيل الدخول متوقع، وليس فشلًا في تحميل الواجهة.

## 6. تهيئة حساب Platform Owner

في بيئة تطوير جديدة فقط، يمكن فتح bootstrap الأولي مؤقتًا:

```text
VAR_HR_ENABLE_INITIAL_PROVISIONING=true
NODE_ENV=development
```

بعد إنشاء الحساب الأول، أعد المتغير إلى `false` وأعد تشغيل API. لا تستخدم
بيانات اعتماد تجريبية في production.

## 7. مشاكل شائعة

### `PORT environment variable is required`

أنت تشغّل Vite خارج workflow. مرّر `PORT` و`BASE_PATH` كما في أوامر build
أعلاه أو استخدم workflow Replit.

### `EADDRINUSE`

يوجد process قديم على المنفذ. افحصه أولًا:

```bash
ps -eo pid,ppid,etime,args | grep -E 'vite|dist/index.mjs' | grep -v grep
```

أوقف فقط process VAR HR المؤكد، ثم أعد تشغيل workflow المُدار. لا تغيّر
المنافذ في artifact metadata لتجاوز عملية قديمة.

### فشل API أثناء `drizzle-kit push`

تحقق من أن PostgreSQL مفعّل وأن `DATABASE_URL` موجود كـruntime-managed
variable. لا تعرض قيمة الرابط في السجلات أو تضعها داخل README.

### فشل اختبار واحد خاص بالواجهة

شغّل:

```bash
pnpm --filter @workspace/api-server test
```

ثم راجع اسم الاختبار والملف المشار إليه. الاختبارات الحالية تحتوي على اختبار
يتحقق من نمط نصي داخل `App.tsx`؛ هذا النوع قد يصبح stale بعد refactor آمن
حتى لو بقي السلوك صحيحًا، ويجب تحديثه ليختبر السلوك بدل النص الداخلي.

## 8. ما قبل النشر

لا تعتبر النسخة production-ready بالكامل قبل:

- تحويل `drizzle-kit push` إلى migrations مراجعة.
- إضافة rate limiting وsecurity headers وCORS allowlist.
- إضافة اختبارات API integration واختبارات الواجهة الحرجة.
- إضافة Docker/CI حسب بيئة النشر المستهدفة.
- إضافة Service Worker وواجهة notifications وربط الإشعارات بأحداث HR في
  Phase 3؛ Backend API وWeb Push Service متاحان الآن.
- تقليل حجم bundle عبر تقسيم `App.tsx` وdynamic imports.