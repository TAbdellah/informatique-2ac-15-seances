"use client";

import { useState } from "react";
import { ArrowRight, Cable, Check, CircleHelp, FileText, Radio, Send, Wifi, X } from "lucide-react";
import { publicAsset } from "../lib/public-assets";
import { Session3Text as Text } from "./session3-translation";
import { s4t as t } from "./session4-data";
import type { Session4Draft } from "./session4-model";
import {
  expoDeviceType, expoHasPort, expoKit, expoLinks, expoNetworkWires, expoNetworks, expoPlans,
  expoRoute, expoSSID, expoSSIDAt, expoTopologyNames, expoWire,
  type ExpoDevice, type ExpoNetworkKind, type ExpoPoint,
} from "./session4-expo-model";

type BoardNode = ExpoPoint & {
  id: string; name: string; photo?: string; port?: boolean; wifi?: boolean; slot?: string;
};
type BoardLine = { from: ExpoPoint; to: ExpoPoint; kind?: "wifi" | "selected" };
const photo = (name: string) => `session4/images/${name}.webp`;

function ExpoBoard({ nodes, lines, active, selected, onPort }: {
  nodes: BoardNode[];
  lines: BoardLine[];
  active?: BoardNode[];
  selected?: string;
  onPort?: (id: string) => void;
}) {
  const path = active?.map((node, i) => `${i === 0 ? "M" : "L"} ${node.x} ${node.y}`).join(" ");
  return <div className="expo-board-scroll" tabIndex={0} role="region" aria-label="Plan des connexions">
    <div className="expo-board">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {lines.map(({ from, to, kind }, i) => <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" className={kind ?? ""} />)}
        {path && <><path d={path} className="expo-packet-trail" vectorEffect="non-scaling-stroke" />
          <circle r="1.05" className="expo-packet"><animateMotion key={path} path={path} dur="1.8s" repeatCount="2" fill="freeze" /></circle></>}
      </svg>
      {nodes.filter(node => node.name).map(node => {
        const props = { className: `expo-device ${node.slot ? "expo-device-slot" : ""}`, style: { left: `${node.x}%`, top: `${node.y}%` } };
        const content = <>
          {node.photo ? <img src={publicAsset(node.photo)} alt="" /> : <CircleHelp size={30} aria-hidden="true" />}
          <strong>{node.name}</strong>
          {node.port && onPort && <span><Cable size={13} aria-hidden="true" /> RJ45</span>}
          {node.wifi && <span><Wifi size={13} aria-hidden="true" /> Wi-Fi</span>}
        </>;
        return node.port && onPort
          ? <button key={node.id} {...props} type="button" aria-label={`Prise RJ45 · ${node.name}`} aria-pressed={selected === node.id} onClick={() => onPort(node.id)}>{content}</button>
          : <div key={node.id} {...props}>{content}</div>;
      })}
    </div>
  </div>;
}

export function ExpoTopologyLab({ draft, onChange }: {
  draft: Session4Draft; onChange: (patch: Partial<Session4Draft>) => void;
}) {
  const [tab, setTab] = useState(0);
  const plan = expoPlans[tab];
  const selected = draft.selections[`wire-${plan.id}`] ?? "";
  const topology = draft.selections[`topo-${plan.id}`] ?? "";
  const get = (id: string) => plan.nodes.find(node => node.id === id)!;
  const lines: BoardLine[] = plan.existing.map(([a,b]) => ({ from:get(a), to:get(b) }));
  if (plan.trunk) lines.push({ from: plan.trunk[0], to: plan.trunk[1] });
  if (selected && plan.options[Number(selected)]) {
    const [a,b] = plan.options[Number(selected)].edge;
    lines.push({ from:get(a), to:get(b), kind:"selected" });
  }
  function choose(field: string, value: string) {
    onChange({ selections: { ...draft.selections, [`${field}-${plan.id}`]: value } });
  }
  return <div className="expo-lab">
    <div className="expo-plan-tabs" role="group" aria-label="Plans à compléter">
      {expoPlans.map((item, i) => <button key={item.id} type="button" aria-pressed={tab === i} onClick={() => setTab(i)}>
        <Text value={t(`Plan ${item.id}`,`المخطط ${item.id}`)} />
        {draft.selections[`wire-${item.id}`] && draft.selections[`topo-${item.id}`] && <Check size={16} aria-label="Réponse saisie" />}
      </button>)}
    </div>
    <ExpoBoard nodes={plan.nodes} lines={lines} />
    <div className="expo-plan-answers">
      <fieldset><legend><Text value={t("1 · Quel trait faut-il ajouter ?", "1 · ما الخط الذي يجب إضافته؟")} /></legend>
        {plan.options.map((option, i) => <label key={option.label}><input type="radio" name={`plan-${plan.id}`} checked={selected === String(i)} onChange={() => choose("wire",String(i))} /> {option.label}</label>)}
      </fieldset>
      <label><Text value={t("2 · Quelle est cette topologie ?", "2 · ما اسم هذه البنية؟")} />
        <select aria-label="Nom de la topologie" value={topology} onChange={event => choose("topo",event.target.value)}>
          <option value="">Choisir…</option>
          {expoTopologyNames.map(item => <option key={item.id} value={item.id}>{item.label.fr} · {item.label.ar}</option>)}
        </select>
      </label>
    </div>
    <p className="s4-help"><Text value={t("Le trait jaune montre la liaison que tu proposes.", "يبين الخط الأصفر الوصلة التي تقترحها.")} /></p>
  </div>;
}

function DeviceKit({ slots, kind, draft, onInstall }: {
  slots: ExpoDevice[]; kind: ExpoNetworkKind; draft: Session4Draft;
  onInstall: (slot: "switch" | "ap", device: string) => void;
}) {
  return <div className="expo-kit">
    {slots.map(({slot,id}) => slot && <fieldset key={id}>
      <legend><Text value={slot === "switch" ? t("Équipement du centre","الجهاز المركزي") : t("Équipement de la zone Wi-Fi","جهاز منطقة Wi-Fi")} /></legend>
      <div className="expo-kit-options">
        {expoKit.map(device => <button key={device.id} type="button" aria-pressed={expoDeviceType(kind,draft,slot) === device.id}
          aria-label={`${slot === "switch" ? "Centre" : "Zone Wi-Fi"} · ${device.name.fr}`} onClick={() => onInstall(slot,device.id)}>
          <img src={publicAsset(device.image)} alt="" /><Text value={device.name} />
        </button>)}
      </div>
    </fieldset>)}
  </div>;
}

const receipt = {
  wired: t("Feuille imprimée au bureau", "تمت طباعة الورقة في المكتب"),
  wireless: t("Programme reçu à la bibliothèque", "تم استلام البرنامج في المكتبة"),
  mixed: t("Affiche visible sur la TV du hall", "ظهر الإعلان على تلفاز الردهة"),
  diagnostic: t("Affiche visible sur la TV du hall", "ظهر الإعلان على تلفاز الردهة"),
};
const ssidOptions = [expoSSID,"SALLE-PROFS","INVITES"];
export function ExpoNetworkLab({ kind, draft, onChange }: {
  kind: ExpoNetworkKind; draft: Session4Draft; onChange: (patch: Partial<Session4Draft>) => void;
}) {
  const [selected,setSelected] = useState("");
  const [hint,setHint] = useState<ReturnType<typeof t> | null>(null);
  const network = expoNetworks[kind];
  const diagnostic = kind === "diagnostic";
  const slots = network.nodes.filter(node => node.slot);
  const cables = expoNetworkWires(kind,draft);
  const name = (id: string) => {
    const node = network.nodes.find(item => item.id === id);
    if (node?.slot) return expoKit.find(e => e.id === expoDeviceType(kind,draft,node.slot!))?.name.fr ?? node.name;
    return node?.name ?? id;
  };
  const board = network.nodes.map(node => ({
    ...node, name:name(node.id), port:expoHasPort(kind,draft,node.id),
    photo:node.slot ? expoKit.find(e => e.id === expoDeviceType(kind,draft,node.slot!))?.image : node.photo,
  }));
  const get = (id: string) => board.find(node => node.id === id)!;
  const lines: BoardLine[] = expoLinks(kind,draft).map(edge => ({ from:get(edge.a),to:get(edge.b),kind:edge.wireless ? "wifi" : undefined }));
  const route = draft.tested && draft.delivered ? expoRoute(kind,draft) : null;
  function rewire(links: string[]) {
    onChange({ links, selections: diagnostic ? { ...draft.selections,rewired:"yes" } : draft.selections, tested:false, delivered:false });
  }
  function install(slot: "switch" | "ap", device: string) {
    if (draft.selections[slot] === device) return;
    setSelected("");
    setHint(null);
    onChange({
      selections:{ ...draft.selections,[slot]:device },
      links:cables.filter(wire => !wire.split("|").includes(slot)),tested:false,delivered:false,
    });
  }
  function connect(id: string) {
    if (diagnostic && draft.selections.failed !== "yes") {
      setHint(t("Teste d’abord l’envoi pour observer la panne.","اختبر الإرسال أولًا لملاحظة العطل."));
      return;
    }
    if (!selected || selected === id) {
      setSelected(selected === id ? "" : id);
      setHint(null);
      return;
    }
    const link = expoWire(selected,id);
    if (cables.includes(link)) {
      setHint(t("Ce câble est déjà branché.","هذا الكابل موصول بالفعل."));
    } else if ([selected,id].some(endpoint => {
      const slot = network.nodes.find(node => node.id === endpoint)?.slot;
      const hasFreePorts = slot && expoDeviceType(kind,draft,slot) === "switch";
      return !hasFreePorts && cables.some(wire => wire.split("|").includes(endpoint));
    })) {
      setHint(t("Cette prise est occupée. Débranche son câble dans la liste pour la libérer.","هذا المنفذ مستعمل. افصل كابله من القائمة لتحريره."));
    } else {
      rewire([...cables,link]);
      setHint(null);
    }
    setSelected("");
  }
  function setSSID(id: string, ssid: string) {
    onChange({ selections:{ ...draft.selections,[id]:ssid },tested:false,delivered:false });
  }
  function send() {
    const found = expoRoute(kind,draft);
    const selections = diagnostic && !found ? { ...draft.selections, failed:"yes" } : draft.selections;
    setHint(null);
    onChange({ tested:true,delivered:!!found,selections });
  }
  return <div className="expo-lab">
    {!diagnostic && <DeviceKit slots={slots} kind={kind} draft={draft} onInstall={install} />}
    {network.clients.length > 0 && !diagnostic && <div className="expo-ssid-panel">
      <label><Radio size={18} aria-hidden="true" /><Text value={t("Wi-Fi émis par le point d’accès","Wi-Fi الذي تبثه نقطة الولوج")} />
        <select aria-label="Nom du Wi-Fi émis" value={expoSSIDAt(kind,draft,"ssid")} onChange={e => setSSID("ssid",e.target.value)}>
          <option value="">Choisir un réseau…</option>{ssidOptions.map(value => <option key={value}>{value}</option>)}
        </select>
      </label>
      {network.clients.map(id => <label key={id}><Wifi size={17} aria-hidden="true" /><span>{name(id)}</span>
        <select aria-label={`Wi-Fi · ${name(id)}`} value={expoSSIDAt(kind,draft,id)} onChange={e => setSSID(id,e.target.value)}>
          <option value="">Choisir un réseau…</option>{ssidOptions.map(value => <option key={value}>{value}</option>)}
        </select>
      </label>)}
    </div>}
    <div className="expo-board-header">
      <span><Radio size={15} aria-hidden="true" /> RÉSEAU LOCAL · INTERNET COUPÉ</span>
      <div className="expo-legend"><span className="wired">RJ45</span>{network.clients.length > 0 && <span className="wireless">Wi-Fi</span>}</div>
    </div>
    <ExpoBoard nodes={board} lines={lines} active={route?.map(get)} selected={selected} onPort={network.wires.length ? connect : undefined} />
    {network.wires.length > 0 && <div className="expo-patch-panel">
      <img src={publicAsset(photo("cable-rj45"))} alt="" />
      <div><strong><Text value={t("Câble RJ45","كابل RJ45")} /></strong>
        <p aria-live="polite"><Text value={hint ?? (selected
          ? t(`Prise choisie sur ${name(selected)}. Clique sur la deuxième prise.`,`اخترت منفذ ${name(selected)}. انقر على المنفذ الثاني.`)
          : t("Clique sur deux prises RJ45 pour poser un câble.","انقر على منفذي RJ45 لتوصيل كابل."))} /></p>
      </div>
    </div>}
    {cables.length > 0 && <div className="expo-cables" aria-label="Câbles branchés">
      {cables.map(wire => {
        const [a,b] = wire.split("|");
        return <button key={wire} type="button" disabled={diagnostic && draft.selections.failed !== "yes"}
          aria-label={`Débrancher ${name(a)} et ${name(b)}`} onClick={() => { rewire(cables.filter(item => item !== wire));setSelected("");setHint(null); }}>
          <Cable size={14} aria-hidden="true" /> {name(a)} ↔ {name(b)} <X size={14} aria-hidden="true" />
        </button>;
      })}
    </div>}
    <div className="expo-test">
      <button type="button" className="s4-primary" onClick={send}><Send size={17} aria-hidden="true" /><Text value={network.test} /></button>
      {draft.tested && <div className={`expo-delivery ${route ? "arrived" : ""}`} role="status">
        <FileText size={22} aria-hidden="true" />
        <div><strong><Text value={route ? receipt[kind] : t("Document en attente","المستند في الانتظار")} /></strong>
          {route ? <><p><Text value={network.document} /></p><p className="expo-route">{route.map((id,i) => <span key={id}>{i > 0 && <ArrowRight size={13} aria-hidden="true" />} {name(id)}</span>)}</p></>
            : <p><Text value={t("Le document ne trouve pas de trajet. Suis les connexions entre le départ et l’arrivée.","لم يجد المستند مسارًا. تتبع الاتصالات من المصدر إلى الوجهة.")} /></p>}
        </div>
      </div>}
    </div>
    {diagnostic && <label className="expo-diagnosis"><Text value={t("Pourquoi l’envoi échouait-il ?","لماذا تعذر الإرسال؟")} />
      <select aria-label="Cause de la panne" value={draft.selections.cause ?? ""} onChange={e => onChange({selections:{ ...draft.selections,cause:e.target.value }})}>
        <option value="">Choisir l’explication…</option>
        <option value="internet">Il fallait rétablir Internet.</option>
        <option value="uplink">Le point d’accès n’était pas relié au commutateur.</option>
        <option value="screen">L’écran de la TV était trop petit.</option>
      </select>
    </label>}
  </div>;
}
