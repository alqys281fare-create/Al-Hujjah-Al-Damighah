const req=async(m,p,b)=>{const r=await fetch('/api'+p,{method:m,headers:{'Content-Type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)})
 if(!r.ok)throw new Error('API '+r.status);return r.status===204?null:r.json()}
export const api={get:p=>req('GET',p),put:(p,b)=>req('PUT',p,b),post:(p,b)=>req('POST',p,b),patch:(p,b)=>req('PATCH',p,b),del:p=>req('DELETE',p)}
// Saves a whole array to a json-server collection (creates, updates, deletes; array order -> "order")
export async function syncCollection(name,next,prev){
 const keep=new Set(next.map(x=>x.id))
 for(const x of prev)if(!keep.has(x.id))await api.del(`/${name}/${x.id}`)
 for(const [i,x] of next.entries()){const o={...x,order:i};prev.some(p=>p.id===x.id)?await api.put(`/${name}/${x.id}`,o):await api.post(`/${name}`,o)}
}
