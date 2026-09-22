export type Lang = "fr" | "ar";

export type LocalizedText = {
  fr: string;
  ar: string;
};

export type QuizQuestion = {
  question: LocalizedText;
  choices: LocalizedText[];
  answer: number;
};

export type CourseSession = {
  id: number;
  unit: 1 | 2 | 3 | 4;
  title: LocalizedText;
  subtitle: LocalizedText;
  mission: LocalizedText;
  situation: LocalizedText;
  objectives: LocalizedText[];
  workshops: { label: string; duration: number; text: LocalizedText }[];
  deliverable: LocalizedText;
  trace: LocalizedText[];
  traceSections?: { title: LocalizedText; items: LocalizedText[] }[];
  vocabulary: LocalizedText[];
  quiz: QuizQuestion[];
};

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export const units = [
  {
    id: 1,
    short: "U1",
    title: t("Environnement système", "بيئة النظام"),
    sessions: 3,
    hours: 6,
    accent: "cyan",
  },
  {
    id: 2,
    short: "U2",
    title: t("Réseau & communication", "الشبكة والتواصل"),
    sessions: 1,
    hours: 2,
    accent: "violet",
  },
  {
    id: 3,
    short: "U3",
    title: t("Tableur Excel", "الجداول الإلكترونية"),
    sessions: 6,
    hours: 12,
    accent: "green",
  },
  {
    id: 4,
    short: "U4",
    title: t("Algorithmique Logo.NET", "الخوارزميات Logo.NET"),
    sessions: 5,
    hours: 10,
    accent: "orange",
  },
] as const;

