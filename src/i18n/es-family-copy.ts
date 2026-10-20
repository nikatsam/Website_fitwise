import type { FitState } from '../lib/fit';

/** Spanish copy for buildFamilyAnswer. Interpolate values without translating source facts. */
export const familyText = {
  fixed: {
    displayWidthBasis: 'Base del ancho de la pantalla',
    overallWidthReference: 'Referencia del ancho total',
    screenOnlyApproximation: 'Estimación solo de la pantalla',
    numberOfDisplays: 'Número de pantallas',
    configurationWidth: 'Ancho de la configuración (incluidos los espacios)',
    hardMinimumDeskWidth: 'Ancho mínimo estricto del escritorio',
    recommendedDeskWidth: 'Ancho recomendado del escritorio',
    referenceDeskWidth: 'Ancho de referencia del escritorio',
    fitResult: 'Resultado del ajuste',
    maximumHardWidth: 'Cantidad máxima según el ancho estricto',
    maximumRecommendedMargins: 'Cantidad máxima con los márgenes recomendados',
    layoutShown: 'Distribución mostrada a continuación',
    recommendedDeskWidthLayout: 'Ancho recomendado del escritorio para esta distribución',
    availableReferenceDeskWidth: 'Ancho de referencia disponible del escritorio',
    fitDisplayedLayout: 'Resultado del ajuste para la distribución mostrada',
    market: 'Mercado',
    mattressWidth: 'Ancho del colchón',
    mattressLength: 'Largo del colchón',
    recommendedClearRoomWidth: 'Ancho libre recomendado de la habitación',
    recommendedClearRoomLength: 'Largo libre recomendado de la habitación',
    context: 'Contexto',
    codeMinimum: 'Mínimo establecido por normativa',
    noUniversalCodeMinimum: 'Esta fuente no establece un mínimo normativo universal.',
    recommendedClearance: 'Espacio libre recomendado',
    availableWidth: 'Ancho disponible',
    deskDepth: 'Profundidad del escritorio',
    nominalDiagonal: 'Diagonal nominal',
    screenWidth: 'Ancho de la pantalla',
    screenHeight: 'Alto de la pantalla',
    activePanelWidth: 'Ancho del panel activo (sin bisel)',
    listedDeviceWidth: 'Ancho indicado del dispositivo',
    approximateScreenWidth: 'Ancho aproximado solo de la pantalla',
    listedFramePhysicalWidth: 'Ancho físico del somier indicado',
    listedFramePhysicalLength: 'Largo físico del somier indicado',
    mattressOnlyPhysicalWidth: 'Ancho físico solo del colchón',
    mattressOnlyPhysicalLength: 'Largo físico solo del colchón',
    mattressFootprint: 'Huella del colchón',
    roomWidthRequiredPhysical: 'Ancho físico necesario de la habitación',
    roomWidthRecommended: 'Ancho recomendado de la habitación',
    roomWidthAvailable: 'Ancho disponible de la habitación',
    roomLengthRequiredPhysical: 'Largo físico necesario de la habitación',
    roomLengthRecommended: 'Largo recomendado de la habitación',
    roomLengthAvailable: 'Largo disponible de la habitación',
    derivedScreenOnly: 'Dimensión derivada solo de la pantalla.',
    frameDimensionsNotMeasured: 'Las dimensiones del somier no se han medido.',
    mattressOnlyFrameNotMeasured: 'Huella solo del colchón; el somier no se ha medido.',
    portraitLayout:
      'Distribución vertical: el ancho de la cama ocupa el ancho de la habitación y el cabecero queda contra una pared.',
    landscapeOrientation: 'orientación horizontal',
    portraitOrientation: 'orientación vertical',
  },
  templates: {
    workspaceObjectIntro:
      '{{count}} pantallas {{display}} colocadas una al lado de otra frente al {{desk}}. El cálculo utiliza las dimensiones medidas o derivadas existentes e indica explícitamente las hipótesis sobre el ancho.',
    workspaceObjectTitle: '{{count}} × {{display}} en {{desk}}',
    adjacentGap:
      'Separación entre pantallas adyacentes: {{measurement}}, según la regla de separación del espacio de trabajo. {{assumption}}',
    sideMargin: 'Margen lateral recomendado: {{measurement}} a cada lado. {{assumption}}',
    flatDisplaysOnly:
      'Las pantallas son planas y están colocadas una al lado de otra; no se modelan monitores girados en ángulo.',
    screenOnlyNotFootprint:
      'Una estimación solo de la pantalla no equivale a la huella completa del dispositivo, incluido el bisel y el soporte.',
    workspaceSpaceIntro:
      'Compara las configuraciones admitidas de pantallas planas, colocadas una al lado de otra, con el {{desk}}. Para cada modelo, la tabla muestra la cantidad máxima según el ancho estricto y según los márgenes laterales recomendados; las estimaciones solo de pantalla se mantienen diferenciadas de las referencias de ancho total. Las cantidades se evalúan de una a cinco pantallas.',
    workspaceSpaceGapMargins:
      'Separación entre pantallas adyacentes: {{gap}}; margen lateral recomendado: {{margin}} a cada lado.',
    noAngleOrArm:
      'Solo se modelan distribuciones planas, con las pantallas una al lado de otra; no se presupone ningún ángulo, giro ni geometría de brazos.',
    checkFootprint:
      'Las estimaciones de ancho solo de pantalla no incluyen biseles ni soportes; comprueba la huella completa del dispositivo antes de comprarlo.',
    bedObjectIntro:
      'Estimación de planificación, no un mínimo de normativa de construcción: {{plans}}. El modelo aplica a cada huella de colchón específica del mercado una holgura lateral aproximada de 24 pulgadas respaldada por una fuente y una holgura independiente de 24 pulgadas al pie asumida por FitWise. Solo las entradas que mencionan un somier incluyen ese modelo específico con dimensiones de fuente; las demás consideran únicamente el colchón. No se incluyen mesillas de noche, acceso a armarios o cómodas, puertas ni zonas de circulación; mide la instalación real antes de comprar.',
    bedPlan: '{{model}}: aproximadamente {{width}} de ancho por {{length}} de largo',
    modelWithFrame: '{{bed}} con {{frame}}',
    mattressOnly: '{{bed}}, solo colchón',
    usingFrame: 'Se utiliza {{frame}}.',
    bedFrameOverhang:
      'El saliente del somier se deriva de las dimensiones publicadas de {{frame}}; otros somieres pueden tener medidas distintas.',
    noFrameForMarket:
      'No se obtuvo una fuente para un somier exterior en este ejemplo de mercado; la geometría considera únicamente el colchón.',
    recommendedRoomWidth: 'Ancho libre recomendado de la habitación',
    recommendedRoomLength: 'Largo libre recomendado de la habitación',
    widthBasisScreen:
      'Ancho solo de pantalla derivado de la diagonal y la relación de aspecto, redondeado al milímetro más cercano para los cálculos de ajuste; no incluye bisel ni soporte. {{note}}',
    widthBasisOverall: 'Utiliza la medida de referencia indicada para el ancho total.',
    ruleAssumption: '{{notes}} {{measurementNote}}',
    roomNominalUsFeet:
      'Las dimensiones de la habitación son medidas nominales en pies de EE. UU., convertidas a milímetros a partir de {{room}}.',
    mattressOnlyNoNightstands:
      'Solo se considera la huella del colchón; no se incluyen el saliente del somier ni las mesillas de noche.',
    bedroomSpaceIntro:
      'Compara las huellas de colchón específicas de cada mercado con {{room}}. Los resultados distinguen el ajuste físico del colchón por sí solo de los espacios libres laterales y al pie recomendados.',
    bedOrientationTitle: '{{bed}} — {{orientation}}',
    comparisonBedIntro:
      '{{plans}}. Son estimaciones de planificación específicas de cada mercado, no mínimos normativos; solo los ejemplos con somier identificado incluyen un somier, y no se incluyen muebles, puertas ni zonas de circulación.',
    comparisonIntro:
      '{{query}}: compara las dimensiones físicas indicadas y su base de mercado/fuente.{{screenNote}}',
    comparisonScreenNote:
      ' Se distinguen las dimensiones del panel de la pantalla de los anchos exteriores del dispositivo cuando se facilitan.',
    recommendedPlanningNotCode:
      'Las dimensiones libres recomendadas son orientaciones de planificación, no mínimos normativos.',
    clearanceIntro:
      'Estos valores son orientaciones para distribuir una cama, no mínimos de normativa de construcción ni de accesibilidad. Junto a cada valor se muestran el texto de la fuente y las hipótesis de mercado y contexto.',
    sideAccess: 'Acceso lateral junto a la cama',
    footClearance: 'Espacio libre al pie de la cama',
    sideClearanceRecommendation: 'Orientación editorial sobre comodidad, no una normativa.',
    sideAccessRule:
      'Aplica la recomendación a cada lado accesible; las necesidades reales de acceso varían.',
    footClearanceRule:
      'Hipótesis de modelado de FitWise: 24 pulgadas al pie. Sleep Foundation trata el espacio alrededor de cada lado; aplicar esa cifra al pie es una extrapolación, no una recomendación directa de la fuente ni un mínimo normativo. El motor geométrico considera el cabecero apoyado contra una pared.',
    deskMarginRule:
      'Margen lateral cómodo más allá de una configuración de monitores; es una convención, no una normativa.',
    monitorGapRule:
      'Separación típica entre monitores adyacentes en una configuración con varias pantallas.',
    fits: 'cabe',
    none: 'Ninguna',
    count: '{{count}}',
    dimensionsBy: '{{width}} × {{length}}',
    mattressNamePrefix: 'colchón ',
  },
} as const;

