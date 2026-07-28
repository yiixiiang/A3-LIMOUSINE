"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Vehicle={id:number;name:string};
type Rate={vehicle_type_id:number;service_type:string;base_amount:number;currency:string;pricing_method:string};
type RatePayload={vehicle_types?:Vehicle[];rate_cards?:Rate[]};

const serviceMap:Record<string,string>={
  "Airport Arrival":"airport_arrival",
  "Airport Departure":"airport_departure",
  "Point-to-Point":"point_to_point",
  "Hourly Chauffeur":"hourly_disposal",
  "Singapore ↔ Johor":"sg_jb",
};

export default function BookPage(){
  const [rates,setRates]=useState<RatePayload>({});
  const [service,setService]=useState("");
  const [vehicleId,setVehicleId]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [startedAt]=useState(()=>Date.now());

  useEffect(()=>{fetch("/api/limousine",{cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||"Unable to load rates.");setRates(body)}).catch(()=>setRates({}))},[]);

  const selectedVehicle=useMemo(()=>rates.vehicle_types?.find(vehicle=>String(vehicle.id)===vehicleId),[rates,vehicleId]);
  const selectedRate=useMemo(()=>rates.rate_cards?.find(rate=>String(rate.vehicle_type_id)===vehicleId&&rate.service_type===serviceMap[service]),[rates,vehicleId,service]);
  const displayedRate=selectedRate?new Intl.NumberFormat("en-SG",{style:"currency",currency:selectedRate.currency||"SGD",maximumFractionDigits:0}).format(selectedRate.base_amount)+(selectedRate.pricing_method==="per_hour"?" / hour":""):"Rate confirmed by staff";

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const form=event.currentTarget;const data=new FormData(form);
    const payload=Object.fromEntries(data.entries());
    try{
      const response=await fetch("/api/limousine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,service,vehicle:selectedVehicle?.name||payload.vehicle,displayed_rate:displayedRate,started_at:startedAt,company:""})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Unable to submit booking.");
      setMessage(`Booking submitted successfully. Reference: ${result.reference}`);
      form.reset();setService("");setVehicleId("");
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to submit booking.")}
    finally{setBusy(false)}
  }

  return <main className="bookingPage">
    <header className="bookingHeader"><a className="logo" href="/"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a><a href="/">← Back to website</a></header>
    <section className="bookingHero"><div><p className="eyebrow">ONLINE BOOKING</p><h1>Reserve your limousine journey.</h1><p>Complete this page to create a pending booking directly in A3 Finance. Our team will confirm availability and the final amount.</p><div className="bookingFacts"><span>✓ Direct to Finance</span><span>✓ Booking reference</span><span>✓ Staff confirmation</span></div></div>
      <aside><small>LIVE SELECTION</small><strong>{selectedVehicle?.name||"Choose a vehicle"}</strong><span>{service||"Choose a service"}</span><b>{displayedRate}</b></aside>
    </section>
    <section className="bookingBody"><form className="publicForm premiumForm" onSubmit={submit}>
      <div className="formSection full"><span>01</span><div><h2>Journey details</h2><p>Tell us where and when you are travelling.</p></div></div>
      <label>Service<select name="service" required value={service} onChange={event=>setService(event.target.value)}><option value="" disabled>Select service</option>{Object.keys(serviceMap).map(item=><option key={item}>{item}</option>)}</select></label>
      <label>Vehicle<select name="vehicle_id" required value={vehicleId} onChange={event=>setVehicleId(event.target.value)}><option value="" disabled>Select vehicle</option>{(rates.vehicle_types||[]).map(vehicle=><option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}</select></label>
      <div className="selectedRate full"><span><small>DISPLAYED RATE</small><strong>{displayedRate}</strong></span><span><small>STATUS</small><strong>Pending confirmation</strong></span></div>
      <label>Pickup date<input type="date" name="date" required/></label><label>Pickup time<input type="time" name="time" required/></label>
      <label className="full">Pickup location<input name="pickup" required placeholder="Hotel, airport terminal or full address"/></label>
      <label className="full">Destination / itinerary<textarea name="destination" required placeholder="Destination, stops or full itinerary"/></label>
      <label>Passengers<input name="passengers" type="number" min="1" defaultValue="1" required/></label><label>Luggage<input name="luggage" type="number" min="0" defaultValue="0"/></label>
      <label>Flight number<input name="flight" placeholder="Optional"/></label><label>Airline<input name="airline" placeholder="Optional"/></label>
      <div className="formSection full"><span>02</span><div><h2>Contact details</h2><p>We will use these details to confirm your booking.</p></div></div>
      <label>Full name<input name="name" required/></label><label>Mobile / WhatsApp<input name="contact" required/></label>
      <label className="full">Email<input name="email" type="email" placeholder="Optional"/></label><label className="full">Remarks<textarea name="remarks" placeholder="Child seat, accessibility, special requests or other notes"/></label>
      <input className="hp" name="company" tabIndex={-1} autoComplete="off"/>
      <button className="gold full submitBooking" disabled={busy}>{busy?"Submitting…":"Submit Booking to A3 Finance"}</button>
      {message&&<p className="formMessage full">{message}</p>}
    </form></section>
  </main>
}
