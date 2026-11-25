import {createContext,useContext,useState,useEffect,useCallback} from 'react'
import {api} from '../api/client.js'
import {UI} from '../i18n/ui.js'
const Ctx=createContext()
export const useApp=()=>useContext(Ctx)
export function AppProvider({children}){
 const [data,setData]=useState(null),[err,setErr]=useState(false),[lang,setLang]=useState(localStorage.getItem('lang')||'ar')
 const reload=useCallback(async()=>{const [settings,pages,sections,packages]=await Promise.all([api.get('/settings'),api.get('/pages'),api.get('/sections?_sort=order'),api.get('/packages?_sort=order')]);setData({settings,pages,sections,packages})},[])
 useEffect(()=>{reload().catch(()=>setErr(true))},[reload])
 useEffect(()=>{localStorage.setItem('lang',lang);const d=document.documentElement;d.lang=lang;d.dir=lang==='ar'?'rtl':'ltr'},[lang])
 useEffect(()=>{if(data)document.documentElement.classList.toggle('no-anim',fx.animations===false)},[data])
 useEffect(()=>{if(data){const r=document.documentElement.style;Object.entries(data.settings.theme).forEach(([k,v])=>r.setProperty('--'+k,v));document.title=data.settings.brand.name[lang]}},[data,lang])
 const fx={animations:true,particles:true,preloader:true,...data?.settings.effects}
 const tr=o=>o?(o[lang]||o.ar||''):''
 const ui=k=>UI[k]?.[lang]||k
 const T=(a,e)=>lang==='ar'?a:e
 const money=n=>`${Number(n).toLocaleString(lang==='ar'?'ar-SA-u-nu-latn':'en-US')} ${data?tr(data.settings.currency):''}`
 if(err)return <p style={{padding:40,textAlign:'center'}}>{UI.apiErr[lang]}</p>
 if(!data)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#1b1b19'}}><img src="/logo.png" alt="" width="96" height="96" style={{animation:'pulse 1.4s ease-in-out infinite'}}/></div>
 return <Ctx.Provider value={{fx,data,reload,lang,setLang,tr,ui,T,money}}>{children}</Ctx.Provider>
}
