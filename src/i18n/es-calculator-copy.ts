/**
 * Exact English-to-Spanish copy catalog for shared fit calculators and their
 * client-side runtime. Keys are source strings, not identifiers: callers can
 * look up only an exact match and must not silently fall back to English.
 *
 * Dynamic copy is kept in calculatorCopyTemplates with named placeholders.
 * Template source locations include src/components/fit/CalculatorStep.astro,
 * src/lib/fit/copy-report.ts, src/lib/fit/candidate-size-editor.ts and
 * src/scripts/{bedroom,workspace,universal,dining,rug}-fitcheck.ts.
 */
export const esCalculatorCopy: Readonly<Record<string, string>> = {
  'Manufacturer play-equipment use zone':
    'Zona de uso del equipo de juego definida por el fabricante',
  'equipment footprint and manufacturer use zone width':
    'ancho de la huella del equipo y de la zona de uso del fabricante',
  'Service-panel and cover-removal clearances have not been verified against the exact tub model.':
    'Las holguras para acceder al panel de mantenimiento y retirar la tapa no se han verificado para el modelo exacto de la bañera.',
  'Hot-tub service and cover instructions':
    'Instrucciones de mantenimiento y de la tapa de la bañera de hidromasaje',
  'appliance and side installation space': 'electrodoméstico y espacio lateral de instalación',
  'Add the exact model manual or manufacturer specification.':
    'Añade el manual del modelo exacto o la especificación del fabricante.',
  'Enter all four use-zone dimensions and the exact manual/model reference.':
    'Introduce las cuatro dimensiones de la zona de uso y la referencia del manual o modelo exacto.',
  'Add the exact hot-tub manual or manufacturer specification reference.':
    'Añade la referencia del manual de la bañera de hidromasaje o de la especificación del fabricante del modelo exacto.',
  'front door width (upright, no tilt)': 'ancho de la puerta delantera (en vertical, sin inclinar)',
  'door projection and selected approach path width':
    'saliente de la puerta y ancho del recorrido de acceso seleccionado',
  'wheelbarrow width through greenhouse door':
    'ancho de la carretilla para pasar por la puerta del invernadero',
  'Check fuel, electrical, heat and local installation requirements separately.':
    'Comprueba por separado los requisitos de combustible, electricidad, calor e instalación local.',
  'Reserve work and service clearances from the exact manufacturer instructions.':
    'Reserva las holguras de trabajo y mantenimiento que indiquen las instrucciones del fabricante del modelo exacto.',
  'Check the exact manufacturer installation instructions and local planning requirements separately.':
    'Comprueba por separado las instrucciones de instalación del fabricante del modelo exacto y los requisitos locales de planificación.',
  'Check required impact-attenuating surface and installation rules with the manufacturer and relevant authority.':
    'Comprueba con el fabricante y la autoridad competente los requisitos de superficie amortiguadora de impactos y las normas de instalación.',
  'Have the exact equipment dimensions and measure usable floor area and ceiling height.':
    'Ten las dimensiones exactas del equipo y mide la superficie útil del suelo y la altura del techo.',
  'Have the exact equipment model instructions and its manufacturer-defined use-zone dimensions.':
    'Ten las instrucciones del modelo exacto del equipo y las dimensiones de la zona de uso definidas por el fabricante.',
  'Check the manufacturer’s operating/access-zone requirements, anchoring instructions and floor-loading data.':
    'Comprueba los requisitos del fabricante para la zona de funcionamiento y acceso, las instrucciones de anclaje y los datos de carga del suelo.',
  'Have the exact model manual or manufacturer specification for required side, rear and ventilation clearances.':
    'Ten el manual o la especificación del fabricante del modelo exacto para las holguras laterales, traseras y de ventilación necesarias.',
  'Measure the exact appliance outside dimensions and the usable installation opening.':
    'Mide las dimensiones exteriores exactas del electrodoméstico y la abertura útil de instalación.',
  'Measure the exact tub footprint, patio area and cover-lift path/height.':
    'Mide la huella exacta de la bañera, el área del patio y la trayectoria/altura para levantar la tapa.',
  'Use table/cue manufacturer dimensions where available; the cue envelope is a plan-view estimate.':
    'Usa las dimensiones de la mesa y del taco indicadas por el fabricante cuando estén disponibles; la envolvente del taco es una estimación en planta.',
  'Use the table’s exact outside dimensions and the cue length you plan to use.':
    'Usa las dimensiones exteriores exactas de la mesa y el largo del taco que piensas usar.',
  'Measure the TV’s outside dimensions and the wall’s usable width and height.':
    'Mide las dimensiones exteriores del televisor y el ancho y la altura útiles de la pared.',
  'Measure the TV, stand footprint and console’s usable top dimensions.':
    'Mide el televisor, la huella del soporte y las dimensiones útiles de la superficie del mueble.',
  'For an installation or delivery path, gather the current model instructions and each doorway, turn and stair measurement.':
    'Para una ruta de instalación o entrega, reúne las instrucciones vigentes del modelo y mide cada puerta, giro y escalón.',
  'Check the item’s actual handling/orientation plan separately; the route sketch is a dimensional screen.':
    'Comprueba por separado el plan real de manipulación y orientación del artículo; el esquema de la ruta solo evalúa dimensiones.',
  'Measure the item’s widest, deepest and tallest fixed outside points; include packaging for delivery checks.':
    'Mide los puntos exteriores fijos más anchos, profundos y altos del artículo; incluye el embalaje para las comprobaciones de entrega.',
  'derived from diagonal, screen only': 'derivado de la diagonal; solo la pantalla',
  'Measure each object’s outside width, depth and height and decide whether it is stored upright or flat.':
    'Mide el ancho, la profundidad y la altura exteriores de cada objeto y decide si se almacena en vertical o en horizontal.',
  'Measure each stored object and decide whether it is stored upright or flat.':
    'Mide cada objeto almacenado y decide si se guarda en vertical o en horizontal.',
  'Measure the item at its widest, deepest and tallest points, including packaging if it stays on during delivery.':
    'Mide el artículo en sus puntos más anchos, profundos y altos, incluido el embalaje si se mantiene durante la entrega.',
  'Measure the actual vehicle width and length, including mirrors or accessories that stay on while parking.':
    'Mide el ancho y el largo reales del vehículo, incluidos los retrovisores o accesorios que permanezcan al estacionar.',
  'Measure the usable space or opening at its narrowest clear points.':
    'Mide el espacio útil o la abertura en sus puntos libres más estrechos.',
  'See measurements': 'Ver medidas',
  Measurement: 'Medida',
  'Screen width': 'Ancho de pantalla',
  'Screen height': 'Alto de pantalla',
  'How to measure the outside dimension': 'Cómo medir la dimensión exterior',
  'How to measure left use zone': 'Cómo medir la zona de uso izquierda',
  'How to measure right use zone': 'Cómo medir la zona de uso derecha',
  'How to measure rear use zone': 'Cómo medir la zona de uso trasera',
  'How to measure staging projection': 'Cómo medir la proyección de la zona de trabajo',
  'How to measure pulled-out chair envelope': 'Cómo medir la envolvente de la silla retirada',
  'How to measure cue length': 'Cómo medir el largo del taco',
  'How to measure a turn landing': 'Cómo medir el rellano de un giro',
  'How to measure appliance width': 'Cómo medir el ancho del electrodoméstico',
  'How to measure hot tub width': 'Cómo medir el ancho de la bañera de hidromasaje',
  'How to measure equipment width': 'Cómo medir el ancho del equipo',
  'How to measure side service space': 'Cómo medir el espacio lateral de mantenimiento',
  'How to measure wheelbarrow or equipment width':
    'Cómo medir el ancho de la carretilla o del equipo',
  'How to measure play-equipment footprint width':
    'Cómo medir el ancho de la huella del equipo de juego',
  'How to measure structure body width': 'Cómo medir el ancho del cuerpo de la estructura',
  'How to measure greenhouse body width': 'Cómo medir el ancho del cuerpo del invernadero',
  'How to measure vehicle in its parking configuration width':
    'Cómo medir el ancho del vehículo en su configuración de estacionamiento',
  'How to measure stored object width': 'Cómo medir el ancho del objeto almacenado',
  'How to measure stored item width': 'Cómo medir el ancho del artículo almacenado',
  'How to measure television body width': 'Cómo medir el ancho del cuerpo del televisor',
  'How to measure delivered item or package width':
    'Cómo medir el ancho del artículo o paquete entregado',
  'How to measure appliance depth': 'Cómo medir la profundidad del electrodoméstico',
  'How to measure hot tub depth': 'Cómo medir la profundidad de la bañera de hidromasaje',
  'How to measure equipment depth': 'Cómo medir la profundidad del equipo',
  'How to measure play-equipment footprint depth':
    'Cómo medir la profundidad de la huella del equipo de juego',
  'How to measure outdoor-kitchen run depth':
    'Cómo medir la profundidad del tramo de cocina exterior',
  'How to measure structure body depth': 'Cómo medir la profundidad del cuerpo de la estructura',
  'How to measure greenhouse body depth': 'Cómo medir la profundidad del cuerpo del invernadero',
  'How to measure vehicle length': 'Cómo medir el largo del vehículo',
  'How to measure vehicle with roof equipment height':
    'Cómo medir la altura del vehículo con equipo en el techo',
  'How to measure stored object depth': 'Cómo medir la profundidad del objeto almacenado',
  'How to measure stored item depth': 'Cómo medir la profundidad del artículo almacenado',
  'How to measure soundbar depth': 'Cómo medir la profundidad de la barra de sonido',
  'How to measure delivered item or package depth':
    'Cómo medir la profundidad del artículo o paquete entregado',
  'How to measure appliance height': 'Cómo medir la altura del electrodoméstico',
  'How to measure hot tub height': 'Cómo medir la altura de la bañera de hidromasaje',
  'How to measure equipment height': 'Cómo medir la altura del equipo',
  'How to measure play equipment height': 'Cómo medir la altura del equipo de juego',
  'How to measure outdoor-kitchen run height': 'Cómo medir la altura del tramo de cocina exterior',
  'How to measure stored object height': 'Cómo medir la altura del objeto almacenado',
  'How to measure stored item height': 'Cómo medir la altura del artículo almacenado',
  'How to measure television body height': 'Cómo medir la altura del cuerpo del televisor',
  'How to measure delivered item or package height':
    'Cómo medir la altura del artículo o paquete entregado',
  'Measure the height of the appliance between its fixed outermost points.':
    'Mide la altura del electrodoméstico entre sus puntos exteriores fijos.',
  'Measure from the equipment’s highest point to the lowest overhead obstruction.':
    'Mide desde el punto más alto del equipo hasta el obstáculo superior más bajo.',
  'Measure the height of the equipment between its fixed outermost points.':
    'Mide la altura del equipo entre sus puntos exteriores fijos.',
  'Measure the height of the play equipment between its fixed outermost points.':
    'Mide la altura del equipo de juego entre sus puntos exteriores fijos.',
  'Measure the height of the outdoor-kitchen run between its fixed outermost points.':
    'Mide la altura del tramo de cocina exterior entre sus puntos exteriores fijos.',
  'Measure the height of the hot tub between its fixed outermost points.':
    'Mide la altura de la bañera de hidromasaje entre sus puntos exteriores fijos.',
  'Measure the height of the stored object between its fixed outermost points.':
    'Mide la altura del objeto almacenado entre sus puntos exteriores fijos.',
  'Measure the height of the stored item between its fixed outermost points.':
    'Mide la altura del artículo almacenado entre sus puntos exteriores fijos.',
  'Measure the height of the vehicle with roof equipment between its fixed outermost points.':
    'Mide la altura del vehículo con el equipo del techo entre sus puntos exteriores fijos.',
  'Measure between the vehicle’s highest point and the lowest garage obstruction.':
    'Mide entre el punto más alto del vehículo y el obstáculo más bajo del garaje.',
  'Measure the height of the delivered item or package between its fixed outermost points.':
    'Mide la altura del artículo o paquete entregado entre sus puntos exteriores fijos.',
  'Measure the height of the television body between its fixed outermost points.':
    'Mide la altura del cuerpo del televisor entre sus puntos exteriores fijos.',
  'How to measure furniture or use zone width':
    'Cómo medir el ancho del mueble o de la zona de uso',
  'How to measure wardrobe door leaf width':
    'Cómo medir el ancho de la hoja de la puerta del armario',
  'How to measure nightstand width': 'Cómo medir el ancho de la mesilla de noche',
  'How to measure mattress width': 'Cómo medir el ancho del colchón',
  'Measure the mattress from outside edge to outside edge across its width.':
    'Mide el colchón de borde exterior a borde exterior a lo ancho.',
  'Measure the outside width of the bedside table at its widest fixed point.':
    'Mide el ancho exterior de la mesilla en su punto fijo más ancho.',
  'Measure bedside furniture and door/drawer projections if you want to check operating space.':
    'Mide los muebles de noche y el saliente de puertas y cajones si quieres comprobar el espacio de uso.',
  'Measure the width of the chair between its fixed outermost points.':
    'Mide el ancho de la silla entre sus puntos exteriores fijos.',
  'Measure the width of the appliance between its fixed outermost points.':
    'Mide el ancho del electrodoméstico entre sus puntos exteriores fijos.',
  'Measure the width of the equipment between its fixed outermost points.':
    'Mide el ancho del equipo entre sus puntos exteriores fijos.',
  'Measure the width of the play-equipment footprint between its fixed outermost points.':
    'Mide el ancho de la huella del equipo de juego entre sus puntos exteriores fijos.',
  'Measure the width of the outdoor-kitchen run between its fixed outermost points.':
    'Mide el ancho del tramo de cocina exterior entre sus puntos exteriores fijos.',
  'Measure the width of the hot tub between its fixed outermost points.':
    'Mide el ancho de la bañera de hidromasaje entre sus puntos exteriores fijos.',
  'Measure the width of the wheelbarrow or equipment between its fixed outermost points.':
    'Mide el ancho de la carretilla o del equipo entre sus puntos exteriores fijos.',
  'Measure the width of the structure body between its fixed outermost points.':
    'Mide el ancho del cuerpo de la estructura entre sus puntos exteriores fijos.',
  'Measure the width of the greenhouse body between its fixed outermost points.':
    'Mide el ancho del cuerpo del invernadero entre sus puntos exteriores fijos.',
  'Measure the width of the vehicle in its parking configuration between its fixed outermost points.':
    'Mide el ancho del vehículo entre sus puntos exteriores fijos en la configuración de estacionamiento.',
  'Measure the length of the vehicle between its fixed outermost points.':
    'Mide el largo del vehículo entre sus puntos exteriores fijos.',
  'Measure the width of the pool table between its fixed outermost points.':
    'Mide el ancho de la mesa de billar entre sus puntos exteriores fijos.',
  'Measure the width of the dining table between its fixed outermost points.':
    'Mide el ancho de la mesa de comedor entre sus puntos exteriores fijos.',
  'Measure the width of the stored object between its fixed outermost points.':
    'Mide el ancho del objeto almacenado entre sus puntos exteriores fijos.',
  'Measure the width of the stored item between its fixed outermost points.':
    'Mide el ancho del artículo almacenado entre sus puntos exteriores fijos.',
  'Measure the width of the TV stand between its fixed outermost points.':
    'Mide el ancho del soporte del televisor entre sus puntos exteriores fijos.',
  'Measure the width of the monitor body between its fixed outermost points.':
    'Mide el ancho del cuerpo del monitor entre sus puntos exteriores fijos.',
  'Measure the width of the delivered item or package between its fixed outermost points.':
    'Mide el ancho del artículo o paquete entregado entre sus puntos exteriores fijos.',
  'Measure the width of the television body between its fixed outermost points.':
    'Mide el ancho del cuerpo del televisor entre sus puntos exteriores fijos.',
  'Measure the width of the soundbar between its fixed outermost points.':
    'Mide el ancho de la barra de sonido entre sus puntos exteriores fijos.',
  'Measure the length of the pool table between its fixed outermost points.':
    'Mide el largo de la mesa de billar entre sus puntos exteriores fijos.',
  'Measure the length of the dining table between its fixed outermost points.':
    'Mide el largo de la mesa de comedor entre sus puntos exteriores fijos.',
  'Measure the width of the furniture or use zone between its fixed outermost points.':
    'Mide el ancho del mueble o de la zona de uso entre sus puntos exteriores fijos.',
  'Measure the depth of the furniture or use zone between its fixed outermost points.':
    'Mide la profundidad del mueble o de la zona de uso entre sus puntos exteriores fijos.',
  'Measure the depth of the appliance between its fixed outermost points.':
    'Mide la profundidad del electrodoméstico entre sus puntos exteriores fijos.',
  'Measure the depth of the equipment between its fixed outermost points.':
    'Mide la profundidad del equipo entre sus puntos exteriores fijos.',
  'Measure the depth of the play-equipment footprint between its fixed outermost points.':
    'Mide la profundidad de la huella del equipo de juego entre sus puntos exteriores fijos.',
  'Measure the depth of the outdoor-kitchen run between its fixed outermost points.':
    'Mide la profundidad del tramo de cocina exterior entre sus puntos exteriores fijos.',
  'Measure the depth of the hot tub between its fixed outermost points.':
    'Mide la profundidad de la bañera de hidromasaje entre sus puntos exteriores fijos.',
  'Measure the depth of the structure body between its fixed outermost points.':
    'Mide la profundidad del cuerpo de la estructura entre sus puntos exteriores fijos.',
  'Measure the depth of the greenhouse body between its fixed outermost points.':
    'Mide la profundidad del cuerpo del invernadero entre sus puntos exteriores fijos.',
  'Measure the cue from its tip to the butt end.':
    'Mide el taco desde la punta hasta el extremo del mango.',
  'Measure the depth of the stored object between its fixed outermost points.':
    'Mide la profundidad del objeto almacenado entre sus puntos exteriores fijos.',
  'Measure the depth of the stored item between its fixed outermost points.':
    'Mide la profundidad del artículo almacenado entre sus puntos exteriores fijos.',
  'Measure the depth of the TV stand between its fixed outermost points.':
    'Mide la profundidad del soporte del televisor entre sus puntos exteriores fijos.',
  'Measure the depth of the monitor and attached base between its fixed outermost points.':
    'Mide la profundidad del monitor y la base acoplada entre sus puntos exteriores fijos.',
  'Measure the depth of the soundbar between its fixed outermost points.':
    'Mide la profundidad de la barra de sonido entre sus puntos exteriores fijos.',
  'Measure the depth of the delivered item or package between its fixed outermost points.':
    'Mide la profundidad del artículo o paquete entregado entre sus puntos exteriores fijos.',
  'Measure between the rug’s left and right outer edges.':
    'Mide entre los bordes exteriores izquierdo y derecho de la alfombra.',
  'Measure between the rug’s front and rear outer edges.':
    'Mide entre los bordes exteriores delantero y trasero de la alfombra.',
  'Measure the chair’s outside width at its widest fixed point.':
    'Mide el ancho exterior de la silla en su punto fijo más ancho.',
  'Use the outside edge-to-edge dimension of the rectangular tabletop.':
    'Usa la medida exterior de borde a borde de la superficie rectangular de la mesa.',
  'Measure the rectangular tabletop from one end edge to the other.':
    'Mide la superficie rectangular de la mesa de un borde extremo al otro.',
  'Measure the tabletop and the chair footprint in the pulled-out position you expect to use.':
    'Mide la superficie de la mesa y la huella de la silla en la posición retirada que quieras usar.',
  'Measure the table, pulled-out chair envelope and usable patio or gazebo dimensions.':
    'Mide la mesa, la envolvente de la silla retirada y las dimensiones útiles del patio o la glorieta.',
  'Measure the full kitchen run, appliance projections, patio area and usable overhead height.':
    'Mide el tramo completo de la cocina, los salientes de los electrodomésticos, el área del patio y la altura libre superior.',
  'Use the actual laid-flat rug dimensions. Include fringe only if it is part of the footprint you need to fit.':
    'Usa las dimensiones reales de la alfombra extendida. Incluye los flecos solo si forman parte de la huella que necesitas encajar.',
  'Use the actual laid-flat rug dimensions rather than a room-size suggestion or nominal label.':
    'Usa las dimensiones reales de la alfombra extendida, no una sugerencia de tamaño de habitación ni una etiqueta nominal.',
  'Use exact model dimensions where available. Include fixed parts that remain on the furniture or use zone in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el mueble o en la zona de uso de esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the chair in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas de la silla en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the equipment in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el equipo en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the play-equipment footprint in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas de la huella del equipo de juego en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the hot tub in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas de la bañera de hidromasaje en esta configuración.',
  'Add one row for each candidate, with separate outside width and depth measurements.':
    'Añade una fila por cada opción, con medidas independientes del ancho y la profundidad exteriores.',
  'Use exact model dimensions where available. Include fixed parts that remain on the stored object in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del objeto almacenado en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the stored item in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del artículo almacenado en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the structure body in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el cuerpo de la estructura.',
  'Use exact model dimensions where available. Include fixed parts that remain on the play equipment in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del equipo de juego en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the greenhouse body in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del cuerpo del invernadero en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the outdoor-kitchen run in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el tramo de cocina exterior.',
  'Use manufacturer instructions where they define operating or access zones. Otherwise this is a user-selected planning allowance.':
    'Sigue las instrucciones del fabricante cuando definan zonas de funcionamiento o acceso. En caso contrario, es una holgura de planificación elegida por el usuario.',
  'Use the exact equipment manual for movement, loading or access requirements.':
    'Consulta el manual del equipo exacto para los requisitos de movimiento, carga o acceso.',
  'Use the manual and qualified installers for electrical, foundation, delivery and safety requirements.':
    'Consulta el manual y recurre a instaladores cualificados para los requisitos eléctricos, de cimentación, entrega y seguridad.',
  'Use the equipment manual for overhead movement requirements; this tool does not assess safe use.':
    'Consulta el manual del equipo para los requisitos de movimiento superior; esta herramienta no evalúa el uso seguro.',
  'Use the exact equipment model instructions for the use-zone diagram and measurements.':
    'Usa las instrucciones del modelo exacto del equipo para el diagrama y las medidas de la zona de uso.',
  'Use the exact model diagram and follow its orientation. No generic child-safety zone is supplied.':
    'Usa el diagrama del modelo exacto y respeta su orientación. No se proporciona una zona genérica de seguridad infantil.',
  'Use the exact model manual or manufacturer diagram. A footprint measurement does not verify the use zone.':
    'Usa el manual o el diagrama del fabricante del modelo exacto. Una medida de huella no verifica la zona de uso.',
  'Confirm dimensions on the rug and furniture labels; the diagram is a dimensional comparison, not a floor plan or styling recommendation.':
    'Confirma las dimensiones en las etiquetas de la alfombra y los muebles; el diagrama compara medidas, no es un plano ni una recomendación de decoración.',
  'Use actual furniture dimensions; the sketch does not model chair angles or a universal seating standard.':
    'Usa las dimensiones reales de los muebles; el esquema no modela el ángulo de las sillas ni una norma universal de asientos.',
  'Use the door opening angle and the door projection for the parking configuration you plan to use.':
    'Usa el ángulo de apertura y el saliente de la puerta de la configuración de estacionamiento que vayas a usar.',
  'Use the actual hinge and opening angle. This models the door envelope, not a standing space.':
    'Usa la bisagra y el ángulo de apertura reales. Esto modela la envolvente de la puerta, no el espacio para estar de pie.',
  'The equipment manufacturer may specify additional overhead or movement space.':
    'El fabricante del equipo puede especificar espacio adicional por encima o para el movimiento.',
  'The footprint is separate from the manufacturer-required use zone; its dimensions and exact manual/model source are not verified.':
    'La huella es independiente de la zona de uso exigida por el fabricante; sus dimensiones y la fuente del manual/modelo exacto no se han verificado.',
  'Allow for the actual stand/base footprint, cables and ventilation as specified for your models.':
    'Ten en cuenta la huella real del soporte/base, los cables y la ventilación según las especificaciones de tus modelos.',
  'Use exact model dimensions where available. Include fixed parts that remain on the monitor body in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del cuerpo del monitor en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the television body in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del cuerpo del televisor en esta configuración.',
  'Use the exact monitor model’s listed VESA mounting pattern.':
    'Usa el patrón de montaje VESA indicado para el modelo exacto del monitor.',
  'Use the exact TV model’s listed VESA pattern and weight.':
    'Usa el patrón VESA y el peso indicados para el modelo exacto del televisor.',
  'Use the exact surface area available for the monitor base and clamp.':
    'Usa la superficie exacta disponible para la base y la abrazadera del monitor.',
  'Use exact model dimensions where available. Include fixed parts that remain on the monitor and attached base in this setup. Use the same stand or arm-base configuration that will be placed on the desk.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del monitor y la base acoplada en esta configuración. Usa la misma base de soporte o brazo que se colocará en el escritorio.',
  'Use exact model dimensions where available. Include fixed parts that remain on the appliance in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el electrodoméstico en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the pool table in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas de la mesa de billar en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the TV stand in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del soporte del televisor en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the dining table in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en la mesa de comedor en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the soundbar in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas de la barra de sonido en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the delivered item or package in this setup. Measure the outer package when it remains on during the move.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el artículo o paquete entregado. Mide el paquete exterior si se mantiene durante el traslado.',
  'Use exact model dimensions where available. Include fixed parts that remain on the wheelbarrow or equipment in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en la carretilla o el equipo en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the vehicle in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el vehículo en esta configuración.',
  'Use exact model dimensions where available. Include fixed parts that remain on the vehicle in its parking configuration in this setup. Include mirrors or accessories only as they will be positioned while parking.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas del vehículo en su configuración de estacionamiento. Incluye los retrovisores o accesorios solo según su posición al estacionar.',
  'Use exact model dimensions where available. Include fixed parts that remain on the vehicle with roof equipment in this setup.':
    'Usa las dimensiones exactas del modelo cuando estén disponibles. Incluye las piezas fijas que permanezcan en el vehículo con el equipo del techo en esta configuración.',
  'Use the exact model manual for ventilation, hose, plug and service requirements.':
    'Consulta el manual del modelo exacto para los requisitos de ventilación, mangueras, enchufe y mantenimiento.',
  'Use the exact model installation manual; do not treat an empty user-entered value as a manufacturer-approved zero.':
    'Consulta el manual de instalación del modelo exacto; no interpretes un valor vacío introducido por el usuario como un cero aprobado por el fabricante.',
  'A selected personal allowance is not a manufacturer-verified requirement. Only exact model sources can verify model-specific installation clearance.':
    'Una holgura elegida por el usuario no es un requisito verificado por el fabricante. Solo las fuentes del modelo exacto pueden confirmar la holgura de instalación específica.',
  'A personal allowance does not verify the manufacturer’s service-panel or cover-access requirements.':
    'Una holgura personal no verifica los requisitos del fabricante para el panel de mantenimiento ni para acceder a la tapa.',
  'Use the exact model manual for ventilation and installation requirements.':
    'Consulta el manual del modelo exacto para conocer los requisitos de ventilación e instalación.',
  'Use the exact model manual for assembly, anchoring and ventilation requirements.':
    'Consulta el manual del modelo exacto para conocer los requisitos de montaje, anclaje y ventilación.',
  'Enter the manufacturer’s left, right, front and rear zone values. No generic child-safety zone is supplied.':
    'Introduce los valores del fabricante para los lados izquierdo y derecho, el frente y la parte trasera. No se proporciona una zona genérica de seguridad infantil.',
  'Use the exact model instructions for ventilation and service requirements.':
    'Sigue las instrucciones del modelo exacto para los requisitos de ventilación y mantenimiento.',
  'Check appliance-specific installation instructions for heat, ventilation and overhead requirements.':
    'Comprueba las instrucciones de instalación específicas del aparato sobre calor, ventilación y requisitos superiores.',
  'Use the exact tub manual for panel access and service requirements. This may be model-specific.':
    'Consulta el manual exacto de la bañera para acceder al panel y conocer los requisitos de mantenimiento, que pueden variar según el modelo.',
  'Consult the exact tub manual for service-panel and cover clearance requirements.':
    'Consulta el manual exacto de la bañera para conocer los requisitos de holgura del panel de mantenimiento y la tapa.',
  'Use the exact appliance or kitchen instructions where they specify service requirements; otherwise enter your chosen allowance.':
    'Sigue las instrucciones exactas del aparato o de la cocina cuando indiquen requisitos de mantenimiento; en caso contrario, introduce la holgura que hayas elegido.',
  'Use the exact cover lifter/tub instructions for its movement envelope.':
    'Consulta las instrucciones del elevador de tapa o la bañera exactos para conocer su envolvente de movimiento.',
  'Use the exact tub manual for required panel access and do not infer a generic service allowance.':
    'Consulta el manual exacto de la bañera para los requisitos de acceso al panel y no infieras una holgura de mantenimiento genérica.',
  'Wall-mount checks require the exact TV and mount specifications; a stand check uses the stand footprint and console surface.':
    'Las comprobaciones de montaje en pared requieren las especificaciones exactas del televisor y el soporte; una comprobación de sobremesa usa la huella del soporte y la superficie del mueble.',
  'Check the arm manual for clamp depth, edge and desk thickness requirements.':
    'Consulta el manual del brazo para conocer los requisitos de profundidad de la abrazadera, borde y grosor del escritorio.',
  'Compare with the exact arm clamp range in its specification.':
    'Compáralo con el rango de sujeción indicado en la especificación del brazo exacto.',
  'Do not substitute the nominal frame size.': 'No sustituyas la medida nominal del marco.',
  'Use the current instructions or specification for the exact make and model.':
    'Usa las instrucciones o la ficha técnica vigente de la marca y el modelo exactos.',
  'Select the source type, then enter the manual section/page or manufacturer specification reference. Do not use a value from a different model.':
    'Selecciona el tipo de fuente e indica la sección o página del manual o la referencia de la ficha técnica del fabricante. No uses un valor de otro modelo.',
  'Select an exact model source or identify the value as your own chosen allowance.':
    'Selecciona una fuente del modelo exacto o identifica el valor como una holgura elegida por ti.',
  'To mark manufacturer clearance as verified, use an exact model manual or specification reference.':
    'Para marcar como verificada la holgura indicada por el fabricante, usa el manual o la ficha técnica del modelo exacto.',
  'Use the exact tub manual or specification when marking manufacturer clearances as verified.':
    'Usa el manual o la ficha técnica de la bañera exacta para marcar como verificadas las holguras del fabricante.',
  'Check the exact monitor model and arm specification; pattern support can vary by model.':
    'Comprueba el modelo exacto del monitor y la especificación del brazo; la compatibilidad del patrón puede variar según el modelo.',
  'Use the monitor-arm manual to check model-specific clearances and mounting limits.':
    'Consulta el manual del brazo para comprobar las holguras y los límites de montaje específicos del modelo.',
  'For monitor arms, have the exact display and arm specifications for VESA, weight and clamp limits.':
    'Para los brazos de monitor, ten las especificaciones exactas de la pantalla y del brazo sobre VESA, peso y límites de la abrazadera.',
  'Have the exact monitor and arm model specifications for VESA pattern, supported weight and clamp limits.':
    'Ten las especificaciones exactas de los modelos del monitor y del brazo para el patrón VESA, el peso admitido y los límites de la abrazadera.',
  'Have the exact TV and mount manuals for VESA pattern, combined load and mounting requirements.':
    'Ten los manuales exactos del televisor y del soporte para el patrón VESA, la carga combinada y los requisitos de montaje.',
  'Have the exact TV and stand manuals for support/load limits and stand-spacing requirements.':
    'Ten los manuales exactos del televisor y del soporte para los límites de carga y apoyo y los requisitos de separación de las patas.',
  'Check wall construction, fasteners, cable locations and installation requirements separately.':
    'Comprueba por separado la construcción de la pared, los fijadores, la ubicación de los cables y los requisitos de instalación.',
  'Measure cable, rear ventilation and wall clearances you need to preserve.':
    'Mide las holguras que necesites mantener para cables, ventilación trasera y distancia respecto a la pared.',
  'Verify the exact TV and mount models; do not infer VESA or load compatibility from screen size.':
    'Verifica los modelos exactos del televisor y del soporte; no infieras la compatibilidad VESA ni de carga a partir del tamaño de pantalla.',
  'Reference the exact model manual or manufacturer specification; do not infer values from a similar product.':
    'Cita el manual del modelo exacto o la especificación del fabricante; no infieras valores a partir de un producto parecido.',
  'Use the manufacturer’s dimension sheet or measure the exact model.':
    'Usa la ficha dimensional del fabricante o mide el modelo exacto.',
  'Use the exact model’s outside dimensions or measure the structure.':
    'Usa las dimensiones exteriores del modelo exacto o mide la estructura.',
  'Use the exact structure model dimensions where available.':
    'Usa las dimensiones del modelo exacto de la estructura cuando estén disponibles.',
  'Measure the structure body, roof overhang, door swing and any maintenance space separately.':
    'Mide por separado el cuerpo de la estructura, el voladizo del techo, el giro de la puerta y el espacio de mantenimiento.',
  'Measure the greenhouse outside footprint, roof overhang and clear inside aisle.':
    'Mide la huella exterior del invernadero, el voladizo del techo y el pasillo interior libre.',
  'Use the manufacturer’s exact height reference and check whether open sky is represented by a zero value.':
    'Usa la referencia exacta de altura del fabricante y comprueba si un valor cero representa cielo abierto.',
  'Each row is compared as a separate structure footprint. Verify the chosen model body, roof and door dimensions before relying on a candidate result.':
    'Cada fila se compara como una huella independiente de la estructura. Verifica las dimensiones del cuerpo, el techo y las puertas del modelo elegido antes de basarte en el resultado.',
  'Check the monitor manual/specification and the arm’s supported patterns; do not infer a pattern from screen size.':
    'Comprueba el manual o la especificación del monitor y los patrones compatibles con el brazo; no infieras el patrón a partir del tamaño de pantalla.',
  'Have the monitor count, screen size and desk dimensions you plan to use.':
    'Ten a mano la cantidad de monitores, el tamaño de pantalla y las dimensiones del escritorio que quieras usar.',
  'Compare with the exact mount specification for supported patterns and load. Do not infer compatibility from screen size.':
    'Compáralo con la especificación del soporte exacto para verificar los patrones y la carga admitidos. No infieras la compatibilidad a partir del tamaño de pantalla.',
  'Measure from the closed drawer front to its outermost front edge when fully extended.':
    'Mide desde el frente del cajón cerrado hasta su borde delantero más saliente cuando está totalmente extendido.',
  'Measure the mattress from head end to foot end, outside edge to outside edge.':
    'Mide el colchón de extremo a extremo, del cabecero a los pies, de borde exterior a borde exterior.',
  'Measure from the table edge to the back of the chair in the pulled-out position you plan to use.':
    'Mide desde el borde de la mesa hasta el respaldo de la silla en la posición retirada que vayas a usar.',
  'Measure from the table edge to the back of the pulled-out chair.':
    'Mide desde el borde de la mesa hasta el respaldo de la silla retirada.',
  'Measure from the table edge to the back of the chair when pulled out.':
    'Mide desde el borde de la mesa hasta el respaldo de la silla cuando está retirada.',
  'Measure from the bed’s foot edge to the wall or fixed obstacle.':
    'Mide desde el borde de los pies de la cama hasta la pared u obstáculo fijo.',
  'How to measure inside room length': 'Cómo medir el largo interior de la habitación',
  'How to measure garage usable length': 'Cómo medir el largo útil del garaje',
  'How to measure clear room length': 'Cómo medir el largo libre de la habitación',
  'How to measure side roof overhang': 'Cómo medir el voladizo lateral del techo',
  'How to measure side eave projection': 'Cómo medir la proyección lateral del alero',
  'How to measure rear roof projection': 'Cómo medir la proyección trasera del techo',
  'How to measure rear service space': 'Cómo medir el espacio trasero de mantenimiento',
  'How to measure front roof projection': 'Cómo medir la proyección frontal del techo',
  'How to measure end eave projection': 'Cómo medir la proyección del alero en el extremo',
  'How to measure room depth': 'Cómo medir la profundidad de la habitación',
  'How to measure dining-room length': 'Cómo medir el largo del comedor',
  'How to measure mattress length': 'Cómo medir el largo del colchón',
  'Enter the monitor’s full outside width, including bezel, rather than screen-only width.':
    'Introduce el ancho exterior completo del monitor, incluido el bisel, en lugar del ancho de solo la pantalla.',
  'How to measure desk width': 'Cómo medir el ancho del escritorio',
  'How to measure chair width': 'Cómo medir el ancho de la silla',
  'How to measure table width': 'Cómo medir el ancho de la mesa',
  'How to measure dining table width': 'Cómo medir el ancho de la mesa de comedor',
  'How to measure outdoor-kitchen run width': 'Cómo medir el ancho del tramo de cocina exterior',
  'How to measure pool table width': 'Cómo medir el ancho de la mesa de billar',
  'How to measure rug width': 'Cómo medir el ancho de la alfombra',
  'When to override estimated monitor width': 'Cuándo sobrescribir el ancho estimado del monitor',
  'How to measure the gap between items': 'Cómo medir la separación entre objetos',
  'How to enter candidate sizes': 'Cómo introducir los tamaños candidatos',
  'How to measure item gap': 'Cómo medir la separación entre objetos',
  'How to measure the gap between stored items':
    'Cómo medir la separación entre los artículos almacenados',
  'How to measure table length': 'Cómo medir el largo de la mesa',
  'How to measure dining table length': 'Cómo medir el largo de la mesa de comedor',
  'How to measure pool table length': 'Cómo medir el largo de la mesa de billar',
  'How to measure rug depth': 'Cómo medir la profundidad de la alfombra',
  'How to measure turn depth': 'Cómo medir la profundidad del giro',
  'How to measure furniture or use zone depth':
    'Cómo medir la profundidad del mueble o de la zona de uso',
  'How to measure the wardrobe obstacle gap':
    'Cómo medir la separación respecto al obstáculo del armario',
  'How to measure the dresser obstacle gap':
    'Cómo medir la separación respecto al obstáculo de la cómoda',
  'How to measure the monitor gap': 'Cómo medir la separación entre monitores',
  'Measure edge-to-edge between the adjacent item footprints.':
    'Mide de borde a borde entre las huellas de los objetos adyacentes.',
  'Measure edge-to-edge spacing between adjacent objects.':
    'Mide la separación de borde a borde entre objetos contiguos.',
  'Measure edge-to-edge between neighboring objects.':
    'Mide de borde a borde entre los objetos contiguos.',
  'Measure the edge-to-edge gap between adjacent monitor bodies.':
    'Mide la separación de borde a borde entre los cuerpos de los monitores contiguos.',
  'For two side-by-side monitors, measure the shortest clear distance between their outer bezels.':
    'Para dos monitores colocados uno al lado del otro, mide la distancia libre más corta entre los bordes exteriores de sus biseles.',
  'This is a spacing input between objects, not extra space around the room perimeter.':
    'Este valor es la separación entre objetos, no el espacio adicional alrededor del perímetro de la habitación.',
  'The item gap is separate from the aisle and outer edge clearance.':
    'La separación entre objetos es independiente del pasillo y de la holgura con el borde exterior.',
  'Keep item spacing separate from the outer aisle width.':
    'Mantén separada la distancia entre objetos del ancho exterior del pasillo.',
  'Use the actual cue length being checked; cue clearance is calculated separately from table size.':
    'Usa el largo real del taco que se comprueba; la holgura del taco se calcula por separado del tamaño de la mesa.',
  'Do not include space behind the desk or beyond the usable surface.':
    'No incluyas el espacio detrás del escritorio ni el que quede fuera de la superficie útil.',
  'For two adjacent boxes, measure the open distance between their closest outside edges.':
    'Para dos cajas contiguas, mide el espacio libre entre sus bordes exteriores más cercanos.',
  'For two stored items, measure the open distance between their closest fixed outside edges.':
    'Para dos artículos almacenados, mide el espacio libre entre sus bordes exteriores fijos más cercanos.',
  'How to measure the usable inside span': 'Cómo medir el espacio interior útil',
  'How to measure clear doorway width': 'Cómo medir el ancho libre de la puerta',
  'How to measure garage door clear width': 'Cómo medir el ancho libre de la puerta del garaje',
  'How to measure clear opening width': 'Cómo medir el ancho libre de la abertura',
  'How to measure clear inside width': 'Cómo medir el ancho interior libre',
  'How to measure clear door width': 'Cómo medir el ancho libre de la puerta',
  'How to measure greenhouse door width': 'Cómo medir el ancho de la puerta del invernadero',
  'How to measure an open vehicle door projection':
    'Cómo medir el saliente de una puerta de vehículo abierta',
  'How to measure the open door projection': 'Cómo medir el saliente de la puerta abierta',
  'How to measure destination door width': 'Cómo medir el ancho libre de la puerta de destino',
  'How to measure item depth': 'Cómo medir la profundidad del artículo',
  'How to measure desk depth': 'Cómo medir la profundidad del escritorio',
  'How to measure console depth': 'Cómo medir la profundidad del mueble de TV',
  'How to measure TV stand depth': 'Cómo medir la profundidad del soporte del televisor',
  'How to measure usable desk depth': 'Cómo medir la profundidad útil del escritorio',
  'How to measure nightstand depth': 'Cómo medir la profundidad de la mesilla de noche',
  'How to measure drawer pullout': 'Cómo medir la extracción del cajón',
  'How to measure the pulled-out chair envelope': 'Cómo medir la envolvente de la silla retirada',
  'How to measure the monitor base': 'Cómo medir la base del monitor',
  'How to measure arm base depth': 'Cómo medir la profundidad de la base del brazo',
  'How to measure monitor body width': 'Cómo medir el ancho del cuerpo del monitor',
  'How to measure soundbar width': 'Cómo medir el ancho de la barra de sonido',
  'How to measure monitor and attached base depth':
    'Cómo medir la profundidad del monitor y la base acoplada',
  'How to measure TV stand width': 'Cómo medir el ancho del soporte del televisor',
  'Where to find screen aspect ratio': 'Dónde encontrar la relación de aspecto de la pantalla',
  'How to measure usable space depth': 'Cómo medir la profundidad del espacio útil',
  'How to measure usable storage depth': 'Cómo medir la profundidad útil de almacenamiento',
  'How to measure usable opening depth': 'Cómo medir la profundidad útil de la abertura',
  'What rear cable space includes': 'Qué incluye el espacio trasero para cables',
  'Where rear installation clearance applies': 'Dónde se aplica la holgura trasera de instalación',
  'Where top installation clearance applies': 'Dónde se aplica la holgura superior de instalación',
  'Where to find the exact specification': 'Dónde encontrar la especificación exacta',
  'Where the use-zone dimensions come from': 'De dónde proceden las dimensiones de la zona de uso',
  'Where to find the monitor VESA pattern': 'Dónde encontrar el patrón VESA del monitor',
  'Where to find the TV VESA pattern': 'Dónde encontrar el patrón VESA del televisor',
  'Where to measure desk thickness': 'Dónde medir el grosor del escritorio',
  'Where side installation clearance applies': 'Dónde se aplica la holgura lateral de instalación',
  'Where hot-tub side service space applies':
    'Dónde se aplica el espacio lateral de mantenimiento de la bañera',
  'Where hot-tub front service space applies':
    'Dónde se aplica el espacio frontal de mantenimiento de la bañera',
  'What the keyboard/mouse zone includes': 'Qué incluye la zona de teclado y ratón',
  'What monitor diagonal means': 'Qué significa la diagonal del monitor',
  'What advertised width represents': 'Qué representa el ancho anunciado',
  'What advertised depth represents': 'Qué representa la profundidad anunciada',
  'What the bed preset represents': 'Qué representa el tamaño de cama preestablecido',
  'Use the display’s listed screen ratio, such as 16:9 or 21:9.':
    'Usa la relación de pantalla indicada, como 16:9 o 21:9.',
  'Use the screen’s diagonal measurement, not its outside width.':
    'Usa la medida diagonal de la pantalla, no su ancho exterior.',
  'How to measure corridor width': 'Cómo medir el ancho del pasillo',
  'How to measure front work space': 'Cómo medir el espacio frontal de trabajo',
  'How to measure front use zone': 'Cómo medir la zona de uso delantera',
  'How to measure a clear door path': 'Cómo medir un recorrido libre por la puerta',
  'How to measure the available aisle': 'Cómo medir el pasillo disponible',
  'How to measure clear aisle width': 'Cómo medir el ancho libre del pasillo',
  'How to measure stair clear width': 'Cómo medir el ancho libre de la escalera',
  'How to measure a hallway pinch point': 'Cómo medir un estrechamiento del pasillo',
  'How to measure item height': 'Cómo medir la altura del artículo',
  'How to measure usable space height': 'Cómo medir la altura del espacio útil',
  'How to measure usable storage height': 'Cómo medir la altura útil de almacenamiento',
  'How to measure clear garage height': 'Cómo medir la altura libre del garaje',
  'How to measure clear ceiling height': 'Cómo medir la altura libre del techo',
  'How to measure clear height above equipment': 'Cómo medir la altura libre sobre el equipo',
  'How to measure overhead clearance': 'Cómo medir la holgura superior',
  'How to measure cover-lift space': 'Cómo medir el espacio para levantar la tapa',
  'How to measure usable wall/alcove height': 'Cómo medir la altura útil de la pared o del hueco',
  'How to set overhead operating space': 'Cómo definir el espacio superior de funcionamiento',
  'How to choose overhead allowance': 'Cómo elegir la holgura superior',
  'How to measure clear doorway height': 'Cómo medir la altura libre de la puerta',
  'How to measure garage door clear height': 'Cómo medir la altura libre de la puerta del garaje',
  'How to measure stair headroom': 'Cómo medir la altura libre de la escalera',
  'How to measure clear opening height': 'Cómo medir la altura libre de la abertura',
  'How to measure clear door height': 'Cómo medir la altura libre de la puerta',
  'How to measure destination door height': 'Cómo medir la altura libre de la puerta de destino',
  'How orientation changes the result': 'Cómo cambia el resultado según la orientación',
  'What sizing direction means': 'Qué significa la dirección de las dimensiones',
  'How rug orientation is compared': 'Cómo se compara la orientación de la alfombra',
  'Choose which item edge is aligned with the room width and length.':
    'Elige qué borde del objeto se alinea con el ancho y el largo de la habitación.',
  'The tool rotates the rectangular footprint; it does not model lifting, tilting or turning an item through a doorway.':
    'La herramienta gira la huella rectangular; no modela levantar, inclinar ni girar un artículo para pasarlo por una puerta.',
  'Use the usable floor area where the item must pivot; this does not simulate handling or tilting.':
    'Usa la superficie útil del suelo donde el artículo debe girar; esto no simula su manipulación ni inclinación.',
  'This tests only a 90-degree rotation of a rectangular footprint; it does not model diagonal placement, irregular shapes or furniture arrangement.':
    'Esto solo prueba un giro de 90 grados de una huella rectangular; no modela colocaciones diagonales, formas irregulares ni la distribución del mobiliario.',
  'How to choose extra clearance': 'Cómo elegir una holgura adicional',
  'How to choose extra door-path width':
    'Cómo elegir un ancho adicional para el recorrido de la puerta',
  'How to set extra cue clearance': 'Cómo definir una holgura adicional para el taco',
  'How to choose an aisle target': 'Cómo elegir el objetivo del pasillo',
  'How to choose a central aisle target': 'Cómo elegir el objetivo del pasillo central',
  'How to choose the clearance source': 'Cómo elegir la fuente de la holgura',
  'How to choose the service-space source': 'Cómo elegir la fuente del espacio de mantenimiento',
  'Choose the TV setup being checked': 'Elige la configuración del televisor que quieres comprobar',
  'Choose whether you are checking a known structure in a plot or testing candidate structures for a measured plot.':
    'Elige si comprobarás una estructura conocida dentro de un terreno medido o si probarás estructuras candidatas para ese terreno.',
  'Select stand or wall mount to show the matching dimensions and manual checks.':
    'Selecciona soporte de sobremesa o montaje en pared para mostrar las dimensiones y comprobaciones de manual correspondientes.',
  'Select the manual/specification basis or mark the allowance as your own choice.':
    'Selecciona la base del manual o de la especificación, o indica que la holgura es una elección propia.',
  'How to choose extra walking space': 'Cómo elegir espacio adicional para caminar',
  'How to choose walking clearance': 'Cómo elegir la holgura para caminar',
  'How to set front operating space': 'Cómo definir el espacio frontal de funcionamiento',
  'How to choose side clearance': 'Cómo elegir la holgura lateral',
  'How to choose side access space': 'Cómo elegir el espacio lateral de acceso',
  'How to set side operating space': 'Cómo definir el espacio lateral de funcionamiento',
  'How to choose a rug-to-wall border':
    'Cómo elegir el borde de separación entre la alfombra y la pared',
  'How to enter this allowance': 'Cómo introducir esta holgura',
  'How to choose a rug border around furniture':
    'Cómo elegir el borde de la alfombra alrededor del mobiliario',
  'How to use edge clearance': 'Cómo usar la holgura respecto al borde',
  'How to choose front-edge overlap': 'Cómo elegir el solapamiento del borde delantero',
  'How to measure rug extension in front': 'Cómo medir la extensión delantera de la alfombra',
  'How to choose foot clearance': 'Cómo elegir la holgura al pie de la cama',
  'How to set the door opening angle': 'Cómo indicar el ángulo de apertura de la puerta',
  'Enter the actual or desired angle between the closed door and open door.':
    'Introduce el ángulo real o deseado entre la puerta cerrada y la abierta.',
  'How to use the side margin target': 'Cómo usar el objetivo de margen lateral',
  'Enter additional space beyond the item on each side.':
    'Introduce el espacio adicional que quieras dejar a cada lado del artículo.',
  'Enter only the additional space you want to reserve. It is added outside the item footprint.':
    'Introduce solo el espacio adicional que quieras reservar. Se añade por fuera de la huella del artículo.',
  'Enter the extra space you want at each outer storage edge.':
    'Introduce el espacio adicional que quieras dejar en cada borde exterior de almacenamiento.',
  'Enter the extra space you want beyond the cue-length envelope on each side.':
    'Introduce el espacio adicional que quieras dejar más allá de la envolvente del largo del taco a cada lado.',
  'If checking furniture coverage, measure the full footprint/use zone or the front-edge overlap you want.':
    'Si compruebas la cobertura de muebles, mide la huella o zona de uso completa, o el solapamiento del borde delantero que quieras.',
  'Enter only the additional overhead allowance you want to reserve; this does not account for vehicle movement.':
    'Introduce solo la holgura superior adicional que quieras reservar; no tiene en cuenta el movimiento del vehículo.',
  'Enter additional space you want beyond the open door projection.':
    'Introduce el espacio adicional que quieras dejar más allá del saliente de la puerta abierta.',
  'Enter any additional clear path width you want beyond the door projection.':
    'Introduce el ancho libre adicional que quieras dejar más allá del saliente de la puerta.',
  'Measure the selected space beyond the equipment’s front operating edge.':
    'Mide el espacio seleccionado más allá del borde frontal de funcionamiento del equipo.',
  'Enter the extra space you want beyond each side of the bed footprint.':
    'Introduce el espacio adicional que quieras dejar a cada lado de la huella de la cama.',
  'Measure additional space beyond the pulled-out chair envelope.':
    'Mide el espacio adicional que quieras dejar más allá de la envolvente de la silla retirada.',
  'Enter additional space beyond the pulled-out chair envelope.':
    'Introduce el espacio adicional que quieras dejar más allá de la envolvente de la silla retirada.',
  'Enter extra space you want between the monitor group and each desk edge.':
    'Introduce el espacio adicional que quieras dejar entre el grupo de monitores y cada borde del escritorio.',
  'Measure the selected space you want beyond each side of the equipment footprint.':
    'Mide el espacio adicional seleccionado que quieras dejar a cada lado de la huella del equipo.',
  'Enter the additional distance you personally want between every rug edge and the room walls.':
    'Introduce la distancia adicional que quieras dejar entre cada borde de la alfombra y las paredes.',
  'Enter the clear aisle width you want to keep available.':
    'Introduce el ancho libre del pasillo que quieras mantener disponible.',
  'Enter the clear aisle you want to keep open for access.':
    'Introduce el ancho libre del pasillo que quieras mantener para el acceso.',
  'Measure the extra space required beyond the appliance’s left and right sides.':
    'Mide el espacio adicional necesario más allá de los lados izquierdo y derecho del electrodoméstico.',
  'Measure the amount of rug you want to extend beneath the furniture from its front edge.':
    'Mide cuánto quieres extender la alfombra bajo el mueble desde su borde delantero.',
  'Measure how far you want the rug to extend from the furniture front edge into open floor.':
    'Mide cuánto quieres que se extienda la alfombra desde el borde delantero del mueble hacia el suelo libre.',
  'Enter any extra rug border you personally want beyond the full measured furniture/use footprint.':
    'Introduce el borde adicional que quieras dejar entre la huella medida completa del mobiliario/zona de uso y la alfombra.',
  'This value is your planning choice. It is added outside the object footprint and is not a universal access, code or safety standard.':
    'Este valor es una elección de planificación. Se suma fuera de la huella del objeto y no es una norma universal de acceso, construcción o seguridad.',
  'This is a user-selected working-space target, not viewing distance or an ergonomic recommendation. Zero excludes that extra reserve.':
    'Este es un objetivo de espacio de trabajo elegido por el usuario, no una distancia de visualización ni una recomendación ergonómica. Cero excluye esa reserva adicional.',
  'This is a user-selected target, not a standard. It is applied outside the combined monitor footprint.':
    'Es un objetivo elegido por el usuario, no una norma. Se aplica por fuera de la huella combinada de los monitores.',
  'This is a chosen margin around the occupied area, not a supplied standard.':
    'Es un margen elegido alrededor del área ocupada, no una norma suministrada.',
  'This is the table body dimension; pulled-out chair space is calculated separately.':
    'Esta es la dimensión del cuerpo de la mesa; el espacio para las sillas retiradas se calcula por separado.',
  'This is a user-selected planning target, not a code minimum or universal recommendation.':
    'Es un objetivo de planificación elegido por el usuario, no un mínimo normativo ni una recomendación universal.',
  'The cue envelope already uses the entered cue length; this is an additional chosen allowance.':
    'La envolvente del taco ya usa el largo introducido; este es un margen adicional elegido por el usuario.',
  'This is an optional, user-selected target—not a universal aisle or accessibility standard.':
    'Es un objetivo opcional elegido por el usuario, no una norma universal de paso o accesibilidad.',
  'This is a user-selected target, not an accessibility or code standard.':
    'Es un objetivo elegido por el usuario, no una norma de accesibilidad ni de construcción.',
  'Choose side-door and front/rear access targets; approach angle and turning path are not modeled.':
    'Elige objetivos de acceso lateral, delantero y trasero; no se modelan el ángulo de aproximación ni la trayectoria de giro.',
  'Choose any extra side, front or overhead working space you want to reserve.':
    'Elige el espacio adicional lateral, frontal o superior que quieras reservar para trabajar.',
  'Choose any extra walking-space target for your layout; it is a planning input, not a universal standard.':
    'Elige el espacio adicional para caminar que quieras en tu distribución; es un dato de planificación, no una norma universal.',
  'This is a user-selected planning target, not a universal accessibility standard.':
    'Es un objetivo de planificación elegido por el usuario, no una norma universal de accesibilidad.',
  'This is a user-selected target, not a building or accessibility standard.':
    'Es un objetivo elegido por el usuario, no una norma de construcción o accesibilidad.',
  'Choose the seating arrangement and any walking space you want to reserve.':
    'Elige la disposición de los asientos y el espacio para caminar que quieras reservar.',
  'Choose an aisle target for your access needs; capacity is a simplified single-layer estimate.':
    'Elige un ancho de pasillo según tus necesidades de acceso; la capacidad es una estimación simplificada de una sola capa.',
  'Choose the access aisle and item spacing; the estimate does not model stacking or load limits.':
    'Elige el pasillo de acceso y la separación entre objetos; la estimación no modela apilamientos ni límites de carga.',
  'This is a user-selected work zone unless the exact manual specifies a requirement.':
    'Es una zona de trabajo elegida por el usuario, salvo que el manual exacto indique un requisito.',
  'This is a user-selected planning target, not a universal aisle width.':
    'Es un objetivo de planificación elegido por el usuario, no un ancho universal de pasillo.',
  'Any additional walking clearance is a separate user-selected value.':
    'Cualquier holgura adicional para caminar es un valor independiente elegido por el usuario.',
  'Measure from the named item edge to the space or obstruction edge.':
    'Mide desde el borde indicado del artículo hasta el borde del espacio u obstáculo.',
  'Measure from the equipment’s left outside edge to the manufacturer-defined zone boundary.':
    'Mide desde el borde exterior izquierdo del equipo hasta el límite de la zona indicado por el fabricante.',
  'Measure from the equipment’s right outside edge to the manufacturer-defined zone boundary.':
    'Mide desde el borde exterior derecho del equipo hasta el límite de la zona indicado por el fabricante.',
  'Measure from the equipment’s front outside edge to the manufacturer-defined zone boundary.':
    'Mide desde el borde exterior delantero del equipo hasta el límite de la zona indicado por el fabricante.',
  'Measure from the tub’s service/access face to the nearest fixed obstruction.':
    'Mide desde la cara de mantenimiento o acceso de la bañera hasta el obstáculo fijo más cercano.',
  'Measure beyond the named service-panel side of the tub.':
    'Mide desde el lado de mantenimiento indicado de la bañera.',
  'This is a user-selected access target, not a universal minimum.':
    'Es un objetivo de acceso elegido por el usuario, no un mínimo universal.',
  'This is a user-selected target, not a supplied safety standard.':
    'Es un objetivo elegido por el usuario, no una norma de seguridad suministrada.',
  'This allowance does not establish a code, accessibility or safety minimum.':
    'Esta holgura no establece un mínimo normativo, de accesibilidad o de seguridad.',
  'This is a user-selected layout value and is not a standard minimum.':
    'Este valor de distribución lo elige el usuario y no es un mínimo normativo.',
  'This is a user-selected target, not a universal rug-sizing rule. For dining, include chair movement in the footprint only if you want that area covered.':
    'Es un objetivo elegido por el usuario, no una regla universal para dimensionar alfombras. En el comedor, incluye el movimiento de las sillas en la huella solo si quieres cubrir esa zona.',
  'This tool checks the overlap value you enter; it does not locate actual legs or prescribe a styling rule.':
    'La herramienta comprueba el solapamiento que introduces; no ubica las patas reales ni prescribe una regla de decoración.',
  'This is a user-selected target, not a recommended or universal interior-design standard.':
    'Es un objetivo elegido por el usuario, no una recomendación ni una norma universal de diseño de interiores.',
  'Enter only the additional distance you want to reserve. The tool does not present one universal walking clearance.':
    'Introduce solo la distancia adicional que quieras reservar. La herramienta no establece una holgura universal para caminar.',
  'Measure vertically from its lowest to highest fixed point.':
    'Mide en vertical desde el punto fijo más bajo hasta el más alto.',
  'Measure from the finished floor or base to the lowest fixed overhead obstruction.':
    'Mide desde el suelo terminado o la base hasta el obstáculo fijo superior más bajo.',
  'Measure from the usable floor/base to the lowest fixed upper edge.':
    'Mide desde el suelo o la base útiles hasta el borde fijo superior más bajo.',
  'Measure from the relevant equipment/ground reference to the lowest overhead obstruction.':
    'Mide desde la referencia del equipo o del suelo pertinente hasta el obstáculo superior más bajo.',
  'Measure vertically from the patio surface to the lowest fixed obstruction.':
    'Mide en vertical desde la superficie del patio hasta el obstáculo fijo más bajo.',
  'Measure vertically from the patio to the lowest fixed overhead obstruction.':
    'Mide en vertical desde el patio hasta el obstáculo fijo superior más bajo.',
  'Measure from the usable floor to the lowest fixed overhead obstruction.':
    'Mide desde el suelo útil hasta el obstáculo fijo superior más bajo.',
  'Measure from the usable floor/base to the lowest fixed shelf or ceiling obstruction.':
    'Mide desde el suelo o la base útiles hasta el estante fijo o el obstáculo del techo más bajo.',
  'Measure vertically from the usable floor to the lowest fixed overhead obstruction.':
    'Mide en vertical desde el suelo útil hasta el obstáculo superior fijo más bajo.',
  'Measure the highest point of the cover through its open/lift movement to the overhead obstruction.':
    'Mide el punto más alto que alcanza la tapa al abrirse o levantarse hasta el obstáculo superior.',
  'Measure vertically from the usable threshold to the lowest fixed part of the frame.':
    'Mide en vertical desde el umbral útil hasta la parte fija más baja del marco.',
  'Measure vertically from the threshold to the lowest part of the open door/track.':
    'Mide en vertical desde el umbral hasta la parte más baja de la puerta o el riel cuando está abierto.',
  'Measure vertically from the stair path/nosing to the lowest overhead obstruction.':
    'Mide en vertical desde la línea de paso o el borde del peldaño hasta el obstáculo superior más bajo.',
  'Measure the space from the appliance top to the lowest fixed overhead edge.':
    'Mide el espacio desde la parte superior del electrodoméstico hasta el borde fijo superior más bajo.',
  'Measure vertically from the top of the clear threshold to the lowest fixed part of the open frame.':
    'Mide en vertical desde la parte superior del umbral libre hasta la parte fija más baja del marco abierto.',
  'Measure from the usable threshold to the lowest fixed part of the frame.':
    'Mide desde el umbral útil hasta la parte fija más baja del marco.',
  'Use the lowest usable clear height, not the ceiling height at an unobstructed point.':
    'Usa la altura libre útil más baja, no la altura del techo en un punto sin obstáculos.',
  'Measure between the item’s fixed outermost points in the orientation shown.':
    'Mide entre los puntos exteriores fijos del artículo en la orientación indicada.',
  'Measure from the front-most to rear-most fixed outside point.':
    'Mide desde el punto exterior fijo más adelantado hasta el más retrasado.',
  'Measure the exact clamp/base footprint from front-most to rear-most edge.':
    'Mide la huella exacta de la abrazadera o base desde el borde más adelantado hasta el más retrasado.',
  'Measure from the front-most to rear-most fixed outside edge.':
    'Mide de borde exterior fijo más adelantado a más retrasado.',
  'Measure from the wardrobe door’s pivot face to the bed or other obstacle.':
    'Mide desde la cara de giro de la puerta del armario hasta la cama u otro obstáculo.',
  'Measure from the dresser front to the bed or other fixed obstacle.':
    'Mide desde el frente de la cómoda hasta la cama u otro obstáculo fijo.',
  'Measure the usable top from its front edge to the rear edge.':
    'Mide la superficie superior útil desde el borde delantero hasta el trasero.',
  'Measure across the tabletop at its widest point; chair space is calculated separately.':
    'Mide la mesa de lado a lado en su punto más ancho; el espacio para las sillas se calcula por separado.',
  'Measure the extra desk depth you want to reserve behind the base for cables or airflow.':
    'Mide la profundidad adicional que quieras reservar detrás de la base para cables o ventilación.',
  'Measure the front-to-back space you want reserved in front of the monitor base.':
    'Mide el espacio de delante hacia atrás que quieras reservar frente a la base del monitor.',
  'Measure from its front-most to rear-most fixed edge; use the exact stand or arm base in your setup.':
    'Mide desde el borde fijo más adelantado hasta el más retrasado; usa la base exacta del soporte o brazo que tengas instalado.',
  'Measure the clear distance from the front inside edge to the rear inside edge.':
    'Mide la distancia libre desde el borde interior delantero hasta el borde interior trasero.',
  'Measure the room’s clear inside width/depth and the rug’s actual outside width/depth.':
    'Mide el ancho y la profundidad interiores libres de la habitación y el ancho y la profundidad exteriores reales de la alfombra.',
  'Use the actual measured clear patio span for the fit comparison.':
    'Usa el espacio libre real medido en el patio para comparar el ajuste.',
  'Measure the patio between fixed edges or obstacles for the actual space.':
    'Mide el patio entre los bordes u obstáculos fijos que delimitan el espacio real.',
  'Measure the horizontal projection from the structure body side to the roof edge.':
    'Mide la proyección horizontal desde el lateral del cuerpo de la estructura hasta el borde del techo.',
  'Measure from the greenhouse body side to the roof edge.':
    'Mide desde el lateral del cuerpo del invernadero hasta el borde del techo.',
  'Measure from the equipment’s rear outside edge to the manufacturer-defined zone boundary.':
    'Mide desde el borde exterior trasero del equipo hasta el límite de la zona indicado por el fabricante.',
  'Measure beyond the named end of the kitchen run to the nearest fixed boundary.':
    'Mide desde el extremo indicado del tramo de cocina hasta el límite fijo más cercano.',
  'Measure from the end wall to the roof edge.':
    'Mide desde la pared del extremo hasta el borde del techo.',
  'Measure from the front body wall to the outer roof edge.':
    'Mide desde la pared frontal del cuerpo hasta el borde exterior del techo.',
  'Measure from the rear body wall to the outer roof edge.':
    'Mide desde la pared trasera del cuerpo hasta el borde exterior del techo.',
  'Measure from the rear edge of the run to the nearest fixed boundary.':
    'Mide desde el borde trasero del tramo hasta el límite fijo más cercano.',
  'Measure from the rear of the run to the nearest wall or obstruction.':
    'Mide desde la parte trasera del tramo hasta la pared u obstáculo más cercano.',
  'Measure the clear inside distance from the door plane to the rear obstruction.':
    'Mide la distancia interior libre desde el plano de la puerta hasta el obstáculo trasero.',
  'Measure the usable room inside dimensions, including fixed obstructions.':
    'Mide las dimensiones interiores útiles de la habitación, incluidos los obstáculos fijos.',
  'Measure the shed’s clear inside dimensions, door opening and fixed shelves or posts.':
    'Mide las dimensiones interiores libres del cobertizo, la abertura de la puerta y los estantes o postes fijos.',
  'Measure usable plot width and depth between boundaries and fixed obstacles.':
    'Mide el ancho y la profundidad útiles del terreno entre sus límites y los obstáculos fijos.',
  'Measure usable plot width and depth from actual boundaries and obstacles.':
    'Mide el ancho y la profundidad útiles del terreno a partir de los límites y obstáculos reales.',
  'Measure the usable plot around the full use zone, not only the equipment footprint.':
    'Mide el terreno útil alrededor de toda la zona de uso, no solo la huella del equipo.',
  'Measure the garage’s inside dimensions and the clear door opening, not its nominal size.':
    'Mide las dimensiones interiores del garaje y la abertura libre de la puerta, no su tamaño nominal.',
  'Measure clear room width and length between fixed obstructions.':
    'Mide el ancho y el largo libres de la habitación entre obstáculos fijos.',
  'Measure usable interior dimensions around shelves, posts, doors and other fixed obstructions.':
    'Mide las dimensiones interiores útiles teniendo en cuenta estantes, postes, puertas y otros obstáculos fijos.',
  'Measure the clear inside distance from the front edge to the rear obstruction.':
    'Mide la distancia interior libre desde el borde delantero hasta el obstáculo trasero.',
  'Measure the clear desktop from its front edge to its rear edge.':
    'Mide la superficie útil del escritorio desde el borde delantero hasta el trasero.',
  'Measure the bench/staging depth from the wall to its front edge.':
    'Mide la profundidad del banco o zona de trabajo desde la pared hasta el borde delantero.',
  'Measure the usable console top from front to rear edge.':
    'Mide la superficie útil del mueble desde el borde delantero hasta el trasero.',
  'Measure from the front edge of the opening to the rear obstruction.':
    'Mide desde el borde delantero de la abertura hasta el obstáculo trasero.',
  'Measure from the working face of the run to the edge of the clear patio area.':
    'Mide desde la cara de trabajo del tramo hasta el borde del área libre del patio.',
  'Measure from the fixed vehicle body edge to the outer edge of the open door.':
    'Mide desde el borde fijo de la carrocería hasta el borde exterior de la puerta abierta.',
  'Measure from the closed door plane to the outermost edge of the open door.':
    'Mide desde el plano de la puerta cerrada hasta el borde más saliente de la puerta abierta.',
  'Measure from the vehicle body edge to the outer edge of the open door.':
    'Mide desde el borde de la carrocería hasta el borde exterior de la puerta abierta.',
  'Measure from the appliance rear edge to the wall or obstruction.':
    'Mide desde el borde trasero del electrodoméstico hasta la pared u obstáculo.',
  'Measure the usable opening between its narrowest fixed inside edges.':
    'Mide la abertura útil entre sus bordes interiores fijos más estrechos.',
  'Measure the opening’s clear width, depth and height at the narrowest points.':
    'Mide el ancho, la profundidad y la altura libres de la abertura en sus puntos más estrechos.',
  'Measure the usable opening between the closest fixed edges.':
    'Mide la abertura útil entre los bordes fijos más cercanos.',
  'Measure the usable opening between the door-frame inside edges.':
    'Mide la abertura útil entre los bordes interiores del marco de la puerta.',
  'Measure between fixed inside edges of the usable wall area.':
    'Mide entre los bordes interiores fijos del área útil de pared.',
  'Measure the landing depth from the inside corner to the next obstruction.':
    'Mide la profundidad del rellano desde la esquina interior hasta el siguiente obstáculo.',
  'Measure the clear width of the landing/turn area between fixed edges.':
    'Mide el ancho libre del rellano o zona de giro entre los bordes fijos.',
  'Measure between finished inside wall surfaces using the same reference as room width.':
    'Mide entre las superficies interiores terminadas de las paredes, usando la misma referencia que para el ancho de la habitación.',
  'Measure the room between finished inside wall surfaces at its narrowest usable points.':
    'Mide la habitación entre las superficies interiores terminadas de las paredes, en los puntos útiles más estrechos.',
  'Use the narrowest usable interior span.': 'Usa el tramo interior útil más estrecho.',
  'Measure between the usable inside boundaries along the room length.':
    'Mide entre los límites interiores útiles a lo largo del largo de la habitación.',
  'Measure the usable width between interior wall surfaces, excluding staging that reduces it.':
    'Mide el ancho útil entre las superficies interiores de las paredes, descontando cualquier zona de trabajo que lo reduzca.',
  'Measure between the usable inside boundaries at the floor.':
    'Mide entre los límites interiores útiles a la altura del suelo.',
  'Measure the usable clear distance between the finished inside boundaries.':
    'Mide la distancia libre útil entre los límites interiores terminados.',
  'Include fixed handles, trim or projections. Use the exact model dimensions where available; do not substitute a nominal size for the measured outside size.':
    'Incluye asas fijas, molduras o salientes. Si es posible, usa las dimensiones del modelo exacto; no sustituyas la medida exterior real por un tamaño nominal.',
  'Include any fixed trim that reduces the surface available to place the monitor stands.':
    'Incluye cualquier moldura fija que reduzca la superficie disponible para colocar los soportes de los monitores.',
  'Include any fixed projection that remains beside the bed.':
    'Incluye cualquier saliente fijo que permanezca junto a la cama.',
  'Use the furniture body dimensions, not drawer capacity or advertised top size.':
    'Usa las dimensiones del cuerpo del mueble, no su capacidad de cajones ni el tamaño anunciado de la superficie superior.',
  'Use the widest part of the chair body, not the seat width alone.':
    'Usa la parte más ancha del cuerpo de la silla, no solo el ancho del asiento.',
  'Measure clear space between wall, frame or obstruction surfaces—not the advertised or nominal outside dimension.':
    'Mide el espacio libre entre la pared, el marco u otras superficies que obstruyan; no uses la dimensión exterior nominal o anunciada.',
  'Measure usable clearance, accounting for stops or hardware that remain in the opening. Nominal door size may be larger.':
    'Mide el espacio libre útil, teniendo en cuenta topes o herrajes que permanezcan en la abertura. El tamaño nominal de la puerta puede ser mayor.',
  'Check at the narrowest point where the appliance body will sit.':
    'Comprueba la medida en el punto más estrecho donde se colocará el cuerpo del electrodoméstico.',
  'Compare with the outside width of equipment that must pass through.':
    'Compara con el ancho exterior del equipo que deba pasar por la abertura.',
  'Use the usable opening, including any fixed stop or hardware that reduces clearance.':
    'Usa la abertura útil, incluidos los topes o herrajes fijos que reduzcan el espacio libre.',
  'Use clear interior height, not the outside cabinet height.':
    'Usa la altura interior libre, no la altura exterior del armario.',
  'Include obstructions that limit where the TV can be placed.':
    'Incluye los obstáculos que limiten dónde se puede colocar el televisor.',
  'Include door tracks or storage that hang below the ceiling.':
    'Incluye los rieles de la puerta o el almacenamiento que cuelgue por debajo del techo.',
  'Include eaves, beams or other fixed projections above the tub and cover path.':
    'Incluye aleros, vigas u otros salientes fijos sobre la bañera y la trayectoria de la tapa.',
  'Account for shelves or fixed equipment that reduce parking depth.':
    'Ten en cuenta estantes o equipos fijos que reduzcan la profundidad disponible para estacionar.',
  'Do not include the door swing unless that is what the field requests.':
    'No incluyas el giro de la puerta, salvo que el campo lo solicite.',
  'Account for fixed obstructions where the equipment and its operating zone need to sit.':
    'Ten en cuenta los obstáculos fijos en el lugar donde deban ubicarse el equipo y su zona de funcionamiento.',
  'Do not use the cabinet’s nominal width. Include any frame or hardware that remains in the opening.':
    'No uses el ancho nominal del armario. Incluye el marco o los herrajes que permanezcan en la abertura.',
  'This is the listed nominal size, not the usable clear opening.':
    'Es el tamaño nominal indicado, no la abertura útil libre.',
  'This is a nominal listing dimension, not usable depth.':
    'Es una dimensión nominal anunciada, no la profundidad útil.',
  'Use the actual clear opening, not the nominal door size.':
    'Usa la abertura libre real, no el tamaño nominal de la puerta.',
  'The opening is different from the wider interior garage dimension.':
    'La abertura no es lo mismo que la dimensión interior más amplia del garaje.',
  'Allow for any fixed trim or obstruction that reduces the available opening.':
    'Ten en cuenta cualquier moldura u obstáculo fijo que reduzca la abertura disponible.',
  'Measure at the narrowest usable point, including fixed obstructions.':
    'Mide en el punto útil más estrecho, incluidos los obstáculos fijos.',
  'Measure the narrowest clear width along the route to the entrance.':
    'Mide el ancho libre más estrecho a lo largo de la ruta hasta la entrada.',
  'Measure each doorway, corridor, turn, stair and landing at its narrowest clear point.':
    'Mide cada puerta, pasillo, giro, escalera y rellano en su punto libre más estrecho.',
  'Measure between the narrowest fixed obstructions along the stair.':
    'Mide entre los obstáculos fijos más estrechos a lo largo de la escalera.',
  'Use the narrowest usable span where fixed trim, a chimney breast or another obstruction reduces space.':
    'Usa el tramo útil más estrecho cuando una moldura fija, un saliente de chimenea u otro obstáculo reduzca el espacio.',
  'Use the narrowest span where fixed cabinetry, columns or other obstructions reduce space.':
    'Usa el tramo más estrecho cuando muebles fijos, columnas u otros obstáculos reduzcan el espacio.',
  'Use the narrowest span where fixed posts or obstructions reduce the play area.':
    'Usa el tramo más estrecho donde postes fijos u otros obstáculos reduzcan el área de juego.',
  'Measure between shelves or fixed structures that reduce usable space.':
    'Mide entre los estantes o las estructuras fijas que reduzcan el espacio útil.',
  'Check each pinch point along the route separately; one corridor width does not describe a turn or landing.':
    'Comprueba por separado cada estrechamiento de la ruta; un único ancho de pasillo no describe un giro ni un rellano.',
  'Check each narrower point separately; the route also depends on turning space.':
    'Comprueba por separado cada punto más estrecho; la ruta también depende del espacio para girar.',
  'Check each pinch point separately; the sketch does not simulate carrying or turning.':
    'Comprueba por separado cada estrechamiento; el esquema no simula el transporte ni los giros.',
  'Use the narrowest available span along the route.':
    'Usa el tramo disponible más estrecho de toda la ruta.',
  'This is the available measured aisle, not a target.':
    'Este es el ancho medido del pasillo disponible, no un objetivo.',
  'The central aisle is measured separately between the staging fronts.':
    'El pasillo central se mide por separado entre los bordes delanteros de las zonas de trabajo.',
  'Measure or choose the clear passage you want between staging fronts.':
    'Mide o elige el paso libre que quieras mantener entre los bordes delanteros de las zonas de trabajo.',
  'Use the clear area available for the item to turn, not the full room depth.':
    'Usa la zona libre disponible para que el artículo gire, no toda la profundidad de la habitación.',
  'Do not measure from screen centers or include a side margin here.':
    'No midas desde el centro de las pantallas ni incluyas aquí el margen lateral.',
  'Keep the item in one orientation for width, depth and height. Include packaging when it remains on for a delivery check.':
    'Mantén el artículo en una sola orientación para medir ancho, profundidad y altura. Incluye el embalaje si se conserva durante la comprobación de entrega.',
  'Include fixed feet, handles or top projections. For a route check, separately include packaging if it stays on.':
    'Incluye patas fijas, asas o salientes superiores. Para comprobar una ruta, incluye por separado el embalaje si permanece puesto.',
  Value: 'Valor',
  measurements: 'medidas',
  Breadcrumb: 'Ruta de navegación',
  'Fit services': 'Servicios de verificación',
  'How this check works': 'Cómo funciona esta comprobación',
  'Scope and limitations': 'Alcance y limitaciones',
  'Sources and entered data': 'Fuentes y datos introducidos',
  'No product-specific dimension is preloaded for this feature. The live calculation uses the dimensions you enter; copy model-specific limits from current manuals.':
    'Esta función no incluye dimensiones precargadas de productos específicos. El cálculo utiliza las medidas que introduces; consulta los límites del modelo en el manual vigente.',
  'Calculation methodology': 'Metodología de cálculo',
  'Related next checks': 'Otras comprobaciones relacionadas',
  'What to check next': 'Qué comprobar a continuación',
  'Related planning guides': 'Guías de planificación relacionadas',
  'Explore related planning guides': 'Explora guías de planificación relacionadas',
  'Sources and evidence': 'Fuentes y evidencia',
  'Measure between fixed inside faces': 'Mide entre las caras interiores fijas',
  'An arrow spans the usable inside width between two fixed boundaries.':
    'Una flecha indica el ancho interior utilizable entre dos límites fijos.',
  'Separate the object footprint from its clearance envelope':
    'Distingue la huella del objeto de su contorno de holgura',
  'A solid object sits inside a larger dashed outline showing extra space to measure.':
    'El objeto sólido aparece dentro de un contorno discontinuo más grande que representa el espacio adicional que se debe medir.',
  'Measure each narrow point along a route': 'Mide cada punto estrecho de la ruta',
  'A doorway, corridor and turn are checked as separate route sections.':
    'La puerta, el pasillo y el giro se comprueban como tramos separados de la ruta.',
  'Measure the full operating zone': 'Mide toda la zona de funcionamiento',
  'A dashed boundary surrounds the equipment footprint to show its use zone.':
    'Un límite discontinuo rodea la huella del equipo para mostrar su zona de uso.',
  'inside face to inside face': 'de cara interior a cara interior',
  'Measure between the fixed inside faces at the narrowest usable point.':
    'Mide entre las caras interiores fijas en el punto útil más estrecho.',
  'Measure the usable top between its fixed side edges, not the outside frame.':
    'Mide la superficie superior útil entre sus bordes laterales fijos, no el marco exterior.',
  'Measure the usable desk top and the actual stand or arm base, not the advertised desk size.':
    'Mide la superficie útil del escritorio y la base real del soporte o brazo, no el tamaño anunciado del escritorio.',
  'Measure monitor and base dimensions, desk thickness, usable width and depth.':
    'Mide las dimensiones del monitor y la base, el grosor del escritorio y el ancho y la profundidad útiles.',
  'Measure the desktop thickness at the exact edge where the clamp will attach.':
    'Mide el grosor del escritorio en el borde exacto donde se fijará la abrazadera.',
  'Measure between the narrowest fixed inside edges of the open doorway.':
    'Mide entre los bordes interiores fijos más estrechos de la puerta abierta.',
  'Measure the narrowest usable distance between the fixed inside edges of the open door.':
    'Mide la distancia útil más estrecha entre los bordes interiores fijos de la puerta abierta.',
  'Measure the hinged leaf from its hinge/pivot edge to its free edge.':
    'Mide la hoja con bisagras desde el borde de giro hasta el borde libre.',
  'Measure the narrowest clear distance between fixed walls or obstacles.':
    'Mide la distancia libre más estrecha entre paredes fijas u obstáculos.',
  'Measure the clear walking aisle between the stored item area and the opposite obstruction.':
    'Mide el pasillo libre para caminar entre el área del objeto almacenado y el obstáculo opuesto.',
  'Measure the narrowest clear aisle between stored items and the opposite obstruction.':
    'Mide el pasillo libre más estrecho entre los artículos almacenados y el obstáculo opuesto.',
  'Repeat at every doorway on the route; nominal door size is not the usable opening.':
    'Repite la medida en cada puerta de la ruta; el tamaño nominal no equivale a la abertura útil.',
  'Repeat at each doorway and include fixed stops or hardware that reduce clearance.':
    'Repite la medida en cada puerta e incluye los topes o herrajes fijos que reduzcan el espacio libre.',
  'Check railings and wall projections; stair width alone does not prove an item can be carried safely.':
    'Comprueba las barandillas y los salientes de las paredes; el ancho de la escalera por sí solo no demuestra que el artículo pueda transportarse sin riesgo.',
  'object + extra space': 'objeto + espacio adicional',
  door: 'puerta',
  'hall / turn': 'pasillo / giro',
  opening: 'abertura',
  'manufacturer use zone': 'zona de uso indicada por el fabricante',
  'Diagram is not to scale.': 'El diagrama no está a escala.',
  'Illustrative plan sketch; not to scale.': 'Esquema ilustrativo; no está a escala.',
  Example: 'Ejemplo',
  Check: 'Comprobación',
  'Source requirement': 'Requisito de la fuente',
  'Manufacturer-stated active panel width; full outer device width with bezel is larger and not supplied by this source.':
    'Ancho del panel activo indicado por el fabricante; el ancho exterior total del dispositivo con bisel es mayor y esta fuente no lo proporciona.',
  'Maximum manufacturer-listed Size B width (30.4 in), converted to millimeters and rounded to the nearest millimeter.':
    'Ancho máximo indicado por el fabricante para la talla B (30,4 in), convertido a milímetros y redondeado al milímetro más cercano.',
  'Maximum manufacturer-listed Size B depth (28.3 in), converted to millimeters and rounded to the nearest millimeter.':
    'Profundidad máxima indicada por el fabricante para la talla B (28,3 in), convertida a milímetros y redondeada al milímetro más cercano.',
  'Maximum manufacturer-listed Size B height (41.1 in), converted to millimeters and rounded to the nearest millimeter.':
    'Altura máxima indicada por el fabricante para la talla B (41,1 in), convertida a milímetros y redondeada al milímetro más cercano.',
  'Half of the sourced 1500 mm frame-width minus 1350 mm mattress-width difference.':
    'La mitad de la diferencia entre los 1500 mm de ancho del somier documentado y los 1350 mm de ancho del colchón.',
  'Half of the sourced 1990 mm frame-length minus 1900 mm mattress-length difference.':
    'La mitad de la diferencia entre los 1990 mm de largo del somier documentado y los 1900 mm de largo del colchón.',
  'Half of the sourced 1660 mm frame-width minus 1500 mm mattress-width difference.':
    'La mitad de la diferencia entre los 1660 mm de ancho del somier documentado y los 1500 mm de ancho del colchón.',
  'Half of the sourced 2090 mm frame-length minus 2000 mm mattress-length difference.':
    'La mitad de la diferencia entre los 2090 mm de largo del somier documentado y los 2000 mm de largo del colchón.',
  'IKEA UK lists this optional MALM mattress-size variant separately from Standard King.':
    'IKEA Reino Unido publica esta variante opcional de tamaño de colchón MALM por separado del Standard King.',
  'One hinged leaf width; a 90-degree outward sweep is approximately this distance.':
    'Ancho de una hoja con bisagras; su barrido hacia fuera de 90 grados equivale aproximadamente a esta distancia.',
  'Manufacturer-listed pull-out distance; not a standing/walking allowance.':
    'Distancia de extracción indicada por el fabricante; no representa espacio para estar de pie o caminar.',
  'The 200 mm example is an editable placeholder, not a standard. Replace it with your model’s measured depth.':
    'El ejemplo de 200 mm es un marcador editable, no una norma. Sustitúyelo por la profundidad medida de tu modelo.',
  'Geometric remainder only; not viewing distance or keyboard/cable clearance.':
    'Solo es el espacio geométrico restante; no es la distancia de visualización ni la holgura para teclado o cables.',
  'A physiological reference, not a required screen distance or desk-depth minimum.':
    'Referencia fisiológica, no una distancia obligatoria a la pantalla ni una profundidad mínima de escritorio.',
  'A market size describes a mattress reference; a named frame uses the listed model’s outside dimensions.':
    'El tamaño de mercado describe una referencia de colchón; si se nombra un somier, se usan las dimensiones exteriores del modelo indicado.',
  'If the frame is not listed or its dimensions differ, choose custom mattress dimensions and allow for the actual frame separately.':
    'Si el somier no aparece en la lista o sus dimensiones son distintas, introduce las medidas personalizadas del colchón y añade por separado las del somier real.',
  'Mattress size is not the same as the complete bed-frame footprint; use a named measured frame when available.':
    'El tamaño del colchón no equivale a la huella completa del somier; cuando haya un modelo medido identificado, úsalo.',
  'Measure the bed frame’s outside footprint, or use the mattress dimensions if the frame is not chosen.':
    'Mide la huella exterior del somier o usa las dimensiones del colchón si aún no has elegido el somier.',
  'Mattress size is not the same as the complete bed-frame footprint.':
    'El tamaño del colchón no equivale a la huella completa del somier.',
  'Measure the exact plug/cable bend and follow the monitor manual; no generic allowance is applied.':
    'Mide el enchufe y el radio de curvatura del cable exactos, y sigue el manual del monitor; no se aplica una holgura genérica.',
  'Use the manufacturer’s full product dimensions or measure the monitor body. The screen-width estimate derived from diagonal and aspect ratio is approximate.':
    'Usa las dimensiones completas del producto indicadas por el fabricante o mide el cuerpo del monitor. El ancho de pantalla estimado a partir de la diagonal y la relación de aspecto es aproximado.',
  'The tool estimates screen width from diagonal and aspect ratio; check full product width or enter an override for the monitor body.':
    'La herramienta estima el ancho de pantalla a partir de la diagonal y la relación de aspecto; comprueba el ancho total del producto o introduce una medida personalizada del cuerpo del monitor.',
  'The ratio describes the visible screen, not the monitor’s full outside dimensions.':
    'La relación describe la pantalla visible, no las dimensiones exteriores completas del monitor.',
  'The width and depth inputs change meaning with the selected direction. Check the labels after changing it.':
    'El significado de ancho y profundidad cambia según la dirección elegida. Comprueba las etiquetas después de cambiarla.',
  'The rug may be checked with its width along either room axis.':
    'La alfombra se puede comprobar con el ancho alineado con cualquiera de los dos ejes de la habitación.',
  'Use exact monitor instructions when ventilation clearances apply. Zero means no extra rear reserve is included.':
    'Sigue las instrucciones del monitor exacto cuando haya requisitos de ventilación. Cero significa que no se añade espacio trasero adicional.',
  'Geometric estimate from the sourced leaf width.':
    'Estimación geométrica basada en el ancho documentado de la hoja.',
  'The result is a geometric swing estimate; it does not assess hardware stops or a safe operating space.':
    'El resultado es una estimación geométrica del barrido; no evalúa topes de herrajes ni el espacio seguro de uso.',
  'The check compares the open door envelope only. It does not add standing or walking allowance.':
    'La comprobación solo compara la envolvente de la puerta abierta. No añade espacio para estar de pie o caminar.',
  'The check compares an open drawer envelope only. It does not add standing or walking allowance.':
    'La comprobación solo compara la envolvente del cajón abierto. No añade espacio para estar de pie o caminar.',
  'A dimensional pass is not a delivery or lifting guarantee.':
    'Que las dimensiones encajen no garantiza que el artículo pueda entregarse ni levantarse.',
  'Use the drawer’s actual full extension; the check compares the drawer envelope only.':
    'Usa la extensión total real del cajón; la comprobación solo compara la envolvente del cajón.',
  'This chair envelope ends at the chair back. Any walking space is entered separately.':
    'La envolvente de la silla termina en el respaldo. El espacio para caminar se introduce por separado.',
  'This is the door leaf width used to sketch its swing; it does not include a walking or standing zone.':
    'Es el ancho de la hoja usado para dibujar su barrido; no incluye una zona para caminar o estar de pie.',
  'Quick result matrix': 'Matriz de resultados rápidos',
  'Fit result': 'Resultado del ajuste',
  'What these results mean': 'Qué significan estos resultados',
  'Fit result by bed and orientation; expand a result below for full dimensions and assumptions.':
    'Resultado del ajuste por cama y orientación; despliega un resultado abajo para ver las dimensiones y los supuestos completos.',
  Bed: 'Cama',
  Portrait: 'Vertical',
  Landscape: 'Horizontal',
  'Fit result by configuration; expand an option below for full dimensions and assumptions.':
    'Resultado del ajuste por configuración; despliega una opción abajo para ver las dimensiones y los supuestos completos.',
  'Fits exactly': 'Cabe exactamente',
  'No measurement tolerance remains. Re-check actual dimensions before relying on this result.':
    'No queda margen de tolerancia de medida. Vuelve a comprobar las dimensiones reales antes de basarte en este resultado.',
  'All dimensions are user-entered; the calculation does not identify a product or assume a local standard.':
    'Todas las dimensiones las introduce el usuario; el cálculo no identifica un producto ni presupone una norma local.',
  'Access checks use the narrowest upright face and object height; no diagonal or tilted passage is modeled.':
    'Las comprobaciones de acceso usan la cara vertical más estrecha y la altura del objeto; no se modela el paso en diagonal o inclinado.',
  'Quantity is a rectangular single-layer grid estimate. Stacking, irregular geometry, access lanes and obstacles are excluded.':
    'La cantidad es una estimación de una cuadrícula rectangular en una sola capa. No se incluyen apilamientos, geometrías irregulares, pasillos de acceso ni obstáculos.',
  'Fit review copied to clipboard.': 'La evaluación de ajuste se copió al portapapeles.',
  'Clipboard access is unavailable in this browser.':
    'Este navegador no permite acceder al portapapeles.',
  'width by depth': 'ancho por profundidad',
  'depth by width': 'profundidad por ancho',
  'The measured footprint meets your selected target exactly.':
    'La huella medida cumple exactamente el objetivo que seleccionaste.',
  'The measured footprint and selected targets pass the checks shown.':
    'La huella medida y los objetivos seleccionados superan las comprobaciones mostradas.',
  'Re-measure the actual product and usable space before buying or installing.':
    'Vuelve a medir el producto real y el espacio útil antes de comprar o instalar.',
  'Remeasure the actual product and usable space before buying or installing.':
    'Vuelve a medir el producto real y el espacio útil antes de comprar o instalar.',
  'Recheck the actual product dimensions and any model-specific instructions before buying or installing.':
    'Vuelve a comprobar las dimensiones reales del producto y las instrucciones específicas del modelo antes de comprar o instalar.',
  'Remeasure the binding area or adjust the layout/target you chose, then check again.':
    'Vuelve a medir la zona limitante o ajusta la distribución o el objetivo que elegiste y comprueba de nuevo.',
  'Remeasure the item and usable opening, then try another orientation or a larger space.':
    'Vuelve a medir el artículo y la abertura útil; después, prueba otra orientación o un espacio mayor.',
  'A required compatibility check failed even though the dimension table may show a physical fit.':
    'No se superó una comprobación de compatibilidad obligatoria, aunque la tabla de dimensiones indique que físicamente cabe.',
  'Verify the exact model specifications or choose compatible products before installing.':
    'Verifica las especificaciones del modelo exacto o elige productos compatibles antes de instalar.',
  'This result is not confirmed because required information has not been verified.':
    'Este resultado no está confirmado porque no se ha verificado la información obligatoria.',
  'Complete the verification steps listed below, then run the check again.':
    'Completa los pasos de verificación que aparecen abajo y vuelve a ejecutar la comprobación.',
  'Tightest point': 'Punto más ajustado',
  'Missing or unverified requirements': 'Requisitos pendientes o sin verificar',
  'What is missing': 'Qué falta',
  Compatibility: 'Compatibilidad',
  'Physical fit': 'Ajuste físico',
  'Selected clearance': 'Holgura seleccionada',
  Next: 'Siguiente',
  'Example result — {label}': 'Resultado de ejemplo — {label}',
  'Your result — {label}': 'Tu resultado — {label}',
  Configuration: 'Configuración',
  Result: 'Resultado',
  Assumptions: 'Supuestos',
  'Before you start': 'Antes de comenzar',
  'For verification': 'Para verificar',
  Required: 'Obligatorio',
  Optional: 'Opcional',
  'Example data loaded': 'Datos de ejemplo cargados',
  'The values below are illustrative.': 'Los valores siguientes son ilustrativos.',
  'Replace the illustrative values with your own measurements before relying on the result.':
    'Sustituya los valores ilustrativos por sus propias medidas antes de basarse en el resultado.',
  'Calculator progress': 'Progreso de la calculadora',
  Previous: 'Anterior',
  Complete: 'Completado',
  'Needs input': 'Falta información',
  'Not started': 'Sin comenzar',
  'View result': 'Ver resultado',
  'Current · measurements entered': 'Actual · medidas introducidas',
  'Current · add required values': 'Actual · introduzca los valores obligatorios',
  Fits: 'Cabe',
  Tight: 'Ajustado',
  'Does not fit': 'No cabe',
  'Needs information': 'Falta información',
  'Hard physical requirements and selected or verified targets pass.':
    'Se cumplen los requisitos físicos estrictos y los objetivos seleccionados o verificados.',
  'Physical fit passes, but one or more selected targets do not.':
    'El ajuste físico es posible, pero no se alcanza uno o más objetivos seleccionados.',
  'At least one hard physical or access requirement fails.':
    'No se cumple al menos un requisito físico estricto o de acceso.',
  'Required measurement, source, model, manual or compatibility data has not been verified.':
    'No se han verificado las medidas, la fuente, el modelo, el manual o los datos de compatibilidad obligatorios.',
  Yes: 'Sí',
  No: 'No',
  'Not confirmed': 'Sin confirmar',
  Met: 'Cumplido',
  Short: 'Insuficiente',
  Compatible: 'Compatible',
  Incompatible: 'No compatible',
  'Needs verification': 'Debe verificarse',
  'Extra space beyond target': 'Espacio adicional respecto al objetivo',
  'Remaining target margin': 'Margen restante respecto al objetivo',
  'Short against selected target': 'Por debajo del objetivo seleccionado',
  'Additional physical space needed': 'Espacio físico adicional necesario',
  'No measurement tolerance remains': 'No queda margen de tolerancia de medida',
  'Required information': 'Información obligatoria',
  'Required measurements or exact model source': 'Medidas obligatorias o fuente del modelo exacto',
  'The model-specific installation clearance has not been verified against an exact source.':
    'La holgura de instalación específica del modelo no se ha verificado con una fuente exacta.',
  'Installation clearance source': 'Fuente de la holgura de instalación',
  'One or more required measurements, source or compatibility details have not been verified.':
    'No se han verificado una o varias medidas obligatorias, la fuente o los datos de compatibilidad.',
  'Enter the missing measurements and verify the exact model source.':
    'Introduce las medidas que faltan y verifica la fuente del modelo exacto.',
  'one or more dimensions': 'una o varias dimensiones',
  'one or more physical dimensions': 'una o varias dimensiones físicas',
  'a product compatibility check': 'una comprobación de compatibilidad del producto',
  'shown in the table': 'indicado en la tabla',
  width: 'ancho',
  depth: 'profundidad',
  height: 'altura',
  'room width': 'ancho de la habitación',
  'desk width': 'ancho del escritorio',
  'space height': 'altura del espacio',
  'equipment and overhead space': 'equipo y espacio superior',
  'stand footprint depth on console': 'profundidad de la huella del soporte sobre el mueble',
  'clear aisle against selected target': 'pasillo libre respecto al objetivo seleccionado',
  'measured aisle against selected aisle target':
    'pasillo medido respecto al objetivo seleccionado',
  'room length for table and pulled-out chairs':
    'largo de la habitación para la mesa y las sillas retiradas',
  'room width for table and pulled-out chairs':
    'ancho de la habitación para la mesa y las sillas retiradas',
  'parked vehicle length and selected front/rear space':
    'largo del vehículo estacionado y espacio delantero/trasero seleccionado',
  'furniture/use footprint width on rug':
    'ancho de la huella del mobiliario o zona de uso sobre la alfombra',
  'tub footprint and side service space': 'huella de la bañera y espacio lateral de mantenimiento',
  'kitchen run and side service space': 'tramo de cocina y espacio lateral de mantenimiento',
  'table plus cue-length clearance across room':
    'mesa más holgura para el taco a lo ancho de la habitación',
  'Check result details': 'Consulte los detalles del resultado',
  Dimension: 'Dimensión',
  Target: 'Objetivo',
  Available: 'Disponible',
  'Physical margin': 'Margen físico',
  'Target margin': 'Margen respecto al objetivo',
  'What this means': 'Qué significa',
  Missing: 'Falta',
  'Why it matters': 'Por qué es importante',
  Action: 'Acción',
  Item: 'Artículo',
  Space: 'Espacio',
  'Floor orientation': 'Orientación en el suelo',
  'Required measurement': 'Medida obligatoria',
  Recommended: 'Recomendado',
  'Available width': 'Ancho disponible',
  'Available depth': 'Profundidad disponible',
  'Available height': 'Altura disponible',
  'Copy result': 'Copiar resultado',
  Copy: 'Copiar',
  Copied: 'Copiado',
  'Could not copy result.': 'No se pudo copiar el resultado.',
  'Result copied to clipboard.': 'Resultado copiado al portapapeles.',
  'Copy failed. Select and copy the result manually.':
    'No se pudo copiar. Seleccione y copie el resultado manualmente.',
  Metric: 'Métrico',
  Imperial: 'Imperial',
  Both: 'Ambas',
  'Result display units': 'Unidades para mostrar resultados',
  'Show calculation details': 'Mostrar detalles del cálculo',
  'Changes result display only; measurements already entered stay unchanged.':
    'Solo cambia la presentación de los resultados; las medidas ya introducidas no se modifican.',
  'Enter lengths with mm, cm, m, in, ft, or ft/in. A number without a unit defaults to mm.':
    'Introduce longitudes en mm, cm, m, in, ft o ft/in. Si no indicas una unidad, el número se interpreta como mm.',
  Light: 'Claro',
  Dark: 'Oscuro',
  Step: 'Paso',
  'Enter a value.': 'Introduce un valor.',
  'Enter a valid length.': 'Introduce una longitud válida.',
  'Enter a valid measurement.': 'Introduce una medida válida.',
  'Enter a number greater than zero.': 'Introduce un número mayor que cero.',
  'Enter both width and depth, or remove this candidate row.':
    'Introduzca el ancho y la profundidad, o elimine esta fila de opciones.',
  'Enter a width greater than zero.': 'Introduce un ancho mayor que cero.',
  'Enter a depth greater than zero.': 'Introduce una profundidad mayor que cero.',
  'Candidate body sizes': 'Dimensiones exteriores de las opciones',
  '+ Add another size': '+ Añadir otra dimensión',
  'Each row is one candidate. Enter its outside width and depth using any accepted units.':
    'Cada fila representa una opción. Introduzca su ancho y profundidad exteriores con cualquiera de las unidades admitidas.',
  Remove: 'Eliminar',
  'Try both 90-degree orientations': 'Probar ambas orientaciones a 90 grados',
  'Keep rug width along room width':
    'Alinear el ancho de la alfombra con el ancho de la habitación',
  'Rotate rug 90 degrees': 'Girar la alfombra 90 grados',
  'Advanced options · Optional': 'Opciones avanzadas · Opcional',
  'Rug orientation': 'Orientación de la alfombra',
  'Room-axis alignment': 'Alineación con los ejes de la habitación',
  'Room-edge target': 'Objetivo respecto al borde de la habitación',
  'Choose what the rug should cover': 'Elige qué debe cubrir la alfombra',
  'Coverage mode': 'Modo de cobertura',
  'Keep the full footprint on the rug': 'Mantener toda la huella sobre la alfombra',
  'Check a user-selected front-edge overlap': 'Comprobar el solapamiento frontal elegido',
  'Furniture-edge target': 'Objetivo respecto al borde del mueble',
  'Choose the front-edge relationship': 'Elige la relación con el borde delantero',
  'Measure the room and rug': 'Mide la habitación y la alfombra',
  'What are you fitting?': '¿Qué desea comprobar?',
  'Where does it need to fit?': '¿Dónde debe caber?',
  'Inside room width': 'Ancho interior de la habitación',
  'Inside room depth': 'Profundidad interior de la habitación',
  'Inside room length': 'Largo interior de la habitación',
  'Rug outside width': 'Ancho exterior de la alfombra',
  'Rug outside depth': 'Profundidad exterior de la alfombra',
  'Table width': 'Ancho de la mesa',
  'Table length': 'Largo de la mesa',
  'Bed width': 'Ancho de la cama',
  'Bed length': 'Largo de la cama',
  'Measure the usable inside room dimensions.':
    'Mida las dimensiones interiores utilizables de la habitación.',
  "Rectangular tables only in this first version. Use the table's outer edge-to-edge dimensions.":
    'En esta primera versión solo se admiten mesas rectangulares. Use las dimensiones exteriores de borde a borde.',
  'The border is your chosen layout target, not a universal rug-sizing rule.':
    'El borde es un objetivo de distribución que usted elige, no una regla universal para dimensionar alfombras.',
  'Furniture coverage is disabled; only rug-to-room dimensions are checked.':
    'La comprobación de cobertura de muebles está desactivada; solo se comparan las dimensiones de la alfombra y la habitación.',
  'Screening estimate only; verify measurements and the access route on site.':
    'Es solo una estimación preliminar; verifique las medidas y la ruta de acceso in situ.',
  'The centered room view is a dimensional comparison, not a complete floor plan. The relationship view does not locate furniture, actual legs, angled rugs or irregular room shapes.':
    'La vista centrada compara dimensiones y no es un plano completo. La vista de relación no ubica los muebles ni sus patas reales, ni representa alfombras inclinadas o habitaciones irregulares.',
  'Centered rectangular comparison only; it does not place furniture in a floor plan or infer styling preferences.':
    'Solo se muestra una comparación rectangular centrada; no se ubican muebles en un plano ni se deducen preferencias de estilo.',
  'Dashed outline/line: measured room or furniture edge. Dotted outline/line: your selected target. Blue fill: rug. Green fill: furniture/use footprint. In front-edge mode, the dashed line marks the furniture front.':
    'Contorno o línea discontinua: borde medido de la habitación o del mueble. Contorno o línea de puntos: objetivo seleccionado. Relleno azul: alfombra. Relleno verde: huella del mueble o zona de uso. En el modo de borde delantero, la línea discontinua indica el frente del mueble.',
};

