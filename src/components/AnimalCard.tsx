import { useEffect, useState } from "react";
import { X, Navigation } from "lucide-react";
import type { Animal } from "@/data/animals";
import { type Language, getAnimalName } from "@/data/animals";
import { THEMES, type UITheme } from "./ZooMap";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  animal: Animal;
  language: Language;
  onClose: () => void;
  onRoute: (animal: Animal) => void;
  uiTheme: UITheme;
}

// ─── Conservation status ─────────────────────────────────────────────────────

const CONSERVATION_LABELS: Record<string, Record<Language, { label: string; color: string; bg: string }>> = {
  LC: {
    en: { label: "Least Concern",         color: "hsl(140,55%,30%)", bg: "hsl(140,55%,93%)" },
    ua: { label: "Найменший ризик",       color: "hsl(140,55%,30%)", bg: "hsl(140,55%,93%)" },
    de: { label: "Nicht gefährdet",       color: "hsl(140,55%,30%)", bg: "hsl(140,55%,93%)" },
    es: { label: "Preocupación menor",    color: "hsl(140,55%,30%)", bg: "hsl(140,55%,93%)" },
    pl: { label: "Najmniejszej troski",   color: "hsl(140,55%,30%)", bg: "hsl(140,55%,93%)" },
  },
  NT: {
    en: { label: "Near Threatened",       color: "hsl(80,50%,30%)", bg: "hsl(80,50%,92%)" },
    ua: { label: "Близький до загрози",   color: "hsl(80,50%,30%)", bg: "hsl(80,50%,92%)" },
    de: { label: "Vorwarnliste",          color: "hsl(80,50%,30%)", bg: "hsl(80,50%,92%)" },
    es: { label: "Casi amenazado",        color: "hsl(80,50%,30%)", bg: "hsl(80,50%,92%)" },
    pl: { label: "Bliski zagrożenia",     color: "hsl(80,50%,30%)", bg: "hsl(80,50%,92%)" },
  },
  VU: {
    en: { label: "Vulnerable",            color: "hsl(38,80%,30%)", bg: "hsl(38,80%,92%)" },
    ua: { label: "Вразливий",             color: "hsl(38,80%,30%)", bg: "hsl(38,80%,92%)" },
    de: { label: "Gefährdet",             color: "hsl(38,80%,30%)", bg: "hsl(38,80%,92%)" },
    es: { label: "Vulnerable",            color: "hsl(38,80%,30%)", bg: "hsl(38,80%,92%)" },
    pl: { label: "Narażony",              color: "hsl(38,80%,30%)", bg: "hsl(38,80%,92%)" },
  },
  EN: {
    en: { label: "Endangered",            color: "hsl(20,80%,32%)", bg: "hsl(20,80%,93%)" },
    ua: { label: "Під загрозою",          color: "hsl(20,80%,32%)", bg: "hsl(20,80%,93%)" },
    de: { label: "Stark gefährdet",       color: "hsl(20,80%,32%)", bg: "hsl(20,80%,93%)" },
    es: { label: "En peligro",            color: "hsl(20,80%,32%)", bg: "hsl(20,80%,93%)" },
    pl: { label: "Zagrożony",             color: "hsl(20,80%,32%)", bg: "hsl(20,80%,93%)" },
  },
  CR: {
    en: { label: "Critically Endangered", color: "hsl(0,70%,35%)",  bg: "hsl(0,70%,93%)" },
    ua: { label: "Критично",              color: "hsl(0,70%,35%)",  bg: "hsl(0,70%,93%)" },
    de: { label: "Vom Aussterben bedroht",color: "hsl(0,70%,35%)",  bg: "hsl(0,70%,93%)" },
    es: { label: "En peligro crítico",    color: "hsl(0,70%,35%)",  bg: "hsl(0,70%,93%)" },
    pl: { label: "Krytycznie zagrożony",  color: "hsl(0,70%,35%)",  bg: "hsl(0,70%,93%)" },
  },
  EW: {
    en: { label: "Extinct in the Wild",   color: "hsl(280,50%,35%)", bg: "hsl(280,50%,93%)" },
    ua: { label: "Зник у природі",        color: "hsl(280,50%,35%)", bg: "hsl(280,50%,93%)" },
    de: { label: "In der Wildnis erloschen", color: "hsl(280,50%,35%)", bg: "hsl(280,50%,93%)" },
    es: { label: "Extinto en estado silvestre", color: "hsl(280,50%,35%)", bg: "hsl(280,50%,93%)" },
    pl: { label: "Wymarły na wolności",   color: "hsl(280,50%,35%)", bg: "hsl(280,50%,93%)" },
  },
  EX: {
    en: { label: "Extinct",               color: "hsl(0,0%,25%)", bg: "hsl(0,0%,88%)" },
    ua: { label: "Вимерлий",              color: "hsl(0,0%,25%)", bg: "hsl(0,0%,88%)" },
    de: { label: "Ausgestorben",          color: "hsl(0,0%,25%)", bg: "hsl(0,0%,88%)" },
    es: { label: "Extinto",               color: "hsl(0,0%,25%)", bg: "hsl(0,0%,88%)" },
    pl: { label: "Wymarły",               color: "hsl(0,0%,25%)", bg: "hsl(0,0%,88%)" },
  },
};

// ─── Diet translations ────────────────────────────────────────────────────────

const DIET_LABELS: Record<string, Record<Language, string>> = {
  Herbivore:     { en: "Herbivore",      ua: "Травоїдна",    de: "Pflanzenfresser",  es: "Herbívoro",       pl: "Roślinożerca"   },
  Carnivore:     { en: "Carnivore",      ua: "М'ясоїдна",    de: "Fleischfresser",   es: "Carnívoro",       pl: "Mięsożerca"     },
  Omnivore:      { en: "Omnivore",       ua: "Всеїдна",      de: "Allesfresser",     es: "Omnívoro",        pl: "Wszystkożerca"  },
  Frugivore:     { en: "Frugivore",      ua: "Плодоїдна",    de: "Fruchtfresser",    es: "Frugívoro",       pl: "Owocożerca"     },
  Scavenger:     { en: "Scavenger",      ua: "Падальник",    de: "Aasfresser",       es: "Carroñero",       pl: "Padlinożerca"   },
  Insectivore:   { en: "Insectivore",    ua: "Комахоїдна",   de: "Insektenfresser",  es: "Insectívoro",     pl: "Owadożerca"     },
  "Filter-feeder":{ en: "Filter-feeder", ua: "Фільтратор",   de: "Filtrierer",       es: "Filtrador",       pl: "Filtrujący"     },
};

// ─── UI labels ───────────────────────────────────────────────────────────────

const UI: Record<Language, { weight: string; lifespan: string; region: string; route: string }> = {
  en: { weight: "Weight",  lifespan: "Lifespan", region: "Region", route: "Route"     },
  ua: { weight: "Вага",    lifespan: "Живе",     region: "Регіон", route: "Маршрут"   },
  de: { weight: "Gewicht", lifespan: "Lebenszeit",region: "Region", route: "Route"    },
  es: { weight: "Peso",    lifespan: "Vida",     region: "Región", route: "Ruta"      },
  pl: { weight: "Waga",    lifespan: "Życie",    region: "Region", route: "Trasa"     },
};

// ─── Animal facts ─────────────────────────────────────────────────────────────

interface Fact {
  weight:   Record<Language, string>;
  lifespan: Record<Language, string>;
  region:   Record<Language, string>;
  funFact:  Record<Language, string>;
}

