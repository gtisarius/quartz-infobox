import type { ComponentChildren, VNode } from "preact";
import { type Fields, type RenderCtx, applyAliases, hasValue, renderInline } from "./render";
import { Rows, box, first, image, mainImage } from "./rows";

/** Chronicler-style keys → Wikipedia-style keys. */
const ALIASES: [RegExp, string][] = [
  [/^previous$|^previous_election$/, "previous_election"],
  [/^next$|^next_election$/, "next_election"],
  [/^date$/, "election_date"],
  [/^nominee(\d+)$/, "candidate$1"],
  [/^popular_vote(\d+)$/, "votes$1"],
  [/^school(\d+)$/, "party$1"],
];

/** How many candidates go side by side: up to 3, but 4 splits as 2 + 2 like Wikipedia. */
function chunk<T>(items: T[]): T[][] {
  const perRow = items.length === 4 ? 2 : 3;
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) out.push(items.slice(i, i + perRow));
  return out;
}

/** Highest candidate number used (no upper limit). */
function candidateCount(fields: Fields): number {
  let max = 0;
  for (const [key, value] of Object.entries(fields)) {
    const m = /^candidate(\d+)$/.exec(key);
    if (m && hasValue(value)) max = Math.max(max, Number(m[1]));
  }
  return max;
}

const stripArrows = (v: unknown) =>
  hasValue(v) ? String(v).replace(/^\s*[←<]+\s*/, "").replace(/\s*[→>]+\s*$/, "") : undefined;

export function renderElection(raw: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const fields = applyAliases(raw, ALIASES);
  const r = new Rows(fields, ctx);
  const title = first(fields, "election_name", "title") ?? fallbackTitle;

  // ← previous | date | next →
  const prev = stripArrows(fields.previous_election);
  const next = stripArrows(fields.next_election);
  if (prev || next || hasValue(fields.election_date)) {
    r.full(
      <table class="infobox-succession">
        <tbody>
          <tr>
            <td class="infobox-prev">{prev ? <>← {renderInline(prev, ctx)}</> : null}</td>
            <td class="infobox-date">{hasValue(fields.election_date) ? renderInline(fields.election_date, ctx) : null}</td>
            <td class="infobox-next">{next ? <>{renderInline(next, ctx)} →</> : null}</td>
          </tr>
        </tbody>
      </table>,
      "infobox-full infobox-columns-cell",
    );
  }

  mainImage(r, String(title));

  r.field("country", "Country");
  r.field("type", "Type");
  r.field("location", "Location");
  r.field("registered", "Registered");
  r.field("electors", "Electors");
  r.field("ballots", "Ballots");
  r.field("majority", "Needed to win");
  r.field("turnout", "Turnout");

  const partyLabel = hasValue(fields.party_label) ? String(fields.party_label) : "Party";
  const votesLabel = hasValue(fields.votes_label) ? String(fields.votes_label) : "Popular vote";
  const seatsLabel = hasValue(fields.seats_label) ? String(fields.seats_label) : "Seats won";

  const count = candidateCount(fields);
  if (count > 0) {
    const numbers = Array.from({ length: count }, (_, i) => i + 1).filter((n) => hasValue(fields[`candidate${n}`]));
    for (const group of chunk(numbers)) {
      const head: ComponentChildren[] = group.map((n) => {
        const portrait = image(fields[`image${n}`], `Portrait of candidate ${n}`, ctx, "infobox-candidate-image");
        return (
          <>
            {portrait}
            <div class="infobox-candidate-name">{renderInline(fields[`candidate${n}`], ctx)}</div>
          </>
        );
      });
      const col = (base: string) => group.map((n) => fields[`${base}${n}`]);
      r.grid(group.length, head, [
        { label: partyLabel, values: col("party") },
        { label: "Leader", values: col("leader") },
        { label: "Running mate", values: col("running_mate") },
        { label: "Home state", values: col("home_state") },
        { label: votesLabel, values: col("votes") },
        { label: "Percentage", values: col("percentage") },
        { label: seatsLabel, values: col("seats") },
        { label: "Seat change", values: col("seat_change") },
        { label: "Electoral vote", values: col("electoral_vote") },
        { label: "", values: col("note") },
      ]);
    }
  } else if (hasValue(fields.candidates)) {
    // Chronicler-style list: each item's first line is the name, "* " lines follow.
    const items = (Array.isArray(fields.candidates) ? fields.candidates : [fields.candidates]).filter(hasValue);
    r.section("Candidates", () => {
      for (const group of chunk(items)) r.columns(group);
    });
  }

  // Office before and after the election, side by side.
  if (hasValue(fields.before_election) || hasValue(fields.after_election)) {
    const office = hasValue(fields.office) ? String(fields.office) : "Officeholder";
    const cell = (heading: string, name: unknown, party: unknown) =>
      hasValue(name) ? [`**${heading}**`, String(name), ...(hasValue(party) ? [String(party)] : [])].join("\n") : undefined;
    r.columns([
      cell(`${office} before election`, fields.before_election, fields.before_party),
      cell(`Elected ${office}`, fields.after_election, fields.after_party),
    ]);
  }

  r.extras();

  return box("election", title, ctx, r.rows, { below: [fields.subtitle] });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownElection = /^(?:election_name|subtitle|previous|previous_election|next|next_election|date|election_date|image|image_caption|caption|country|type|location|registered|electors|ballots|majority|turnout|party_label|votes_label|seats_label|(?:candidate|nominee|image|party|school|leader|running_mate|home_state|votes|popular_vote|percentage|seats|seat_change|electoral_vote|note)\d+|candidates|office|before_election|before_party|after_election|after_party)$/;
