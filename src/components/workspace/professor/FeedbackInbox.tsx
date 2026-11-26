import { useMemo, useState } from 'react';
import type { FeedbackReport } from '../../../api/types';
import { getFeedbackReports, resolveFeedbackReport, reopenFeedbackReport } from '../../../api/feedbackReports';
import { useApi, ApiErrorState, ApiLoadingState, ApiEmptyState } from '../../../api/useApi';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
type Props = { onToast: (message: string) => void };
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
export function FeedbackInbox({ onToast }: Props) {
  const { filters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course]; const sectionId = Number(filters.section);
  const feedbackApi = useApi(() => getFeedbackReports({ courseId, sectionId, week: filters.week }), [courseId, sectionId, filters.week]);
  const subjectLabel = t({ grammar: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' }[filters.course]);
  const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`;
  const [tab, setTab] = useState<'open' | 'resolved'>('open'); const [correcting, setCorrecting] = useState<number | null>(null); const [answer, setAnswer] = useState(''); const [undo, setUndo] = useState<number | null>(null);
  const response = feedbackApi.data;
  const scopedCases = useMemo(() => filters.section === '01' ? response?.reports.filter((item) => item.week === filters.week) ?? [] : [], [response, filters.section, filters.week]);
  const shown = scopedCases.filter((item) => item.status === (tab === 'open' ? 'OPEN' : 'RESOLVED'));
  const openCount = scopedCases.filter((item) => item.status === 'OPEN').length;
  const resolve = async (item: FeedbackReport, resolution: 'AI_CORRECT' | 'AI_ERROR' | 'CUSTOM', correctedText?: string) => {
    try { await resolveFeedbackReport(item.reportId, { resolution, correctedText }); setUndo(item.reportId); setTab('resolved'); feedbackApi.retry(); window.dispatchEvent(new Event('hufs-demo-change')); onToast(t('신고를 처리했어요. 아래에서 되돌릴 수 있어요.')); }
    catch (error) { onToast(error instanceof Error ? error.message : t('신고를 처리하지 못했어요.')); }
  };
  const restore = async () => {
    if (undo == null) return;
    try { await reopenFeedbackReport(undo); setTab('open'); setUndo(null); feedbackApi.retry(); window.dispatchEvent(new Event('hufs-demo-change')); onToast(t('신고 처리를 되돌렸어요.')); }
    catch (error) { onToast(error instanceof Error ? error.message : t('신고 처리를 되돌리지 못했어요.')); }
  };
  const custom = (item: FeedbackReport) => { if (!answer.trim()) { onToast(t('올바른 교정 문장을 입력해 주세요.')); return; } void resolve(item, 'CUSTOM', answer.trim()); setCorrecting(null); setAnswer(''); };
  const quality = response?.quality;
  const displayDate = (value: string) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR', { month: '2-digit', day: '2-digit' }); };
  return <div className="prof-page">
    {feedbackApi.error && <ApiErrorState error={feedbackApi.error} onRetry={feedbackApi.retry}/>}
    <header className="prof-page-head"><div><span className="eyebrow">AI ERROR REPORT · {openCount} OPEN</span><h1>{t('AI 오류 신고')}</h1><p>{t('학생이 발견한 AI 교정 오류를 검토하고 교정 품질을 개선해요.')} · {subjectLabel} · {t(filters.section === '01' ? '01분반' : '02분반')} · {weekLabel}</p></div></header>
    <div className="feedback-layout"><section className="feedback-main"><div className="subject-tabs"><button className={tab === 'open' ? 'is-active' : ''} onClick={() => setTab('open')}>{t('확인 필요')} <b>{openCount}</b></button><button className={tab === 'resolved' ? 'is-active' : ''} onClick={() => setTab('resolved')}>{t('처리 완료')} <b>{scopedCases.filter((item) => item.status === 'RESOLVED').length}</b></button></div>
      {feedbackApi.loading ? <ApiLoadingState label={t('신고 목록을 불러오는 중…')}/> : shown.length === 0 ? <div className="prof-empty"><span>✓</span><div><b>{t('선택한 조건의 신고가 없어요')}</b><p>{t('과목·분반·주차를 바꾸거나 새 신고가 접수되면 여기에 표시됩니다.')}</p></div></div> : shown.map(item => <article className="prof-card feedback-card" key={item.reportId}>
        <header><span className="feedback-type">{t(item.typeLabel)}</span><small>{displayDate(item.reportedAt)} · {weekLabel} · {item.sourcePage}</small></header><div className="feedback-person">{t('익명 학생')} <b>{item.student.maskedName}{item.student.maskedStudentNo ? ` · ${item.student.maskedStudentNo}` : ''}</b></div>
        <div className="feedback-columns"><div><small>{t('학생 문장')}</small><p>{item.studentSentence}</p></div><div className="feedback-ai"><small>{t('AI 교정')}</small><p>{item.aiCorrection}</p><small>{t('AI 설명')}</small><p>{item.aiExplanation}</p></div></div><blockquote>“{item.comment}”</blockquote>
        {item.status === 'RESOLVED' ? <div className="resolved-note">{t('처리 완료')}</div> : <div className="feedback-actions"><button className="btn-ghost" onClick={() => void resolve(item, 'AI_CORRECT')}>{t('AI 교정이 맞아요')}</button><button className="btn-ghost" onClick={() => void resolve(item, 'AI_ERROR')}>{t('AI 오류로 표시')}</button><button className="btn-solid" onClick={() => { setCorrecting(correcting === item.reportId ? null : item.reportId); setAnswer(''); }}>{t('올바른 교정 입력')}</button></div>}
        {correcting === item.reportId && <div className="inline-correction"><label>{t('올바른 교정 문장')}<input value={answer} onChange={e => setAnswer(e.target.value)} placeholder={language === 'en' ? 'e.g. Eu estou cansada.' : '예: Eu estou cansada.'}/></label><button className="btn-solid" onClick={() => custom(item)}>{t('저장하고 처리')}</button></div>}
      </article>)}
    </section><aside className="prof-card quality-card"><span className="eyebrow">QUALITY · THIS WEEK</span><h2>{t('이번 주 교정 품질')}</h2>
      {feedbackApi.loading ? <ApiLoadingState label={t('품질 정보를 불러오는 중…')}/> : quality ? <><div className="quality-rate"><b>{quality.reportRate}%</b><span>{t('신고 비율')}</span></div><p>{t('신고')} <b>{quality.reportCount}{language === 'en' ? ' reports' : '건'}</b> <i>/</i> {t('교정')} <b>{quality.correctionCount}{language === 'en' ? ' corrections' : '건'}</b></p><div className="quality-types"><h3>{t('신고 유형')}</h3>{quality.byType.map((item) => <div key={item.typeLabel}><span>{t(item.typeLabel)}</span><b>{item.count}{language === 'en' ? ' reports' : '건'}</b></div>)}</div></> : !feedbackApi.error && <ApiEmptyState message={t('품질 데이터가 아직 없어요.')} />}
      <img src="/owls/football.png" alt="에코 부엉이"/></aside></div>
    {undo != null && <div className="undo-toast" role="status">{t('신고를 처리했어요')} <button onClick={() => void restore()}>{t('되돌리기')}</button></div>}
  </div>;
}
