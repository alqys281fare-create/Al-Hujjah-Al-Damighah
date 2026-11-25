import {useState} from 'react'
import {useApp} from '../../context/AppContext.jsx'
import {api} from '../../api/client.js'
import {setIn} from '../../utils/helpers.js'
import {PageHead,Panel,Bi,Txt,Img,Segmented,Range,Save} from '../fields/fields.jsx'
import './HeroEditor.css'
export default function HeroEditor(){
 const {data,T}=useApp(),[d,setD]=useState(()=>structuredClone(data.settings)),h=d.hero,s=(k,v)=>setD(o=>setIn(o,['hero',k],v))
 return <><PageHead title={T('الواجهة الرئيسية','Hero')} desc={T('أول ما يراه الزائر في الصفحة الرئيسية','The first thing visitors see on the home page')}/>
  <Panel title={T('الصورة','Photo')}>
   <div className="hero-prev"><div className={'hero-prev-img'+(h.flip?' flip':'')} style={{backgroundImage:h.image?`url(${h.image})`:undefined}}/><div className="hero-prev-shade" style={{opacity:Math.min(1,.5+h.overlay*2)}}/></div>
   <div className="grid2">
    <Img label={T('صورة الخلفية','Background image')} v={h.image} max={2400} on={v=>s('image',v)}/>
    <div>
     <Segmented label={T('اتجاه الصورة','Photo direction')} value={!!h.flip} on={v=>s('flip',v)} options={[[false,T('عادي','Normal')],[true,T('معكوس أفقيا','Flipped')]]}/>
     <Range label={T('عتامة الطبقة','Overlay')} min={0} max={0.5} step={0.05} value={h.overlay} on={v=>s('overlay',v)} fmt={n=>Math.round(n*200)+'%'}/>
    </div>
   </div>
  </Panel>
  <Panel title={T('النصوص','Text')}>
   <Bi label={T('النص العلوي','Kicker')} v={h.kicker} on={v=>s('kicker',v)}/><Bi label={T('العنوان','Title')} v={h.title} on={v=>s('title',v)}/><Bi label={T('العنوان الفرعي','Subtitle')} v={h.sub} on={v=>s('sub',v)}/>
   <Bi area label={T('الوصف','Description')} v={h.desc} on={v=>s('desc',v)}/>
   <div className="row"><Bi label={T('نص الزر','Button text')} v={h.cta} on={v=>s('cta',v)}/><Txt label={T('رابط الزر','Button link')} v={h.ctaLink} on={v=>s('ctaLink',v)}/></div>
  </Panel>
  <Save fn={()=>api.put('/settings',d)}/></>
}
