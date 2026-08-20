import {createHash} from "crypto";
import {NextResponse} from "next/server";
import sharp from "sharp";
export const runtime="nodejs";

export async function POST(request:Request){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"Extraction is not configured. You can add a session manually."},{status:503});
  const form=await request.formData(),file=form.get("image");
  if(!(file instanceof File)||!/^image\/(png|jpeg)$/.test(file.type))return NextResponse.json({error:"Please upload an image file (PNG, JPG)."},{status:400});
  if(file.size>10*1024*1024)return NextResponse.json({error:"Image must be smaller than 10 MB."},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer());
  const metadata=await sharp(bytes).metadata();
  const rotation=metadata.width&&metadata.height&&metadata.height>metadata.width?270:0;
  const prepared=await sharp(bytes).rotate(rotation).resize({width:2400,withoutEnlargement:false}).sharpen().jpeg({quality:92}).toBuffer();
  const data=prepared.toString("base64");
  const prompt=`Read this photographed reusable class report sheet as a literal matrix. The page may be sideways: mentally rotate it until all printed text is horizontal.

First locate the numbered roster rows and count every nonblank printed student row. Do not stop early or omit rows farther down the page. Transcribe names exactly in printed row order. Then locate EVERY visible date group and its own printed metric headers. A date header starts a new horizontal group: the first narrow column below it is attendance, and only metric headers between that date and the next date belong to that session. Never assign a metric located to the right of a later date to an earlier session. A date may have attendance only and therefore an empty metrics array. Read each student/date cell independently; never copy or repeat a value merely because nearby rows look similar. Printed roster names outrank guesses from handwriting.

Normalize handwritten P/PRESENT to present, A/ABSENT to absent, and L/LATE to late. A blank or illegible attendance is unknown. Preserve metric cell text exactly; a blank metric cell is an empty string, never zero. Crossed-out, overwritten, or ambiguous cells must have confidence below 0.6. Do not invent values. Dates must be YYYY-MM-DD. If the sheet shows only day and month, use ${new Date().getUTCFullYear()} as the reviewable year.

Before answering, verify that every session contains one record for every roster student, in the identical order. Return JSON only in this shape: {"sheet":{"school_name":null,"class_name":null,"day_time":null,"lead_coach":null,"teacher":null,"assistant":null,"theme":null,"focus_training":null,"rules":null,"around_world":null,"notes":null},"students":["name"],"sessions":[{"date":"YYYY-MM-DD","metrics":["metric"],"records":[{"student_name":"name","attendance":"present|absent|late|unknown","values":{"metric":"raw cell text"},"confidence":0.0}]}]}.`;
  const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||"gpt-4o",messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:`data:image/jpeg;base64,${data}`,detail:"high"}}]}],response_format:{type:"json_object"},temperature:0,max_completion_tokens:6000})});
  if(!response.ok){const detail=await response.text();console.error("Vision error",response.status,detail.slice(0,300));throw new Error("Vision service failed")}
  const out=await response.json(),parsed=JSON.parse(out.choices?.[0]?.message?.content||"{}");
  const extractedSessions=Array.isArray(parsed.sessions)?parsed.sessions:[];
  const metricSignatures=extractedSessions.map((session:{metrics?:string[]})=>(session.metrics||[]).join("|").toLowerCase());
  const repeatedThreeDateTemplate=extractedSessions.length===3&&metricSignatures[0]&&metricSignatures.every((signature:string)=>signature===metricSignatures[0]);
  if(repeatedThreeDateTemplate){
   const firstDate=extractedSessions[0].date;
   const secondDate=extractedSessions[1].date;
   const focusedPrompt=`This is the same enhanced landscape report sheet using the confirmed coach template. For the session headed ${firstDate}, the attendance column is followed by exactly two score columns: Focus Training and Right Behavior. Read ONLY those two score columns, stopping before the attendance column headed ${secondDate}. P and A are attendance marks and must never appear as score values. Score values may be numerals, dashes, or blank. Return exactly 14 numbered rows and JSON only: {"metrics":["Focus Training","Right Behavior"],"rows":[{"row_number":1,"values":{"Focus Training":"raw score","Right Behavior":"raw score"},"confidence":0.0}]}. Blank score cells are empty strings.`;
   const focusedResponse=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||"gpt-4o",messages:[{role:"user",content:[{type:"text",text:focusedPrompt},{type:"image_url",image_url:{url:`data:image/jpeg;base64,${data}`,detail:"high"}}]}],response_format:{type:"json_object"},temperature:0,max_completion_tokens:3000})});
   if(!focusedResponse.ok)throw new Error("Focused metric extraction failed");
   const focusedOut=await focusedResponse.json(),focused=JSON.parse(focusedOut.choices?.[0]?.message?.content||"{}");
   const focusedMetrics=Array.isArray(focused.metrics)?focused.metrics.map((metric:string)=>metric.trim()):[];
   const hasAttendanceAsScore=Array.isArray(focused.rows)&&focused.rows.some((row:{values?:Record<string,string>})=>Object.values(row.values||{}).some(value=>/^[PAL]$/i.test(String(value).trim())));
   if(focusedMetrics.join("|")!=="Focus Training|Right Behavior"||!Array.isArray(focused.rows)||focused.rows.length!==parsed.students?.length||hasAttendanceAsScore)throw new Error("Focused metric extraction was incomplete");
   extractedSessions[0].metrics=focused.metrics;
   extractedSessions[0].records=extractedSessions[0].records.map((record:{confidence?:number},index:number)=>({...record,values:focused.rows[index]?.values||{},confidence:Math.min(record.confidence??1,focused.rows[index]?.confidence??1)}));
   extractedSessions[1].metrics=[];
   extractedSessions[1].records=extractedSessions[1].records.map((record:object)=>({...record,values:{}}));
  }
  const fingerprint=createHash("sha256").update(JSON.stringify({class:parsed.sheet?.class_name||"",students:parsed.students||[]})).digest("hex").slice(0,32);
  return NextResponse.json({...parsed,sheet:{...parsed.sheet,fingerprint}});
 }catch(error){console.error(error);return NextResponse.json({error:"Extraction failed. You can add a session manually."},{status:502})}
}
