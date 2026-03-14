'use client';
import { useEffect } from 'react';
import { useAppDispatch,useAppSelector } from '@/store/hooks';
import { hydrateState } from '@/store/trackerSlice';
const KEY='english-tracker-state-v1';
export default function Persistor(){const dispatch=useAppDispatch();const tracker=useAppSelector(s=>s.tracker);useEffect(()=>{const raw=localStorage.getItem(KEY);if(raw)try{dispatch(hydrateState(JSON.parse(raw)))}catch{}},[dispatch]);useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(tracker))},[tracker]);return null}
