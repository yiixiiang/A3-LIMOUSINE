"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import styles from "./professional-limousine.module.css";

const DEFAULT_WHATSAPP = "6584849004";
const DISPLAY_PHONE = "+65 8484 9004";
const A3_FINANCE_URL =
  process.env.NEXT_PUBLIC_A3_FINANCE_URL || "https://finance.a3group.sg";

const services = [
  {
    number: "01",
    value: "airport_transfer",
    title: "Airport Transfer",
    text: "Meet-and-greet coordination, flight-aware pickup planning and direct hotel or residence transfer.",
  },
  {
    number: "02",
    value: "point_to_point",
    title: "Point-to-Point",
    text: "Private chauffeur transport for meetings, dining, events and everyday executive travel.",
  },
  {
    number: "03",
    value: "hourly_disposal",
    title: "Hourly Disposal",
    text: "Keep a dedicated vehicle and driver available for multiple stops and flexible schedules.",
  },
  {
    number: "04",
    value: "sg_jb",
    title: "Singapore ↔ Johor",
    text: "Comfortable cross-border journeys with direct pickup and destination coordination.",
  },
] as const;

const fallbackRates = [
  { id: -1, vehicle: "4-Seater", service: "Arrival Meet & Greet", price: "From S$55" },
  { id: -2, vehicle: "4-Seater", service: "Driveway Pickup", price: "From S$50" },
  { id: -3, vehicle: "6-Seater", service: "Arrival Meet & Greet", price: "From S$60" },
  { id: -4, vehicle: "6-Seater", service: "Driveway Pickup", price: "From S$55" },
  { id: -5, vehicle: "4-Seater", service: "Hourly Disposal · 3-hour minimum", price: "From S$40/hr" },
  { id: -6, vehicle: "6-Seater", service: "Hourly Disposal · 3-hour minimum", price: "From S$45/hr" },
];

const standards = [
  "Professional drivers",
  "Clean executive vehicles",
  "Clear quotation",
  "A3 Finance connected",
];

type VehicleType = {
  id: number;
  code?: string | null;
  name: string;
  passenger_capacity?: number | null;
  luggage_capacity?: number | null;
};

type RateCard = {
  id: number;
  vehicle_type_id?: number | null;
  name: string;
  service_type: string;
  pricing_method: string;
  base_amount: number;
  currency: string;
  minimum_hours?: number | null;
  included_hours?: number | null;
  additional_hour_amount?: number | null;
  notes?: string | null;
  vehicle?: VehicleType | null;
};

type PublicWebsiteData = {
  company?: {
    id?: number;
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
  } | null;
  vehicle_types?: VehicleType[];
  rate_cards?: RateCard[];
  contact?: {
    whatsapp?: string | null;
    telegram?: string | null;
    wechat?: string | null;
  };
};

type QuoteForm = {
  customer_name: string;
  phone: string;
  email: string;
  preferred_contact: "whatsapp" | "telegram" | "wechat" | "phone";
  service_type: string;
  trip_date: string;
  pickup_time: string;
  pickup_location: string;
  dropoff_location: string;
  return_trip: boolean;
  passengers: string;
  luggage: string;
  vehicle_type_id: string;
  rate_card_id: string;
  special_requests: string;
  consent_accepted: boolean;
  company: string;
  started_at: number;
};

const initialForm: QuoteForm = {
  customer_name: "",
  phone: "",
  email: "",
  preferred_contact: "whatsapp",
  service_type: "airport_transfer",
  trip_date: "",
  pickup_time: "",
  pickup_location: "",
  dropoff_location: "",
  return_trip: false,
  passengers: "1",
  luggage: "0",
  vehicle_type_id: "",
  rate_card_id: "",
  special_requests: "",
  consent_accepted: false,
  company: "",
  started_at: 0,
};

function digits(value: string | null | undefined) {
  return String(value || DEFAULT_WHATSAPP).replace(/\D/g, "") || DEFAULT_WHATSAPP;
}