/** Dynamic phrases use {name}-style placeholders; substitute only after lookup. */
export const calculatorCopyTemplates: Readonly<Record<string, string>> = {
  'Could not parse "{input}" as a length.': 'No se pudo interpretar "{input}" como una longitud.',
  'Length must be a non-negative number, got "{input}".':
    'La longitud debe ser un número no negativo; se recibió "{input}".',
  'Unrecognized unit in "{input}".': 'Unidad no reconocida en "{input}".',
  'Show detailed measuring help: {label}': 'Mostrar ayuda detallada para medir: {label}',
  'Proportional top-down comparison: {spaceWidth} by {spaceDepth} inside space and {itemWidth} by {itemDepth} item footprint, arranged {orientation}. The optional planning margin is {margin} on each side. Height, doorway/corridor and multi-item checks are not drawn here.':
    'Comparación proporcional desde arriba: espacio interior de {spaceWidth} por {spaceDepth} y huella del objeto de {itemWidth} por {itemDepth}, colocada {orientation}. El margen opcional de planificación es de {margin} a cada lado. No se muestran la altura, las puertas, los pasillos ni las comprobaciones de varios objetos.',
  '{itemName}: best floor orientation is {orientation}. Estimated maximum: {quantityText} in a single layer ({grid} grid).{requested}':
    '{itemName}: la mejor orientación en el suelo es {orientation}. Máximo estimado: {quantityText} en una sola capa (cuadrícula {grid}).{requested}',
  'This is fewer than the {quantity} requested.': 'Es menos que los {quantity} solicitados.',
  'Room placement selected {orientation} orientation. A {margin} planning margin is requested on each side.':
    'La distribución de la habitación usa la orientación {orientation}. Se solicita un margen de planificación de {margin} a cada lado.',
  'Room placement selected {orientation} orientation. No extra clearance margin was added.':
    'La distribución de la habitación usa la orientación {orientation}. No se añadió holgura adicional.',
  'The measured footprint meets your selected target exactly at {binding}.':
    'La huella medida cumple exactamente el objetivo seleccionado en {binding}.',
  'The measured footprint fits and meets your selected target. The tightest point is {binding}.':
    'La huella medida cabe y cumple el objetivo seleccionado. El punto más ajustado está en {binding}.',
  'The physical footprint fits, but selected targets are short at {shortTargets}. The tightest point is {binding}.':
    'La huella física cabe, pero en {shortTargets} no se alcanzan los objetivos seleccionados. El punto más ajustado está en {binding}.',
  'Available space is short on {failedDimensions}. The tightest point is {binding}.':
    'Falta espacio en {failedDimensions}. El punto más ajustado está en {binding}.',
  'The measured dimensions fit, but compatibility checks failed: {reasons}.':
    'Las dimensiones medidas caben, pero fallaron las comprobaciones de compatibilidad: {reasons}.',
  '{feet} ft reference dimension converted at exactly 304.8 mm per foot.':
    'Dimensión de referencia de {feet} ft convertida exactamente a 304,8 mm por pie.',
  'Step {step}': 'Paso {step}',
  'Current · {title}': 'Actual · {title}',
  'Fit result: {resultLabel}. View calculation details.':
    'Resultado del ajuste: {resultLabel}. Ver los detalles del cálculo.',
  'Enter a number of at least {minimum}.': 'Introduce un número igual o superior a {minimum}.',
  'Enter a number from {minimum} to {maximum}.':
    'Introduzca un número entre {minimum} y {maximum}.',
  'Width: {error}': 'Ancho: {error}',
  'Depth: {error}': 'Profundidad: {error}',
  'Candidate {name} width': 'Ancho de la opción {name}',
  'Candidate {name} depth': 'Profundidad de la opción {name}',
  'Remove candidate {name}': 'Eliminar la opción {name}',
  'e.g. {measurement}': 'p. ej., {measurement}',
  'Fitwise review: {itemName}': 'Evaluación de Fitwise: {itemName}',
  'Result: {stateLabel}': 'Resultado: {stateLabel}',
  'What this means: {explanation}': 'Qué significa: {explanation}',
  'Next: {nextAction}': 'Siguiente paso: {nextAction}',
  'Next: {title}': 'Siguiente: {title}',
  'Step {step}: {title}. {status}': 'Paso {step}: {title}. {status}',
  'Step {step} of {total}: {title}{entered}': 'Paso {step} de {total}: {title}{entered}',
  'Missing: {label}': 'Falta: {label}',
  'Why it matters: {explanation}': 'Por qué es importante: {explanation}',
  'Action: {action}': 'Acción: {action}',
  'Floor orientation: {orientation}; estimated single-layer capacity: {quantityCapacity}':
    'Orientación en el suelo: {orientation}; capacidad estimada en una sola capa: {quantityCapacity}',
  'Physical margin {physicalMargin}; target margin {targetMargin}':
    'Margen físico {physicalMargin}; margen respecto al objetivo {targetMargin}',
  'The extra {measurement} wall border is user-selected and is not a universal interior-design standard.':
    'El borde adicional de {measurement} respecto a la pared es una elección del usuario y no es un estándar universal de diseño de interiores.',
  'Selected side-clearance target: {side} per side; selected foot-clearance target: {foot}. These are editable planning assumptions, not code minimums.':
    'Objetivo seleccionado de espacio lateral: {side} a cada lado; objetivo de espacio al pie: {foot}. Son supuestos de planificación editables, no mínimos establecidos por normativa.',
  'User-entered mattress dimensions: {width} × {length}.':
    'Dimensiones del colchón introducidas por el usuario: {width} × {length}.',
  'The layout is {width} by {depth}.': 'La distribución mide {width} por {depth}.',
};

/**
 * Literal sources covered: src/components/fit/*.astro, src/components/fitcheck/*.astro,
 * src/components/diagram/*.astro (SVG accessibility text), src/lib/fit/*.ts, and
 * src/scripts/*.ts. Dynamic assumptions/results come from those calculators and
 * are represented by template keys when their English sentence is stable.
 */
