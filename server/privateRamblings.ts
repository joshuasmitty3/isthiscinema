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
    body: `a year ago today, i was in atlanta's airport (stuck from a series of flight delays) and had learned a few days earlier, after my greyhound (aka flixbus) pulled into the terminal, that the wb's job had passed on me. i went there to hang out with my wife and use her work trip as an opportunity to scope the city we figured we might have to relocate to, but after a couple 'hey! i'm just following up' emails, i finally got the verdict.

as that sisyphus boulder settled back down, something new seeped into my psyche.

it wasn't the rejection. i was relieved to have at least gotten a few rounds of interviews with some real people. when i left netflix i knew i was entering a bad job market, but as the days turned to months and months into a full year, i realized how much time was wasted. what had i learned this past year? how had i grown? i was still writing and working with harry, but the weight of my focus has shifted to scrolling job boards (refreshing that hellhole linkedin), updating different cover letters, sending altered versions of my resume into the void, or worst of all, having to painstakingly copy-and-paste my career into a dated job portal. every day, rinse and repeat. throw the frenzy of an ai arms race into the mix and the life of the unemployed is reduced to applying, networking, interviewing, getting ghosted and then applying some more.

now a year later, i have a job. the founder's a lunatic, my role's unclear (why am i reporting to hr?) and company is trying scale too fast. it's a chaotic mess. yet, within chaos lives opportunity. growth. more importantly that the job, i have a son now. we didn't know it a year ago, sitting in that airport, annoyed by the delays, but passing the time laughing together while people-watching, but our son was with us then. in between drinks at a dive bar a few nights earlier, my wife had mentioned her period was late. it had been late before, so we didn't let ourselves assume anything, especially since the last time had ended in loss.

i'm now writing this sitting on a bench, watching our napping four month old. he was up late last night, in the midst of a sleep regression, red-faced crying and throwing up, a staple of his life thus far. we're tired, like all new parents, and the apartment is too small for a new kid and a new job, yet. this is what we wished for. the poetry is not lost. the seasons of our lives rhyme in odd ways and i am beyond grateful.`,
  },
];