const ANIMAL_FACTS: Record<number, Fact> = {
  1: {
    weight:   { en: "up to 90 kg",      ua: "до 90 кг",        de: "bis 90 kg",         es: "hasta 90 kg",       pl: "do 90 kg"          },
    lifespan: { en: "12–18 years",      ua: "12–18 р.",         de: "12–18 Jahre",        es: "12–18 años",        pl: "12–18 lat"          },
    region:   { en: "Australia",        ua: "Австралія",        de: "Australien",         es: "Australia",         pl: "Australia"          },
    funFact:  { en: "Jumps up to 9 m in a single leap", ua: "Стрибає до 9 м за один стрибок", de: "Springt bis zu 9 m in einem Satz", es: "Salta hasta 9 m de un solo salto", pl: "Skacze do 9 m w jednym skoku" },
  },
  2: {
    weight:   { en: "0.6–0.97 kg",      ua: "0.6–0.97 кг",     de: "0,6–0,97 kg",        es: "0,6–0,97 kg",       pl: "0,6–0,97 kg"        },
    lifespan: { en: "12–14 years",      ua: "12–14 р.",         de: "12–14 Jahre",        es: "12–14 años",        pl: "12–14 lat"          },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Takes turns as lookout to guard the group", ua: "Чергує «вартових» для захисту групи", de: "Wechseln sich als Wächter ab", es: "Se turnan como vigías para proteger al grupo", pl: "Na zmianę pełnią wartę, chroniąc grupę" },
  },
  3: {
    weight:   { en: "220–340 kg",       ua: "220–340 кг",       de: "220–340 kg",         es: "220–340 kg",        pl: "220–340 kg"         },
    lifespan: { en: "25 years",         ua: "25 р.",             de: "25 Jahre",           es: "25 años",           pl: "25 lat"             },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Stripes are unique like fingerprints", ua: "Смуги унікальні, як відбитки пальців", de: "Streifen sind einzigartig wie Fingerabdrücke", es: "Las rayas son únicas como las huellas dactilares", pl: "Pasy są unikalne jak odciski palców" },
  },
  4: {
    weight:   { en: "up to 900 g",      ua: "до 900 г",         de: "bis 900 g",          es: "hasta 900 g",       pl: "do 900 g"           },
    lifespan: { en: "up to 50 years",   ua: "до 50 р.",          de: "bis 50 Jahre",       es: "hasta 50 años",     pl: "do 50 lat"          },
    region:   { en: "Bolivia",          ua: "Болівія",           de: "Bolivien",           es: "Bolivia",           pl: "Boliwia"            },
    funFact:  { en: "One of the rarest parrots in the world", ua: "Один із найрідкісніших папуг світу", de: "Einer der seltensten Papageien der Welt", es: "Uno de los loros más raros del mundo", pl: "Jedna z najrzadszych papug na świecie" },
  },
  5: {
    weight:   { en: "up to 270 kg",     ua: "до 270 кг",        de: "bis 270 kg",         es: "hasta 270 kg",      pl: "do 270 kg"          },
    lifespan: { en: "20 years",         ua: "20 р.",             de: "20 Jahre",           es: "20 años",           pl: "20 lat"             },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Migrates in herds of up to 1.5 million", ua: "Мігрує зграями до 1.5 млн особин", de: "Wandert in Herden von bis zu 1,5 Mio.", es: "Migra en manadas de hasta 1,5 millones", pl: "Migruje w stadach do 1,5 mln osobników" },
  },
  6: {
    weight:   { en: "up to 600 g",      ua: "до 600 г",         de: "bis 600 g",          es: "hasta 600 g",       pl: "do 600 g"           },
    lifespan: { en: "up to 50 years",   ua: "до 50 р.",          de: "bis 50 Jahre",       es: "hasta 50 años",     pl: "do 50 lat"          },
    region:   { en: "Bolivia",          ua: "Болівія",           de: "Bolivien",           es: "Bolivia",           pl: "Boliwia"            },
    funFact:  { en: "Fewer than 250 birds remain in the wild", ua: "Менше 250 птахів залишилось у природі", de: "Weniger als 250 Vögel in der Wildnis", es: "Menos de 250 aves quedan en libertad", pl: "Mniej niż 250 ptaków pozostało na wolności" },
  },
  7: {
    weight:   { en: "up to 50 kg",      ua: "до 50 кг",         de: "bis 50 kg",          es: "hasta 50 kg",       pl: "do 50 kg"           },
    lifespan: { en: "28 years",         ua: "28 р.",             de: "28 Jahre",           es: "28 años",           pl: "28 lat"             },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "Threatened mainly due to poaching", ua: "Під загрозою через полювання", de: "Bedroht vor allem durch Wilderei", es: "Amenazado principalmente por la caza furtiva", pl: "Zagrożony głównie z powodu kłusownictwa" },
  },
  8: {
    weight:   { en: "6–9 kg",           ua: "6–9 кг",           de: "6–9 kg",             es: "6–9 kg",            pl: "6–9 kg"             },
    lifespan: { en: "25 years",         ua: "25 р.",             de: "25 Jahre",           es: "25 años",           pl: "25 lat"             },
    region:   { en: "Central America",  ua: "Центр. Америка",   de: "Mittelamerika",      es: "América Central",   pl: "Ameryka Środkowa"   },
    funFact:  { en: "The tail acts as a fifth limb", ua: "Хвіст слугує п'ятою кінцівкою", de: "Der Schwanz dient als fünfte Extremität", es: "La cola actúa como un quinto miembro", pl: "Ogon działa jak piąta kończyna" },
  },
  9: {
    weight:   { en: "40–140 kg",        ua: "40–140 кг",        de: "40–140 kg",          es: "40–140 kg",         pl: "40–140 kg"          },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "North Africa",     ua: "Пн. Африка",       de: "Nordafrika",         es: "Norte de África",   pl: "Afryka Północna"    },
    funFact:  { en: "The only wild sheep native to Africa", ua: "Єдина дика вівця Африки", de: "Das einzige wilde Schaf Afrikas", es: "La única oveja salvaje originaria de África", pl: "Jedyna dzika owca rodzima dla Afryki" },
  },
  10: {
    weight:   { en: "up to 4.5 kg",     ua: "до 4.5 кг",        de: "bis 4,5 kg",         es: "hasta 4,5 kg",      pl: "do 4,5 kg"          },
    lifespan: { en: "up to 100 years",  ua: "до 100 р.",         de: "bis 100 Jahre",      es: "hasta 100 años",    pl: "do 100 lat"         },
    region:   { en: "Mediterranean",    ua: "Середземномор'я",  de: "Mittelmeer",         es: "Mediterráneo",      pl: "Morze Śródziemne"   },
    funFact:  { en: "Hibernates underground for 4–5 months", ua: "Зимує під землею 4–5 місяців", de: "Hält 4–5 Monate Winterschlaf unter der Erde", es: "Hiberna bajo tierra 4–5 meses", pl: "Hibernuje pod ziemią przez 4–5 miesięcy" },
  },
  11: {
    weight:   { en: "up to 50 kg",      ua: "до 50 кг",         de: "bis 50 kg",          es: "hasta 50 kg",       pl: "do 50 kg"           },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Western Asia",     ua: "Зах. Азія",        de: "Westasien",          es: "Asia occidental",   pl: "Azja Zachodnia"     },
    funFact:  { en: "Ancestor of domestic sheep", ua: "Предок домашньої вівці", de: "Vorfahre des Hausschafs", es: "Antepasado de la oveja doméstica", pl: "Przodek owcy domowej" },
  },
  12: {
    weight:   { en: "up to 2.2 kg",     ua: "до 2.2 кг",        de: "bis 2,2 kg",         es: "hasta 2,2 kg",      pl: "do 2,2 kg"          },
    lifespan: { en: "up to 37 years",   ua: "до 37 р.",          de: "bis 37 Jahre",       es: "hasta 37 años",     pl: "do 37 lat"          },
    region:   { en: "South Asia / Africa", ua: "Пд. Азія / Африка", de: "Südasien / Afrika", es: "Asia meridional / África", pl: "Azja Pd. / Afryka" },
    funFact:  { en: "Uses sticks as tools", ua: "Використовує гілки як інструменти", de: "Benutzt Stöcke als Werkzeug", es: "Usa palos como herramientas", pl: "Używa gałązek jako narzędzi" },
  },
  13: {
    weight:   { en: "up to 1.1 kg",     ua: "до 1.1 кг",        de: "bis 1,1 kg",         es: "hasta 1,1 kg",      pl: "do 1,1 kg"          },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "All continents",   ua: "Усі континенти",   de: "Alle Kontinente",    es: "Todos los continentes", pl: "Wszystkie kontynenty" },
    funFact:  { en: "Hunts at night using excellent eyesight", ua: "Полює вночі завдяки гострому зору", de: "Jagt nachts mit ausgezeichnetem Sehvermögen", es: "Caza de noche con una vista excelente", pl: "Poluje nocą dzięki doskonałemu wzrokowi" },
  },
  14: {
    weight:   { en: "up to 4.4 kg",     ua: "до 4.4 кг",        de: "bis 4,4 kg",         es: "hasta 4,4 kg",      pl: "do 4,4 kg"          },
    lifespan: { en: "up to 35 years",   ua: "до 35 р.",          de: "bis 35 Jahre",       es: "hasta 35 años",     pl: "do 35 lat"          },
    region:   { en: "Eurasia / Africa", ua: "Євразія / Африка", de: "Eurasien / Afrika",  es: "Eurasia / África",  pl: "Eurazja / Afryka"   },
    funFact:  { en: "Migrates up to 20,000 km each year", ua: "Щороку мігрує до 20 000 км", de: "Wandert jährlich bis zu 20.000 km", es: "Migra hasta 20.000 km cada año", pl: "Migruje do 20 000 km rocznie" },
  },
  15: {
    weight:   { en: "up to 10 kg",      ua: "до 10 кг",         de: "bis 10 kg",          es: "hasta 10 kg",       pl: "do 10 kg"           },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "Western Eurasia",  ua: "Зах. Євразія",     de: "Westeurasien",       es: "Eurasia occidental",pl: "Zachodnia Eurazja"  },
    funFact:  { en: "Wingspan reaches 2.8 m", ua: "Ширина крил досягає 2.8 м", de: "Flügelspannweite erreicht 2,8 m", es: "La envergadura alcanza 2,8 m", pl: "Rozpiętość skrzydeł sięga 2,8 m" },
  },
  16: {
    weight:   { en: "up to 1.2 kg",     ua: "до 1.2 кг",        de: "bis 1,2 kg",         es: "hasta 1,2 kg",      pl: "do 1,2 kg"          },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Southeast Asia",   ua: "Пд.-Сх. Азія",     de: "Südostasien",        es: "Sudeste asiático",  pl: "Azja Południowo-Wschodnia" },
    funFact:  { en: "Key seed disperser of tropical trees", ua: "Головний поширювач насіння тропічних дерев", de: "Wichtiger Samenverbreiter tropischer Bäume", es: "Dispersor clave de semillas de árboles tropicales", pl: "Kluczowy rozsiewacz nasion drzew tropikalnych" },
  },
  17: {
    weight:   { en: "up to 1.5 kg",     ua: "до 1.5 кг",        de: "bis 1,5 kg",         es: "hasta 1,5 kg",      pl: "do 1,5 kg"          },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Africa / West Asia", ua: "Африка / Зах. Азія", de: "Afrika / Westasien", es: "África / Asia occidental", pl: "Afryka / Azja Zachodnia" },
    funFact:  { en: "Revered in ancient Egypt", ua: "Шанувався у Давньому Єгипті", de: "Im alten Ägypten verehrt", es: "Venerado en el antiguo Egipto", pl: "Czczony w starożytnym Egipcie" },
  },
  18: {
    weight:   { en: "up to 600 g",      ua: "до 600 г",         de: "bis 600 g",          es: "hasta 600 g",       pl: "do 600 g"           },
    lifespan: { en: "up to 12 years",   ua: "до 12 р.",          de: "bis 12 Jahre",       es: "hasta 12 años",     pl: "do 12 lat"          },
    region:   { en: "Pacific Islands",  ua: "Тихоокеанські о-ви", de: "Pazifikinseln",    es: "Islas del Pacífico", pl: "Wyspy Pacyfiku"     },
    funFact:  { en: "Closest living relative of the dodo", ua: "Найближчий живий родич дронта", de: "Nächster lebender Verwandter des Dodos", es: "Pariente vivo más cercano del dodo", pl: "Najbliższy żyjący krewny dodo" },
  },
  19: {
    weight:   { en: "up to 120 kg",     ua: "до 120 кг",        de: "bis 120 kg",         es: "hasta 120 kg",      pl: "do 120 kg"          },
    lifespan: { en: "up to 60 years",   ua: "до 60 р.",          de: "bis 60 Jahre",       es: "hasta 60 años",     pl: "do 60 lat"          },
    region:   { en: "Southeast Asia",   ua: "Пд.-Сх. Азія",     de: "Südostasien",        es: "Sudeste asiático",  pl: "Azja Pd.-Wschodnia" },
    funFact:  { en: "Fewer than 1,000 individuals left in the wild", ua: "Менше 1000 особин у дикій природі", de: "Weniger als 1.000 Tiere in der Wildnis", es: "Menos de 1.000 individuos quedan en libertad", pl: "Mniej niż 1000 osobników na wolności" },
  },
  20: {
    weight:   { en: "up to 35 kg",      ua: "до 35 кг",         de: "bis 35 kg",          es: "hasta 35 kg",       pl: "do 35 kg"           },
    lifespan: { en: "up to 17 years",   ua: "до 17 р.",          de: "bis 17 Jahre",       es: "hasta 17 años",     pl: "do 17 lat"          },
    region:   { en: "South & SE Asia",  ua: "Пд. та Пд.-Сх. Азія", de: "Süd- & Südostasien", es: "Sur y Sudeste asiático", pl: "Azja Pd. i Pd.-Wschodnia" },
    funFact:  { en: "Smallest deer — only 40–75 cm tall", ua: "Найменший олень — заввишки лише 40–75 см", de: "Kleinstes Reh — nur 40–75 cm groß", es: "El ciervo más pequeño — solo 40–75 cm de alto", pl: "Najmniejszy jeleń — tylko 40–75 cm wzrostu" },
  },
  21: {
    weight:   { en: "up to 90 kg",      ua: "до 90 кг",         de: "bis 90 kg",          es: "hasta 90 kg",       pl: "do 90 kg"           },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "Komodo Island",    ua: "о. Комодо",        de: "Komodo-Insel",       es: "Isla Komodo",       pl: "Wyspa Komodo"       },
    funFact:  { en: "The largest lizard in the world", ua: "Найбільша ящірка у світі", de: "Die größte Eidechse der Welt", es: "El lagarto más grande del mundo", pl: "Największa jaszczurka na świecie" },
  },
  22: {
    weight:   { en: "1,500–3,000 kg",   ua: "1500–3000 кг",     de: "1.500–3.000 kg",     es: "1.500–3.000 kg",    pl: "1500–3000 kg"       },
    lifespan: { en: "up to 45 years",   ua: "до 45 р.",          de: "bis 45 Jahre",       es: "hasta 45 años",     pl: "do 45 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "Spends up to 16 hours a day in water", ua: "Проводить до 16 годин на день у воді", de: "Verbringt bis zu 16 Stunden täglich im Wasser", es: "Pasa hasta 16 horas al día en el agua", pl: "Spędza do 16 godzin dziennie w wodzie" },
  },
  23: {
    weight:   { en: "up to 6,000 kg",   ua: "до 6000 кг",       de: "bis 6.000 kg",       es: "hasta 6.000 kg",    pl: "do 6000 kg"         },
    lifespan: { en: "up to 70 years",   ua: "до 70 р.",          de: "bis 70 Jahre",       es: "hasta 70 años",     pl: "do 70 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "The largest land animal on Earth", ua: "Найбільша наземна тварина планети", de: "Das größte Landtier der Erde", es: "El animal terrestre más grande del planeta", pl: "Największe zwierzę lądowe na Ziemi" },
  },
  24: {
    weight:   { en: "up to 400 kg",     ua: "до 400 кг",        de: "bis 400 kg",         es: "hasta 400 kg",      pl: "do 400 kg"          },
    lifespan: { en: "up to 170 years",  ua: "до 170 р.",         de: "bis 170 Jahre",      es: "hasta 170 años",    pl: "do 170 lat"         },
    region:   { en: "Galápagos Islands",ua: "Галапагоські о-ви", de: "Galapagos-Inseln",  es: "Islas Galápagos",   pl: "Wyspy Galapagos"    },
    funFact:  { en: "One of the longest-lived vertebrates", ua: "Один із найдовгоживучих хребетних", de: "Eines der langlebigsten Wirbeltiere", es: "Uno de los vertebrados más longevos", pl: "Jeden z najdłużej żyjących kręgowców" },
  },
  25: {
    weight:   { en: "up to 250 kg",     ua: "до 250 кг",        de: "bis 250 kg",         es: "hasta 250 kg",      pl: "do 250 kg"          },
    lifespan: { en: "up to 150 years",  ua: "до 150 р.",         de: "bis 150 Jahre",      es: "hasta 150 años",    pl: "do 150 lat"         },
    region:   { en: "Aldabra Atoll",    ua: "о. Альдабра",      de: "Aldabra-Atoll",      es: "Atolón Aldabra",    pl: "Atol Aldabra"       },
    funFact:  { en: "Can survive weeks without food or water", ua: "Може жити без їжі та води тижнями", de: "Überlebt wochenlang ohne Futter und Wasser", es: "Puede sobrevivir semanas sin comida ni agua", pl: "Przeżywa tygodnie bez jedzenia i wody" },
  },
  26: {
    weight:   { en: "up to 480 kg",     ua: "до 480 кг",        de: "bis 480 kg",         es: "hasta 480 kg",      pl: "do 480 kg"          },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "Eurasia / North America", ua: "Євразія / Пн. Америка", de: "Eurasien / Nordamerika", es: "Eurasia / América del Norte", pl: "Eurazja / Ameryka Północna" },
    funFact:  { en: "Can go without food for 7 months in winter", ua: "Взимку може не їсти до 7 місяців", de: "Kann im Winter 7 Monate ohne Nahrung auskommen", es: "Puede pasar 7 meses sin comer en invierno", pl: "Zimą może nie jeść przez 7 miesięcy" },
  },
  27: {
    weight:   { en: "up to 150 kg",     ua: "до 150 кг",        de: "bis 150 kg",         es: "hasta 150 kg",      pl: "do 150 kg"          },
    lifespan: { en: "up to 18 years",   ua: "до 18 р.",          de: "bis 18 Jahre",       es: "hasta 18 años",     pl: "do 18 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "Runs backwards faster than most run forward", ua: "Бігає заднім ходом швидше ніж вперед", de: "Läuft rückwärts schneller als die meisten vorwärts", es: "Corre hacia atrás más rápido que otros hacia delante", pl: "Biega tyłem szybciej niż większość zwierząt przodem" },
  },
  28: {
    weight:   { en: "up to 6 kg",       ua: "до 6 кг",          de: "bis 6 kg",           es: "hasta 6 kg",        pl: "do 6 kg"            },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Swims faster than a world-class human swimmer", ua: "Плаває швидше за людину-чемпіона", de: "Schwimmt schneller als ein Weltklasse-Schwimmer", es: "Nada más rápido que un nadador de élite", pl: "Pływa szybciej niż czołowy pływak-człowiek" },
  },
  29: {
    weight:   { en: "up to 1.5 kg",     ua: "до 1.5 кг",        de: "bis 1,5 kg",         es: "hasta 1,5 kg",      pl: "do 1,5 kg"          },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "Mediterranean",    ua: "Середземномор'я",  de: "Mittelmeer",         es: "Mediterráneo",      pl: "Morze Śródziemne"   },
    funFact:  { en: "One of Spain's rarest turtle species", ua: "Один із найрідкісніших видів черепах Іспанії", de: "Eine der seltensten Schildkrötenarten Spaniens", es: "Una de las especies de tortuga más raras de España", pl: "Jeden z najrzadszych gatunków żółwi Hiszpanii" },
  },
  30: {
    weight:   { en: "up to 4 kg",       ua: "до 4 кг",          de: "bis 4 kg",           es: "hasta 4 kg",        pl: "do 4 kg"            },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "Caribbean",        ua: "Карибський басейн", de: "Karibik",           es: "Caribe",            pl: "Karaiby"            },
    funFact:  { en: "Pink colour comes from pigments in shrimp", ua: "Рожевий колір від пігментів у рачках", de: "Rosa Farbe stammt von Farbstoffen aus Garnelen", es: "El color rosado proviene de pigmentos de camarones", pl: "Różowy kolor pochodzi z pigmentów w krewetkach" },
  },
  31: {
    weight:   { en: "up to 1,200 kg",   ua: "до 1200 кг",       de: "bis 1.200 kg",       es: "hasta 1.200 kg",    pl: "do 1200 kg"         },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "East Africa",      ua: "Сх. Африка",       de: "Ostafrika",          es: "África oriental",   pl: "Afryka Wschodnia"   },
    funFact:  { en: "Up to 6 m tall — the world's tallest animal", ua: "Висота до 6 м — найвища тварина світу", de: "Bis 6 m hoch — das größte Tier der Welt", es: "Hasta 6 m de alto — el animal más alto del mundo", pl: "Do 6 m wzrostu — najwyższe zwierzę świata" },
  },
  32: {
    weight:   { en: "up to 2.5 kg",     ua: "до 2.5 кг",        de: "bis 2,5 kg",         es: "hasta 2,5 kg",      pl: "do 2,5 kg"          },
    lifespan: { en: "up to 17 years",   ua: "до 17 р.",          de: "bis 17 Jahre",       es: "hasta 17 años",     pl: "do 17 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "Lives in social groups of up to 70 individuals", ua: "Живе соціальними групами до 70 особин", de: "Lebt in sozialen Gruppen von bis zu 70 Tieren", es: "Vive en grupos sociales de hasta 70 individuos", pl: "Żyje w grupach społecznych do 70 osobników" },
  },
  33: {
    weight:   { en: "up to 1.25 kg",    ua: "до 1.25 кг",       de: "bis 1,25 kg",        es: "hasta 1,25 kg",     pl: "do 1,25 kg"         },
    lifespan: { en: "up to 35 years",   ua: "до 35 р.",          de: "bis 35 Jahre",       es: "hasta 35 años",     pl: "do 35 lat"          },
    region:   { en: "Central & South America", ua: "Центр. та Пд. Америка", de: "Mittel- & Südamerika", es: "América Central y del Sur", pl: "Ameryka Środkowa i Pd." },
    funFact:  { en: "360° field of vision — sees all around", ua: "Поле зору 360° — бачить по колу", de: "360°-Sichtfeld — sieht rundum", es: "Campo de visión de 360° — ve en todas direcciones", pl: "Pole widzenia 360° — widzi dookoła" },
  },
  34: {
    weight:   { en: "up to 390 kg",     ua: "до 390 кг",        de: "bis 390 kg",         es: "hasta 390 kg",      pl: "do 390 kg"          },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "Pacific Coast",    ua: "Тихоокеан. узбережжя", de: "Pazifikküste",  es: "Costa del Pacífico", pl: "Wybrzeże Pacyfiku"  },
    funFact:  { en: "Dives to depths of up to 300 m", ua: "Пірнає на глибину до 300 м", de: "Taucht bis zu 300 m tief", es: "Bucea hasta 300 m de profundidad", pl: "Nurkuje na głębokość do 300 m" },
  },
  35: {
    weight:   { en: "68–227 kg",        ua: "68–227 кг",        de: "68–227 kg",          es: "68–227 kg",         pl: "68–227 kg"          },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "Shares 98.3% of DNA with humans", ua: "ДНК збігається з людським на 98.3%", de: "98,3 % der DNA mit dem Menschen identisch", es: "Comparte el 98,3 % del ADN con los humanos", pl: "Dzieli 98,3% DNA z człowiekiem" },
  },
  36: {
    weight:   { en: "up to 3.5 kg",     ua: "до 3.5 кг",        de: "bis 3,5 kg",         es: "hasta 3,5 kg",      pl: "do 3,5 kg"          },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Madagascar",       ua: "Мадагаскар",       de: "Madagaskar",         es: "Madagascar",        pl: "Madagaskar"         },
    funFact:  { en: "Communicates by scent — has 15 scent glands", ua: "Спілкується запахом — має 15 залоз", de: "Kommuniziert über Duft — hat 15 Drüsen", es: "Se comunica por olor — tiene 15 glándulas", pl: "Komunikuje się zapachem — ma 15 gruczołów" },
  },
  37: {
    weight:   { en: "up to 70 kg",      ua: "до 70 кг",         de: "bis 70 kg",          es: "hasta 70 kg",       pl: "do 70 kg"           },
    lifespan: { en: "up to 50 years",   ua: "до 50 р.",          de: "bis 50 Jahre",       es: "hasta 50 años",     pl: "do 50 lat"          },
    region:   { en: "West & Central Africa", ua: "Зах. і Центр. Африка", de: "West- & Zentralafrika", es: "África occidental y central", pl: "Afryka Zachodnia i Środkowa" },
    funFact:  { en: "Uses tools and can learn sign language", ua: "Використовує інструменти і вчиться знаковій мові", de: "Benutzt Werkzeuge und kann Zeichensprache lernen", es: "Usa herramientas y puede aprender lenguaje de señas", pl: "Używa narzędzi i może uczyć się języka migowego" },
  },
  38: {
    weight:   { en: "up to 26 kg",      ua: "до 26 кг",         de: "bis 26 kg",          es: "hasta 26 kg",       pl: "do 26 kg"           },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "One of Africa's rarest primates", ua: "Один з найрідкісніших приматів Африки", de: "Einer der seltensten Primaten Afrikas", es: "Uno de los primates más raros de África", pl: "Jeden z najrzadszych naczelnych Afryki" },
  },
  39: {
    weight:   { en: "up to 15 kg",      ua: "до 15 кг",         de: "bis 15 kg",          es: "hasta 15 kg",       pl: "do 15 kg"           },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Eurasia / South Asia", ua: "Євразія / Пд. Азія", de: "Eurasien / Südasien", es: "Eurasia / Asia meridional", pl: "Eurazja / Azja Południowa" },
    funFact:  { en: "Wingspan up to 3.45 m — largest among pelicans", ua: "Розмах крил до 3.45 м — рекорд серед пеліканів", de: "Flügelspannweite bis 3,45 m — größter Pelikan", es: "Envergadura hasta 3,45 m — mayor entre los pelícanos", pl: "Rozpiętość skrzydeł do 3,45 m — rekord wśród pelikanów" },
  },
  40: {
    weight:   { en: "up to 100 kg",     ua: "до 100 кг",        de: "bis 100 kg",         es: "hasta 100 kg",      pl: "do 100 kg"          },
    lifespan: { en: "up to 45 years",   ua: "до 45 р.",          de: "bis 45 Jahre",       es: "hasta 45 años",     pl: "do 45 lat"          },
    region:   { en: "Borneo",           ua: "о. Борнео",        de: "Borneo",             es: "Borneo",            pl: "Borneo"             },
    funFact:  { en: "Builds a new nest in the trees every night", ua: "Будує нові гнізда на деревах щоночі", de: "Baut jede Nacht ein neues Nest in den Bäumen", es: "Construye un nido nuevo en los árboles cada noche", pl: "Buduje nowe gniazdo na drzewie każdej nocy" },
  },
  41: {
    weight:   { en: "up to 80 kg",      ua: "до 80 кг",         de: "bis 80 kg",          es: "hasta 80 kg",       pl: "do 80 kg"           },
    lifespan: { en: "up to 16 years",   ua: "до 16 р.",          de: "bis 16 Jahre",       es: "hasta 16 años",     pl: "do 16 lat"          },
    region:   { en: "Iberian Peninsula",ua: "Піренейський п-ів", de: "Iberische Halbinsel",es: "Península ibérica", pl: "Półwysep Iberyjski" },
    funFact:  { en: "Unique subspecies distinct from all other wolves", ua: "Унікальний підвид — відрізняється від решти вовків", de: "Einzigartiger Unterart, verschieden von allen anderen Wölfen", es: "Subespecie única, diferente de todos los demás lobos", pl: "Unikalny podgatunek różniący się od innych wilków" },
  },
  42: {
    weight:   { en: "up to 405 kg",     ua: "до 405 кг",        de: "bis 405 kg",         es: "hasta 405 kg",      pl: "do 405 kg"          },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "East Africa",      ua: "Сх. Африка",       de: "Ostafrika",          es: "África oriental",   pl: "Afryka Wschodnia"   },
    funFact:  { en: "Fewer than 100 individuals remain in the wild", ua: "Менше 100 особин залишилось у природі", de: "Weniger als 100 Tiere in der Wildnis übrig", es: "Menos de 100 individuos quedan en libertad", pl: "Mniej niż 100 osobników pozostało na wolności" },
  },
  43: {
    weight:   { en: "up to 50 g",       ua: "до 50 г",          de: "bis 50 g",           es: "hasta 50 g",        pl: "do 50 g"            },
    lifespan: { en: "up to 10 years",   ua: "до 10 р.",          de: "bis 10 Jahre",       es: "hasta 10 años",     pl: "do 10 lat"          },
    region:   { en: "Eurasia / Africa", ua: "Євразія / Африка", de: "Eurasien / Afrika",  es: "Eurasia / África",  pl: "Eurazja / Afryka"   },
    funFact:  { en: "Attacks prey much larger than itself", ua: "Накидається на здобич більшу за себе", de: "Greift Beute an, die viel größer ist als es selbst", es: "Ataca presas mucho más grandes que él", pl: "Atakuje ofiary znacznie większe od siebie" },
  },
  44: {
    weight:   { en: "up to 190 g",      ua: "до 190 г",         de: "bis 190 g",          es: "hasta 190 g",       pl: "do 190 g"           },
    lifespan: { en: "up to 12 years",   ua: "до 12 р.",          de: "bis 12 Jahre",       es: "hasta 12 años",     pl: "do 12 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Winters in Africa, 10,000 km from home", ua: "Зимує в Африці за 10 000 км від дому", de: "Überwintert in Afrika, 10.000 km entfernt", es: "Pasa el invierno en África, a 10.000 km de casa", pl: "Zimuje w Afryce, 10 000 km od domu" },
  },
  45: {
    weight:   { en: "up to 1.1 kg",     ua: "до 1.1 кг",        de: "bis 1,1 kg",         es: "hasta 1,1 kg",      pl: "do 1,1 kg"          },
    lifespan: { en: "up to 22 years",   ua: "до 22 р.",          de: "bis 22 Jahre",       es: "hasta 22 años",     pl: "do 22 lat"          },
    region:   { en: "Eurasia / Africa", ua: "Євразія / Африка", de: "Eurasien / Afrika",  es: "Eurasia / África",  pl: "Eurazja / Afryka"   },
    funFact:  { en: "Bright plumage used to attract a mate", ua: "Яскраве оперення для приваблення партнера", de: "Buntes Gefieder zur Partnergewinnung", es: "Plumaje brillante para atraer pareja", pl: "Jaskrawe upierzenie do przyciągania partnera" },
  },
  46: {
    weight:   { en: "up to 4.5 kg",     ua: "до 4.5 кг",        de: "bis 4,5 kg",         es: "hasta 4,5 kg",      pl: "do 4,5 kg"          },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Migrates in flocks of up to 10,000 birds", ua: "Мігрує групами до 10 000 птахів", de: "Zieht in Schwärmen von bis zu 10.000 Vögeln", es: "Migra en bandadas de hasta 10.000 aves", pl: "Migruje w stadach do 10 000 ptaków" },
  },
  47: {
    weight:   { en: "up to 120 kg",     ua: "до 120 кг",        de: "bis 120 kg",         es: "hasta 120 kg",      pl: "do 120 kg"          },
    lifespan: { en: "up to 28 years",   ua: "до 28 р.",          de: "bis 28 Jahre",       es: "hasta 28 años",     pl: "do 28 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Ancestor of the domestic llama", ua: "Предок домашньої лами", de: "Vorfahre des Hausllamas", es: "Antepasado de la llama doméstica", pl: "Przodek lamy domowej" },
  },
  48: {
    weight:   { en: "up to 6.2 kg",     ua: "до 6.2 кг",        de: "bis 6,2 kg",         es: "hasta 6,2 kg",      pl: "do 6,2 kg"          },
    lifespan: { en: "up to 23 years",   ua: "до 23 р.",          de: "bis 23 Jahre",       es: "hasta 23 años",     pl: "do 23 lat"          },
    region:   { en: "Himalayas / China",ua: "Гімалаї / Китай",  de: "Himalaya / China",   es: "Himalaya / China",  pl: "Himalaje / Chiny"   },
    funFact:  { en: "More closely related to raccoons than to bears", ua: "Ближче до єнотів, ніж до ведмедів", de: "Näher mit Waschbären als mit Bären verwandt", es: "Más emparentado con los mapaches que con los osos", pl: "Bliżej spokrewniona z szopami niż z niedźwiedziami" },
  },
  49: {
    weight:   { en: "up to 1.4 kg",     ua: "до 1.4 кг",        de: "bis 1,4 kg",         es: "hasta 1,4 kg",      pl: "do 1,4 kg"          },
    lifespan: { en: "up to 8 years",    ua: "до 8 р.",           de: "bis 8 Jahre",        es: "hasta 8 años",      pl: "do 8 lat"           },
    region:   { en: "North America",    ua: "Пн. Америка",      de: "Nordamerika",        es: "América del Norte", pl: "Ameryka Północna"   },
    funFact:  { en: "Builds complex underground burrow towns", ua: "Будує складні підземні міста-нори", de: "Baut komplexe unterirdische Baustädte", es: "Construye complejas ciudades subterráneas de madrigueras", pl: "Buduje złożone podziemne miasta-nory" },
  },
  50: {
    weight:   { en: "up to 50 kg",      ua: "до 50 кг",         de: "bis 50 kg",          es: "hasta 50 kg",       pl: "do 50 kg"           },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Central / South America", ua: "Центр. / Пд. Америка", de: "Mittel- / Südamerika", es: "América Central / del Sur", pl: "Ameryka Środk. / Pd." },
    funFact:  { en: "Tongue up to 60 cm — longer than its head", ua: "Язик до 60 см — довший за голову", de: "Zunge bis zu 60 cm — länger als der Kopf", es: "Lengua de hasta 60 cm — más larga que su cabeza", pl: "Język do 60 cm — dłuższy niż głowa" },
  },
  51: {
    weight:   { en: "up to 272 kg",     ua: "до 272 кг",        de: "bis 272 kg",         es: "hasta 272 kg",      pl: "do 272 kg"          },
    lifespan: { en: "up to 55 years",   ua: "до 55 р.",          de: "bis 55 Jahre",       es: "hasta 55 años",     pl: "do 55 lat"          },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "Pig-sized but closely related to hippos", ua: "Розміром з кабана, але родич гіпопотама", de: "Schweingroß, aber nah mit Flusspferden verwandt", es: "Del tamaño de un cerdo pero emparentado con hipopótamos", pl: "Wielkości świni, ale blisko spokrewniona z hipopotamem" },
  },
  52: {
    weight:   { en: "up to 12 kg",      ua: "до 12 кг",         de: "bis 12 kg",          es: "hasta 12 kg",       pl: "do 12 kg"           },
    lifespan: { en: "up to 22 years",   ua: "до 22 р.",          de: "bis 22 Jahre",       es: "hasta 22 años",     pl: "do 22 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Uses a stone to crack open shellfish", ua: "Тримає камінь щоб відкривати молюски", de: "Benutzt einen Stein, um Muscheln zu öffnen", es: "Usa una piedra para abrir moluscos", pl: "Używa kamienia do otwierania mięczaków" },
  },
  53: {
    weight:   { en: "up to 300 kg",     ua: "до 300 кг",        de: "bis 300 kg",         es: "hasta 300 kg",      pl: "do 300 kg"          },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Navigates by smell rather than sight", ua: "Орієнтується нюхом, а не зором", de: "Navigiert nach Geruch statt nach Sicht", es: "Se orienta por el olfato más que por la vista", pl: "Orientuje się węchem, a nie wzrokiem" },
  },
  54: {
    weight:   { en: "up to 105 kg",     ua: "до 105 кг",        de: "bis 105 kg",         es: "hasta 105 kg",      pl: "do 105 kg"          },
    lifespan: { en: "up to 100 years",  ua: "до 100 р.",         de: "bis 100 Jahre",      es: "hasta 100 años",    pl: "do 100 lat"         },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "Third-largest tortoise in the world", ua: "Третя за розміром черепаха у світі", de: "Drittgrößte Schildkröte der Welt", es: "La tercera tortuga más grande del mundo", pl: "Trzeci co do wielkości żółw na świecie" },
  },
  55: {
    weight:   { en: "120–250 kg",       ua: "120–250 кг",       de: "120–250 kg",         es: "120–250 kg",        pl: "120–250 kg"         },
    lifespan: { en: "10–14 years",      ua: "10–14 р.",          de: "10–14 Jahre",        es: "10–14 años",        pl: "10–14 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "The only social species among the big cats", ua: "Єдиний соціальний вид серед великих котів", de: "Die einzige soziale Art unter den Großkatzen", es: "La única especie social entre los grandes felinos", pl: "Jedyny gatunek społeczny wśród wielkich kotów" },
  },
  56: {
    weight:   { en: "up to 86 kg",      ua: "до 86 кг",         de: "bis 86 kg",          es: "hasta 86 kg",       pl: "do 86 kg"           },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "Has a stronger bite than a lion", ua: "Щелепи сильніші за щелепи лева", de: "Hat einen stärkeren Biss als ein Löwe", es: "Tiene una mordida más fuerte que un león", pl: "Ma silniejszy ugryz niż lew" },
  },
  57: {
    weight:   { en: "up to 500 g",      ua: "до 500 г",         de: "bis 500 g",          es: "hasta 500 g",       pl: "do 500 g"           },
    lifespan: { en: "up to 16 years",   ua: "до 16 р.",          de: "bis 16 Jahre",       es: "hasta 16 años",     pl: "do 16 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Almost always gives birth to twins", ua: "Народжує двійнят майже щоразу", de: "Bringt fast immer Zwillinge zur Welt", es: "Casi siempre da a luz gemelos", pl: "Niemal zawsze rodzi bliźnięta" },
  },
  58: {
    weight:   { en: "up to 24 kg",      ua: "до 24 кг",         de: "bis 24 kg",          es: "hasta 24 kg",       pl: "do 24 kg"           },
    lifespan: { en: "up to 18 years",   ua: "до 18 р.",          de: "bis 18 Jahre",       es: "hasta 18 años",     pl: "do 18 lat"          },
    region:   { en: "Australia",        ua: "Австралія",        de: "Australien",         es: "Australia",         pl: "Australia"          },
    funFact:  { en: "Joey at birth is the size of a pea", ua: "Кенгуреня при народженні — розміром з горошину", de: "Das Jungtier ist bei der Geburt so groß wie eine Erbse", es: "El cría al nacer es del tamaño de un guisante", pl: "Młode przy urodzeniu jest wielkości grochu" },
  },
  59: {
    weight:   { en: "up to 20 kg",      ua: "до 20 кг",         de: "bis 20 kg",          es: "hasta 20 kg",       pl: "do 20 kg"           },
    lifespan: { en: "up to 12 years",   ua: "до 12 р.",          de: "bis 12 Jahre",       es: "hasta 12 años",     pl: "do 12 lat"          },
    region:   { en: "North Africa",     ua: "Пн. Африка",       de: "Nordafrika",         es: "Norte de África",   pl: "Afryka Północna"    },
    funFact:  { en: "Can survive for weeks without water", ua: "Здатна виживати тижнями без води", de: "Kann wochenlang ohne Wasser überleben", es: "Puede sobrevivir semanas sin agua", pl: "Potrafi przeżyć tygodnie bez wody" },
  },
  60: {
    weight:   { en: "up to 15 g",       ua: "до 15 г",          de: "bis 15 g",           es: "hasta 15 g",        pl: "do 15 g"            },
    lifespan: { en: "up to 10 years",   ua: "до 10 р.",          de: "bis 10 Jahre",       es: "hasta 10 años",     pl: "do 10 lat"          },
    region:   { en: "Spain",            ua: "Іспанія",          de: "Spanien",            es: "España",            pl: "Hiszpania"          },
    funFact:  { en: "The rarest amphibian on the Iberian Peninsula", ua: "Найрідкісніший земноводний Іберійського п-ва", de: "Das seltenste Amphibium der Iberischen Halbinsel", es: "El anfibio más raro de la Península ibérica", pl: "Najrzadszy płaz na Półwyspie Iberyjskim" },
  },
  61: {
    weight:   { en: "up to 1.4 kg",     ua: "до 1.4 кг",        de: "bis 1,4 kg",         es: "hasta 1,4 kg",      pl: "do 1,4 kg"          },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "North Africa",     ua: "Пн. Африка",       de: "Nordafrika",         es: "Norte de África",   pl: "Afryka Północna"    },
    funFact:  { en: "One of the rarest birds in the world", ua: "Один із найрідкісніших птахів у світі", de: "Einer der seltensten Vögel der Welt", es: "Una de las aves más raras del mundo", pl: "Jeden z najrzadszych ptaków na świecie" },
  },
  62: {
    weight:   { en: "up to 6 kg",       ua: "до 6 кг",          de: "bis 6 kg",           es: "hasta 6 kg",        pl: "do 6 kg"            },
    lifespan: { en: "up to 70 years",   ua: "до 70 р.",          de: "bis 70 Jahre",       es: "hasta 70 años",     pl: "do 70 lat"          },
    region:   { en: "Sub-Saharan Africa", ua: "Суб-Сахарська Африка", de: "Subsahara-Afrika", es: "África subsahariana", pl: "Afryka Subsaharyjska" },
    funFact:  { en: "Tallest bird on average — 90–129 cm", ua: "Найвищий птах у середньому — 90–129 см", de: "Durchschnittlich höchster Vogel — 90–129 cm", es: "El ave más alta en promedio — 90–129 cm", pl: "Średnio najwyższy ptak — 90–129 cm" },
  },
  63: {
    weight:   { en: "up to 600 g",      ua: "до 600 г",         de: "bis 600 g",          es: "hasta 600 g",       pl: "do 600 g"           },
    lifespan: { en: "up to 15 years",   ua: "до 15 р.",          de: "bis 15 Jahre",       es: "hasta 15 años",     pl: "do 15 lat"          },
    region:   { en: "Southern Eurasia", ua: "Пд. Євразія",      de: "Südeurasien",        es: "Eurasia meridional",pl: "Południowa Eurazja" },
    funFact:  { en: "Nests in river floodplains and lake shores", ua: "Гніздиться у заплавах річок та озер", de: "Nistet in Flussauen und Seeufern", es: "Anida en llanuras aluviales y orillas de lagos", pl: "Gnieździ się na zalewowych łąkach i brzegach jezior" },
  },
  64: {
    weight:   { en: "up to 80 kg",      ua: "до 80 кг",         de: "bis 80 kg",          es: "hasta 80 kg",       pl: "do 80 kg"           },
    lifespan: { en: "up to 17 years",   ua: "до 17 р.",          de: "bis 17 Jahre",       es: "hasta 17 años",     pl: "do 17 lat"          },
    region:   { en: "Angola",           ua: "Ангола",           de: "Angola",             es: "Angola",            pl: "Angola"             },
    funFact:  { en: "Rarest impala subspecies — fewer than 1,000 left", ua: "Найрідкісніший підвид імпали — менше 1000 особин", de: "Seltenste Impala-Unterart — weniger als 1.000 Tiere", es: "Subespecie de impala más rara — menos de 1.000", pl: "Najrzadszy podgatunek impali — mniej niż 1000" },
  },
  65: {
    weight:   { en: "up to 1.4 kg",     ua: "до 1.4 кг",        de: "bis 1,4 kg",         es: "hasta 1,4 kg",      pl: "do 1,4 kg"          },
    lifespan: { en: "up to 16 years",   ua: "до 16 р.",          de: "bis 16 Jahre",       es: "hasta 16 años",     pl: "do 16 lat"          },
    region:   { en: "South America",    ua: "Пд. Америка",      de: "Südamerika",         es: "América del Sur",   pl: "Ameryka Południowa" },
    funFact:  { en: "Bright red colour from food pigments", ua: "Яскраво-червоний через пігменти у їжі", de: "Leuchtend rote Farbe durch Nahrungspigmente", es: "Color rojo brillante por los pigmentos de la comida", pl: "Jaskrawoczerwony kolor pochodzi z pigmentów w jedzeniu" },
  },
  66: {
    weight:   { en: "up to 158 kg",     ua: "до 158 кг",        de: "bis 158 kg",         es: "hasta 158 kg",      pl: "do 158 kg"          },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Central America",  ua: "Центр. Америка",   de: "Mittelamerika",      es: "América Central",   pl: "Ameryka Środkowa"   },
    funFact:  { en: "Strongest bite force of any cat", ua: "Найсильніший укус серед усіх кішок", de: "Stärkste Beißkraft aller Katzen", es: "La mayor fuerza de mordida de todos los felinos", pl: "Najsilniejszy ugryz spośród wszystkich kotów" },
  },
  67: {
    weight:   { en: "up to 2 kg",       ua: "до 2 кг",          de: "bis 2 kg",           es: "hasta 2 kg",        pl: "do 2 kg"            },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Catches fish with sideways sweeps of its bill", ua: "Ловить рибу боковими рухами дзьоба", de: "Fängt Fische mit seitlichen Schnabelbewegungen", es: "Atrapa peces con movimientos laterales del pico", pl: "Łowi ryby bocznym ruchem dzioba" },
  },
  68: {
    weight:   { en: "up to 75 kg",      ua: "до 75 кг",         de: "bis 75 kg",          es: "hasta 75 kg",       pl: "do 75 kg"           },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Sahara",           ua: "Сахара",           de: "Sahara",             es: "Sáhara",            pl: "Sahara"             },
    funFact:  { en: "Functionally extinct in the wild — exists only in zoos", ua: "Фактично вимерла у природі — лише в зоопарках", de: "In der Wildnis funktional ausgestorben — nur in Zoos", es: "Extinción funcional en estado silvestre — solo en zoos", pl: "Funkcjonalnie wymarły na wolności — tylko w ogrodach zoo" },
  },
  69: {
    weight:   { en: "up to 77 kg",      ua: "до 77 кг",         de: "bis 77 kg",          es: "hasta 77 kg",       pl: "do 77 kg"           },
    lifespan: { en: "up to 17 years",   ua: "до 17 р.",          de: "bis 17 Jahre",       es: "hasta 17 años",     pl: "do 17 lat"          },
    region:   { en: "Sri Lanka",        ua: "Шрі-Ланка",        de: "Sri Lanka",          es: "Sri Lanka",         pl: "Sri Lanka"          },
    funFact:  { en: "A distinct subspecies isolated for thousands of years", ua: "Окремий підвид, ізольований тисячі років", de: "Ein eigenständiger Unterart, seit Tausenden von Jahren isoliert", es: "Una subespecie distinta aislada durante miles de años", pl: "Odrębny podgatunek izolowany od tysięcy lat" },
  },
  70: {
    weight:   { en: "up to 1 kg",       ua: "до 1 кг",          de: "bis 1 kg",           es: "hasta 1 kg",        pl: "do 1 kg"            },
    lifespan: { en: "up to 40 years",   ua: "до 40 р.",          de: "bis 40 Jahre",       es: "hasta 40 años",     pl: "do 40 lat"          },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Sucks out fruit pulp without swallowing the skin", ua: "Висмоктує м'якоть плодів, не ковтаючи шкурку", de: "Saugt Fruchtfleisch aus, ohne die Schale zu schlucken", es: "Succiona la pulpa de la fruta sin tragar la piel", pl: "Wysysa miąższ owoców bez połykania skórki" },
  },
  71: {
    weight:   { en: "up to 14 kg",      ua: "до 14 кг",         de: "bis 14 kg",          es: "hasta 14 kg",       pl: "do 14 kg"           },
    lifespan: { en: "up to 39 years",   ua: "до 39 р.",          de: "bis 39 Jahre",       es: "hasta 39 años",     pl: "do 39 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Wingspan up to 3 m — largest in the Old World", ua: "Розмах крил до 3 м — найбільший у Старому Світі", de: "Flügelspannweite bis 3 m — größter in der Alten Welt", es: "Envergadura hasta 3 m — la mayor del Viejo Mundo", pl: "Rozpiętość skrzydeł do 3 m — największa w Starym Świecie" },
  },
  72: {
    weight:   { en: "up to 750 g",      ua: "до 750 г",         de: "bis 750 g",          es: "hasta 750 g",       pl: "do 750 g"           },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Plumage shimmers with green and purple metallic gloss", ua: "Оперення переливається зеленим і фіолетовим металиком", de: "Gefieder schimmert grün und violett metallisch", es: "El plumaje brilla con lustre metálico verde y morado", pl: "Upierzenie mieni się zielonym i fioletowym połyskiem" },
  },
  73: {
    weight:   { en: "up to 135 g",      ua: "до 135 г",         de: "bis 135 g",          es: "hasta 135 g",       pl: "do 135 g"           },
    lifespan: { en: "up to 12 years",   ua: "до 12 р.",          de: "bis 12 Jahre",       es: "hasta 12 años",     pl: "do 12 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Its call sounds like the word 'sleep'", ua: "Видає крик, що нагадує слово «спати»", de: "Sein Ruf klingt wie das Wort 'schlafen'", es: "Su canto suena como la palabra 'dormir'", pl: "Jego głos brzmi jak słowo 'spać'" },
  },
  74: {
    weight:   { en: "up to 210 kg",     ua: "до 210 кг",        de: "bis 210 kg",         es: "hasta 210 kg",      pl: "do 210 kg"          },
    lifespan: { en: "up to 20 years",   ua: "до 20 р.",          de: "bis 20 Jahre",       es: "hasta 20 años",     pl: "do 20 lat"          },
    region:   { en: "Sahara",           ua: "Сахара",           de: "Sahara",             es: "Sáhara",            pl: "Sahara"             },
    funFact:  { en: "Reintroduced to Chad's wild in 2023", ua: "Повернутий у природу в Чаді у 2023 р.", de: "2023 in Tschads Wildnis wiederangesiedelt", es: "Reintroducido en la naturaleza de Chad en 2023", pl: "Reintrodukowany na wolność w Czadzie w 2023 r." },
  },
  75: {
    weight:   { en: "up to 600 kg",     ua: "до 600 кг",        de: "bis 600 kg",         es: "hasta 600 kg",      pl: "do 600 kg"          },
    lifespan: { en: "up to 25 years",   ua: "до 25 р.",          de: "bis 25 Jahre",       es: "hasta 25 años",     pl: "do 25 lat"          },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Smallest buffalo — half the size of the savanna buffalo", ua: "Найменший підвид буйвола — вдвічі дрібніший за саванного", de: "Kleinster Büffel — halb so groß wie der Savannenbüffel", es: "El búfalo más pequeño — la mitad que el de sabana", pl: "Najmniejszy bawół — o połowę mniejszy od sawannowego" },
  },
  76: {
    weight:   { en: "up to 920 kg",     ua: "до 920 кг",        de: "bis 920 kg",         es: "hasta 920 kg",      pl: "do 920 kg"          },
    lifespan: { en: "up to 30 years",   ua: "до 30 р.",          de: "bis 30 Jahre",       es: "hasta 30 años",     pl: "do 30 lat"          },
    region:   { en: "Eurasia",          ua: "Євразія",          de: "Eurasien",           es: "Eurasia",           pl: "Eurazja"            },
    funFact:  { en: "Saved from extinction by zoos in the 20th century", ua: "Урятований від вимирання зоопарками у XX ст.", de: "Im 20. Jh. durch Zoos vor dem Aussterben gerettet", es: "Salvado de la extinción por zoológicos en el siglo XX", pl: "Uratowany od wyginięcia przez ogrody zoo w XX w." },
  },
  77: {
    weight:   { en: "up to 4 kg",       ua: "до 4 кг",          de: "bis 4 kg",           es: "hasta 4 kg",        pl: "do 4 kg"            },
    lifespan: { en: "up to 22 years",   ua: "до 22 р.",          de: "bis 22 Jahre",       es: "hasta 22 años",     pl: "do 22 lat"          },
    region:   { en: "Africa",           ua: "Африка",           de: "Afrika",             es: "África",            pl: "Afryka"             },
    funFact:  { en: "Performs a dance during courtship", ua: "Танцює під час шлюбного ритуалу", de: "Führt während der Balz einen Tanz auf", es: "Realiza una danza durante el cortejo", pl: "Tańczy podczas rytuału godowego" },
  },
  78: {
    weight:   { en: "up to 400 g",      ua: "до 400 г",         de: "bis 400 g",          es: "hasta 400 g",       pl: "do 400 g"           },
    lifespan: { en: "up to 10 years",   ua: "до 10 р.",          de: "bis 10 Jahre",       es: "hasta 10 años",     pl: "do 10 lat"          },
    region:   { en: "West Africa",      ua: "Зах. Африка",      de: "Westafrika",         es: "África occidental", pl: "Afryka Zachodnia"   },
    funFact:  { en: "Completely vegetarian — eats only fruit and leaves", ua: "Повністю вегетаріанський — їсть лише фрукти та листя", de: "Vollständig vegetarisch — frisst nur Früchte und Blätter", es: "Completamente vegetariano — solo come fruta y hojas", pl: "Całkowicie wegetariański — je tylko owoce i liście" },
  },
};