export const fitStateBadgeEs: Record<FitState, { icon: string; label: string; meaning: string }> = {
  fits: {
    icon: '✓',
    label: 'Cabe',
    meaning:
      'Se cumplen los requisitos físicos estrictos y los objetivos seleccionados o verificados.',
  },
  tight: {
    icon: '△',
    label: 'Ajustado',
    meaning:
      'El ajuste físico es posible, pero no se cumple uno o más de los objetivos seleccionados.',
  },
  does_not_fit: {
    icon: '✕',
    label: 'No cabe',
    meaning: 'No se cumple al menos un requisito físico estricto o de acceso.',
  },
  needs_information: {
    icon: '?',
    label: 'Falta información',
    meaning:
      'No se ha verificado una medida, fuente, modelo, manual o dato de compatibilidad necesario.',
  },
};

/** Dataset names translated by stable IDs; branded/model names remain unchanged. */
export const familyEntityNameEs: Record<string, string> = {
  'ent-display-24in-16x9': 'monitor de 24″ 16:9',
  'ent-display-27in-16x9': 'monitor de 27″ 16:9',
  'ent-display-32in-16x9': 'monitor de 32″ 16:9',
  'ent-display-34in-ultrawide': 'monitor ultrapanorámico de 34″ 21:9',
  'ent-display-49in-superultrawide': 'monitor superultrapanorámico de 49″ 32:9',
  'ent-desk-1200': 'escritorio de referencia de 120 cm',
  'ent-desk-1400': 'escritorio de referencia de 140 cm',
  'ent-desk-1600': 'escritorio de referencia de 160 cm',
  'ent-bed-us-full': 'colchón Full de EE. UU. (a menudo llamado Double)',
  'ent-bed-us-queen': 'colchón Queen de EE. UU.',
  'ent-bed-us-king': 'colchón King de EE. UU.',
  'ent-bed-uk-double': 'colchón Double estándar del Reino Unido',
  'ent-bed-uk-king': 'colchón King estándar del Reino Unido',
  'ent-bed-uk-super-king': 'referencia de colchón de 180 × 200 cm del Reino Unido',
  'ent-room-us-10x10ft': 'habitación de referencia de 10 × 10 pies (EE. UU.)',
  'ent-room-us-10x12ft': 'habitación de referencia de 10 × 12 pies (EE. UU.)',
  'ent-room-us-9x10ft': 'habitación de referencia de 9 × 10 pies (EE. UU.)',
  'ent-furniture-aeron-size-b':
    'silla Herman Miller Aeron, talla B, con brazos totalmente ajustables',
  'ent-furniture-hemnes-bedside-46x35': 'mesilla de noche IKEA HEMNES de 46 × 35 cm',
  'ent-furniture-pax-grimo-wardrobe': 'armario de dos puertas IKEA PAX / GRIMO',
  'ent-furniture-hemnes-8-drawer-dresser': 'cómoda IKEA HEMNES de 8 cajones, 160 × 50 cm',
};

