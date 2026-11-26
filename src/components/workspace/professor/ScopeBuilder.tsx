import { useEffect, useState, type FormEvent } from 'react';
import { getExerciseTypes } from '../../../api/profCourses';
import { getMaterials, uploadMaterial } from '../../../api/materials';
import { createScope, generateExercises as requestExercises, getScope, publishScope, updateScope } from '../../../api/scopes';
import type { ExerciseType, LearningScope, Question } from '../../../api/types';
import { useApi, ApiEmptyState, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { ScopeListCard } from './ScopeLibrary';
type Props = { onNavigate: (path: string) => void; onToast: (message: string) => void; editScopeId?: number };
type Subject = '포르투갈어 문법' | '포르투갈어 읽기와 쓰기' | '포르투갈어 회화';
type Exercise = { id: string; prompt: string; answer: string; explanation: string; page: number; options?: string[] };
const subjectForCourse: Record<'grammar' | 'writing' | 'speaking', Subject> = { grammar: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' };
const courseIdForSubject: Record<Subject, number> = { '포르투갈어 문법': 1, '포르투갈어 읽기와 쓰기': 2, '포르투갈어 회화': 3 };
const exerciseTypeForSubject: Record<Subject, ExerciseType> = { '포르투갈어 문법': 'GRAMMAR', '포르투갈어 읽기와 쓰기': 'READING_WRITING', '포르투갈어 회화': 'SPEAKING' };
const courseForSubject: Record<Subject, 'grammar' | 'writing' | 'speaking'> = { '포르투갈어 문법': 'grammar', '포르투갈어 읽기와 쓰기': 'writing', '포르투갈어 회화': 'speaking' };
const initialTopic: Record<Subject, string> = { '포르투갈어 문법': '집과 방의 동사·성수 일치', '포르투갈어 읽기와 쓰기': '포르투갈 타일과 집 안 공간 읽기·쓰기', '포르투갈어 회화': '집 안 공간을 묻고 답하기' };
const initialPages: Record<Subject, [number, number]> = { '포르투갈어 문법': [29, 30], '포르투갈어 읽기와 쓰기': [93, 93], '포르투갈어 회화': [48, 49] };
const questionsForApi = (exercises: Exercise[]): Question[] => exercises.map((item, index) => ({ questionId: Number(item.id.replace(/\D/g, '')) || index + 1, format: 'MULTIPLE_CHOICE', sentence: item.prompt, answer: item.answer, choices: item.options ?? null, explanation: item.explanation, sourcePage: item.page }));
const exerciseFromQuestion = (question: Question, index: number): Exercise => ({ id: String(question.questionId || index + 1), prompt: question.sentence, answer: question.answer, explanation: question.explanation ?? '', page: question.sourcePage ?? 1, ...(question.choices ? { options: question.choices } : {}) });
export function ScopeBuilder({ onNavigate, onToast, editScopeId }: Props) {
  const { filters, setFilters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const defaultSubject: Subject = subjectForCourse[filters.course] ?? '포르투갈어 문법';
  const [subject, setSubject] = useState<Subject>(defaultSubject);
  const courseId = courseIdForSubject[subject]; const sectionId = Number(filters.section); const exerciseType = exerciseTypeForSubject[subject];
  const materialsApi = useApi(() => getMaterials(), []);
  const typesApi = useApi(() => getExerciseTypes(courseId), [courseId]);
  const scopeApi = useApi(() => editScopeId ? getScope(editScopeId) : Promise.resolve(null), [editScopeId]);
  const materials = materialsApi.data?.materials ?? [];
  const [materialId, setMaterialId] = useState(1); const selectedMaterial = materials.find((material) => material.materialId === materialId) ?? materials[0];
  const safeSubject = subject in initialPages ? subject : '포르투갈어 문법';
  const [week, setWeek] = useState(filters.week); const [from, setFrom] = useState(initialPages[safeSubject][0]); const [to, setTo] = useState(initialPages[safeSubject][1]);
  const [topic, setTopic] = useState(initialTopic[safeSubject]); const [chosen, setChosen] = useState<string[]>([initialTopic[safeSubject]]);
  const [fileName, setFileName] = useState('Português_A1_2026.pdf'); const [exercises, setExercises] = useState<Exercise[]>([]);
  const [scopeId, setScopeId] = useState<number | null>(editScopeId ?? null); const [busy, setBusy] = useState(false); const [uploadBusy, setUploadBusy] = useState(false);
  const [edit, setEdit] = useState<Exercise | null>(null); const [showPublish, setShowPublish] = useState(false); const [drag, setDrag] = useState(false); const [showAll, setShowAll] = useState(false); const [showGeneratedPreview, setShowGeneratedPreview] = useState(false);
  const previewExercises = showAll ? exercises : exercises.slice(0, 3);
  const rangeError = t(from > to ? '시작 쪽은 끝 쪽보다 클 수 없어요.' : to - from + 1 > 10 ? '한 번에 최대 10쪽까지 설정할 수 있어요.' : from < 1 || to > (selectedMaterial?.pageCount ?? 120) ? 'PDF의 1–120쪽 범위에서 선택해 주세요.' : '');
  const weekStatus = week <= 2 ? '종료' : week === 3 ? '진행 중' : '예정';
  useEffect(() => { const next = subjectForCourse[filters.course]; if (next !== subject) setSubject(next); }, [filters.course, subject]);
  useEffect(() => { if (!scopeApi.data || !editScopeId) return; const scope = scopeApi.data; setScopeId(scope.scopeId); setSubject(scope.courseId === 2 ? '포르투갈어 읽기와 쓰기' : scope.courseId === 3 ? '포르투갈어 회화' : '포르투갈어 문법'); setWeek(scope.week); setFrom(scope.startPage); setTo(scope.endPage); setTopic(scope.title); setChosen([scope.title]); setMaterialId(scope.materialId); setExercises(scope.questions.map(exerciseFromQuestion)); setShowGeneratedPreview(scope.questions.length > 0); }, [scopeApi.data, editScopeId]);
  useEffect(() => { if (!selectedMaterial) return; setFileName(selectedMaterial.fileName); setMaterialId(selectedMaterial.materialId); }, [selectedMaterial?.materialId]);
  useEffect(() => {
    if (!scopeId || !exercises.length || editScopeId) return;
    const timer = window.setTimeout(() => {
      void updateScope(scopeId, { scopeId, courseId, sectionId, week, materialId, startPage: from, endPage: to, title: chosen.join(' · ') || topic, exerciseType, questions: questionsForApi(exercises), status: 'DRAFT', updatedAt: new Date().toISOString() }).catch((reason: unknown) => onToast(reason instanceof Error ? reason.message : '임시 저장하지 못했어요.'));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [scopeId, exercises, courseId, sectionId, week, materialId, from, to, chosen, topic, exerciseType, editScopeId]);
  function selectExerciseType(next: Subject) { setSubject(next); setFilters((current) => ({ ...current, course: courseForSubject[next] })); }
  async function upload(file?: File) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { onToast(t('PDF 파일만 선택할 수 있어요.')); return; }
    setUploadBusy(true);
    try { const material = await uploadMaterial(file); setFileName(material.fileName); setMaterialId(material.materialId); materialsApi.retry(); onToast(t('강의자료를 올렸어요.')); }
    catch (error) { const reason = error instanceof Error ? error : new Error('강의자료를 올리지 못했어요.'); onToast(reason.message); }
    finally { setUploadBusy(false); }
  }
  async function generate() {
    if (rangeError) { onToast(rangeError); return; }
    if (!materialId) { onToast(t('먼저 강의자료를 선택해 주세요.')); return; }
    setBusy(true);
    try {
      const generated = await requestExercises({ courseId, materialId, startPage: from, endPage: to, exerciseType, count: 5 });
      const nextExercises = generated.questions.map((question, index) => ({ id: String(index + 1), prompt: question.sentence, answer: question.answer, explanation: question.explanation ?? '', page: question.sourcePage ?? from, ...(question.choices ? { options: question.choices } : {}) }));
      setExercises(nextExercises); setTopic(generated.scopeTitle); setChosen([generated.scopeTitle]); setShowAll(false); setShowGeneratedPreview(true);
      const created = await createScope({ courseId, sectionId, week, materialId, startPage: from, endPage: to, exerciseType, title: generated.scopeTitle, questions: questionsForApi(nextExercises) });
      setScopeId(created.scopeId); onToast(t('AI가 연습 예시를 만들었어요.'));
    } catch (error) { const reason = error instanceof Error ? error : new Error('연습 문제를 만들지 못했어요.'); onToast(reason.message); }
    finally { setBusy(false); }
  }
  async function publish(event: FormEvent) {
    event.preventDefault(); if (rangeError || !exercises.length) return;
    setBusy(true);
    try {
      let currentScopeId = scopeId;
      if (!currentScopeId) { const created = await createScope({ courseId, sectionId, week, materialId, startPage: from, endPage: to, exerciseType, title: chosen.join(' · ') || topic, questions: questionsForApi(exercises) }); currentScopeId = created.scopeId; setScopeId(currentScopeId); }
      await updateScope(currentScopeId, { scopeId: currentScopeId, courseId, sectionId, week, materialId, startPage: from, endPage: to, title: chosen.join(' · ') || topic, exerciseType, questions: questionsForApi(exercises), status: 'IN_PROGRESS', updatedAt: new Date().toISOString() } satisfies Partial<LearningScope>);
      await publishScope(currentScopeId);
      setShowPublish(false); onToast(t('학습 범위를 게시했어요.')); onNavigate('/prof/scope/new');
    } catch (error) { const reason = error instanceof Error ? error : new Error('학습 범위를 게시하지 못했어요.'); onToast(reason.message); }
    finally { setBusy(false); }
  }
  function updateExercise(key: keyof Exercise, value: string) { if (!edit) return; setEdit({ ...edit, [key]: key === 'page' ? Number(value) : value }); }
  return <div className="prof-page scope-builder">
    {(materialsApi.loading || typesApi.loading || (editScopeId && scopeApi.loading)) && <ApiLoadingState label={t('학습 범위를 불러오는 중…')}/>}
    {(materialsApi.error || typesApi.error || scopeApi.error) && <ApiErrorState error={materialsApi.error ?? typesApi.error ?? scopeApi.error!} onRetry={() => { materialsApi.retry(); typesApi.retry(); scopeApi.retry(); }}/>}
    <header className="prof-page-head"><div><span className="eyebrow">SCOPE STUDIO · P2</span><h1>{t('학습 범위 설정')}</h1><p>{language === 'en' ? `Set the scope and exercises for ${t(subject)}, Section ${filters.section}. Preview the student view.` : `${subject} · ${filters.section}분반 범위와 연습을 설정하고 학생 화면을 미리 봅니다.`}</p></div><span className="tag">{t(weekStatus)}</span></header>
    <div className="scope-layout"><section className="scope-form-col">
      {showGeneratedPreview && exercises.length > 0 ? <div className="scope-preview-step"><div className="prof-card student-preview-card"><div className="section-title"><div><span className="eyebrow">STUDENT PREVIEW</span><h2>{t('학생 화면 미리보기')}</h2></div><span className="tag">{week}주차</span></div><div className="student-preview-head"><span>{t('이번 주 범위')}</span><b>{t(subject)}</b><small>{language === 'en' ? `PDF pages ${from}${to !== from ? `–${to}` : ''} · ${t(chosen.join(' · ') || topic)}` : `PDF ${from}${to !== from ? `–${to}` : ''}쪽 · ${chosen.join(' · ') || topic}`}</small></div><div className="preview-practice-head"><b>{t('첫 연습 세트')}</b><span className="ai-pill">✦ AI</span></div><p className="preview-intro">{subject === '포르투갈어 문법' ? t('집과 방의 문법 표현을 다섯 가지 유형으로 연습해요.') : subject === '포르투갈어 읽기와 쓰기' ? t('포르투갈 타일과 집 안 공간에 관한 글을 읽고 핵심 정보를 찾아 답해요.') : t('집 안 공간을 묻고 답하는 회화 5문항을 연습해요.')}</p><div className="exercise-list">{previewExercises.map((ex, i) => <article key={ex.id}><div><b>{String(i + 1).padStart(2, '0')}</b><span>{t(ex.prompt)}</span></div><small>{language === 'en' ? `PDF evidence · p. ${ex.page}` : `PDF ${ex.page}쪽 근거`}</small><button type="button" onClick={() => setEdit(ex)}>{t('수정')}</button><button type="button" onClick={() => setExercises((items) => items.filter((item) => item.id !== ex.id))}>{t('삭제')}</button></article>)}</div>{exercises.length > 3 && <button type="button" className="preview-toggle" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>{t(showAll ? '접기' : '전체 보기')} {showAll ? '' : `(${exercises.length})`}</button>}</div><button type="button" className="btn-solid publish-trigger" disabled={!!rangeError || !exercises.length || busy} onClick={() => setShowPublish(true)}>{t('학습 범위 확정하고 게시 →')}</button><p className="autosave-note">{t('작성 중인 내용은 자동 저장됩니다.')}</p></div> : <>
        <div className="prof-card scope-step"><div className="scope-step__title"><i>1</i><div><b>{t('강의자료')}</b><small>{t('PDF 파일과 페이지를 선택해요.')}</small></div></div>
          {materialsApi.loading ? <ApiLoadingState label={t('강의자료를 불러오는 중…')}/> : materials.length ? <div className="pdf-file-card"><span className="pdf-icon">PDF</span><span><b>{fileName || selectedMaterial?.fileName}</b><small>{selectedMaterial ? `${selectedMaterial.pageCount}쪽 · ${t('최근 사용')}` : language === 'en' ? 'Recently used' : t('최근 사용')}</small></span><label className="text-link">{t('변경')}<input type="file" accept="application/pdf" onChange={(event) => void upload(event.target.files?.[0])}/></label></div> : <ApiEmptyState message={t('등록된 강의자료가 없어요. PDF를 올려 주세요.')}/ >}
          <label className={`pdf-drop ${drag ? 'is-drag' : ''}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); void upload(event.dataTransfer.files[0]); }}>{uploadBusy ? t('강의자료를 올리는 중…') : <>{t('PDF를 여기에 놓거나')} <b>{t('새 PDF 올리기')}</b></>}<input type="file" accept="application/pdf" onChange={(event) => void upload(event.target.files?.[0])}/></label>
        </div>
        <div className="prof-card scope-step"><div className="scope-step__title"><i>2</i><div><b>{t('주차·쪽 범위')}</b><small>{t('최대 10쪽까지 설정할 수 있어요.')}</small></div></div>
          <label className="form-label">{t('주차')}<select value={week} onChange={(event) => { const value = Number(event.target.value); setWeek(value); setFilters((current) => ({ ...current, week: value })); }}><option value={1}>{t('1주차 · 종료')}</option><option value={2}>{t('2주차 · 종료')}</option><option value={3}>{t('3주차 · 진행 중')}</option><option value={4}>{t('4주차 · 예정')}</option><option value={5}>{language === 'en' ? 'Week 5 · Scheduled' : '5주차 · 예정'}</option></select></label>
          <div className="page-range-fields"><label className="form-label">{t('시작 쪽')}<input type="number" min={1} max={selectedMaterial?.pageCount ?? 120} value={from} onChange={(event) => setFrom(Number(event.target.value))}/></label><span>—</span><label className="form-label">{t('끝 쪽')}<input type="number" min={1} max={selectedMaterial?.pageCount ?? 120} value={to} onChange={(event) => setTo(Number(event.target.value))}/></label></div>{rangeError && <p className="form-error">{rangeError}</p>}
          <div className="exercise-type-picker"><span className="form-label">{t('문제 유형 선택')}</span>{typesApi.loading ? <ApiLoadingState label={t('문제 유형을 불러오는 중…')}/> : typesApi.data?.types.length ? <><div className="exercise-type-picker__options" role="group" aria-label={t('문제 유형 선택')}><button type="button" className={subject === '포르투갈어 문법' ? 'is-selected' : ''} aria-pressed={subject === '포르투갈어 문법'} onClick={() => selectExerciseType('포르투갈어 문법')}>{t('문법')}</button><button type="button" className={subject === '포르투갈어 읽기와 쓰기' ? 'is-selected' : ''} aria-pressed={subject === '포르투갈어 읽기와 쓰기'} onClick={() => selectExerciseType('포르투갈어 읽기와 쓰기')}>{t('작문 독해')}</button><button type="button" className={subject === '포르투갈어 회화' ? 'is-selected' : ''} aria-pressed={subject === '포르투갈어 회화'} onClick={() => selectExerciseType('포르투갈어 회화')}>{t('회화')}</button></div><small>{t('선택한 유형에 맞춰 과목과 연습 문제를 설정합니다.')}</small></> : <ApiEmptyState message={t('선택할 수 있는 문제 유형이 없어요.')}/>}</div>
        </div><button type="button" className="btn-solid scope-generate" disabled={busy || !!rangeError || materialsApi.loading || typesApi.loading || !materials.length} onClick={() => void generate()}>{busy ? t('AI가 연습을 만들고 있어요…') : t('✦ AI로 연습 만들기')}</button>
      </>}
      {scopeApi.loading && editScopeId && <ApiLoadingState label={t('학습 범위를 불러오는 중…')}/>}
    </section><section className="scope-student-col"><ScopeListCard/></section></div>
    {edit && <div className="modal-backdrop" onClick={() => setEdit(null)}><section className="simple-modal scope-edit-modal" role="dialog" aria-modal="true" aria-label={t('연습 편집')} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setEdit(null)}>×</button><span className="ai-pill">{t('AI 연습 수정')}</span><h2>{t('연습 내용 편집')}</h2><label className="form-label">{t('문장')}<textarea rows={3} value={edit.prompt} onChange={(event) => updateExercise('prompt', event.target.value)}/></label><label className="form-label">{t('정답')}<input value={edit.answer} onChange={(event) => updateExercise('answer', event.target.value)}/></label>{edit.options && <label className="form-label">{t('선택지')}<input value={edit.options.join(', ')} onChange={(event) => setEdit({ ...edit, options: event.target.value.split(',').map((item) => item.trim()) })}/></label>}<label className="form-label">{t('설명')}<textarea rows={2} value={edit.explanation} onChange={(event) => updateExercise('explanation', event.target.value)}/></label><label className="form-label">{t('근거 쪽')}<input type="number" value={edit.page} onChange={(event) => updateExercise('page', event.target.value)}/></label><button type="button" className="btn-solid" onClick={() => { setExercises((items) => items.map((item) => item.id === edit.id ? edit : item)); setEdit(null); onToast(t('연습 내용을 저장했어요.')); }}>{t('저장')}</button></section></div>}
    {showPublish && <div className="modal-backdrop" onClick={() => setShowPublish(false)}><form className="simple-modal" onSubmit={(event) => void publish(event)} role="dialog" aria-modal="true" aria-label={t('학습 범위 게시 확인')} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowPublish(false)}>×</button><span className="eyebrow">PUBLISH SCOPE</span><h2>{t('학습 범위를 확정할까요?')}</h2><p>{week}주차 · {subject} · PDF {from}–{to}쪽</p><div className="publish-summary"><b>{chosen.join(' · ') || topic}</b><small>연습 {exercises.length}개 · {filters.section}분반 학생 {filters.section === '01' ? 48 : 32}명</small></div><p>{language === 'en' ? 'Publishing now will make this scope immediately available to students.' : '확정하면 학생들에게 바로 공개됩니다.'}</p><div className="prof-actions"><button type="button" className="btn-ghost" onClick={() => setShowPublish(false)}>{t('계속 수정')}</button><button type="submit" className="btn-solid" disabled={busy}>{busy ? t('게시하는 중…') : t('지금 게시')}</button></div></form></div>}
  </div>;
}
