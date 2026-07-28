"use client";

import { FormEvent, useEffect, useState } from "react";

const FINANCE_URL=(process.env.NEXT_PUBLIC_A3_FINANCE_URL||"https://finance.a3group.sg").replace(/\/$/,"");
const GOOGLE_REVIEW="https://www.google.com/search?q=A3+Group+SG+Google+Reviews";
const services=["Airport Transfer","Hourly Chauffeur","Point-to-Point","Singapore ↔ Johor"];

type Rate={id:string;vehicle_name:string;transfer_price:number|null;hourly_price:number|null;minimum_hours:number|null;currency:string};

export default function BookingPage(){
 const [rates,setRates]=useState<Rate[]>([]);
 const [status,setStatus]=useState("");
 const [submitting,setSubmitting]=useState(false);
 useEffect(()=>{fetch(`${FINANCE_URL}/api/public/website-catalogue?site=limousine`,{cache:"no-store"}).then(r=>r.json()).then(payload=>{
  const grouped=new Map<string,Rate>();
  for(const item of Array.isArray(payload.items)?payload.items:[]){
   const name=String(item.title_en||item.service_name||item.price_key);
   const current=grouped.get(name)||{id:String(item.id),vehicle_name:name,transfer_price:null,hourly_price:null,minimum_hours:null,currency:String(item.currency||"SGD")};
   const kind=String(item.subgroup||item.category||"").toLowerCase();
   if(kind.includes("hour")) current.hourly_price=Number(item.price); else current.transfer_price=Number(item.price);
   grouped.set(name,current);
  }
  setRates([...grouped.values()]);
 }).catch(()=>setRates([]));},[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); setSubmitting(true); setStatus("");
  const f=new FormData(e.currentTarget);
  const body=Object.fromEntries(f.entries());
  try{
   const response=await fetch(`${FINANCE_URL}/api/public/limousine`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const result=await response.json();
   if(!response.ok||!result.ok) throw new Error(result.error||"Unable to submit booking.");
   setStatus(`Booking submitted successfully. Reference: ${result.reference}`);
   e.currentTarget.reset();
  }catch(error){setStatus(error instanceof Error?error.message:"Unable to submit booking.");}
  finally{setSubmitting(false);}
 }
 return <main className="bookingPage">
  <header>
   <a className="logo" href="/"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a>
   <nav><a href="/">Home</a><a href={FINANCE_URL} target="_blank">Rates</a><a href={GOOGLE_REVIEW} target="_blank">Google Review</a></nav>
  </header>
  <section className="bookingHero">
   <div><p className="eyebrow">RESERVE YOUR JOURNEY</p><h1>Private travel,<br/><em>arranged properly.</em></h1><p>Complete the form below. Your request will be sent directly to A3 Finance for confirmation.</p></div>
  </section>
  <section className="booking bookingStandalone">
   <div><p className="eyebrow darkText">BOOKING REQUEST</p><h2>Tell us where you are going.</h2><p>Submit your trip details and receive a booking reference immediately.</p><div className="links"><a href={FINANCE_URL} target="_blank">View current rates ↗</a><a href={GOOGLE_REVIEW} target="_blank">Google Review ★</a></div></div>
   <form onSubmit={submit}>
    <label className="full">Service<select name="service" required defaultValue=""><option value="" disabled>Select service</option>{services.map(s=><option key={s}>{s}</option>)}</select></label>
    <label className="full">Vehicle<select name="vehicle" required defaultValue=""><option value="" disabled>Select vehicle</option>{rates.map(r=><option key={r.id} value={r.vehicle_name}>{r.vehicle_name}</option>)}</select></label>
    <label>Date<input type="date" name="date" required/></label><label>Time<input type="time" name="time" required/></label>
    <label className="full">Pickup<input name="pickup" placeholder="Pickup address" required/></label>
    <label className="full">Destination / itinerary<textarea name="destination" placeholder="Destination or planned itinerary" required/></label>
    <label>Passengers<input type="number" name="passengers" defaultValue="1" min="1" required/></label><label>Luggage<input type="number" name="luggage" defaultValue="0" min="0"/></label>
    <label>Name<input name="name" required/></label><label>Contact<input name="contact" required/></label>
    <label className="full">Email (optional)<input type="email" name="email"/></label>
    <label className="full">Remarks<textarea name="remarks"/></label>
    <button className="gold full" type="submit" disabled={submitting}>{submitting?"Submitting…":"Submit Booking"}</button>
    {status&&<p className="bookingStatus full">{status}</p>}
   </form>
  </section>
  <footer><div className="logo"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></div><p>Airport Transfer • Hourly Chauffeur • Point-to-Point • Singapore ↔ Johor Bahru</p></footer>
 </main>
}
