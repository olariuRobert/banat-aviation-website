// Document categories, in the order they appear on /documente/.
// The admin page's category dropdown is generated from this list (see src/pages/admin/config.yml.ts).
// Changing an `id` orphans documents that already use it, so only rename the label.
export const categories = [
  {
    id: 'organizare',
    label: 'Organizare și funcționare',
    hint: 'ROF, regulament intern, organigramă, cod de etică',
  },
  {
    id: 'management',
    label: 'Documente manageriale',
    hint: 'Proiectul de dezvoltare instituțională (PDI), plan managerial',
  },
  {
    id: 'oferta-admitere',
    label: 'Ofertă educațională și admitere',
    hint: 'Oferta educațională, calendarul și metodologia admiterii',
  },
  {
    id: 'consiliul-de-administratie',
    label: 'Consiliul de administrație',
    hint: 'Hotărâri și componența consiliului',
  },
  {
    id: 'calitate',
    label: 'Calitate și rapoarte',
    hint: 'CEAC, raportul anual de evaluare internă, rapoarte de activitate',
  },
  {
    id: 'examene',
    label: 'Examene și certificare',
    hint: 'Bacalaureat, examene de certificare a calificării profesionale',
  },
  {
    id: 'autorizari',
    label: 'Autorizări și acreditări',
    hint: 'ARACIP, AACR, aprobări Part-147',
  },
  {
    id: 'anunturi',
    label: 'Anunțuri și concursuri',
    hint: 'Posturi vacante, concursuri, anunțuri oficiale',
  },
  {
    id: 'gdpr',
    label: 'Protecția datelor (GDPR)',
    hint: 'Informări privind prelucrarea datelor cu caracter personal',
  },
  {
    id: 'altele',
    label: 'Alte documente',
    hint: '',
  },
] as const;

export type Category = (typeof categories)[number];
export type CategoryId = Category['id'];

export const categoryIds = categories.map((category) => category.id) as [CategoryId, ...CategoryId[]];

export function getCategory(id: CategoryId): Category {
  return categories.find((category) => category.id === id)!;
}
