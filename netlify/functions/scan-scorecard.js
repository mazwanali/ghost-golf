exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'Method not allowed'})};
  const key=process.env.OPENAI_API_KEY;
  if(!key)return {statusCode:503,body:JSON.stringify({error:'OPENAI_API_KEY is not configured in Netlify environment variables.'})};
  try {
    if ((event.body||'').length>13000000) return {statusCode:413,body:JSON.stringify({error:'Image too large'})};
    const {image,mode}=JSON.parse(event.body||'{}');
    if(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image||''))return {statusCode:400,body:JSON.stringify({error:'Invalid image'})};
    const instruction=`Read this golf scorecard image. Return JSON only, with fields: course (string), tee (string), holes (array of exactly 9 or 18 objects {par: integer or null, si: integer or null}), players (array of {name:string,scores:array of exactly holes.length integers or null}). Preserve hole order. The requested mode is ${mode==='course'?'course preset: return players []':'completed card: read player names and handwritten gross strokes'}. Do not invent missing values; use null when uncertain. Ignore totals and handicap rows. Par and SI must be per hole. If there are multiple tee rows, use the visible selected tee, or the clearest one. If both front and back nine are shown, return 18 holes. No extra fields.`;
    const resp=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||'gpt-4.1-mini',temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:'You extract golf scorecards into structured JSON. Never guess illegible values.'},{role:'user',content:[{type:'text',text:instruction},{type:'image_url',image_url:{url:image,detail:'high'}}]}],max_tokens:4000})});
    const data=await resp.json();if(!resp.ok)throw Error(data.error?.message||'AI provider request failed');
    const parsed=JSON.parse(data.choices?.[0]?.message?.content||'{}');
    if(!Array.isArray(parsed.holes)||![9,18].includes(parsed.holes.length)||!Array.isArray(parsed.players))throw Error('Could not extract a complete 9- or 18-hole card. Try a clearer photo.');
    parsed.players=parsed.players.slice(0,12).map(p=>({name:String(p.name||'').slice(0,80),scores:Array.from({length:parsed.holes.length},(_,i)=>Number.isInteger(p.scores?.[i])?p.scores[i]:null)}));
    parsed.holes=parsed.holes.map(h=>({par:Number.isInteger(h.par)?h.par:null,si:Number.isInteger(h.si)?h.si:null}));
    return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({course:String(parsed.course||'').slice(0,120),tee:String(parsed.tee||'').slice(0,80),holes:parsed.holes,players:parsed.players})};
  }catch(e){return {statusCode:422,body:JSON.stringify({error:e.message||'Scan failed'})}}
};
