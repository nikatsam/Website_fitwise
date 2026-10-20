import { ES_FAN_TREE_PUBLICATIONS } from './es-fan-tree-pages';

export type EsPublication = {
  title: string;
  description: string;
  h1: string;
  breadcrumbLabel?: string;
  primaryQuery: string;
};

export const ES_PUBLICATIONS: Record<string, EsPublication> = {
  'pi-feature-fit-services-hub': {
    title: 'Comprobador avanzado de ajuste integral',
    description:
      'Usa el comprobador avanzado para comparar un objeto personalizado con una habitación, un hueco, una ruta, un equipo o una configuración de almacenamiento.',
    h1: 'Comprobador avanzado de ajuste integral',
    breadcrumbLabel: 'Comprobador avanzado',
    primaryQuery: 'calculadora avanzada e integral de ajuste',
  },
  'pi-feature-fit-checks-directory': {
    title: 'Comprobaciones de ajuste por tarea: habitaciones, instalación, acceso y exterior',
    description:
      'Explora calculadoras específicas por habitación, instalación, entrega, almacenamiento, ocio y tareas al aire libre sin abrir el comprobador avanzado.',
    h1: 'Todas las comprobaciones de ajuste',
    breadcrumbLabel: 'Todas las comprobaciones',
    primaryQuery: 'directorio de comprobaciones de ajuste por tarea',
  },
  'pi-p001-desk-size-guide': {
    title: 'Tamaño de escritorio para monitores: guía de superficie y profundidad',
    description:
      'Compara las dimensiones de los monitores con el ancho del escritorio y revisa el modelo, la profundidad del soporte, el espacio para cables y la zona de trabajo.',
    h1: 'Guía de tamaño de escritorio y ajuste de monitores',
    breadcrumbLabel: 'Tamaño del escritorio',
    primaryQuery: 'tamaño de escritorio para monitores',
  },
  'pi-p002-desk-size-dual-monitors': {
    title: 'Tamaño de escritorio para dos monitores',
    description:
      'Compara el ancho de dos monitores con el escritorio y consulta las dimensiones y los márgenes del espacio de trabajo.',
    h1: 'Qué tamaño de escritorio necesitas para dos monitores',
    primaryQuery: 'tamaño de escritorio para dos monitores',
  },
  'pi-p003-desk-size-two-24in': {
    title: 'Tamaño de escritorio para dos monitores de 24 pulgadas',
    description:
      'Consulta el espacio que ocupan dos monitores de 24 pulgadas y compara su disposición con el ancho disponible del escritorio.',
    h1: 'Escritorio para dos monitores de 24 pulgadas',
    primaryQuery: 'tamaño de escritorio para dos monitores de 24 pulgadas',
  },
  'pi-p004-desk-size-two-27in': {
    title: 'Escritorio para dos monitores de 27 pulgadas: ancho y márgenes',
    description:
      'El ancho físico compartido es de 121,6 cm y el ancho objetivo de 129,2 cm para dos paneles aproximados de 27 pulgadas. Consulta la fórmula, los supuestos y los márgenes.',
    h1: 'Tamaño de escritorio para dos monitores de 27 pulgadas',
    primaryQuery: 'tamaño de escritorio para dos monitores de 27 pulgadas',
  },
  'pi-p005-desk-size-two-32in': {
    title: 'Tamaño de escritorio para dos monitores de 32 pulgadas',
    description:
      'Compara la disposición de dos monitores de 32 pulgadas con el escritorio y revisa el espacio físico necesario.',
    h1: 'Escritorio para dos monitores de 32 pulgadas',
    primaryQuery: 'tamaño de escritorio para dos monitores de 32 pulgadas',
  },
  'pi-p006-desk-size-34in-ultrawide': {
    title: 'Tamaño de escritorio para un monitor ultrapanorámico de 34 pulgadas',
    description:
      'Compara el ancho de un monitor ultrapanorámico de 34 pulgadas con el escritorio y consulta los márgenes de ajuste.',
    h1: 'Escritorio para monitor ultrapanorámico de 34 pulgadas',
    primaryQuery: 'tamaño de escritorio para monitor ultrapanorámico de 34 pulgadas',
  },
  'pi-p010-what-fits-120cm-desk': {
    title: 'Qué cabe en un escritorio de 120 cm',
    description:
      'Compara configuraciones representativas de monitores con un escritorio nominal de 120 cm y revisa sus márgenes.',
    h1: 'Qué cabe en un escritorio de 120 cm',
    primaryQuery: 'qué cabe en un escritorio de 120 cm',
  },
  'pi-p011-what-fits-140cm-desk': {
    title: 'Qué cabe en un escritorio de 140 cm: estimaciones para monitores',
    description:
      'Compara distribuciones representativas de monitores en un escritorio nominal de 140 cm con anchos de pantalla derivados, un modelo de 32 pulgadas con medidas de fuente y márgenes laterales explícitos.',
    h1: 'Qué cabe en un escritorio de 140 cm: estimaciones de distribución de monitores',
    breadcrumbLabel: 'Escritorio de 140 cm',
    primaryQuery: 'qué cabe en un escritorio de 140 cm',
  },
  'pi-p012-what-fits-160cm-desk': {
    title: 'Qué cabe en un escritorio de 160 cm',
    description:
      'Compara configuraciones representativas de monitores con un escritorio nominal de 160 cm y consulta el espacio disponible.',
    h1: 'Qué cabe en un escritorio de 160 cm',
    primaryQuery: 'qué cabe en un escritorio de 160 cm',
  },
  'pi-p013-120-vs-140cm-desk': {
    title: 'Escritorio de 120 cm o 140 cm para dos monitores de 27 pulgadas',
    description:
      'Compara el ancho físico de 121,6 cm y el ancho objetivo de 129,2 cm, con márgenes físicos y objetivo en escritorios de 120 cm y 140 cm.',
    h1: 'Escritorio de 120 cm frente a uno de 140 cm para dos monitores de 27 pulgadas',
    primaryQuery: 'escritorio de 120 cm vs 140 cm',
  },
  'pi-p014-140-vs-160cm-desk': {
    title: 'Escritorio de 140 cm o 160 cm',
    description:
      'Compara el espacio de trabajo disponible en escritorios de 140 cm y 160 cm para distintas configuraciones.',
    h1: 'Escritorio de 140 cm frente a uno de 160 cm',
    primaryQuery: 'escritorio de 140 cm vs 160 cm',
  },
  'pi-p015-desk-depth-for-monitor': {
    title: 'Profundidad del soporte y distancia de visualización del monitor',
    description:
      'Distingue la huella medida del soporte de monitor del espacio para cables, el teclado y la distancia de visualización, con un ejemplo Samsung M7 y orientación de CCOHS.',
    h1: 'Profundidad del soporte, distancia de visualización y profundidad del escritorio',
    breadcrumbLabel: 'Profundidad del soporte',
    primaryQuery: 'profundidad de escritorio para monitor',
  },
  'pi-p018-desk-chair-clearance': {
    title: 'Espacio para silla de escritorio: huella Aeron Size B y zona de movimiento',
    description:
      'Consulta la huella exterior documentada de una Aeron Size B y mide una zona de movimiento personalizada, sin afirmar que exista un mínimo universal.',
    h1: 'Espacio para silla de escritorio: huella medida y zona de movimiento',
    breadcrumbLabel: 'Espacio para silla',
    primaryQuery: 'espacio para silla de escritorio',
  },
  'pi-p019-monitor-size-chart': {
    title: 'Tabla de tamaños físicos de monitores: ancho y alto',
    description:
      'Compara el ancho y el alto de cinco tamaños habituales de monitor. Los ejemplos de ancho exterior con fuentes se distinguen de las dimensiones de pantalla.',
    h1: 'Tabla de tamaños físicos de monitores',
    primaryQuery: 'tabla de tamaños físicos de monitores',
  },
  'pi-p020-24-vs-27in-monitor': {
    title: 'Monitor de 24 o 27 pulgadas: comparación de tamaño físico',
    description:
      'Compara las dimensiones físicas derivadas de monitores de 24 y 27 pulgadas para valorar el espacio que ocupan.',
    h1: 'Monitor de 24 pulgadas frente a uno de 27 pulgadas',
    primaryQuery: 'monitor de 24 vs 27 pulgadas',
  },
  'pi-p021-27-vs-32in-monitor': {
    title: 'Monitor de 27 o 32 pulgadas: comparación de tamaño físico',
    description:
      'Compara las dimensiones físicas derivadas de monitores de 27 y 32 pulgadas para valorar el espacio que ocupan.',
    h1: 'Monitor de 27 pulgadas frente a uno de 32 pulgadas',
    primaryQuery: 'monitor de 27 vs 32 pulgadas',
  },
  'pi-p022-workspace-fitcheck': {
    title: 'Comprobador de espacio de trabajo',
    description:
      'Accede a las herramientas para comprobar el ajuste en el espacio de trabajo y a referencias sobre escritorios y monitores.',
    h1: 'Calculadora de ajuste del espacio de trabajo',
    primaryQuery: 'calculadora de ajuste del espacio de trabajo',
  },
  'pi-p023-bed-fits-room-hub': {
    title: '¿Qué tamaño de cama cabe en mi habitación? Guía de planificación',
    description:
      'No existe un tamaño mínimo universal de habitación para una cama. Compara colchones de EE. UU. y Reino Unido y añade los espacios laterales y al pie modelados; el bastidor, las puertas y otros muebles pueden cambiar la distribución.',
    h1: '¿Qué tamaño de cama cabe en mi habitación? Guía de planificación de EE. UU. y Reino Unido',
    primaryQuery: 'qué tamaño de cama cabe en mi habitación',
  },
  'pi-p024-room-for-king-bed': {
    title: 'Espacio estimado para una cama King: referencias de EE. UU. y Reino Unido',
    description:
      'Compara espacios libres planificados para colchones King de EE. UU. y Standard King del Reino Unido. Son recomendaciones, no mínimos de normativa; las dimensiones del bastidor y los muebles varían.',
    h1: 'Estimaciones de espacio para colchones King: EE. UU. y Reino Unido',
    primaryQuery: 'tamaño mínimo de habitación para cama king',
  },
  'pi-p025-room-for-queen-bed': {
    title: 'Estimación de espacio libre para colchón Queen de EE. UU.',
    description:
      'Calcula un rectángulo de espacio libre para un colchón Queen nominal de EE. UU., con una holgura lateral documentada y otra al pie definida por FitWise. No representa una distribución completa ni un mínimo normativo.',
    h1: 'Colchón Queen de EE. UU.: estimación de espacio libre',
    primaryQuery: 'tamaño mínimo de habitación para cama queen',
  },
  'pi-p026-room-for-double-bed': {
    title: 'Espacio estimado para colchón Full de EE. UU. y Double del Reino Unido',
    description:
      'Compara las huellas de colchones Full de EE. UU. (a veces llamado Double) y Standard Double del Reino Unido con estimaciones de espacio libre modelado. No son mínimos normativos.',
    h1: 'Full de EE. UU. frente a Standard Double del Reino Unido: estimaciones de espacio',
    primaryQuery: 'tamaño mínimo de habitación para cama double',
  },
  'pi-p027-bed-in-10x10-room': {
    title: 'Qué cama cabe en una habitación de 10 × 10 pies',
    description:
      'Compara camas Full, Queen y King de EE. UU. con una habitación de referencia de 10 × 10 pies. El resultado depende de las holguras modeladas y no contempla todos los muebles.',
    h1: 'Qué cama cabe en una habitación de 10 × 10 pies',
    primaryQuery: 'qué cama cabe en una habitación de 10x10',
  },
  'pi-p028-bed-in-10x12-room': {
    title: 'Qué cama cabe en una habitación de 10 × 12 pies',
    description:
      'Compara configuraciones de colchones Full, Queen y King de EE. UU. en una habitación de referencia de 10 × 12 pies; las holguras son estimaciones de planificación.',
    h1: 'Qué cama cabe en una habitación de 10 × 12 pies',
    primaryQuery: 'qué cama cabe en una habitación de 10x12',
  },
  'pi-p030-king-vs-queen-room-space': {
    title: 'Cama King o Queen de EE. UU.: comparación del espacio en la habitación',
    description:
      'Compara las huellas nominales de colchones King y Queen de EE. UU. y los rectángulos recomendados de espacio libre. Las estimaciones excluyen bastidores, muebles y circulación; no son mínimos legales.',
    h1: 'King frente a Queen de EE. UU.: dimensiones del colchón y espacio',
    primaryQuery: 'tamaño de habitación king vs queen',
  },
  'pi-p031-double-vs-queen-room-space': {
    title: 'Full (Double) o Queen de EE. UU.: comparación del espacio',
    description:
      'Compara las huellas de colchones Full (a veces llamado Double) y Queen de EE. UU. con estimaciones de espacio modelado. Solo tamaños de EE. UU.; no son mínimos normativos.',
    h1: 'Full (a menudo llamado Double) frente a Queen de EE. UU.: estimaciones de espacio',
    primaryQuery: 'tamaño de habitación double vs queen',
  },
  'pi-p032-clearance-around-bed': {
    title: 'Espacio libre alrededor de la cama',
    description:
      'Consulta las dimensiones de la cama y los espacios alrededor para planificar una distribución. Las necesidades reales dependen del bastidor, los muebles y el uso.',
    h1: 'Espacio libre alrededor de la cama',
    primaryQuery: 'espacio libre alrededor de la cama',
  },
  'pi-p033-space-bed-wall': {
    title: 'Espacio entre la cama y la pared',
    description:
      'Mide el espacio entre la cama y la pared para comparar la huella del mueble con el margen que elijas.',
    h1: 'Espacio entre la cama y la pared',
    primaryQuery: 'espacio entre la cama y la pared',
  },
  'pi-p034-space-bed-wardrobe': {
    title: 'Espacio entre la cama y el armario: ejemplo de apertura PAX/GRIMO',
    description:
      'Usa una hoja de puerta PAX/GRIMO medida en EE. UU. para calcular su barrido a 90° y compararlo con las medidas reales de la cama y la habitación. No se afirma que sea un conjunto emparejado ni un espacio de paso recomendado.',
    h1: 'Apertura de puerta de armario PAX/GRIMO de EE. UU.: ejemplo de ajuste medido',
    breadcrumbLabel: 'Apertura del armario',
    primaryQuery: 'espacio entre la cama y el armario',
  },
  'pi-p035-bed-dresser-clearance': {
    title: 'Espacio entre cama y cómoda en Reino Unido: ejemplo HEMNES',
    description:
      'Modela un bastidor de cama documentado y la extensión del cajón de una cómoda como un volumen de posible colisión; el espacio para estar de pie lo elige el usuario y no es un mínimo universal.',
    h1: 'Espacio entre cama y cómoda en Reino Unido: ejemplo medido de extensión de cajón',
    breadcrumbLabel: 'Espacio entre cama y cómoda',
    primaryQuery: 'espacio entre la cama y la cómoda',
  },
  'pi-p036-king-bed-nightstands-room': {
    title: 'Cama King de EE. UU. y dos mesitas: huella combinada',
    description:
      'Suma el ancho nominal del colchón King de EE. UU. al ancho medido de dos mesitas. El resultado es la huella de los objetos, no una recomendación sobre el tamaño de la habitación.',
    h1: 'Cama King de EE. UU. con dos mesitas: ejemplo de huella',
    primaryQuery: 'tamaño de habitación para cama king y dos mesitas',
  },
  'pi-p037-queen-bed-nightstands-room': {
    title: 'Cama Queen de EE. UU. y dos mesitas: huella combinada',
    description:
      'Suma el ancho nominal del colchón Queen de EE. UU. al ancho medido de dos mesitas. El resultado es la huella de los objetos, no una recomendación sobre el tamaño de la habitación.',
    h1: 'Cama Queen de EE. UU. con dos mesitas: ejemplo de huella',
    primaryQuery: 'tamaño de habitación para cama queen y dos mesitas',
  },
  'pi-p039-us-bed-size-dimensions': {
    title: 'Tamaños de cama de EE. UU.: dimensiones de colchones',
    description:
      'Compara el ancho y el largo nominales de colchones Full, Queen y King de EE. UU. Las medidas estadounidenses difieren de las del Reino Unido y otros mercados.',
    h1: 'Tamaños de cama de EE. UU.',
    primaryQuery: 'tamaños de cama de EE. UU.',
  },
  'pi-p040-uk-bed-size-dimensions': {
    title: 'Tamaños de cama del Reino Unido: dimensiones de colchones',
    description:
      'Compara las referencias de colchón Standard Double, Standard King y 180 × 200 cm del Reino Unido. Los nombres y las dimensiones dependen del mercado.',
    h1: 'Tamaños de cama del Reino Unido',
    primaryQuery: 'tamaños de cama del Reino Unido',
  },
  'pi-p041-bedroom-fitcheck': {
    title: 'Comprobador de ajuste para dormitorios',
    description:
      'Abre la herramienta para comprobar el ajuste en el dormitorio y consulta referencias de tamaños de cama según el mercado.',
    h1: 'Calculadora de ajuste para dormitorios',
    primaryQuery: 'calculadora de ajuste para dormitorios',
  },
  'pi-feature-will-it-fit': {
    title: '¿Cabe? Calculadora para habitaciones y accesos',
    description:
      'Compara las medidas de un objeto con una habitación, una puerta y un pasillo usando unidades métricas o imperiales.',
    h1: '¿Cabe?',
    primaryQuery: '¿cabrá en mi habitación o pasará por mi puerta?',
  },
  'pi-feature-dining': {
    title: 'Calculadora de ajuste para comedor: mesa, sillas y espacio',
    description:
      'Compara una mesa rectangular y las huellas medidas de las sillas con la habitación y el espacio de circulación que elijas.',
    h1: '¿Caben la mesa y las sillas del comedor?',
    breadcrumbLabel: 'Comedor',
    primaryQuery: '¿caben una mesa de comedor y sillas en mi habitación?',
  },
  'pi-feature-workspace-hub': {
    title: 'Ajuste del espacio de trabajo: monitores, escritorios y holguras',
    description:
      'Comprueba configuraciones de monitores con el ancho y la profundidad del escritorio, usando dimensiones documentadas y zonas para cables y trabajo elegidas por el usuario.',
    h1: '¿Caben tus monitores en el escritorio?',
    breadcrumbLabel: 'Espacio de trabajo',
    primaryQuery: '¿cabrán mis monitores en el escritorio?',
  },
  'pi-feature-bedroom': {
    title: 'Ajuste del dormitorio: cama, muebles y espacios libres',
    description:
      'Comprueba medidas personalizadas de colchones o camas documentadas en una habitación medida, con zonas explícitas para mesitas, puertas y cajones.',
    h1: '¿Cabe la cama en tu habitación?',
    breadcrumbLabel: 'Dormitorio',
    primaryQuery: 'qué cama cabe en mi habitación',
  },
  'pi-feature-about': {
    title: 'Acerca de Fitwise: datos, fuentes y correcciones',
    description:
      'Conoce cómo Fitwise gestiona las dimensiones documentadas, los cálculos, los supuestos y los informes de corrección.',
    h1: 'Herramientas de ajuste basadas en dimensiones y con supuestos visibles',
    primaryQuery: 'acerca de Fitwise, fuentes y correcciones',
  },
  'pi-feature-methodology': {
    title: 'Cómo calcula Fitwise el espacio y el ajuste',
    description:
      'Conoce cómo Fitwise normaliza las dimensiones, distingue el ajuste físico de los objetivos y señala las limitaciones de los modelos.',
    h1: 'Metodología',
    primaryQuery: 'metodología de cálculo de Fitwise',
  },
  'pi-feature-reference-conventions': {
    title: 'Convenciones de medición y referencias',
    description:
      'Definiciones de las medidas documentadas, nominales, típicas, derivadas y elegidas por el usuario en Fitwise.',
    h1: 'Convenciones de medición y referencias',
    primaryQuery: 'convenciones de medición y referencias de Fitwise',
  },
  'pi-feature-appliances-hub': {
    title: 'Ajuste de electrodomésticos: frigoríficos, lavadoras e instalación',
    description:
      'Compara un electrodoméstico medido con un hueco y consulta las holguras de instalación del manual del modelo exacto.',
    h1: 'Ajuste de electrodomésticos',
    breadcrumbLabel: 'Electrodomésticos',
    primaryQuery: 'ajuste de electrodomésticos en huecos e instalación',
  },
  'pi-feature-access-hub': {
    title: 'Ajuste de acceso: puertas, pasillos y giros para muebles',
    description:
      'Comprueba las dimensiones medidas del objeto frente a los puntos estrechos de puertas, pasillos, escaleras y descansillos.',
    h1: 'Ajuste en accesos y rutas de entrega',
    breadcrumbLabel: 'Rutas de acceso',
    primaryQuery: 'calculadora de ajuste de muebles en rutas de entrega',
  },
  'pi-feature-tv-hub': {
    title: 'Ajuste del televisor: soporte, mueble y montaje en pared',
    description:
      'Comprueba el ajuste con las dimensiones reales del televisor, el soporte o mueble, el patrón VESA y la carga nominal del montaje.',
    h1: 'Ajuste del televisor en soporte o pared',
    breadcrumbLabel: 'Televisor',
    primaryQuery: 'ajuste de televisor en soporte y pared',
  },
  'pi-feature-home-gym-hub': {
    title: 'Ajuste del gimnasio en casa: huellas y zonas de uso',
    description:
      'Comprueba equipos de gimnasio medidos con las dimensiones de la habitación y el techo, y añade zonas de uso definidas por ti o por el manual.',
    h1: 'Ajuste de equipos de gimnasio en casa',
    breadcrumbLabel: 'Gimnasio en casa',
    primaryQuery: 'ajuste de equipos de gimnasio en una habitación',
  },
  'pi-feature-storage-hub': {
    title: 'Ajuste de almacenamiento: espacio útil, pasillos y cantidad de objetos',
    description:
      'Estima la capacidad de almacenamiento en una sola capa con las dimensiones medidas de los objetos y del espacio interior útil.',
    h1: 'Ajuste y capacidad de almacenamiento',
    breadcrumbLabel: 'Almacenamiento',
    primaryQuery: 'qué cabe en un trastero',
  },
  'pi-feature-game-room-hub': {
    title: 'Ajuste de sala de juegos: mesa y espacio para el taco',
    description:
      'Compara las medidas de la mesa y la longitud del taco con la habitación y el espacio adicional que elijas.',
    h1: 'Ajuste de sala de juegos',
    breadcrumbLabel: 'Sala de juegos',
    primaryQuery: 'calculadora del tamaño de habitación para mesa de billar',
  },
  'pi-feature-vehicle-hub': {
    title: 'Ajuste del vehículo y el garaje',
    description:
      'Compara las medidas introducidas del vehículo, el garaje, la apertura de la puerta y el espacio necesario para acceder al vehículo.',
    h1: 'Ajuste del vehículo y el garaje',
    breadcrumbLabel: 'Vehículo y garaje',
    primaryQuery: 'calculadora de ajuste de vehículo en garaje',
  },
  'pi-feature-appliance-install': {
    title: 'Ajuste de instalación de electrodomésticos: hueco y holguras del manual',
    description:
      'Compara las dimensiones medidas del electrodoméstico con el hueco y añade las holguras de instalación indicadas en el manual del modelo exacto.',
    h1: '¿Cabe el electrodoméstico en el hueco y el espacio de instalación?',
    breadcrumbLabel: 'Instalación de electrodomésticos',
    primaryQuery: 'calculadora de holguras de instalación de electrodomésticos',
  },
  'pi-feature-fridge-fit': {
    title: 'Calculadora de ajuste de frigorífico: hueco y holguras del manual',
    description:
      'Comprueba un frigorífico medido en el hueco del mueble y aplica las holguras de su manual de instalación.',
    h1: '¿Cabe este frigorífico en el hueco?',
    breadcrumbLabel: 'Ajuste del frigorífico',
    primaryQuery: '¿cabe este frigorífico en el hueco del mueble?',
  },
  'pi-feature-washer-fit': {
    title: 'Calculadora de ajuste de lavadora: hueco y espacio de instalación',
    description:
      'Compara las dimensiones exteriores medidas de la lavadora con el hueco y las holguras de servicio especificadas en el manual.',
    h1: '¿Cabe la lavadora en el hueco?',
    breadcrumbLabel: 'Ajuste de la lavadora',
    primaryQuery: '¿cabe una lavadora en el hueco de lavado?',
  },
  'pi-feature-furniture-route': {
    title: 'Ajuste de muebles en la ruta: puertas, pasillos, giros y escaleras',
    description:
      'Comprueba muebles medidos frente a los puntos estrechos de puertas, pasillos, giros, escaleras y destino.',
    h1: '¿Pasarán los muebles por la ruta?',
    breadcrumbLabel: 'Ruta de entrega de muebles',
    primaryQuery: '¿pasarán los muebles por la ruta de entrega?',
  },
  'pi-feature-workspace-compatibility': {
    title: 'Ajuste del brazo para monitor: VESA, carga, abrazadera y espacio',
    description:
      'Comprueba la huella del monitor, el patrón VESA, la carga del brazo, el grosor del escritorio y la profundidad según los manuales exactos.',
    h1: '¿Son compatibles el monitor, el brazo y el escritorio?',
    breadcrumbLabel: 'Compatibilidad del brazo',
    primaryQuery: '¿funcionará mi monitor con este brazo y escritorio?',
  },
  'pi-feature-tv-stand-fit': {
    title: 'Ajuste de televisor en soporte o pared: medidas, mueble y montaje',
    description:
      'Comprueba el ancho y alto exteriores reales del televisor, la huella del soporte, la superficie del mueble o pared y los límites exactos de VESA y carga.',
    h1: '¿Cabe el televisor en el soporte o espacio de pared?',
    breadcrumbLabel: 'Ajuste del televisor',
    primaryQuery: '¿cabe mi televisor en el soporte o espacio de pared?',
  },
  'pi-feature-power-rack-fit': {
    title: 'Ajuste de jaula de potencia: huella, techo y zonas de uso',
    description:
      'Compara una jaula medida con el ancho, la profundidad y la altura de la habitación, y con las zonas de uso del manual exacto.',
    h1: '¿Caben la jaula de potencia y el espacio de uso?',
    breadcrumbLabel: 'Ajuste de jaula de potencia',
    primaryQuery: 'qué tamaño de habitación necesita una jaula de potencia',
  },
  'pi-feature-storage-capacity': {
    title: 'Qué cabe en un trastero: calculadora de objetos y pasillos',
    description:
      'Estima cuántos objetos iguales caben en un interior de almacenamiento medido, usando una cuadrícula de una sola capa y un pasillo elegido por el usuario.',
    h1: '¿Qué cabe en el espacio de almacenamiento?',
    breadcrumbLabel: 'Capacidad de almacenamiento',
    primaryQuery: 'qué cabe en mi trastero',
  },
  'pi-feature-pool-table-fit': {
    title: 'Ajuste de mesa de billar: mesa y espacio para el taco',
    description:
      'Compara las dimensiones exteriores de la mesa y la longitud del taco con la habitación y el espacio adicional elegido.',
    h1: '¿Qué tamaño de habitación necesita una mesa de billar?',
    primaryQuery: 'qué tamaño de habitación necesita una mesa de billar',
  },
  'pi-feature-vehicle-garage': {
    title: 'Ajuste de vehículo en garaje',
    description:
      'Compara las medidas del vehículo con el garaje y la apertura de la puerta; introduce las dimensiones según la configuración de estacionamiento prevista.',
    h1: '¿Cabe el vehículo en el garaje?',
    primaryQuery: 'ajuste de vehículo en garaje',
  },
  'pi-feature-garden-hub': {
    title: 'Ajuste en el jardín: estructuras, patios y zonas de uso',
    description:
      'Compara dimensiones reales del terreno y del interior útil. Distingue la huella de la estructura de los aleros, el mantenimiento, los accesos y las zonas de actividad elegidas.',
    h1: '¿Qué cabe en tu jardín?',
    breadcrumbLabel: 'Jardín',
    primaryQuery: 'qué cabe en mi jardín',
  },
  'pi-feature-garden-structure': {
    title: 'Ajuste de estructuras de jardín',
    description:
      'Compara las dimensiones de una estructura con el espacio disponible en el jardín; verifica por separado la superficie útil y las necesidades de mantenimiento y acceso.',
    h1: 'Ajuste de estructuras en el jardín',
    primaryQuery: 'ajuste de estructuras de jardín',
  },
  'pi-feature-garden-patio-dining': {
    title: 'Ajuste de comedor en patio',
    description:
      'Comprueba la mesa y las sillas medidas frente al espacio del patio y la separación entre postes que elijas.',
    h1: '¿Caben la mesa y las sillas en el patio?',
    primaryQuery: 'ajuste de comedor en patio',
  },
  'pi-feature-garden-shed-storage': {
    title: 'Almacenamiento dentro de un cobertizo',
    description:
      'Compara las dimensiones interiores útiles del cobertizo con los objetos y pasillos que planeas usar.',
    h1: 'Almacenamiento dentro del cobertizo',
    primaryQuery: 'almacenamiento en el interior de un cobertizo',
  },
  'pi-feature-garden-greenhouse': {
    title: 'Distribución de invernadero',
    description:
      'Compara las dimensiones del invernadero con el espacio del jardín y planifica la distribución según las medidas reales.',
    h1: 'Distribución y ajuste del invernadero',
    primaryQuery: 'distribución de invernadero',
  },
  'pi-feature-garden-hot-tub': {
    title: 'Ajuste de jacuzzi en el jardín',
    description:
      'Compara la huella medida del jacuzzi con el espacio exterior disponible y las zonas elegidas.',
    h1: '¿Cabe el jacuzzi en el jardín?',
    primaryQuery: 'ajuste de jacuzzi en el jardín',
  },
  'pi-feature-garden-outdoor-kitchen': {
    title: 'Ajuste de cocina exterior',
    description:
      'Compara las dimensiones de la cocina exterior con el espacio disponible y las separaciones que indiques.',
    h1: 'Ajuste de cocina exterior',
    primaryQuery: 'ajuste de cocina exterior',
  },
  'pi-feature-garden-play': {
    title: 'Zona de uso para juegos infantiles en el jardín',
    description:
      'Compara el equipo de juego y su zona de uso con el espacio disponible. Usa las instrucciones del fabricante del modelo exacto.',
    h1: 'Ajuste del equipo de juego y su zona de uso',
    primaryQuery: 'zona de uso de juegos infantiles en el jardín',
  },
  'pi-feature-rug-fit': {
    title: 'Calculadora de ajuste de alfombra y muebles',
    description:
      'Compara una alfombra rectangular medida con una habitación y, opcionalmente, con la huella de muebles o uso. Revisa la cobertura completa o el solapamiento frontal elegido con un diagrama proporcional.',
    h1: '¿Cabe la alfombra en la habitación y bajo los muebles?',
    breadcrumbLabel: 'Ajuste de alfombra y muebles',
    primaryQuery: '¿cabe una alfombra en mi habitación y bajo los muebles?',
  },
  'pi-blog-index': {
    title: 'Blog de Fitwise: guías de ajuste y medición',
    description:
      'Consulta el índice del blog de Fitwise con historias y guías sobre dimensiones, mediciones y ajuste.',
    h1: 'Blog de Fitwise: historias de ajuste y guías de medición',
    primaryQuery: 'blog de FitWise sobre ajuste y guías de medición',
  },
  ...ES_FAN_TREE_PUBLICATIONS,
};
