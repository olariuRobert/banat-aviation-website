// Site-wide details. Empty contact fields are simply not shown on the site,
// so fill them in whenever they are available.
export const site = {
  name: 'Liceul Tehnologic „Max Ausnit” Caransebeș',
  shortName: 'Liceul „Max Ausnit”',
  description:
    'Primul liceu privat de aviație din România, pe aeroportul din Caransebeș. Pregătim tehnicieni pentru întreținerea aeronavelor.',
  url: 'https://banataviation.ro',
  /** GitHub repository the admin page (Sveltia CMS) commits documents to. */
  repo: 'olariuRobert/banat-aviation-website',
  contact: {
    address: 'Banat Airport, Caransebeș, jud. Caraș-Severin',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Aeroportul+Caransebe%C8%99',
    phone: '',
    email: '',
    hours: '',
  },
};

export const nav = [
  { href: '/#despre', label: 'Despre' },
  { href: '/#ce-inveti', label: 'Ce înveți' },
  { href: '/#admitere', label: 'Admitere' },
  { href: '/documente/', label: 'Documente' },
  { href: '/#contact', label: 'Contact' },
];
