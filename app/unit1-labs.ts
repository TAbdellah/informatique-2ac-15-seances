import type { Lang, LocalizedText } from "./course-data";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export type ExerciseLevel = "start" | "train" | "challenge";

type ExerciseImage = {
  src: string;
  alt: LocalizedText;
  caption: LocalizedText;
};

type ExerciseBase = {
  id: string;
  level: ExerciseLevel;
  title: LocalizedText;
  prompt: LocalizedText;
  hint?: LocalizedText;
  feedback: LocalizedText;
  image?: ExerciseImage;
};

export type ChoiceExercise = ExerciseBase & {
  type: "choice";
  choices: LocalizedText[];
  answer: number;
};

export type MultiExercise = ExerciseBase & {
  type: "multi";
  choices: LocalizedText[];
  answers: number[];
};

export type MatchExercise = ExerciseBase & {
  type: "match";
  categories: LocalizedText[];
  rows: { label: LocalizedText; answer: number }[];
};

export type SequenceExercise = ExerciseBase & {
  type: "sequence";
  steps: LocalizedText[];
  shuffled: number[];
};

export type TextExercise = ExerciseBase & {
  type: "text";
  accepted: Record<Lang, string[]>;
  placeholder: LocalizedText;
};

export type GestureExercise = ExerciseBase & {
  type: "gesture";
  mode: "precision" | "double" | "typing";
};

export type Unit1Exercise =
  | ChoiceExercise
  | MultiExercise
  | MatchExercise
  | SequenceExercise
  | TextExercise
  | GestureExercise;

export type Unit1Lab = {
  title: LocalizedText;
  subtitle: LocalizedText;
  exercises: Unit1Exercise[];
};

export const levelLabels: Record<ExerciseLevel, LocalizedText> = {
  start: t("Niveau 1 · Je découvre", "المستوى 1 · أكتشف"),
  train: t("Niveau 2 · Je m’entraîne", "المستوى 2 · أتدرب"),
  challenge: t("Niveau 3 · Je résous", "المستوى 3 · أحل"),
};

const treatmentImage: ExerciseImage = {
  src: "traitements-manuel-semi-automatique-automatique.png",
  alt: t(
    "Comparaison des traitements manuel, semi-automatique et automatique",
    "مقارنة بين المعالجة اليدوية وشبه الآلية والآلية"
  ),
  caption: t("Support du cours · trois types de traitement", "دعامة الدرس · ثلاثة أنواع من المعالجة"),
};

const keyboardImage: ExerciseImage = {
  src: "https://i.imgur.com/iBf66HT.jpeg",
  alt: t("Photographie réelle d’un clavier", "صورة حقيقية للوحة مفاتيح"),
  caption: t("Photographie réelle · support du cours", "صورة حقيقية · دعامة الدرس"),
};

const processorImage: ExerciseImage = {
  src: "https://i.imgur.com/s7HPQ9D.png",
  alt: t("Photographie réelle d’un processeur", "صورة حقيقية لمعالج"),
  caption: t("Composant réel · support du cours", "مكون حقيقي · دعامة الدرس"),
};

const desktopImage: ExerciseImage = {
  src: "https://i.imgur.com/cwhu6dv.png",
  alt: t("Capture réelle d’un bureau Windows", "لقطة حقيقية لسطح مكتب Windows"),
  caption: t("Bureau Windows · support du cours", "سطح مكتب Windows · دعامة الدرس"),
};

