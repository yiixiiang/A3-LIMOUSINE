"use client";

import { useEffect, useMemo, useState } from "react";

export type CatalogueSite = "limousine" | "food" | "sakura";

type Item = {
  id: number;
  site: CatalogueSite;
  category: string;
  subgroup: string;
  service_name: string;
  title_en: string;
  title_zh: string;
  description_en: string;
  description_zh: string;
  price: number;
  currency: string;
  minimum_hours: number | null;
  image_url: string | null;
  image_alt: string;
  display_order: number;
  metadata: Record<string, unknown>;
};

const money = (item: Item) =>
  new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: item.currency || "SGD",
    minimumFractionDigits: 2,
  }).format(Number(item.price || 0));

export default function LiveWebsiteCatalogue({
  site,
  language = "en",
  title,
}: {
  site: CatalogueSite;
  language?: "en" | "zh";
  title?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const finance =
      process.env.NEXT_PUBLIC_A3_FINANCE_URL || "https://finance.a3group.sg";
    const controller = new AbortController();

    fetch(`${finance}/api/public/website-catalogue?site=${site}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json();
      })
      .then((payload) =>
        setItems(Array.isArray(payload.items) ? payload.items : []),
      )
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));

    return () => controller.abort();
  }, [site]);

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of items) {
      const key =
        site === "limousine"
          ? item.subgroup || "Vehicles"
          : item.category || "Selection";
      map.set(key, [...(map.get(key) || []), item]);
    }
    return [...map.entries()];
  }, [items, site]);

  if (!loaded || items.length === 0) return null;

  return (
    <section className={`a3-live-catalogue a3-live-${site}`} id="live-catalogue">
      <div className="a3-live-heading">
        <span>A3 LIVE CATALOGUE</span>
        <h2>
          {title ||
            (site === "limousine"
              ? "Services & Fleet"
              : site === "food"
                ? "Current Menu"
                : "Current Promotions")}
        </h2>
        <p>Prices, photos and availability are published directly from A3 Finance.</p>
      </div>

      <div className="a3-live-groups">
        {groups.map(([group, rows]) => (
          <section className="a3-live-group" key={group}>
            <div className="a3-live-group-title">
              <h3>{group}</h3>
              <span>{rows.length} item{rows.length === 1 ? "" : "s"}</span>
            </div>
            <div className="a3-live-grid">
              {rows.map((item) => (
                <article className="a3-live-card" key={item.id}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.image_alt || item.title_en}
                      loading="lazy"
                    />
                  ) : (
                    <div className="a3-live-placeholder" aria-hidden="true">A3</div>
                  )}
                  <div className="a3-live-body">
                    {site === "limousine" && item.service_name ? (
                      <span className="a3-live-tag">{item.service_name}</span>
                    ) : item.subgroup ? (
                      <span className="a3-live-tag">{item.subgroup}</span>
                    ) : null}
                    <h4>
                      {language === "zh" && item.title_zh
                        ? item.title_zh
                        : item.title_en}
                    </h4>
                    {item.title_zh && language !== "zh" ? (
                      <small>{item.title_zh}</small>
                    ) : null}
                    {(language === "zh"
                      ? item.description_zh
                      : item.description_en) ? (
                      <p>
                        {language === "zh"
                          ? item.description_zh
                          : item.description_en}
                      </p>
                    ) : null}
                    <div className="a3-live-price">
                      <strong>{money(item)}</strong>
                      {item.minimum_hours ? (
                        <span>Minimum {item.minimum_hours} hours</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