export const familyMarketEs: Record<string, string> = {
  US: 'EE. UU.',
  UK: 'Reino Unido',
  global: 'Global',
};

export const familyOrientationEs = {
  portrait: 'orientación vertical',
  landscape: 'orientación horizontal',
} as const;

export const ES_CLEARANCE_RULE_COPY: Record<
  string,
  { context?: string; notes?: string; minimumNote?: string; recommendedNote?: string }
> = {
  'clr-desk-side-margin': {
    context: 'espacio de trabajo',
    notes:
      'Margen lateral cómodo más allá de una configuración de monitores; es una convención, no una normativa.',
  },
  'clr-desk-depth-for-monitor': {
    context: 'espacio de trabajo',
    notes:
      'No se afirma un mínimo universal de profundidad total del escritorio. Muestra por separado la huella específica del soporte, la distancia de visualización, el espacio para cables y enchufes y la zona de teclado y ratón elegida por el usuario. CCOHS indica que la orientación sobre distancia de visualización varía y debe adaptarse a la persona y la tarea.',
  },
  'clr-monitor-gap': {
    context: 'espacio de trabajo',
    notes:
      'Separación habitual entre monitores adyacentes en una configuración con varias pantallas.',
  },
  'clr-bed-side-access': {
    context: 'dormitorio',
    notes:
      'Aplica la recomendación a cada lado accesible; las necesidades reales de acceso varían.',
    minimumNote:
      'No se afirma un mínimo normativo universal; cero representa una comprobación estricta de la huella del colchón únicamente.',
    recommendedNote: 'Orientación editorial sobre comodidad, no una normativa.',
  },
  'clr-bed-foot-access': {
    context: 'dormitorio',
    notes:
      'Supuesto de modelado de FitWise: 24 pulgadas al pie. Sleep Foundation habla del espacio alrededor de cada lado; aplicar esa cifra al pie es una extrapolación, no una recomendación directa de la fuente ni un mínimo normativo. El motor geométrico considera que el cabecero está contra una pared.',
    minimumNote:
      'No se afirma un mínimo normativo universal; cero representa una comprobación estricta de la huella del colchón únicamente.',
  },
  'clr-bed-furniture-access': {
    context: 'dormitorio',
    notes:
      'Úsalo para planificar el espacio entre la cama y un armario o una cómoda; el giro de las puertas y las necesidades del usuario pueden exigir más espacio.',
    minimumNote: 'No se afirma un mínimo normativo universal.',
    recommendedNote:
      'Convención de planificación de FitWise para un pasillo transitable; no es una norma de construcción ni de accesibilidad.',
  },
};

/**
 * Manual review: preserve US Full vs UK Standard Double and US King vs UK Standard King as distinct sizes.
 * The 24-inch bedside recommendation is source-based comfort guidance; the 24-inch foot allowance is an
 * explicit FitWise extrapolation. Keep both distinctions in any adapted renderer and retain source notes verbatim.
 */
export const FAMILY_COPY_MANUAL_REVIEW = [
  'Verify source-provided clearance notes/context at runtime; do not replace them with generic translations or drop qualifications.',
  'US Full is sometimes called Double but is not the UK Standard Double; US and UK King sizes are distinct.',
  'The side clearance and assumed foot clearance have different evidentiary status; preserve the explicit extrapolation and non-code caveat.',
  'Keep source/vendor names (including Sleep Foundation and IKEA frame model names) unchanged.',
] as const;
