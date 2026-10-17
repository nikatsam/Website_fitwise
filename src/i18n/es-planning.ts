export interface PlanningCopyEntry {
  intro: string;
  sectionTitle: string;
  factLabels: Readonly<Record<string, string>>;
  assumptions: readonly string[];
}

export const ES_PLANNING_COPY: Readonly<Record<string, PlanningCopyEntry>> = {
  'pi-p015-desk-depth-for-monitor': {
    intro:
      'El ejemplo del Samsung Smart Monitor M7 M70B muestra por qué el tamaño de pantalla no equivale a la profundidad del escritorio: la base documentada mide {standDepth} de profundidad, mientras que el panel sin base mide {displayDepth}. En un escritorio de referencia nominal de {deskDepth}, al colocar la base alineada con el borde trasero quedan {remainingSurface} de superficie delante de ella. Ese espacio restante no determina una distancia cómoda de visualización ni permite confirmar que quepan un teclado, la curva del cable u otros equipos.',
    sectionTitle: 'Mide la estación de trabajo completa, no la diagonal de la pantalla',
    factLabels: {
      'Model-specific width with stand': 'Ancho específico del modelo con base',
      'Monitor depth with stand': 'Profundidad del monitor con base',
      'Monitor body depth without stand': 'Profundidad del cuerpo del monitor sin base',
      'Nominal reference desk depth': 'Profundidad nominal del escritorio de referencia',
      'Desktop surface in front of stand if flush to rear edge':
        'Superficie del escritorio delante de la base si queda alineada con el borde trasero',
      'CCOHS average resting point of accommodation':
        'Punto de acomodación en reposo promedio según CCOHS',
      'Cable, plug and ventilation space': 'Espacio para cables, enchufe y ventilación',
    },
    assumptions: [
      'Las medidas del Samsung corresponden a un ejemplo específico del modelo M70B; los cuerpos y las bases de otros monitores son distintos.',
      'CCOHS indica que las recomendaciones sobre distancia de visualización varían. Su cifra aproximada de 80 cm para el punto de acomodación en reposo es un contexto fisiológico, no un mínimo universal para una estación de trabajo; la longitud del brazo es solo una estimación inicial.',
      'La distancia entre los ojos y la pantalla se mide desde los ojos del usuario hasta la pantalla, no desde el borde delantero del escritorio. No se modelan la postura, la posición del teclado y el ratón, los conectores de cables ni la ventilación del monitor.',
      'No se afirma que exista una profundidad total mínima universal para un escritorio. Mide la configuración real y mantén diferenciadas la profundidad del escritorio, la huella de la base, la distancia de visualización y las zonas para cables y teclado.',
    ],
  },
  'pi-p018-desk-chair-clearance': {
    intro:
      'El ejemplo de la Herman Miller Aeron Size B tiene una huella exterior máxima publicada de aproximadamente {chairWidth} de ancho por {chairDepth} de profundidad, según la configuración de los brazos. Estas son las dimensiones del cuerpo de la silla, no el espacio necesario para echarla hacia atrás, girar o pasar por detrás. CCOHS indica que la silla debe adaptarse al cuerpo del usuario, a su estación de trabajo y a la tarea, y no establece una holgura numérica universal para el movimiento.',
    sectionTitle: 'Ejemplo de silla medida por el fabricante',
    factLabels: {
      'Maximum listed outer width': 'Ancho exterior máximo indicado',
      'Maximum listed overall depth': 'Profundidad total máxima indicada',
      'Maximum listed overall height': 'Altura total máxima indicada',
      'Seat depth': 'Profundidad del asiento',
      'Movement/pull-back zone': 'Zona de movimiento y retroceso',
    },
    assumptions: [
      'El ancho y la profundidad exteriores usan los máximos del rango publicado por el fabricante para la Size B, para no subestimar su huella.',
      'Para una silla estacionada completamente fuera del escritorio, añada la zona de retroceso elegida por el usuario a la proyección medida de la silla. Si la silla se guarda parcialmente bajo el escritorio, mida la proyección expuesta en esa configuración real en vez de añadir toda la profundidad de la silla.',
      'La ruta despejada, el espacio para girar, el ancho de los apoyabrazos y el comportamiento de las ruedas dependen de la persona y de la habitación; esta página no los convierte en mínimos normativos ni ergonómicos.',
    ],
  },
  'pi-p034-space-bed-wardrobe': {
    intro:
      'Este ejemplo de armario IKEA PAX/GRIMO de dos puertas, comercializado en EE. UU., mide el barrido de la puerta para compararlo con una cama en la habitación real. Cada hoja GRIMO mide {doorWidth} de ancho, por lo que al abrirla 90 grados sobresale aproximadamente {doorSweep} desde el frente del armario. Es una envolvente de colisión específica del producto, no una distribución de habitación con cama y armario emparejados ni una recomendación de pasillo o tamaño mínimo de habitación.',
    sectionTitle: 'Medidas del armario y envolvente de la puerta',
    factLabels: {
      'Wardrobe outer width': 'Ancho exterior del armario',
      'Wardrobe outer depth': 'Profundidad exterior del armario',
      'One hinged door leaf': 'Una hoja de puerta con bisagras',
      'Door projection at 90 degrees': 'Proyección de la puerta a 90 grados',
    },
    assumptions: [
      'A 90 grados, un panel con bisagras sobresale aproximadamente su propio ancho desde la línea de las bisagras; los detalles de la manija, las bisagras y el tope de apertura pueden variar.',
      'Aquí solo se dimensiona el armario. Mide la posición real de la cama y el somier, así como otros obstáculos, para determinar si interfieren con la trayectoria de apertura.',
      'El cálculo no proporciona un plano completo de la habitación ni añade un pasillo para caminar o acceder.',
    ],
  },
  'pi-p035-bed-dresser-clearance': {
    intro:
      'El ejemplo de la cómoda IKEA HEMNES de 8 cajones tiene una profundidad cerrada de {dresserDepth} y una extracción de cajón de {drawerPullout} indicada por el fabricante. Si la parte trasera queda alineada con una pared, el cajón completamente abierto llega aproximadamente a {wallToFront} de esa pared. Mantén despejada la trayectoria de extensión del cajón; esto no es espacio para estar de pie ni para caminar.',
    sectionTitle: 'Extensión del cajón y ejemplo de cama',
    factLabels: {
      'Dresser outer width': 'Ancho exterior de la cómoda',
      'Dresser closed depth': 'Profundidad de la cómoda cerrada',
      'Drawer pull-out': 'Extensión del cajón',
      'Wall to fully extended drawer front (dresser flush to wall)':
        'Distancia desde la pared hasta el frente del cajón completamente extendido (cómoda alineada con la pared)',
      '{frameModelName} outer frame width': 'Ancho exterior del somier {frameModelName}',
      '{frameModelName} outer frame length': 'Largo exterior del somier {frameModelName}',
    },
    assumptions: [
      'La extensión del cajón corresponde a la medida de extracción indicada para ese producto; otras cómodas y guías pueden diferir.',
      'El cálculo de la distancia entre la pared y el frente supone que la parte trasera de la cómoda queda alineada con la pared. La cama es un ejemplo medido de tamaño UK Standard Double; no se modela la orientación dentro de la habitación.',
      'La zona de colisión del cajón abierto es independiente del espacio para estar de pie o trabajar que elija el usuario; no se afirma ningún mínimo universal de acceso.',
    ],
  },
  'pi-p036-king-bed-nightstands-room': {
    intro:
      'La suma de {bedName} y dos unidades de {tableName} tiene un ancho combinado de {combinedWidth} si las mesitas quedan alineadas con los bordes del colchón, sin espacios entre ellos. Es una suma de huellas de muebles, no una recomendación sobre el tamaño de la habitación: no incluye el somier, los espacios entre muebles, el acceso por los lados de la cama ni el espacio para caminar.',
    sectionTitle: 'Huellas de la cama y las mesitas de noche',
    factLabels: {
      Market: 'Mercado',
      'Bed mattress width': 'Ancho del colchón',
      'Bed mattress length': 'Largo del colchón',
      '{tableName} width (each)': 'Ancho de {tableName} (cada una)',
      '{tableName} depth (each)': 'Profundidad de {tableName} (cada una)',
      'Combined width (bed + two tables, zero gaps)':
        'Ancho combinado (cama y dos mesitas, sin espacios)',
    },
    assumptions: [
      'La cama utiliza la huella nominal de un colchón de EE. UU.; para este ejemplo no se obtuvieron medidas de un somier estadounidense.',
      'La mesita de noche es un modelo IKEA del Reino Unido cuyas dimensiones fueron medidas. Es un ejemplo dimensional, no un conjunto de dormitorio del fabricante diseñado para combinar con la cama estadounidense.',
      'No se incluye espacio para caminar o estar de pie ni separación entre muebles. Mide el somier elegido y el acceso deseado a ambos lados antes de decidir si la distribución funciona.',
    ],
  },
  'pi-p037-queen-bed-nightstands-room': {
    intro:
      'La suma de {bedName} y dos unidades de {tableName} tiene un ancho combinado de {combinedWidth} si las mesitas quedan alineadas con los bordes del colchón, sin espacios entre ellos. Es una suma de huellas de muebles, no una recomendación sobre el tamaño de la habitación: no incluye el somier, los espacios entre muebles, el acceso por los lados de la cama ni el espacio para caminar.',
    sectionTitle: 'Huellas de la cama y las mesitas de noche',
    factLabels: {
      Market: 'Mercado',
      'Bed mattress width': 'Ancho del colchón',
      'Bed mattress length': 'Largo del colchón',
      '{tableName} width (each)': 'Ancho de {tableName} (cada una)',
      '{tableName} depth (each)': 'Profundidad de {tableName} (cada una)',
      'Combined width (bed + two tables, zero gaps)':
        'Ancho combinado (cama y dos mesitas, sin espacios)',
    },
    assumptions: [
      'La cama utiliza la huella nominal de un colchón de EE. UU.; para este ejemplo no se obtuvieron medidas de un somier estadounidense.',
      'La mesita de noche es un modelo IKEA del Reino Unido cuyas dimensiones fueron medidas. Es un ejemplo dimensional, no un conjunto de dormitorio del fabricante diseñado para combinar con la cama estadounidense.',
      'No se incluye espacio para caminar o estar de pie ni separación entre muebles. Mide el somier elegido y el acceso deseado a ambos lados antes de decidir si la distribución funciona.',
    ],
  },
};
