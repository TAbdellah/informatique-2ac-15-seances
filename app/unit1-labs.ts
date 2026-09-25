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
  categoryImages?: (string | null)[];
  rows: { label: LocalizedText; answer: number; image?: string }[];
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

export type ConversionExercise = ExerciseBase & {
  type: "conversions";
  rows: { before: string; after: string; accepted: string[] }[];
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
  | ConversionExercise
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

const desktopImage: ExerciseImage = {
  src: "https://i.imgur.com/cwhu6dv.png",
  alt: t("Capture réelle d’un bureau Windows", "لقطة حقيقية لسطح مكتب Windows"),
  caption: t("Bureau Windows · support du cours", "سطح مكتب Windows · دعامة الدرس"),
};

const session2Image = (file: string, fr: string, ar: string): ExerciseImage => ({
  src: `session2/${file}`,
  alt: t(fr, ar),
  caption: t("Support visuel de l’exercice", "دعامة بصرية للتمرين"),
});

const workstationImage = session2Image("poste-informatique-numerote.png", "Souris, clavier, écran et unité centrale numérotés de 1 à 4", "فأرة ولوحة مفاتيح وشاشة ووحدة مركزية مرقمة من 1 إلى 4");

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
    title: t("Laboratoire 2 · Le matériel informatique", "المختبر 2 · معدات الحاسوب"),
    subtitle: t(
      "15 exercices progressifs : observer, identifier, classer, choisir, relier puis résoudre.",
      "15 تمرينا متدرجا: ألاحظ، أتعرف، أصنف، أختار، أربط ثم أحل."
    ),
    exercises: [
      {
        id: "s2-poste-reperes",
        type: "match",
        level: "start",
        title: t("Je reconnais le poste informatique", "أتعرف على مكونات الحاسوب"),
        prompt: t("Observe l’image. Associe chaque numéro au bon élément.", "لاحظ الصورة. اربط كل رقم بالعنصر المناسب."),
        categories: [t("Souris", "الفأرة"), t("Clavier", "لوحة المفاتيح"), t("Écran", "الشاشة"), t("Unité centrale", "الوحدة المركزية")],
        rows: [
          { label: t("Repère 1", "الرقم 1"), answer: 0 },
          { label: t("Repère 2", "الرقم 2"), answer: 1 },
          { label: t("Repère 3", "الرقم 3"), answer: 2 },
          { label: t("Repère 4", "الرقم 4"), answer: 3 },
        ],
        image: workstationImage,
        hint: t("Observe la forme de chaque objet avant de répondre.", "لاحظ شكل كل جهاز قبل الإجابة."),
        feedback: t("Le poste de base comprend une souris, un clavier, un écran et une unité centrale.", "يتكون الحاسوب المكتبي الأساسي من فأرة ولوحة مفاتيح وشاشة ووحدة مركزية."),
      },
      {
        id: "s2-poste-fonctions",
        type: "match",
        level: "start",
        title: t("À quoi sert chaque élément ?", "ما وظيفة كل عنصر؟"),
        prompt: t("Associe chaque élément du poste à son rôle principal.", "اربط كل عنصر من الحاسوب بوظيفته الأساسية."),
        categories: [t("Déplacer le pointeur", "تحريك المؤشر"), t("Saisir du texte", "إدخال النص"), t("Afficher les informations", "عرض المعلومات"), t("Traiter les informations", "معالجة المعلومات")],
        rows: [
          { label: t("Souris", "الفأرة"), answer: 0, image: "session2/items/ex02-card-04.jpg" },
          { label: t("Clavier", "لوحة المفاتيح"), answer: 1, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Écran", "الشاشة"), answer: 2, image: "session2/items/ex02-card-16.png" },
          { label: t("Unité centrale", "الوحدة المركزية"), answer: 3, image: "session2/items/unite-centrale-lenovo.jpg" },
        ],
        feedback: t("Les périphériques permettent de communiquer avec l’unité centrale qui traite les informations.", "تسمح الملحقات بالتواصل مع الوحدة المركزية التي تعالج المعلومات."),
      },
      {
        id: "s2-peripherique-ou-composant",
        type: "match",
        level: "start",
        title: t("Autour ou à l’intérieur ?", "في الخارج أم في الداخل؟"),
        prompt: t("Classe chaque élément : périphérique externe ou composant interne de l’unité centrale.", "صنف كل عنصر: ملحق خارجي أو مكون داخلي للوحدة المركزية."),
        categories: [t("Périphérique externe", "ملحق خارجي"), t("Composant interne", "مكون داخلي")],
        rows: [
          { label: t("Clavier", "لوحة المفاتيح"), answer: 0, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Écran", "الشاشة"), answer: 0, image: "session2/items/ex02-card-16.png" },
          { label: t("Imprimante", "الطابعة"), answer: 0, image: "session2/items/ex02-card-09.jpg" },
          { label: t("Processeur", "المعالج"), answer: 1, image: "session2/items/ex12-card-01.png" },
          { label: t("Mémoire RAM", "ذاكرة RAM"), answer: 1, image: "session2/items/ex12-card-03.jpg" },
          { label: t("Carte mère", "اللوحة الأم"), answer: 1, image: "session2/items/ex12-card-02.jpg" },
        ],
        feedback: t("Les périphériques sont reliés à l’ordinateur ; les composants internes se trouvent dans l’unité centrale.", "ترتبط الملحقات بالحاسوب، أما المكونات الداخلية فتوجد داخل الوحدة المركزية."),
      },
      {
        id: "s2-sens-information",
        type: "match",
        level: "train",
        title: t("Quel est le sens de l’information ?", "ما اتجاه انتقال المعلومة؟"),
        prompt: t("Pour chaque périphérique, indique si l’information entre, sort, circule dans les deux sens ou se conserve.", "حدد لكل ملحق: هل تدخل المعلومة أم تخرج أم تمر في الاتجاهين أم تخزن؟"),
        categories: [t("Entrée", "إدخال"), t("Sortie", "إخراج"), t("Entrée / sortie", "إدخال وإخراج"), t("Stockage", "تخزين")],
        rows: [
          { label: t("Clavier", "لوحة المفاتيح"), answer: 0, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Microphone", "الميكروفون"), answer: 0, image: "session2/items/ex02-card-13.jpg" },
          { label: t("Écran", "الشاشة"), answer: 1, image: "session2/items/ex02-card-16.png" },
          { label: t("Imprimante", "الطابعة"), answer: 1, image: "session2/items/ex02-card-09.jpg" },
          { label: t("Écran tactile", "الشاشة اللمسية"), answer: 2, image: "session2/items/ex02-card-11.jpg" },
          { label: t("Routeur", "الموجه"), answer: 2, image: "session2/items/ex02-card-08.jpg" },
          { label: t("Clé USB", "مفتاح USB"), answer: 3, image: "session2/items/ex02-card-07.jpg" },
          { label: t("Disque dur externe", "القرص الصلب الخارجي"), answer: 3, image: "session2/items/ex02-card-12.jpg" },
        ],
        hint: t("Pose-toi la question : l’information va-t-elle vers l’ordinateur ou vers l’utilisateur ?", "اسأل نفسك: هل تتجه المعلومة نحو الحاسوب أم نحو المستخدم؟"),
        feedback: t("La catégorie dépend du sens de circulation de l’information, pas de la forme du périphérique.", "يعتمد التصنيف على اتجاه انتقال المعلومة وليس على شكل الملحق."),
      },
      {
        id: "s2-peripheriques-roles",
        type: "match",
        level: "train",
        title: t("Je choisis le périphérique utile", "أختار الملحق المناسب"),
        prompt: t("Associe chaque besoin au périphérique qui permet de le réaliser.", "اربط كل حاجة بالملحق الذي يسمح بإنجازها."),
        categories: [t("Clavier", "لوحة المفاتيح"), t("Souris", "الفأرة"), t("Scanner", "الماسح الضوئي"), t("Imprimante", "الطابعة"), t("Microphone", "الميكروفون"), t("Haut-parleurs", "مكبرات الصوت"), t("Webcam", "كاميرا الويب")],
        rows: [
          { label: t("Écrire le titre d’un document", "كتابة عنوان وثيقة"), answer: 0, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Sélectionner une icône", "تحديد أيقونة"), answer: 1, image: "session2/items/ex02-card-04.jpg" },
          { label: t("Transformer une feuille en image numérique", "تحويل ورقة إلى صورة رقمية"), answer: 2, image: "session2/items/ex02-card-06.jpg" },
          { label: t("Obtenir le document sur papier", "الحصول على الوثيقة ورقيا"), answer: 3, image: "session2/items/ex02-card-09.jpg" },
          { label: t("Enregistrer la voix", "تسجيل الصوت"), answer: 4, image: "session2/items/ex02-card-13.jpg" },
          { label: t("Écouter un son avec la classe", "الاستماع إلى صوت مع القسم"), answer: 5, image: "session2/items/ex02-card-01.jpg" },
          { label: t("Participer à une visioconférence", "المشاركة في لقاء مرئي"), answer: 6, image: "session2/items/ex02-card-02.png" },
        ],
        feedback: t("On choisit un périphérique à partir de la tâche à accomplir.", "نختار الملحق انطلاقا من المهمة المطلوب إنجازها."),
      },
      {
        id: "s2-situation-expose",
        type: "multi",
        level: "train",
        title: t("Situation · Présenter un exposé", "وضعية · تقديم عرض"),
        prompt: t("Sara a préparé un diaporama sur une clé USB. Elle veut le présenter à toute la classe. Sélectionne uniquement le matériel nécessaire.", "أعدت سارة عرضا في مفتاح USB وتريد تقديمه أمام القسم. حدد المعدات الضرورية فقط."),
        choices: [
          t("Ordinateur", "حاسوب"),
          t("Clé USB", "مفتاح USB"),
          t("Vidéoprojecteur", "مسلاط"),
          t("Câble HDMI", "سلك HDMI"),
          t("Scanner", "ماسح ضوئي"),
          t("Imprimante", "طابعة"),
        ],
        answers: [0, 1, 2, 3],
        feedback: t("Il faut ouvrir le fichier, le transmettre à l’appareil d’affichage et le projeter ; scanner et imprimante sont inutiles ici.", "نحتاج إلى فتح الملف وربط جهاز العرض وإسقاط الصورة؛ لا نحتاج إلى الماسح الضوئي أو الطابعة."),
      },
      {
        id: "s2-choisir-ordinateur-simple",
        type: "choice",
        level: "train",
        title: t("Choisir un ordinateur · besoin simple", "اختيار حاسوب · حاجة بسيطة"),
        prompt: t("Amine veut rédiger ses devoirs, naviguer sur Internet et regarder des vidéos éducatives. Quel ordinateur répond correctement à son besoin sans chercher une puissance inutile ?", "يريد أمين كتابة واجباته وتصفح الإنترنت ومشاهدة فيديوهات تعليمية. أي حاسوب يلبي حاجته دون قوة غير ضرورية؟"),
        choices: [
          t("Core i3 / Ryzen 3, 8 Go RAM, SSD 256 Go", "Core i3 / Ryzen 3، وRAM 8 Go، وSSD 256 Go"),
          t("Core i9, 64 Go RAM, carte graphique haut de gamme", "Core i9، وRAM 64 Go، وبطاقة رسومية قوية جدا"),
          t("2 Go RAM, disque dur très ancien de 80 Go", "RAM 2 Go وقرص صلب قديم بسعة 80 Go"),
        ],
        answer: 0,
        feedback: t("Pour la bureautique, Internet et les vidéos, 8 Go de RAM et un SSD offrent un fonctionnement fluide sans surdimensionner le matériel.", "للكتابة والإنترنت والفيديو تكفي RAM بسعة 8 Go وقرص SSD لتشغيل سلس دون مبالغة في التجهيز."),
      },
      {
        id: "s2-branchements",
        type: "match",
        level: "train",
        title: t("Je réalise les bons branchements", "أنجز التوصيلات الصحيحة"),
        prompt: t("Associe chaque appareil au connecteur le plus adapté.", "اربط كل جهاز بالموصل الأنسب."),
        categories: [t("USB-A", "USB-A"), t("Jack audio", "Jack صوتي"), t("HDMI", "HDMI"), t("RJ45", "RJ45")],
        categoryImages: [
          "session2/items/ex07-pair-04-b.png",
          "session2/items/ex07-pair-01-b.jpg",
          "session2/items/ex07-pair-05-b.jpg",
          "session2/items/ex07-pair-03-b.jpg",
        ],
        rows: [
          { label: t("Souris", "الفأرة"), answer: 0, image: "session2/items/ex02-card-04.jpg" },
          { label: t("Imprimante", "الطابعة"), answer: 0, image: "session2/items/ex02-card-09.jpg" },
          { label: t("Casque", "سماعة الرأس"), answer: 1, image: "session2/items/ex02-card-14.jpg" },
          { label: t("Vidéoprojecteur récent", "مسلاط حديث"), answer: 2, image: "session2/items/ex02-card-15.jpg" },
          { label: t("Routeur par câble", "موجه بسلك"), answer: 3, image: "session2/items/ex02-card-08.jpg" },
        ],
        hint: t("Compare la forme du connecteur et celle du port.", "قارن شكل الموصل بشكل المنفذ."),
        feedback: t("Un branchement correct respecte la forme et la fonction du port ; on ne force jamais un connecteur.", "يحترم التوصيل الصحيح شكل المنفذ ووظيفته، ولا نجبر الموصل أبدا."),
      },
      {
        id: "s2-composants-roles",
        type: "match",
        level: "train",
        title: t("Dans l’unité centrale", "داخل الوحدة المركزية"),
        prompt: t("Associe chaque composant interne à sa mission.", "اربط كل مكون داخلي بوظيفته."),
        categories: [t("Exécuter les instructions", "تنفيذ التعليمات"), t("Mémoriser pendant le travail", "حفظ مؤقت أثناء العمل"), t("Conserver les fichiers", "حفظ الملفات"), t("Relier les composants", "ربط المكونات"), t("Fournir l’énergie", "توفير الطاقة")],
        rows: [
          { label: t("Processeur", "المعالج"), answer: 0, image: "session2/items/ex12-card-01.png" },
          { label: t("Mémoire RAM", "ذاكرة RAM"), answer: 1, image: "session2/items/ex12-card-03.jpg" },
          { label: t("SSD / disque dur", "SSD / القرص الصلب"), answer: 2, image: "session2/items/ex12-card-05.jpg" },
          { label: t("Carte mère", "اللوحة الأم"), answer: 3, image: "session2/items/ex12-card-02.jpg" },
          { label: t("Bloc d’alimentation", "مزود الطاقة"), answer: 4, image: "session2/items/ex12-card-07.jpg" },
        ],
        feedback: t("Le processeur traite, la RAM mémorise temporairement, le disque conserve, la carte mère relie et l’alimentation fournit l’énergie.", "يعالج المعالج، وتحفظ RAM مؤقتا، ويخزن القرص، وتربط اللوحة الأم المكونات، ويوفر مزود الطاقة الكهرباء."),
      },
      {
        id: "s2-unites-ordre",
        type: "sequence",
        level: "challenge",
        title: t("L’échelle des capacités", "سلم وحدات السعة"),
        prompt: t("Construis l’échelle de la plus petite unité à la plus grande.", "رتب الوحدات من الأصغر إلى الأكبر."),
        steps: [t("bit", "bit"), t("octet", "octet"), t("Ko", "Ko"), t("Mo", "Mo"), t("Go", "Go"), t("To", "To")],
        shuffled: [4, 1, 5, 2, 0, 3],
        feedback: t("bit < octet < Ko < Mo < Go < To.", "bit < octet < Ko < Mo < Go < To."),
      },
      {
        id: "s2-conversions-capacites",
        type: "conversions",
        level: "challenge",
        title: t("Conversions des unités de capacité", "تحويل وحدات السعة"),
        prompt: t("Complète toutes les conversions. Utilise l’échelle ci-dessous pour choisir multiplication ou division.", "أكمل جميع التحويلات. استعمل السلم أسفله لاختيار الضرب أو القسمة."),
        image: session2Image("regle-conversion-capacites.png", "Règle de conversion entre bit, octet, Ko, Mo, Go et To", "قاعدة التحويل بين bit وoctet وKo وMo وGo وTo"),
        rows: [
          { before: "12 Mo =", after: "Ko", accepted: ["12000", "12 000"] },
          { before: "20 Go =", after: "Mo", accepted: ["20000", "20 000"] },
          { before: "312 Octets =", after: "bits", accepted: ["2496", "2 496"] },
          { before: "4 To =", after: "Ko", accepted: ["4000000000", "4 000 000 000"] },
          { before: "100 bits =", after: "octets", accepted: ["12.5", "12,5"] },
          { before: "30 Go =", after: "Mo", accepted: ["30000", "30 000"] },
          { before: "902 Octets =", after: "bits", accepted: ["7216", "7 216"] },
          { before: "16 000 000 Mo =", after: "To", accepted: ["16"] },
        ],
        hint: t("Vers une unité plus petite : multiplier. Vers une unité plus grande : diviser. Entre bit et octet, utiliser 8.", "نحو وحدة أصغر: نضرب. نحو وحدة أكبر: نقسم. بين bit وoctet نستعمل 8."),
        feedback: t("Toutes les conversions sont correctes. Tu sais utiliser l’échelle des capacités.", "جميع التحويلات صحيحة. أصبحت تعرف استعمال سلم وحدات السعة."),
      },
      {
        id: "s2-choisir-ordinateur-complexe",
        type: "choice",
        level: "challenge",
        title: t("Choisir un ordinateur · projet multimédia", "اختيار حاسوب · مشروع وسائط متعددة"),
        prompt: t("Le club doit monter des vidéos Full HD, travailler avec plusieurs applications et conserver de nombreux projets. Quelle configuration est la plus équilibrée ?", "يحتاج النادي إلى تركيب فيديوهات Full HD وتشغيل عدة تطبيقات وحفظ مشاريع كثيرة. ما التجهيز الأكثر توازنا؟"),
        choices: [
          t("Core i5 / Ryzen 5 récent, 16 Go RAM, SSD 512 Go, carte graphique adaptée", "Core i5 / Ryzen 5 حديث، وRAM 16 Go، وSSD 512 Go، وبطاقة رسومية مناسبة"),
          t("Core i3 ancien, 4 Go RAM, disque HDD 250 Go", "Core i3 قديم، وRAM 4 Go، وقرص HDD بسعة 250 Go"),
          t("Processeur rapide, 8 Go RAM, SSD 128 Go presque plein", "معالج سريع، وRAM 8 Go، وSSD 128 Go شبه ممتلئ"),
        ],
        answer: 0,
        feedback: t("Le montage vidéo exige un processeur récent, assez de RAM, un SSD spacieux et une capacité graphique adaptée. Il faut équilibrer tous les composants.", "يتطلب تركيب الفيديو معالجا حديثا وRAM كافية وSSD واسعا وقدرة رسومية مناسبة. يجب تحقيق التوازن بين جميع المكونات."),
      },
      {
        id: "s2-diagnostic-lenteur",
        type: "choice",
        level: "challenge",
        title: t("Diagnostic · L’ordinateur devient lent", "تشخيص · الحاسوب أصبح بطيئا"),
        prompt: t("Plusieurs applications sont ouvertes et l’ordinateur devient lent, alors que le disque possède encore beaucoup d’espace. Quel composant faut-il probablement augmenter ?", "هناك تطبيقات كثيرة مفتوحة والحاسوب بطيء رغم وجود مساحة كبيرة في القرص. ما المكون الذي نحتاج غالبا إلى زيادة سعته؟"),
        choices: [t("La mémoire RAM", "ذاكرة RAM"), t("L’imprimante", "الطابعة"), t("Le clavier", "لوحة المفاتيح")],
        answer: 0,
        feedback: t("La RAM conserve temporairement les programmes en cours d’utilisation ; une capacité insuffisante ralentit le travail.", "تحتفظ RAM مؤقتا بالبرامج المستعملة، وقد يؤدي نقص سعتها إلى بطء العمل."),
      },
      {
        id: "s2-securite",
        type: "multi",
        level: "challenge",
        title: t("Avant de manipuler le matériel", "قبل لمس المعدات"),
        prompt: t("Sélectionne les trois règles de sécurité indispensables.", "حدد قواعد السلامة الثلاث الضرورية."),
        choices: [
          t("Éteindre et débrancher l’ordinateur", "إطفاء الحاسوب وفصله"),
          t("Garder les mains sèches", "الحفاظ على جفاف اليدين"),
          t("Demander l’autorisation du professeur", "طلب إذن الأستاذ"),
          t("Forcer le connecteur s’il résiste", "إجبار الموصل إذا لم يدخل"),
          t("Tirer sur le câble pour le débrancher", "سحب السلك لفصله"),
        ],
        answers: [0, 1, 2],
        feedback: t("On travaille hors tension, avec les mains sèches, sous la responsabilité du professeur et sans jamais forcer.", "نشتغل بعد فصل الكهرباء وبيدين جافتين وتحت إشراف الأستاذ، ولا نجبر أي موصل."),
      },
      {
        id: "s2-defi-final",
        type: "choice",
        level: "challenge",
        title: t("Défi final · Sauver le travail", "التحدي النهائي · حفظ العمل"),
        prompt: t("Youssef termine son document. Il veut l’emporter et le modifier sur un autre ordinateur. Quelle action est correcte ?", "أنهى يوسف وثيقته ويريد نقلها وتعديلها في حاسوب آخر. ما الإجراء الصحيح؟"),
        choices: [
          t("Enregistrer le fichier sur une clé USB puis l’éjecter correctement", "حفظ الملف في مفتاح USB ثم إخراجه بطريقة صحيحة"),
          t("Le laisser uniquement dans la RAM puis éteindre", "تركه في RAM ثم إطفاء الحاسوب"),
          t("Prendre une photo de l’écran sans enregistrer", "التقاط صورة للشاشة دون حفظ الملف"),
        ],
        answer: 0,
        feedback: t("La clé USB conserve le fichier après l’arrêt et permet de le transporter ; la RAM est temporaire.", "يحفظ مفتاح USB الملف بعد إطفاء الحاسوب ويسمح بنقله، أما RAM فذاكرة مؤقتة."),
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
