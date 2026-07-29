import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){try{const finance=(process.env.NEXT_PUBLIC_A3_FINANCE_URL||"https://finance.a3group.sg").replace(/\/$/,"");const response=await fetch(`${finance}/api/public/limousine/terms`,{cache:"no-store"});const body=await response.json();return NextResponse.json(body,{status:response.status,headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({ok:false,error:"Terms are temporarily unavailable."},{status:502})}}
