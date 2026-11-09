const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
function compile(source, imports = {}, fallback = require, globals = {}) {
  const module = {exports: {}};
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code, {...globals, module, exports: module.exports, require: name => imports[name] ?? fallback(name)});
  return module.exports;
}
const scope = compile(fs.readFileSync(path.join(root, 'lib/teacher-course-context.tsx'), 'utf8'));
const navigator = compile(fs.readFileSync(path.join(root, 'app/teacher-exercise-navigator.tsx'), 'utf8'), {'../lib/teacher-course-context': scope});
const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
const navigationSource = page.slice(page.indexOf('function ExerciseNavigation('), page.indexOf('function sameNumbers('));
const {ExerciseNavigation} = compile(`import {ArrowLeft,ArrowRight,CheckCircle2,AlertTriangle,LockKeyhole} from 'lucide-react';
import {useTeacherCourse} from '../lib/teacher-course-context';
const txt=(value,lang)=>value[lang];
const BilingualText=({value})=><span>{value.fr}</span>;
${navigationSource}
export {ExerciseNavigation};`, {'../lib/teacher-course-context': scope});
let assertions = 0;
const equal = (actual, expected, message) => {assert.deepEqual(actual, expected, message);assertions++;};
const render = (component, teacher) => renderToStaticMarkup(teacher ? React.createElement(scope.TeacherCourseScope, null, component) : component);
const props = {index: 0, total: 25, done: 0, lang: 'fr', onPrevious() {}, onNext() {}, nextDisabled: true, resultStatus: false};
let student = render(React.createElement(ExerciseNavigation, props), false);
let teacher = render(React.createElement(ExerciseNavigation, props), true);
equal(/class="exercise-next-button" disabled/.test(student), true, 'student still needs to succeed');
equal(/class="exercise-next-button" disabled/.test(teacher), false, 'teacher can move on without answering');
equal(teacher.includes('Pas encore réussi'), false, 'teacher has no student remediation warning');
equal(student.includes('Pas encore réussi'), true, 'student feedback retained');
equal(teacher.includes('role="progressbar"'), false, 'demonstration is not displayed as learner progress');
equal(teacher.includes('Mode professeur · navigation libre'), true);
const titles = Array.from({length: 25}, (_, i) => `Exercice ${i + 1}`);
const picker = React.createElement(navigator.TeacherExerciseNavigator, {index: 24, titles, onGo() {}});
equal(render(picker, false), '', 'jump selector absent for students');
teacher = render(picker, true);
equal((teacher.match(/<option /g) ?? []).length, 25, 'every exercise available directly');
equal(/<option value="24" selected="">25 · Exercice 25<\/option>/.test(teacher), true, 'last exercise can be selected without prior success');
equal(teacher.includes('aucune réponse requise'), true);
equal(scope.teacherDemoProfile.id.startsWith('00000000-0000-4000-8000-'), true, 'dedicated local demonstration identity');
equal('resumeToken' in scope.teacherDemoProfile, false, 'demo identity cannot sync student records');

function fakeStorage() {
  const entries = new Map();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key),
  };
}
const localStorage = fakeStorage();
function demoTab() {
  const sessionStorage = fakeStorage();
  const globals = {localStorage, sessionStorage};
  const storage = compile(fs.readFileSync(path.join(root, 'lib/learning-storage.ts'), 'utf8'), {}, require, globals);
  const demo = compile(fs.readFileSync(path.join(root, 'lib/teacher-course-storage.ts'), 'utf8'), {
    './learning-storage': storage,
    './teacher-course-context': scope,
  }, require, globals);
  return {storage, sessionStorage, ...demo};
}
const firstTab = demoTab();
const otherTab = demoTab();
const demoId = scope.teacherDemoProfile.id;
const learnerId = '00000000-0000-4000-8000-000000000010';
const teacherKeys = [[1, 'workshop'], [2, 'assembly'], [2, 'repair'], [3, 'assessment'], [4, 'quiz'], [15, 'workshop']];
for (const [sessionId, kind] of teacherKeys) firstTab.storage.saveSnapshot(demoId, sessionId, kind, {answer: 'demo'});
otherTab.storage.saveSnapshot(demoId, 4, 'workshop', {answer: 'previous demonstration'});
firstTab.storage.saveSnapshot(demoId, 4, 'view', {activeTab: 'workshop'});
firstTab.storage.saveSnapshot(learnerId, 4, 'workshop', {answer: 'learner'});
const legacyUnit = `lab2ac-unit1-session-1-${demoId}`;
const legacyAssessment = `lab2ac-session3-bilan-v5-${demoId}`;
localStorage.setItem(legacyUnit, '["old-exercise"]');
localStorage.setItem(`lab2ac-progress-${demoId}`, '[1]');
localStorage.setItem('lab2ac-teacher-session', 'test-session');
for (const tab of [firstTab, otherTab]) tab.sessionStorage.setItem(legacyAssessment, 'old assessment');

