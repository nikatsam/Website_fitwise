/** Spanish publication and feature copy for the ceiling-fan and Christmas-tree pages. */
import {
  CEILING_FAN_HUB_ID,
  CHRISTMAS_TREE_HUB_ID,
  FAN_ROOM_VARIANTS,
  TREE_CEILING_VARIANTS,
  fanVariantFacts,
  fanVariantId,
  treeVariantFacts,
  treeVariantId,
} from '../data/fan-tree-pages';
import { formatMeasurement } from '../lib/units';
import type { EsPublication } from './es-publications';
import type { SpanishFeatureCopy } from './es-features';

const both = (mm: number) => formatMeasurement(mm, 'both');

const fanLimitations = [
  'La orientación del diámetro de aspas es la tabla de ENERGY STAR por tamaño de habitación (atribuida a la American Lighting Association); el caudal de aire (CFM), la eficiencia del motor y la forma de la habitación también influyen.',
  'Los 7 ft de altura mínima y las 18 in de separación de la pared son recomendaciones de colocación de ENERGY STAR. Prevalecen el manual del ventilador, la normativa eléctrica local y un instalador cualificado.',
  'No se modelan techos inclinados o abovedados, kits de luz que cuelgan bajo las aspas ni la carga admitida por la caja del techo.',
];

const treeLimitations = [
  'La altura de los árboles varía según la marca; comprueba si la altura indicada incluye el soporte antes de comprar.',
  'Los árboles naturales pueden cambiar de forma una vez cortados y colocados en el soporte; deja algo de margen extra.',
  'No se comprueban la seguridad contra incendios, las fuentes de calor, los enchufes ni la colocación de los muebles.',
];

export const ES_FAN_TREE_PUBLICATIONS: Record<string, EsPublication> = {
  [CEILING_FAN_HUB_ID]: {
    title: 'Calculadora de tamaño de ventilador de techo: habitación, altura y barra',
    description:
      'Calcula el diámetro de aspas adecuado para tu habitación, la longitud de la barra de extensión según la altura del techo y comprueba las separaciones de 7 ft al suelo y 18 in a la pared.',
    h1: '¿Qué tamaño de ventilador de techo necesitas?',
    breadcrumbLabel: 'Tamaño del ventilador de techo',
    primaryQuery: 'qué tamaño de ventilador de techo necesito',
  },
  [CHRISTMAS_TREE_HUB_ID]: {
    title: 'Calculadora de tamaño de árbol de Navidad según la altura del techo',
    description:
      'Calcula el árbol de Navidad más alto para tu techo contando el soporte, la estrella y una separación segura, y comprueba que el ancho del árbol cabe en el espacio.',
    h1: '¿Qué tamaño de árbol de Navidad cabe bajo tu techo?',
    breadcrumbLabel: 'Tamaño del árbol de Navidad',
    primaryQuery: 'qué tamaño de árbol de navidad para la altura de mi techo',
  },
};

export const ES_FAN_TREE_FEATURE_COPY: Record<string, SpanishFeatureCopy> = {
  [CEILING_FAN_HUB_ID]: {
    intro:
      'Introduce la habitación y la altura del techo para obtener el diámetro de aspas recomendado, la longitud de barra que deja las aspas a una altura cómoda y una comprobación de separaciones para el ventilador que estés considerando.',
    calculation:
      'La superficie de la habitación se compara con la tabla de diámetros de ENERGY STAR. La altura de las aspas es la altura del techo menos la distancia del techo a las aspas y la barra, comprobada frente a tu altura mínima (7 ft por defecto) y preferida (8 ft por defecto). Las puntas de las aspas se comprueban frente al lado más corto de la habitación más tu separación de la pared (18 in por defecto).',
    limitations: fanLimitations,
    relatedReasons: {
      '/bedroom/': 'Comprueba la cama y la distribución de muebles en la misma habitación.',
      '/fit-checks/': 'Explora las demás calculadoras de ajuste por tarea.',
    },
  },
  [CHRISTMAS_TREE_HUB_ID]: {
    intro:
      'Introduce la altura del techo, la estrella y el árbol para ver el árbol más alto que cabe con margen, el mayor tamaño habitual de tienda y si la base del árbol cabe en la esquina que tienes pensada.',
    calculation:
      'La altura adicional del soporte + la altura indicada del árbol + la estrella deben caber bajo el techo; la separación elegida (6 in por defecto) es el margen objetivo. El árbol más alto es la altura del techo menos el soporte, la estrella y la separación. El espacio en el suelo compara el diámetro de la base, más una separación opcional, con el ancho y el fondo del lugar.',
    limitations: treeLimitations,
    relatedReasons: {
      '/rug-fit/':
        'Comprueba una alfombra o base para el árbol frente a la habitación y los muebles.',
      '/fit-checks/': 'Explora las demás calculadoras de ajuste por tarea.',
    },
  },
};

