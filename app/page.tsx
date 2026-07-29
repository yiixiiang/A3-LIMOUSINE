"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = { id:number; name:string; passenger_capacity?:number|null; luggage_capacity?:number|null; max_passengers?:number|null; max_luggage?:number|null; passengers?:number|null; luggage?:number|null; passengerCapacity?:number|null; luggageCapacity?:number|null; description?:string; image_url?:string };
type RateCard = { id:number; vehicle_type_id:number; name:string; service_type:string; pricing_method:string; base_amount:number; currency:string; minimum_hours:number|null; vehicle:Vehicle };
type AdditionalCharge={id:string;code:string;name:string;charge_type:string;amount:number;currency:string;description:string;is_percentage?:boolean};
type RatePayload = { source?:string; updated_at?:string|null; currency?:string; vehicle_types?:Vehicle[]; rate_cards?:RateCard[]; additional_charges?:AdditionalCharge[] };

const GOOGLE_REVIEW_URL = "https://www.google.com/search?q=A3+Group+SG+Google+Reviews";
const WHATSAPP = "6584849004";
type Lang="en"|"zh"|"ms"|"ta";
const ui:Record<Lang,Record<string,string>>={
 en:{services:"Services",rates:"Rates",fleet:"Fleet",review:"Google Review",book:"Book Now",live:"Live pricing",updated:"Updated",liveRates:"Live Vehicle Rates",ratesTitle:"Live limousine rates.",charges:"Additional charges",bookRates:"Book with these rates",fleetTitle:"Premium comfort for every group.",passengers:"Passengers",luggage:"Luggage",connected:"Live rates connected"},
 zh:{services:"服务",rates:"价格",fleet:"车队",review:"Google 评价",book:"立即预订",live:"实时价格",updated:"更新于",liveRates:"实时车辆价格",ratesTitle:"实时豪华轿车价格",charges:"附加费用",bookRates:"按此价格预订",fleetTitle:"适合各种团体的尊贵舒适体验",passengers:"乘客",luggage:"行李",connected:"实时价格已连接"},
 ms:{services:"Perkhidmatan",rates:"Kadar",fleet:"Armada",review:"Ulasan Google",book:"Tempah Sekarang",live:"Harga langsung",updated:"Dikemas kini",liveRates:"Kadar Kenderaan Langsung",ratesTitle:"Kadar limosin langsung",charges:"Caj tambahan",bookRates:"Tempah dengan kadar ini",fleetTitle:"Keselesaan premium untuk setiap kumpulan",passengers:"Penumpang",luggage:"Bagasi",connected:"Kadar langsung disambungkan"},
 ta:{services:"சேவைகள்",rates:"கட்டணங்கள்",fleet:"வாகனங்கள்",review:"Google மதிப்புரைகள்",book:"இப்போது முன்பதிவு",live:"நேரடி விலை",updated:"புதுப்பிக்கப்பட்டது",liveRates:"நேரடி வாகன கட்டணங்கள்",ratesTitle:"நேரடி லிமோசின் கட்டணங்கள்",charges:"கூடுதல் கட்டணங்கள்",bookRates:"இந்த கட்டணத்தில் முன்பதிவு",fleetTitle:"ஒவ்வொரு குழுவிற்கும் உயர்தர வசதி",passengers:"பயணிகள்",luggage:"சாமான்கள்",connected:"நேரடி கட்டணங்கள் இணைக்கப்பட்டுள்ளன"}
};


const capacityFallbacks:Record<string,{passengers:number;luggage:number}>={
  "4 Seater Sedan":{passengers:4,luggage:2},
  "6 Seater MPV":{passengers:6,luggage:4},
  "7 Seater Maxi Cab":{passengers:7,luggage:5},
  "Alphard / Vellfire":{passengers:6,luggage:4},
  "13 Seater Minibus":{passengers:13,luggage:10},
};
function capacity(vehicle:Vehicle){
  const fallback=capacityFallbacks[vehicle.name]||{passengers:Number(vehicle.name.match(/\d+/)?.[0]||0),luggage:0};
  const rawPassengers=vehicle.passenger_capacity ?? vehicle.passengerCapacity ?? vehicle.max_passengers ?? vehicle.passengers;
  const rawLuggage=vehicle.luggage_capacity ?? vehicle.luggageCapacity ?? vehicle.max_luggage ?? vehicle.luggage;
  const passengers=rawPassengers===null||rawPassengers===undefined?fallback.passengers:Number(rawPassengers);
  const luggage=rawLuggage===null||rawLuggage===undefined?fallback.luggage:Number(rawLuggage);
  return {passengers,luggage};
}

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
  hourly_disposal:"Hourly Disposal (minimum 3 hours)",
  sg_jb:"Cross Border SG to JB (from)",
};

