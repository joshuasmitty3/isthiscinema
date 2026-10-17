// Private ramblings: served ONLY to authenticated sessions via
// GET /api/ramblings/private. This module is imported by the server
// (server/routes.ts) and never by any client code, so its content is
// bundled into the server, not the browser bundle. Logged-out visitors
// never receive it.

export interface PrivateRambling {
  slug: string;
  title: string;
  subtitle?: string;
  date: string; // e.g. "2026-10-11"
  body: string; // raw Markdown; rendered + sanitized client-side
}

export const privateRamblings: PrivateRambling[] = [
  {
    slug: "life-is-a-monkeypaw",
    title: "life is a monkeypaw",
    date: "2026-10-11",
    body: `A year ago today, I was in Atlanta's airport (stuck from a series of flight delays) and had learned a few days earlier, after my greyhound (aka flixbus) pulled into the ATL terminal, that the WB's job had passed on me. I went to Atlanta to hang out with Brittany and use her work trip as an opportunity to scope the city we figured we might have to relocate to, but after a couple 'Hey! I'm just following up' emails, I finally got the verdict.

As that sisyphus boulder settled back to the bottom of the mountain, I finally felt the drain of it all.

It wasn't the rejection that stung. Obviously that sucked, the timing was poetic, but I was generally relieved to have at least gotten a few rounds of interviews with real people. What actually seeped into my psyche was how much time I was wasting. I left Netflix with the awareness that I'd been stepping into a shitty job market, but as the days turned to months and months, into a full year, I was no closer to reaching my goal. The goal wasn't a job. The goal was to grow and learn and find new opportunities. And how had I grown or learned anything this past year? I was still writing and working with Harry on his app but the majority of my time was scrolling job boards (and the hellhole of linkedIn), updating cover letters, uploading slightly altered pdf versions of my resume or worse, painstakingly copy-and-pasting my career highlights into some dated job portal. And there was no growth in that. I was adrift and until I found land, my daily existence would continue to be reduced to applying, networking, interviewing, getting ghosted and applying some more.

And throwing AI into the job hunting mix didn't add much beyond more frenzy to an arms race between applicants and recruiters.

Now a year later, I have a job and I'm learning and growing with plenty of opportunities, but it's a challenge. Jimmy's a lunatic, there's daily chaos between leaders and priorities and even my role expectations (I ended up reporting to HR for a few months) are all over the place. Yet. This is what I wished for.

More importantly than the job, I have a son now. We didn't know it a year ago, sitting in that airport, annoyed at the delays and passing the time quietly laughing while people watching, but Xavier was with us then. In between drinks at a dive bar a few nights earlier Brittany had mentioned her period was late, but it'd been late before so we didn't assume anything. And even so, we'd gone down this path before and it had ended in miscarriage.

And right now I'm sitting on a bench, watching our napping four month old. He was up late last night, in the midst of a sleep regression and crying and throwing up as he's done for most of his life so far and we're tired like all new parents are and the apartment is too small for a new kid and a new job, yet. This is what we wished for. The poetry is not lost. The seasons of my life rhyme in odd and surprising ways and I am beyond grateful.`,
  },
];
