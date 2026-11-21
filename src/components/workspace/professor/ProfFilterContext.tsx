import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
export type ProfFilters={course:'reading'|'writing'|'speaking';section:'01'|'02';week:number};
type Value={filters:ProfFilters;setFilters:Dispatch<SetStateAction<ProfFilters>>};
const Context=createContext<Value|null>(null);
export const ProfFilterProvider=Context.Provider;
export function useProfFilters(){const value=useContext(Context);if(!value)throw new Error('ProfFilterProvider is missing');return value;}
export const defaultProfFilters:ProfFilters={course:'reading',section:'01',week:3};
