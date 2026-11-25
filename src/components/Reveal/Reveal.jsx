import './Reveal.css'
import {useEffect,useRef,useState} from 'react'
// Scroll-reveal wrapper. v: up | zoom | start | end | fade
export default function Reveal({as:E='div',v='up',d=0,className='',children,...p}){
 const r=useRef(),[on,setOn]=useState(false)
 useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setOn(true);o.disconnect()}},{threshold:.12,rootMargin:'0px 0px -30px 0px'});o.observe(r.current);return()=>o.disconnect()},[])
 return <E ref={r} className={`rv rv-${v}${on?' in':''} ${className}`} style={{'--d':d+'ms'}} {...p}>{children}</E>}
