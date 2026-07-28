"use client";
import {FormEvent,useState} from "react";

const CONTACTS={
 whatsapp:"6590000000",
 telegram:"A3GROUPSG_BOT",
 wechat:"A3GROUPSG",
 instagram:"https://instagram.com/a3groupsg",
 facebook:"https://facebook.com/a3groupsg",
 review:"https://g.page/r/YOUR-GOOGLE-REVIEW-LINK/review",
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
const fleet=[
 ["EXECUTIVE","5-Seater Sedan","Best for business travellers, couples and light luggage."],
 ["PREMIUM","6/7-Seater MPV","A spacious choice for families, tours and airport transfers."],
 ["VIP","Luxury MPV","Premium comfort for executives, VIP guests and special occasions."]
];

export default function Home(){
 const [open,setOpen]=useState(false);
 const copyWechat=async()=>{await navigator.clipboard.writeText(CONTACTS.wechat);alert(`WeChat ID copied: ${CONTACTS.wechat}`)};
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); const f=new FormData(e.currentTarget);
  const msg=`A3 GROUP SG — LIMOUSINE ENQUIRY

Service: ${f.get("service")}
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
    <a href={CONTACTS.rates} target="_blank">Rates</a><a href="#reviews">Reviews</a><a className="book" href="#booking">Book Now</a>
   </nav>
  </header>

  <section className="hero" id="home">
   <div className="heroCopy">
    <p className="eyebrow">SINGAPORE • JOHOR BAHRU • PRIVATE CHAUFFEUR</p>
    <h1>Luxury travel,<em>personally driven.</em></h1>
    <p>Premium airport transfers, private city journeys and hourly chauffeur services for business, leisure and special occasions.</p>
    <div className="actions"><a className="gold" href="#booking">Reserve Your Journey</a><a className="ghost" href={CONTACTS.rates} target="_blank">View Rates</a></div>
    <div className="social">
     <a href={`https://wa.me/${CONTACTS.whatsapp}`} target="_blank">WhatsApp</a>
     <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank">Telegram</a>
     <button onClick={copyWechat}>WeChat</button>
     <a href={CONTACTS.instagram} target="_blank">Instagram</a>
     <a href={CONTACTS.facebook} target="_blank">Facebook</a>
    </div>
   </div>
   <aside><small>QUICK ACCESS</small><h2>Where may we take you?</h2>
    <a href="#booking"><b>01</b><span>Start a booking</span>→</a>
    <a href={CONTACTS.rates} target="_blank"><b>02</b><span>View online rates</span>↗</a>
    <a href={CONTACTS.review} target="_blank"><b>03</b><span>Leave a review</span>★</a>
   </aside>
  </section>

  <div className="strip"><span>PROFESSIONAL CHAUFFEURS</span><span>PREMIUM VEHICLES</span><span>FLEXIBLE ITINERARIES</span><span>DIRECT BOOKING</span></div>

  <section className="section" id="services"><div className="title"><p>OUR SIGNATURE SERVICES</p><h2>Designed around your journey.</h2></div>
   <div className="grid four">{services.map((s,i)=><article key={s[0]}><i>0{i+1}</i><h3>{s[0]}</h3><p>{s[1]}</p><a href={CONTACTS.rates} target="_blank">View rates ↗</a></article>)}</div>
  </section>

  <section className="darkSection" id="tours"><div className="title light"><p>CURATED SINGAPORE JOURNEYS</p><h2>See more. Travel better.</h2></div>
   <div className="grid three">{tours.map((t,i)=><article className={i===1?"featured":""} key={t[1]}><small>{t[0]}</small><h3>{t[1]}</h3><p>{t[2]}</p><div><a href="#booking">Book journey</a><a href={CONTACTS.rates} target="_blank">Rates ↗</a></div></article>)}</div>
  </section>

  <section className="section cream" id="fleet"><div className="title"><p>THE A3 FLEET</p><h2>Premium comfort for every group.</h2></div>
   <div className="grid three fleet">{fleet.map(v=><article key={v[1]}><div className="vehicle">◆<small>{v[0]}</small></div><h3>{v[1]}</h3><p>{v[2]}</p><a href={CONTACTS.rates} target="_blank">View vehicle rate ↗</a></article>)}</div>
  </section>

  <section className="reviews" id="reviews"><div><p className="eyebrow">TRUSTED JOURNEYS</p><h2>Your experience matters.</h2><p>Share your experience and help future travellers choose A3 Group SG with confidence.</p><div className="stars">★★★★★</div><a className="gold" href={CONTACTS.review} target="_blank">Leave a Google Review</a></div>
   <div className="quotes"><blockquote>★★★★★<p>Professional, punctual and very comfortable.</p><small>Airport Transfer Guest</small></blockquote><blockquote>★★★★★<p>Courteous and flexible throughout our city tour.</p><small>Private Tour Guest</small></blockquote></div>
  </section>

  <section className="booking" id="booking"><div><p className="eyebrow darkText">RESERVE YOUR JOURNEY</p><h2>Private travel, arranged properly.</h2><p>Complete the form and send your request through WhatsApp.</p>
   <div className="links"><a href={`https://wa.me/${CONTACTS.whatsapp}`}>WhatsApp ↗</a><a href={`https://t.me/${CONTACTS.telegram}`}>Telegram ↗</a><button onClick={copyWechat}>WeChat: {CONTACTS.wechat} — Copy</button><a href={CONTACTS.instagram}>Instagram ↗</a><a href={CONTACTS.facebook}>Facebook ↗</a><a href={CONTACTS.review}>Google Review ★</a></div>
  </div>
  <form onSubmit={submit}>
   <label className="full">Service<select name="service" required defaultValue=""><option value="" disabled>Select service</option>{services.map(s=><option key={s[0]}>{s[0]}</option>)}</select></label>
   <label>Date<input type="date" name="date" required/></label><label>Time<input type="time" name="time" required/></label>
   <label className="full">Pickup<input name="pickup" required/></label><label className="full">Destination / itinerary<textarea name="destination" required/></label>
   <label>Passengers<input type="number" name="passengers" defaultValue="1" min="1"/></label><label>Luggage<input type="number" name="luggage" defaultValue="0" min="0"/></label>
   <label>Name<input name="name" required/></label><label>Contact<input name="contact" required/></label>
   <label className="full">Remarks<textarea name="remarks"/></label><button className="gold full" type="submit">Send via WhatsApp</button>
   <a className="rate full" href={CONTACTS.rates} target="_blank">Check current rates at finance.a3group.sg ↗</a>
  </form></section>

  <footer><div className="logo"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></div><p>Airport Transfer • Hourly Chauffeur • Point-to-Point • Singapore ↔ Johor Bahru</p><div className="footlinks"><a href={CONTACTS.instagram}>Instagram</a><a href={CONTACTS.facebook}>Facebook</a><a href={CONTACTS.review}>Review</a></div></footer>
 </main>
}