function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${digits(number)}?text=${encodeURIComponent(message)}`;
}

function safeNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function serviceLabel(value: string) {
  return services.find((service) => service.value === value)?.title || value.replaceAll("_", " ");
}

function money(amount: number, currency = "SGD") {
  try {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function ProfessionalLimousinePage() {
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [websiteData, setWebsiteData] = useState<PublicWebsiteData>({});
  const [loadingRates, setLoadingRates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setForm((current) => ({ ...current, started_at: Date.now() }));

    const controller = new AbortController();
    async function loadWebsiteData() {
      try {
        const response = await fetch("/api/limousine", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as PublicWebsiteData;
        setWebsiteData(payload);
      } catch {
        // Static fallback content remains visible if A3 Finance is unavailable.
      } finally {
        setLoadingRates(false);
      }
    }
    void loadWebsiteData();
    return () => controller.abort();
  }, []);

  const whatsappNumber = digits(websiteData.contact?.whatsapp);
  const vehicleTypes = websiteData.vehicle_types || [];
  const rateCards = websiteData.rate_cards || [];
  const selectedRate = useMemo(
    () => rateCards.find((rate) => String(rate.id) === form.rate_card_id) || null,
    [form.rate_card_id, rateCards],
  );

  const displayRates = useMemo(() => {
    if (rateCards.length === 0) return fallbackRates;
    return rateCards.slice(0, 8).map((rate) => {
      const hourly = rate.pricing_method === "per_hour";
      return {
        id: rate.id,
        vehicle: rate.vehicle?.name || "AEJKY Vehicle",
        service: rate.name || serviceLabel(rate.service_type),
        price: `${money(Number(rate.base_amount || 0), rate.currency || "SGD")}${hourly ? "/hr" : ""}`,
      };
    });
  }, [rateCards]);

  const message = useMemo(
    () =>
      [
        "AEJKY Limousine quotation request",
        referenceNo ? `Reference: ${referenceNo}` : "",
        `Name: ${form.customer_name || "-"}`,
        `Contact: ${form.phone || "-"}`,
        form.email ? `Email: ${form.email}` : "",
        `Preferred contact: ${form.preferred_contact}`,
        `Service: ${serviceLabel(form.service_type)}`,
        `Date / time: ${form.trip_date || "Flexible"} ${form.pickup_time}`.trim(),
        `Pickup: ${form.pickup_location || "-"}`,
        `Drop-off: ${form.dropoff_location || "-"}`,
        `Passengers: ${form.passengers || "-"}`,
        `Luggage: ${form.luggage || "0"}`,
        `Return trip: ${form.return_trip ? "Yes" : "No"}`,
        selectedRate ? `Selected rate: ${selectedRate.name} — ${money(selectedRate.base_amount, selectedRate.currency)}` : "",
        form.special_requests ? `Notes: ${form.special_requests}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [form, referenceNo, selectedRate],
  );

  function update<K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setReferenceNo("");

    try {
      const response = await fetch("/api/limousine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          passengers: Math.max(1, safeNumber(form.passengers, 1)),
          luggage: Math.max(0, safeNumber(form.luggage, 0)),
          vehicle_type_id: safeNumber(form.vehicle_type_id) || null,
          rate_card_id: safeNumber(form.rate_card_id) || null,
          estimated_amount: selectedRate?.base_amount ?? null,
          currency: selectedRate?.currency ?? "SGD",
        }),
      });
      const payload = (await response.json()) as { reference_no?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save your quotation request.");
      }
      setReferenceNo(payload.reference_no || "Submitted");
      setForm((current) => ({ ...current, started_at: Date.now() }));
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? `${error.message} Please send the prepared request through WhatsApp.`
          : "Unable to save your request. Please send it through WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyForSocial() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  function selectRate(rateId: string) {
    update("rate_card_id", rateId);
    const rate = rateCards.find((item) => String(item.id) === rateId);
    if (rate?.vehicle_type_id) update("vehicle_type_id", String(rate.vehicle_type_id));
    if (rate?.service_type) update("service_type", rate.service_type);
  }

  function chooseRate(rateId: number) {
    if (rateId > 0) selectRate(String(rateId));
    goTo("quote");
  }

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => goTo("home")} aria-label="AEJKY Limousine home">
          <span className={styles.brandLogo}><img src="/aejky-limousine-logo.webp" alt="AEJKY Limousine" /></span>
          <span><strong>AEJKY</strong><small>LIMOUSINE</small></span>
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <button type="button" onClick={() => goTo("services")}>Services</button>
          <button type="button" onClick={() => goTo("rates")}>Rates</button>
          <button type="button" onClick={() => goTo("about")}>About</button>
          <button type="button" onClick={() => goTo("quote")}>Quotation</button>
          <a href={whatsappUrl(whatsappNumber, "Hello AEJKY Limousine, I would like to make an enquiry.")} target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>

        <button className={styles.menu} type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open navigation">
          <span /><span /><span />
        </button>
      </header>

      <section className={styles.hero} id="home">
        <div className={styles.heroPattern} />
        <div className={styles.heroCopy}>
          <div className={styles.kicker}><span /> Singapore Premium Chauffeur Service</div>
          <h1>Arrive with<br /><em>confidence.</em></h1>
          <p>
            Executive airport transfers, private point-to-point journeys, hourly disposal and
            Singapore–Johor transport—professionally coordinated by AEJKY Limousine.
          </p>
          <div className={styles.heroActions}>
            <button type="button" onClick={() => goTo("quote")}>Request a Quotation <span>→</span></button>
            <a href={whatsappUrl(whatsappNumber, "Hello AEJKY Limousine, I would like to make a booking enquiry.")} target="_blank" rel="noreferrer">WhatsApp {DISPLAY_PHONE}</a>
          </div>
          <div className={styles.heroFacts}>
            <span><strong>24/7</strong><small>Enquiry Support</small></span>
            <span><strong>SG · MY</strong><small>Cross-Border Service</small></span>
            <span><strong>53488486E</strong><small>Registered UEN</small></span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.logoPanel}>
            <span className={styles.logoLabel}>OFFICIAL BRAND</span>
            <img src={websiteData.company?.logo_url || "/aejky-limousine-logo.webp"} alt="AEJKY Limousine official logo and fleet" />
            <div className={styles.logoFooter}>
              <span><small>UEN</small><strong>53488486E</strong></span>
              <a href={whatsappUrl(whatsappNumber, "Hello AEJKY Limousine.")} target="_blank" rel="noreferrer">{DISPLAY_PHONE}</a>
            </div>
          </div>
          <div className={styles.floatingBadge}><span>AEJKY STANDARD</span><strong>Premium · Punctual · Personal</strong></div>
        </div>
      </section>

      <section className={styles.introStrip}>
        {standards.map((item) => <span key={item}><i>◆</i>{item}</span>)}
      </section>

      <section className={styles.section} id="services">
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>OUR SERVICES</span><h2>Transport shaped around your schedule.</h2></div>
          <p>From airport arrival to a full day of appointments, every trip is planned with comfort, timing and clear communication in mind.</p>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article key={service.title}>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <button type="button" onClick={() => { update("service_type", service.value); update("rate_card_id", ""); goTo("quote"); }}>Enquire <b>→</b></button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.darkSection} id="rates">
        <div className={styles.sectionHeadingDark}>
          <div><span className={styles.eyebrow}>STARTING RATES</span><h2>Transparent guidance before you book.</h2></div>
          <p>Rates are loaded from A3 Finance when available. Final fares may vary for distance, timing, ERP, parking, waiting, extra stops and cross-border requirements.</p>
        </div>
        <div className={styles.connectionNote}>
          <span className={styles.connectionDot} />
          {loadingRates ? "Connecting to A3 Finance rates…" : rateCards.length > 0 ? "Live rates connected to A3 Finance" : "Showing standard AEJKY starting rates"}
        </div>
        <div className={styles.rateTable}>
          {displayRates.map((rate, index) => (
            <div className={styles.rateRow} key={`${rate.id}-${rate.vehicle}-${rate.service}`}>
              <span className={styles.rateNo}>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{rate.vehicle}</strong><small>{rate.service}</small></div>
              <b>{rate.price}</b>
              <button type="button" onClick={() => chooseRate(rate.id)}>Get Quote →</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.aboutLogo}><img src="/aejky-limousine-logo.webp" alt="AEJKY Limousine official brand" /></div>
        <div className={styles.aboutCopy}>
          <span className={styles.eyebrow}>ABOUT AEJKY</span>
          <h2>A professional journey from first message to final destination.</h2>
          <p>
            AEJKY Limousine provides private chauffeured transport for travellers, families,
            corporate guests and cross-border passengers. Quotation requests from this website are
            securely recorded in A3 Finance for follow-up, pricing and operations.
          </p>
          <dl>
            <div><dt>Business</dt><dd>AEJKY Limousine</dd></div>
            <div><dt>UEN</dt><dd>53488486E</dd></div>
            <div><dt>WhatsApp</dt><dd>{DISPLAY_PHONE}</dd></div>
            <div><dt>Coverage</dt><dd>Singapore & Malaysia</dd></div>
            <div><dt>Office</dt><dd>887C Woodlands Drive 50 #13-607</dd></div>
            <div><dt>System</dt><dd>A3 Finance Connected</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.quoteSection} id="quote">
        <div className={styles.quoteIntro}>
          <span className={styles.eyebrow}>PRIVATE QUOTATION</span>
          <h2>Tell us where you need to go.</h2>
          <p>Submit the request to AEJKY through A3 Finance. You will receive a reference number, and our team can follow up through your preferred contact method.</p>
          <div className={styles.contactCards}>
            <a href={whatsappUrl(whatsappNumber, message)} target="_blank" rel="noreferrer"><strong>WhatsApp</strong><span>{DISPLAY_PHONE}</span></a>
            <button type="button" onClick={copyForSocial}><strong>Telegram</strong><span>Copy enquiry message</span></button>
            <button type="button" onClick={copyForSocial}><strong>WeChat</strong><span>Copy enquiry message</span></button>
          </div>
          {copied && <div className={styles.toast}>Quotation message copied.</div>}
          <div className={styles.financeCard}>
            <span>A3 FINANCE CONNECTION</span>
            <strong>Website quotations are stored under AEJKY Limousine.</strong>
            <a href={`${A3_FINANCE_URL}/login`} target="_blank" rel="noreferrer">Staff Login →</a>
          </div>
        </div>

        <form className={styles.form} onSubmit={submitQuote}>
          <div className={styles.formTop}><span>AEJKY LIMOUSINE</span><strong>Quotation Request</strong></div>
          <input className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.company} onChange={(event) => update("company", event.target.value)} />
          <div className={styles.formGrid}>
            <label><span>Full Name *</span><input required value={form.customer_name} onChange={(event) => update("customer_name", event.target.value)} /></label>
            <label><span>Contact Number *</span><input required inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label><span>Email</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
            <label><span>Preferred Contact *</span><select value={form.preferred_contact} onChange={(event) => update("preferred_contact", event.target.value as QuoteForm["preferred_contact"])}><option value="whatsapp">WhatsApp</option><option value="telegram">Telegram</option><option value="wechat">WeChat</option><option value="phone">Phone</option></select></label>
            <label><span>Service *</span><select value={form.service_type} onChange={(event) => { update("service_type", event.target.value); update("rate_card_id", ""); }}>{services.map((service) => <option key={service.value} value={service.value}>{service.title}</option>)}<option value="charter">Charter</option><option value="jb_sg">Johor → Singapore</option></select></label>
            <label><span>Vehicle</span><select value={form.vehicle_type_id} onChange={(event) => update("vehicle_type_id", event.target.value)}><option value="">Let AEJKY recommend</option>{vehicleTypes.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}{vehicle.passenger_capacity ? ` · ${vehicle.passenger_capacity} pax` : ""}</option>)}</select></label>
            <label><span>Trip Date *</span><input required type="date" value={form.trip_date} onChange={(event) => update("trip_date", event.target.value)} /></label>
            <label><span>Pickup Time</span><input type="time" value={form.pickup_time} onChange={(event) => update("pickup_time", event.target.value)} /></label>
            <label><span>Passengers</span><input type="number" min="1" max="100" value={form.passengers} onChange={(event) => update("passengers", event.target.value)} /></label>
            <label><span>Luggage</span><input type="number" min="0" max="100" value={form.luggage} onChange={(event) => update("luggage", event.target.value)} /></label>
            {rateCards.length > 0 && <label className={styles.full}><span>Rate Option</span><select value={form.rate_card_id} onChange={(event) => selectRate(event.target.value)}><option value="">Request custom quotation</option>{rateCards.map((rate) => <option key={rate.id} value={rate.id}>{rate.vehicle?.name || "Vehicle"} · {rate.name} · {money(rate.base_amount, rate.currency)}</option>)}</select></label>}
            <label className={styles.full}><span>Pickup Location *</span><input required placeholder="Airport, hotel, address or landmark" value={form.pickup_location} onChange={(event) => update("pickup_location", event.target.value)} /></label>
            <label className={styles.full}><span>Drop-off Location *</span><input required placeholder="Destination address or landmark" value={form.dropoff_location} onChange={(event) => update("dropoff_location", event.target.value)} /></label>
            <label className={styles.full}><span>Special Requests</span><textarea rows={4} placeholder="Flight number, child seat, extra stop, return details or other requirements" value={form.special_requests} onChange={(event) => update("special_requests", event.target.value)} /></label>
            <label className={`${styles.full} ${styles.checkLabel}`}><input type="checkbox" checked={form.return_trip} onChange={(event) => update("return_trip", event.target.checked)} /><span>Return trip required</span></label>
            <label className={`${styles.full} ${styles.checkLabel}`}><input required type="checkbox" checked={form.consent_accepted} onChange={(event) => update("consent_accepted", event.target.checked)} /><span>I agree that AEJKY Limousine may use these details to prepare and manage my quotation request. *</span></label>
          </div>
          {referenceNo && <div className={styles.successBox}><span>REQUEST SAVED TO A3 FINANCE</span><strong>{referenceNo}</strong><p>Keep this reference for follow-up.</p><a href={whatsappUrl(whatsappNumber, message)} target="_blank" rel="noreferrer">Send reference through WhatsApp →</a></div>}
          {submitError && <div className={styles.errorBox}>{submitError}</div>}
          <p className={styles.consent}>Do not submit payment-card, NRIC or passport details in this form.</p>
          <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Saving to A3 Finance…" : "Submit Quotation Request"}<span>→</span></button>
        </form>
      </section>

      <section className={styles.legal}>
        <details><summary>Terms & Conditions <span>+</span></summary><div><p>A quotation request is not a confirmed booking. A trip is confirmed only after AEJKY Limousine provides written acceptance and fare confirmation.</p><p>Starting rates may exclude ERP, parking, tolls, waiting time, midnight surcharge, extra stops and other agreed charges. Cancellation, amendment and no-show charges depend on the confirmed booking terms.</p><p>Passengers are responsible for valid travel documents on cross-border trips and for declaring passenger and luggage requirements accurately.</p></div></details>
        <details><summary>Privacy Notice <span>+</span></summary><div><p>Information submitted is used to prepare quotations, coordinate transport, communicate with customers and maintain operational records in A3 Finance. It may be shared with authorised staff and assigned drivers only where necessary to fulfil the service.</p><p>Do not submit payment-card, NRIC or passport details through this form. Contact AEJKY Limousine to request access, correction or deletion where permitted by applicable requirements.</p></div></details>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}><img src="/aejky-limousine-logo.webp" alt="AEJKY Limousine" /><span><strong>AEJKY LIMOUSINE</strong><small>UEN 53488486E</small></span></div>
        <div className={styles.footerNav}><button onClick={() => goTo("services")}>Services</button><button onClick={() => goTo("rates")}>Rates</button><button onClick={() => goTo("quote")}>Quotation</button><a href={`${A3_FINANCE_URL}/login`} target="_blank" rel="noreferrer">A3 Finance Staff</a></div>
        <p>© {new Date().getFullYear()} AEJKY Limousine. Website quotation system connected to A3 Finance.</p>
      </footer>

      <div className={styles.mobileBar}>
        <a href={whatsappUrl(whatsappNumber, "Hello AEJKY Limousine, I would like to enquire.")} target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" onClick={() => goTo("quote")}>Get Quotation</button>
      </div>
    </main>
  );
}
