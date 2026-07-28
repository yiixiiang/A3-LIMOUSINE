"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = { id:number; name:string; passenger_capacity:number|null; luggage_capacity?:number|null; description?:string; image_url?:string };
type RateCard = { id:number; vehicle_type_id:number; name:string; service_type:string; pricing_method:string; base_amount:number; currency:string; minimum_hours:number|null; vehicle:Vehicle };
type AdditionalCharge={id:string;code:string;name:string;charge_type:string;amount:number;currency:string;description:string};
type RatePayload = { source?:string; updated_at?:string|null; currency?:string; vehicle_types?:Vehicle[]; rate_cards?:RateCard[]; additional_charges?:AdditionalCharge[] };

const GOOGLE_REVIEW_URL = "https://www.google.com/search?q=A3+Group+SG+Google+Reviews";
const FINANCE_URL = "https://finance.a3group.sg";
const WHATSAPP = "6584849004";

const services = [
  ["Airport Transfer", "Changi Airport pickup and drop-off with professional luggage assistance."],
  ["Hourly Chauffeur", "A private driver and vehicle for business, dining, shopping, events or sightseeing."],
  ["Point-to-Point", "Premium door-to-door transport for hotels, meetings, restaurants and special occasions."],
  ["Singapore ↔ Johor", "Private cross-border journeys to Johor Bahru, Legoland, JPO and Desaru."],
];

const serviceLabels:Record<string,string> = {
  airport_arrival:"Airport Arrival",
  airport_departure:"Airport Departure",
  point_to_point:"Point to Point",
  hourly_disposal:"Hourly Disposal",
  sg_jb:"Singapore to Johor",
};

