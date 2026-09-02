# VAR HR — Web Push Notifications (Phase 2)

هذا المستند يشرح طبقة الخادم التي تعتمد على جداول Phase 1:

- `var_hr_notifications` لحفظ سجل الإشعارات.
- `var_hr_notification_subscriptions` لحفظ اشتراكات الأجهزة.

تم تنفيذ API وWeb Push Service فقط. لم يتم تنفيذ Service Worker أو واجهة
الإشعارات في React بعد؛ وهذا جزء من Phase 3.

## 1. تثبيت الاعتماديات

الحزم مضافة إلى workspace الخاص بالخادم:

```bash
pnpm --filter @workspace/api-server add web-push dotenv
pnpm --filter @workspace/api-server add -D @types/web-push
```

يتم تحميل ملف `.env` تلقائيًا بواسطة `dotenv/config` عند تشغيل API. في Replit
يفضل حفظ القيم في Secrets بدل ملف على القرص.

## 2. توليد VAPID keys

ولّد زوجًا واحدًا لكل بيئة واحتفظ بهما دائمًا؛ لا تعِد توليد المفاتيح في كل
تشغيل لأن الاشتراكات الحالية ستتوقف عن العمل:

```bash
pnpm --filter @workspace/api-server exec web-push generate-vapid-keys
```

أضف القيم إلى `.env` المحلي في جذر المشروع، أو إلى Replit Secrets:

```dotenv
VAPID_SUBJECT=mailto:admin@example.com
VAPID_PUBLIC_KEY=<public-key-from-command>
VAPID_PRIVATE_KEY=<private-key-from-command>
```

`VAPID_PRIVATE_KEY` سر لا يوضع في Git أو في curl أو في السجلات. يمكن اعتبار
`VAPID_PUBLIC_KEY` قيمة عامة للواجهة في Phase 3، لكن إبقاء الثلاثة في Secrets
يبسط إدارة البيئات. إذا لم تكن القيم موجودة، تظل عمليات الحفظ والاشتراك
والقراءة متاحة، بينما يعيد endpoint الإرسال `503 WEB_PUSH_NOT_CONFIGURED`.

## 3. المصادقة ونطاق الشركة

المشروع يستخدم جلسة HttpOnly cookie باسم `var_hr_session`. يجب تسجيل الدخول
أولًا، ثم إرسال cookie في الطلبات. لا تقبل المسارات `companyId` أو `userId` من
body؛ يتم اشتقاقهما من جلسة الحساب وسياق المستأجر:

- `companyId` من الشركة النشطة في `getTenantContext`.
- `userId` من `context.accountId` المرتبط بـ`var_hr_user_accounts`.

حساب `platform_owner` يحتاج إلى header باسم `x-var-tenant` عند العمل داخل شركة
محددة. endpoint الإرسال اليدوي مقيد بـ`company_owner` و`platform_owner`، ويرسل
إلى حساب المرسل نفسه فقط.

## 4. أمثلة curl

استبدل `BASE_URL` بعنوان API في بيئتك. للتجربة المحلية:

```bash
BASE_URL=http://localhost:8080
```

### تسجيل الدخول وحفظ cookie

```bash
curl -i -c cookies.txt -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"OWNER_USERNAME","password":"OWNER_PASSWORD"}'
```

لا تضع كلمة المرور في Git أو في سجل shell المشترك.

### `POST /api/notifications/subscribe`

```bash
curl -i -b cookies.txt -X POST "$BASE_URL/api/notifications/subscribe" \
  -H 'Content-Type: application/json' \
  -d '{
    "endpoint":"https://push.example.test/subscription/abc",
    "auth":"browser-auth-secret",
    "p256dh":"browser-public-key",
    "userAgent":"Chrome"
  }'
```

الاستجابة الناجحة `201` وتعيد `subscription.id` وendpoint ووقت الإنشاء. إرسال
نفس endpoint للحساب نفسه يحدث بيانات المفاتيح بدل إنشاء سجل مكرر. endpoint
مسجل لحساب أو شركة أخرى يعيد `409 NOTIFICATION_SUBSCRIPTION_CONFLICT`.

### `POST /api/notifications/unsubscribe`

```bash
curl -i -b cookies.txt -X POST "$BASE_URL/api/notifications/unsubscribe" \
  -H 'Content-Type: application/json' \
  -d '{"endpoint":"https://push.example.test/subscription/abc"}'
```

يعيد `200` عند الحذف و`404` إذا لم يوجد endpoint داخل نطاق الحساب والشركة.

### `GET /api/notifications`

```bash
curl -i -b cookies.txt \
  "$BASE_URL/api/notifications?page=1&pageSize=20"
```

الاستجابة:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0,
  "totalPages": 0
}
```

الحد الأقصى لـ`pageSize` هو 100، والترتيب من الأحدث إلى الأقدم.

### `PATCH /api/notifications/:id/read`

```bash
curl -i -b cookies.txt -X PATCH \
  "$BASE_URL/api/notifications/NOTIFICATION_UUID/read" \
  -H 'Content-Type: application/json' \
  -d '{"isRead":true}'