export const sessions: CourseSession[] = [
  {
    id: 1,
    unit: 1,
    title: t("Rappel : information & traitement", "تذكير: المعلومات والمعالجة"),
    subtitle: t("Premiers gestes, formes d’information et types de traitement", "الحركات الأولى وأشكال المعلومات وأنواع المعالجة"),
    mission: t(
      "Aider un nouvel élève à utiliser la souris et le clavier, puis lui expliquer comment une information est traitée.",
      "مساعدة تلميذ جديد على استعمال الفأرة ولوحة المفاتيح ثم شرح كيفية معالجة المعلومة."
    ),
    situation: t(
      "Votre binôme accueille un élève qui n’a jamais touché un ordinateur. Il doit réussir ses premiers gestes et distinguer traitement manuel, semi-automatique et automatique.",
      "تستقبل ثنائيتكم تلميذا لم يستعمل الحاسوب من قبل. عليه إنجاز حركاته الأولى والتمييز بين المعالجة اليدوية وشبه الآلية والآلية."
    ),
    objectives: [
      t("Cliquer, double-cliquer, saisir et valider au clavier.", "النقر والنقر المزدوج والكتابة والتأكيد بلوحة المفاتيح."),
      t("Définir informatique, information et traitement.", "تعريف المعلوميات والمعلومة والمعالجة."),
      t("Reconnaître texte, image, son et vidéo.", "التعرف على النص والصورة والصوت والفيديو."),
      t("Classer une situation en traitement manuel, semi-automatique ou automatique.", "تصنيف وضعية إلى معالجة يدوية أو شبه آلية أو آلية."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Parcours intégré : précision de la souris, double-clic, saisie et validation.", "مسار مدمج: دقة الفأرة والنقر المزدوج والكتابة والتأكيد.") },
      { label: "B", duration: 60, text: t("Résoudre 11 exercices gradués sur les formes d’information et les trois types de traitement.", "حل 11 تمرينا متدرجا حول أشكال المعلومات وأنواع المعالجة الثلاثة.") },
    ],
    deliverable: t("14 exercices réussis + une explication orale d’un traitement automatique.", "إنجاز 14 تمرينا + شرح شفهي لمعالجة آلية."),
    trace: [
      t("L’informatique est la science du traitement automatique des informations.", "المعلوميات هي علم المعالجة الآلية للمعلومات."),
      t("L’information est un ensemble de données ayant un sens.", "المعلومة مجموعة من المعطيات لها معنى."),
      t("L’information peut prendre la forme d’un texte, d’une image, d’un son ou d’une vidéo.", "قد تكون المعلومة نصا أو صورة أو صوتا أو فيديو."),
      t("Un traitement transforme un état initial en état final par une suite d’opérations.", "تحول المعالجة حالة ابتدائية إلى حالة نهائية بواسطة سلسلة عمليات."),
      t("Le traitement peut être manuel, semi-automatique ou automatique.", "قد تكون المعالجة يدوية أو شبه آلية أو آلية."),
    ],
    traceSections: [
      {
        title: t("1. Définitions", "1. تعاريف"),
        items: [
          t("Le mot informatique vient de information et automatique.", "ترتبط كلمة المعلوميات بالمعلومة والمعالجة الآلية."),
          t("L’informatique est la science du traitement automatique des informations.", "المعلوميات هي علم المعالجة الآلية للمعلومات."),
          t("Une information est un ensemble de données qui possède un sens.", "المعلومة مجموعة من المعطيات التي لها معنى."),
        ],
      },
      {
        title: t("2. Formes d’information", "2. أشكال المعلومات"),
        items: [
          t("Les quatre formes étudiées sont : texte, image, son et vidéo.", "الأشكال الأربعة المدروسة هي: النص والصورة والصوت والفيديو."),
          t("Une même information peut être communiquée sous plusieurs formes.", "يمكن تقديم المعلومة نفسها بأشكال متعددة."),
        ],
      },
      {
        title: t("3. Traitement", "3. المعالجة"),
        items: [
          t("Le traitement est une suite d’opérations qui fait passer des données d’un état initial à un état final.", "المعالجة سلسلة عمليات تنقل المعطيات من حالة ابتدائية إلى حالة نهائية."),
          t("Exemples d’opérations : calculer, trier, comparer, modifier et enregistrer.", "من أمثلة العمليات: الحساب والترتيب والمقارنة والتعديل والحفظ."),
        ],
      },
      {
        title: t("4. Types de traitement", "4. أنواع المعالجة"),
        items: [
          t("Manuel : l’humain réalise seul toutes les opérations (écriture à la main).", "يدوي: ينجز الإنسان كل العمليات وحده مثل الكتابة باليد."),
          t("Semi-automatique : l’humain collabore avec la machine (scanner des produits, saisir des notes).", "شبه آلي: يتعاون الإنسان مع الآلة مثل مسح المنتجات وإدخال النقط."),
          t("Automatique : la machine exécute entièrement le traitement préparé (distributeur, robot, sauvegarde automatique).", "آلي: تنجز الآلة المعالجة كاملة مثل الموزع والروبوت والنسخ الاحتياطي التلقائي."),
        ],
      },
    ],
    vocabulary: [t("Informatique", "معلوميات"), t("Information", "معلومة"), t("Donnée", "معطى"), t("Traitement", "معالجة"), t("État initial", "حالة ابتدائية"), t("État final", "حالة نهائية")],
    quiz: [
      { question: t("L’informatique traite automatiquement…", "تعالج المعلوميات آليا…"), choices: [t("les informations", "المعلومات"), t("les tables seulement", "الطاولات فقط"), t("les câbles", "الأسلاك")], answer: 0 },
      { question: t("Une sonnerie est une information sous forme de…", "الجرس معلومة على شكل…"), choices: [t("texte", "نص"), t("son", "صوت"), t("image", "صورة")], answer: 1 },
      { question: t("Le traitement relie un état initial à…", "تربط المعالجة الحالة الابتدائية بـ…"), choices: [t("un état final", "حالة نهائية"), t("un câble", "سلك"), t("une souris", "فأرة")], answer: 0 },
      { question: t("Scanner un produit à la caisse est un traitement…", "مسح منتج عند الصندوق معالجة…"), choices: [t("manuel", "يدوية"), t("semi-automatique", "شبه آلية"), t("sans information", "دون معلومة")], answer: 1 },
      { question: t("Une sauvegarde lancée seule chaque nuit est…", "نسخ احتياطي ينطلق وحده كل ليلة هو…"), choices: [t("automatique", "آلي"), t("manuel", "يدوي"), t("un texte", "نص")], answer: 0 },
      { question: t("Pour ouvrir généralement un dossier, je…", "لفتح مجلد عادة…"), choices: [t("double-clique", "أنقر نقرا مزدوجا"), t("débranche", "أفصل السلك"), t("éteins l’écran", "أطفئ الشاشة")], answer: 0 },
    ],
  },
  {
    id: 2,
    unit: 1,
    title: t("Environnement matériel", "البيئة المادية"),
    subtitle: t("Périphériques, composants internes et capacités", "الملحقات والمكونات الداخلية والسعات"),
    mission: t("Construire un poste complet puis choisir une configuration adaptée au club multimédia.", "تركيب حاسوب كامل ثم اختيار تجهيز مناسب لنادي الوسائط."),
    situation: t("Le collège doit équiper un nouveau poste. Il faut reconnaître chaque élément, vérifier son rôle et justifier la configuration choisie.", "تريد المؤسسة تجهيز حاسوب جديد. يجب التعرف على كل عنصر ووظيفته وتبرير التجهيز المختار."),
    objectives: [
      t("Distinguer unité centrale et périphériques.", "التمييز بين الوحدة المركزية والملحقات."),
      t("Classer les périphériques d’entrée, de sortie, d’entrée/sortie et de stockage.", "تصنيف ملحقات الإدخال والإخراج والإدخال/الإخراج والتخزين."),
      t("Identifier carte mère, processeur, RAM, SSD et alimentation.", "التعرف على اللوحة الأم والمعالج وRAM وSSD ومزود الطاقة."),
      t("Comparer B, kB, MB, GB et TB puis choisir une configuration.", "مقارنة B وkB وMB وGB وTB ثم اختيار تجهيز مناسب."),
    ],
    workshops: [
      { label: "A", duration: 45, text: t("Identifier et classer périphériques et composants à partir de photographies réelles.", "التعرف على الملحقات والمكونات وتصنيفها انطلاقا من صور حقيقية.") },
      { label: "B", duration: 40, text: t("Résoudre des diagnostics puis choisir la configuration du club multimédia.", "حل تشخيصات ثم اختيار تجهيز نادي الوسائط.") },
    ],
    deliverable: t("13 exercices réussis + fiche de configuration argumentée.", "إنجاز 13 تمرينا + بطاقة تجهيز مبررة."),
    trace: [
      t("Un ordinateur comprend une unité centrale et des périphériques.", "يتكون الحاسوب من وحدة مركزية وملحقات."),
      t("Les périphériques servent à saisir, afficher, communiquer ou stocker l’information.", "تستخدم الملحقات لإدخال المعلومات أو عرضها أو التواصل بها أو تخزينها."),
      t("Le processeur traite, la RAM mémorise temporairement et le SSD stocke durablement.", "يعالج المعالج وتحفظ RAM مؤقتا ويخزن SSD بشكل دائم."),
      t("Les capacités s’ordonnent : B, kB, MB, GB, TB.", "ترتب السعات هكذا: B ثم kB ثم MB ثم GB ثم TB."),
    ],
    traceSections: [
      {
        title: t("1. Composition d’un ordinateur", "1. مكونات الحاسوب"),
        items: [
          t("Un ordinateur est une machine de traitement automatique des informations.", "الحاسوب آلة للمعالجة الآلية للمعلومات."),
          t("Il est composé d’une unité centrale et de périphériques.", "يتكون من وحدة مركزية وملحقات."),
        ],
      },
      {
        title: t("2. Périphériques", "2. الملحقات"),
        items: [
          t("Entrée : clavier, souris, microphone, scanner et webcam.", "إدخال: لوحة المفاتيح والفأرة والميكروفون والماسح وكاميرا الويب."),
          t("Sortie : écran, imprimante, haut-parleurs et vidéo-projecteur.", "إخراج: الشاشة والطابعة ومكبرات الصوت والمسلاط."),
          t("Entrée/sortie : écran tactile, casque avec micro et routeur.", "إدخال وإخراج: الشاشة اللمسية وسماعة بميكروفون والموجه."),
          t("Stockage : clé USB, disque dur, SSD, CD/DVD et carte SD.", "تخزين: مفتاح USB والقرص وSSD وCD/DVD وبطاقة SD."),
        ],
      },
      {
        title: t("3. Composants internes", "3. المكونات الداخلية"),
        items: [
          t("La carte mère relie les composants ; le processeur exécute les instructions.", "تربط اللوحة الأم المكونات وينفذ المعالج التعليمات."),
          t("La RAM conserve temporairement les données utilisées ; elle se vide à l’arrêt.", "تحفظ RAM المعطيات المستعملة مؤقتا وتفرغ عند الإطفاء."),
          t("Le SSD ou disque dur conserve durablement les fichiers ; l’alimentation fournit l’énergie.", "يحفظ SSD أو القرص الملفات بشكل دائم ويوفر مزود الطاقة الكهرباء."),
          t("La carte graphique traite les images, la carte son gère l’audio et la carte réseau assure la connexion.", "تعالج بطاقة الرسوم الصور وتدير بطاقة الصوت الصوت وتوفر بطاقة الشبكة الاتصال."),
        ],
      },
      {
        title: t("4. Unités de capacité", "4. وحدات السعة"),
        items: [
          t("1 octet (B) = 8 bits ; les unités courantes sont B, kB, MB, GB et TB.", "1 octet (B) يساوي 8 bits، والوحدات الشائعة هي B وkB وMB وGB وTB."),
          t("En notation décimale : 1 kB = 1 000 B, 1 MB = 1 000 kB, 1 GB = 1 000 MB.", "في النظام العشري: 1 kB = 1000 B و1 MB = 1000 kB و1 GB = 1000 MB."),
        ],
      },
    ],
    vocabulary: [t("Unité centrale", "وحدة مركزية"), t("Périphérique", "ملحق"), t("Processeur", "معالج"), t("Mémoire vive", "ذاكرة حية"), t("Stockage", "تخزين"), t("Capacité", "سعة")],
    quiz: [
      { question: t("Le clavier est un périphérique…", "لوحة المفاتيح ملحق…"), choices: [t("d’entrée", "إدخال"), t("de sortie", "إخراج"), t("de stockage", "تخزين")], answer: 0 },
      { question: t("L’écran sert principalement à…", "تستعمل الشاشة أساسا لـ…"), choices: [t("afficher", "العرض"), t("numériser", "الرقمنة"), t("stocker", "التخزين")], answer: 0 },
      { question: t("Quel composant relie les autres ?", "أي مكون يربط باقي المكونات؟"), choices: [t("Carte mère", "اللوحة الأم"), t("Souris", "الفأرة"), t("Imprimante", "الطابعة")], answer: 0 },
      { question: t("Quelle mémoire se vide à l’arrêt ?", "أي ذاكرة تفرغ عند إيقاف الحاسوب؟"), choices: [t("RAM", "RAM"), t("SSD", "SSD"), t("Clé USB", "مفتاح USB")], answer: 0 },
      { question: t("Quelle unité est la plus grande ?", "ما الوحدة الأكبر؟"), choices: [t("MB", "MB"), t("GB", "GB"), t("kB", "kB")], answer: 1 },
      { question: t("Pour conserver durablement un fichier, on utilise…", "لحفظ ملف بشكل دائم نستعمل…"), choices: [t("un SSD", "SSD"), t("la RAM seule", "RAM فقط"), t("le pointeur", "المؤشر")], answer: 0 },
    ],
  },
  {
    id: 3,
    unit: 1,
    title: t("Environnement système", "بيئة النظام"),
    subtitle: t("Système d’exploitation, Bureau, fichiers et dossiers", "نظام التشغيل وسطح المكتب والملفات والمجلدات"),
    mission: t("Prendre en main le Bureau puis réorganiser correctement l’espace numérique d’une classe.", "التعرف على سطح المكتب ثم إعادة تنظيم الفضاء الرقمي للقسم بشكل صحيح."),
    situation: t("Après la connexion, un élève ne sait pas où trouver les applications. Le Bureau contient aussi des fichiers mal nommés et mélangés.", "بعد تسجيل الدخول لا يعرف تلميذ مكان التطبيقات، كما يحتوي سطح المكتب على ملفات مختلطة وأسماء غير واضحة."),
    objectives: [
      t("Définir le système d’exploitation et reconnaître des exemples.", "تعريف نظام التشغيل والتعرف على أمثلة."),
      t("Repérer les principaux éléments du Bureau.", "تحديد العناصر الأساسية لسطح المكتب."),
      t("Distinguer fichier, dossier, nom et extension.", "التمييز بين الملف والمجلد والاسم والامتداد."),
      t("Créer une arborescence puis copier, déplacer, renommer, rechercher et supprimer sans risque.", "إنشاء شجرة مجلدات ثم النسخ والنقل وإعادة التسمية والبحث والحذف بأمان."),
    ],
    workshops: [
      { label: "A", duration: 35, text: t("Explorer un Bureau Windows, identifier ses zones et reconnaître fichiers, dossiers et extensions.", "استكشاف سطح مكتب Windows وتحديد مناطقه والتعرف على الملفات والمجلدات والامتدادات.") },
      { label: "B", duration: 50, text: t("Construire une arborescence, choisir les bonnes opérations puis résoudre le Bureau désordonné.", "بناء شجرة مجلدات واختيار العمليات المناسبة ثم حل مشكلة سطح المكتب غير المنظم.") },
    ],
    deliverable: t("14 exercices réussis + arborescence 2AC/Informatique/Travaux correctement organisée.", "إنجاز 14 تمرينا + شجرة 2AC/Informatique/Travaux منظمة بشكل صحيح."),
    trace: [
      t("Le système d’exploitation gère le matériel, les applications et les fichiers.", "يدير نظام التشغيل المعدات والتطبيقات والملفات."),
      t("Le Bureau est l’interface principale affichée après la connexion.", "سطح المكتب هو الواجهة الرئيسية بعد تسجيل الدخول."),
      t("Un fichier contient des données ; un dossier organise des fichiers et d’autres dossiers.", "يحتوي الملف على معطيات وينظم المجلد الملفات والمجلدات الأخرى."),
      t("L’extension indique le type du fichier ; un nom clair facilite la recherche.", "يبين الامتداد نوع الملف ويسهل الاسم الواضح البحث."),
    ],
    traceSections: [
      {
        title: t("1. Système d’exploitation", "1. نظام التشغيل"),
        items: [
          t("Un système d’exploitation est un logiciel de base qui gère le matériel, les applications et les fichiers.", "نظام التشغيل برنامج أساسي يدير المعدات والتطبيقات والملفات."),
          t("Exemples : Windows, Linux, macOS et Android.", "أمثلة: Windows وLinux وmacOS وAndroid."),
        ],
      },
      {
        title: t("2. Le Bureau", "2. سطح المكتب"),
        items: [
          t("Le Bureau est l’écran principal affiché après la connexion.", "سطح المكتب هو الشاشة الرئيسية بعد تسجيل الدخول."),
          t("La barre des tâches gère les applications ouvertes ; le bouton Démarrer donne accès aux applications et paramètres.", "يدير شريط المهام التطبيقات المفتوحة ويتيح زر ابدأ الوصول إلى التطبيقات والإعدادات."),
          t("Les icônes sont des raccourcis ; la zone de notification affiche heure, volume, batterie et réseau.", "الأيقونات اختصارات وتعرض منطقة الإشعارات الوقت والصوت والبطارية والشبكة."),
        ],
      },
      {
        title: t("3. Fichiers et dossiers", "3. الملفات والمجلدات"),
        items: [
          t("Un fichier contient des informations ; un dossier range des fichiers et des sous-dossiers.", "يحتوي الملف على معلومات ويرتب المجلد الملفات والمجلدات الفرعية."),
          t("Un fichier possède un nom, une extension, une taille et une date de modification.", "للملف اسم وامتداد وحجم وتاريخ تعديل."),
          t("Extensions courantes : .docx ou .txt (texte), .jpg ou .png (image), .mp3 (audio), .mp4 (vidéo), .xlsx (tableur), .pdf (document).", "امتدادات شائعة: .docx أو .txt للنص و.jpg أو .png للصورة و.mp3 للصوت و.mp4 للفيديو و.xlsx للجدول و.pdf للوثيقة."),
        ],
      },
      {
        title: t("4. Organiser et agir", "4. التنظيم والعمليات"),
        items: [
          t("Une arborescence organise les dossiers du général vers le particulier.", "تنظم شجرة المجلدات من العام إلى الخاص."),
          t("Copier crée un double ; couper puis coller déplace ; renommer change le nom ; rechercher retrouve ; supprimer envoie à la Corbeille.", "ينشئ النسخ نسخة إضافية وينقل القص ثم اللصق ويغير إعادة التسمية الاسم ويجد البحث الملف ويرسل الحذف إلى سلة المحذوفات."),
          t("Avant de supprimer, vérifier le fichier. Après l’enregistrement, vérifier son nom et son emplacement.", "قبل الحذف تحقق من الملف، وبعد الحفظ تحقق من اسمه ومكانه."),
        ],
      },
    ],
    vocabulary: [t("Système d’exploitation", "نظام تشغيل"), t("Bureau", "سطح المكتب"), t("Fichier", "ملف"), t("Dossier", "مجلد"), t("Extension", "امتداد"), t("Arborescence", "شجرة المجلدات"), t("Corbeille", "سلة المحذوفات")],
    quiz: [
      { question: t("Quel logiciel gère le matériel et les applications ?", "أي برنامج يدير المعدات والتطبيقات؟"), choices: [t("Le système d’exploitation", "نظام التشغيل"), t("Une photo", "صورة"), t("Un câble", "سلك")], answer: 0 },
      { question: t("Le bouton Démarrer donne accès…", "يتيح زر ابدأ الوصول إلى…"), choices: [t("aux applications et paramètres", "التطبيقات والإعدادات"), t("au processeur physique", "المعالج المادي"), t("au papier", "الورق")], answer: 0 },
      { question: t("Quel élément peut contenir des fichiers ?", "أي عنصر يمكنه احتواء ملفات؟"), choices: [t("Un dossier", "مجلد"), t("Une extension", "امتداد"), t("Le pointeur", "المؤشر")], answer: 0 },
      { question: t("Dans Photo.jpg, .jpg est…", "في Photo.jpg، تمثل .jpg…"), choices: [t("l’extension", "الامتداد"), t("le dossier", "المجلد"), t("la taille", "الحجم")], answer: 0 },
      { question: t("Copier un fichier signifie…", "نسخ ملف يعني…"), choices: [t("le déplacer", "نقله"), t("créer un double", "إنشاء نسخة"), t("le renommer", "إعادة تسميته")], answer: 1 },
      { question: t("Quel nom est le plus clair ?", "ما الاسم الأكثر وضوحا؟"), choices: [t("final2.xlsx", "final2.xlsx"), t("Budget_2AC_G03.xlsx", "Budget_2AC_G03.xlsx"), t("nouveau.xlsx", "nouveau.xlsx")], answer: 1 },
    ],
  },
  {
    id: 4,
    unit: 2,
    title: t("Le réseau local", "الشبكة المحلية"),
    subtitle: t("Partager et communiquer avec BeeBEEP", "المشاركة والتواصل باستعمال BeeBEEP"),
    mission: t("Faire circuler un message et un fichier entre deux postes sans utiliser Internet.", "تمرير رسالة وملف بين حاسوبين دون استعمال الإنترنت."),
    situation: t("Le professeur doit envoyer une consigne aux 15 postes alors que la connexion Internet est coupée.", "يجب على الأستاذ إرسال تعليمة إلى 15 حاسوبا رغم انقطاع الإنترنت."),
    objectives: [
      t("Reconnaître les éléments d’un réseau local.", "التعرف على عناصر الشبكة المحلية."),
      t("Distinguer Internet et réseau du laboratoire.", "التمييز بين الإنترنت وشبكة المختبر."),
      t("Échanger un message et un fichier avec BeeBEEP.", "تبادل رسالة وملف باستعمال BeeBEEP."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Observer le réseau de la salle et dessiner sa topologie simplifiée.", "ملاحظة شبكة القاعة ورسم بنيتها المبسطة.") },
      { label: "B", duration: 35, text: t("Créer un profil BeeBEEP, envoyer un message puis transférer un fichier témoin.", "إنشاء ملف BeeBEEP وإرسال رسالة ثم نقل ملف تجريبي.") },
    ],
    deliverable: t("Capture de l’échange + schéma du réseau annoté.", "لقطة للتبادل + رسم معنْون للشبكة."),
    trace: [
      t("Un réseau local relie des appareils dans un espace limité.", "تربط الشبكة المحلية أجهزة داخل فضاء محدود."),
      t("BeeBEEP permet de communiquer sur le réseau local sans serveur Internet.", "يسمح BeeBEEP بالتواصل داخل الشبكة المحلية دون خادم إنترنت."),
    ],
    vocabulary: [t("Réseau local", "شبكة محلية"), t("Commutateur", "مبدّل"), t("Adresse IP", "عنوان IP")],
    quiz: [
      { question: t("Le réseau de la salle est un…", "شبكة القاعة هي…"), choices: [t("LAN", "LAN"), t("site web", "موقع ويب"), t("fichier", "ملف")], answer: 0 },
      { question: t("BeeBEEP peut fonctionner…", "يمكن لـBeeBEEP العمل…"), choices: [t("uniquement en ligne", "فقط عبر الإنترنت"), t("sur le réseau local", "عبر الشبكة المحلية"), t("sans aucun réseau", "دون أي شبكة")], answer: 1 },
    ],
  },
  {
    id: 5,
    unit: 3,
    title: t("Premiers pas dans Excel", "الخطوات الأولى في Excel"),
    subtitle: t("Cellules, données et calculs", "الخلايا والبيانات والحساب"),
    mission: t("Construire la feuille de dépenses d’une sortie scolaire.", "إنشاء ورقة مصاريف لرحلة مدرسية."),
    situation: t("Le club dispose d’un budget de 1 200 DH et doit prévoir transport, repas et activités.", "يتوفر النادي على ميزانية 1200 درهم لتغطية النقل والوجبات والأنشطة."),
    objectives: [
      t("Repérer lignes, colonnes, cellules et barre de formule.", "تمييز الصفوف والأعمدة والخلايا وشريط الصيغة."),
      t("Saisir et modifier des données.", "إدخال البيانات وتعديلها."),
      t("Écrire une formule simple avec +, −, × et ÷.", "كتابة صيغة بسيطة باستعمال العمليات الأربع."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Reproduire un tableau de six dépenses avec titres et unités.", "إعادة إنشاء جدول لستة مصاريف بعناوين ووحدات.") },
      { label: "B", duration: 35, text: t("Calculer chaque coût puis le budget restant avec des références de cellules.", "حساب كل تكلفة ثم الميزانية المتبقية باستعمال مراجع الخلايا.") },
    ],
    deliverable: t("Classeur Sortie_2AC.xlsx avec au moins 5 formules.", "مصنف Sortie_2AC.xlsx يتضمن خمس صيغ على الأقل."),
    trace: [
      t("Une formule Excel commence toujours par le signe =.", "تبدأ صيغة Excel دائما بعلامة =."),
      t("Une cellule est repérée par la lettre de sa colonne et le numéro de sa ligne.", "تحدد الخلية بحرف العمود ورقم الصف."),
    ],
    vocabulary: [t("Cellule", "خلية"), t("Classeur", "مصنف"), t("Formule", "صيغة")],
    quiz: [
      { question: t("Quelle référence désigne colonne C, ligne 7 ?", "ما مرجع العمود C والصف 7؟"), choices: [t("7C", "7C"), t("C7", "C7"), t("C:7", "C:7")], answer: 1 },
      { question: t("Quelle écriture est une formule ?", "أي كتابة تمثل صيغة؟"), choices: [t("A1+B1", "A1+B1"), t("=A1+B1", "=A1+B1"), t("A1=B1", "A1=B1")], answer: 1 },
    ],
  },
  {
    id: 6,
    unit: 3,
    title: t("Formules et recopie", "الصيغ والنسخ"),
    subtitle: t("Calculer vite sans recommencer", "الحساب بسرعة دون إعادة العمل"),
    mission: t("Automatiser les factures d’une petite librairie scolaire.", "أتمتة فواتير مكتبة مدرسية صغيرة."),
    situation: t("Vingt lignes de produits doivent être calculées. Saisir la même formule vingt fois serait trop long.", "يجب حساب عشرين سطرا من المنتجات وإعادة الصيغة عشرين مرة أمر طويل."),
    objectives: [
      t("Utiliser les opérateurs dans le bon ordre.", "استعمال العمليات بالترتيب الصحيح."),
      t("Recopier une formule avec la poignée.", "نسخ صيغة باستعمال مقبض التعبئة."),
      t("Vérifier les références obtenues.", "التحقق من المراجع الناتجة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Calculer quantité × prix pour la première ligne d’une facture.", "حساب الكمية × الثمن في أول سطر من الفاتورة.") },
      { label: "B", duration: 35, text: t("Recopier la formule sur 20 lignes puis détecter trois erreurs préparées.", "نسخ الصيغة على 20 سطرا ثم اكتشاف ثلاثة أخطاء معدة مسبقا.") },
    ],
    deliverable: t("Facture automatisée et vérifiée par le binôme voisin.", "فاتورة مؤتمتة ومتحقق منها من طرف ثنائية مجاورة."),
    trace: [
      t("La poignée de recopie adapte les références relatives.", "يكيّف مقبض التعبئة المراجع النسبية."),
      t("Les parenthèses imposent l’ordre des calculs.", "تحدد الأقواس ترتيب العمليات."),
    ],
    vocabulary: [t("Recopie", "نسخ"), t("Référence relative", "مرجع نسبي"), t("Opérateur", "عامل")],
    quiz: [
      { question: t("Pour calculer quantité × prix en B2 et C2…", "لحساب الكمية × الثمن في B2 وC2…"), choices: [t("=B2*C2", "=B2*C2"), t("B2xC2", "B2xC2"), t("=B+C", "=B+C")], answer: 0 },
      { question: t("La recopie vers le bas transforme B2 en…", "النسخ إلى الأسفل يحول B2 إلى…"), choices: [t("B3", "B3"), t("C2", "C2"), t("B2 toujours", "B2 دائما")], answer: 0 },
    ],
  },
  {
    id: 7,
    unit: 3,
    title: t("Les fonctions essentielles", "الدوال الأساسية"),
    subtitle: t("SOMME, MOYENNE, MIN et MAX", "SOMME وMOYENNE وMIN وMAX"),
    mission: t("Produire le bulletin statistique d’un mini-tournoi sportif.", "إعداد حصيلة إحصائية لدوري رياضي مصغر."),
    situation: t("Les résultats de huit équipes sont prêts, mais il faut rapidement connaître total, moyenne et records.", "نتائج ثمانية فرق جاهزة ويجب تحديد المجموع والمتوسط والأرقام بسرعة."),
    objectives: [
      t("Reconnaître la syntaxe d’une fonction.", "التعرف على بنية الدالة."),
      t("Utiliser SOMME, MOYENNE, MIN et MAX.", "استعمال SOMME وMOYENNE وMIN وMAX."),
      t("Sélectionner une plage de cellules correcte.", "تحديد مجال خلايا صحيح."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Calculer les quatre indicateurs pour une première discipline.", "حساب المؤشرات الأربعة لأول رياضة.") },
      { label: "B", duration: 30, text: t("Étendre les calculs aux autres disciplines et interpréter les résultats.", "تعميم الحسابات على باقي الرياضات وتفسير النتائج.") },
    ],
    deliverable: t("Tableau de synthèse avec 12 fonctions correctes.", "جدول تلخيصي يتضمن 12 دالة صحيحة."),
    trace: [
      t("Une plage continue s’écrit avec deux-points : A2:A9.", "يكتب المجال المتصل بنقطتين: A2:A9."),
      t("Une fonction automatise un calcul fréquent sur une plage.", "تؤتمت الدالة حسابا متكررا على مجال."),
    ],
    vocabulary: [t("Fonction", "دالة"), t("Plage", "مجال"), t("Moyenne", "متوسط")],
    quiz: [
      { question: t("Quelle fonction additionne B2 à B9 ?", "أي دالة تجمع B2 إلى B9؟"), choices: [t("=SOMME(B2:B9)", "=SOMME(B2:B9)"), t("=PLUS(B2:B9)", "=PLUS(B2:B9)"), t("=B2:B9", "=B2:B9")], answer: 0 },
      { question: t("MAX renvoie…", "تعيد MAX…"), choices: [t("la plus petite valeur", "أصغر قيمة"), t("la plus grande valeur", "أكبر قيمة"), t("la somme", "المجموع")], answer: 1 },
    ],
  },
  {
    id: 8,
    unit: 3,
    title: t("Présenter pour comprendre", "التنسيق من أجل الفهم"),
    subtitle: t("Mise en forme et graphiques", "التنسيق والمبيانات"),
    mission: t("Transformer des chiffres bruts en une affiche lisible sur la consommation d’eau.", "تحويل أرقام خام إلى ملصق واضح حول استهلاك الماء."),
    situation: t("L’éco-club possède les relevés mensuels, mais le tableau est illisible pour les visiteurs.", "يتوفر النادي البيئي على بيانات شهرية لكن الجدول غير واضح للزوار."),
    objectives: [
      t("Appliquer une mise en forme cohérente.", "تطبيق تنسيق منسجم."),
      t("Choisir un graphique adapté aux données.", "اختيار مبيان ملائم للبيانات."),
      t("Ajouter titre, légende et unités.", "إضافة العنوان والمفتاح والوحدات."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Hiérarchiser le tableau avec titres, formats et bordures utiles.", "تنظيم الجدول بالعناوين والصيغ والحدود المناسبة.") },
      { label: "B", duration: 35, text: t("Créer deux graphiques, comparer puis conserver le plus pertinent.", "إنشاء مبيانين ومقارنتهما ثم الاحتفاظ بالأوضح.") },
    ],
    deliverable: t("Une feuille prête à imprimer avec un graphique commenté.", "ورقة جاهزة للطباعة تتضمن مبيانا مشروحا."),
    trace: [
      t("La mise en forme sert la lecture ; elle ne remplace pas les données.", "يساعد التنسيق على القراءة ولا يعوض البيانات."),
      t("Un graphique doit toujours préciser son titre et ses unités.", "يجب أن يوضح المبيان عنوانه ووحداته."),
    ],
    vocabulary: [t("Graphique", "مبيان"), t("Légende", "مفتاح"), t("Format", "تنسيق")],
    quiz: [
      { question: t("Pour montrer une évolution mensuelle, on choisit souvent…", "لإظهار تطور شهري نختار غالبا…"), choices: [t("une courbe", "منحنى"), t("une zone de texte", "مربع نص"), t("une seule cellule", "خلية واحدة")], answer: 0 },
      { question: t("Un graphique lisible doit avoir…", "يجب أن يتضمن المبيان الواضح…"), choices: [t("beaucoup de couleurs", "ألوانا كثيرة"), t("un titre et des unités", "عنوانا ووحدات"), t("aucune étiquette", "دون تسميات")], answer: 1 },
    ],
  },
  {
    id: 9,
    unit: 3,
    title: t("Décider avec SI", "اتخاذ القرار باستعمال SI"),
    subtitle: t("Conditions et références absolues", "الشروط والمراجع المطلقة"),
    mission: t("Créer un tableau qui attribue automatiquement une appréciation.", "إنشاء جدول يمنح التقدير آليا."),
    situation: t("Le responsable du club veut afficher “Objectif atteint” dès qu’un groupe obtient au moins 10 points.", "يريد مسؤول النادي إظهار «تم بلوغ الهدف» عندما تحصل المجموعة على 10 نقط على الأقل."),
    objectives: [
      t("Construire une condition simple avec SI.", "بناء شرط بسيط باستعمال SI."),
      t("Utiliser les opérateurs de comparaison.", "استعمال معاملات المقارنة."),
      t("Fixer une cellule avec une référence absolue.", "تثبيت خلية بمرجع مطلق."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Afficher Réussi/À renforcer à partir d’un seuil.", "إظهار ناجح/يحتاج دعما انطلاقا من عتبة.") },
      { label: "B", duration: 30, text: t("Placer le seuil dans une cellule fixe puis recopier la formule.", "وضع العتبة في خلية ثابتة ثم نسخ الصيغة.") },
    ],
    deliverable: t("Grille de suivi dynamique avec seuil modifiable.", "شبكة تتبع دينامية بعتبة قابلة للتعديل."),
    trace: [
      t("SI teste une condition puis renvoie une valeur si vrai et une autre si faux.", "تختبر SI شرطا ثم تعيد قيمة إذا تحقق وأخرى إذا لم يتحقق."),
      t("Les signes $ rendent une référence absolue, par exemple $B$1.", "تجعل علامة $ المرجع مطلقا مثل $B$1."),
    ],
    vocabulary: [t("Condition", "شرط"), t("Seuil", "عتبة"), t("Référence absolue", "مرجع مطلق")],
    quiz: [
      { question: t("Quel opérateur signifie supérieur ou égal ?", "أي معامل يعني أكبر من أو يساوي؟"), choices: [t(">=", ">="), t("=>", "=>"), t("==", "==")], answer: 0 },
      { question: t("Quelle référence reste fixe ?", "أي مرجع يبقى ثابتا؟"), choices: [t("B1", "B1"), t("$B$1", "$B$1"), t("B:B", "B:B")], answer: 1 },
    ],
  },
  {
    id: 10,
    unit: 3,
    title: t("Projet Excel : gérer un événement", "مشروع Excel: تدبير نشاط"),
    subtitle: t("Synthèse, contrôle et présentation", "التركيب والتحقق والعرض"),
    mission: t("Livrer un tableau de bord complet pour la journée culturelle du collège.", "إنجاز لوحة قيادة متكاملة لليوم الثقافي بالمؤسسة."),
    situation: t("Il faut suivre les inscriptions, les dépenses et la participation, puis présenter un bilan au directeur.", "يجب تتبع التسجيلات والمصاريف والمشاركة ثم تقديم حصيلة للمدير."),
    objectives: [
      t("Mobiliser formules, fonctions, SI et graphiques.", "توظيف الصيغ والدوال وSI والمبيانات."),
      t("Contrôler la cohérence d’un classeur.", "التحقق من اتساق المصنف."),
      t("Présenter et défendre ses choix.", "عرض الاختيارات والدفاع عنها."),
    ],
    workshops: [
      { label: "A", duration: 40, text: t("Construire le tableau de bord à partir d’un cahier des charges.", "بناء لوحة القيادة انطلاقا من دفتر تحملات.") },
      { label: "B", duration: 20, text: t("Effectuer un audit croisé puis corriger avant la remise.", "إجراء مراجعة متبادلة ثم التصحيح قبل التسليم.") },
    ],
    deliverable: t("Classeur final à 3 feuilles + présentation orale de 2 minutes.", "مصنف نهائي من ثلاث أوراق + عرض شفهي لمدة دقيقتين."),
    trace: [
      t("Un bon classeur sépare données, calculs et synthèse.", "يفصل المصنف الجيد بين البيانات والحسابات والخلاصة."),
      t("Toute formule importante doit être testée avec plusieurs valeurs.", "يجب اختبار كل صيغة مهمة بقيم مختلفة."),
    ],
    vocabulary: [t("Tableau de bord", "لوحة قيادة"), t("Audit", "مراجعة"), t("Synthèse", "خلاصة")],
    quiz: [
      { question: t("Avant de livrer un classeur, il faut…", "قبل تسليم المصنف يجب…"), choices: [t("tester les formules", "اختبار الصيغ"), t("masquer les erreurs", "إخفاء الأخطاء"), t("supprimer les titres", "حذف العناوين")], answer: 0 },
      { question: t("La meilleure synthèse contient…", "أفضل خلاصة تتضمن…"), choices: [t("toutes les cellules", "كل الخلايا"), t("des indicateurs utiles", "مؤشرات مفيدة"), t("seulement des couleurs", "ألوانا فقط")], answer: 1 },
    ],
  },
  {
    id: 11,
    unit: 4,
    title: t("Commander la tortue", "توجيه السلحفاة"),
    subtitle: t("Instructions et repérage", "التعليمات والتموقع"),
    mission: t("Programmer un robot-tortue pour tracer un parcours précis.", "برمجة سلحفاة آلية لرسم مسار دقيق."),
    situation: t("La tortue doit rejoindre la sortie d’un labyrinthe sans traverser les murs.", "على السلحفاة بلوغ مخرج المتاهة دون اختراق الجدران."),
    objectives: [
      t("Exécuter AV, RE, TD et TG.", "تنفيذ AV وRE وTD وTG."),
      t("Prévoir l’effet d’une suite d’instructions.", "توقع أثر سلسلة تعليمات."),
      t("Corriger un trajet par essais raisonnées.", "تصحيح المسار بمحاولات مبررة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Prédire puis vérifier cinq déplacements courts.", "توقع ثم التحقق من خمس حركات قصيرة.") },
      { label: "B", duration: 35, text: t("Écrire l’algorithme qui permet de sortir du labyrinthe.", "كتابة خوارزمية الخروج من المتاهة.") },
    ],
    deliverable: t("Programme commenté + capture du trajet réussi.", "برنامج مشروح + لقطة للمسار الناجح."),
    trace: [
      t("Un programme est une suite ordonnée d’instructions exécutables.", "البرنامج سلسلة مرتبة من التعليمات القابلة للتنفيذ."),
      t("Une rotation change la direction, pas la position de la tortue.", "يغير الدوران اتجاه السلحفاة لا موقعها."),
    ],
    vocabulary: [t("Instruction", "تعليمة"), t("Algorithme", "خوارزمية"), t("Rotation", "دوران")],
    quiz: [
      { question: t("Quelle commande avance de 50 pas ?", "أي تعليمة تتقدم 50 خطوة؟"), choices: [t("AV 50", "AV 50"), t("TD 50", "TD 50"), t("RE 90", "RE 90")], answer: 0 },
      { question: t("TD 90 réalise…", "تنفذ TD 90…"), choices: [t("un demi-tour", "نصف دورة"), t("un quart de tour à droite", "ربع دورة يمينا"), t("50 pas", "50 خطوة")], answer: 1 },
    ],
  },
  {
    id: 12,
    unit: 4,
    title: t("Dessiner des figures", "رسم الأشكال"),
    subtitle: t("Angles, couleurs et remplissage", "الزوايا والألوان والتعبئة"),
    mission: t("Créer une enseigne géométrique colorée pour le laboratoire.", "إنشاء لافتة هندسية ملونة للمختبر."),
    situation: t("L’enseigne doit contenir carré, triangle et cercle sans lignes inutiles.", "يجب أن تتضمن اللافتة مربعا ومثلثا ودائرة دون خطوط زائدة."),
    objectives: [
      t("Associer figure et angle de rotation.", "ربط الشكل بزاوية الدوران."),
      t("Lever et poser le crayon au bon moment.", "رفع القلم ووضعه في الوقت المناسب."),
      t("Choisir couleur et remplissage.", "اختيار اللون والتعبئة."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Programmer séparément un carré, un triangle et un cercle.", "برمجة مربع ومثلث ودائرة كل على حدة.") },
      { label: "B", duration: 30, text: t("Assembler les figures, ajouter deux couleurs puis remplir une zone.", "تركيب الأشكال وإضافة لونين ثم تعبئة مساحة.") },
    ],
    deliverable: t("Composition géométrique nommée et programme sauvegardé.", "تركيب هندسي معنْون مع حفظ البرنامج."),
    trace: [
      t("La somme des rotations d’un tour complet vaut 360°.", "مجموع دورانات دورة كاملة يساوي 360°."),
      t("Lever le crayon permet de se déplacer sans tracer.", "يسمح رفع القلم بالحركة دون رسم."),
    ],
    vocabulary: [t("Angle", "زاوية"), t("Remplissage", "تعبئة"), t("Crayon", "قلم")],
    quiz: [
      { question: t("Pour un carré, l’angle de rotation est…", "زاوية الدوران في المربع هي…"), choices: [t("60°", "60°"), t("90°", "90°"), t("120°", "120°")], answer: 1 },
      { question: t("Pour bouger sans tracer, on…", "للتحرك دون رسم نقوم بـ…"), choices: [t("lève le crayon", "رفع القلم"), t("ferme Logo", "إغلاق Logo"), t("tourne toujours", "الدوران دائما")], answer: 0 },
    ],
  },
  {
    id: 13,
    unit: 4,
    title: t("Répéter intelligemment", "التكرار بذكاء"),
    subtitle: t("Boucles et motifs", "الحلقات والزخارف"),
    mission: t("Réduire un long programme de mosaïque à quelques lignes.", "اختصار برنامج طويل للفسيفساء إلى بضعة أسطر."),
    situation: t("Le premier programme répète huit fois les mêmes commandes. Il fonctionne, mais il est difficile à corriger.", "يكرر البرنامج الأول نفس التعليمات ثماني مرات؛ يعمل لكنه صعب التصحيح."),
    objectives: [
      t("Repérer une séquence répétitive.", "اكتشاف تسلسل متكرر."),
      t("Utiliser la commande REPETE.", "استعمال التعليمة REPETE."),
      t("Calculer l’angle d’un motif régulier.", "حساب زاوية زخرفة منتظمة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Transformer trois programmes longs en boucles courtes.", "تحويل ثلاثة برامج طويلة إلى حلقات قصيرة.") },
      { label: "B", duration: 35, text: t("Créer une rosace à 8 branches en déterminant son angle.", "إنشاء وردة هندسية من ثمانية فروع بحساب زاويتها.") },
    ],
    deliverable: t("Rosace réussie + comparaison avant/après du code.", "وردة ناجحة + مقارنة الشيفرة قبل وبعد."),
    trace: [
      t("Une boucle répète un bloc d’instructions un nombre défini de fois.", "تكرر الحلقة كتلة تعليمات عددا محددا من المرات."),
      t("Pour n motifs réguliers, la rotation vaut souvent 360 ÷ n.", "بالنسبة إلى n زخارف منتظمة تكون زاوية الدوران غالبا 360 ÷ n."),
    ],
    vocabulary: [t("Boucle", "حلقة"), t("Répétition", "تكرار"), t("Motif", "زخرفة")],
    quiz: [
      { question: t("REPETE 4 [AV 50 TD 90] trace…", "ترسم REPETE 4 [AV 50 TD 90]…"), choices: [t("un carré", "مربعا"), t("un triangle", "مثلثا"), t("une ligne", "خطا")], answer: 0 },
      { question: t("Pour 8 branches régulières, la rotation est…", "زاوية دوران 8 فروع منتظمة هي…"), choices: [t("30°", "30°"), t("45°", "45°"), t("90°", "90°")], answer: 1 },
    ],
  },
  {
    id: 14,
    unit: 4,
    title: t("Créer des procédures", "إنشاء الإجراءات"),
    subtitle: t("Décomposer et réutiliser", "التفكيك وإعادة الاستعمال"),
    mission: t("Programmer un zellige en construisant une bibliothèque de motifs.", "برمجة زليج عبر بناء مكتبة زخارف."),
    situation: t("Plusieurs parties du dessin utilisent le même losange. Le recopier partout rend le programme illisible.", "تستعمل أجزاء كثيرة من الرسم نفس المعين ونسخه في كل مكان يجعل البرنامج غير واضح."),
    objectives: [
      t("Définir et appeler une procédure.", "تعريف إجراء واستدعاؤه."),
      t("Décomposer un dessin complexe.", "تفكيك رسم معقد."),
      t("Donner des noms explicites aux blocs.", "اختيار أسماء واضحة للكتل."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Créer les procédures CARRE, LOSANGE et ETOILE puis les tester.", "إنشاء الإجراءات CARRE وLOSANGE وETOILE ثم اختبارها.") },
      { label: "B", duration: 30, text: t("Assembler les procédures pour composer un zellige équilibré.", "تركيب الإجراءات لإنجاز زليج متوازن.") },
    ],
    deliverable: t("Programme structuré en 3 procédures + dessin final.", "برنامج منظم في ثلاثة إجراءات + الرسم النهائي."),
    trace: [
      t("Une procédure donne un nom à un bloc réutilisable.", "يعطي الإجراء اسما لكتلة قابلة لإعادة الاستعمال."),
      t("Décomposer rend le programme plus lisible, testable et facile à corriger.", "يجعل التفكيك البرنامج أوضح وأسهل للاختبار والتصحيح."),
    ],
    vocabulary: [t("Procédure", "إجراء"), t("Appel", "استدعاء"), t("Décomposition", "تفكيك")],
    quiz: [
      { question: t("Une procédure sert surtout à…", "يستعمل الإجراء أساسا لـ…"), choices: [t("réutiliser un bloc", "إعادة استعمال كتلة"), t("éteindre l’écran", "إطفاء الشاشة"), t("effacer le clavier", "مسح لوحة المفاتيح")], answer: 0 },
      { question: t("Un bon nom de procédure est…", "اسم الإجراء الجيد هو…"), choices: [t("X1", "X1"), t("FORME", "FORME"), t("DESSINE_ETOILE", "DESSINE_ETOILE")], answer: 2 },
    ],
  },
  {
    id: 15,
    unit: 4,
    title: t("Projet final : ville intelligente", "المشروع النهائي: مدينة ذكية"),
    subtitle: t("Concevoir, programmer et présenter", "التصميم والبرمجة والعرض"),
    mission: t("Créer une scène animée qui mobilise tout le parcours Logo.NET.", "إنشاء مشهد متحرك يوظف كل مكتسبات Logo.NET."),
    situation: t("Chaque binôme propose un quartier durable avec bâtiments, arbres, signalisation et un élément animé.", "تقترح كل ثنائية حيا مستداما بمبان وأشجار وعلامات وعنصر متحرك."),
    objectives: [
      t("Planifier un projet par étapes.", "تخطيط مشروع على مراحل."),
      t("Combiner instructions, boucles et procédures.", "دمج التعليمات والحلقات والإجراءات."),
      t("Tester, améliorer et présenter une production.", "اختبار الإنتاج وتحسينه وعرضه."),
    ],
    workshops: [
      { label: "A", duration: 15, text: t("Dessiner le plan, répartir les rôles et écrire le pseudo-code.", "رسم التصميم وتوزيع الأدوار وكتابة الشيفرة الوصفية.") },
      { label: "B", duration: 45, text: t("Programmer la scène, tester avec une grille qualité puis finaliser.", "برمجة المشهد واختباره بشبكة جودة ثم إنهاؤه.") },
    ],
    deliverable: t("Programme final + scène + présentation de 3 minutes.", "البرنامج النهائي + المشهد + عرض لمدة ثلاث دقائق."),
    trace: [
      t("Un projet réussi alterne planification, réalisation, test et amélioration.", "يتناوب المشروع الناجح بين التخطيط والإنجاز والاختبار والتحسين."),
      t("Une erreur fournit une information utile pour corriger l’algorithme.", "يوفر الخطأ معلومة مفيدة لتصحيح الخوارزمية."),
    ],
    vocabulary: [t("Pseudo-code", "شيفرة وصفية"), t("Débogage", "تنقيح"), t("Critère", "معيار")],
    quiz: [
      { question: t("Après l’écriture du programme, l’étape indispensable est…", "بعد كتابة البرنامج الخطوة الضرورية هي…"), choices: [t("le test", "الاختبار"), t("l’impression immédiate", "الطباعة فورا"), t("la suppression", "الحذف")], answer: 0 },
      { question: t("Pour un projet en binôme, il vaut mieux…", "في مشروع ثنائي من الأفضل…"), choices: [t("laisser une personne tout faire", "ترك شخص واحد يقوم بكل شيء"), t("répartir puis permuter les rôles", "توزيع الأدوار ثم تبديلها"), t("ne rien planifier", "عدم التخطيط")], answer: 1 },
    ],
  },
];

export const phases = [
  { key: "launch", minutes: 5, label: t("Défi de départ", "تحدي البداية"), note: t("Observer & essayer", "ملاحظة ومحاولة") },
  { key: "discover", minutes: 10, label: t("Démonstration utile", "عرض عملي قصير"), note: t("Un geste, puis à vous", "حركة ثم دوركم") },
  { key: "practice", minutes: 85, label: t("Pratique en binôme", "تطبيق ثنائي"), note: t("Photo-défi + ateliers", "تحدي الصورة + الورشات") },
  { key: "close", minutes: 20, label: t("Structurer l’essentiel", "تنظيم الخلاصة"), note: t("Trace écrite & défi final", "خلاصة مكتوبة وتحد نهائي") },
] as const;

export const getUnit = (id: number) => units.find((unit) => unit.id === id)!;
