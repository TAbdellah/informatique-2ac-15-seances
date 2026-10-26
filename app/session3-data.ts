import type { CourseSession, LocalizedText } from "./course-data";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export const session3Schedule = [
  { time: "0–5", minutes: 5, title: t("Je m’installe et je découvre le défi", "أستعد وأتعرف على التحدي") },
  { time: "5–15", minutes: 10, title: t("Rappel 1 · Information et traitement", "تذكير 1 · المعلومة والمعالجة") },
  { time: "15–30", minutes: 15, title: t("Rappel 2 · Matériel et capacités", "تذكير 2 · المعدات والسعات") },
  { time: "30–40", minutes: 10, title: t("Pourquoi un système d’exploitation ?", "لماذا نحتاج إلى نظام تشغيل؟") },
  { time: "40–50", minutes: 10, title: t("Je passe d’Android à Windows", "أنتقل من Android إلى Windows") },
  { time: "50–65", minutes: 15, title: t("Je manipule le Bureau et les fenêtres", "أستعمل سطح المكتب والنوافذ") },
  { time: "65–100", minutes: 35, title: t("Je relève le défi des fichiers", "أنجز تحدي الملفات") },
  { time: "100–110", minutes: 10, title: t("Je retiens l’essentiel", "أدوّن الخلاصة") },
  { time: "110–120", minutes: 10, title: t("Je vérifie mes acquis", "أتحقق من مكتسباتي") },
];