for (const { widthFt, lengthFt } of FAN_ROOM_VARIANTS) {
  const facts = fanVariantFacts(widthFt, lengthFt);
  const id = fanVariantId(widthFt, lengthFt);
  const rod = (inches: number | null) =>
    inches === null || inches === 0 ? 'ninguna barra adicional' : `una barra de unas ${inches} in`;
  ES_FAN_TREE_PUBLICATIONS[id] = {
    title: `¿Qué tamaño de ventilador de techo para una habitación de ${widthFt}x${lengthFt} ft?`,
    description: `Una habitación de ${widthFt}×${lengthFt} ft mide ${facts.areaSqFt} ft², así que la tabla de ENERGY STAR recomienda un ventilador de ${facts.spanText}. Comprueba la altura de las aspas y la barra para tu techo.`,
    h1: `¿Qué tamaño de ventilador de techo para una habitación de ${widthFt}×${lengthFt} ft?`,
    breadcrumbLabel: `Habitación de ${widthFt}×${lengthFt} ft`,
    primaryQuery: `qué tamaño de ventilador de techo para habitación de ${widthFt}x${lengthFt}`,
  };
  ES_FAN_TREE_FEATURE_COPY[id] = {
    intro: `Una habitación de ${widthFt}×${lengthFt} ft mide ${facts.areaSqFt} ft², así que la tabla de ENERGY STAR recomienda un diámetro de aspas de ${facts.spanText}. Con un techo de 8 ft, las aspas de un ventilador estándar quedan a unos ${both(facts.blade8Mm)} del suelo: por encima del mínimo de 7 ft, pero por debajo del objetivo de 8–9 ft para el flujo de aire, por lo que lo habitual es un montaje pegado al techo o de perfil bajo. Con un techo de 9 ft necesitas ${rod(facts.downrod9In)}; con uno de 10 ft, ${rod(facts.downrod10In)}.`,
    calculation:
      'La calculadora está rellenada con esta habitación y un techo de 8 ft. Cambia la altura del techo, el diámetro de aspas y la distancia del techo a las aspas de tu ventilador para ver la altura de las aspas, la barra recomendada y la separación de la pared.',
    limitations: fanLimitations,
    relatedReasons: {
      '/ceiling-fan-size/':
        'Usa la calculadora completa para cualquier tamaño de habitación y altura de techo.',
    },
  };
}

for (const ceilingFt of TREE_CEILING_VARIANTS) {
  const facts = treeVariantFacts(ceilingFt);
  const id = treeVariantId(ceilingFt);
  const size = (feet: number | null) =>
    feet === null ? 'ningún tamaño habitual' : `un árbol de ${feet} ft`;
  ES_FAN_TREE_PUBLICATIONS[id] = {
    title: `¿Qué tamaño de árbol de Navidad para un techo de ${ceilingFt} ft?`,
    description: `Con una estrella de 12 in y una separación de 6 in, el árbol más alto para un techo de ${ceilingFt} ft mide ${both(facts.maxMm)}, así que elige ${size(facts.standardFt)}. Ajústalo a tu soporte y tu estrella.`,
    h1: `¿Qué tamaño de árbol de Navidad para un techo de ${ceilingFt} ft?`,
    breadcrumbLabel: `Techo de ${ceilingFt} ft`,
    primaryQuery: `qué tamaño de árbol de navidad para techo de ${ceilingFt} pies`,
  };
  ES_FAN_TREE_FEATURE_COPY[id] = {
    intro: `Con un techo de ${ceilingFt} ft, una estrella o figura de 12 in y una separación de 6 in dejan sitio para un árbol de hasta ${both(facts.maxMm)}, medido desde la base del soporte. El mayor tamaño habitual de tienda que cabe es ${size(facts.standardFt)}. Sin estrella cabe ${size(facts.noTopperFt)}. Un árbol natural en un soporte que añade altura necesita un árbol más bajo.`,
    calculation:
      'La calculadora está rellenada con esta altura de techo y el árbol habitual más alto que cabe. Cambia la estrella, la altura del soporte y la separación según tu caso, y comprueba el diámetro de la base frente al espacio en el suelo.',
    limitations: treeLimitations,
    relatedReasons: {
      '/christmas-tree-size/':
        'Usa la calculadora completa para cualquier techo, soporte y estrella.',
    },
  };
}
