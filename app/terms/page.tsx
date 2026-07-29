import type {Metadata} from "next";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Terms & Conditions | A3 Group SG",
  description:"Booking, payment, cancellation and service terms for A3 Group SG limousine services."
};

type Terms={title:string;intro:string;version:string;lastUpdated:string;content:string};
type PolicySection={id:string;number:string;title:string;paragraphs:string[];bullets:string[]};

const fallback:Terms={
  title:"Terms & Conditions",
  intro:"These terms apply to A3 Group SG limousine bookings.",
  version:"2026-07-29",
  lastUpdated:"2026-07-29",
  content:`1. Booking lead time
Online bookings must be submitted more than 6 hours before the scheduled pickup time. A booking made exactly 6 hours before pickup is not accepted.

2. Passenger and luggage capacity
Customers must choose a vehicle suitable for the declared passenger and luggage quantities.
- Cabin luggage example: up to approximately 55 × 40 × 23 cm.
- Standard large luggage example: up to approximately 75 × 50 × 30 cm.
- Oversized, sports or bulky items must be declared before confirmation.`
};

async function getTerms():Promise<Terms>{
  try{
    const finance=(process.env.NEXT_PUBLIC_A3_FINANCE_URL||"https://finance.a3group.sg").replace(/\/$/,"");
    const response=await fetch(`${finance}/api/public/limousine/terms`,{cache:"no-store"});
    if(!response.ok)return fallback;
    const body=await response.json();
    return {...fallback,...(body.terms||{})};
  }catch{return fallback}
}

function slugify(value:string,index:number){
  const slug=value.toLowerCase().replace(/^\d+[.)]\s*/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return slug||`section-${index+1}`;
}

function parseSections(content:string):PolicySection[]{
  const normalized=String(content||"").replace(/\r/g,"").trim();
  const blocks=normalized.split(/\n\s*\n+/).map(block=>block.trim()).filter(Boolean);
  return blocks.map((block,index)=>{
    const lines=block.split("\n").map(line=>line.trim()).filter(Boolean);
    const first=lines[0]||`Section ${index+1}`;
    const looksLikeHeading=/^(?:\d+[.)]\s*)?[A-Z][^.!?]{2,90}$/.test(first);
    const rawTitle=looksLikeHeading?first:`Section ${index+1}`;
    const title=rawTitle.replace(/^\d+[.)]\s*/,"");
    const bodyLines=looksLikeHeading?lines.slice(1):lines;
    const bullets=bodyLines.filter(line=>/^[-•*]\s+/.test(line)).map(line=>line.replace(/^[-•*]\s+/,""));
    const paragraphs=bodyLines.filter(line=>!/^[-•*]\s+/.test(line)).join(" ").split(/\s{2,}/).map(item=>item.trim()).filter(Boolean);
    return {
      id:slugify(title,index),
      number:String(index+1).padStart(2,"0"),
      title,
      paragraphs:paragraphs.length?paragraphs:["Details will be updated shortly."],
      bullets
    };
  });
}

function formatDate(value:string){
  const date=new Date(`${value}T00:00:00`);
  if(Number.isNaN(date.getTime()))return value;
  return new Intl.DateTimeFormat("en-SG",{day:"numeric",month:"long",year:"numeric"}).format(date);
}

export default async function TermsPage(){
  const terms=await getTerms();
  const sections=parseSections(terms.content);
  return <main className="termsPage professionalTermsPage">
    <header className="termsSiteHeader">
      <a className="logo" href="/"><b>A3</b><span><strong>A3 GROUP SG</strong><small>PRIVATE CHAUFFEUR</small></span></a>
      <div className="termsHeaderActions"><a href="/book" className="termsBookButton">Book a ride</a><a href="/">Back to website</a></div>
    </header>

    <section className="termsHero professionalTermsHero">
      <div className="termsHeroInner">
        <div className="termsHeroCopy"><p className="eyebrow">CUSTOMER SERVICE POLICY</p><h1>{terms.title}</h1><p className="termsHeroIntro">{terms.intro}</p></div>
        <div className="termsDocumentMeta"><div><span>Policy version</span><strong>{terms.version}</strong></div><div><span>Last updated</span><strong>{formatDate(terms.lastUpdated)}</strong></div></div>
      </div>
    </section>

    <div className="termsLayout">
      <aside className="termsSidebar">
        <div className="termsSidebarCard">
          <span className="termsSidebarLabel">CONTENTS</span>
          <nav>{sections.map(section=><a key={section.id} href={`#${section.id}`}><b>{section.number}</b><span>{section.title}</span></a>)}</nav>
        </div>
        <div className="termsHelpCard"><span>Need clarification?</span><strong>Speak with our booking team</strong><p>Contact us before confirming your booking when a service condition is unclear.</p><a href="/book">Go to booking page</a></div>
      </aside>

      <article className="termsDocument">
        <div className="termsSummary">
          <div className="termsSummaryIcon">i</div>
          <div><strong>Please read before submitting a booking</strong><p>By submitting a request, you confirm that your booking details are accurate and that you accept the policy version displayed on this page.</p></div>
        </div>
        <div className="termsSections">
          {sections.map((section,index)=><section key={section.id} id={section.id} className={index===0?"featuredTerm":""}>
            <div className="termSectionNumber">{section.number}</div>
            <div className="termSectionBody">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph,pIndex)=><p key={pIndex}>{paragraph}</p>)}
              {section.bullets.length>0&&<ul>{section.bullets.map((bullet,bIndex)=><li key={bIndex}>{bullet}</li>)}</ul>}
            </div>
          </section>)}
        </div>
        <div className="termsLuggageGuide">
          <div><span>CABIN BAG EXAMPLE</span><strong>Up to 55 × 40 × 23 cm</strong><p>Typical carry-on suitcase or compact travel bag.</p></div>
          <div><span>LARGE LUGGAGE EXAMPLE</span><strong>Up to 75 × 50 × 30 cm</strong><p>Typical checked suitcase. Oversized items must be declared.</p></div>
        </div>
        <footer className="termsDocumentFooter"><div><strong>A3 Group SG</strong><span>Private Chauffeur Services</span></div><a href="/book">Continue to booking →</a></footer>
      </article>
    </div>
  </main>
}
