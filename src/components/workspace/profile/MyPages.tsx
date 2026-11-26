import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '../../../lib/session';
import { getMe, updateMe, getUserSettings, updateUserSettings, agreeLearningConsent, revokeLearningConsent, exportLearningData } from '../../../api/auth';
import { getStudentCourses, leaveCourse } from '../../../api/studentCourses';
import { useApi, ApiEmptyState, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import type { Course } from '../../../api/types';
import { deleteMaterial, getMaterials, uploadMaterial } from '../../../api/materials';
import { getProfessorCourses } from '../../../api/profCourses';
import { useProfessorLanguage } from '../professor/ProfessorLanguageContext';

type Props = { session: Session; onNavigate?: (path: string) => void; onSessionUpdate: (session: Session) => void; onToast: (message: string) => void; onLogout: () => void; onReset: () => void; onReplay: () => void };
type StudentSettings = Awaited<ReturnType<typeof getUserSettings>>;
function ProfileHeader({ session, role, t = (text: string) => text }: { session: Session; role: string; t?: (text: string) => string }) {
  return <header className="profile-hero"><div className="profile-avatar"><img src="/owls/football.png" alt="축구 유니폼을 입은 에코 부엉이" /></div><div><span className="eyebrow">MY HUFS ECHO · {role}</span><h1>{session.name}{t('님의 마이페이지')}</h1><p>{session.email} · {session.department}</p></div><span className="profile-shield">{t('학교 메일 인증 완료')}</span></header>;
}
function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return <section className="profile-card"><header><div><h2>{title}</h2>{desc && <p>{desc}</p>}</div></header>{children}</section>;
}
function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: () => void }) {
  return <label className="setting-toggle"><span>{label}</span><button type="button" role="switch" aria-checked={checked} disabled={disabled} className={checked ? 'is-on' : ''} onClick={onChange}><i /></button></label>;
}
export function StudentProfile({ session, onSessionUpdate, onToast, onLogout }: Props) {
  const profileApi = useApi(() => getMe(), [session.email]);
  const settingsApi = useApi(() => getUserSettings(), [session.email]);
  const coursesApi = useApi(() => getStudentCourses(), [session.email]);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(session.name);
  const [deptYear, setDeptYear] = useState(`${session.department} · ${session.year || '2학년'}`);
  const [settingsOverride, setSettingsOverride] = useState<Partial<StudentSettings['notifications']> | null>(null);
  const [consentOverride, setConsentOverride] = useState<StudentSettings['consent'] | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState<Course | null>(null);
  const settings = settingsApi.data;
  const notifications = { ...settings?.notifications, ...settingsOverride };
  const consent = consentOverride ?? settings?.consent;
  const courses = (coursesApi.data?.courses ?? []).filter((course) => course.enrolled);
  const visibleProfile = profileApi.data;
  useEffect(() => {
    if (!visibleProfile) return;
    setName(visibleProfile.name);
    setDeptYear(`${visibleProfile.department} · ${visibleProfile.year ?? session.year ?? '2학년'}`);
  }, [visibleProfile, session.year]);

  async function saveProfile() {
    setSaving(true);
    try {
      const [department, year] = deptYear.split(' · ');
      await updateMe({ name, department, year });
      onSessionUpdate({ ...session, name, department, year, avatar: '/owls/football.png' });
      onToast('프로필 정보를 저장했어요.');
      setEdit(false);
    } catch (error) { onToast(error instanceof Error ? error.message : '프로필을 저장하지 못했어요.'); }
    finally { setSaving(false); }
  }
  async function changeNotification(key: 'newScope' | 'dueTomorrow') {
    const patch = { [key]: !Boolean(notifications[key]) };
    try {
      const result = await updateUserSettings({ notifications: patch });
      setSettingsOverride(result.notifications);
    } catch (error) { onToast(error instanceof Error ? error.message : '설정을 저장하지 못했어요.'); }
  }
  async function changeConsent() {
    try {
      if (consent?.agreed) {
        const result = await revokeLearningConsent();
        setConsentOverride({ agreed: result.agreed, agreedAt: '' });
        onToast('학습 기록 활용 동의를 철회했어요. (데모)');
      } else {
        const result = await agreeLearningConsent();
        setConsentOverride(result);
      }
    } catch (error) { onToast(error instanceof Error ? error.message : '동의 설정을 변경하지 못했어요.'); }
  }
  async function downloadLearningData() {
    setExporting(true);
    try {
      const result = await exportLearningData('json');
      const blob = new Blob([result.content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.click();
      URL.revokeObjectURL(url);
      onToast('내 학습 기록 파일을 준비했어요.');
    } catch (error) { onToast(error instanceof Error ? error.message : '학습 기록을 준비하지 못했어요.'); }
    finally { setExporting(false); }
  }
  async function confirmLeave() {
    if (!modal) return;
    try {
      await leaveCourse(modal.courseId);
      coursesApi.retry();
      onToast(`${modal.title} 과목에서 나왔어요.`);
      setModal(null);
    } catch (error) { onToast(error instanceof Error ? error.message : '과목 연결을 해제하지 못했어요.'); }
  }

  const displayName = visibleProfile?.name ?? name;
  const profileSession: Session = { ...session, name: displayName, department: visibleProfile?.department ?? deptYear.split(' · ')[0], year: visibleProfile?.year ?? deptYear.split(' · ').slice(1).join(' · '), avatar: '/owls/football.png' };
  return <div className="profile-page"><ProfileHeader session={profileSession} role="STUDENT PROFILE" />
    <div className="profile-columns"><div className="profile-column">
      <Section title="프로필" desc="학습에 표시되는 기본 정보예요.">
        {profileApi.loading && <ApiLoadingState label="프로필을 불러오는 중…" />}
        {profileApi.error && <ApiErrorState error={profileApi.error} onRetry={profileApi.retry} />}
        <div className="profile-data-grid"><label>이름<input disabled={!edit} value={name} onChange={(event) => setName(event.target.value)} /></label><label>학번<input disabled value={visibleProfile?.studentId ?? session.studentId} /></label><label>학교 메일<input disabled value={visibleProfile?.email ?? session.email} /></label><label>학과 · 학년<input disabled={!edit} value={deptYear} onChange={(event) => setDeptYear(event.target.value)} /></label></div>
        <div className="prof-actions"><button className="btn-ghost" disabled={saving} onClick={() => edit ? void saveProfile() : setEdit(true)}>{saving ? '저장 중…' : edit ? '변경 저장' : '프로필 수정'}</button></div>
      </Section>
      <Section title="수강 과목" desc="연결된 과목과 이번 주 학습 범위예요.">
        {coursesApi.loading ? <ApiLoadingState label="수강 과목을 불러오는 중…" /> : coursesApi.error ? <ApiErrorState error={coursesApi.error} onRetry={coursesApi.retry} /> : courses.length === 0 ? <ApiEmptyState message="연결된 수강 과목이 없어요." /> : <div className="course-profile-list">{courses.map((course) => {
          const typeLabel = course.type === 'GRAMMAR' ? '문법·문제 풀이' : course.typeLabel;
          const scopeTitle = course.type === 'WRITING' ? '학교 파티 읽기' : course.type === 'SPEAKING' ? '아사이 가게 주문·가격 묻기' : course.currentScopeTitle ?? '학습 범위 없음';
          return <article key={course.courseId}><div><b>{course.title}</b><span>{typeLabel} · {course.code} · {course.professorName ?? '김교수'} · {course.section ?? '01분반'}</span><small>이번 주 · {scopeTitle}</small></div><button onClick={() => setModal(course)}>과목 나가기</button></article>;
        })}</div>}
      </Section>
    </div><div className="profile-column">
      <Section title="알림" desc="필요한 학습 알림만 받아요.">
        {settingsApi.loading ? <ApiLoadingState label="알림 설정을 불러오는 중…" /> : settingsApi.error ? <ApiErrorState error={settingsApi.error} onRetry={settingsApi.retry} /> : <><Toggle label="새 학습 범위 공개" checked={Boolean(notifications.newScope)} onChange={() => void changeNotification('newScope')} /><Toggle label="마감 하루 전" checked={Boolean(notifications.dueTomorrow)} onChange={() => void changeNotification('dueTomorrow')} /></>}
      </Section>
      <Section title="개인정보 · 데이터" desc="학습 데이터 사용 방식을 관리합니다.">
        {settingsApi.loading ? <ApiLoadingState label="동의 정보를 불러오는 중…" /> : settingsApi.error ? <ApiErrorState error={settingsApi.error} onRetry={settingsApi.retry} /> : <><div className="consent-banner"><b>{consent?.agreed ? '학습 기록 활용에 동의했어요' : '학습 기록 활용 동의를 철회했어요'}</b><span>{consent?.agreedAt ? `동의일 · ${consent.agreedAt.replaceAll('-', '.')}` : '동의하지 않음'}</span><button onClick={() => void changeConsent()}>{consent?.agreed ? '동의 철회' : '동의하기'}</button></div><p className="profile-info">음성은 텍스트로 바꾼 뒤 저장하지 않아요. 학습 기록은 수업 개선과 개인화에만 사용됩니다.</p></>}
        <button className="btn-ghost" disabled={exporting} onClick={() => void downloadLearningData()}>{exporting ? '준비 중…' : '내 학습 기록 내려받기'}</button>
      </Section>
      <Section title="계정"><div className="account-actions"><button className="btn-danger" onClick={onLogout}>로그아웃</button></div></Section>
    </div></div>
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="simple-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}>×</button><h2>과목에서 나갈까요?</h2><p>{`${modal.title} 과목 연결을 해제할까요?`}</p><div className="prof-actions"><button className="btn-ghost" onClick={() => setModal(null)}>취소</button><button className="btn-solid" onClick={() => void confirmLeave()}>과목 나가기</button></div></div></div>}
  </div>;
}

export function ProfessorProfile({ session, onSessionUpdate, onToast, onLogout }: Props) {
  const { t, language } = useProfessorLanguage();
  const profileApi = useApi(() => getMe(), [session.email]);
  const coursesApi = useApi(() => getProfessorCourses(), [session.email]);
  const materialsApi = useApi(() => getMaterials(), []);
  const [edit, setEdit] = useState(false);
  const [profName, setProfName] = useState(session.name);
  const [profDepartment, setProfDepartment] = useState(session.department);
  const [room, setRoom] = useState(session.room || '본관 512호 · 화 14:00–16:00');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!profileApi.data) return;
    setProfName(profileApi.data.name);
    setProfDepartment(profileApi.data.department);
    setRoom(profileApi.data.room ?? session.room ?? '본관 512호 · 화 14:00–16:00');
  }, [profileApi.data, session.room]);
  async function saveProfile() {
    setSaving(true);
    try {
      await updateMe({ name: profName, department: profDepartment, room });
      onSessionUpdate({ ...session, name: profName, department: profDepartment, room });
      onToast(t('교수 프로필을 저장했어요.'));
      setEdit(false);
    } catch (error) { onToast(error instanceof Error ? error.message : '프로필을 저장하지 못했어요.'); }
    finally { setSaving(false); }
  }
  async function removeMaterial(materialId: number, fileName: string, used: number) {
    const warning = used ? `이 자료를 사용하는 범위 ${used}개가 있어요. 그래도 삭제할까요?` : `${fileName}을 삭제할까요?`;
    if (!window.confirm(warning)) return;
    try { await deleteMaterial(materialId); materialsApi.retry(); onToast(t('강의자료를 삭제했어요.')); }
    catch (error) { onToast(error instanceof Error ? error.message : '강의자료를 삭제하지 못했어요.'); }
  }
  async function addMaterial(file?: File) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { onToast(t('PDF 파일만 올릴 수 있어요.')); return; }
    setUploading(true);
    try { await uploadMaterial(file); materialsApi.retry(); onToast(t('강의자료를 올렸어요.')); }
    catch (error) { onToast(error instanceof Error ? error.message : '강의자료를 올리지 못했어요.'); }
    finally { setUploading(false); }
  }
  const displayProfile = profileApi.data;
  const professorSession: Session = { ...session, name: displayProfile?.name ?? profName, department: displayProfile?.department ?? profDepartment, room: displayProfile?.room ?? room };
  const courses = coursesApi.data?.courses ?? [];
  const materials = materialsApi.data?.materials ?? [];
  return <div className="profile-page"><ProfileHeader session={professorSession} role="PROFESSOR PROFILE" t={t} /><div className="profile-columns"><div className="profile-column">
    <Section title={t('프로필')} desc={t('학생에게 표시되는 담당 교수 정보예요.')}>
      {profileApi.loading && <ApiLoadingState label={t('프로필을 불러오는 중…')} />}{profileApi.error && <ApiErrorState error={profileApi.error} onRetry={profileApi.retry} />}
      <div className="profile-data-grid"><label>이름<input disabled={!edit} value={profName} onChange={(event) => setProfName(event.target.value)} /></label><label>학교 메일<input disabled value={displayProfile?.email ?? session.email} /></label><label>{t('소속 학과')}<input disabled={!edit} value={profDepartment} onChange={(event) => setProfDepartment(event.target.value)} /></label><label>{t('연구실 · 면담 시간')}<input disabled={!edit} value={room} onChange={(event) => setRoom(event.target.value)} /></label></div>
      <button className="btn-ghost" disabled={saving} onClick={() => edit ? void saveProfile() : setEdit(true)}>{saving ? t('저장 중…') : edit ? '변경 저장' : t('프로필 수정')}</button>
    </Section>
    <Section title={t('담당 과목 관리')} desc={coursesApi.data ? t(`${coursesApi.data.current.sectionId === 1 ? '01' : '02'}분반 · 수강생 ${courses.find((item) => item.courseId === coursesApi.data?.current.courseId)?.sections.find((section) => section.sectionId === coursesApi.data?.current.sectionId)?.studentCount ?? 0}명`) : t('담당 과목 정보예요.')}>
      {coursesApi.loading ? <ApiLoadingState label={t('담당 과목을 불러오는 중…')} /> : coursesApi.error ? <ApiErrorState error={coursesApi.error} onRetry={coursesApi.retry} /> : courses.length === 0 ? <ApiEmptyState message={t('담당 과목이 없어요.')} /> : <div className="course-profile-list">{courses.map((course) => <article key={course.courseId}><div><b>{t(course.title)}</b><span>{t(course.typeLabel)} · {course.sections.map((section) => `${t(section.name)} · ${section.studentCount}명`).join(' / ')}</span><small>{course.sections[0]?.classCode ? `${t('수업 코드 · ')}${course.sections[0].classCode}` : t('수업 코드 정보 없음')}</small></div></article>)}</div>}
    </Section>
  </div><div className="profile-column">
    <Section title={t('강의자료 보관함')} desc={t('PDF 파일 메타데이터는 이 기기에만 저장됩니다.')}>
      {materialsApi.loading ? <ApiLoadingState label={t('강의자료를 불러오는 중…')} /> : materialsApi.error ? <ApiErrorState error={materialsApi.error} onRetry={materialsApi.retry} /> : <div className="file-list">{materials.length ? materials.map((file) => { const uploadedDate = file.uploadedAt?.slice(5, 10).replace('-', '.') ?? '—'; return <article key={file.materialId}><span className="pdf-icon">PDF</span><div><b>{file.fileName}</b><small>{language === 'en' ? `${file.pageCount} pages · Used by ${file.usedScopeCount ?? 0} scopes · Uploaded ${uploadedDate}` : `${file.pageCount}쪽 · 사용 중인 범위 ${file.usedScopeCount ?? 0}개 · ${uploadedDate} 업로드`}</small></div><button onClick={() => void removeMaterial(file.materialId, file.fileName, file.usedScopeCount ?? 0)}>{t('삭제')}</button></article>; }) : <ApiEmptyState message={t('저장된 강의자료가 없어요.')} />}</div>}
      <label className="btn-ghost upload-label">{uploading ? t('올리는 중…') : t('＋ 새 PDF 올리기')}<input type="file" accept="application/pdf" disabled={uploading} onChange={(event) => { void addMaterial(event.target.files?.[0]); event.target.value = ''; }} /></label>
    </Section>
    <Section title="계정"><button className="btn-danger" onClick={onLogout}>로그아웃</button></Section>
  </div></div></div>;
}