export default function Home(){
  const [open,setOpen]=useState(false);
  const [payload,setPayload]=useState<RatePayload>({});
  const [rateError,setRateError]=useState("");

  useEffect(()=>{
    let alive=true;
    async function load(){
      try{
        const response=await fetch("/api/limousine",{cache:"no-store"});
        const body=await response.json();
        if(!response.ok) throw new Error(body.error||"Rates are unavailable.");
        if(alive){setPayload(body);setRateError("");}
      }catch(error){
        if(alive)setRateError(error instanceof Error?error.message:"Rates are unavailable.");
      }
    }
    load();
    const timer=window.setInterval(load,60000);
    return()=>{alive=false;window.clearInterval(timer)};
  },[]);

  const visibleRates=useMemo(()=>(payload.rate_cards||[]).filter(rate=>[
    "airport_arrival","airport_departure","point_to_point","hourly_disposal","sg_jb"
  ].includes(rate.service_type)),[payload]);

  const vehicles=payload.vehicle_types||[];
  const money=(amount:number,currency="SGD")=>new Intl.NumberFormat("en-SG",{style:"currency",currency,maximumFractionDigits:0}).format(amount);

  return <main>
    <header>
      <a className="logo" href="#home"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a>
      <button className="menu" aria-label="Open menu" onClick={()=>setOpen(!open)}>☰</button>
      <nav className={open?"open":""}>
        <a href="#services">Services</a><a href="#rates">Rates</a><a href="#fleet">Fleet</a>
        <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Google Review</a>
        <a className="book" href="/book">Book Now</a>
      </nav>
    </header>

    <section className="hero" id="home">
      <div className="heroCopy">
        <p className="eyebrow">SINGAPORE • JOHOR BAHRU • PRIVATE CHAUFFEUR</p>
        <h1>Luxury travel,<em>personally driven.</em></h1>
        <p>Premium airport transfers, city journeys and hourly chauffeur services for business, leisure and special occasions.</p>
        <div className="actions"><a className="gold" href="/book">Reserve Your Journey</a><a className="ghost" href="#rates">View Live Rates</a></div>
      </div>
      <aside><small>QUICK ACCESS</small><h2>Where may we take you?</h2>
        <a href="/book"><b>01</b><span>Start a booking</span>→</a>
        <a href="#rates"><b>02</b><span>View live rates</span>↓</a>
        <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer"><b>03</b><span>Google Review</span>↗</a>
      </aside>
    </section>

    <div className="strip"><span>PROFESSIONAL CHAUFFEURS</span><span>PREMIUM VEHICLES</span><span>LIVE FINANCE RATES</span><span>DIRECT ONLINE BOOKING</span></div>

    <section className="section" id="services"><div className="title"><p>OUR SIGNATURE SERVICES</p><h2>Designed around your journey.</h2></div>
      <div className="grid four">{services.map((service,index)=><article key={service[0]}><i>0{index+1}</i><h3>{service[0]}</h3><p>{service[1]}</p><a href="/book">Book now →</a></article>)}</div>
    </section>

    <section className="pricing" id="rates">
      <div className="title"><p>LIVE VEHICLE RATES</p><h2>Rates managed by A3 Finance.</h2><span>Published rate changes in Finance appear here automatically. Extra stops, waiting, parking, tolls and special requests may incur additional charges.</span><small className={rateError?"liveStatus error":"liveStatus"}>● {rateError||`Connected to ${payload.source||"A3 Finance"}`}</small></div>
      {visibleRates.length ? <div className="rateMatrixWrap"><table className="rateMatrix"><thead><tr><th>Service</th>{vehicles.map(vehicle=><th key={vehicle.id}>{vehicle.name}</th>)}</tr></thead><tbody>{Array.from(new Set(visibleRates.map(rate=>rate.service_type))).map(service=><tr key={service}><th>{serviceLabels[service]||service.replaceAll("_"," ")}</th>{vehicles.map(vehicle=>{const rate=visibleRates.find(item=>item.service_type===service&&item.vehicle_type_id===vehicle.id);return <td key={vehicle.id}>{rate?money(rate.base_amount,rate.currency):"—"}{rate?.pricing_method==="per_hour"?<small>/hour</small>:null}</td>})}</tr>)}</tbody></table></div> : <div className="rateEmpty">No published rates are available yet. Publish rates in Finance Rate Management, then refresh this page.</div>}
      {(payload.additional_charges||[]).length>0&&<div className="additionalCharges"><h3>Additional charges</h3><div className="chargeGrid">{(payload.additional_charges||[]).map(charge=><article key={charge.id}><strong>{charge.name}</strong><b>{charge.charge_type==="actual_cost"?"Actual cost":money(charge.amount,charge.currency)}{charge.charge_type==="per_hour"?<small>/hour</small>:charge.charge_type==="per_stop"?<small>/stop</small>:charge.charge_type==="per_seat"?<small>/seat</small>:null}</b><p>{charge.description}</p></article>)}</div></div>}
      <div className="rateActions"><a className="gold" href="/book">Book with these rates</a><a className="financeLink" href={FINANCE_URL} target="_blank" rel="noreferrer">Open finance.a3group.sg ↗</a></div>
    </section>

    <section className="section cream" id="fleet"><div className="title"><p>THE A3 FLEET</p><h2>Premium comfort for every group.</h2></div>
      <div className="grid three fleet">{vehicles.map(vehicle=><article key={vehicle.id}>{vehicle.image_url?<img className="vehiclePhoto" src={vehicle.image_url} alt={vehicle.name}/>:<div className="vehicle">◆<small>CHAUFFEUR VEHICLE</small></div>}<h3>{vehicle.name}</h3><p>{vehicle.description||`${vehicle.passenger_capacity?`Up to ${vehicle.passenger_capacity} passengers`:"Premium private transport"}${vehicle.luggage_capacity?` · ${vehicle.luggage_capacity} luggage`:""}.`}</p><a href={`/book?vehicle=${vehicle.id}`}>Book this vehicle →</a></article>)}</div>
    </section>

    <section className="reviews"><div><p className="eyebrow">GOOGLE REVIEWS</p><h2>Your experience matters.</h2><p>Reviews are handled directly on Google. This website does not collect or publish customer reviews.</p><div className="stars">★★★★★</div><a className="gold" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Open Google Reviews</a></div>
      <div className="reviewNotice"><strong>No website review form</strong><p>Customers are taken directly to Google to read or leave a review.</p></div>
    </section>

    <section className="bookingCta"><p className="eyebrow">RESERVE YOUR JOURNEY</p><h2>Send your booking directly to A3 Finance.</h2><p>The online form creates a pending booking for staff confirmation and returns a booking reference.</p><div className="actions"><a className="gold" href="/book">Open Booking Page</a><a className="ghost darkGhost" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a></div></section>

    <footer><div className="logo"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></div><p>Airport Transfer • Hourly Chauffeur • Point-to-Point • Singapore ↔ Johor Bahru</p><div className="footlinks"><a href="/book">Book Now</a><a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Google Review</a></div></footer>
  </main>
}
