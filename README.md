# raselny - تطبيق محادثات آمن

تطبيق مراسلات فورية مع تشفير اختياري، يعمل على Supabase ويمكن نشره على GitHub Pages.

## 🚀 النشر على GitHub Pages

### 1. ضع أيقوناتك أولاً
ضع ملفات شعاراتك في مجلد `icons/` بهذه الأسماء:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

### 2. إنشاء مستودع على GitHub

```bash
# في مجلد المشروع
git init
git add .
git commit -m "النسخة الأولى"
```

- أنشئ مستودعاً جديداً على GitHub: https://github.com/new
- name: `raselny`
- Public أو Private

```bash
git remote add origin https://github.com/<اسم-المستخدم>/raselny.git
git branch -M main
git push -u origin main
```

### 2. تفعيل GitHub Pages

1. اذهب إلى Settings > Pages في المستودع
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. Save

بعد دقائق، التطبيق سيكون متاحاً على:
`https://<اسم-المستخدم>.github.io/raselny`

### 4. تجهيز Supabase

1. **شغّل SQL schema**: اذهب إلى `_dev/schema.sql` في مجلد المشروع، انسخ المحتوى، ثم اذهب إلى Supabase Dashboard > SQL Editor والصقه وشغّله
2. **أنشئ Storage bucket**: Supabase > Storage > New bucket > name: `chat-media` > Public
3. **فعّل Realtime**: Supabase > Database > Replication > شغّل `messages` و `chats` و `users`
4. **تأكيد البريد الإلكتروني**: Supabase > Authentication > Settings > Disable email confirmation (اختياري للتجربة)

### 4. استبدال الأيقونات
ضع شعاراتك في `icons/` باسم:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

أو عدّل `manifest.json` ليشير إلى ملفاتك.

---

## 🧪 التشغيل محلياً

### الطريقة 1: باستخدام VS Code (أسهل)

1. افتح المجلد في VS Code
2. ثبت إضافة **Live Server**
3. اضغط كليك يمين على `index.html` > **Open with Live Server**
4. التطبيق سيفتح على `http://127.0.0.1:5500`

### الطريقة 2: باستخدام Python

```bash
python -m http.server 8080
# ثم افتح http://localhost:8080
```

### الطريقة 3: باستخدام Node.js

```bash
npx serve .
```

### ملاحظة للتجربة المحلية
- تأكد من الاتصال بالإنترنت لأن Supabase يتطلب اتصال
- افتح التطبيق في متصفح حديث يدعم Service Worker (Chrome, Edge, Firefox)
- لاختبار PWA محلياً، استخدم HTTPS أو `localhost` (Chrome يعامل `localhost` كـ secure)

---

## 📁 بنية المشروع

```
raselny/                    # → ارفع هذا المجلد إلى GitHub
├── index.html              # الصفحة الرئيسية
├── style.css               # التصميم
├── app.js                  # منطق التطبيق
├── db.js                   # الاتصال بقاعدة البيانات
├── manifest.json           # إعدادات PWA
├── service-worker.js       # للعمل دون اتصال
├── .gitignore              # استثناء الملفات غير المرغوب بها
├── .nojekyll               # لإعدادات GitHub Pages
├── README.md               # هذا الملف
├── icons/
│   ├── icon-192.png        # أيقونة 192×192 (ضع ملفك هنا)
│   └── icon-512.png        # أيقونة 512×512 (ضع ملفك هنا)
│
└── _dev/                   # 🛠 ملفات مساعدة (لا تنشر إلى GitHub)
    ├── deploy-guide.html   # دليل النشر التفاعلي
    ├── schema.sql          # هيكل قاعدة بيانات Supabase
    └── icons/              # أيقونات احتياطية SVG
```

---

## ⚙️ الإعدادات الأولية

### إنشاء حساب مسؤول
1. افتح التطبيق
2. سجل حساباً جديداً
3. هذا الحساب سيكون مديراً (يمكنك منح صلاحيات إضافية لاحقاً من Supabase)

### إضافة مستخدمين آخرين
- يمكن لأي شخص إنشاء حساب من شاشة تسجيل الدخول
- لا يحتاج التطبيق إلى جيميل أو حسابات قوقل

---

## 🛠 التقنيات المستخدمة

- **Supabase**: قاعدة البيانات والمصادقة والتخزين والـ Realtime
- **Vanilla JS**: بدون إطارات (zero dependencies)
- **Web Crypto API**: لتشفير الرسائل AES-GCM
- **PWA**: للتثبيت كتطبيق
- **SVG**: للأيقونات (بدون إيموجي في التصميم)

---

## 📞 دعم

للاستفسارات أو المساعدة: افتح issue في المستودع