// ─── Wiki photo ───────────────────────────────────────────────────────────────

interface WikiData { thumbnail?: string; }
const wikiCache = new Map<string, WikiData>();

const fetchWikiPhoto = async (title: string): Promise<WikiData> => {
  if (wikiCache.has(title)) return wikiCache.get(title)!;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    if (!res.ok) return {};
    const data = await res.json();
    const result = { thumbnail: data.thumbnail?.source };
    wikiCache.set(title, result);
    return result;
  } catch {
    return {};
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const AnimalCard = ({ animal, language, onClose, onRoute, uiTheme }: Props) => {
  const [wiki, setWiki] = useState<WikiData>({});
  const [loading, setLoading] = useState(true);

  const theme = THEMES[uiTheme];
  const conservation = animal.conservation ? CONSERVATION_LABELS[animal.conservation]?.[language] : null;
  const facts = ANIMAL_FACTS[animal.id];
  const ui = UI[language];

  const dietLabel = animal.diet
    ? (DIET_LABELS[animal.diet]?.[language] ?? animal.diet)
    : null;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setWiki({});
    if (animal.wiki) {
      fetchWikiPhoto(animal.wiki).then((d) => {
        if (alive) { setWiki(d); setLoading(false); }
      });
    } else {
      setLoading(false);
    }
    return () => { alive = false; };
  }, [animal.id, animal.wiki]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[1200] animate-in slide-in-from-bottom duration-300 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className={`mx-3 mb-3 flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto sm:mx-4 sm:mb-4 ${theme.panel}`}>

        {/* Drag handle */}
        <div className="flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header: photo + name + tags */}
        <div className="flex gap-3 px-3 pt-2 pb-2">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
            {wiki.thumbnail ? (
              <img src={wiki.thumbnail} alt={animal.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                {loading
                  ? <span className="animate-pulse opacity-40">{animal.emoji}</span>
                  : animal.emoji
                }
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight">
                  {getAnimalName(animal, language)}
                </h2>
                {animal.scientificName && (
                  <p className="text-[11px] italic opacity-60 leading-tight mt-0.5">
                    {animal.scientificName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 active:scale-90 transition-all"
              >
                <X size={13} />
              </button>
            </div>

            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
              {dietLabel && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] opacity-90">
                  {dietLabel}
                </span>
              )}
              {conservation && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: conservation.bg, color: conservation.color }}
                >
                  {conservation.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {facts && (
          <div className="grid grid-cols-3 border-t border-border/40 mx-3">
            <div className="flex flex-col items-center py-2 border-r border-border/40">
              <span className="text-[10px] opacity-60">{ui.weight}</span>
              <span className="text-[12px] font-medium mt-0.5 text-center leading-tight">{facts.weight[language]}</span>
            </div>
            <div className="flex flex-col items-center py-2 border-r border-border/40">
              <span className="text-[10px] opacity-60">{ui.lifespan}</span>
              <span className="text-[12px] font-medium mt-0.5 text-center leading-tight">{facts.lifespan[language]}</span>
            </div>
            <div className="flex flex-col items-center py-2">
              <span className="text-[10px] opacity-60">{ui.region}</span>
              <span className="text-[12px] font-medium mt-0.5 text-center leading-tight">{facts.region[language]}</span>
            </div>
          </div>
        )}

        {/* Fun fact */}
        {facts && (
          <div className="mx-3 mt-1.5 mb-2 rounded-xl bg-white/10 px-3 py-2">
            <p className="text-[11px] leading-snug opacity-80">
              💡 {facts.funFact[language]}
            </p>
          </div>
        )}

        {/* Route button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => onRoute(animal)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all active:scale-95"
          >
            <Navigation size={15} /> {ui.route}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnimalCard;