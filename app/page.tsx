"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";

const CONTACTS={
 whatsapp:"6590000000",
 telegram:"A3GROUPSG_BOT",
 wechat:"A3GROUPSG",
 instagram:"https://instagram.com/a3groupsg",
 facebook:"https://facebook.com/a3groupsg",
 review:"https://www.google.com/search?q=A3+Group+SG+Google+Reviews",
 rates:"https://finance.a3group.sg"
};

const services=[
 ["Airport Transfer","Changi Airport pickup and drop-off with flight details and luggage assistance."],
 ["Hourly Chauffeur","A private driver and vehicle for business, dining, shopping or sightseeing."],
 ["Point-to-Point","Premium door-to-door transport for hotels, meetings, events and restaurants."],
 ["Singapore ↔ Johor","Private cross-border trips to Johor Bahru, Legoland, JPO and Desaru."]
];
const tours=[
 ["4 HOURS","City Highlights","Merlion · Marina Bay Sands · Gardens by the Bay · Chinatown"],
 ["6 HOURS","Singapore Discovery","Marina Bay · Little India · Kampong Glam · Local food"],
 ["8 HOURS","Best of Singapore","Jewel · Heritage districts · Orchard · Sentosa · Clarke Quay"]
];
type VehicleRate={
 id:string;
 vehicle_name:string;
 category:string;
 transfer_price:number|null;
 hourly_price:number|null;
 minimum_hours:number|null;
 currency:string;
 active:boolean;
 sort_order:number;
 updated_at:string;
};

const defaultRates:VehicleRate[]=[];

const vehicleDescriptions:Record<string,string>={
 "5-Seater Sedan":"Best for business travellers, couples and light luggage.",
 "7-Seater MPV":"A spacious choice for families, tours and airport transfers.",
 "Luxury MPV":"Premium comfort for executives, VIP guests and special occasions."
};

