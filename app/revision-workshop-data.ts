export const revisionBilanActivityId = "revision-bilan-v4";

export type RevisionWorkshopTarget = {
  id: string;
  taskId: string;
  title: string;
  objective: string;
  mission: string;
};

const target = (taskId: string, title: string, objective: string, mission: string): RevisionWorkshopTarget => ({
  id: `revision-${taskId}`,
  taskId,
  title,
  objective,
  mission,
});

export const revisionWorkshopTargets: RevisionWorkshopTarget[] = [
  target("formes-visuelles", "Les quatre formes d’information", "Reconnaître l’information et son traitement", "Information & traitement"),
  target("chaine-traitement", "La chaîne d’un traitement", "Reconnaître l’information et son traitement", "Information & traitement"),
  target("types-traitement", "Manuel, semi-automatique ou automatique", "Reconnaître l’information et son traitement", "Information & traitement"),
  target("peripheriques-reels", "Périphériques réels", "Identifier le matériel et les capacités", "Matériel & capacités"),
  target("composants-internes", "À l’intérieur de l’unité centrale", "Identifier le matériel et les capacités", "Matériel & capacités"),
  target("ports-connecteurs", "Quel connecteur utiliser ?", "Identifier le matériel et les capacités", "Matériel & capacités"),
  target("conversions-capacites", "Conversions de capacités", "Identifier le matériel et les capacités", "Matériel & capacités"),
  target("choix-pc-classe", "Choisir un PC pour la salle", "Identifier le matériel et les capacités", "Matériel & capacités"),
  target("systeme-application", "Système ou application ?", "Comprendre le système d’exploitation", "Système d’exploitation"),
  target("diagnostic-os", "Pourquoi le PC ne démarre-t-il pas ?", "Comprendre le système d’exploitation", "Système d’exploitation"),
  target("equipements-reseau", "Équipements et rôles", "Comprendre le réseau local", "Réseau local"),
  target("topologie-etoile", "Reconnaître la topologie", "Comprendre le réseau local", "Réseau local"),
  target("adresse-identite", "Une adresse pour chaque identité", "Comprendre le réseau local", "Réseau local"),
  target("plan-connexions", "Construire le réseau du club", "Comprendre le réseau local", "Réseau local"),
  target("url-vers-internet", "De l’adresse web à la page", "Comprendre le réseau local", "Réseau local"),
  target("dossier-equipement", "Préparer le dossier d’équipement", "Mobiliser les acquis dans une situation", "Mission de synthèse"),
];

export const revisionMissionOrder = [
  "Information & traitement",
  "Matériel & capacités",
  "Système d’exploitation",
  "Réseau local",
  "Mission de synthèse",
];