export default function Home(){
  const [open,setOpen]=useState(false);
  const [payload,setPayload]=useState<RatePayload>({});
  const [rateError,setRateError]=useState("");
  const [lang,setLang]=useState<Lang>("en");
  const t=(key:string)=>ui[lang][key]||ui.en[key]||key;

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

  const vehicles=(payload.vehicle_types||[]).filter(vehicle=>!/(?:23|45)\s*seater/i.test(vehicle.name));
  const money=(amount:number,currency="SGD")=>new Intl.NumberFormat("en-SG",{style:"currency",currency,maximumFractionDigits:0}).format(amount);

  return <main>
    <header>
      <a className="logo" href="#home"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a>
      <button className="menu" aria-label="Open menu" onClick={()=>setOpen(!open)}>☰</button>
      <nav className={open?"open":""}>
        <a href="#services">{t("services")}</a><a href="#rates">{t("rates")}</a><a href="#fleet">{t("fleet")}</a>
        <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">{t("review")}</a>
        <select className="languageSelect" aria-label="Language" value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">EN</option><option value="zh">中文</option><option value="ms">BM</option><option value="ta">தமிழ்</option></select>
        <a className="book" href={`/book?lang=${lang}`}>{t("book")}</a>
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
      <div className="title"><p>{t("liveRates").toUpperCase()}</p><h2>{t("ratesTitle")}</h2><span>Published rate changes appear here automatically. Extra stops, waiting, parking, tolls and special requests may incur additional charges.</span><small className={rateError?"liveStatus error":"liveStatus"}>● {rateError||t("connected")}</small>{payload.updated_at&&<small className="liveUpdated"><strong>{t("live")}</strong><br/>{t("updated")}: {new Intl.DateTimeFormat(lang==="zh"?"zh-SG":lang==="ms"?"ms-SG":lang==="ta"?"ta-SG":"en-SG",{timeZone:"Asia/Singapore",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(payload.updated_at))} (SGT)</small>}</div>
      {visibleRates.length ? <div className="rateMatrixWrap"><table className="rateMatrix"><thead><tr><th>Service</th>{vehicles.map(vehicle=><th key={vehicle.id}>{vehicle.name}<small className="rateCapacity">{capacity(vehicle).passengers} pax · {capacity(vehicle).luggage} luggage</small></th>)}</tr></thead><tbody>{Array.from(new Set(visibleRates.map(rate=>rate.service_type))).map(service=><tr key={service}><th>{serviceLabels[service]||service.replaceAll("_"," ")}</th>{vehicles.map(vehicle=>{const rate=visibleRates.find(item=>item.service_type===service&&item.vehicle_type_id===vehicle.id);return <td key={vehicle.id}>{rate?money(rate.base_amount,rate.currency):"—"}{rate?.pricing_method==="per_hour"?<small>/hour</small>:null}</td>})}</tr>)}</tbody></table></div> : <div className="rateEmpty">No published rates are available yet. Publish rates in Finance Rate Management, then refresh this page.</div>}
      {(payload.additional_charges||[]).length>0&&<div className="additionalCharges"><h3>{t("charges")}</h3><div className="chargeGrid">{(payload.additional_charges||[]).map(charge=><article key={charge.id}><strong>{charge.name}</strong><b>{charge.charge_type==="actual_cost"?"Actual cost":charge.charge_type==="percentage"||charge.is_percentage?`${charge.amount}%`:money(charge.amount,charge.currency)}{charge.charge_type==="per_hour"?<small>/hour</small>:charge.charge_type==="per_stop"?<small>/stop</small>:charge.charge_type==="per_seat"?<small>/seat</small>:null}</b><p>{charge.description}</p></article>)}</div></div>}
      <div className="rateActions"><a className="gold" href={`/book?lang=${lang}`}>{t("bookRates")}</a></div>
    </section>

    <section className="section cream" id="fleet"><div className="title"><p>THE A3 FLEET</p><h2>{t("fleetTitle")}</h2></div>
      <div className="grid three fleet">{vehicles.map(vehicle=>{const limits=capacity(vehicle);return <article key={vehicle.id}>{vehicle.image_url?<img className="vehiclePhoto" src={vehicle.image_url} alt={vehicle.name}/>:<div className="vehicle">◆<small>CHAUFFEUR VEHICLE</small></div>}<h3>{vehicle.name}</h3><div className="vehicleCapacity"><span><strong>{limits.passengers}</strong> {t("passengers")}</span><span><strong>{limits.luggage}</strong> {t("luggage")}</span></div><p>{vehicle.description||"Premium private transport."}</p><a href={`/book?vehicle=${vehicle.id}`}>Book this vehicle →</a></article>})}</div>
    </section>

    <section className="reviews"><div><p className="eyebrow">GOOGLE REVIEWS</p><h2>Your experience matters.</h2><p>Reviews are handled directly on Google. This website does not collect or publish customer reviews.</p><div className="stars">★★★★★</div><a className="gold" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Open Google Reviews</a></div>
      <div className="reviewNotice"><strong>No website review form</strong><p>Customers are taken directly to Google to read or leave a review.</p></div>
    </section>

    <section className="bookingCta"><p className="eyebrow">RESERVE YOUR JOURNEY</p><h2>Send your booking directly to our team.</h2><p>The online form creates a pending booking for staff confirmation and returns a booking reference.</p><div className="actions"><a className="gold" href="/book">Open Booking Page</a><a className="ghost darkGhost" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a></div></section>

    <footer><div className="logo"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></div><p>Airport Transfer • Hourly Chauffeur • Point-to-Point • Singapore ↔ Johor Bahru</p><div className="footlinks"><a href="/book">Book Now</a><a href="/terms">Terms & Conditions</a><a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Google Review</a></div></footer>
  </main>
}