firstTab.clearTeacherDemoAnswers();
for (const [sessionId, kind] of teacherKeys) equal(firstTab.storage.readSnapshot(demoId, sessionId, kind), null, `clears ${kind} for session ${sessionId} from storage and memory`);
equal(firstTab.storage.readSnapshot(demoId, 4, 'workshop'), null, 'clears the answers saved by another tab');
equal(localStorage.getItem(legacyUnit), null, 'old demonstration progress cannot restore cleared answers');
equal(localStorage.getItem(`lab2ac-progress-${demoId}`), null, 'clears earlier completion flags');
equal(firstTab.sessionStorage.getItem(legacyAssessment), null, 'legacy assessment is cleared in this tab');
equal(firstTab.storage.readSnapshot(demoId, 4, 'view').data.activeTab, 'workshop', 'the current course view is preserved');
equal(localStorage.getItem('lab2ac-teacher-session'), 'test-session', 'the reset keeps the teacher connected');
equal(firstTab.storage.readSnapshot(learnerId, 4, 'workshop').data.answer, 'learner', 'learner answers are untouched');
equal(localStorage.getItem(firstTab.teacherDemoResetKey) !== null, true, 'other tabs can observe the reset');

firstTab.storage.saveSnapshot(demoId, 4, 'workshop', {answer: 'new demonstration'});
otherTab.clearTeacherDemoAnswers(false);
equal(otherTab.sessionStorage.getItem(legacyAssessment), null, 'other tabs discard their legacy assessment');
equal(otherTab.storage.readSnapshot(demoId, 4, 'workshop').data.answer, 'new demonstration', 'other tabs reload answers entered after the reset');

const lab = compile(fs.readFileSync(path.join(root, 'app/session3-lab-data.ts'), 'utf8'));
function loadModel(file) {
  return compile(fs.readFileSync(file, 'utf8'), {}, name => loadModel(path.resolve(path.dirname(file), name)));
}
const progress = loadModel(path.join(root, 'lib/workshop-progress.ts'));
const {WorkshopSummary} = compile(fs.readFileSync(path.join(root, 'app/workshop-summary.tsx'), 'utf8'), {
  '../lib/workshop-progress': progress,
  '../lib/teacher-course-context': scope,
  '../lib/learning-context': {useLearnerResumeToken: () => undefined},
  '../lib/supabase-api': {},
  '../lib/workshop-attempt-cache': {workshopAttemptKey: () => 'test'},
  './session3-translation': {useSession3Translation: () => true, Session3Text: ({value}) => React.createElement('span', null, value.fr)},
  './workshop-summary.css': {},
});
const callbacks = {onBack() {}, onResume() {}, onTrace() {}, onEvaluate() {}};
const allIds = lab.session3Lab.exercises.map(exercise => exercise.id);
const summary = ids => React.createElement(WorkshopSummary, {...callbacks, participantId: 'test', sessionId: 3, state: {version: 1, completedIds: ids}});
student = render(summary([...allIds, allIds[0], 'obsolete-id']), false);
equal(student.includes('<strong>100 %</strong>'), true, 'duplicate or obsolete completions do not inflate the result');
equal(student.includes('Reprendre à l’exercice'), false, 'completed workshop has no false remediation warning');
equal(student.includes('Passer à l’évaluation'), true, 'assessment follows the workshop summary');
equal(student.includes('Lire la trace écrite'), true, 'summary retains the lesson notes route');
student = render(summary(allIds.slice(0,24)), false);
equal(student.includes('<strong>96 %</strong>'), true, 'saved partial progress remains visible');
equal(student.includes('Reprendre à l’exercice 25'), true, 'resume points to the unfinished task');
teacher = render(summary([]), true);
equal(teacher.includes('workshop-summary-metrics'), false, 'teacher synthesis never invents learner progress');
equal(teacher.includes('Reprendre à l’exercice'), false, 'teacher remains free to demonstrate');
console.log(JSON.stringify({passed: true, assertions}));
