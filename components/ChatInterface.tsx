import React, { useState } from 'react';
import { generateGuideFromPrompt } from '../services/geminiService';

interface ChatInterfaceProps {
    onSuccess: (html: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const PRODUCTS = [
    { id: 'saas', name: 'Software de Administración', color: 'bg-[#005fc5]' },
    { id: 'app', name: 'App / Portal Residentes', color: 'bg-[#4cbf8c]' },
    { id: 'payments', name: 'Pago en Línea', color: 'bg-[#ffc000]' },
    { id: 'banks', name: 'Conexión con Bancos', color: 'bg-[#4cbf8c]' },
    { id: 'insurance', name: 'Seguros', color: 'bg-[#ff6b75]' },
    { id: 'cda', name: 'Control de Acceso', color: 'bg-[#005fc5]' },
    { id: 'facial', name: 'Reconocimiento Facial', color: 'bg-[#4e526e]' },
    { id: 'citofonia', name: 'Citofonía Digital', color: 'bg-[#4cbf8c]' },
    { id: 'swappi', name: 'Swappi', color: 'bg-[#005fc5]' },
];

const FLYER_TYPES = [
    { id: 'comercial', name: 'Comercial (Cotizar)', description: 'Focado en venta y conversión' },
    { id: 'informativo', name: 'Informativo (Inbound/Flyer)', description: 'Focado en educar y aportar valor' },
];

const PRODUCT_DETAILS: Record<string, string> = {
    saas: `## 1) Software de Administración ComunidadFeliz (SaaS)
ComunidadFeliz es el software principal para administrar edificios y condominios: centraliza operación, finanzas y comunicación para que la administración sea más ordenada, transparente y fácil de seguir para comité y residentes. La idea es que “todo pase por un solo lugar” y no quede repartido entre planillas, WhatsApps y carpetas. (Enlace: https://www.comunidadfeliz.cl/contratar)

A nivel de finanzas y cobranza, el foco está en simplificar el día a día del administrador: emisión/gestión de gastos comunes, recaudación, control de pagos, seguimiento de deudas y reportes de situación financiera. Esto ayuda a sostener rendiciones más claras y a responder “¿en qué se gastó?” con evidencia y trazabilidad.

En integraciones y automatización, ComunidadFeliz destaca la Conexión con Bancos para traer cartolas/movimientos y apoyar la conciliación (evitando digitación manual y acelerando cierres). Es un módulo clave cuando administras varias comunidades o tienes muchos pagos por revisar.

En el frente comunidad y comunicación, el ecosistema incluye una app/portal donde los residentes pueden ver información oficial y hacer trámites típicos (por ejemplo, enterarse de novedades, pagar, reservar espacios comunes y participar en votaciones/encuestas si la comunidad lo habilita). Esto reduce fricción, baja el “ida y vuelta” y ordena la comunicación formal.

Por último, el SaaS se conecta con otras líneas del ecosistema (como Control de Acceso, citofonía digital, pagos y seguros) para que no tengas “islas” de información. En la práctica, el software actúa como el centro operativo desde donde el administrador gestiona y muestra resultados.`,

    app: `## 2) App / Portal para Residentes (ComunidadFeliz)
La App/Portal de residentes es la “cara visible” de la administración: un punto único para que la comunidad reciba información oficial y realice trámites sin depender de llamadas, mensajes sueltos o papeles. La propuesta es dar autonomía a residentes y más control a la administración. (Enlace: https://ayuda.comunidadfeliz.com/)

En comunicación, el módulo de noticias/muro permite publicar avisos oficiales y novedades del condominio, reduciendo confusiones y “versiones” distintas del mismo mensaje. Además, ayuda a que la información quede registrada y sea fácil de consultar después.

En gestión de espacios comunes, la app permite reservar (por ejemplo, gimnasio u otras áreas), lo que disminuye conflictos por uso, ordena horarios y hace más simple el control. Es una funcionalidad típica que, cuando se activa, impacta rápido en la convivencia.

En participación, se incluyen encuestas y votaciones online (cuando la comunidad las hace habilitadas). Esto acelera la toma de decisiones en temas cotidianos y ayuda a documentar acuerdos o preferencias sin perseguir firmas o respuestas por múltiples canales.

En pagos, la app se integra al pago del gasto común (especialmente cuando se activa Pago en Línea), de modo que el residente pueda pagar desde su celular y el administrador tenga visibilidad del estado de cobro. Esa combinación es la que suele mover la aguja en adopción y morosidad.`,

    payments: `## 3) Pago en Línea (Payments)
Pago en Línea es la unidad enfocada en facilitar el pago del gasto común y, al mismo tiempo, hacer más simple el seguimiento contable para la administración. En vez de transferencias dispersas o comprobantes por WhatsApp, se busca ordenar el proceso punta a punta. (Enlace: https://www.comunidadfeliz.cl/contratar)

El beneficio más directo para administradores suele ser la reducción de morosidad, porque se baja la fricción del pago (más facilidad = más pagos a tiempo). Además, el sistema destaca mejoras en control y registro de pagos, lo que se traduce en menos trabajo manual.

Una funcionalidad clave es la conciliación automática: los pagos quedan registrados y conciliados “sin intervención manual” (según la propuesta del producto), lo que ayuda a cerrar el mes con más rapidez y menos errores. Esto es especialmente potente cuando administras más de una comunidad.

Pago en Línea también se plantea como una capa de seguridad: al centralizar el flujo de pagos, disminuye la probabilidad de estafas y fraudes asociados a cuentas o datos “pasados por fuera”. Para comité y residentes, esto suele ser un argumento muy convincente.

Finalmente, se complementa con recursos de adopción (como kits y materiales listos para usar) para empujar uso real dentro de la comunidad: afiches, manuales y piezas de comunicación para acelerar el cambio de hábito.`,

    banks: `## 4) Conexión con Bancos (Integración)
La Conexión con Bancos es la integración que busca traer movimientos bancarios/cartola a la plataforma para apoyar el proceso de conciliación. En simple: menos copiar/pegar, menos digitación, menos “cuadrar a mano”. (Enlace: https://www.comunidadfeliz.cl/contratar)

Su valor está en el ahorro de tiempo y en la reducción de errores al momento de asignar pagos y revisar ingresos. Esto suele notarse fuerte en comunidades grandes o con alto volumen de transacciones mensuales.

Como funcionalidad, se integra con el módulo de conciliación/recaudación para que los movimientos bancarios se reflejen en el flujo de gestión de pagos. Eso permite que el administrador tenga un panorama más actualizado para rendición y control.

A nivel operativo, esta integración también ayuda a responder rápido dudas típicas del comité (“¿entró este pago?”, “¿cuándo se registró?”) con menos “búsquedas detectivescas” entre bancos, planillas y correos. No es solo velocidad: es trazabilidad.

En el ecosistema, Conexión con Bancos funciona como un acelerador de madurez: cuando está activa y bien usada, es más fácil estandarizar procesos entre distintas comunidades y escalar la administración sin aumentar proporcionalmente la carga administrativa.`,

    insurance: `## 5) Seguros ComunidadFeliz (Corredora)
Seguros ComunidadFeliz es la unidad que gestiona seguros para comunidades, comité/administración y también necesidades asociadas a residentes, con una propuesta de contratación y mantención “simple y rápida”. Funciona como corredora y busca que la comunidad tenga “el seguro indicado”. (Enlace: https://www.comunidadfeliz.cl/seguros-cotizar)

En términos de producto, la promesa es gestionar pólizas en un solo lugar, con acceso a documentos, seguimiento y orden. Esto es clave porque el dolor típico no es solo contratar: es mantener vigentes, encontrar papeles y saber “qué cubre y qué no” cuando pasa algo.

Dentro de sus funcionalidades/servicios, en la web se destacan: pólizas siempre disponibles, seguimiento de siniestros, pago y recepción de facturas, y mantener seguros al día (renovaciones/gestión). En la práctica, es un “backoffice” de seguros pensado para administración.

En documentos internos se listan ejemplos de foco de la corredora para comunidades: incendio y otros riesgos en condominio, responsabilidad civil para administradores y comité, incendio hogar, y seguro de vida OS10 para guardias/vigilantes (según corresponda).

Además, la línea de contenidos y soporte busca educar y acompañar: se menciona apoyo para encontrar el mejor seguro, revisar que pólizas “estén a punto” y facilitar el proceso de contratación/renovación sin complicaciones. Esto baja estrés y mejora la continuidad de cobertura. (Más info en el Blog: https://www.comunidadfeliz.cl/blog)`,

    cda: `## 6) Control de Acceso (CDA)
Control de Acceso de ComunidadFeliz apunta a simplificar el acceso peatonal y vehicular con “llaves digitales”, aumentando control y seguridad desde una plataforma central. La propuesta es que residentes y visitas ingresen de forma segura, y que administración/conserjería tengan visibilidad. (Enlace: https://www.comunidadfeliz.cl/control-de-acceso)

A nivel de uso, el producto se apoya en guías y capacitación (microcontenidos) para que el equipo aprenda “en minutos” cómo gestionar accesos y visitas. Esto es importante porque, en control de acceso, la adopción (conserjería + residentes) define el éxito.

Como parte del ecosistema, Control de Acceso se conecta con el software de administración y puede integrarse con otros frentes (por ejemplo, citofonía digital de acceso). Esto evita que tengas un sistema “aparte” que nadie puede auditar desde la administración.

En funcionalidades, además del control centralizado, el foco suele estar en: autorización y registro de entradas/salidas, gestión de accesos por tipo de usuario (residentes/visitas), y soporte al trabajo de conserjería para disminuir aperturas manuales y mejorar trazabilidad.`,

    facial: `## 7) Reconocimiento Facial (subproducto de Control de Acceso)
El Reconocimiento Facial es una solución de biometría facial para autenticar identidad comparando rasgos geométricos del rostro con una imagen registrada, habilitando acceso sin llaves, tarjetas ni celular. Se posiciona como respuesta a críticas de seguridad/usabilidad del QR y a los costos/rechazo asociados a tarjetas. (Enlace: https://www.comunidadfeliz.cl/control-de-acceso)

En valor de negocio, el argumento central es seguridad mejorada (rasgos únicos) + conveniencia (manos libres) + reducción de costos (menos reposición de credenciales físicas). Esto suele traducirse en mejor adopción y menos fricción en horarios punta.

En alcance funcional, se describe: (1) autenticación facial en tiempo real, (2) registro y gestión de usuarios (captura/almacenamiento y eliminación de datos biométricos), y (3) seguridad y privacidad para proteger información y cumplir normativas de datos personales.

En el uso práctico, el manual indica el flujo: el residente entra a la app, registra su rostro siguiendo instrucciones (buena iluminación, rostro visible), confirma activación y luego accede presentando su rostro al dispositivo instalado. Esto hace que el onboarding sea muy guiado y replicable.

Por seguridad, se mencionan mecanismos anti-spoofing (evitar suplantación con fotos/videos/máscaras) y consideraciones de privacidad (datos encriptados y uso acotado al acceso). Es clave comunicar esto bien para construir confianza en la comunidad.`,

    citofonia: `## 8) Citofonía Digital (Acceso y Residentes)
La Citofonía Digital nace para resolver un dolor común: citófonos tradicionales costosos, poco confiables y con mala experiencia. La propuesta es conectar conserjes, residentes y visitas con un sistema digital más simple y trazable. (Enlaces: Residentes: https://www.comunidadfeliz.cl/citofonia-residentes | Acceso: https://www.comunidadfeliz.cl/citofonia-de-acceso)

Citofonía digital de acceso: cuando llega una visita, pulsa el botón del citófono digital, el sistema identifica la llamada y la dirige al conserje de turno. Esto estandariza el flujo de ingreso y reduce improvisaciones (llamadas personales, “no escuché”, etc.).

En requisitos, se indica que para habilitar citofonía de acceso se necesita contar con Control de Acceso, un computador con internet y el software de ComunidadFeliz. En otras palabras, es un subproducto que vive dentro del ecosistema y se potencia con CDA.

Citofonía digital para residentes: se presenta como una solución para transformar la comunidad y facilitar comunicación cotidiana, apoyándose en internet/telefonía. Es ideal cuando quieres modernizar sin depender del hardware clásico del citófono.`,

    swappi: `## 9) Swappi (Gestión Operativa)
Swappi es el software enfocado 100% en gestión operativa: busca dar visibilidad y control del trabajo en terreno, para que el administrador pueda mostrar “qué se hizo, cuándo y con evidencia”, sin depender de reportes manuales. (Enlace: https://www.swappi.cl/)

Sus módulos principales son: Tareas, Visitas en Terreno, Mantenciones y Reportes. La idea es que desde el celular puedas crear, asignar, registrar checklist/fotos/firmas, centralizar contratos/certificaciones, y luego generar reportes personalizados con un clic.

En Visitas en Terreno, Swappi destaca la digitalización del recorrido: registrar información en el momento (sin esperar volver a la oficina) y generar un informe/reporte con evidencia. Para administradores multi-comunidad, esto es un antes/después.

En Mantenciones, la plataforma centraliza cronogramas, contratos, certificaciones y vencimientos, con alertas/notificaciones automáticas. Esto es clave para pasar de “apagar incendios” a una gestión preventiva y auditable frente a comité.

Además, Swappi incorpora capas de planificación como Plan de Acción, Documentación, y visualización tipo paneles/Carta Gantt, para ver qué viene, distribuir carga laboral y mantener trazabilidad. Es “operación visible” con orden, no solo una lista de pendientes.`,
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSuccess, isLoading, setIsLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [flyerType, setFlyerType] = useState<string>('informativo');

    const toggleProduct = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);

        // BUILD DENSE CONTEXT: Only include the full detailed text of selected products
        const detailedSelection = selectedProducts
            .map(id => PRODUCT_DETAILS[id])
            .filter(Boolean)
            .join('\n\n---\n\n');

        const selectionContext = `
            TIPO DE FOLLETO REQUERIDO: ${flyerType === 'comercial' ? 'COMERCIAL / VENTAS (Focado en cotización y cierre)' : 'INFORMATIVO / EDUCATIVO (Inbound marketing, flyer o ebook)'}
            
            DETALLES DE PRODUCTOS PARA INCLUIR (¡NO RESUMIR ESTA INFORMACIÓN!):
            ${detailedSelection || "El usuario no ha seleccionado productos específicos, utiliza información general de ComunidadFeliz si es necesario."}
            
            LINKS GENERALES PARA PIE DE PÁGINA:
            - Blog: https://www.comunidadfeliz.cl/blog
            - Ayuda: https://ayuda.comunidadfeliz.com/
            - Cotizar: https://www.comunidadfeliz.cl/contratar
        `;

        try {
            const generatedHtml = await generateGuideFromPrompt(prompt, selectionContext);
            onSuccess(generatedHtml);
        } catch (error) {
            console.error(error);
            alert("Error generating content. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cbf8c]/5 rounded-bl-full -z-0"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-[#4e526e] mb-2">Asistente <span className="text-[#005fc5]">ComunidadFeliz</span></h2>
                    <p className="text-[#4e526e] opacity-70 mb-8">Personaliza tu folleto seleccionando productos y tipo de contenido. Selecciona para inyectar información detallada.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Flyer Type Selection */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="font-bold text-[#4e526e] text-sm uppercase tracking-wider">Objetivo del Folleto</h3>
                            <div className="space-y-2">
                                {FLYER_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFlyerType(type.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${flyerType === type.id
                                            ? 'border-[#005fc5] bg-blue-50/50'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`font-bold ${flyerType === type.id ? 'text-[#005fc5]' : 'text-[#4e526e]'}`}>{type.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-bold text-[#4e526e] text-sm uppercase tracking-wider">Productos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PRODUCTS.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => toggleProduct(product.id)}
                                        className={`p-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-2 ${selectedProducts.includes(product.id)
                                            ? `${product.color} text-white border-transparent shadow-md transform scale-[1.02]`
                                            : 'border-gray-100 text-[#4e526e] hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedProducts.includes(product.id) ? 'bg-white' : product.color}`}></div>
                                        {product.name}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 italic">Solo se enviará a la IA la información de los productos marcados.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Escribe tu prompt... (Ej: Crea una guía para conserjes sobre el uso de Citofonía y Control de Acceso)"
                                className="w-full h-32 p-6 rounded-2xl border-2 border-gray-100 focus:border-[#005fc5] focus:ring-0 transition-all resize-none text-[#4e526e] bg-gray-50/50"
                                disabled={isLoading}
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005fc5] mb-4"></div>
                                        <p className="text-[#005fc5] font-bold text-sm">Generando flyer de alta densidad...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full py-5 rounded-2xl bg-[#005fc5] text-white font-bold text-xl shadow-lg hover:bg-[#004bb5] transform hover:-translate-y-1 transition-all disabled:opacity-50"
                        >
                            Generar Guía Visual Detallada ✨
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
