"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flag,
  Lightbulb,
  LockKeyhole,
  Network,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StudentProfile } from "@/lib/supabase-api";
import { publicAsset } from "@/lib/public-assets";
import { useTeacherCourse } from "@/lib/teacher-course-context";
import "./revision-workshop.css";

type LocalText = { fr: string; ar: string };
type Option = { id: string; label: LocalText; image?: string };
type VisualItem = { id: string; label: LocalText; image?: string; answer: string };
type Field = { id: string; label: LocalText; answers?: string[]; containsAny?: string[]; endsWith?: string[]; placeholder?: string };
type Task = {
  id: string;
  title: LocalText;
  instruction: LocalText;
  kind: "categorize" | "pairing" | "order" | "fields" | "selectMany" | "single";
  image?: string;
  imageAlt?: string;
  options?: Option[];
  items?: VisualItem[];
  steps?: LocalText[];
  stepImages?: string[];
  fields?: Field[];
  choices?: Array<Option & { image?: string }>;
  answer?: string | string[];
  selectionCount?: number;
  hint: LocalText;
  success: LocalText;
};
type Mission = {
  id: string;
  number: string;
  minutes: number;
  title: LocalText;
  situation: LocalText;
  skill: LocalText;
  color: string;
  tasks: Task[];
};
type Submission = {
  sessionId: number;
  activityType: "workshop" | "quiz" | "session_completion";
  activityId: string;
  answer: unknown;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
};
type TaskAnswer = string | string[] | number[] | Record<string, string>;

const t = (fr: string, ar: string): LocalText => ({ fr, ar });
const evaluationUrl = "https://tabdellah.github.io/evaluation-1-2ac/duo/#eleve";
const activityLabel = (count: number) => `${count} activité${count > 1 ? "s" : ""}`;

