import {NextResponse} from "next/server";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"Extraction is not configured. You can add entries manually."},{status:503});
  const form=await request.formData(),file=form.get("image");
  if(!(file instanceof File)||!/^image\/(png|jpeg)$/.test(file.type))return NextResponse.json({error:"Please upload an image file (PNG, JPG)."},{status:400});
  if(file.size>10*1024*1024)return NextResponse.json({error:"Image must be smaller than 10 MB."},{status:400});
  const data=Buffer.from(await file.arrayBuffer()).toString("base64");
  const prompt=`Extract every student row from this handwritten class report. Return JSON only with {"date":"YYYY-MM-DD","entries":[{"student_name":"","attendance":"present|absent|late","marks":0,"remarks":"","confidence":0.0}]}. Use ${form.get("date")} if no date is visible. Never omit a visible student.`;
  const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||"gpt-4o-mini",response_format:{type:"json_object"},messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:`data:${file.type};base64,${data}`}}]}],temperature:0})});
  if(!response.ok)throw new Error("Vision service failed");const out=await response.json(),parsed=JSON.parse(out.choices?.[0]?.message?.content||"{}");return NextResponse.json({date:parsed.date||form.get("date"),entries:Array.isArray(parsed.entries)?parsed.entries:[]});
 }catch{return NextResponse.json({error:"Extraction failed. You can add entries manually."},{status:502})}
}