export const unit1Labs: Record<1 | 2 | 3, Unit1Lab> = {
  1: {
    title: t("Laboratoire 1 · Information et traitement", "المختبر 1 · المعلومات والمعالجة"),
    subtitle: t(
      "14 exercices : premiers gestes, définitions, formes d’information et types de traitement.",
      "14 تمرينا: الحركات الأولى والتعاريف وأشكال المعلومات وأنواع المعالجة."
    ),
    exercises: [
      {
        id: "s1-geste-clic",
        type: "gesture",
        mode: "precision",
        level: "start",
        title: t("Précision de la souris", "دقة استعمال الفأرة"),
        prompt: t("Clique les cinq cibles dans l’ordre, de 1 à 5.", "انقر الأهداف الخمسة بالترتيب من 1 إلى 5."),
        hint: t("Pose l’index sur le bouton gauche et garde la main détendue.", "ضع السبابة على الزر الأيسر وأبق يدك مرتاحة."),
        feedback: t("Tu sais maintenant viser et cliquer avec précision.", "أصبحت قادرا على التوجيه والنقر بدقة."),
      },
      {
        id: "s1-geste-double",
        type: "gesture",
        mode: "double",
        level: "start",
        title: t("Ouvrir par double-clic", "الفتح بالنقر المزدوج"),
        prompt: t("Double-clique sur le dossier jaune pour l’ouvrir.", "انقر نقرا مزدوجا على المجلد الأصفر لفتحه."),
        hint: t("Deux clics rapides, sans déplacer la souris.", "نقرتان سريعتان دون تحريك الفأرة."),
        feedback: t("Le double-clic ouvre généralement un dossier ou un fichier.", "يفتح النقر المزدوج عادة مجلدا أو ملفا."),
      },
      {
        id: "s1-geste-saisie",
        type: "gesture",
        mode: "typing",
        level: "start",
        title: t("Écrire et valider", "الكتابة والتأكيد"),
        prompt: t("Écris ton prénom puis appuie sur Entrée.", "اكتب اسمك ثم اضغط Enter."),
        hint: t("Clique d’abord dans la zone blanche.", "انقر أولا داخل الخانة البيضاء."),
        feedback: t("Tu as utilisé le clavier et la touche Entrée.", "استعملت لوحة المفاتيح وزر Enter."),
      },
      {
        id: "s1-definition-mot",
        type: "choice",
        level: "start",
        title: t("Construire le mot", "تركيب الكلمة"),
        prompt: t("Le mot « informatique » vient de quels deux mots ?", "من أي كلمتين اشتقت كلمة «المعلوميات»؟"),
        choices: [
          t("Information + automatique", "معلومة + آلي"),
          t("Internet + mathématique", "إنترنت + رياضيات"),
          t("Image + technique", "صورة + تقنية"),
        ],
        answer: 0,
        feedback: t("Informatique = information + automatique.", "المعلوميات ترتبط بالمعلومة والمعالجة الآلية."),
      },
      {
        id: "s1-definition-informatique",
        type: "choice",
        level: "start",
        title: t("Choisir la bonne définition", "اختيار التعريف الصحيح"),
        prompt: t("Qu’est-ce que l’informatique ?", "ما المعلوميات؟"),
        choices: [
          t("La science du traitement automatique des informations", "علم المعالجة الآلية للمعلومات"),
          t("L’étude des câbles électriques uniquement", "دراسة الأسلاك الكهربائية فقط"),
          t("Une application de dessin", "تطبيق للرسم"),
        ],
        answer: 0,
        feedback: t("L’informatique automatise le traitement d’informations.", "تهتم المعلوميات بالمعالجة الآلية للمعلومات."),
      },
      {
        id: "s1-formes-associer",
        type: "match",
        level: "train",
        title: t("Associer les formes", "ربط أشكال المعلومات"),
        prompt: t("Classe chaque exemple dans sa forme d’information.", "صنف كل مثال حسب شكل المعلومة."),
        categories: [t("Texte", "نص"), t("Image", "صورة"), t("Son", "صوت"), t("Vidéo", "فيديو")],
        rows: [
          { label: t("Le règlement affiché de la salle", "قانون القاعة المكتوب"), answer: 0 },
          { label: t("La photo de la classe", "صورة القسم"), answer: 1 },
          { label: t("La sonnerie du collège", "جرس المؤسسة"), answer: 2 },
          { label: t("Un tutoriel filmé", "شرح مصور بالفيديو"), answer: 3 },
        ],
        feedback: t("Une même information peut être communiquée par plusieurs formes.", "يمكن تقديم المعلومة نفسها بأشكال متعددة."),
      },
      {
        id: "s1-formes-selection",
        type: "multi",
        level: "train",
        title: t("Sélection multiple", "اختيار متعدد"),
        prompt: t("Sélectionne uniquement les quatre formes d’information étudiées.", "حدد فقط أشكال المعلومات الأربعة المدروسة."),
        choices: [
          t("Texte", "نص"),
          t("Image", "صورة"),
          t("Son", "صوت"),
          t("Vidéo", "فيديو"),
          t("Clavier", "لوحة مفاتيح"),
          t("Câble", "سلك"),
        ],
        answers: [0, 1, 2, 3],
        feedback: t("Le clavier et le câble sont du matériel, pas des formes d’information.", "لوحة المفاتيح والسلك معدات وليسا شكلين للمعلومة."),
      },
      {
        id: "s1-traitement-ordre",
        type: "sequence",
        level: "train",
        title: t("Remettre un traitement en ordre", "ترتيب مراحل المعالجة"),
        prompt: t("Clique les trois étapes dans l’ordre logique.", "انقر المراحل الثلاث حسب ترتيبها المنطقي."),
        steps: [
          t("État initial : les données de départ", "الحالة الابتدائية: المعطيات الأولية"),
          t("Opérations : calculer, trier ou modifier", "العمليات: الحساب أو الترتيب أو التعديل"),
          t("État final : le résultat obtenu", "الحالة النهائية: النتيجة المحصل عليها"),
        ],
        shuffled: [1, 2, 0],
        feedback: t("Un traitement fait passer des données d’un état initial à un état final.", "تنقل المعالجة المعطيات من حالة ابتدائية إلى حالة نهائية."),
      },
      {
        id: "s1-traitement-definition",
        type: "choice",
        level: "train",
        title: t("Définir le traitement", "تعريف المعالجة"),
        prompt: t("Quelle phrase définit correctement un traitement ?", "ما الجملة التي تعرف المعالجة بشكل صحيح؟"),
        choices: [
          t("Une suite d’opérations pour obtenir un état final", "سلسلة عمليات للوصول إلى حالة نهائية"),
          t("Un seul clic sans résultat", "نقرة واحدة دون نتيجة"),
          t("Le nom donné à un écran", "اسم يطلق على الشاشة"),
        ],
        answer: 0,
        feedback: t("Le traitement transforme des données grâce à une suite d’opérations.", "تحول المعالجة المعطيات بواسطة سلسلة من العمليات."),
      },
      {
        id: "s1-types-image",
        type: "choice",
        level: "train",
        title: t("Lire l’image du cours", "قراءة صورة الدرس"),
        prompt: t("Une personne écrit une lettre entièrement à la main. Quel type de traitement est-ce ?", "يكتب شخص رسالة كاملة بيده. ما نوع هذه المعالجة؟"),
        choices: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
        answer: 0,
        feedback: t("Le traitement est manuel quand l’humain réalise seul toutes les opérations.", "تكون المعالجة يدوية عندما ينجز الإنسان كل العمليات وحده."),
        image: treatmentImage,
      },
      {
        id: "s1-types-associer",
        type: "match",
        level: "challenge",
        title: t("Classer six situations", "تصنيف ست وضعيات"),
        prompt: t("Pour chaque situation, choisis manuel, semi-automatique ou automatique.", "اختر لكل وضعية: يدوي أو شبه آلي أو آلي."),
        categories: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
        rows: [
          { label: t("Classer des dossiers papier à la main", "ترتيب ملفات ورقية باليد"), answer: 0 },
          { label: t("Scanner les produits à la caisse", "مسح المنتجات عند صندوق الأداء"), answer: 1 },
          { label: t("Saisir les notes dans un logiciel", "إدخال النقط في برنامج"), answer: 1 },
          { label: t("Un distributeur délivre un billet", "موزع آلي يقدم ورقة نقدية"), answer: 2 },
          { label: t("Une sauvegarde se lance seule chaque nuit", "نسخ احتياطي ينطلق وحده كل ليلة"), answer: 2 },
          { label: t("Additionner des nombres sur papier", "جمع أعداد على الورق"), answer: 0 },
        ],
        feedback: t("Observe surtout qui réalise les opérations : l’humain, les deux, ou la machine seule.", "لاحظ خصوصا من ينجز العمليات: الإنسان أو الاثنان أو الآلة وحدها."),
      },
      {
        id: "s1-automatique-caracteristiques",
        type: "multi",
        level: "challenge",
        title: t("Caractéristiques d’un traitement automatique", "خصائص المعالجة الآلية"),
        prompt: t("Quelles affirmations décrivent un traitement automatique ?", "ما العبارات التي تصف معالجة آلية؟"),
        choices: [
          t("La machine exécute entièrement le traitement", "تنجز الآلة المعالجة كاملة"),
          t("Il est généralement très rapide", "تكون عادة سريعة جدا"),
          t("Il peut être précis si les règles sont correctes", "قد تكون دقيقة إذا كانت القواعد صحيحة"),
          t("L’humain doit exécuter chaque étape", "يجب على الإنسان إنجاز كل خطوة"),
        ],
        answers: [0, 1, 2],
        feedback: t("Automatique signifie que la machine réalise le traitement selon des règles préparées.", "تعني المعالجة الآلية أن الآلة تنجز العمل وفق قواعد معدة."),
      },
      {
        id: "s1-situation-notes",
        type: "sequence",
        level: "challenge",
        title: t("Situation-problème : moyenne de classe", "وضعية مشكلة: معدل القسم"),
        prompt: t("Remets le traitement des notes dans l’ordre.", "رتب مراحل معالجة النقط."),
        steps: [
          t("Saisir les notes des élèves", "إدخال نقط التلاميذ"),
          t("Calculer la somme puis diviser par le nombre d’élèves", "حساب المجموع ثم القسمة على عدد التلاميذ"),
          t("Afficher la moyenne de la classe", "عرض معدل القسم"),
        ],
        shuffled: [2, 0, 1],
        feedback: t("Les notes sont les données, le calcul est le traitement et la moyenne est le résultat.", "النقط معطيات والحساب معالجة والمعدل نتيجة."),
      },
      {
        id: "s1-exemple-automatique",
        type: "text",
        level: "challenge",
        title: t("Produire un exemple", "إنتاج مثال"),
        prompt: t("Écris un exemple de traitement automatique vu dans le cours.", "اكتب مثالا لمعالجة آلية وردت في الدرس."),
        placeholder: t("Ex. : distributeur de billets", "مثال: موزع آلي للنقود"),
        accepted: {
          fr: ["distributeur", "distributeur de billets", "robot", "robot industriel", "sauvegarde", "sauvegarde automatique"],
          ar: ["موزع", "موزع آلي", "روبوت", "روبوت صناعي", "نسخ احتياطي", "حفظ تلقائي"],
        },
        feedback: t("Oui : la machine réalise seule les opérations prévues.", "صحيح: تنجز الآلة وحدها العمليات المبرمجة."),
      },
    ],
  },
  2: {
    title: t("Laboratoire 2 · Environnement matériel", "المختبر 2 · البيئة المادية"),
    subtitle: t(
      "13 exercices : périphériques, fonctions, composants internes et capacités.",
      "13 تمرينا: الملحقات ووظائفها والمكونات الداخلية والسعات."
    ),
    exercises: [
      {
        id: "s2-ordinateur-definition",
        type: "choice",
        level: "start",
        title: t("Reconnaître l’ordinateur", "التعرف على الحاسوب"),
        prompt: t("Un ordinateur est…", "الحاسوب هو…"),
        choices: [
          t("une machine de traitement automatique des informations", "آلة للمعالجة الآلية للمعلومات"),
          t("un écran uniquement", "شاشة فقط"),
          t("un meuble de rangement", "أثاث للتخزين"),
        ],
        answer: 0,
        feedback: t("L’ordinateur reçoit, traite, stocke et communique des informations.", "يستقبل الحاسوب المعلومات ويعالجها ويخزنها ويتواصل بها."),
      },
      {
        id: "s2-composition",
        type: "multi",
        level: "start",
        title: t("Composer un poste", "تركيب حاسوب"),
        prompt: t("Sélectionne les éléments nécessaires à un poste informatique de base.", "حدد العناصر الضرورية لحاسوب أساسي."),
        choices: [t("Unité centrale", "وحدة مركزية"), t("Écran", "شاشة"), t("Clavier", "لوحة مفاتيح"), t("Souris", "فأرة"), t("Agrafeuse", "دباسة")],
        answers: [0, 1, 2, 3],
        feedback: t("Le poste de base associe unité centrale, écran, clavier et souris.", "يتكون الحاسوب الأساسي من وحدة مركزية وشاشة ولوحة مفاتيح وفأرة."),
      },
      {
        id: "s2-clavier-photo",
        type: "choice",
        level: "start",
        title: t("Observer un périphérique réel", "ملاحظة ملحق حقيقي"),
        prompt: t("Quelle est la fonction principale de ce périphérique ?", "ما الوظيفة الأساسية لهذا الملحق؟"),
        choices: [t("Saisir du texte", "إدخال النص"), t("Imprimer sur papier", "الطباعة على الورق"), t("Diffuser du son", "إخراج الصوت")],
        answer: 0,
        feedback: t("Le clavier est un périphérique d’entrée utilisé pour saisir du texte et des commandes.", "لوحة المفاتيح ملحق إدخال لكتابة النصوص والتعليمات."),
        image: keyboardImage,
      },
      {
        id: "s2-peripheriques-roles",
        type: "match",
        level: "train",
        title: t("Associer périphérique et fonction", "ربط الملحق بوظيفته"),
        prompt: t("Choisis la fonction exacte de chaque périphérique.", "اختر الوظيفة الدقيقة لكل ملحق."),
        categories: [t("Afficher", "عرض"), t("Pointer", "توجيه"), t("Imprimer", "طباعة"), t("Numériser", "رقمنة")],
        rows: [
          { label: t("Écran", "شاشة"), answer: 0 },
          { label: t("Souris", "فأرة"), answer: 1 },
          { label: t("Imprimante", "طابعة"), answer: 2 },
          { label: t("Scanner", "ماسح ضوئي"), answer: 3 },
        ],
        feedback: t("Le nom du périphérique ne suffit pas : il faut connaître son rôle.", "لا يكفي اسم الملحق، بل يجب معرفة وظيفته."),
      },
      {
        id: "s2-categories",
        type: "match",
        level: "train",
        title: t("Classer les périphériques", "تصنيف الملحقات"),
        prompt: t("Classe chaque périphérique selon le sens de circulation de l’information.", "صنف كل ملحق حسب اتجاه انتقال المعلومات."),
        categories: [t("Entrée", "إدخال"), t("Sortie", "إخراج"), t("Entrée / sortie", "إدخال وإخراج"), t("Stockage", "تخزين")],
        rows: [
          { label: t("Microphone", "ميكروفون"), answer: 0 },
          { label: t("Vidéo-projecteur", "مسلاط"), answer: 1 },
          { label: t("Écran tactile", "شاشة لمسية"), answer: 2 },
          { label: t("Clé USB", "مفتاح USB"), answer: 3 },
          { label: t("Webcam", "كاميرا ويب"), answer: 0 },
          { label: t("Casque audio avec micro", "سماعة بميكروفون"), answer: 2 },
        ],
        feedback: t("Demande-toi si l’information entre, sort, circule dans les deux sens ou se conserve.", "اسأل: هل تدخل المعلومة أم تخرج أم تمر في الاتجاهين أم تخزن؟"),
      },
      {
        id: "s2-processeur-photo",
        type: "choice",
        level: "train",
        title: t("Identifier le processeur", "التعرف على المعالج"),
        prompt: t("Quel rôle joue le composant présenté ?", "ما دور المكون الظاهر؟"),
        choices: [t("Exécuter les instructions et les calculs", "تنفيذ التعليمات والحسابات"), t("Imprimer les documents", "طباعة الوثائق"), t("Déplacer le pointeur", "تحريك المؤشر")],
        answer: 0,
        feedback: t("Le processeur est souvent appelé le cerveau de l’ordinateur.", "يسمى المعالج غالبا دماغ الحاسوب."),
        image: processorImage,
      },
      {
        id: "s2-composants-roles",
        type: "match",
        level: "train",
        title: t("Relier les composants internes", "ربط المكونات الداخلية"),
        prompt: t("Associe chaque composant à son rôle principal.", "اربط كل مكون بوظيفته الأساسية."),
        categories: [
          t("Relier les composants", "ربط المكونات"),
          t("Traiter", "معالجة"),
          t("Mémoriser temporairement", "حفظ مؤقت"),
          t("Stocker durablement", "تخزين دائم"),
          t("Fournir l’énergie", "توفير الطاقة"),
        ],
        rows: [
          { label: t("Carte mère", "لوحة أم"), answer: 0 },
          { label: t("Processeur", "معالج"), answer: 1 },
          { label: t("RAM", "RAM"), answer: 2 },
          { label: t("SSD", "SSD"), answer: 3 },
          { label: t("Alimentation", "مزود الطاقة"), answer: 4 },
        ],
        feedback: t("Chaque composant a une mission précise dans l’unité centrale.", "لكل مكون وظيفة محددة داخل الوحدة المركزية."),
      },
      {
        id: "s2-securite",
        type: "multi",
        level: "train",
        title: t("Manipuler sans danger", "الاستعمال الآمن"),
        prompt: t("Sélectionne les comportements sûrs.", "حدد السلوكات الآمنة."),
        choices: [
          t("Éteindre et débrancher avant d’ouvrir l’unité centrale", "إطفاء الجهاز وفصله قبل فتح الوحدة المركزية"),
          t("Garder les mains sèches", "الحفاظ على جفاف اليدين"),
          t("Tirer sur les câbles pour aller plus vite", "سحب الأسلاك بسرعة"),
          t("Demander l’autorisation du professeur", "طلب إذن الأستاذ"),
        ],
        answers: [0, 1, 3],
        feedback: t("Le matériel électrique se manipule uniquement hors tension et avec autorisation.", "تستعمل المعدات الكهربائية بعد فصلها وبإذن الأستاذ."),
      },
      {
        id: "s2-unites-ordre",
        type: "sequence",
        level: "challenge",
        title: t("Ordonner les capacités", "ترتيب السعات"),
        prompt: t("Clique les unités de la plus petite à la plus grande.", "انقر الوحدات من الأصغر إلى الأكبر."),
        steps: [t("octet (B)", "octet (B)"), t("kilooctet (kB)", "kilooctet (kB)"), t("mégaoctet (MB)", "mégaoctet (MB)"), t("gigaoctet (GB)", "gigaoctet (GB)"), t("téraoctet (TB)", "téraoctet (TB)")],
        shuffled: [3, 0, 4, 2, 1],
        feedback: t("B < kB < MB < GB < TB.", "B < kB < MB < GB < TB."),
      },
      {
        id: "s2-ram-ssd",
        type: "choice",
        level: "challenge",
        title: t("Diagnostiquer un besoin", "تشخيص حاجة"),
        prompt: t("Les applications ouvertes deviennent lentes, mais il reste beaucoup d’espace disque. Quel composant manque probablement de capacité ?", "أصبحت التطبيقات المفتوحة بطيئة رغم وجود مساحة كبيرة في القرص. ما المكون الذي تنقصه السعة غالبا؟"),
        choices: [t("La RAM", "RAM"), t("L’imprimante", "الطابعة"), t("Le clavier", "لوحة المفاتيح")],
        answer: 0,
        feedback: t("La RAM accueille temporairement les programmes et données en cours d’utilisation.", "تستقبل RAM مؤقتا البرامج والمعطيات المستعملة حاليا."),
      },
      {
        id: "s2-stockage-choix",
        type: "choice",
        level: "challenge",
        title: t("Choisir un support", "اختيار وسيط تخزين"),
        prompt: t("Tu dois transporter un fichier vidéo de 4 GB. Quel support est le plus adapté ?", "تريد نقل فيديو حجمه 4 GB. ما الوسيط الأنسب؟"),
        choices: [t("Une clé USB de 16 GB", "مفتاح USB بسعة 16 GB"), t("Une feuille de papier", "ورقة"), t("Une RAM de 2 GB éteinte", "RAM بسعة 2 GB بعد الإطفاء")],
        answer: 0,
        feedback: t("Le support doit conserver les données et offrir une capacité supérieure au fichier.", "يجب أن يحفظ الوسيط المعطيات وأن تكون سعته أكبر من حجم الملف."),
      },
      {
        id: "s2-configuration",
        type: "choice",
        level: "challenge",
        title: t("Situation-problème : club multimédia", "وضعية مشكلة: نادي الوسائط"),
        prompt: t("Pour monter des vidéos, quelle configuration est la plus adaptée ?", "لتركيب الفيديوهات، أي تجهيز هو الأنسب؟"),
        choices: [
          t("Processeur rapide, 16 GB RAM, SSD 1 TB", "معالج سريع وRAM 16 GB وSSD 1 TB"),
          t("4 GB RAM et disque presque plein", "RAM 4 GB وقرص شبه ممتلئ"),
          t("Très bon clavier mais aucun stockage", "لوحة مفاتيح جيدة دون تخزين"),
        ],
        answer: 0,
        feedback: t("Le montage vidéo demande traitement rapide, mémoire suffisante et stockage durable.", "يتطلب تركيب الفيديو معالجة سريعة وذاكرة كافية وتخزينا دائما."),
      },
      {
        id: "s2-carte-mere",
        type: "text",
        level: "challenge",
        title: t("Nommer le composant central", "تسمية المكون المركزي"),
        prompt: t("Quel composant relie le processeur, la RAM, le stockage et les cartes ?", "ما المكون الذي يربط المعالج وRAM والتخزين والبطاقات؟"),
        placeholder: t("Écris le nom du composant", "اكتب اسم المكون"),
        accepted: { fr: ["carte mere", "carte mère"], ar: ["اللوحة الام", "اللوحة الأم", "لوحة أم", "لوحة الام"] },
        feedback: t("La carte mère relie et permet la communication entre les composants.", "تربط اللوحة الأم المكونات وتسمح بتواصلها."),
      },
    ],
  },
  3: {
    title: t("Laboratoire 3 · Bureau, fichiers et dossiers", "المختبر 3 · سطح المكتب والملفات والمجلدات"),
    subtitle: t(
      "14 exercices : système d’exploitation, bureau, extensions, rangement et opérations.",
      "14 تمرينا: نظام التشغيل وسطح المكتب والامتدادات والترتيب والعمليات."
    ),
    exercises: [
      {
        id: "s3-os-definition",
        type: "choice",
        level: "start",
        title: t("Définir le système d’exploitation", "تعريف نظام التشغيل"),
        prompt: t("Un système d’exploitation est…", "نظام التشغيل هو…"),
        choices: [
          t("un logiciel de base qui gère le matériel et les applications", "برنامج أساسي يدير المعدات والتطبيقات"),
          t("un fichier image", "ملف صورة"),
          t("un câble réseau", "سلك شبكة"),
        ],
        answer: 0,
        feedback: t("Sans système d’exploitation, l’utilisateur ne peut pas piloter facilement l’ordinateur.", "بدون نظام تشغيل لا يستطيع المستخدم التحكم بسهولة في الحاسوب."),
      },
      {
        id: "s3-os-exemples",
        type: "multi",
        level: "start",
        title: t("Reconnaître les systèmes", "التعرف على الأنظمة"),
        prompt: t("Sélectionne uniquement les systèmes d’exploitation.", "حدد أنظمة التشغيل فقط."),
        choices: [t("Windows", "Windows"), t("Linux", "Linux"), t("macOS", "macOS"), t("Android", "Android"), t("Clavier", "لوحة مفاتيح"), t("PDF", "PDF")],
        answers: [0, 1, 2, 3],
        feedback: t("Windows, Linux, macOS et Android sont des systèmes d’exploitation.", "Windows وLinux وmacOS وAndroid أنظمة تشغيل."),
      },
      {
        id: "s3-bureau-photo",
        type: "choice",
        level: "start",
        title: t("Observer le Bureau", "ملاحظة سطح المكتب"),
        prompt: t("Comment s’appelle l’écran principal affiché après la connexion ?", "ما اسم الشاشة الرئيسية التي تظهر بعد تسجيل الدخول؟"),
        choices: [t("Le Bureau", "سطح المكتب"), t("Le processeur", "المعالج"), t("La corbeille physique", "سلة ورقية")],
        answer: 0,
        feedback: t("Le Bureau donne accès aux applications, fichiers et fonctions du système.", "يتيح سطح المكتب الوصول إلى التطبيقات والملفات ووظائف النظام."),
        image: desktopImage,
      },
      {
        id: "s3-bureau-elements",
        type: "match",
        level: "train",
        title: t("Associer les éléments du Bureau", "ربط عناصر سطح المكتب"),
        prompt: t("Associe chaque élément à sa fonction.", "اربط كل عنصر بوظيفته."),
        categories: [
          t("Applications ouvertes", "التطبيقات المفتوحة"),
          t("Applications et paramètres", "التطبيقات والإعدادات"),
          t("Raccourcis", "اختصارات"),
          t("Heure, volume et réseau", "الوقت والصوت والشبكة"),
        ],
        rows: [
          { label: t("Barre des tâches", "شريط المهام"), answer: 0 },
          { label: t("Bouton Démarrer", "زر ابدأ"), answer: 1 },
          { label: t("Icônes", "أيقونات"), answer: 2 },
          { label: t("Zone de notification", "منطقة الإشعارات"), answer: 3 },
        ],
        feedback: t("Chaque zone du Bureau donne accès à une fonction précise.", "تمنح كل منطقة في سطح المكتب وظيفة محددة."),
      },
      {
        id: "s3-fichier-dossier",
        type: "match",
        level: "train",
        title: t("Distinguer fichier et dossier", "التمييز بين الملف والمجلد"),
        prompt: t("Classe chaque élément.", "صنف كل عنصر."),
        categories: [t("Fichier", "ملف"), t("Dossier", "مجلد")],
        rows: [
          { label: t("Rapport.docx", "Rapport.docx"), answer: 0 },
          { label: t("Images", "Images"), answer: 1 },
          { label: t("Photo.jpg", "Photo.jpg"), answer: 0 },
          { label: t("Travaux_2AC", "Travaux_2AC"), answer: 1 },
        ],
        feedback: t("Un fichier contient des données ; un dossier range des fichiers et d’autres dossiers.", "يحتوي الملف على معطيات بينما يرتب المجلد الملفات والمجلدات الأخرى."),
      },
      {
        id: "s3-extensions",
        type: "match",
        level: "train",
        title: t("Lire les extensions", "قراءة الامتدادات"),
        prompt: t("Associe chaque fichier à son type.", "اربط كل ملف بنوعه."),
        categories: [t("Texte", "نص"), t("Image", "صورة"), t("Audio", "صوت"), t("Vidéo", "فيديو"), t("Tableur", "جدول إلكتروني")],
        rows: [
          { label: t("Lettre.docx", "Lettre.docx"), answer: 0 },
          { label: t("Logo.png", "Logo.png"), answer: 1 },
          { label: t("Podcast.mp3", "Podcast.mp3"), answer: 2 },
          { label: t("Film.mp4", "Film.mp4"), answer: 3 },
          { label: t("Budget.xlsx", "Budget.xlsx"), answer: 4 },
        ],
        feedback: t("L’extension placée après le point indique le format du fichier.", "يبين الامتداد الموجود بعد النقطة صيغة الملف."),
      },
      {
        id: "s3-caracteristiques",
        type: "multi",
        level: "train",
        title: t("Lire les propriétés d’un fichier", "قراءة خصائص الملف"),
        prompt: t("Quelles informations font partie des caractéristiques d’un fichier ?", "ما المعلومات التي تعد من خصائص الملف؟"),
        choices: [t("Nom", "الاسم"), t("Extension", "الامتداد"), t("Taille", "الحجم"), t("Date de modification", "تاريخ التعديل"), t("Couleur du bureau", "لون سطح المكتب")],
        answers: [0, 1, 2, 3],
        feedback: t("Ces quatre caractéristiques aident à identifier et retrouver un fichier.", "تساعد هذه الخصائص الأربع على تحديد الملف والعثور عليه."),
      },
      {
        id: "s3-operations",
        type: "match",
        level: "train",
        title: t("Choisir la bonne opération", "اختيار العملية المناسبة"),
        prompt: t("Associe l’objectif à l’opération correcte.", "اربط الهدف بالعملية الصحيحة."),
        categories: [t("Copier", "نسخ"), t("Couper", "قص"), t("Renommer", "إعادة تسمية"), t("Supprimer", "حذف"), t("Rechercher", "بحث")],
        rows: [
          { label: t("Créer un double sans enlever l’original", "إنشاء نسخة مع إبقاء الأصل"), answer: 0 },
          { label: t("Déplacer vers un autre dossier", "نقل إلى مجلد آخر"), answer: 1 },
          { label: t("Changer le nom", "تغيير الاسم"), answer: 2 },
          { label: t("Envoyer à la Corbeille", "الإرسال إلى سلة المحذوفات"), answer: 3 },
          { label: t("Retrouver rapidement", "العثور بسرعة"), answer: 4 },
        ],
        feedback: t("Choisir la bonne opération évite les doublons et les pertes de fichiers.", "اختيار العملية المناسبة يمنع التكرار وضياع الملفات."),
      },
      {
        id: "s3-arborescence",
        type: "sequence",
        level: "challenge",
        title: t("Construire une arborescence", "بناء شجرة مجلدات"),
        prompt: t("Clique du dossier le plus général au fichier le plus précis.", "انقر من المجلد العام إلى الملف الأكثر تحديدا."),
        steps: [t("2AC", "2AC"), t("Informatique", "Informatique"), t("Travaux", "Travaux"), t("Projet_Reseau.pdf", "Projet_Reseau.pdf")],
        shuffled: [2, 0, 3, 1],
        feedback: t("Une arborescence va du général vers le particulier.", "تنتقل شجرة المجلدات من العام إلى الخاص."),
      },
      {
        id: "s3-nom-clair",
        type: "choice",
        level: "challenge",
        title: t("Nommer clairement", "اختيار اسم واضح"),
        prompt: t("Quel nom permet de retrouver le devoir le plus facilement ?", "أي اسم يسهل العثور على الفرض؟"),
        choices: [t("nouveau2.docx", "nouveau2.docx"), t("Devoir_Informatique_2AC_G03.docx", "Devoir_Informatique_2AC_G03.docx"), t("document.docx", "document.docx")],
        answer: 1,
        feedback: t("Un nom clair indique le contenu, la classe et, si utile, le groupe.", "يبين الاسم الواضح المحتوى والقسم والمجموعة عند الحاجة."),
      },
      {
        id: "s3-rangement-ordre",
        type: "sequence",
        level: "challenge",
        title: t("Ranger sans perdre", "الترتيب دون ضياع"),
        prompt: t("Remets les actions dans l’ordre pour ranger un nouveau devoir.", "رتب خطوات حفظ فرض جديد."),
        steps: [
          t("Créer ou ouvrir le bon dossier", "إنشاء أو فتح المجلد المناسب"),
          t("Donner un nom clair au fichier", "منح الملف اسما واضحا"),
          t("Enregistrer dans le dossier", "الحفظ داخل المجلد"),
          t("Vérifier que le fichier apparaît", "التحقق من ظهور الملف"),
        ],
        shuffled: [2, 1, 3, 0],
        feedback: t("Toujours vérifier le nom et l’emplacement après l’enregistrement.", "تحقق دائما من الاسم والمكان بعد الحفظ."),
      },
      {
        id: "s3-taille",
        type: "choice",
        level: "challenge",
        title: t("Comparer les tailles", "مقارنة الأحجام"),
        prompt: t("Quel fichier occupe le plus d’espace ?", "أي ملف يشغل مساحة أكبر؟"),
        choices: [t("Notes.txt · 12 kB", "Notes.txt · 12 kB"), t("Photo.jpg · 3 MB", "Photo.jpg · 3 MB"), t("Film.mp4 · 1,2 GB", "Film.mp4 · 1,2 GB")],
        answer: 2,
        feedback: t("1,2 GB est beaucoup plus grand que 3 MB et 12 kB.", "1,2 GB أكبر بكثير من 3 MB و12 kB."),
      },
      {
        id: "s3-situation-classe",
        type: "multi",
        level: "challenge",
        title: t("Situation-problème : Bureau désordonné", "وضعية مشكلة: سطح مكتب غير منظم"),
        prompt: t("Le Bureau contient 40 fichiers mélangés. Quelles actions sont pertinentes ?", "يحتوي سطح المكتب على 40 ملفا مختلطا. ما الخطوات المناسبة؟"),
        choices: [
          t("Créer des dossiers par matière", "إنشاء مجلدات حسب المواد"),
          t("Renommer les fichiers importants", "إعادة تسمية الملفات المهمة"),
          t("Déplacer les fichiers dans les bons dossiers", "نقل الملفات إلى المجلدات المناسبة"),
          t("Tout supprimer sans vérifier", "حذف كل شيء دون تحقق"),
        ],
        answers: [0, 1, 2],
        feedback: t("On structure, renomme et déplace ; on ne supprime jamais sans vérifier.", "ننظم ونعيد التسمية وننقل، ولا نحذف دون تحقق."),
      },
      {
        id: "s3-extension-texte",
        type: "text",
        level: "challenge",
        title: t("Écrire une extension", "كتابة امتداد"),
        prompt: t("Écris une extension courante de fichier image.", "اكتب امتدادا شائعا لملف صورة."),
        placeholder: t("Ex. : .jpg", "مثال: .jpg"),
        accepted: { fr: ["jpg", ".jpg", "jpeg", ".jpeg", "png", ".png", "gif", ".gif", "bmp", ".bmp"], ar: ["jpg", ".jpg", "jpeg", ".jpeg", "png", ".png", "gif", ".gif", "bmp", ".bmp"] },
        feedback: t(".jpg, .png, .gif et .bmp sont des extensions d’image courantes.", ".jpg و.png و.gif و.bmp امتدادات شائعة للصور."),
      },
    ],
  },
};
