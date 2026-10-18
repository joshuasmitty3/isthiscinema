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
    body: `a year ago today, i was in atlanta's airport (stuck from a series of flight delays) and had learned a few days earlier, after my greyhound (aka flixbus) pulled into the atl terminal, that the wb's job had passed on me. i went to atlanta to hang out with my wife and use her work trip as an opportunity to scope the city we figured we might have to relocate to, but after a couple 'hey! i'm just following up' emails, i finally got the verdict.

as that sisyphus boulder settled back to the bottom of the mountain, i finally felt the drain of it all.

it wasn't the rejection that stung. obviously that sucked, the timing was poetic, but i was generally relieved to have at least gotten a few rounds of interviews with real people. what actually seeped into my psyche was how much time i was wasting. i left netflix with the awareness that i'd been stepping into a shitty job market, but as the days turned to months and months, into a full year, i was no closer to reaching my goal. and the goal wasn't a job. not immediately, at least. the goal was to grow and learn and find new opportunities. how had i grown or learned anything this past year? i was still writing and working with a friend but the majority of my time was spent scrolling job boards (refreshing the hellhole linkedin), updating cover letters, uploading slightly altered pdf versions of my resume or worst of all, painstakingly copy-and-pasting my career highlights into some dated job portal. there was no growth in that. i was adrift and until i found land, my daily existence would continue to be reduced to applying, networking, interviewing, getting ghosted and applying some more.

throwing ai into the job hunting mix added little beyond more frenzy. the arms race between applicants and recruiters continues to escalate.

now a year later, i have a job and i'm learning and growing with some interesting opportunities, but it's a challenge. the founder's a lunatic, there's daily chaos between leadership and priorities and my role expectations are unclear. yet. this is what i wished for.

more importantly than the job, i have a son now. we didn't know it a year ago, sitting in that airport, annoyed by the delays but passing the time quietly laughing together while people-watching, but our son was with us then. in between drinks at a dive bar a few nights earlier, my wife had mentioned her period was late. it had been late before, so we didn't let ourselves assume anything, especially since the last time had ended in loss.

right now i'm sitting on a bench, watching our napping four month old. he was up late last night, in the midst of a sleep regression and crying and throwing up as he's done for most of his life so far and we're tired like all new parents are and the apartment is too small for a new kid and a new job, yet. this is what we wished for. the poetry is not lost. the seasons of our lives rhyme in odd ways and i am beyond grateful.`,
  },
];