export const session3: CourseSession = {
  id: 3,
  unit: 1,
  title: t("Rappel 1 & 2 · Je prends en main Windows", "تذكير بالحصتين 1 و2 · أستعمل Windows"),
  subtitle: t("2 h : rappel actif, d’Android à Windows, Bureau et organisation des fichiers", "ساعتان: تذكير نشيط، من Android إلى Windows، سطح المكتب وتنظيم الملفات"),
  mission: t("Réactiver tes acquis, comprendre le rôle du système d’exploitation puis organiser ton espace de travail.", "أستحضر مكتسباتي وأفهم دور نظام التشغيل ثم أنظم فضاء عملي."),
  situation: t(
    "Au club, Sara reçoit une unité centrale reliée à un écran, un clavier et une souris. Le poste s’allume, mais aucun Bureau ni application n’est accessible. Sur son téléphone, Sara peut ouvrir des applications et retrouver ses photos. Quel logiciel de base rend ces fonctions possibles ? Sur un poste Windows utilisable, aide ensuite Sara à organiser ses fichiers.",
    "تتوصل سارة في النادي بوحدة مركزية موصولة بشاشة ولوحة مفاتيح وفأرة. يشتغل الجهاز، لكن لا يمكن الوصول إلى سطح المكتب أو التطبيقات. في هاتفها تستطيع سارة فتح التطبيقات والعثور على صورها. ما البرنامج الأساسي الذي يتيح هذه الوظائف؟ ساعدها بعد ذلك على تنظيم ملفاتها في حاسوب يعمل بنظام Windows."
  ),
  objectives: [
    t("Réactiver les formes d’information, les types de traitement, le matériel et les capacités.", "أستحضر أشكال المعلومات وأنواع المعالجة والمعدات ووحدات السعة."),
    t("Expliquer le rôle d’un système d’exploitation et distinguer Android, Windows et les applications.", "أشرح دور نظام التشغيل وأميز Android وWindows عن التطبيقات."),
    t("Ouvrir une application, déplacer une fenêtre, la réduire et la retrouver.", "أفتح تطبيقا وأحرك نافذته وأصغرها ثم أظهرها مجددا."),
    t("Créer des dossiers ; déplacer, renommer, copier et rechercher un fichier ; utiliser la Corbeille.", "أنشئ مجلدات وأنقل ملفا وأسميه وأنسخه وأبحث عنه وأستعمل سلة المحذوفات."),
  ],
  workshops: [
    { label: "1", duration: 25, text: t("Rappel actif : 6 exercices sur les séances 1 et 2.", "تذكير نشيط: 6 تمارين حول الحصتين 1 و2.") },
    { label: "2", duration: 20, text: t("Résoudre la situation de Sara, puis comparer Android et Windows.", "أحل وضعية سارة ثم أقارن Android وWindows.") },
    { label: "3", duration: 15, text: t("Manipuler le Bureau et les fenêtres dans une simulation, puis sur le poste Windows.", "أستعمل سطح المكتب والنوافذ في المحاكاة ثم على حاسوب Windows.") },
    { label: "4", duration: 35, text: t("Distinguer fichiers et dossiers, choisir les opérations puis organiser l’espace de Sara.", "أميز الملفات والمجلدات وأختار العمليات ثم أنظم فضاء سارة.") },
  ],
  deliverable: t("19 activités visuelles + un espace 2AC_G01/Informatique/Travaux organisé. Chacun manipule à son tour.", "19 نشاطا بصريا + فضاء منظم 2AC_G01/Informatique/Travaux. يستعمل كل تلميذ الحاسوب بالتناوب."),
  trace: [
    t("L’information peut être un texte, une image, un son ou une vidéo. Le matériel permet de saisir, traiter, restituer et stocker.", "قد تكون المعلومة نصا أو صورة أو صوتا أو فيديو. تسمح المعدات بالإدخال والمعالجة والإخراج والتخزين."),
    t("Le système d’exploitation gère le matériel, les applications et les fichiers. Windows et Android en sont des exemples.", "يدير نظام التشغيل المعدات والتطبيقات والملفات. Windows وAndroid مثالان عليه."),
    t("Un fichier contient des informations ; un dossier organise des fichiers et des sous-dossiers.", "يحتوي الملف على معلومات وينظم المجلد الملفات والمجلدات الفرعية."),
    t("Copier crée un double ; déplacer change l’emplacement ; renommer change le nom.", "ينشئ النسخ نسخة إضافية ويغير النقل المكان وتغير إعادة التسمية الاسم."),
  ],
  traceSections: [
    { title: t("1. Je réactive mes acquis", "1. أستحضر مكتسباتي"), items: [
      t("Information : texte, image, son, vidéo. Traitement : état initial → opérations → état final.", "المعلومة: نص وصورة وصوت وفيديو. المعالجة: حالة ابتدائية ← عمليات ← حالة نهائية."),
      t("Le processeur exécute les instructions ; la RAM conserve temporairement les données ; le SSD les stocke durablement.", "ينفذ المعالج التعليمات وتحفظ RAM المعطيات مؤقتا ويخزنها SSD بشكل دائم."),
      t("Dans les conversions du cours : 1 Go = 1 000 Mo ; vers une unité plus petite, je multiplie ; vers une plus grande, je divise.", "في تحويلات الدرس: 1 Go = 1000 Mo؛ نحو وحدة أصغر أضرب ونحو وحدة أكبر أقسم."),
    ] },
    { title: t("2. Le système d’exploitation", "2. نظام التشغيل"), items: [
      t("C’est un logiciel de base qui gère les ressources matérielles, permet l’exécution des applications et organise les fichiers.", "هو برنامج أساسي يدير موارد المعدات ويتيح تشغيل التطبيقات وتنظيم الملفات."),
      t("Android et Windows sont des systèmes d’exploitation. La Calculatrice et le navigateur sont des applications.", "Android وWindows نظاما تشغيل. الحاسبة والمتصفح تطبيقان."),
    ] },
    { title: t("3. Le Bureau et les fenêtres", "3. سطح المكتب والنوافذ"), items: [
      t("Démarrer donne accès aux applications ; la barre des tâches permet de retrouver les applications ouvertes.", "يتيح ابدأ الوصول إلى التطبيقات ويسمح شريط المهام بالعودة إلى التطبيقات المفتوحة."),
      t("Je déplace une fenêtre par sa barre de titre. Réduire masque la fenêtre sans fermer l’application.", "أحرك النافذة من شريط عنوانها. يخفي التصغير النافذة دون إغلاق التطبيق."),
      t("Une icône peut représenter une application, un fichier, un dossier ou un raccourci.", "قد تمثل الأيقونة تطبيقا أو ملفا أو مجلدا أو اختصارا."),
    ] },
    { title: t("4. Les fichiers et leur organisation", "4. الملفات وتنظيمها"), items: [
      t("Un fichier contient des informations. Un dossier peut contenir des fichiers et d’autres dossiers.", "يحتوي الملف على معلومات ويمكن أن يحتوي المجلد على ملفات ومجلدات أخرى."),
      t("Dans Photo_club.jpg, Photo_club est le nom et .jpg est l’extension, qui renseigne sur le format. Renommer ne convertit pas le fichier.", "في Photo_club.jpg، يمثل Photo_club الاسم و.jpg الامتداد الذي يدل على الصيغة. لا تغير إعادة التسمية صيغة الملف."),
      t("Copier puis coller crée un double ; couper puis coller déplace ; rechercher retrouve un fichier.", "ينشئ النسخ ثم اللصق نسخة إضافية وينقل القص ثم اللصق الملف ويعثر البحث عليه."),
      t("Dans notre dossier d’exercice, supprimer envoie le fichier à la Corbeille ; restaurer le remet à son emplacement d’origine.", "داخل مجلد التمرين يرسل الحذف الملف إلى سلة المحذوفات وتعيده الاستعادة إلى مكانه الأصلي."),
    ] },
  ],
  vocabulary: [t("Système d’exploitation", "نظام التشغيل"), t("Bureau", "سطح المكتب"), t("Fenêtre", "نافذة"), t("Fichier", "ملف"), t("Dossier", "مجلد"), t("Copier", "نسخ"), t("Déplacer", "نقل"), t("Restaurer", "استعادة")],
  quiz: [
    { question: t("Quel logiciel permet d’obtenir un Bureau sur ce poste ?", "أي برنامج يوفر سطح مكتب لهذا الحاسوب؟"), image: {src:"session3/visuels/ecran-sans-systeme.svg",alt:t("Poste sans système d’exploitation détecté", "حاسوب لم يعثر على نظام تشغيل")}, choices: [t("Windows", "Windows"),t("Calculatrice", "الحاسبة"),t("Navigateur", "المتصفح")], answer:0 },
    { question: t("Android est…", "Android هو…"), image: {src:"session3/visuels/logo-android.svg",alt:t("Android", "Android")}, choices:[t("un système d’exploitation", "نظام تشغيل"),t("une application de calcul", "تطبيق للحساب"),t("un dossier", "مجلد")],answer:0 },
    { question: t("Où retrouves-tu une application réduite ?", "أين تجد تطبيقا مصغرا؟"),image:{src:"session3/visuels/ecran-windows.svg",alt:t("Bureau Windows avec barre des tâches", "سطح مكتب Windows بشريط المهام")},choices:[t("Dans la barre des tâches", "في شريط المهام"),t("Dans la Corbeille", "في سلة المحذوفات"),t("Dans le nom du fichier", "في اسم الملف")],answer:0 },
    { question: t("Cet élément est…", "هذا العنصر هو…"),image:{src:"session3/visuels/element-image.svg",alt:t("Photo_club.jpg", "Photo_club.jpg")},choices:[t("un fichier", "ملف"),t("un dossier", "مجلد"),t("un système d’exploitation", "نظام تشغيل")],answer:0 },
    { question: t("Observe avant et après. Quelle opération a été faite ?", "لاحظ قبل وبعد. ما العملية المنجزة؟"),image:{src:"session3/visuels/deplacement-avant-apres.svg",alt:t("Le fichier a quitté Documents et se trouve dans Travaux", "غادر الملف Documents وأصبح في Travaux")},choices:[t("Copier puis coller", "نسخ ثم لصق"),t("Couper puis coller", "قص ثم لصق"),t("Renommer", "إعادة تسمية")],answer:1 },
    { question: t("Comment récupérer brouillon.txt ?", "كيف تسترجع brouillon.txt؟"),image:{src:"session3/visuels/corbeille.svg",alt:t("Brouillon dans la Corbeille", "المسودة في سلة المحذوفات")},choices:[t("Restaurer", "استعادة"),t("Renommer", "إعادة تسمية"),t("Supprimer", "حذف")],answer:0 },
  ],
};
