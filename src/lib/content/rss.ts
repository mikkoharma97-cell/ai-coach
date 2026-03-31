/**
 * Minimaalinen RSS 2.0 -parseri — ei riippuvuuksia.
 * Palauttaa vain otsikko, linkki, päiväys (uusien kohteiden deduplikointiin).
 */
export type RssItem = {
  title: string;
  link: string;
  pubDate: string;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .trim();
}

function firstTag(block: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const m = re.exec(block);
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g, "")) : "";
}

/** Poimi <item>-lohkot channelista */
export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = firstTag(block, "title");
    let link = firstTag(block, "link");
    if (!link) {
      const guid = firstTag(block, "guid");
      if (guid?.startsWith("http")) link = guid;
    }
    const pubDate = firstTag(block, "pubDate") || new Date().toISOString();
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, pubDate });
    }
  }
  return items;
}

export async function fetchRssText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AI-Coach-Training-Intelligence/1.0 (RSS ingest)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
