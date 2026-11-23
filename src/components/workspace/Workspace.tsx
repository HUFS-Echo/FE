import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '../Wordmark';
import { WEEK, type SubjectId } from '../../config/learning';
import type { Session } from '../../lib/session';
import { roleHome } from '../../lib/router';
import { StudentShell } from './student/StudentShell';
import { StudentCoursePicker } from './student/StudentCoursePicker';
import { ProfessorShell } from './professor/ProfessorShell';
import { ProfFilterProvider, defaultProfFilters, type ProfFilters } from './professor/ProfFilterContext';
import { ProfessorProfile } from './profile/MyPages';
type Props={session:Session;path:string;onNavigate:(path:string)=>void;onSessionUpdate:(session:Session)=>void;onLogout:()=>void;onToast:(message:string)=>void;onReset:()=>void;onReplay:()=>void};
function initialFilters():ProfFilters{try{return {...defaultProfFilters,...JSON.parse(localStorage.getItem('hufs-echo.prof-filters.v1')||'{}')}}catch{return defaultProfFilters}}
function studentSubjectFromPath(path:string):SubjectId{const value=path.split('/')[3];return value==='writing'||value==='speaking'?value:'reading'}
export function Workspace({session,path,onNavigate,onSessionUpdate,onLogout,onToast,onReset,onReplay}:Props){
 const [menuOpen,setMenuOpen]=useState(false);const [filters,setFilters]=useState<ProfFilters>(initialFilters);const menuRef=useRef<HTMLDivElement>(null);const isStudent=session.role==='student';const studentSubject=studentSubjectFromPath(path);
 useEffect(()=>{const close=(event:MouseEvent)=>{if(!menuRef.current?.contains(event.target as Node))setMenuOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
 useEffect(()=>{localStorage.setItem('hufs-echo.prof-filters.v1',JSON.stringify(filters))},[filters]);
 useEffect(()=>{const resetFilters=()=>{if(!localStorage.getItem('hufs-echo.prof-filters.v1'))setFilters(defaultProfFilters)};window.addEventListener('hufs-demo-change',resetFilters);return()=>window.removeEventListener('hufs-demo-change',resetFilters)},[]);
 const profilePath=isStudent?'/student/me':'/prof/me';const inProfile=path.endsWith('/me');
 return <ProfFilterProvider value={{filters,setFilters}}><div className="workspace" data-role={session.role}>
  <header className="workspace__head"><div className="workspace__brand"><button type="button" className="workspace__home" aria-label={`${isStudent?'학생':'교수'} 홈으로 이동`} onClick={()=>onNavigate(roleHome(session.role))}><Wordmark compact/></button><span className="workspace__divider" aria-hidden="true"/><span className="course-chip"><span aria-hidden="true">🇵🇹</span> PT · 포르투갈어</span></div><div className="workspace__tools">
   {isStudent&&<StudentCoursePicker variant="header" subject={studentSubject} onChange={id=>onNavigate(`/student/course/${id}`)}/>}
   {!isStudent&&<><label className="header-select"><span className="sr-only">과목</span><select value={filters.course} onChange={e=>setFilters(f=>({...f,course:e.target.value as ProfFilters['course']}))}><option value="reading">포르투갈어 읽기와 쓰기</option><option value="writing">포르투갈어 작문</option><option value="speaking">포르투갈어 회화</option></select></label><label className="header-select"><span className="sr-only">분반</span><select value={filters.section} onChange={e=>setFilters(f=>({...f,section:e.target.value as ProfFilters['section']}))}><option value="01">01분반</option><option value="02">02분반</option></select></label><label className="header-select header-select--week"><span className="sr-only">주차</span><select value={filters.week} onChange={e=>setFilters(f=>({...f,week:Number(e.target.value)}))}><option value={1}>1주차 · 종료</option><option value={2}>2주차 · 종료</option><option value={3}>3주차 · {WEEK.dates}</option><option value={4}>4주차 · 예약</option><option value={5}>5주차 · 임시 저장</option></select></label></>}
   {isStudent?<div className="user-menu__identity"><span className="user-chip__avatar"><img src="/owls/football.png" alt="" aria-hidden="true" /></span><span className="user-chip__text"><b>{session.name}</b><small>학생 · {session.department}</small></span></div>:<div className="user-menu" ref={menuRef}><button type="button" className="user-menu__trigger" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><span className="user-chip__avatar"><img src="/owls/football.png" alt="" aria-hidden="true" /></span><span className="user-chip__text"><b>{session.name}</b><small>교수 · {session.department}</small></span><span className="user-menu__chevron">⌄</span></button>{menuOpen&&<div className="user-menu__popover"><button type="button" onClick={()=>{setMenuOpen(false);onNavigate(profilePath)}}>마이페이지 <span>내 정보와 설정</span></button><button type="button" className="user-menu__logout" onClick={onLogout}>로그아웃</button></div>}</div>}
  </div></header>
  {isStudent?<StudentShell session={session} path={path} onNavigate={onNavigate} onToast={onToast} onSessionUpdate={onSessionUpdate} onLogout={onLogout} onReset={onReset} onReplay={onReplay}/>:inProfile?<ProfessorProfile session={session} onNavigate={onNavigate} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay}/>:<ProfessorShell path={path} onNavigate={onNavigate} onToast={onToast}/>}
 </div></ProfFilterProvider>;
}