```

حقل `isRead` اختياري وقيمته الافتراضية `true`. يعيد endpoint `404` إذا كان
الإشعار موجودًا لشركة أو مستخدم آخر، ولا يكشف وجوده خارج النطاق.

### `POST /api/notifications/send`

هذا endpoint مخصص للاختبار اليدوي، ويتطلب حساب مالك الشركة. يحفظ الإشعار
أولًا ثم يحاول إرساله إلى جميع اشتراكات الحساب:

```bash
curl -i -b cookies.txt -X POST "$BASE_URL/api/notifications/send" \
  -H 'Content-Type: application/json' \
  -d '{
    "type":"test",
    "title":"VAR HR test",
    "message":"Web Push is configured.",
    "tag":"var-hr-test",
    "icon":"/icons/notification-192.png",
    "badge":"/icons/badge-72.png",
    "data":{"screen":"/notifications","referenceId":"demo-1"}
  }'
```

تدعم البيانات `type`, `title`, `message`, `data`, `icon`, `badge`, و`tag`.
تُحفظ البيانات الإضافية في عمود `data` وتُرسل في payload نفسه.

الاستجابة تتضمن:

```json
{
  "notification": {
    "id": "notification-uuid",
    "companyId": "company-uuid",
    "userId": "account-uuid",
    "type": "test",
    "title": "VAR HR test",
    "message": "Web Push is configured.",
    "data": {},
    "isRead": false,
    "createdAt": "2026-09-02T00:00:00.000Z"
  },
  "delivery": {
    "attempted": 1,
    "delivered": 1,
    "removed": 0,
    "failed": 0
  }
}
```

## 5. منطق الخدمة ومعالجة الأخطاء

- `saveNotification` يحفظ الإشعار مع `companyId` و`userId` المستمدين من السياق.
- `sendWebPushNotification` يجلب اشتراكات الحساب ضمن الشركة فقط.
- الإرسال المتعدد يستخدم `Promise.allSettled` حتى لا يفشل جهاز واحد بقية
  الأجهزة.
- استجابة push `404` أو `410` تحذف الاشتراك المنتهي تلقائيًا.
- فشل جهاز منفرد لا يحذف الاشتراك إلا عند إثبات انتهاء صلاحيته، ويسجل السبب
  في logger دون طباعة مفاتيح VAPID.
- `createNotificationAndPush` يحفظ السجل قبل محاولة الإرسال؛ لذلك يبقى سجل
  الإشعار موجودًا حتى لو كان مزود push غير متاح.

أهم الأخطاء:

| HTTP | code | السبب والحل |
| --- | --- | --- |
| `400` | `INVALID_REQUEST` | body أو query غير صالح؛ راجع UUID وendpoint والحقول المطلوبة |
| `401` | `WORKSPACE_AUTH_REQUIRED` | لا توجد جلسة صالحة؛ نفّذ login وأرسل cookie |
| `403` | `WORKSPACE_ACCESS_DENIED` | الشركة غير نشطة أو الحساب ليس مالكًا للإرسال اليدوي |
| `409` | `NOTIFICATION_SUBSCRIPTION_CONFLICT` | endpoint مسجل لحساب آخر؛ استخدم اشتراك المتصفح الصحيح |
| `503` | `WEB_PUSH_NOT_CONFIGURED` | أضف متغيرات VAPID الثلاثة ثم أعد تشغيل API |
| `500` | `WEB_PUSH_CONFIGURATION_INVALID` | الزوج غير صالح؛ ولّد زوجًا صحيحًا ولا تستبدله عشوائيًا |

## 6. التحقق من قاعدة البيانات

بعد تشغيل الخادم، يمكن التحقق من عدد السجلات باستعلام قراءة في قاعدة التطوير:

```sql
SELECT
  (SELECT count(*) FROM var_hr_notifications) AS notifications,
  (SELECT count(*) FROM var_hr_notification_subscriptions) AS subscriptions;
```

وللتحقق من العزل:

```sql
SELECT id, company_id, user_id, type, is_read, created_at
FROM var_hr_notifications
ORDER BY created_at DESC
LIMIT 20;
```

لا تستخدم هذه الاستعلامات لتعديل بيانات production. في Replit تمر تغييرات
المخطط الإنتاجي عبر Publish schema diff.

## 7. ما ينتظرنا في Phase 3

1. إضافة Service Worker وطلب صلاحية الإشعارات من المتصفح.
2. استخدام `VAPID_PUBLIC_KEY` في الواجهة لإنشاء الاشتراك وإرساله إلى
   `/subscribe`.
3. إضافة Notification Center وعداد unread وتحديث القراءة في React.
4. توليد عقد OpenAPI وعميل React Query للمسارات الجديدة.
5. ربط الإرسال بأحداث HR مثل الموافقات والتنبيهات التشغيلية.
6. إضافة retry/backoff وrate limiting وقياسات delivery عند الحاجة.