export default function Home(){
 const [open,setOpen]=useState(false);
 const [rates,setRates]=useState<VehicleRate[]>(defaultRates);
 const [vehicle,setVehicle]=useState("");
 const [rateStatus,setRateStatus]=useState("Loading live prices…");

 useEffect(()=>{
  let active=true;
  async function loadRates(){
   try{
    const finance=(process.env.NEXT_PUBLIC_A3_FINANCE_URL||"https://finance.a3group.sg").replace(/\/$/,"");
    const response=await fetch(`${finance}/api/public/website-catalogue?site=limousine`,{cache:"no-store"});
    if(!response.ok) throw new Error(`Catalogue API returned ${response.status}`);
    const payload=await response.json();
    const items=Array.isArray(payload.items)?payload.items:[];
    const grouped=new Map<string,VehicleRate>();
    for(const item of items){
      const name=String(item.title_en||item.service_name||item.price_key);
      const current=grouped.get(name)||{id:String(item.id),vehicle_name:name,category:String(item.category||"SERVICE"),transfer_price:null,hourly_price:null,minimum_hours:null,currency:String(item.currency||"SGD"),active:item.available!==false,sort_order:Number(item.display_order||0),updated_at:String(payload.updated_at||"")};
      const kind=String(item.subgroup||item.category||"").toLowerCase();
      if(kind.includes("hour")) current.hourly_price=Number(item.price); else current.transfer_price=Number(item.price);
      grouped.set(name,current);
    }
    const live=[...grouped.values()].filter(r=>r.active).sort((a,b)=>a.sort_order-b.sort_order);
    if(active){setRates(live);setVehicle(v=>live.some(r=>r.vehicle_name===v)?v:(live[0]?.vehicle_name||""));setRateStatus(live.length?"Live catalogue from A3 Finance":"Catalogue coming soon");}
   }catch(error){
    console.error("Unable to load vehicle rates:",error);
    if(active){setRates([]);setRateStatus("Catalogue temporarily unavailable");}
   }
  }
  loadRates();
  const timer=window.setInterval(loadRates,60000);
  return()=>{active=false;window.clearInterval(timer)};
 },[]);

 const money=(value:number|null,currency="SGD")=>
  value===null?"Contact us":new Intl.NumberFormat("en-SG",{
   style:"currency",currency,maximumFractionDigits:value%1===0?0:2
  }).format(value);

 const selectedRate=useMemo(
  ()=>rates.find(rate=>rate.vehicle_name===vehicle)??rates[0]??defaultRates[0],
  [rates,vehicle]
 );

 const vehiclePrice={
  transfer:!selectedRate||selectedRate.transfer_price===null
   ?"Contact us"
   :`${money(selectedRate!.transfer_price,selectedRate!.currency)} per trip`,
  hourly:!selectedRate||selectedRate.hourly_price===null
   ?"Custom quotation"
   :`${money(selectedRate!.hourly_price,selectedRate!.currency)} per hour${selectedRate!.minimum_hours?` · ${selectedRate!.minimum_hours}-hour minimum`:""}`
 };
 const copyWechat=async()=>{await navigator.clipboard.writeText(CONTACTS.wechat);alert(`WeChat ID copied: ${CONTACTS.wechat}`)};
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); const f=new FormData(e.currentTarget);
  const msg=`A3 GROUP SG — LIMOUSINE ENQUIRY

Service: ${f.get("service")}\nVehicle: ${f.get("vehicle")}\nDisplayed rate: ${vehiclePrice.transfer} / ${vehiclePrice.hourly}
Pickup: ${f.get("date")} ${f.get("time")}
From: ${f.get("pickup")}
To / itinerary: ${f.get("destination")}
Passengers: ${f.get("passengers")}
Luggage: ${f.get("luggage")}
Customer: ${f.get("name")}
Contact: ${f.get("contact")}
Remarks: ${f.get("remarks")||"None"}

Please confirm availability and quotation.`;
  window.open(`https://wa.me/${CONTACTS.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
 }
 return <main>
  <header>
   <a className="logo" href="#home"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a>
   <button className="menu" onClick={()=>setOpen(!open)}>☰</button>
   <nav className={open?"open":""}>
    <a href="#services">Services</a><a href="#tours">Journeys</a><a href="#fleet">Fleet</a>
    <a href={CONTACTS.rates} target="_blank">Rates</a><a href={CONTACTS.review} target="_blank">Google Review</a><a className="book" href="/book">Book Now</a>
   </nav>
  </header>

  <section className="hero" id="home">
   <div className="heroCopy">
    <p className="eyebrow">SINGAPORE • JOHOR BAHRU • PRIVATE CHAUFFEUR</p>
    <h1>Luxury travel,<em>personally driven.</em></h1>
    <p>Premium airport transfers, private city journeys and hourly chauffeur services for business, leisure and special occasions.</p>
    <div className="actions"><a className="gold" href="/book">Reserve Your Journey</a><a className="ghost" href={CONTACTS.rates} target="_blank">View Rates</a></div>
    <div className="social">
     <a href={`https://wa.me/${CONTACTS.whatsapp}`} target="_blank">WhatsApp</a>
     <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank">Telegram</a>
     <button onClick={copyWechat}>WeChat</button>
     <a href={CONTACTS.instagram} target="_blank">Instagram</a>
     <a href={CONTACTS.facebook} target="_blank">Facebook</a>
    </div>
   </div>
   <aside><small>QUICK ACCESS</small><h2>Where may we take you?</h2>
    <a href="/book"><b>01</b><span>Start a booking</span>→</a>
    <a href={CONTACTS.rates} target="_blank"><b>02</b><span>View online rates</span>↗</a>
    <a href={CONTACTS.review} target="_blank"><b>03</b><span>Leave a review</span>★</a>
   </aside>
  </section>

  <div className="strip"><span>PROFESSIONAL CHAUFFEURS</span><span>PREMIUM VEHICLES</span><span>FLEXIBLE ITINERARIES</span><span>DIRECT BOOKING</span></div>

  <section className="section" id="services"><div className="title"><p>OUR SIGNATURE SERVICES</p><h2>Designed around your journey.</h2></div>
   <div className="grid four">{services.map((s,i)=><article key={s[0]}><i>0{i+1}</i><h3>{s[0]}</h3><p>{s[1]}</p><a href={CONTACTS.rates} target="_blank">View rates ↗</a></article>)}</div>
  </section>

  <section className="darkSection" id="tours"><div className="title light"><p>CURATED SINGAPORE JOURNEYS</p><h2>See more. Travel better.</h2></div>
   <div className="grid three">{tours.map((t,i)=><article className={i===1?"featured":""} key={t[1]}><small>{t[0]}</small><h3>{t[1]}</h3><p>{t[2]}</p><div><a href="/book">Book journey</a><a href={CONTACTS.rates} target="_blank">Rates ↗</a></div></article>)}</div>
  </section>

  <section className="pricing">
  <div className="title"><p>VEHICLE RATES</p><h2>Clear pricing by vehicle.</h2><span>Rates shown in SGD. Additional stops, waiting time, parking, tolls and special requests may incur extra charges.</span><small className="liveStatus">● {rateStatus}</small></div>
  <div className="priceTable">
   <div className="priceHead"><span>Vehicle</span><span>Transfer</span><span>Hourly Charter</span><span>Minimum</span></div>
   {rates.map(rate=><div key={rate.id}><strong>{rate.vehicle_name}</strong><span>{rate.transfer_price===null?"Contact us":`${money(rate.transfer_price,rate.currency)} per trip`}</span><span>{rate.hourly_price===null?"Custom quotation":`${money(rate.hourly_price,rate.currency)} per hour`}</span><span>{rate.minimum_hours?`${rate.minimum_hours} hours`:"Subject to availability"}</span></div>)}
  </div>
  <a className="financeLink" href={CONTACTS.rates} target="_blank">Manage and view full rates at finance.a3group.sg ↗</a>
 </section>

  <section className="section cream" id="fleet"><div className="title"><p>THE A3 FLEET</p><h2>Premium comfort for every group.</h2></div>
   <div className="grid three fleet">{rates.map(rate=><article key={rate.id}><div className="vehicle">◆<small>{rate.category}</small></div><h3>{rate.vehicle_name}</h3><p>{vehicleDescriptions[rate.vehicle_name]??"Premium chauffeur vehicle."}</p><div className="priceBox"><span><small>TRANSFER</small><strong>{rate.transfer_price===null?"Contact us":money(rate.transfer_price,rate.currency)}</strong></span><span><small>HOURLY</small><strong>{rate.hourly_price===null?"Contact us":`${money(rate.hourly_price,rate.currency)}/hour`}</strong></span></div><p className="minimum">{rate.minimum_hours?`${rate.minimum_hours}-hour minimum`:"Subject to availability"}</p><a href="/book">Book this vehicle →</a></article>)}</div>
  </section>

  <footer><div className="logo"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></div><p>Airport Transfer • Hourly Chauffeur • Point-to-Point • Singapore ↔ Johor Bahru</p><div className="footlinks"><a href={CONTACTS.instagram}>Instagram</a><a href={CONTACTS.facebook}>Facebook</a><a href={CONTACTS.review} target="_blank">Google Review</a></div></footer>
 </main>
}