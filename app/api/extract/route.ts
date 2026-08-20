import {createHash} from "crypto";
import {NextResponse} from "next/server";
export const runtime="nodejs";

export async function POST(request:Request){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"Extraction is not configured. You can add a session manually."},{status:503});
  const form=await request.formData(),file=form.get("image");
  if(!(file instanceof File)||!/^image\/(png|jpeg)$/.test(file.type))return NextResponse.json({error:"Please upload an image file (PNG, JPG)."},{status:400});
  if(file.size>10*1024*1024)return NextResponse.json({error:"Image must be smaller than 10 MB."},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer()),data=bytes.toString("base64");
  const prompt=`Read this reusable class report sheet as a matrix. Correct for rotation. Extract printed sheet metadata, the complete roster in row order, EVERY visible date group, each date's exact assessment metric headers, and every student cell under that date. Normalize P/PRESENT to present, A/ABSENT to absent, and L/LATE to late. A blank or illegible attendance is unknown. Preserve metric cell text exactly; blank cells must be empty strings, never zero. Include low confidence for overwritten, crossed-out, or ambiguous cells. Dates must be YYYY-MM-DD; infer the year only when unambiguous. Return JSON only in this shape: {"sheet":{"school_name":null,"class_name":null,"day_time":null,"lead_coach":null,"teacher":null,"assistant":null,"theme":null,"focus_training":null,"rules":null,"around_world":null,"notes":null},"students":["name"],"sessions":[{"date":"YYYY-MM-DD","metrics":["metric"],"records":[{"student_name":"name","attendance":"present|absent|late|unknown","values":{"metric":"raw cell text"},"confidence":0.0}]}]}.`;
  const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||"gpt-4o-mini",messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:`data:${file.type};base64,${data}`}}]}],response_format:{type:"json_object"},temperature:0})});
  if(!response.ok){const detail=await response.text();console.error("Vision error",response.status,detail.slice(0,300));throw new Error("Vision service failed")}
  const out=await response.json(),parsed=JSON.parse(out.choices?.[0]?.message?.content||"{}");
  const fingerprint=createHash("sha256").update(JSON.stringify({class:parsed.sheet?.class_name||"",students:parsed.students||[]})).digest("hex").slice(0,32);
  return NextResponse.json({...parsed,sheet:{...parsed.sheet,fingerprint}});
 }catch(error){console.error(error);return NextResponse.json({error:"Extraction failed. You can add a session manually."},{status:502})}
}
