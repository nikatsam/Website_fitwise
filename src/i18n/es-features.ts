import { ES_FAN_TREE_FEATURE_COPY } from './es-fan-tree-pages';

export type SpanishFeatureCopy = {
  intro: string;
  calculation: string;
  limitations: string[];
  relatedReasons?: Record<string, string>;
};

export const ES_FEATURE_COPY: Record<string, SpanishFeatureCopy> = {
  'pi-feature-fit-services-hub': {
    intro:
      'Usa esta herramienta avanzada cuando una calculadora específica no sea suficiente. Selecciona un modo de servicio, introduce las medidas reales y verifica los requisitos propios del modelo.',
    calculation:
      'Cada modo conserva sus propias medidas, requisitos de verificación, comprobaciones de ajuste físico, objetivos seleccionados y acciones siguientes en un único espacio de trabajo avanzado.',
    limitations: [
      'Los valores los introduce el usuario; ningún catálogo de productos completa las medidas que falten.',
      'Los valores de instalación, compatibilidad y seguridad deben obtenerse de los manuales o especificaciones actuales del producto exacto.',
      'Esta herramienta no sustituye la consulta detallada del manual ni una evaluación profesional.',
    ],
  },
  'pi-feature-fit-checks-directory': {
    intro:
      'Elige una calculadora específica para el objeto, espacio o recorrido que necesitas comprobar. Cada enlace abre directamente las medidas y los requisitos pertinentes del manual.',
    calculation:
      'Elige una herramienta adecuada para la tarea, introduce las dimensiones medidas y evalúa por separado el ajuste físico y los requisitos que hayas seleccionado o verificado.',
    limitations: [
      'Todas las medidas las introduce el usuario; no son valores predeterminados de productos.',
      'Los requisitos de instalación y seguridad específicos del manual deben verificarse en la fuente actual exacta.',
    ],
  },
  'pi-feature-garden-hub': {
    intro:
      'Usa las medidas reales del terreno y del espacio interior libre. Garden Fit distingue la huella de una estructura del voladizo del tejado, el espacio de mantenimiento, las rutas de acceso y las zonas de actividad que indiques.',
    calculation:
      'Elige una relación con el jardín, introduce las dimensiones del terreno o la distancia libre entre postes y compara el volumen físico con los objetivos de mantenimiento o acceso que selecciones.',
    limitations: [
      'No se supone que las dimensiones anunciadas del tejado equivalgan al espacio útil entre postes.',
      'No se evalúan permisos de urbanismo, cimientos, drenaje, cargas de viento, servicios ni seguridad.',
      'Las zonas de uso de los equipos de juego deben copiarse de las instrucciones exactas del fabricante.',
    ],
  },
  'pi-feature-will-it-fit': {
    intro:
      'Usa las dimensiones exteriores del objeto, incluido el embalaje al comprobar la entrega. La calculadora comprueba una huella de habitación alineada con los ejes, aberturas con el objeto en posición vertical y el ancho de un pasillo.',
    calculation:
      'La comprobación de la habitación compara ambas orientaciones rectangulares del suelo y la altura. La comprobación del recorrido usa una cara estrecha y la altura; no deduce una ruta de movimiento segura.',
    limitations: [
      'El modelo de recorrido no simula giros, inclinación, escaleras, asas, umbrales ni salientes del embalaje.',
      'El resultado es una estimación preliminar, no una garantía de entrega ni una determinación de accesibilidad.',
    ],
  },
  'pi-feature-dining': {
    intro:
      'Introduce las dimensiones exteriores de la mesa y las sillas. El cálculo separa la huella de la mesa y las sillas del espacio adicional para circular que elijas.',
    calculation:
      'Se comprueban ambas orientaciones de la mesa alineadas con los ejes. La anchura de los asientos en cada lado se compara con el lado correspondiente de la mesa; las huellas de las sillas se añaden fuera de los lados ocupados.',
    limitations: [
      'Esta versión modela mesas rectangulares y huellas de sillas rectangulares iguales.',
      'No evalúa la comodidad del asiento por persona, la disposición de cubiertos, geometrías redondas u ovaladas, accesibilidad ni anchuras de pasillo exigidas por normativa.',
    ],
    relatedReasons: {
      '/garden/patio-dining-fit/':
        'Para comprobar la distancia entre una mesa exterior y los postes de un cenador, use la comprobación de comedor en el patio.',
      '/rug-fit/':
        'Compare una alfombra medida con la huella de uso de mesa y sillas que quiera cubrir.',
    },
  },
  'pi-feature-workspace-hub': {
    intro:
      'Compare la anchura de las pantallas o de los dispositivos exactos con un escritorio medido y compruebe la profundidad del soporte y las zonas para cables y teclado que introduzca.',
    calculation:
      'La comprobación compartida de la configuración suma las anchuras exteriores o de pantalla de los monitores y las separaciones medidas. Se muestran por separado el margen físico de anchura y el margen tras los objetivos laterales.',
    limitations: [
      'Las anchuras derivadas solo de la pantalla se redondean al milímetro más cercano y excluyen los bordes y soportes.',
      'No se deducen la distancia de visualización ni la idoneidad ergonómica.',
    ],
  },
  'pi-feature-bedroom': {
    intro:
      'Empieza con una cama y una habitación medidas. Puedes usar dimensiones personalizadas en cualquier mercado; los ajustes preestablecidos de mercado o modelo se identifican como ejemplos.',
    calculation:
      'La huella física del colchón o armazón se separa de los objetivos laterales y al pie seleccionados por el usuario y de las comprobaciones activadas de colisión con muebles.',
    limitations: [
      'El saliente del armazón y las dimensiones del producto varían según el modelo.',
      'Los objetivos de espacio libre son supuestos de planificación, no mínimos universales ni requisitos de normativa local.',
    ],
    relatedReasons: {
      '/rug-fit/':
        'Compare una alfombra con la huella medida de la cama o la zona de uso que quiera cubrir.',
    },
  },
  'pi-feature-rug-fit': {
    intro:
      'Usa una sola herramienta para comprobar una alfombra en un salón, dormitorio, comedor u otro espacio rectangular. Introduce las dimensiones de la alfombra y la habitación; si quieres, comprueba también una huella medida de muebles o de uso.',
    calculation:
      'La herramienta prueba ambas orientaciones de la alfombra alineadas con los ejes respecto a la habitación medida. Por separado, compara la alfombra con una huella completa de muebles o uso, o con el solapamiento del borde delantero y la proyección que seleccione el usuario.',
    limitations: [
      'La vista de la habitación centra la alfombra para una comparación proporcional; no es un diseñador de distribución de muebles ni de planos.',
      'Las habitaciones, alfombras y zonas de muebles o uso se tratan como rectángulos. No se modelan formas irregulares, colocación diagonal, materiales reales de alfombra ni la ubicación exacta de las patas.',
      'Los bordes de pared y muebles, el solapamiento frontal y la proyección hacia delante son valores de distribución elegidos por el usuario, no recomendaciones de estilo ni normas universales.',
      'En un comedor, incluye la zona de uso de las sillas solo si quieres cubrirla por completo con la alfombra; no se deduce ninguna regla de asientos o comodidad.',
    ],
    relatedReasons: {
      '/fit-checks/': 'Explora las demás calculadoras de ajuste por tarea.',
      '/bedroom/':
        'Comprueba una cama completa y la distribución del dormitorio con la herramienta específica para dormitorios.',
      '/dining/':
        'Comprueba por separado la mesa, las huellas de las sillas apartadas y la circulación de la habitación.',
    },
  },
  'pi-feature-about': {
    intro:
      'Fitwise ayuda a comparar objetos medidos con habitaciones, superficies de trabajo y aberturas antes de comprar, distribuir o trasladar objetos.',
    calculation:
      'En las herramientas y el registro de fuentes se distinguen los datos de productos, la geometría derivada y los supuestos seleccionados por el usuario.',
    limitations: [
      'Fitwise es el nombre de una publicación; esta página no atribuye la autoría a una persona ni afirma una identidad corporativa.',
      'Se aceptan correcciones mediante la plantilla pública de incidencias de GitHub; no se promete un plazo de respuesta.',
    ],
  },
  'pi-feature-methodology': {
    intro:
      'Fitwise normaliza las dimensiones en milímetros y mantiene separados los datos medidos de productos, los cálculos geométricos y los supuestos seleccionados por el usuario.',
    calculation:
      'Se compara una dimensión física con el espacio disponible. Un objetivo opcional añade una comparación aparte; su margen no equivale al margen físico.',
    limitations: [
      'Los cálculos no sustituyen los manuales, el criterio profesional, la revisión de la normativa de construcción, la revisión de accesibilidad ni una evaluación de seguridad.',
    ],
  },
  'pi-feature-reference-conventions': {
    intro:
      'Esta referencia explica cómo interpretar el estado de las fuentes, las medidas de referencia internas, el redondeo mostrado y la diferencia entre margen físico y margen respecto al objetivo.',
    calculation:
      'Los milímetros son la unidad interna de cálculo; las dimensiones públicas usan el formato de medidas canónico.',
    limitations: [
      'Las referencias internas con valores redondos son decisiones de modelado, no leyes, especificaciones de producto ni mínimos ergonómicos universales.',
    ],
  },
  'pi-feature-appliances-hub': {
    intro:
      'Las dimensiones del electrodoméstico por sí solas no determinan si cabe instalado. Usa las dimensiones exteriores, las dimensiones libres de la abertura y el manual vigente para las holguras de ventilación, mangueras, enchufe y mantenimiento.',
    calculation:
      'La herramienta compartida compara el objeto físico con la abertura disponible y muestra por separado el espacio de instalación indicado en el manual o por el usuario.',
    limitations: [
      'No se proporciona un catálogo de modelos de fabricantes ni una holgura de ventilación mínima genérica.',
      'El acceso de entrega se comprueba por separado de la instalación en el mueble.',
    ],
  },
  'pi-feature-access-hub': {
    intro:
      'Mide las aberturas libres y los tramos más estrechos de la ruta. La herramienta informa de las dimensiones limitantes en lugar de suponer si un objeto puede inclinarse o maniobrarse.',
    calculation:
      'Las aberturas verticales usan la cara estrecha y la altura del objeto. Un giro usa una envolvente diagonal conservadora y puede descartar rutas que un equipo de mudanza sí podría recorrer.',
    limitations: [
      'No es un solucionador de movimiento 3D y no simula inclinaciones, elevación, escaleras ni técnicas de manipulación.',
    ],
  },
  'pi-feature-tv-hub': {
    intro:
      'La diagonal de pantalla anunciada no equivale al ancho y la altura exteriores del televisor. Introduce los valores exactos del modelo y del manual para la configuración prevista.',
    calculation:
      'El modo de soporte compara las huellas exteriores con una consola. El modo de pared comprueba la envolvente de pared o nicho y la compatibilidad exacta del patrón VESA y la carga nominal.',
    limitations: [
      'No se deducen catálogos de modelos, estructura de pared ni idoneidad de los elementos de fijación.',
      'La ubicación de la barra de sonido se comprueba como una huella de superficie aparte.',
    ],
  },
  'pi-feature-home-gym-hub': {
    intro:
      'Separe la huella del equipo del espacio de movimiento necesario para el ejercicio y el modelo concretos.',
    calculation:
      'La herramienta compara anchura, profundidad y altura, y luego añade las zonas de operación que introduzca como objetivos separados.',
    limitations: [
      'Las zonas de seguridad y operación deben obtenerse del manual exacto o del criterio del usuario.',
      'No se evalúan el anclaje, la carga del suelo ni la técnica de ejercicio.',
    ],
  },
  'pi-feature-storage-hub': {
    intro:
      'Mide las dimensiones interiores útiles y los objetos que quieres guardar, no el tamaño exterior nominal de la unidad.',
    calculation:
      'La calculadora prueba ambas orientaciones de la cuadrícula en el suelo e informa de una cantidad en una sola capa con la separación y el pasillo que haya indicado.',
    limitations: [
      'No modela objetos variados, apilamiento, límites de carga, soportes ni una distribución óptima.',
    ],
  },
  'pi-feature-game-room-hub': {
    intro:
      'Empieza con las dimensiones exteriores de la mesa y el largo real del taco que usarás. No te bases solo en la denominación de la mesa.',
    calculation:
      'La herramienta de billar suma la longitud indicada del taco a cada lado de la huella de la mesa y mantiene aparte el espacio adicional para caminar.',
    limitations: [
      'No se simulan tiros en ángulo, postura del jugador, altura del taco, troneras ni otros muebles.',
    ],
  },
  'pi-feature-vehicle-hub': {
    intro:
      'Mide el vehículo con los espejos y accesorios en la configuración de estacionamiento prevista.',
    calculation:
      'El ajuste físico del vehículo, la abertura de la puerta del garaje y los objetivos de acceso con las puertas abiertas son comprobaciones separadas.',
    limitations: [
      'No hay una base de datos de especificaciones de vehículos ni una simulación de maniobras de dirección o entrada desde la vía.',
    ],
  },
  'pi-feature-appliance-install': {
    intro:
      'Usa las dimensiones exteriores del electrodoméstico y las dimensiones interiores libres de la abertura. Introduce los márgenes laterales, traseros y superiores indicados en el manual de instalación exacto; cero significa que no se incluyó el margen de instalación.',
    calculation:
      'Primero se calcula el ajuste físico de anchura, profundidad y altura. Después se muestran las holguras laterales, traseras y superiores exigidas por el manual como dimensiones objetivo y márgenes respecto al objetivo.',
    limitations: [
      'La calculadora no incluye mangueras, curvas del cable, apertura de puertas, embalaje ni ruta de entrega.',
      'No se afirma ninguna holgura genérica de ventilación o mantenimiento.',
    ],
    relatedReasons: {
      '/appliances/fridge-fit/':
        'Si comprueba un modelo de frigorífico, compare aquí sus valores de abertura y ventilación.',
      '/appliances/washer-fit/':
        'Si comprueba una lavadora, use las holguras de conexión y mantenimiento específicas de su modelo.',
      '/access/furniture-route-fit/':
        'Tras comprobar la abertura de instalación, verifique las puertas, pasillos, giros y escaleras de la ruta de entrega.',
    },
  },
  'pi-feature-fridge-fit': {
    intro:
      'Mide las dimensiones exteriores del frigorífico, incluidas las asas y los accesorios, y mide la abertura por sus puntos más estrechos.',
    calculation:
      'La página comprueba por separado anchura, profundidad y altura. Las holguras trasera, superior y laterales son objetivos separados que se introducen desde el manual del modelo exacto.',
    limitations: [
      'La apertura de puertas, la inversión de bisagras, la toma de agua, la ventilación y el acceso de entrega requieren comprobaciones separadas según el manual del electrodoméstico y la ruta.',
    ],
    relatedReasons: {
      '/appliances/appliance-install-fit/':
        'Comprueba por separado la abertura del mueble y las holguras de instalación del modelo exacto; el giro de la puerta del frigorífico sigue dependiendo del manual.',
      '/access/furniture-route-fit/':
        'Si hay que llevar el frigorífico hasta la habitación, compruebe por separado cada puerta, giro y escalera de la ruta de entrega.',
    },
  },
  'pi-feature-washer-fit': {
    intro:
      'Introduce las dimensiones exteriores del modelo exacto de lavadora y las dimensiones libres de la abertura, medidas en su punto más estrecho.',
    calculation:
      'La anchura, profundidad y altura físicas se comprueban por separado; las mangueras, el desagüe, la vibración trasera y el espacio de mantenimiento lateral y superior se introducen desde el manual vigente.',
    limitations: [
      'La herramienta no afirma una holgura de vibración genérica, una ventilación mínima ni una distancia normativa.',
      'No se simulan la apertura de la puerta, el saliente de las conexiones ni la ruta de entrega.',
    ],
    relatedReasons: {
      '/access/furniture-route-fit/':
        'Comprueba las aberturas y los giros de entrega si tienes que trasladar la lavadora por la vivienda.',
    },
  },
  'pi-feature-furniture-route': {
    intro:
      'Mide el objeto con el embalaje y después la abertura libre en cada punto limitante de la ruta.',
    calculation:
      'Se comprueban cada puerta, pasillo, anchura y altura libre de escaleras y abertura de destino. Los giros usan una envolvente diagonal conservadora de la huella.',
    limitations: [
      'No se usa un solucionador de movimiento de traslación o rotación; el límite del giro puede descartar rutas que el personal de mudanza sí podría recorrer.',
      'Se excluyen la inclinación, elevación, asas, umbrales y flexibilidad del embalaje.',
    ],
    relatedReasons: {
      '/will-it-fit/':
        'Tras comprobar la ruta, compare el objeto con el espacio de destino mediante la comprobación general de ajuste.',
    },
  },
  'pi-feature-workspace-compatibility': {
    intro:
      'Mide el monitor sin su soporte y copia el peso, el patrón VESA y los límites de carga y sujeción de los manuales exactos del monitor y del brazo.',
    calculation:
      'La calculadora comprueba la anchura del monitor y la profundidad conjunta del monitor y la base del brazo respecto al escritorio, el grosor del escritorio respecto a los límites de la abrazadera, la compatibilidad exacta del patrón VESA y el peso del monitor respecto a la carga nominal del brazo.',
    limitations: [
      'No se incluye un catálogo de brazos para monitor ni una base de datos de compatibilidad de adaptadores.',
      'No se modelan el alcance del brazo, las colisiones con paredes, el espacio para cables ni la resistencia de la superficie de montaje.',
    ],
    relatedReasons: {
      '/workspace/monitor-size-chart/':
        'Compare las dimensiones de pantalla y luego use las dimensiones exteriores exactas del producto para comprobar el brazo y el escritorio.',
    },
  },
  'pi-feature-tv-stand-fit': {
    intro:
      'Introduce el ancho y la altura exteriores reales según la documentación del televisor. La diagonal de pantalla no sustituye las dimensiones del dispositivo.',
    calculation:
      'El modo de soporte comprueba las huellas del televisor, el soporte y la barra de sonido respecto a una consola; el modo de pared comprueba la envolvente de pantalla, los patrones VESA exactos y la carga nominal.',
    limitations: [
      'La colocación conjunta del soporte y la barra de sonido se comprueba por separado; no se calcula su distribución ni solapamiento.',
      'No se evalúan la construcción de la pared, los elementos de fijación, la ubicación de los montantes ni la distancia de visualización.',
    ],
  },
  'pi-feature-power-rack-fit': {
    intro:
      'Mide las dimensiones exteriores del soporte de potencia, la altura del techo y la zona de operación para el ejercicio y la configuración del equipo previstos.',
    calculation:
      'Primero se comprueban la huella física y la altura del equipo; las zonas laterales, frontales y superiores seleccionadas por el usuario o el manual aparecen como objetivos separados.',
    limitations: [
      'No se proporciona una distancia de seguridad predeterminada.',
      'No se modelan el anclaje, la carga del suelo, la trayectoria de la barra, los discos, la técnica de levantamiento ni el movimiento del equipo.',
    ],
    relatedReasons: {
      '/access/furniture-route-fit/':
        'Comprueba la ruta de entrega del soporte por separado de su huella y zona de operación en la habitación.',
      '/storage/what-fits-in-storage/':
        'Calcule el espacio de almacenamiento para accesorios de gimnasio por separado; esto no combina las huellas de varios equipos.',
    },
  },
  'pi-feature-storage-capacity': {
    intro:
      'Mide las dimensiones interiores útiles, los objetos, la separación y el pasillo. El tamaño nominal de la unidad de almacenamiento puede diferir del espacio interior útil.',
    calculation:
      'Una cuadrícula rectangular prueba ambas orientaciones en el suelo y comprueba la altura; la cantidad solicitada se compara con una estimación de capacidad en una sola capa.',
    limitations: [
      'Se excluyen los objetos de tamaños variados, el apilamiento, las cargas nominales, los soportes de estanterías y la optimización de rutas de pasillo.',
      'El objetivo de anchura del pasillo lo introduce el usuario; no es una norma de accesibilidad.',
    ],
    relatedReasons: {
      '/garden/shed-interior-storage/':
        'Para un cobertizo, compare el interior real y el pasillo con los objetos que piensa guardar.',
    },
  },
  'pi-feature-pool-table-fit': {
    intro:
      'Usa las dimensiones exteriores de la mesa y la longitud real del taco que se utilizará en la habitación.',
    calculation:
      'La longitud del taco se añade a cada lado de la mesa para mostrar una envolvente rectangular de juego; el espacio adicional es un objetivo separado indicado por el usuario.',
    limitations: [
      'No se simulan tiros en ángulo, postura del jugador, elevación del taco, troneras ni muebles.',
      'No es una evaluación de trayectoria del taco ni de seguridad.',
    ],
    relatedReasons: {
      '/access/furniture-route-fit/':
        'La comprobación de espacio para la mesa de billar no verifica la entrega; mida por separado las puertas, los giros y las escaleras.',
    },
  },
  'pi-feature-vehicle-garage': {
    intro:
      'Introduce las dimensiones exteriores reales del vehículo con los espejos y accesorios en la configuración prevista para estacionar.',
    calculation:
      'La huella física para estacionar se separa de la abertura del garaje, la proyección de las puertas y los objetivos delanteros, traseros y superiores.',
    limitations: [
      'No hay una base de datos de dimensiones de vehículos.',
      'No se simulan la aproximación desde la entrada, la dirección, los giros, las rampas, los raíles del garaje ni las trayectorias de apertura de las puertas.',
    ],
  },
  'pi-feature-garden-structure': {
    intro:
      'Introduce por separado las dimensiones del cuerpo y del tejado o alero; en el modo inverso, compara los anchos y las profundidades candidatas que indiques con el terreno.',
    calculation:
      'Primero se compara la huella física del cuerpo y el tejado; después se muestran por separado los objetivos de mantenimiento y recorrido de la puerta.',
    limitations: [
      'El modelo es una envolvente rectangular y no evalúa cimientos, escorrentía del tejado, pendiente, anclaje, servicios ni permisos de urbanismo.',
      'Los tamaños candidatos son ejemplos introducidos por el usuario, no estándares de vendedores.',
    ],
  },
  'pi-feature-garden-patio-dining': {
    intro:
      'Usa la dimensión libre entre postes u obstáculos. La distancia anunciada entre bordes del tejado se muestra solo para comparar y no se considera superficie de suelo útil.',
    calculation:
      'La geometría compartida de comedor comprueba las orientaciones de la mesa, la anchura de los asientos y las huellas de las sillas respecto al espacio libre y al objetivo de circulación seleccionado por el usuario.',
    limitations: [
      'Se excluyen vientos de sujeción, paredes laterales, patas inclinadas, anclaje y huellas no rectangulares.',
      'El espacio para caminar lo selecciona el usuario; no es una norma universal para cenadores.',
    ],
    relatedReasons: {
      '/dining/':
        'Usa la comprobación de comedor para interiores para comparar la mesa, las sillas apartadas y el objetivo de paso que elijas.',
      '/garden/structure-fit/':
        'Comprueba la huella de la estructura del cenador, el voladizo del tejado y el espacio de mantenimiento respecto al terreno.',
    },
  },
  'pi-feature-garden-shed-storage': {
    intro:
      'Introduce las dimensiones interiores en vez del tamaño exterior anunciado del cobertizo y compara la huella repetida de los objetos con el pasillo que quieras mantener libre.',
    calculation:
      'Una cuadrícula sencilla en dos orientaciones estima la capacidad de objetos en una capa y compara el pasillo medido con el objetivo indicado.',
    limitations: [
      'No se modelan distribuciones mixtas de cortacéspedes, bicicletas o estantes, ganchos de pared, apilamiento, cargas nominales ni optimización de rutas para caminar.',
      'El pasillo es un objetivo elegido, no un mínimo normativo.',
    ],
  },
  'pi-feature-garden-greenhouse': {
    intro:
      'Introduce las dimensiones exteriores del tejado o cuerpo y el ancho interior libre. Los bancos de cultivo reducen el ancho restante del pasillo central.',
    calculation:
      'La calculadora comprueba la envolvente exterior respecto a las dimensiones del terreno y compara la anchura interior menos la profundidad de ambos bancos con el objetivo de pasillo elegido.',
    limitations: [
      'No se evalúan la ubicación, la luz, la ventilación, el drenaje, el acristalamiento, la carga de viento ni los cimientos.',
      'No se deduce una anchura mínima de pasillo para horticultura.',
    ],
  },
  'pi-feature-garden-hot-tub': {
    intro:
      'Usa el manual del modelo para el espacio de acceso al panel de mantenimiento, la elevación de la cubierta y el acceso eléctrico. Introduce las dimensiones exteriores de la bañera y un rectángulo de patio útil.',
    calculation:
      'La anchura y profundidad físicas de la bañera se comprueban por separado de los objetivos laterales de mantenimiento, del panel frontal y de la cubierta superior.',
    limitations: [
      'No se evalúan el peso con agua, la resistencia de la base, el drenaje, la instalación eléctrica ni la ruta de entrega.',
      'No se proporciona una holgura genérica de mantenimiento para bañeras de hidromasaje.',
    ],
  },
  'pi-feature-garden-outdoor-kitchen': {
    intro:
      'Mide el conjunto completo, el patio y las holguras de mantenimiento de los módulos y electrodomésticos exactos.',
    calculation:
      'La huella física de la cocina se separa de los objetivos de mantenimiento laterales, traseros y del espacio de trabajo frontal.',
    limitations: [
      'No se comprueban el gas, la electricidad, la separación de calor o fuego, la ventilación, el drenaje ni el soporte estructural.',
      'Los requisitos del fabricante y de la normativa local deben verificarse por separado.',
    ],
  },
  'pi-feature-garden-play': {
    intro:
      'La comprobación de la zona de uso está incompleta hasta que introduzcas la referencia exacta del manual y del modelo y todos los lados de la zona indicada por el fabricante.',
    calculation:
      'La huella física del equipo y la envolvente de la zona de uso indicada en el manual son dimensiones separadas; la calculadora solicita una revisión cuando la zona de uso no está verificada.',
    limitations: [
      'No se proporciona una zona de seguridad o caída genérica.',
      'No se evalúan el impacto de la superficie, el anclaje, la supervisión, los peligros superiores ni los requisitos legales.',
    ],
  },
  ...ES_FAN_TREE_FEATURE_COPY,
};
