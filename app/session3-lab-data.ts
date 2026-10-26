import type { LocalizedText } from "./course-data";
import type { Unit1Lab } from "./unit1-labs";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export const session3Lab: Unit1Lab = {
  title: t("Séance 3 · Je me rappelle, je découvre, je pratique", "الحصة 3 · أتذكر وأكتشف وأطبق"),
  subtitle: t("13 activités : 25 min de rappel, 20 min de découverte et 50 min de manipulation. Puis trace écrite et bilan.", "13 نشاطا: 25 دقيقة للتذكير و20 دقيقة للاكتشاف و50 دقيقة للتطبيق، ثم الخلاصة والتقويم."),
  exercises: [
    {
      id: "s3-v2-rappel-formes", type: "match", level: "start", minutes: 3,
      title: t("Rappel 1 · Les formes d’information", "تذكير 1 · أشكال المعلومات"),
      prompt: t("Associe chaque exemple à sa forme d’information.", "اربط كل مثال بشكل المعلومة المناسب."),
      categories: [t("Texte", "نص"), t("Image", "صورة"), t("Son", "صوت"), t("Vidéo", "فيديو")],
      rows: [{ label: t("Une phrase écrite", "جملة مكتوبة"), answer: 0 }, { label: t("Une photographie", "صورة فوتوغرافية"), answer: 1 }, { label: t("Une sonnerie", "رنة"), answer: 2 }, { label: t("Un clip filmé", "مقطع مصور"), answer: 3 }],
      feedback: t("Les quatre formes étudiées sont le texte, l’image, le son et la vidéo.", "الأشكال الأربعة المدروسة هي النص والصورة والصوت والفيديو."),
    },
    {
      id: "s3-v2-rappel-traitement", type: "sequence", level: "start", minutes: 2,
      title: t("Rappel 1 · De la photo sombre à la photo claire", "تذكير 1 · من صورة مظلمة إلى صورة واضحة"),
      prompt: t("Remets dans l’ordre : état initial, opération de traitement, état final.", "رتب الحالة الابتدائية وعملية المعالجة والحالة النهائية."),
      steps: [t("Photo trop sombre", "صورة مظلمة جدا"), t("Augmenter la luminosité", "رفع السطوع"), t("Photo plus claire", "صورة أكثر وضوحا")], shuffled: [2, 0, 1],
      feedback: t("Un traitement transforme un état initial en état final par des opérations.", "تحول المعالجة الحالة الابتدائية إلى حالة نهائية بواسطة عمليات."),
    },
    {
      id: "s3-v2-rappel-types", type: "match", level: "start", minutes: 5,
      title: t("Rappel 1 · Qui réalise les opérations ?", "تذكير 1 · من ينجز العمليات؟"),
      prompt: t("Classe chaque situation selon le déroulement décrit, puis explique ton choix à ton binôme.", "صنف كل وضعية حسب طريقة إنجازها ثم اشرح اختيارك لزميلك."),
      categories: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
      rows: [
        { label: t("Un élève calcule toutes les opérations sur papier.", "ينجز تلميذ كل العمليات الحسابية على الورق."), answer: 0, image: "treatment-situations/calcul-papier.jpg" },
        { label: t("Un élève saisit chaque opération sur une calculatrice et relève les résultats.", "يدخل تلميذ كل عملية في الحاسبة وينقل النتائج."), answer: 1 },
        { label: t("Une sauvegarde programmée se lance seule chaque nuit.", "ينطلق نسخ احتياطي مبرمج تلقائيا كل ليلة."), answer: 2, image: "treatment-situations/sauvegarde-nuit.jpg" },
      ],
      feedback: t("On observe la part de l’humain et de la machine dans les opérations décrites.", "نلاحظ دور الإنسان والآلة في العمليات الموصوفة."),
    },
    {
      id: "s3-v2-rappel-poste", type: "match", level: "start", minutes: 4,
      title: t("Rappel 2 · Je reconnais le poste", "تذكير 2 · أتعرف على الحاسوب"),
      prompt: t("Observe les numéros sur la photo et associe chaque numéro au bon élément. Retrouve ensuite ces éléments sur ton poste.", "لاحظ الأرقام في الصورة واربط كل رقم بالمكون المناسب، ثم حدد هذه المكونات في حاسوبك."),
      image: { src: "session2/poste-informatique-numerote.png", alt: t("Poste informatique avec souris, clavier, écran et unité centrale numérotés", "حاسوب بفأرة ولوحة مفاتيح وشاشة ووحدة مركزية مرقمة"), caption: t("Le poste de travail · support de la séance 2", "حاسوب العمل · دعامة الحصة 2") },
      categories: [t("Souris", "فأرة"), t("Clavier", "لوحة مفاتيح"), t("Écran", "شاشة"), t("Unité centrale", "وحدة مركزية")],
      rows: [1, 2, 3, 4].map((n) => ({ label: t(`Numéro ${n}`, `الرقم ${n}`), answer: n - 1 })),
      feedback: t("L’ordinateur comprend une unité centrale et des périphériques.", "يتكون الحاسوب من وحدة مركزية وملحقات."),
    },
    {
      id: "s3-v2-rappel-peripheriques", type: "match", interaction: "drag", level: "start", minutes: 4,
      title: t("Rappel 2 · Une tâche, un périphérique", "تذكير 2 · لكل مهمة ملحق"),
      prompt: t("Glisse chaque matériel vers sa fonction. Tu peux aussi toucher une carte puis sa destination.", "اسحب كل جهاز نحو وظيفته، أو المس البطاقة ثم وجهتها."),
      categories: [t("Saisir un texte", "إدخال نص"), t("Afficher une image", "عرض صورة"), t("Conserver des fichiers", "حفظ الملفات")],
      rows: [{ label: t("Clavier", "لوحة مفاتيح"), image: "session2/items/ex02-card-05.jpg", answer: 0 }, { label: t("Écran", "شاشة"), image: "session2/items/ex02-card-16.png", answer: 1 }, { label: t("Clé USB", "مفتاح USB"), image: "session2/items/ex02-card-07.jpg", answer: 2 }],
      feedback: t("Le clavier est un périphérique d’entrée ; l’écran est un périphérique de sortie ; la clé USB sert au stockage.", "لوحة المفاتيح ملحق إدخال والشاشة ملحق إخراج ومفتاح USB للتخزين."),
    },
    {
      id: "s3-v2-rappel-composants", type: "match", level: "start", minutes: 3,
      title: t("Rappel 2 · À l’intérieur de l’unité centrale", "تذكير 2 · داخل الوحدة المركزية"),
      prompt: t("Associe chaque composant à sa fonction principale.", "اربط كل مكون بوظيفته الأساسية."),
      categories: [t("Exécuter les instructions et traiter", "تنفيذ التعليمات والمعالجة"), t("Conserver temporairement les données", "حفظ المعطيات مؤقتا"), t("Stocker durablement les fichiers", "تخزين الملفات بشكل دائم")],
      rows: [{ label: t("Processeur", "المعالج"), image: "session2/items/ex12-card-01.png", answer: 0 }, { label: t("RAM", "RAM"), image: "session2/items/ex12-card-03.jpg", answer: 1 }, { label: t("SSD", "SSD"), image: "session2/items/ex12-card-05.jpg", answer: 2 }],
      feedback: t("Le processeur traite, la RAM conserve temporairement et le SSD stocke durablement.", "يعالج المعالج وتحفظ RAM مؤقتا ويخزن SSD بشكل دائم."),
    },
    {
      id: "s3-v2-rappel-capacites", type: "conversions", level: "start", minutes: 4,
      title: t("Rappel 2 · Deux conversions", "تذكير 2 · تحويلان"),
      prompt: t("Convertis ces deux capacités avec la convention du cours : 1 Go = 1 000 Mo. Explique quand tu multiplies et quand tu divises.", "حول السعتين باعتماد قاعدة الدرس: 1 Go = 1000 Mo. اشرح متى تضرب ومتى تقسم."),
      rows: [{ before: "2 Go =", after: "Mo", accepted: ["2000"] }, { before: "3 000 Mo =", after: "Go", accepted: ["3"] }],
      feedback: t("2 × 1 000 = 2 000 Mo ; 3 000 ÷ 1 000 = 3 Go. Le rappel est terminé : passons au système d’exploitation.", "2 × 1000 = 2000 Mo و3000 ÷ 1000 = 3 Go. انتهى التذكير، لنكتشف نظام التشغيل."),
    },
    {
      id: "s3-v2-situation-os", type: "choice", level: "train", minutes: 10,
      title: t("Le poste de Sara s’allume… mais après ?", "يشتغل حاسوب سارة… ثم ماذا؟"),
      prompt: t("Le poste de Sara s’allume, mais elle n’accède ni au Bureau ni aux applications. Sur son téléphone Android, elle ouvre ses applications et retrouve ses photos. Quel rôle du système d’exploitation explique cette différence ? Discute avant de répondre.", "يشتغل حاسوب سارة لكنها لا تصل إلى سطح المكتب أو التطبيقات. في هاتف Android تفتح تطبيقاتها وتجد صورها. ما دور نظام التشغيل الذي يفسر الفرق؟ ناقش قبل الإجابة."),
      choices: [t("Il gère le matériel, permet d’exécuter les applications et organise les fichiers.", "يدير المعدات ويتيح تشغيل التطبيقات وتنظيم الملفات."), t("Il fournit l’énergie électrique aux composants.", "يزود المكونات بالطاقة الكهربائية."), t("Il sert uniquement à stocker les photos.", "يستعمل فقط لتخزين الصور.")], answer: 0,
      hint: t("Distingue le rôle du logiciel de base, de l’alimentation et du stockage.", "ميز وظيفة البرنامج الأساسي عن مزود الطاقة والتخزين."),
      feedback: t("Windows et Android sont des systèmes d’exploitation. Le matériel seul ne fournit pas l’environnement habituel des applications et des fichiers.", "Windows وAndroid نظاما تشغيل. لا توفر المعدات وحدها البيئة المعتادة للتطبيقات والملفات."),
    },
    {
      id: "s3-v2-android-windows", type: "match", level: "train", minutes: 10,
      title: t("Je connais Android, je découvre Windows", "أعرف Android وأكتشف Windows"),
      prompt: t("Pour chaque action connue sur Android, choisis comment réaliser la même intention sous Windows.", "لكل عملية تعرفها في Android اختر كيف تحقق الهدف نفسه في Windows."),
      categories: [t("Ouvrir une application depuis Démarrer", "فتح تطبيق انطلاقا من ابدأ"), t("Retrouver une application dans la barre des tâches", "العودة إلى تطبيق في شريط المهام"), t("Ouvrir l’Explorateur de fichiers", "فتح مستكشف الملفات"), t("Saisir au clavier physique", "الكتابة بلوحة المفاتيح")],
      rows: [{ label: t("Toucher l’icône d’une application", "لمس أيقونة تطبيق"), answer: 0 }, { label: t("Passer aux applications récentes", "الانتقال إلى التطبيقات الأخيرة"), answer: 1 }, { label: t("Ouvrir le gestionnaire de fichiers", "فتح مدير الملفات"), answer: 2 }, { label: t("Écrire avec le clavier tactile", "الكتابة بلوحة المفاتيح اللمسية"), answer: 3 }],
      feedback: t("Les gestes changent, mais les intentions restent proches : lancer, retrouver, organiser et saisir. Android est le système ; le navigateur est une application.", "تتغير الحركات وتتقارب الأهداف: الفتح والعودة والتنظيم والكتابة. Android هو النظام والمتصفح تطبيق."),
    },
    {
      id: "s3-v2-bureau-pratique", type: "system-lab", mode: "windows", level: "train", minutes: 15,
      title: t("À toi de manipuler le Bureau", "حان دورك لاستعمال سطح المكتب"),
      prompt: t("Entraîne-toi dans ce Bureau simulé, puis refais les mêmes gestes sur ton poste Windows. Ouvre les applications depuis Démarrer et suis les missions.", "تدرب في سطح المكتب المحاكى ثم أعد الحركات نفسها في حاسوب Windows. افتح التطبيقات انطلاقا من ابدأ واتبع المهام."),
      feedback: t("Tu as ouvert une application, déplacé sa fenêtre, réduit et retrouvé la fenêtre puis changé d’application. Explique ces gestes à ton binôme.", "فتحت تطبيقا وحركت نافذته وصغرتها وأظهرتها مجددا ثم انتقلت بين التطبيقات. اشرح هذه الحركات لزميلك."),
    },
    {
      id: "s3-v2-fichiers-extensions", type: "match", level: "train", minutes: 5,
      title: t("Fichier, dossier ou extension ?", "ملف أم مجلد أم امتداد؟"),
      prompt: t("Associe chaque élément à sa description. Dans cet exercice, Images est un dossier.", "اربط كل عنصر بوصفه. في هذا التمرين يمثل Images مجلدا."),
      categories: [t("Dossier : il organise les fichiers", "مجلد ينظم الملفات"), t("Fichier image", "ملف صورة"), t("Fichier texte", "ملف نص"), t("Extension qui renseigne sur le format", "امتداد يدل على الصيغة")],
      rows: [{ label: t("Images", "Images"), answer: 0 }, { label: t("Photo_club.jpg", "Photo_club.jpg"), answer: 1 }, { label: t("Compte_rendu.txt", "Compte_rendu.txt"), answer: 2 }, { label: t(".jpg", ".jpg"), answer: 3 }],
      feedback: t("Un fichier contient des informations, un dossier les organise et l’extension renseigne sur le format du fichier.", "يحتوي الملف على معلومات وينظمها المجلد ويدل الامتداد على صيغة الملف."),
    },
    {
      id: "s3-v2-operations", type: "match", level: "train", minutes: 5,
      title: t("Je choisis la bonne opération", "أختار العملية المناسبة"),
      prompt: t("Associe chaque intention à l’opération complète qui convient.", "اربط كل هدف بالعملية الكاملة المناسبة."),
      categories: [t("Copier puis coller", "نسخ ثم لصق"), t("Couper puis coller", "قص ثم لصق"), t("Renommer", "إعادة التسمية"), t("Rechercher", "البحث"), t("Restaurer depuis la Corbeille", "الاستعادة من سلة المحذوفات")],
      rows: [{ label: t("Créer un double en gardant l’original", "إنشاء نسخة مع الاحتفاظ بالأصل"), answer: 0 }, { label: t("Changer l’emplacement sans garder de double", "تغيير المكان دون الاحتفاظ بنسخة"), answer: 1 }, { label: t("Donner un nom clair au fichier", "منح الملف اسما واضحا"), answer: 2 }, { label: t("Retrouver un fichier par son nom", "العثور على ملف باسمه"), answer: 3 }, { label: t("Récupérer le brouillon supprimé", "استرجاع المسودة المحذوفة"), answer: 4 }],
      feedback: t("Pour déplacer, couper ne suffit pas : il faut ensuite coller dans le dossier de destination.", "للنقل لا يكفي القص، بل يجب اللصق بعده في المجلد المطلوب."),
    },
    {
      id: "s3-v2-defi-fichiers", type: "system-lab", mode: "files", level: "challenge", minutes: 25,
      title: t("Défi · Un espace de travail bien organisé", "تحدي · فضاء عمل منظم"),
      prompt: t("Organise les fichiers de Sara dans cet Explorateur simulé. Chaque mission se valide à partir du résultat obtenu. Échange les rôles avec ton binôme, puis réalise le rangement dans le dossier d’exercice de Windows.", "نظم ملفات سارة في مستكشف الملفات المحاكى. تتحقق كل مهمة حسب النتيجة المنجزة. تبادل الأدوار مع زميلك ثم أنجز التنظيم في مجلد التمرين داخل Windows."),
      feedback: t("Ton espace est organisé. Tu sais créer, déplacer, renommer, copier, rechercher et restaurer. Passe à la trace écrite, puis au bilan individuel.", "فضاء عملك منظم. أنجزت الإنشاء والنقل والتسمية والنسخ والبحث والاستعادة. انتقل إلى الخلاصة ثم التقويم الفردي."),
    },
  ],
};
