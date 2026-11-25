import {useState} from 'react'
import {useApp} from '../../context/AppContext.jsx'
import {syncCollection} from '../../api/client.js'
import {setIn,uid,B} from '../../utils/helpers.js'
import {Link} from 'react-router-dom'
import {FaTrash} from 'react-icons/fa'
import {PageHead,Bi,Txt,Color,Img,Switch,Save} from '../fields/fields.jsx'
const TYPES=['stats','cards','banner','about','carousel','faq','features']
const newItem=g=>({t:B(),d:B(),icon:'⭐',image:'',group:g||'',rating:5,value:''})
export default function SectionsEditor(){
 const {data,T,tr}=useApp(),[list,setList]=useState(()=>structuredClone(data.sections)),[type,setType]=useState('cards')
 const set=(i,p,v)=>setList(l=>l.map((s,k)=>k===i?setIn(s,p,v):s))
 const move=(i,d)=>setList(l=>{const a=[...l],j=i+d;if(j<0||j>=a.length)return a;[a[i],a[j]]=[a[j],a[i]];return a})
 const add=()=>setList(l=>[...l,{id:uid('s'),type,visible:true,title:{ar:'قسم جديد',en:'New section'},sub:B(),bg:'',dark:false,image:'',button:{label:B(),link:'/'},groups:[],itemButton:B(),stars:false,items:type==='about'?[newItem()]:[]}])
 return <><PageHead title={T('أقسام الصفحة الرئيسية','Home sections')} desc={T('رتّب الأقسام بالأسهم، أخفِ أو أظهر، وعدّل كل المحتوى بالعربية والإنجليزية.','Reorder with arrows, show/hide, and edit all content in Arabic and English.')}/>
  {list.map((s,i)=><details className="sec-ed" key={s.id}><summary><b>{i+1}. {tr(s.title)||s.id}</b> <small>({s.type})</small>
   <span onClick={e=>{if(!e.target.closest('.switch'))e.preventDefault()}}><button className="mini" onClick={()=>move(i,-1)}>↑</button><button className="mini" onClick={()=>move(i,1)}>↓</button>
    <Switch checked={s.visible} on={v=>set(i,['visible'],v)} label={T('ظاهر','Visible')}/>
    <button className="mini" onClick={()=>confirm(T('حذف القسم؟','Delete section?'))&&setList(list.filter((_,k)=>k!==i))}><FaTrash /></button></span></summary>
   <Bi label={s.type==='about'?T('الشارة الصغيرة (من نحن)','Small badge (About us)'):T('العنوان','Title')} v={s.title} on={v=>set(i,['title'],v)}/><Bi label={s.type==='about'?T('العنوان الرئيسي','Main title'):T('العنوان الفرعي / النص','Subtitle / text')} v={s.sub} on={v=>set(i,['sub'],v)}/>
   <div className="row"><Color label={T('لون الخلفية','Background')} v={s.bg} on={v=>set(i,['bg'],v)}/><button className="mini" onClick={()=>set(i,['bg'],'')}>{T('افتراضي','Default')}</button>
    <label className="chk"><input type="checkbox" checked={s.dark} onChange={e=>set(i,['dark'],e.target.checked)}/>{T('نص فاتح','Light text')}</label>
    {s.type==='cards'&&<label className="chk"><input type="checkbox" checked={s.stars} onChange={e=>set(i,['stars'],e.target.checked)}/>{T('نجوم','Stars')}</label>}</div>
   {s.type==='banner'&&<p className="muted">{T('صورة البنر، عكس الصورة، مكان النص والارتفاع من صفحة ','Photo, flip, text position and height are in ')}<Link to="/admin/banners"><b>{T('البنرات','Banners')}</b></Link></p>}
   {s.type==='about'&&<Img label={T('الصورة','Image')} v={s.image} on={v=>set(i,['image'],v)}/>}
   {['banner','about','cards'].includes(s.type)&&<><Bi label={T('نص الزر','Button text')} v={s.button.label} on={v=>set(i,['button','label'],v)}/><Txt label={T('رابط الزر','Button link')} v={s.button.link} on={v=>set(i,['button','link'],v)}/></>}
   {s.type==='cards'&&<><Bi label={T('نص زر كل بطاقة (اتركه فارغا لإخفائه)','Per-card button text (empty = hidden)')} v={s.itemButton} on={v=>set(i,['itemButton'],v)}/>
    <div className="item"><b>{T('التبويبات','Tabs')}</b>{s.groups.map((g,k)=><div className="row" key={k}><Txt label="id" v={g.id} on={v=>set(i,['groups',k,'id'],v)}/><Bi v={g.label} on={v=>set(i,['groups',k,'label'],v)}/><button className="mini" onClick={()=>set(i,['groups'],s.groups.filter((_,x)=>x!==k))}><FaTrash /></button></div>)}
     <button className="mini" onClick={()=>set(i,['groups'],[...s.groups,{id:'g'+(s.groups.length+1),label:B()}])}>+ {T('تبويب','Tab')}</button></div></>}
   {s.items.map((it,k)=><div className="item" key={k}>
    <div className="row">{s.type!=='faq'&&s.type!=='about'&&<Txt label={T('أيقونة','Icon')} v={it.icon} on={v=>set(i,['items',k,'icon'],v)}/>}
     {s.groups.length>0&&<div className="fld"><label>{T('التبويب','Tab')}</label><select value={it.group} onChange={e=>set(i,['items',k,'group'],e.target.value)}><option value=""></option>{s.groups.map(g=><option key={g.id} value={g.id}>{g.id}</option>)}</select></div>}
     {s.type==='stats'&&<Txt label={T('الرقم (مثال 500+)','Value (e.g. 500+)')} v={it.value} on={v=>set(i,['items',k,'value'],v)}/>}{s.stars&&<Txt type="number" label={T('التقييم','Rating')} v={it.rating} on={v=>set(i,['items',k,'rating'],v)}/>}
     <button className="mini" onClick={()=>set(i,['items'],s.items.filter((_,x)=>x!==k))}><FaTrash /></button></div>
    {['cards','carousel'].includes(s.type)&&<Img label={T('صورة (بدل الأيقونة)','Image (replaces icon)')} v={it.image} on={v=>set(i,['items',k,'image'],v)}/>}
    <Bi label={s.type==='about'?T('العنوان الثاني (السطر تحت الاسم)','Second title (line under the name)'):T('العنوان','Title')} v={it.t} on={v=>set(i,['items',k,'t'],v)}/><Bi area label={T('النص','Text')} v={it.d} on={v=>set(i,['items',k,'d'],v)}/></div>)}
   {s.type!=='about'&&s.type!=='banner'&&<button className="mini" onClick={()=>set(i,['items'],[...s.items,newItem(s.groups[0]?.id)])}>+ {T('عنصر','Add item')}</button>}
  </details>)}
  <div className="row addrow"><select value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(t=><option key={t}>{t}</option>)}</select><button className="btn sm" onClick={add}>+ {T('إضافة قسم','Add section')}</button></div>
  <Save fn={()=>syncCollection('sections',list,data.sections)}/></>
}
