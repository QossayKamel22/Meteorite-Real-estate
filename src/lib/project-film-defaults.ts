import type { ProjectFilm } from "./project-film-shared.ts";

const MB_POSTER = "/brand/binghatti/night-skyline.jpg";
const OFFERS = "/brand/binghatti/offers/";

/**
 * The two films shown until an admin edits the list (Admin > Homepage > Project films).
 * 1) Mercedes-Benz Places | Binghatti City — text and renders from the developer's brochure.
 * 2) Binghatti Offers — the six offer sheets supplied by the team (images carry their own
 *    figures; no prices are re-typed here so they can't drift from the sheets).
 */
export const DEFAULT_FILMS: ProjectFilm[] = [
  {
    id: "mercedes-benz-places",
    visible: true,
    shape: "landscape",
    kicker: "Project Film",
    title: "Mercedes-Benz Places | Binghatti City",
    location: "Nad Al Sheba, Dubai",
    description:
      "The world's first Mercedes-Benz branded city: a masterplanned community of twelve sculpted towers where global brand prestige becomes a personal, lived-in experience — set in Nad Al Sheba, at the junction of Dubai's drive and artistry, beside the Meydan Racecourse.",
    facts: [
      { value: "12", label: "Towers" },
      { value: "12", label: "Park experiences" },
      { value: "Nad Al Sheba", label: "Location" },
      { value: "Binghatti", label: "Developer" },
    ],
    // A 720p copy of the Drive film (134 s, 15 MB) served with the site, so it starts instantly and never hits Drive limits.
    videoUrl: "/brand/binghatti/mercedes-city.mp4",
    poster: MB_POSTER,
    images: [
      { src: "/brand/binghatti/pool-aerial.jpg", alt: "Aerial view of the Grand Promenade pool terrace", ratio: 1.393 },
      { src: "/brand/binghatti/sunset-towers.jpg", alt: "The towers and park at sunset", ratio: 0.698 },
      { src: "/brand/binghatti/night-avenue.jpg", alt: "The tallest tower and the avenue at night", ratio: 1.393 },
      { src: "/brand/binghatti/lakeside.jpg", alt: "Towers rising above the lakeside", ratio: 0.698 },
      { src: "/brand/binghatti/promenade.jpg", alt: "The promenade and the star-crowned tower by day", ratio: 1.199 },
      { src: "/brand/binghatti/towers-night.jpg", alt: "Illuminated towers on the arrival drive", ratio: 0.7 },
    ],
  },
  {
    id: "binghatti-offers",
    visible: true,
    shape: "portrait",
    kicker: "Project Film",
    title: "Binghatti Offers",
    location: "Nad Al Sheba · Al Jaddaf · JVC · Motor City · JVT",
    description:
      "A look at the Binghatti launches and ready homes we are offering right now — from Mercedes-Benz Places Phase 1 in Nad Al Sheba to Starlight and Ivory, Etherea, Skyter Races, Luxuria and ready three-bedroom residences. Swipe through the offer sheets, or contact us for current availability and payment plans.",
    facts: [
      { value: "6", label: "Offer sheets" },
      { value: "5", label: "Dubai communities" },
      { value: "Binghatti", label: "Developer" },
    ],
    videoUrl: "https://drive.google.com/file/d/12E_FyDnZ1duO1P4tsq-yxm9rZA0n6YMy/view?usp=sharing",
    poster: `${OFFERS}offer-2.jpg`,
    images: [
      { src: `${OFFERS}offer-1.jpg`, alt: "Mercedes-Benz Places Phase 1 offer sheet", ratio: 0.679 },
      { src: `${OFFERS}offer-2.jpg`, alt: "Starlight and Ivory, Al Jaddaf offer sheet", ratio: 1.5 },
      { src: `${OFFERS}offer-3.jpg`, alt: "Etherea, JVC offer sheet", ratio: 1 },
      { src: `${OFFERS}offer-4.jpg`, alt: "Skyter Races, Motor City offer sheet", ratio: 1.5 },
      { src: `${OFFERS}offer-5.jpg`, alt: "Luxuria, JVT offer sheet", ratio: 0.914 },
      { src: `${OFFERS}offer-6.jpg`, alt: "Ready three-bedroom residences offer sheet", ratio: 1 },
    ],
  },
];

