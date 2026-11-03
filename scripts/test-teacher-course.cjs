const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
function compile(source, imports = {}) {
  const module = {exports: {}};
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, require: name => imports[name] ?? require(name)});
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
const lab = compile(fs.readFileSync(path.join(root, 'app/session3-lab-data.ts'), 'utf8'));
const {Session3WorkshopSummary} = compile(fs.readFileSync(path.join(root, 'app/session3-workshop-summary.tsx'), 'utf8'), {
  './session3-lab-data': lab,
  '../lib/teacher-course-context': scope,
  './session3-translation': {Session3Text: ({value}) => React.createElement('span', null, value.fr)},
  './session3-revision.css': {},
});
const callbacks = {onBack() {}, onResume() {}, onTrace() {}, onEvaluate() {}};
const allIds = lab.session3Lab.exercises.map(exercise => exercise.id);
student = render(React.createElement(Session3WorkshopSummary, {...callbacks, completedIds: [...allIds, allIds[0], 'obsolete-id']}), false);
equal(student.includes('<strong>25 / 25</strong>'), true, 'summary counts actual exercises without duplicate or obsolete completions');
equal(student.includes('Il reste des exercices'), false, 'completed workshop has no false remediation warning');
equal(student.includes('Passer à l’évaluation'), true, 'assessment follows the workshop summary');
equal(student.includes('Lire la trace écrite'), true, 'summary retains the lesson notes route');
student = render(React.createElement(Session3WorkshopSummary, {...callbacks, completedIds: allIds.slice(0,24)}), false);
equal(student.includes('<strong>24 / 25</strong>'), true, 'saved partial progress remains visible');
equal(student.includes('reprendre à l’exercice 25'), true, 'resume points to the unfinished task');
teacher = render(React.createElement(Session3WorkshopSummary, {...callbacks, completedIds: []}), true);
equal(teacher.includes('s3-workshop-summary-progress'), false, 'teacher synthesis never invents learner progress');
equal(teacher.includes('Il reste des exercices'), false, 'teacher remains free to demonstrate');
console.log(JSON.stringify({passed: true, assertions}));
