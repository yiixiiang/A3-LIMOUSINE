"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Vehicle={id:number;name:string;passenger_capacity?:number|null;luggage_capacity?:number|null;max_passengers?:number|null;max_luggage?:number|null;passengers?:number|null;luggage?:number|null;passengerCapacity?:number|null;luggageCapacity?:number|null;image_url?:string};
type Rate={vehicle_type_id:number;service_type:string;base_amount:number;currency:string;pricing_method:string};
type AdditionalCharge={id:string;name:string;charge_type:string;amount:number;currency:string;description:string;is_percentage?:boolean};
type RatePayload={vehicle_types?:Vehicle[];rate_cards?:Rate[];additional_charges?:AdditionalCharge[]};

const WHATSAPP="6584849004";
const capacityFallbacks:Record<string,{passengers:number;luggage:number}>={
  "4 Seater Sedan":{passengers:4,luggage:2},"6 Seater MPV":{passengers:6,luggage:4},"7 Seater Maxi Cab":{passengers:7,luggage:5},"Alphard / Vellfire":{passengers:6,luggage:4},"13 Seater Minibus":{passengers:13,luggage:10},"23 Seater Mini Coach":{passengers:23,luggage:18},"45 Seater Coach":{passengers:45,luggage:35}
};


function vehicleCapacity(vehicle?:Vehicle){
  if(!vehicle)return {passengers:0,luggage:0};
  const fallback=capacityFallbacks[vehicle.name]||{passengers:Number(vehicle.name.match(/\d+/)?.[0]||0),luggage:0};
  return {
    passengers:(vehicle.passenger_capacity ?? vehicle.passengerCapacity ?? vehicle.max_passengers ?? vehicle.passengers) == null ? fallback.passengers : Number(vehicle.passenger_capacity ?? vehicle.passengerCapacity ?? vehicle.max_passengers ?? vehicle.passengers),
    luggage:(vehicle.luggage_capacity ?? vehicle.luggageCapacity ?? vehicle.max_luggage ?? vehicle.luggage) == null ? fallback.luggage : Number(vehicle.luggage_capacity ?? vehicle.luggageCapacity ?? vehicle.max_luggage ?? vehicle.luggage),
  };
}

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
  const [termsAccepted,setTermsAccepted]=useState(false);

  useEffect(()=>{fetch("/api/limousine",{cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||"Unable to load rates.");setRates(body)}).catch(()=>setRates({}))},[]);

  const selectedVehicle=useMemo(()=>rates.vehicle_types?.find(vehicle=>String(vehicle.id)===vehicleId),[rates,vehicleId]);
  const selectedRate=useMemo(()=>rates.rate_cards?.find(rate=>String(rate.vehicle_type_id)===vehicleId&&rate.service_type===serviceMap[service]),[rates,vehicleId,service]);
  const displayedRate=selectedRate?new Intl.NumberFormat("en-SG",{style:"currency",currency:selectedRate.currency||"SGD",maximumFractionDigits:0}).format(selectedRate.base_amount)+(selectedRate.pricing_method==="per_hour"?" / hour":""):"Rate confirmed by staff";

  function openWhatsApp(form:HTMLFormElement){
    const data=new FormData(form);
    const value=(key:string)=>String(data.get(key)||"").trim()||"—";
    const details=[
      "A3 Limousine Booking Request",
      `Name: ${value("name")}`,
      `Mobile: ${value("contact")}`,
      `Email: ${value("email")}`,
      `Service: ${service||"—"}`,
      `Vehicle: ${selectedVehicle?.name||value("vehicle")}`,
      `Displayed rate: ${displayedRate}`,
      `Pickup date: ${value("date")}`,
      `Pickup time: ${value("time")}`,
      `Pickup: ${value("pickup")}`,
      `Destination / itinerary: ${value("destination")}`,
      `Passengers: ${value("passengers")}`,
      `Luggage: ${value("luggage")}`,
      `Flight: ${value("flight")}`,
      `Airline: ${value("airline")}`,
      `Remarks: ${value("remarks")}`,
      `Terms accepted: ${termsAccepted?"Yes":"No"}`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(details)}`,"_blank","noopener,noreferrer");
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const form=event.currentTarget;const data=new FormData(form);
    const payload=Object.fromEntries(data.entries());
    try{
      const response=await fetch("/api/limousine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,service,vehicle:selectedVehicle?.name||payload.vehicle,displayed_rate:displayedRate,passengerCount:Number(payload.passengers||0),luggageCount:Number(payload.luggage||0),flightNumber:String(payload.flight||""),pickupAddress:String(payload.pickup||""),destinationAddress:String(payload.destination||""),termsAccepted:true,termsVersion:"2026-07-29",termsAcceptedAt:new Date().toISOString(),started_at:startedAt,company:""})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Unable to submit booking.");
      setMessage(`Booking submitted successfully. Reference: ${result.reference}`);
      form.reset();setService("");setVehicleId("");setTermsAccepted(false);
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to submit booking.")}
    finally{setBusy(false)}
  }

  return <main className="bookingPage">
    <header className="bookingHeader"><a className="logo" href="/"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a><a href="/">← Back to website</a></header>
    <section className="bookingHero"><div><p className="eyebrow">ONLINE BOOKING</p><h1>Reserve your limousine journey.</h1><p>Complete this page to create a pending booking for our team. Our team will confirm availability and the final amount.</p><div className="bookingFacts"><span>✓ Direct booking</span><span>✓ Booking reference</span><span>✓ Staff confirmation</span></div></div>
      <aside><small>LIVE SELECTION</small><strong>{selectedVehicle?.name||"Choose a vehicle"}</strong><span>{service||"Choose a service"}</span><b>{displayedRate}</b></aside>
    </section>
    <section className="bookingBody"><form className="publicForm premiumForm" onSubmit={submit}>
      <div className="formSection full"><span>01</span><div><h2>Journey details</h2><p>Tell us where and when you are travelling.</p></div></div>
      <label>Service<select name="service" required value={service} onChange={event=>setService(event.target.value)}><option value="" disabled>Select service</option>{Object.keys(serviceMap).map(item=><option key={item}>{item}</option>)}</select></label>
      <label>Vehicle<select name="vehicle_id" required value={vehicleId} onChange={event=>setVehicleId(event.target.value)}><option value="" disabled>Select vehicle</option>{(rates.vehicle_types||[]).map(vehicle=>{const limits=vehicleCapacity(vehicle);return <option key={vehicle.id} value={vehicle.id}>{vehicle.name} — {limits.passengers} pax / {limits.luggage} luggage</option>})}</select></label>
      <div className="selectedRate full"><span><small>DISPLAYED RATE</small><strong>{displayedRate}</strong></span><span><small>STATUS</small><strong>Pending confirmation</strong></span></div>
      {selectedVehicle&&<div className="full bookingVehiclePreview">{selectedVehicle.image_url?<img src={selectedVehicle.image_url} alt={selectedVehicle.name}/>:<div className="vehiclePreviewPlaceholder">◆</div>}<div><strong>{selectedVehicle.name}</strong><span>{vehicleCapacity(selectedVehicle).passengers} passengers · {vehicleCapacity(selectedVehicle).luggage} luggage</span></div></div>}
      {(rates.additional_charges||[]).length>0&&<div className="full bookingCharges"><h3>Possible additional charges</h3>{(rates.additional_charges||[]).map(charge=><div key={charge.id}><span><strong>{charge.name}</strong><small>{charge.description}</small></span><b>{charge.charge_type==="actual_cost"?"Actual cost":charge.charge_type==="percentage"||charge.is_percentage?`${charge.amount}%`:new Intl.NumberFormat("en-SG",{style:"currency",currency:charge.currency||"SGD",maximumFractionDigits:0}).format(charge.amount)}{charge.charge_type==="per_hour"?" / hour":charge.charge_type==="per_stop"?" / stop":charge.charge_type==="per_seat"?" / seat":""}</b></div>)}</div>}
      <label>Pickup date<input type="date" name="date" required/></label><label>Pickup time<input type="time" name="time" required/></label>
      <label className="full">Pickup location<input name="pickup" required placeholder="Hotel, airport terminal or full address"/></label>
      <label className="full">Destination / itinerary<textarea name="destination" required placeholder="Destination, stops or full itinerary"/></label>
      <label>Number of passengers<input name="passengers" type="number" min="1" defaultValue="1" required/><small>Include adults and children.</small></label><label>Number of luggage items<input name="luggage" type="number" min="0" defaultValue="0" required/><small>Include suitcases and large bags.</small></label>
      <label>Flight number<input name="flight" placeholder="Optional"/></label><label>Airline<input name="airline" placeholder="Optional"/></label>
      <div className="formSection full"><span>02</span><div><h2>Contact details</h2><p>We will use these details to confirm your booking.</p></div></div>
      <label>Full name<input name="name" required/></label><label>Mobile / WhatsApp<input name="contact" required/></label>
      <label className="full">Email<input name="email" type="email" placeholder="Optional"/></label><label className="full">Remarks<textarea name="remarks" placeholder="Child seat, accessibility, special requests or other notes"/></label>
      <label className="full termsConsent"><input type="checkbox" name="termsAccepted" checked={termsAccepted} onChange={event=>setTermsAccepted(event.target.checked)} required/><span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms & Conditions</a> and acknowledge the booking, cancellation, waiting-time, luggage and cross-border policies.</span></label>
      <input className="hp" name="company" tabIndex={-1} autoComplete="off"/>
      <div className="full bookingSubmitActions"><button className="gold submitBooking" disabled={busy||!termsAccepted}>{busy?"Submitting…":"Submit Booking"}</button><button type="button" className="ghost darkGhost" onClick={event=>openWhatsApp(event.currentTarget.form!)}>Send full details by WhatsApp</button></div>
      {message&&<p className="formMessage full">{message}</p>}
    </form></section>
  </main>
}