function stableShuffle<T>(values: T[], seedText: string) {
  const result = [...values];
  let seed = 2166136261;
  for (const character of seedText) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = Math.imul(seed ^ (seed >>> 15), 2246822519);
    const target = (seed >>> 0) % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function deAlignOptions(options: Option[], items: VisualItem[]) {
  if (options.length < 2 || options.length !== items.length) return options;
  let best = options;
  let fewestMatches = Number.POSITIVE_INFINITY;
  for (let offset = 0; offset < options.length; offset += 1) {
    const candidate = options.map((_, index) => options[(index + offset) % options.length]);
    const matches = candidate.filter((option, index) => option.id === items[index]?.answer).length;
    if (matches < fewestMatches) {
      best = candidate;
      fewestMatches = matches;
    }
    if (matches === 0) break;
  }
  return best;
}

const missions: Mission[] = [
  {
    id: "information", number: "01", minutes: 10, color: "cyan",
    title: t("Information & traitement", "المعلومات والمعالجة"),
    situation: t("Le club prépare un reportage. Tu dois reconnaître les informations et expliquer comment elles sont traitées.", "يُعِدّ النادي تقريرًا. عليك التعرف على المعلومات وشرح كيفية معالجتها."),
    skill: t("Observer · classer · ordonner", "الملاحظة · التصنيف · الترتيب"),
    tasks: [
      {
        id: "formes-visuelles", kind: "categorize",
        title: t("Les quatre formes d’information", "أشكال المعلومات الأربعة"),
        instruction: t("Identifie la forme principale de chaque document.", "حدد الشكل الرئيسي لكل وثيقة."),
        options: [
          { id: "texte", label: t("Texte", "نص") }, { id: "image", label: t("Image", "صورة") },
          { id: "son", label: t("Son", "صوت") }, { id: "video", label: t("Vidéo", "فيديو") },
        ],
        items: [
          { id: "rapport", label: t("Compte rendu", "تقرير مكتوب"), image: "session3/visuels/information-texte.svg", answer: "texte" },
          { id: "photo", label: t("Photo du club", "صورة النادي"), image: "session3/visuels/information-photo.svg", answer: "image" },
          { id: "interview", label: t("Interview enregistrée", "مقابلة مسجلة"), image: "session3/visuels/information-audio.svg", answer: "son" },
          { id: "tutoriel", label: t("Tutoriel filmé", "شرح مصور"), image: "session3/visuels/information-video.svg", answer: "video" },
        ],
        hint: t("Demande-toi si l’on doit lire, regarder ou écouter.", "اسأل نفسك: هل نقرأ أم نشاهد أم نستمع؟"),
        success: t("Tu distingues les quatre formes d’information.", "أنت تميز أشكال المعلومات الأربعة."),
      },
      {
        id: "chaine-traitement", kind: "order",
        title: t("La chaîne d’un traitement", "مراحل المعالجة"),
        instruction: t("Le professeur veut calculer la moyenne de trois notes. Observe les cartes, puis reconstruis la chaîne complète.", "يريد الأستاذ حساب معدل ثلاث نقط. لاحظ البطاقات ثم أعد بناء مراحل المعالجة كاملة."),
        steps: [
          t("État initial · les notes 12, 14 et 16", "الحالة الابتدائية · النقط 12 و14 و16"),
          t("Traitement · calculer (12 + 14 + 16) ÷ 3", "المعالجة · حساب (12 + 14 + 16) ÷ 3"),
          t("État final · la moyenne obtenue est 14/20", "الحالة النهائية · المعدل المحصل عليه هو 14/20"),
        ],
        stepImages: ["session3/visuels/traitement-donnees.svg", "session3/visuels/traitement-calcul.svg", "session3/visuels/traitement-resultat.svg"],
        hint: t("Commence par les données disponibles, effectue l’opération, puis place le résultat.", "ابدأ بالمعطيات المتوفرة ثم أنجز العملية وضع النتيجة في النهاية."),
        success: t("Tu sais reconnaître l’état initial, le traitement et l’état final dans une situation réelle.", "أنت تعرف الحالة الابتدائية والمعالجة والحالة النهائية في وضعية حقيقية."),
      },
      {
        id: "types-traitement", kind: "categorize",
        title: t("Manuel, semi-automatique ou automatique", "يدوي أو شبه آلي أو آلي"),
        instruction: t("Classe chaque situation selon l’intervention de l’être humain.", "صنف كل وضعية حسب تدخل الإنسان."),
        options: [
          { id: "manuel", label: t("Manuel", "يدوي") }, { id: "semi", label: t("Semi-automatique", "شبه آلي") },
          { id: "auto", label: t("Automatique", "آلي") },
        ],
        items: [
          { id: "calcul", label: t("Calcul sur papier", "حساب على الورق"), image: "treatment-situations/calcul-papier.jpg", answer: "manuel" },
          { id: "caisse", label: t("Produit scanné à la caisse", "مسح منتج في صندوق الأداء"), image: "treatment-situations/caisse-scanner.jpg", answer: "semi" },
          { id: "backup", label: t("Sauvegarde programmée la nuit", "نسخ احتياطي مبرمج ليلًا"), image: "treatment-situations/sauvegarde-nuit.jpg", answer: "auto" },
        ],
        hint: t("Humain seul, humain + machine, ou machine seule.", "إنسان فقط، إنسان مع آلة، أو آلة فقط."),
        success: t("Tu reconnais le niveau d’automatisation d’un traitement.", "أنت تميز مستوى أتمتة المعالجة."),
      },
    ],
  },
  {
    id: "materiel", number: "02", minutes: 15, color: "yellow",
    title: t("Matériel & capacités", "المعدات والسعات"),
    situation: t("Un poste doit être préparé pour la salle informatique. Vérifie ses périphériques, ses composants et son stockage.", "يجب تجهيز حاسوب لقاعة المعلوميات. تحقق من أجهزته الطرفية ومكوناته وسعة التخزين."),
    skill: t("Identifier · associer · calculer · choisir", "التعرف · الربط · الحساب · الاختيار"),
    tasks: [
      {
        id: "peripheriques-reels", kind: "categorize",
        title: t("Périphériques réels", "أجهزة طرفية حقيقية"),
        instruction: t("Classe les six périphériques selon leur fonction principale.", "صنف الأجهزة الستة حسب وظيفتها الرئيسية."),
        options: [{ id: "entree", label: t("Entrée", "إدخال") }, { id: "sortie", label: t("Sortie", "إخراج") }, { id: "stockage", label: t("Stockage", "تخزين") }],
        items: [
          { id: "clavier", label: t("Clavier", "لوحة المفاتيح"), image: "session2/items/ex02-card-05.jpg", answer: "entree" },
          { id: "souris", label: t("Souris", "الفأرة"), image: "session2/items/ex02-card-04.jpg", answer: "entree" },
          { id: "ecran", label: t("Écran", "الشاشة"), image: "session2/items/ex02-card-16.png", answer: "sortie" },
          { id: "imprimante", label: t("Imprimante", "الطابعة"), image: "session2/items/ex02-card-09.jpg", answer: "sortie" },
          { id: "cle", label: t("Clé USB", "مفتاح USB"), image: "session2/items/ex02-card-07.jpg", answer: "stockage" },
          { id: "micro", label: t("Microphone", "الميكروفون"), image: "session2/items/ex02-card-13.jpg", answer: "entree" },
        ],
        hint: t("L’information entre, sort ou est conservée.", "المعلومة تدخل أو تخرج أو يتم الاحتفاظ بها."),
        success: t("Tu classes correctement les périphériques.", "أنت تصنف الأجهزة الطرفية بشكل صحيح."),
      },
      {
        id: "composants-internes", kind: "pairing",
        title: t("À l’intérieur de l’unité centrale", "داخل الوحدة المركزية"),
        instruction: t("Choisis un rôle, puis clique sur la photo du composant correspondant. Aucune liste déroulante.", "اختر وظيفة ثم انقر على صورة المكون المناسب. لا توجد قوائم منسدلة."),
        options: [
          { id: "execute", label: t("Exécute les instructions", "ينفذ التعليمات") }, { id: "temporaire", label: t("Mémoire temporaire", "ذاكرة مؤقتة") },
          { id: "relie", label: t("Relie les composants", "تربط المكونات") }, { id: "stocke", label: t("Stocke les fichiers", "يخزن الملفات") },
          { id: "alimente", label: t("Fournit l’électricité", "يوفر الكهرباء") },
        ],
        items: [
          { id: "cpu", label: t("Processeur", "المعالج"), image: "session2/items/ex12-card-01.png", answer: "execute" },
          { id: "ram", label: t("Mémoire RAM", "ذاكرة RAM"), image: "session2/items/ex12-card-03.jpg", answer: "temporaire" },
          { id: "motherboard", label: t("Carte mère", "اللوحة الأم"), image: "session2/items/ex12-card-02.jpg", answer: "relie" },
          { id: "ssd", label: t("Disque SSD", "قرص SSD"), image: "session2/items/ex12-card-05.jpg", answer: "stocke" },
          { id: "power", label: t("Bloc d’alimentation", "مزود الطاقة"), image: "session2/items/ex12-card-07.jpg", answer: "alimente" },
        ],
        hint: t("Sépare calcul, mémoire, liaison, stockage et alimentation.", "ميز بين الحساب والذاكرة والربط والتخزين والطاقة."),
        success: t("Les rôles essentiels de l’unité centrale sont acquis.", "تم اكتساب الوظائف الأساسية للوحدة المركزية."),
      },
      {
        id: "ports-connecteurs", kind: "pairing",
        title: t("Quel connecteur utiliser ?", "أي موصل نستعمل؟"),
        instruction: t("Observe les vraies photos. Choisis un connecteur, puis clique sur le besoin correspondant.", "لاحظ الصور الحقيقية. اختر موصلًا ثم انقر على الاستعمال المناسب."),
        options: [
          { id: "usb", label: t("USB", "USB"), image: "session2/items/ex07-pair-04-b.png" },
          { id: "hdmi", label: t("HDMI", "HDMI"), image: "session2/items/ex07-pair-05-b.jpg" },
          { id: "rj45", label: t("RJ45", "RJ45"), image: "session2/items/ex07-pair-03-b.jpg" },
          { id: "jack", label: t("Jack audio", "مقبس الصوت"), image: "session2/items/ex07-pair-01-b.jpg" },
        ],
        items: [
          { id: "keyboard-port", label: t("Brancher le clavier", "ربط لوحة المفاتيح"), answer: "usb" },
          { id: "screen-port", label: t("Transmettre l’image vers l’écran", "نقل الصورة إلى الشاشة"), answer: "hdmi" },
          { id: "network-port", label: t("Relier le PC au switch", "ربط الحاسوب بالمبدل"), answer: "rj45" },
          { id: "headset-port", label: t("Brancher un casque filaire", "ربط سماعة سلكية"), answer: "jack" },
        ],
        hint: t("Observe la forme du port et la fonction du câble.", "لاحظ شكل المنفذ ووظيفة الكابل."),
        success: t("Tu sais choisir le bon connecteur.", "أنت تعرف اختيار الموصل المناسب."),
      },
      {
        id: "conversions-capacites", kind: "fields",
        title: t("Conversions de capacité", "تحويلات السعة"),
        instruction: t("Calcule sans unité dans les cases. Rappel : unité plus petite ×1000, unité plus grande ÷1000.", "احسب دون كتابة الوحدة. تذكير: نحو وحدة أصغر ×1000، ونحو وحدة أكبر ÷1000."),
        image: "session2/regle-conversion-capacites.png", imageAlt: "Règle de conversion des unités de capacité",
        fields: [
          { id: "go-mo", label: t("4 Go = … Mo", "4 Go = … Mo"), answers: ["4000", "4 000"], placeholder: "… Mo" },
          { id: "mo-go", label: t("7500 Mo = … Go", "7500 Mo = … Go"), answers: ["7,5", "7.5"], placeholder: "… Go" },
        ],
        hint: t("Vérifie le sens : descendre = multiplier, monter = diviser.", "تحقق من الاتجاه: النزول ضرب، والصعود قسمة."),
        success: t("Les conversions ×1000 et ÷1000 sont maîtrisées.", "تم إتقان التحويلات ×1000 و÷1000."),
      },
      {
        id: "choix-pc-classe", kind: "selectMany", selectionCount: 4,
        title: t("Choisir un ordinateur pour la classe", "اختيار حاسوب للقسم"),
        instruction: t("Pour Word, Internet, vidéos pédagogiques et stockage rapide, choisis exactement 4 éléments utiles — sans équipement de jeu coûteux.", "لاستعمال Word والإنترنت والفيديوهات التعليمية والتخزين السريع، اختر 4 عناصر مفيدة بالضبط دون تجهيزات ألعاب مكلفة."),
        image: "session2/items/unite-centrale-lenovo.jpg", imageAlt: "Unité centrale destinée à une salle de classe",
        choices: [
          { id: "cpu", label: t("Processeur récent", "معالج حديث") }, { id: "ram", label: t("8 Go de RAM", "ذاكرة RAM بسعة 8 Go") },
          { id: "ssd", label: t("SSD 256 Go", "قرص SSD بسعة 256 Go") }, { id: "network", label: t("Carte réseau", "بطاقة شبكة") },
          { id: "gpu", label: t("Carte graphique gaming", "بطاقة رسومات للألعاب") }, { id: "rgb", label: t("Éclairage RGB", "إضاءة RGB") },
          { id: "disk", label: t("Disque 8 To", "قرص 8 To") },
        ],
        answer: ["cpu", "ram", "ssd", "network"],
        hint: t("Cherche l’essentiel : calcul, mémoire, rapidité et connexion.", "ابحث عن الضروري: المعالجة والذاكرة والسرعة والاتصال."),
        success: t("Tu sais choisir une configuration adaptée au besoin.", "أنت تعرف اختيار تجهيز مناسب للحاجة."),
      },
    ],
  },
  {
    id: "systeme", number: "03", minutes: 12, color: "violet",
    title: t("Système d’exploitation", "نظام التشغيل"),
    situation: t("Le PC du club doit démarrer correctement. Tu dois distinguer le système des applications et résoudre un message de démarrage.", "يجب أن يشتغل حاسوب النادي بشكل صحيح. عليك التمييز بين النظام والتطبيقات وحل رسالة تظهر عند التشغيل."),
    skill: t("Distinguer · diagnostiquer · décider", "التمييز · التشخيص · اتخاذ القرار"),
    tasks: [
      {
        id: "systeme-application", kind: "categorize",
        title: t("Système d’exploitation ou application", "نظام تشغيل أم تطبيق"),
        instruction: t("Classe les éléments en observant leur rôle.", "صنف العناصر اعتمادًا على دورها."),
        options: [{ id: "systeme", label: t("Système d’exploitation", "نظام تشغيل") }, { id: "application", label: t("Application", "تطبيق") }],
        items: [
          { id: "windows", label: t("Windows", "Windows"), image: "session3/visuels/logo-windows.svg", answer: "systeme" },
          { id: "android", label: t("Android", "Android"), image: "session3/visuels/logo-android.svg", answer: "systeme" },
          { id: "browser", label: t("Navigateur", "المتصفح"), image: "session3/visuels/app-navigateur.svg", answer: "application" },
          { id: "calculator", label: t("Calculatrice", "الحاسبة"), image: "session3/visuels/app-calculatrice.svg", answer: "application" },
        ],
        hint: t("Le système pilote l’appareil ; l’application réalise une tâche.", "النظام يشغل الجهاز، والتطبيق ينجز مهمة."),
        success: t("Tu distingues système d’exploitation et application.", "أنت تميز نظام التشغيل عن التطبيق."),
      },
      {
        id: "diagnostic-os", kind: "single",
        title: t("Aucun système trouvé", "لم يتم العثور على نظام"),
        instruction: t("L’écran affiche « Aucun système d’exploitation trouvé ». Quelle action résout réellement le problème ?", "تظهر رسالة «لم يتم العثور على نظام تشغيل». ما الإجراء الذي يحل المشكلة فعلًا؟"),
        image: "session3/visuels/ecran-sans-systeme.svg", imageAlt: "Ordinateur sans système d’exploitation",
        choices: [
          { id: "install", label: t("Installer un système d’exploitation", "تثبيت نظام تشغيل") },
          { id: "paint", label: t("Ouvrir Paint", "فتح Paint") }, { id: "mouse", label: t("Changer la souris", "تغيير الفأرة") },
        ],
        answer: "install",
        hint: t("Une application ne peut pas démarrer avant le système.", "لا يمكن تشغيل تطبيق قبل وجود النظام."),
        success: t("Tu sais diagnostiquer l’absence d’un système d’exploitation.", "أنت تعرف تشخيص غياب نظام التشغيل."),
      },
    ],
  },
  {
    id: "reseau", number: "04", minutes: 13, color: "green",
    title: t("Réseau local", "الشبكة المحلية"),
    situation: t("Internet est coupé. Les ordinateurs du club doivent néanmoins partager les fichiers et utiliser l’imprimante Wi‑Fi.", "الإنترنت مقطوع، لكن يجب على حواسيب النادي مشاركة الملفات واستعمال الطابعة اللاسلكية."),
    skill: t("Équiper · connecter · adresser · tester", "التجهيز · الربط · العنونة · الاختبار"),
    tasks: [
      {
        id: "equipements-reseau", kind: "pairing",
        title: t("Équipements et rôles", "تجهيزات الشبكة ووظائفها"),
        instruction: t("Choisis un rôle, puis clique sur la photo de l’équipement correspondant. Aucune liste déroulante.", "اختر وظيفة ثم انقر على صورة التجهيز المناسب. لا توجد قوائم منسدلة."),
        options: [
          { id: "branche", label: t("Branche les appareils", "يربط الأجهزة") }, { id: "wifi", label: t("Émet le Wi‑Fi", "يبث Wi‑Fi") },
          { id: "internet", label: t("Accès Internet", "يوفر الإنترنت") }, { id: "transport", label: t("Transporte les données", "ينقل البيانات") },
          { id: "prise", label: t("Prise réseau du PC", "منفذ شبكة الحاسوب") }, { id: "capte", label: t("Capte le Wi‑Fi", "يلتقط Wi‑Fi") },
        ],
        items: [
          { id: "switch", label: t("Switch", "المبدل"), image: "session4/images/commutateur.webp", answer: "branche" },
          { id: "ap", label: t("Point d’accès", "نقطة الولوج"), image: "session4/images/point-acces.webp", answer: "wifi" },
          { id: "router", label: t("Routeur", "الموجه"), image: "session4/images/routeur.webp", answer: "internet" },
          { id: "cable", label: t("Câble RJ45", "كابل RJ45"), image: "session4/images/cable-rj45.webp", answer: "transport" },
          { id: "ethernet", label: t("Carte Ethernet", "بطاقة Ethernet"), image: "session4/images/carte-ethernet.webp", answer: "prise" },
          { id: "wifi-card", label: t("Carte Wi‑Fi", "بطاقة Wi‑Fi"), image: "session4/images/carte-wifi.webp", answer: "capte" },
        ],
        hint: t("Ne confonds pas le routeur, le switch et le point d’accès.", "لا تخلط بين الموجه والمبدل ونقطة الولوج."),
        success: t("Tu identifies les équipements essentiels d’un LAN.", "أنت تتعرف على التجهيزات الأساسية للشبكة المحلية."),
      },
      {
        id: "topologie-etoile", kind: "single",
        title: t("Lire un schéma réseau", "قراءة مخطط شبكة"),
        instruction: t("Chaque PC possède son câble vers un switch central. Identifie la topologie.", "لكل حاسوب كابل نحو مبدل مركزي. حدد الطوبولوجيا."),
        image: "session4/reseau-salle.png", imageAlt: "Réseau d’une salle organisé autour d’un switch",
        choices: [{ id: "etoile", label: t("Étoile", "نجمية") }, { id: "bus", label: t("Bus", "خطية") }, { id: "anneau", label: t("Anneau", "حلقية") }],
        answer: "etoile",
        hint: t("Observe l’équipement placé au centre.", "لاحظ الجهاز الموجود في المركز."),
        success: t("Tu reconnais une topologie en étoile.", "أنت تتعرف على الطوبولوجيا النجمية."),
      },
      {
        id: "adresse-identite", kind: "pairing",
        title: t("Un nom et un identifiant unique", "اسم ومعرّف فريد"),
        instruction: t("Comme une personne ou un téléphone, chaque ordinateur doit être reconnu. Choisis un identifiant, puis associe-le au bon nom.", "مثل الشخص أو الهاتف، يجب التعرف على كل حاسوب. اختر المعرّف ثم اربطه بالاسم المناسب."),
        options: [
          { id: "telephone", label: t("06 12 34 56 78 · numéro de téléphone", "06 12 34 56 78 · رقم الهاتف") },
          { id: "massar", label: t("G123456789 · code Massar", "G123456789 · رمز مسار") },
          { id: "cin", label: t("AB123456 · numéro CIN", "AB123456 · رقم البطاقة الوطنية") },
          { id: "ip", label: t("192.168.1.10 · adresse IP", "192.168.1.10 · عنوان IP") },
        ],
        items: [
          { id: "contact", label: t("Contact « Maman »", "جهة الاتصال «أمي»"), answer: "telephone" },
          { id: "student", label: t("Élève « Sara El Idrissi »", "التلميذة «سارة الإدريسي»"), answer: "massar" },
          { id: "citizen", label: t("Citoyen « Omar Alaoui »", "المواطن «عمر العلوي»"), answer: "cin" },
          { id: "computer", label: t("Ordinateur « PC‑CLUB‑01 »", "الحاسوب «PC‑CLUB‑01»"), image: "session4/images/ordinateur-bureau.webp", answer: "ip" },
        ],
        hint: t("Le numéro identifie le téléphone, Massar l’élève, la CIN le citoyen et l’adresse IP l’ordinateur dans le réseau.", "رقم الهاتف يحدد الهاتف، ومسار يحدد التلميذ، والبطاقة الوطنية تحدد المواطن، وعنوان IP يحدد الحاسوب داخل الشبكة."),
        success: t("Exact : PC‑CLUB‑01 est le nom lisible par l’humain ; 192.168.1.10 est son adresse unique dans le réseau.", "صحيح: PC‑CLUB‑01 هو الاسم الذي يقرأه الإنسان، و192.168.1.10 هو عنوانه الفريد داخل الشبكة."),
      },
      {
        id: "plan-connexions", kind: "categorize",
        title: t("Construire le réseau du club", "بناء شبكة النادي"),
        instruction: t("Choisis le type de liaison pour chaque connexion. Le partage local doit fonctionner sans Internet.", "اختر نوع الربط لكل اتصال. يجب أن تعمل المشاركة المحلية دون إنترنت."),
        image: "session4/images/salle-reseau-club.webp", imageAlt: "Salle du club équipée d’un réseau local",
        options: [{ id: "rj45", label: t("Câble RJ45", "كابل RJ45") }, { id: "wifi", label: t("Wi‑Fi", "Wi‑Fi") }, { id: "usb", label: t("Clé USB", "مفتاح USB") }],
        items: [
          { id: "pc1", label: t("PC‑CLUB‑01 → SWITCH‑CLUB", "PC‑CLUB‑01 ← SWITCH‑CLUB"), answer: "rj45" },
          { id: "pc2", label: t("PC‑CLUB‑02 → SWITCH‑CLUB", "PC‑CLUB‑02 ← SWITCH‑CLUB"), answer: "rj45" },
          { id: "laptop", label: t("PORTABLE‑CLUB → WIFI‑CLUB", "PORTABLE‑CLUB ← WIFI‑CLUB"), answer: "wifi" },
          { id: "printer", label: t("IMPRIMANTE‑CLUB → WIFI‑CLUB", "IMPRIMANTE‑CLUB ← WIFI‑CLUB"), answer: "wifi" },
        ],
        hint: t("Les postes fixes utilisent RJ45 ; les appareils mobiles utilisent le point d’accès.", "تستعمل الحواسيب الثابتة RJ45، وتستعمل الأجهزة المحمولة نقطة الولوج."),
        success: t("Tu sais proposer un réseau câblé et sans fil cohérent.", "أنت تعرف اقتراح شبكة سلكية ولاسلكية منسجمة."),
      },
      {
        id: "url-vers-internet", kind: "order",
        title: t("De www.youtube.com à la page affichée", "من www.youtube.com إلى الصفحة المعروضة"),
        instruction: t("Remets dans l’ordre ce qui se passe quand tu ouvres un site Web.", "رتب ما يحدث عندما تفتح موقعًا على الويب."),
        image: "revision/navigation-internet.svg", imageAlt: "Parcours simple d’une adresse Web vers Internet",
        steps: [
          t("J’écris www.youtube.com dans la barre d’adresse", "أكتب www.youtube.com في شريط العنوان"),
          t("J’appuie sur la touche Entrée", "أضغط على زر Enter"),
          t("Le navigateur envoie automatiquement une demande vers Internet", "يرسل المتصفح تلقائيًا طلبًا نحو الإنترنت"),
          t("Le serveur de YouTube renvoie la page demandée", "يرسل خادم YouTube الصفحة المطلوبة"),
          t("Le navigateur affiche la page à l’écran", "يعرض المتصفح الصفحة على الشاشة"),
        ],
        hint: t("Adresse saisie → Entrée → demande → réponse du serveur → affichage.", "كتابة العنوان ← Enter ← الطلب ← جواب الخادم ← العرض."),
        success: t("Tu comprends le trajet simple d’une adresse Web jusqu’à la page affichée.", "أنت تفهم المسار البسيط من عنوان الويب إلى الصفحة المعروضة."),
      },
    ],
  },
  {
    id: "synthese", number: "05", minutes: 10, color: "red",
    title: t("Défi final du réseau", "التحدي النهائي للشبكة"),
    situation: t("Le club veut connecter deux PC par câble et un portable sans fil. Sélectionne uniquement le matériel indispensable.", "يريد النادي ربط حاسوبين بكابل وحاسوب محمول لاسلكيًا. اختر المعدات الضرورية فقط."),
    skill: t("Analyser un besoin · sélectionner l’essentiel", "تحليل الحاجة · اختيار الضروري"),
    tasks: [
      {
        id: "dossier-equipement", kind: "selectMany", selectionCount: 4,
        title: t("Préparer le matériel", "إعداد المعدات"),
        instruction: t("Choisis exactement 4 éléments indispensables : deux PC seront câblés et le portable sera connecté sans fil.", "اختر 4 عناصر ضرورية بالضبط: سيتم ربط حاسوبين بسلك، والحاسوب المحمول لاسلكيًا."),
        image: "session4/images/salle-reseau-club.webp", imageAlt: "Projet complet du club informatique",
        choices: [
          { id: "switch", label: t("Switch", "مبدل") }, { id: "cables", label: t("Deux câbles RJ45", "كابلان RJ45") },
          { id: "ap", label: t("Point d’accès Wi‑Fi", "نقطة ولوج Wi‑Fi") }, { id: "cards", label: t("Cartes réseau fonctionnelles", "بطاقات شبكة تعمل") },
          { id: "dvd", label: t("Lecteur DVD", "قارئ DVD") }, { id: "projector", label: t("Vidéoprojecteur", "مسلاط") },
        ],
        answer: ["switch", "cables", "ap", "cards"],
        hint: t("Pense aux liaisons, au centre du réseau et aux cartes de connexion.", "فكر في وسائل الربط ومركز الشبكة وبطاقات الاتصال."),
        success: t("Le matériel choisi permet de construire le réseau demandé.", "تسمح المعدات المختارة ببناء الشبكة المطلوبة."),
      },
    ],
  },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim().replace(/\s+/g, " ");

function Bilingual({ text, className = "" }: { text: LocalText; className?: string }) {
  return <span className={`rw-bi ${className}`} tabIndex={0}>{text.fr}<span className="rw-bi-tip" lang="ar" dir="rtl">{text.ar}</span></span>;
}

function sameSelection(value: string[], answer: string[]) { return [...value].sort().join("|") === [...answer].sort().join("|"); }

function sanitizePairingAnswers(savedAnswers: Record<string, TaskAnswer>) {
  const sanitized = { ...savedAnswers };
  missions.flatMap(item => item.tasks).filter(task => task.kind === "pairing").forEach(task => {
    const raw = sanitized[task.id];
    if (!raw || Array.isArray(raw) || typeof raw !== "object") return;
    const allowedOptions = new Set((task.options || []).map(option => option.id));
    const usedOptions = new Set<string>();
    const cleanMapping: Record<string, string> = {};
    (task.items || []).forEach(item => {
      const optionId = raw[item.id];
      if (typeof optionId !== "string" || !allowedOptions.has(optionId) || usedOptions.has(optionId)) return;
      cleanMapping[item.id] = optionId;
      usedOptions.add(optionId);
    });
    sanitized[task.id] = cleanMapping;
  });
  return sanitized;
}

function taskIsComplete(task: Task, raw: TaskAnswer | undefined) {
  if (task.kind === "categorize" || task.kind === "pairing") { const value = raw as Record<string, string> | undefined; return Boolean(task.items?.every(item => value?.[item.id])); }
  if (task.kind === "fields") { const value = raw as Record<string, string> | undefined; return Boolean(task.fields?.every(field => value?.[field.id]?.trim())); }
  if (task.kind === "selectMany") return Array.isArray(raw) && raw.length === task.selectionCount;
  if (task.kind === "single") return typeof raw === "string" && raw.length > 0;
  if (task.kind === "order") return Array.isArray(raw) && raw.length === (task.steps?.length || 0);
  return false;
}

function taskIsCorrect(task: Task, raw: TaskAnswer | undefined) {
  if (task.kind === "categorize" || task.kind === "pairing") { const value = raw as Record<string, string> | undefined; return Boolean(task.items?.every(item => value?.[item.id] === item.answer)); }
  if (task.kind === "fields") {
    const value = raw as Record<string, string> | undefined;
    return Boolean(task.fields?.every(field => {
      const answer = normalize(value?.[field.id] || "");
      if (field.answers?.some(item => normalize(item) === answer)) return true;
      if (field.endsWith?.some(item => answer.length > item.length && answer.endsWith(normalize(item)))) return true;
      return field.containsAny?.some(item => answer.includes(normalize(item))) ?? false;
    }));
  }
  if (task.kind === "selectMany") return sameSelection((raw as string[] | undefined) || [], (task.answer as string[] | undefined) || []);
  if (task.kind === "single") return raw === task.answer;
  const value = (raw as number[] | undefined) || [];
  return value.length === (task.steps?.length || 0) && value.every((source, position) => source === position);
}

function taskResponseLabels(task: Task, raw: TaskAnswer | undefined) {
  if (task.kind === "categorize" || task.kind === "pairing") {
    const mapping = (raw as Record<string, string> | undefined) || {};
    return (task.items || []).map(item => {
      const choice = task.options?.find(option => option.id === mapping[item.id]);
      return `${item.label.fr} → ${choice?.label.fr || "Sans réponse"}`;
    });
  }
  if (task.kind === "fields") {
    const values = (raw as Record<string, string> | undefined) || {};
    return (task.fields || []).map(field => `${field.label.fr} → ${values[field.id] || "Sans réponse"}`);
  }
  if (task.kind === "order") {
    return ((raw as number[] | undefined) || []).map((sourceIndex, position) => `${position + 1}. ${task.steps?.[sourceIndex]?.fr || "Étape inconnue"}`);
  }
  if (task.kind === "selectMany") {
    return ((raw as string[] | undefined) || []).map(id => task.choices?.find(choice => choice.id === id)?.label.fr || id);
  }
  if (task.kind === "single") {
    const id = typeof raw === "string" ? raw : "";
    return [task.choices?.find(choice => choice.id === id)?.label.fr || id || "Sans réponse"];
  }
  return [];
}

function TaskView({ task, answer, result, locked, onChange }: { task: Task; answer: TaskAnswer | undefined; result: boolean | undefined; locked: boolean; onChange: (value: TaskAnswer) => void }) {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const mapping = (answer as Record<string, string> | undefined) || {};
  const fields = (answer as Record<string, string> | undefined) || {};
  const selected = (answer as string[] | undefined) || [];
  const order = (answer as number[] | undefined) || [];
  const pairingItems = stableShuffle(task.items || [], `${task.id}:items`);
  const pairingOptions = deAlignOptions(stableShuffle(task.options || [], `${task.id}:options`), pairingItems);
  const usedPairingOptions = new Set(Object.values(mapping));
  const availablePairingOptions = pairingOptions.filter(option => !usedPairingOptions.has(option.id));
  const shuffledStepIndexes = stableShuffle((task.steps || []).map((_, index) => index), `${task.id}:steps`);
  const remainingStepIndexes = shuffledStepIndexes.filter(index => !order.includes(index));
  return <article className={`rw-task ${result === true ? "is-good" : result === false ? "is-wrong" : ""}`}>
    <header><div><Bilingual text={task.title} className="rw-task-title"/><Bilingual text={task.instruction} className="rw-task-instruction"/></div><span className="rw-task-state">{result === true ? <Check size={18}/> : result === false ? <X size={18}/> : <span/>}</span></header>
    {task.image && <figure className="rw-support"><img src={publicAsset(task.image)} alt={task.imageAlt || "Support visuel"}/>{task.imageAlt && <figcaption>{task.imageAlt}</figcaption>}</figure>}
    {task.kind === "categorize" && <div className={`rw-card-grid ${task.items?.length === 6 ? "six" : ""}`}>{task.items?.map(item => <div className="rw-answer-card" key={item.id}>
      {item.image && <img src={publicAsset(item.image)} alt=""/>}<Bilingual text={item.label} className="rw-item-label"/>
      {task.options && task.options.length > 4
        ? <select className="rw-role-select" value={mapping[item.id] || ""} disabled={locked} onChange={event => onChange({ ...mapping, [item.id]: event.target.value })} aria-label={`Rôle de ${item.label.fr}`}>
            <option value="">Choisir le rôle…</option>
            {task.options.map(option => <option key={option.id} value={option.id}>{option.label.fr}</option>)}
          </select>
        : <div className="rw-segments" role="group" aria-label={item.label.fr}>{task.options?.map(option => <button type="button" key={option.id} disabled={locked} className={mapping[item.id] === option.id ? "selected" : ""} onClick={() => onChange({ ...mapping, [item.id]: option.id })}><Bilingual text={option.label}/></button>)}</div>}
    </div>)}</div>}
    {task.kind === "pairing" && <div className="rw-pairing">
      <div className="rw-pairing-guide"><b>1</b><span>Choisis une réponse</span><i/><b>2</b><span>Clique sur l’élément correspondant</span></div>
      <div className="rw-pairing-bank-head"><b>Réponses disponibles</b><span>{availablePairingOptions.length} restante{availablePairingOptions.length > 1 ? "s" : ""}</span></div>
      <div className={`rw-role-bank ${pairingOptions.some(option => option.image) ? "with-images" : ""} ${availablePairingOptions.length === 0 ? "is-empty" : ""}`}>
        {availablePairingOptions.length > 0
          ? availablePairingOptions.map(option => <button type="button" key={option.id} disabled={locked} className={activeOption === option.id ? "active" : ""} onClick={() => setActiveOption(option.id)}>{option.image && <img src={publicAsset(option.image)} alt=""/>}<Bilingual text={option.label}/>{activeOption === option.id && <Check size={17}/>}</button>)
          : <div className="rw-pairing-complete"><CheckCircle2 size={19}/><span>Toutes les réponses sont placées.</span></div>}
      </div>
      <div className="rw-pairing-grid">{pairingItems.map(item => {
        const chosen = pairingOptions.find(option => option.id === mapping[item.id]);
        const updatePairing = () => {
          if (!activeOption) {
            if (!chosen) return;
            const nextMapping = { ...mapping };
            delete nextMapping[item.id];
            onChange(nextMapping);
            return;
          }
          const nextMapping = { ...mapping };
          Object.entries(nextMapping).forEach(([mappedItemId, optionId]) => {
            if (optionId === activeOption) delete nextMapping[mappedItemId];
          });
          nextMapping[item.id] = activeOption;
          onChange(nextMapping);
          setActiveOption(null);
        };
        return <button type="button" key={item.id} disabled={locked || (!activeOption && !chosen)} className={`rw-pairing-card ${chosen ? "assigned" : ""}`} onClick={updatePairing} aria-label={chosen ? `Modifier l’association de ${item.label.fr}` : `Associer ${item.label.fr}`}>{item.image && <img src={publicAsset(item.image)} alt=""/>}<Bilingual text={item.label} className="rw-item-label"/><span className="rw-pairing-answer">{chosen ? <><Check size={15}/><Bilingual text={chosen.label}/><small>Modifier</small></> : "À associer"}</span></button>;
      })}</div>
    </div>}
    {task.kind === "order" && <div className="rw-order-builder">
      <section className="rw-order-source"><header><div><b>Étapes mélangées</b><span>Clique sur la prochaine étape.</span></div><small>{remainingStepIndexes.length} à placer</small></header><div>{remainingStepIndexes.map(sourceIndex => <button type="button" key={sourceIndex} disabled={locked} onClick={() => onChange([...order, sourceIndex])}>{task.stepImages?.[sourceIndex] && <img src={publicAsset(task.stepImages[sourceIndex])} alt=""/>}<Bilingual text={task.steps?.[sourceIndex] || t("", "")}/><span>Ajouter</span></button>)}</div></section>
      <section className="rw-order-sequence"><header><div><b>Mon ordre</b><span>Les étapes choisies apparaissent ici.</span></div><button type="button" disabled={locked || order.length === 0} onClick={() => onChange([])}><RotateCcw size={15}/> Recommencer</button></header><div className="rw-order-slots">{(task.steps || []).map((_, position) => { const sourceIndex = order[position]; return sourceIndex === undefined ? <div className="empty" key={`empty-${position}`}><b>{position + 1}</b><span>Choisis une étape</span></div> : <button type="button" key={`${sourceIndex}-${position}`} disabled={locked} onClick={() => onChange(order.filter((_, index) => index !== position))} aria-label={`Retirer l’étape ${position + 1}`}><b>{position + 1}</b>{task.stepImages?.[sourceIndex] && <img src={publicAsset(task.stepImages[sourceIndex])} alt=""/>}<Bilingual text={task.steps?.[sourceIndex] || t("", "")}/><X size={17}/></button>; })}</div></section>
    </div>}
    {task.kind === "fields" && <div className="rw-fields">{task.fields?.map(field => <label key={field.id}><Bilingual text={field.label}/><input value={fields[field.id] || ""} disabled={locked} placeholder={field.placeholder || "Ta réponse…"} onChange={event => onChange({ ...fields, [field.id]: event.target.value })}/></label>)}</div>}
    {task.kind === "selectMany" && <div className="rw-select-many"><div className="rw-selection-counter">{selected.length}/{task.selectionCount} sélectionnés</div><div>{task.choices?.map(choice => { const active = selected.includes(choice.id); return <button type="button" key={choice.id} disabled={locked || (!active && selected.length >= (task.selectionCount || 99))} className={active ? "selected" : ""} onClick={() => onChange(active ? selected.filter(id => id !== choice.id) : [...selected, choice.id])}>{choice.image && <img src={publicAsset(choice.image)} alt=""/>}<span>{active ? <CheckCircle2 size={19}/> : <span className="rw-empty-check"/>}<Bilingual text={choice.label}/></span></button>; })}</div></div>}
    {task.kind === "single" && <div className="rw-single">{task.choices?.map(choice => <button type="button" key={choice.id} disabled={locked} className={answer === choice.id ? "selected" : ""} onClick={() => onChange(choice.id)}>{choice.image && <img src={publicAsset(choice.image)} alt=""/>}<Bilingual text={choice.label}/></button>)}</div>}
    {result !== undefined && <div className={`rw-task-feedback ${result ? "good" : "wrong"}`}>{result ? <CheckCircle2 size={19}/> : <Lightbulb size={19}/>}<Bilingual text={result ? task.success : task.hint}/></div>}
  </article>;
}

export default function RevisionWorkshop({ student, completed, onBack, onChangeStudent, onToggleCompleted, onRecordSubmission }: { student: StudentProfile; completed: boolean; onBack: () => void; onChangeStudent: () => void; onToggleCompleted: () => void; onRecordSubmission: (submission: Submission) => void }) {
  const teacherMode = useTeacherCourse();
  const storageKey = `lab2ac-revision-workshop-v4-${student.id}`;
  const [showIntro, setShowIntro] = useState(true);
  const [missionIndex, setMissionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, TaskAnswer>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [firstScores, setFirstScores] = useState<Record<string, number>>({});
  const [passed, setPassed] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const [showBilan, setShowBilan] = useState(false);
  const [restored, setRestored] = useState(false);
  const mission = missions[missionIndex];
  const allTasks = useMemo(() => missions.flatMap(item => item.tasks), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (saved) { setShowIntro(Boolean(saved.showIntro)); setMissionIndex(Math.min(Number(saved.missionIndex) || 0, missions.length - 1)); setAnswers(sanitizePairingAnswers(saved.answers || {})); setAttempts(saved.attempts || {}); setFirstScores(saved.firstScores || {}); setPassed(Array.isArray(saved.passed) ? saved.passed : []); setShowBilan(Boolean(saved.showBilan)); }
      } catch {} finally { setRestored(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ showIntro, missionIndex, answers, attempts, firstScores, passed, showBilan })); } catch {}
  }, [restored, storageKey, showIntro, missionIndex, answers, attempts, firstScores, passed, showBilan]);

  const totalFirstCorrect = Object.values(firstScores).reduce((sum, value) => sum + value, 0);
  const readinessScore = Math.round(totalFirstCorrect / allTasks.length * 20 * 10) / 10;
  const totalAttempts = Object.values(attempts).reduce((sum, value) => sum + value, 0);
  const completedMinutes = missions.filter(item => passed.includes(item.id)).reduce((sum, item) => sum + item.minutes, 0);

  function changeTask(taskId: string, value: TaskAnswer) { setAnswers(current => ({ ...current, [taskId]: value })); setResults(null); }

  function scrollWorkshopTop() {
    window.setTimeout(() => document.querySelector(".rw-shell")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function verifyMission() {
    if (!mission.tasks.every(task => taskIsComplete(task, answers[task.id]))) return;
    const check = Object.fromEntries(mission.tasks.map(task => [task.id, taskIsCorrect(task, answers[task.id])]));
    const correctCount = Object.values(check).filter(Boolean).length;
    const count = (attempts[mission.id] || 0) + 1;
    setResults(check); setAttempts(current => ({ ...current, [mission.id]: count }));
    setFirstScores(current => mission.id in current ? current : ({ ...current, [mission.id]: correctCount }));
    if (correctCount === mission.tasks.length) setPassed(current => current.includes(mission.id) ? current : [...current, mission.id]);
    mission.tasks.forEach(task => onRecordSubmission({
      sessionId: 5,
      activityType: "workshop",
      activityId: `revision-${task.id}`,
      answer: {
        question: task.title.fr,
        selectedChoices: taskResponseLabels(task, answers[task.id]),
        response: answers[task.id],
        missionAttempt: count,
      },
      isCorrect: check[task.id],
      score: check[task.id] ? 1 : 0,
      maxScore: 1,
    }));
    window.setTimeout(() => document.querySelector(".rw-mission-feedback")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  function openMission(index: number) {
    if (!teacherMode && index > passed.length) return;
    setMissionIndex(index); setResults(null); setShowIntro(false); scrollWorkshopTop();
  }

  function continueAfterMission() {
    if (!passed.includes(mission.id)) return;
    if (missionIndex < missions.length - 1) { setMissionIndex(value => value + 1); setResults(null); scrollWorkshopTop(); return; }
    setShowBilan(true);
    if (!completed && !teacherMode) onToggleCompleted();
    onRecordSubmission({ sessionId: 5, activityType: "quiz", activityId: "revision-bilan-v4", answer: { question: "Bilan de préparation", selectedChoices: missions.map(item => `${item.title.fr} : ${firstScores[item.id] || 0}/${item.tasks.length}`), firstScores, attempts, passed: missions.map(item => item.id) }, isCorrect: true, score: readinessScore, maxScore: 20 });
    scrollWorkshopTop();
  }

  function restart() {
    setShowIntro(true); setMissionIndex(0); setAnswers({}); setAttempts({}); setFirstScores({}); setPassed([]); setResults(null); setShowBilan(false); localStorage.removeItem(storageKey);
  }

  if (showBilan) return <div className="rw-shell rw-bilan"><header className="rw-topbar"><button type="button" onClick={onBack}><ArrowLeft size={18}/> Programme</button><div className="rw-brand-mark">╱╱</div><strong>LAB·2AC <span>RÉVISION TERMINÉE</span></strong><button type="button" className="rw-student" onClick={onChangeStudent}>{student.studentOne}{student.studentTwo ? ` + ${student.studentTwo}` : ""}</button></header><main className="rw-bilan-main">
    <section className="rw-bilan-hero"><div className="rw-trophy"><Trophy size={38}/></div><p>BILAN DE PRÉPARATION</p><h1>{readinessScore.toLocaleString("fr-FR")}<small>/20</small></h1><h2>{readinessScore >= 16 ? "Tu es prêt pour les deux évaluations" : readinessScore >= 12 ? "Tu es presque prêt : révise les points orange" : "Une nouvelle révision ciblée est recommandée"}</h2><span>Indice calculé sur la première réponse à chaque activité — ce n’est pas une note officielle.</span></section>
    <div className="rw-bilan-stats"><div><b>5/5</b><span>missions maîtrisées</span></div><div><b>{allTasks.length}</b><span>activités réalisées</span></div><div><b>{totalAttempts}</b><span>vérifications</span></div><div><b>60 min</b><span>parcours complet</span></div></div>
    <section className="rw-skill-report"><header><div><Target size={22}/><h2>Mon niveau par domaine</h2></div><p>Résultat obtenu avant les corrections</p></header>{missions.map(item => { const value = Math.round((firstScores[item.id] || 0) / item.tasks.length * 100); return <div className="rw-skill-row" key={item.id}><span>{item.title.fr}</span><div><i style={{ width: `${value}%` }}/></div><b className={value >= 75 ? "good" : value >= 50 ? "middle" : "low"}>{value}%</b></div>; })}</section>
    <div className="rw-bilan-actions"><a href={evaluationUrl}>Ouvrir les évaluations 1 et 2 <ExternalLink size={18}/></a><button type="button" onClick={restart}><RotateCcw size={17}/> Refaire la révision</button></div>
  </main></div>;

  if (showIntro) return <div className="rw-shell rw-intro"><header className="rw-topbar"><button type="button" onClick={onBack}><ArrowLeft size={18}/> Programme</button><div className="rw-brand-mark">╱╱</div><strong>LAB·2AC <span>SÉANCE DE RÉVISION</span></strong><button type="button" className="rw-student" onClick={onChangeStudent}>{student.studentOne}{student.studentTwo ? ` + ${student.studentTwo}` : ""}</button></header><main className="rw-intro-main">
    <section className="rw-intro-copy"><span className="rw-kicker"><Sparkles size={16}/> ENTRE LES SÉANCES 4 ET 5</span><h1>Une heure pour vérifier ce que tu sais vraiment faire.</h1><p>Ce parcours reprend les notions essentielles des deux évaluations. Tu ne vas pas seulement cocher des réponses : tu vas observer, classer, calculer, diagnostiquer et construire une solution.</p><div className="rw-intro-rules"><div><Target size={20}/><span><b>{allTasks.length} activités</b> courtes et variées</span></div><div><Clock3 size={20}/><span><b>60 minutes</b> réparties en 5 missions</span></div><div><LockKeyhole size={20}/><span>Une mission doit être <b>réussie</b> pour continuer</span></div><div><Trophy size={20}/><span>Un <b>bilan sur 20</b> estime ta préparation</span></div></div><div className="rw-ar-help" lang="ar" dir="rtl">مرّر الفأرة فوق العناوين والتعليمات لعرض الترجمة العربية.</div><button type="button" className="rw-start" onClick={() => setShowIntro(false)}>Commencer la révision <ArrowRight size={19}/></button></section>
    <section className="rw-mission-map"><header><Flag size={22}/><div><b>Plan de la séance</b><span>Progression totale : 60 min</span></div></header>{missions.map((item, index) => <button type="button" key={item.id} onClick={() => openMission(index)} disabled={!teacherMode && index > passed.length} className={`rw-map-item ${item.color}`}><b>{item.number}</b><span><Bilingual text={item.title}/><small>{activityLabel(item.tasks.length)} · {item.minutes} min</small></span>{passed.includes(item.id) ? <CheckCircle2 size={21}/> : index === 0 || teacherMode ? <ArrowRight size={18}/> : <LockKeyhole size={17}/>}</button>)}</section>
  </main></div>;

  const missionComplete = mission.tasks.every(task => taskIsComplete(task, answers[task.id]));
  const missionPassed = passed.includes(mission.id);
  const correctCount = results ? Object.values(results).filter(Boolean).length : 0;
  return <div className="rw-shell"><header className="rw-topbar"><button type="button" onClick={() => setShowIntro(true)}><ArrowLeft size={18}/> Plan</button><div className="rw-brand-mark">╱╱</div><strong>LAB·2AC <span>RÉVISION · 60 MIN</span></strong><button type="button" className="rw-student" onClick={onChangeStudent}>{student.studentOne}{student.studentTwo ? ` + ${student.studentTwo}` : ""}</button></header>
    <nav className="rw-steps" aria-label="Missions">{missions.map((item, index) => { const allowed = teacherMode || index <= passed.length; return <button type="button" key={item.id} disabled={!allowed} className={`${index === missionIndex ? "active" : ""} ${passed.includes(item.id) ? "done" : ""}`} onClick={() => openMission(index)}><span>{passed.includes(item.id) ? <Check size={15}/> : item.number}</span><b>{item.title.fr}</b><small>{item.minutes} min</small></button>; })}<div className="rw-time-progress"><span style={{ width: `${completedMinutes / 60 * 100}%` }}/></div></nav>
    <main className="rw-workspace"><aside className={`rw-mission-brief ${mission.color}`}><span>MISSION {mission.number}</span><Bilingual text={mission.title} className="rw-mission-title"/><Bilingual text={mission.situation} className="rw-situation"/><div><Clock3 size={18}/><b>{mission.minutes} minutes</b></div><div><Target size={18}/><Bilingual text={mission.skill}/></div><p><span>AR</span> Survole un texte souligné pour afficher sa traduction.</p></aside>
      <section className="rw-mission-content"><header className="rw-content-head"><div><span>{mission.tasks.length} ACTIVITÉS</span><h1>{mission.title.fr}</h1></div><b>{missionPassed ? "Mission maîtrisée" : `Vérification ${attempts[mission.id] ? attempts[mission.id] + 1 : 1}`}</b></header>{mission.tasks.map((task, taskIndex) => <div className="rw-task-wrap" key={task.id}><span className="rw-task-number">{mission.number}.{taskIndex + 1}</span><TaskView task={task} answer={answers[task.id]} result={results?.[task.id]} locked={missionPassed} onChange={value => changeTask(task.id, value)}/></div>)}
        <div className={`rw-mission-feedback ${missionPassed ? "passed" : results ? "retry" : "ready"}`}>{missionPassed ? <><CheckCircle2 size={30}/><div><b>Mission réussie</b><span>{mission.tasks.length}/{mission.tasks.length} activités maîtrisées. Tu peux continuer.</span></div></> : results ? <><Lightbulb size={30}/><div><b>{correctCount}/{mission.tasks.length} {correctCount > 1 ? "activités correctes" : "activité correcte"}</b><span>Corrige uniquement les blocs orange en utilisant les indices.</span></div></> : <><Network size={30}/><div><b>{missionComplete ? "Toutes les réponses sont prêtes" : "Termine les activités"}</b><span>{missionComplete ? "Vérifie maintenant toute la mission." : "Chaque activité doit contenir une réponse avant la vérification."}</span></div></>}</div>
        <div className="rw-mission-actions"><button type="button" className="secondary" disabled={missionIndex === 0} onClick={() => openMission(missionIndex - 1)}><ArrowLeft size={18}/> Mission précédente</button>{!missionPassed ? <button type="button" className="primary" disabled={!missionComplete} onClick={verifyMission}>Vérifier la mission <CheckCircle2 size={18}/></button> : <button type="button" className="primary" onClick={continueAfterMission}>{missionIndex === missions.length - 1 ? "Afficher mon bilan" : "Mission suivante"}<ArrowRight size={18}/></button>}</div>
      </section></main>
  </div>;
}
