import type { Locale } from "./i18n";

/**
 * Approved legal texts — "Legal English 5 Legal Terms and Privacy Package",
 * MPC LAW STUDIO, effective 11 September 2026 (Textos Web IMP-17 / IMP-18).
 *
 * GENERATED from Terminos_Privacidad_Cookies_2026-09-11.docx — do not edit the
 * texts by hand; regenerate from the next approved package. Per the package's
 * interpretation rule the Spanish version prevails; English is a courtesy
 * translation.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; rows: string[][] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  /** "Versión vigente desde…" / "Effective…" line as published. */
  effective: string;
  intro: LegalBlock[];
  sections: LegalSection[];
};

export type LegalDocKey = "terms" | "privacy" | "cookies";

/** ISO date of the current version; shown on every legal page and kept in the version history. */
export const LEGAL_EFFECTIVE_DATE = "2026-09-11";

/** Version history required by the package ("La fecha de vigencia y el historial de versiones deben conservarse"). */
export const LEGAL_VERSION_HISTORY: { version: string; effective: string; note: Record<Locale, string> }[] = [
  {
    version: "1.0",
    effective: "2026-09-11",
    note: {
      es: "Primera versión aprobada de los Términos del Servicio, la Política de Tratamiento de Datos Personales y Privacidad y la Política de Cookies.",
      en: "First approved version of the Terms of Service, the Personal Data Processing and Privacy Policy and the Cookie Policy.",
    },
  },
];

export const SIC_PORTAL_URL = "https://www.sic.gov.co/";

/** Short privacy notice (package annex §4), shown next to the registration consents. */
export const PRIVACY_SHORT_NOTICE: Record<Locale, string> = {
  es: "Responsable: María del Pilar Cruz, quien opera bajo el nombre comercial MPC LAW STUDIO, NIT 52.148.660-7. Trata los datos para crear y administrar la cuenta, prestar Legal English 5, guardar el progreso, gestionar seguridad, soporte, prueba, suscripción y pagos, y cumplir obligaciones legales. El titular puede conocer, actualizar, rectificar y suprimir sus datos, solicitar prueba de la autorización, conocer su uso y revocar la autorización cuando proceda. Política completa y solicitudes: support@legalenglish5.com. Dirección: Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia. Teléfono: +57 301 237 7281.",
  en: "Controller: María del Pilar Cruz, conducting business under the trade name MPC LAW STUDIO, Tax ID 52.148.660-7. Data is processed to create and administer the account, provide Legal English 5, save progress, manage security, support, trial, subscription and payments, and meet legal obligations. Data subjects may access, update, correct and delete their data, request proof of authorization, learn how their data is used and withdraw authorization where applicable. Full policy and requests: support@legalenglish5.com. Address: Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia. Telephone: +57 301 237 7281.",
};

export const LEGAL_DOCS: Record<LegalDocKey, Record<Locale, LegalDoc>> = {
  "terms": {
    "es": {
      "title": "Términos del Servicio",
      "effective": "Versión vigente desde el 11 de septiembre de 2026",
      "intro": [
        {
          "type": "p",
          "text": "Estos Términos regulan el acceso y uso de Legal English 5, incluidas la creación de cuenta, la prueba gratuita, las suscripciones y el contenido educativo. Al marcar la casilla de aceptación durante el registro o la activación, el usuario celebra un contrato electrónico con la Prestadora. Antes de aceptar, el usuario debe leer, guardar o imprimir estos Términos."
        }
      ],
      "sections": [
        {
          "title": "Identificación de la Prestadora",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Prestador",
                  "María del Pilar Cruz, persona natural que opera bajo el nombre comercial MPC LAW STUDIO"
                ],
                [
                  "NIT",
                  "52.148.660-7"
                ],
                [
                  "Sitio web",
                  "https://www.legalenglish5.com"
                ],
                [
                  "Notificaciones judiciales",
                  "Calle 78 No. 9-58, Bogotá D.C., Colombia"
                ],
                [
                  "Teléfono",
                  "+57 301 237 7281"
                ],
                [
                  "Correo electrónico",
                  "support@legalenglish5.com"
                ]
              ]
            },
            {
              "type": "p",
              "text": "La Prestadora ofrece Legal English 5 directamente. Las referencias a \"Legal English 5\", \"MPC LAW STUDIO\", \"nosotros\" o \"la Prestadora\" corresponden a María del Pilar Cruz en la calidad indicada."
            }
          ]
        },
        {
          "title": "Descripción y alcance del Servicio",
          "blocks": [
            {
              "type": "p",
              "text": "Legal English 5 es un producto digital de microaprendizaje de inglés jurídico profesional para abogados, estudiantes de derecho y otros profesionales hispanohablantes de jurisdicciones de tradición civilista. Puede incluir términos, definiciones, pronunciación, equivalentes de Civil Law, ejercicios, cuestionarios, ejemplos de uso, seguimiento de progreso y colecciones temáticas sobre contratos, derecho corporativo, derecho laboral y otras áreas que se incorporen."
            },
            {
              "type": "p",
              "text": "El Servicio es educativo. No constituye asesoría jurídica, traducción certificada, representación profesional ni una opinión aplicable a un caso concreto. El usuario debe obtener asesoría independiente para decisiones jurídicas o profesionales."
            }
          ]
        },
        {
          "title": "Requisitos de edad y cuenta",
          "blocks": [
            {
              "type": "p",
              "text": "La contratación de una prueba o suscripción está dirigida a personas mayores de 18 años con capacidad legal para contratar. Quien actúe por una organización declara que tiene autorización para obligarla. El Servicio no se dirige intencionalmente a menores de edad."
            },
            {
              "type": "p",
              "text": "El usuario debe suministrar información exacta, mantenerla actualizada y proteger sus credenciales. No puede compartir la cuenta ni permitir accesos no autorizados. Debe informar de inmediato cualquier sospecha de uso indebido a support@legalenglish5.com. La Prestadora nunca solicitará la contraseña por correo electrónico."
            }
          ]
        },
        {
          "title": "Formación del contrato y prueba gratuita",
          "blocks": [
            {
              "type": "p",
              "text": "La sola creación de una cuenta no inicia la prueba. La prueba gratuita de siete días empieza cuando el usuario selecciona expresamente la opción de activación, acepta estos Términos y autoriza un medio de pago válido en el flujo de Mercado Pago. La pantalla de confirmación y el correo transaccional indicarán la fecha y hora exactas de inicio y terminación, en hora de Bogotá, así como el plan que se cobrará si el usuario no cancela."
            },
            {
              "type": "p",
              "text": "Al activar la prueba, el usuario solicita que el acceso digital comience de inmediato. Durante la prueba tendrá acceso a las funciones que la oferta vigente identifique. La disponibilidad de una prueba puede limitarse a una por usuario o medio de pago cuando sea necesario para prevenir abuso."
            }
          ]
        },
        {
          "title": "Planes precios renovación y pago",
          "blocks": [
            {
              "type": "p",
              "text": "Los planes publicados a la fecha de vigencia son: plan mensual por COP 90.000 y plan anual por COP 540.000. La oferta mostrada inmediatamente antes de confirmar el pago prevalece respecto del precio y de la periodicidad aplicables a esa transacción. El total informado antes de pagar debe incluir impuestos, costos y cargos aplicables."
            },
            {
              "type": "p",
              "text": "Si el usuario activa la prueba y no selecciona el plan anual antes de su terminación, el Servicio se renovará automáticamente en el plan mensual y Mercado Pago cargará COP 90.000 al medio autorizado. Si selecciona el plan anual dentro de la prueba, el primer cargo será de COP 540.000 al terminarla. Después de cada cargo, la suscripción se renueva automáticamente por periodos iguales hasta que el usuario cancele."
            },
            {
              "type": "p",
              "text": "El usuario autoriza a Mercado Pago a procesar los cargos recurrentes conforme al plan elegido. Legal English 5 no almacena el número completo de la tarjeta. Si un pago falla, podremos solicitar la actualización del medio de pago, reintentar el cobro conforme a la autorización vigente o suspender el acceso después de informar al usuario."
            },
            {
              "type": "p",
              "text": "Cualquier cambio de precio se informará antes de la siguiente renovación y no afectará periodos ya pagados. El usuario podrá cancelar antes de que el nuevo precio entre en vigor."
            }
          ]
        },
        {
          "title": "Confirmación y soporte de la transacción",
          "blocks": [
            {
              "type": "p",
              "text": "Antes de contratar, el usuario podrá revisar el plan, el precio total, la periodicidad, la renovación automática, el término de la prueba y estos documentos legales. Después de la activación o del pago, Legal English 5 mostrará o enviará una confirmación duradera con el resumen de la transacción. El usuario puede descargar estos Términos desde el sitio web y solicitar copia del comprobante a support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Cancelación de la suscripción",
          "blocks": [
            {
              "type": "p",
              "text": "El usuario puede cancelar en cualquier momento desde Cuenta > Facturación o escribiendo a support@legalenglish5.com. La cancelación efectuada antes de terminar la prueba evita el primer cargo. La cancelación posterior evita futuras renovaciones y, salvo que la ley exija otra solución, el acceso continúa hasta finalizar el periodo ya pagado."
            },
            {
              "type": "p",
              "text": "Cancelar una suscripción no elimina automáticamente la cuenta ni el historial de aprendizaje. Solicitar la eliminación de la cuenta tampoco debe dejar activa una renovación: si existe una suscripción vigente, la Prestadora cancelará primero los cobros futuros y luego tramitará la eliminación, con las retenciones legales indicadas en la Política de Tratamiento de Datos Personales y Privacidad."
            }
          ]
        },
        {
          "title": "Retracto reembolsos y reversión del pago",
          "blocks": [
            {
              "type": "p",
              "text": "Cuando el derecho de retracto previsto en el Estatuto del Consumidor resulte aplicable, el usuario podrá ejercerlo dentro del término legal mediante solicitud inequívoca a support@legalenglish5.com. Al activar la prueba, el usuario solicita expresamente el inicio inmediato del servicio digital; por ello, la excepción legal para servicios cuya prestación haya comenzado con acuerdo del consumidor puede resultar aplicable. Esta disposición no restringe derechos imperativos."
            },
            {
              "type": "p",
              "text": "Fuera de los casos exigidos por la ley o de una oferta expresa, no se realizan reembolsos por tiempo no utilizado después de iniciado un periodo pagado. Cuando proceda una devolución, se efectuará por el medio permitido y dentro del plazo legal aplicable."
            },
            {
              "type": "p",
              "text": "El consumidor podrá solicitar la reversión del pago en los eventos y plazos previstos por la ley, incluidos fraude, operación no solicitada, servicio no recibido o servicio que no corresponda a lo contratado. Para ello deberá presentar la reclamación al emisor o proveedor de pago y notificar a la Prestadora, aportando la información necesaria. La reversión no limita otras reclamaciones procedentes."
            }
          ]
        },
        {
          "title": "Uso permitido y conducta prohibida",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora concede al usuario una licencia limitada, personal, revocable, no exclusiva e intransferible para acceder al Servicio durante la vigencia de su prueba o suscripción. El usuario no podrá:"
            },
            {
              "type": "list",
              "items": [
                "copiar, reproducir, distribuir, vender, sublicenciar o explotar comercialmente el contenido salvo autorización escrita;",
                "compartir credenciales, eludir controles de acceso, extraer contenido de forma masiva o utilizar robots, scrapers u otros medios automatizados no autorizados;",
                "alterar, realizar ingeniería inversa o interferir con la seguridad o el funcionamiento del Servicio, salvo donde una norma imperativa lo permita;",
                "usar el Servicio para actividades ilícitas, fraudulentas o que vulneren derechos de terceros; o",
                "presentar el contenido educativo como asesoría jurídica individualizada o como traducción certificada emitida por la Prestadora."
              ]
            }
          ]
        },
        {
          "title": "Propiedad intelectual",
          "blocks": [
            {
              "type": "p",
              "text": "El software, diseño, marcas, estructura pedagógica, bases de datos, textos, audios, cuestionarios, ejemplos y demás materiales de Legal English 5 pertenecen a la Prestadora o a sus licenciantes y están protegidos por las normas aplicables. Ninguna disposición transfiere derechos de propiedad intelectual al usuario. Las denominaciones y materiales de terceros conservan la titularidad de sus respectivos propietarios."
            },
            {
              "type": "p",
              "text": "Los comentarios o sugerencias enviados voluntariamente podrán utilizarse para mejorar el Servicio sin identificar públicamente al usuario ni divulgar datos personales, salvo autorización independiente."
            }
          ]
        },
        {
          "title": "Disponibilidad cambios y mantenimiento",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora procura mantener el Servicio disponible, pero puede realizar mantenimiento, corregir errores, actualizar contenidos o modificar funciones. Las interrupciones razonables no constituyen incumplimiento por sí solas. Si un cambio material reduce de forma sustancial un periodo pagado, la Prestadora aplicará la solución exigida por la ley y, cuando corresponda, una extensión, crédito o devolución proporcional."
            },
            {
              "type": "p",
              "text": "Los contenidos pueden evolucionar para mejorar su exactitud pedagógica o profesional. No se garantiza que una palabra, explicación o referencia permanezca idéntica en el tiempo."
            }
          ]
        },
        {
          "title": "Suspensión y terminación",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora puede suspender o terminar el acceso por incumplimiento material, fraude, riesgo de seguridad, falta de pago o exigencia legal. Cuando sea razonablemente posible, informará la causa y dará oportunidad de subsanar. En caso de riesgo grave, fraude o mandato de autoridad, podrá actuar de inmediato."
            },
            {
              "type": "p",
              "text": "La terminación no elimina obligaciones devengadas ni derechos que deban sobrevivir. Los efectos sobre pagos y reembolsos se regirán por la ley; ninguna suspensión elimina derechos imperativos del consumidor."
            }
          ]
        },
        {
          "title": "Garantías y responsabilidad",
          "blocks": [
            {
              "type": "p",
              "text": "El Servicio se presta con la diligencia razonablemente esperada para un producto educativo digital. La Prestadora no garantiza resultados académicos, laborales, profesionales o jurídicos específicos, ni que el Servicio esté libre de toda interrupción o error. Nada de lo aquí previsto excluye garantías legales ni responsabilidad que no pueda limitarse conforme a la ley colombiana."
            },
            {
              "type": "p",
              "text": "En la máxima medida permitida, la Prestadora no será responsable por daños indirectos derivados de decisiones profesionales tomadas sin asesoría independiente, del uso contrario a estos Términos o de fallas atribuibles exclusivamente al usuario o a terceros fuera de su control razonable. Esta limitación no aplica a dolo, culpa grave, vulneración de derechos fundamentales ni a los demás eventos en que la ley prohíba limitar la responsabilidad."
            }
          ]
        },
        {
          "title": "Comunicaciones electrónicas y prueba",
          "blocks": [
            {
              "type": "p",
              "text": "El usuario acepta recibir comunicaciones transaccionales necesarias por medios electrónicos, incluidas confirmaciones de cuenta, prueba, pago, renovación, seguridad y cambios materiales. La Prestadora conservará evidencia de la aceptación, versiones aplicables y transacciones conforme a la ley y a su Política de Privacidad. Las comunicaciones comerciales requieren autorización independiente cuando corresponda y siempre permitirán retirarla."
            }
          ]
        },
        {
          "title": "Modificaciones de estos Términos",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora puede actualizar estos Términos por cambios legales, técnicos o del Servicio. Publicará la nueva fecha de vigencia e informará con antelación razonable los cambios materiales. Los cambios no se aplicarán retroactivamente ni reducirán derechos adquiridos. Cuando la ley o la naturaleza del cambio lo exija, se solicitará una nueva aceptación."
            }
          ]
        },
        {
          "title": "Ley aplicable controversias y autoridad",
          "blocks": [
            {
              "type": "p",
              "text": "Estos Términos se rigen por las leyes de la República de Colombia. El usuario puede presentar una solicitud directa a support@legalenglish5.com y acudir a la Superintendencia de Industria y Comercio o a la autoridad o juez competente. Nada en estos Términos impone una renuncia a la jurisdicción, a acciones colectivas o a mecanismos obligatorios de protección al consumidor."
            },
            {
              "type": "p",
              "text": "Portal de la Superintendencia de Industria y Comercio: https://www.sic.gov.co/"
            }
          ]
        },
        {
          "title": "Contacto y notificaciones",
          "blocks": [
            {
              "type": "p",
              "text": "Las solicitudes de soporte, cancelación, retracto, reversión, datos personales o notificaciones contractuales deben dirigirse a support@legalenglish5.com. Las notificaciones judiciales se reciben en Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia."
            }
          ]
        },
        {
          "title": "Idioma y acuerdo completo",
          "blocks": [
            {
              "type": "p",
              "text": "Estos Términos se publican en español e inglés para facilitar su comprensión. En caso de divergencia, prevalece la versión en español, sin perjuicio de los derechos legales del usuario. Estos Términos, la oferta confirmada y las políticas incorporadas constituyen el acuerdo aplicable al Servicio. Si una disposición es inválida, las demás permanecen vigentes."
            }
          ]
        }
      ]
    },
    "en": {
      "title": "Terms of Service",
      "effective": "Effective September 11, 2026",
      "intro": [
        {
          "type": "p",
          "text": "These Terms govern access to and use of Legal English 5, including account creation, the free trial, subscriptions, and educational content. By checking the acceptance box during registration or activation, the user enters into an electronic agreement with the Provider. Before accepting, the user should read, save, or print these Terms."
        }
      ],
      "sections": [
        {
          "title": "Provider identification",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Provider",
                  "María del Pilar Cruz, natural person conducting business under the trade name MPC LAW STUDIO"
                ],
                [
                  "Tax ID",
                  "52.148.660-7"
                ],
                [
                  "Website",
                  "https://www.legalenglish5.com"
                ],
                [
                  "Judicial notices",
                  "Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia"
                ],
                [
                  "Telephone",
                  "+57 301 237 7281"
                ],
                [
                  "Email",
                  "support@legalenglish5.com"
                ]
              ]
            },
            {
              "type": "p",
              "text": "The Provider offers Legal English 5 directly. References to \"Legal English 5\", \"MPC LAW STUDIO\", \"we\", \"us\", or the \"Provider\" mean María del Pilar Cruz in the capacity stated above."
            }
          ]
        },
        {
          "title": "Service description and scope",
          "blocks": [
            {
              "type": "p",
              "text": "Legal English 5 is a digital Professional Legal English microlearning product for lawyers, law students, and other Spanish-speaking professionals from Civil Law jurisdictions. It may include terms, definitions, pronunciation, Civil Law equivalents, exercises, quizzes, usage examples, progress tracking, and thematic collections on contracts, corporate law, employment law, and other areas added over time."
            },
            {
              "type": "p",
              "text": "The Service is educational. It is not legal advice, certified translation, professional representation, or an opinion for a specific matter. Users must obtain independent advice for legal or professional decisions."
            }
          ]
        },
        {
          "title": "Age eligibility and accounts",
          "blocks": [
            {
              "type": "p",
              "text": "Trials and subscriptions are intended for individuals who are at least 18 years old and legally able to contract. Anyone acting for an organization represents that they have authority to bind it. The Service is not intentionally directed to minors."
            },
            {
              "type": "p",
              "text": "Users must provide accurate information, keep it current, and protect their credentials. Accounts may not be shared or used to enable unauthorized access. Suspected misuse must be reported promptly to support@legalenglish5.com. The Provider will never request a password by email."
            }
          ]
        },
        {
          "title": "Contract formation and free trial",
          "blocks": [
            {
              "type": "p",
              "text": "Creating an account alone does not start the trial. The seven-day free trial begins when the user expressly selects activation, accepts these Terms, and authorizes a valid payment method through Mercado Pago. The confirmation screen and transactional email will state the exact start and end date and time in Bogotá time, and the plan that will be charged unless the user cancels."
            },
            {
              "type": "p",
              "text": "By activating the trial, the user expressly requests that access to the digital service begin immediately. During the trial, the user receives the functions identified in the current offer. A trial may be limited to one per user or payment method when reasonably necessary to prevent abuse."
            }
          ]
        },
        {
          "title": "Plans prices renewal and payment",
          "blocks": [
            {
              "type": "p",
              "text": "As of the effective date, the published plans are COP 90,000 per month and COP 540,000 per year. The offer displayed immediately before confirmation controls the price and billing frequency for that transaction. The total displayed before payment must include applicable taxes, costs, and charges."
            },
            {
              "type": "p",
              "text": "If a user activates the trial and does not choose the annual plan before it ends, the Service automatically renews on the monthly plan and Mercado Pago charges COP 90,000 to the authorized method. If the annual plan is selected during the trial, the first charge is COP 540,000 when the trial ends. After each charge, the subscription renews automatically for equal periods until cancelled."
            },
            {
              "type": "p",
              "text": "The user authorizes Mercado Pago to process recurring charges for the selected plan. Legal English 5 does not store the full card number. If a payment fails, we may request updated payment information, retry the charge under the existing authorization, or suspend access after notifying the user."
            },
            {
              "type": "p",
              "text": "Any price change will be communicated before the next renewal and will not affect periods already paid. The user may cancel before the new price takes effect."
            }
          ]
        },
        {
          "title": "Transaction review and confirmation",
          "blocks": [
            {
              "type": "p",
              "text": "Before purchase, the user can review the plan, total price, billing cycle, automatic renewal, trial period, and these legal documents. After activation or payment, Legal English 5 will display or send a durable confirmation summarizing the transaction. Users may download these Terms from the website and request a receipt at support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Subscription cancellation",
          "blocks": [
            {
              "type": "p",
              "text": "Users may cancel at any time through Account > Billing or by emailing support@legalenglish5.com. Cancellation before the trial ends prevents the first charge. Later cancellation prevents future renewals and, unless mandatory law requires a different remedy, access continues through the end of the paid period."
            },
            {
              "type": "p",
              "text": "Cancelling a subscription does not automatically delete the account or learning history. Requesting account deletion must not leave a Mercado Pago renewal active: when a subscription exists, the Provider will first stop future renewals and then process deletion subject to the retention rules in the Personal Data Processing and Privacy Policy."
            }
          ]
        },
        {
          "title": "Withdrawal refunds and payment reversal",
          "blocks": [
            {
              "type": "p",
              "text": "Where the statutory right of withdrawal under Colombian consumer law applies, the user may exercise it within the legal period by sending an unequivocal request to support@legalenglish5.com. By activating the trial, the user expressly requests immediate performance of the digital service; the statutory exception for services that have begun with the consumer's agreement may therefore apply. This provision does not limit mandatory rights."
            },
            {
              "type": "p",
              "text": "Except when required by law or expressly offered, no refund is provided for unused time after a paid period has begun. Any required refund will be made through an available method and within the applicable statutory period."
            },
            {
              "type": "p",
              "text": "A consumer may request payment reversal in the events and within the deadlines provided by law, including fraud, an unsolicited transaction, non-delivery, or a service that does not match the purchase. The consumer must submit the claim to the issuer or payment provider and notify the Provider with the required information. Reversal does not limit other available claims."
            }
          ]
        },
        {
          "title": "Permitted use and prohibited conduct",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider grants the user a limited, personal, revocable, non-exclusive, non-transferable license to access the Service during the trial or subscription. Users may not:"
            },
            {
              "type": "list",
              "items": [
                "copy, reproduce, distribute, sell, sublicense, or commercially exploit content without written authorization;",
                "share credentials, bypass access controls, bulk-extract content, or use unauthorized robots, scrapers, or automated means;",
                "modify, reverse engineer, or interfere with security or operation, except where mandatory law permits;",
                "use the Service for unlawful or fraudulent activity or to infringe third-party rights; or",
                "present educational content as individualized legal advice or as certified translation issued by the Provider."
              ]
            }
          ]
        },
        {
          "title": "Intellectual property",
          "blocks": [
            {
              "type": "p",
              "text": "The software, design, marks, learning structure, databases, texts, audio, quizzes, examples, and other Legal English 5 materials belong to the Provider or its licensors and are protected by applicable law. No ownership right is transferred to the user. Third-party names and materials remain the property of their respective owners."
            },
            {
              "type": "p",
              "text": "Voluntary feedback may be used to improve the Service without publicly identifying the user or disclosing personal data, unless separate authorization is obtained."
            }
          ]
        },
        {
          "title": "Availability changes and maintenance",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider seeks to keep the Service available but may perform maintenance, correct errors, update content, or modify functions. Reasonable interruptions are not by themselves a breach. If a material change substantially reduces a paid period, the Provider will apply the remedy required by law and, where appropriate, an extension, credit, or proportionate refund."
            },
            {
              "type": "p",
              "text": "Content may evolve to improve educational or professional accuracy. No term, explanation, or reference is guaranteed to remain identical over time."
            }
          ]
        },
        {
          "title": "Suspension and termination",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider may suspend or terminate access for a material breach, fraud, security risk, non-payment, or legal requirement. Where reasonably possible, the Provider will explain the reason and provide an opportunity to cure. It may act immediately in cases of serious risk, fraud, or an authority order."
            },
            {
              "type": "p",
              "text": "Termination does not remove accrued obligations or rights that must survive. Payments and refunds remain governed by law, and suspension does not remove mandatory consumer rights."
            }
          ]
        },
        {
          "title": "Warranties and liability",
          "blocks": [
            {
              "type": "p",
              "text": "The Service is provided with the care reasonably expected of a digital educational product. The Provider does not guarantee specific academic, employment, professional, or legal outcomes, or uninterrupted or error-free operation. Nothing in these Terms excludes statutory warranties or liability that cannot lawfully be limited under Colombian law."
            },
            {
              "type": "p",
              "text": "To the fullest extent permitted, the Provider is not liable for indirect loss arising from professional decisions made without independent advice, use contrary to these Terms, or failures attributable solely to the user or third parties outside the Provider's reasonable control. This limitation does not apply to wilful misconduct, gross negligence, violation of fundamental rights, or any other case in which liability cannot lawfully be limited."
            }
          ]
        },
        {
          "title": "Electronic communications and records",
          "blocks": [
            {
              "type": "p",
              "text": "Users agree to receive necessary transactional communications electronically, including account, trial, payment, renewal, security, and material-change notices. The Provider will retain evidence of acceptance, applicable versions, and transactions as required by law and the Privacy Policy. Marketing communications require separate authorization where applicable and will provide an opt-out method."
            }
          ]
        },
        {
          "title": "Changes to these Terms",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider may update these Terms for legal, technical, or Service changes. It will publish the new effective date and give reasonable advance notice of material changes. Changes will not apply retroactively or reduce accrued rights. New acceptance will be requested where required by law or the nature of the change."
            }
          ]
        },
        {
          "title": "Governing law disputes and authority",
          "blocks": [
            {
              "type": "p",
              "text": "These Terms are governed by the laws of the Republic of Colombia. Users may submit a direct request to support@legalenglish5.com and may contact the Colombian Superintendence of Industry and Commerce or any competent authority or court. Nothing in these Terms requires a waiver of jurisdiction, collective actions, or mandatory consumer-protection mechanisms."
            },
            {
              "type": "p",
              "text": "Colombian Superintendence of Industry and Commerce portal: https://www.sic.gov.co/"
            }
          ]
        },
        {
          "title": "Contact and notices",
          "blocks": [
            {
              "type": "p",
              "text": "Support, cancellation, withdrawal, payment reversal, personal-data requests, and contractual notices must be sent to support@legalenglish5.com. Judicial notices are received at Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia."
            }
          ]
        },
        {
          "title": "Language and entire agreement",
          "blocks": [
            {
              "type": "p",
              "text": "These Terms are published in Spanish and English for convenience. If the versions differ, the Spanish version controls, without prejudice to the user's statutory rights. These Terms, the confirmed offer, and incorporated policies form the agreement for the Service. If a provision is invalid, the remaining provisions continue in effect."
            }
          ]
        }
      ]
    }
  },
  "privacy": {
    "es": {
      "title": "Política de Tratamiento de Datos Personales y Privacidad",
      "effective": "Versión vigente desde el 11 de septiembre de 2026",
      "intro": [
        {
          "type": "p",
          "text": "Esta Política explica cómo MPC LAW STUDIO, responsable del tratamiento, recolecta, usa, almacena, comparte y elimina datos personales relacionados con Legal English 5, así como la forma de ejercer los derechos de habeas data. Se aplica al sitio web, la cuenta, el aprendizaje, el soporte, la prueba y las suscripciones."
        }
      ],
      "sections": [
        {
          "title": "Responsable del tratamiento",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Prestador",
                  "María del Pilar Cruz, persona natural que opera bajo el nombre comercial MPC LAW STUDIO"
                ],
                [
                  "NIT",
                  "52.148.660-7"
                ],
                [
                  "Sitio web",
                  "https://www.legalenglish5.com"
                ],
                [
                  "Notificaciones judiciales",
                  "Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia"
                ],
                [
                  "Teléfono",
                  "+57 301 237 7281"
                ],
                [
                  "Correo electrónico",
                  "support@legalenglish5.com"
                ]
              ]
            },
            {
              "type": "p",
              "text": "Área responsable de peticiones, consultas y reclamos: Protección de Datos Personales y Soporte al Usuario de MPC LAW STUDIO, disponible en support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Marco y principios",
          "blocks": [
            {
              "type": "p",
              "text": "El tratamiento se realiza conforme a la Constitución Política, la Ley 1581 de 2012, el Decreto 1074 de 2015 y las demás normas colombianas aplicables. La Prestadora aplica los principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad."
            }
          ]
        },
        {
          "title": "Datos personales tratados",
          "blocks": [
            {
              "type": "list",
              "items": [
                "Identificación y contacto: nombre, correo electrónico y datos de la organización cuando el usuario los suministre.",
                "Cuenta y autenticación: identificadores de cuenta, credenciales protegidas, tokens de sesión y registros de acceso. La contraseña no se conserva en texto legible.",
                "Aprendizaje: términos consultados o guardados, progreso, respuestas, resultados de cuestionarios, rachas, preferencias e historial de actividad dentro del Servicio.",
                "Suscripción y pago: plan, estado de la prueba, fechas de facturación, valor, moneda, identificadores de transacción, estado del pago y referencia del medio de pago. La Prestadora no almacena el número completo de la tarjeta.",
                "Datos técnicos y de seguridad: dirección IP, navegador, dispositivo, idioma, fecha y hora, registros de eventos, cookies o tecnologías equivalentes estrictamente necesarias.",
                "Soporte y cumplimiento: mensajes, solicitudes, reclamaciones, evidencia de aceptación, versiones legales aceptadas y documentos aportados por el usuario.",
                "Imagen de perfil, únicamente si el Servicio habilita esta función y el usuario decide cargarla."
              ]
            },
            {
              "type": "p",
              "text": "La Prestadora no solicita datos sensibles para la prestación ordinaria del Servicio. El usuario no debe enviarlos por canales de soporte salvo que sean estrictamente necesarios. Si su tratamiento llega a ser necesario, se informará su carácter facultativo y se solicitará autorización explícita, salvo excepción legal."
            }
          ]
        },
        {
          "title": "Finalidades del tratamiento",
          "blocks": [
            {
              "type": "list",
              "items": [
                "crear, autenticar y administrar la cuenta;",
                "prestar el contenido educativo, guardar preferencias y mostrar el progreso;",
                "activar la prueba, administrar la suscripción, procesar pagos y prevenir fraude;",
                "responder solicitudes, brindar soporte y gestionar derechos de titulares y consumidores;",
                "mantener la seguridad, diagnosticar fallas, prevenir abuso y mejorar la estabilidad del Servicio;",
                "cumplir obligaciones contables, tributarias, contractuales, probatorias y de autoridad;",
                "enviar comunicaciones transaccionales necesarias sobre la cuenta, seguridad, facturación y cambios materiales; y",
                "enviar comunicaciones comerciales solamente cuando exista autorización separada o una habilitación legal, con mecanismo de exclusión."
              ]
            },
            {
              "type": "p",
              "text": "Los datos no se venderán ni se utilizarán para publicidad comportamental. La Prestadora no adoptará decisiones que produzcan efectos jurídicos para el usuario basadas únicamente en tratamiento automatizado."
            }
          ]
        },
        {
          "title": "Autorización y deber de información",
          "blocks": [
            {
              "type": "p",
              "text": "Salvo excepción legal, la Prestadora obtendrá autorización previa, expresa e informada mediante una casilla, acción afirmativa u otro mecanismo que pueda consultarse posteriormente. Antes de autorizar, el titular conocerá las finalidades, el carácter facultativo de las respuestas sobre datos sensibles o de menores, sus derechos y la identidad y contacto del responsable. El silencio o las casillas premarcadas no constituyen autorización."
            },
            {
              "type": "p",
              "text": "La aceptación de los Términos del Servicio y la autorización para el tratamiento de datos se presentan como decisiones diferenciadas. Las finalidades comerciales opcionales también se solicitan por separado."
            }
          ]
        },
        {
          "title": "Encargados proveedores y circulación",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora limita el acceso a quienes lo necesitan para las finalidades descritas. Puede transmitir datos a proveedores que actúan como encargados, sujetos a instrucciones, confidencialidad, seguridad y obligaciones de protección de datos. Los principales proveedores conocidos son Supabase, para autenticación, base de datos e infraestructura del producto, y Mercado Pago, para la activación del medio de pago y el procesamiento de pagos. Mercado Pago también puede actuar como responsable independiente respecto de la información que recolecta directamente en su entorno."
            },
            {
              "type": "p",
              "text": "También podrán intervenir proveedores de alojamiento, comunicaciones transaccionales, soporte, seguridad o asesoría profesional en la medida necesaria. Los datos podrán comunicarse a autoridades cuando exista obligación o solicitud válida. No se comparten datos para que terceros hagan publicidad propia sin autorización."
            }
          ]
        },
        {
          "title": "Tratamiento internacional",
          "blocks": [
            {
              "type": "p",
              "text": "Algunos proveedores pueden procesar o almacenar información fuera de Colombia. Cuando la operación sea una transmisión internacional, la Prestadora establecerá las obligaciones contractuales requeridas para que el encargado trate los datos conforme a esta Política y a la ley colombiana. Cuando constituya una transferencia, se verificará el nivel adecuado de protección o la excepción o autorización aplicable."
            }
          ]
        },
        {
          "title": "Seguridad y confidencialidad",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora adopta medidas administrativas, técnicas y organizacionales razonables y proporcionales para proteger los datos contra acceso, pérdida, alteración, uso o divulgación no autorizados. Estas medidas incluyen controles de acceso, autenticación, separación de funciones, registros y reglas de acceso a los datos del usuario. Ningún sistema es infalible; por ello, la Prestadora gestiona incidentes y realiza las notificaciones a titulares y autoridades que correspondan."
            }
          ]
        },
        {
          "title": "Conservación y vigencia de las bases de datos",
          "blocks": [
            {
              "type": "p",
              "text": "Las bases de datos de Legal English 5 permanecerán vigentes mientras opere el Servicio y durante los periodos adicionales necesarios para cumplir las finalidades autorizadas y obligaciones legales. Los datos de cuenta y aprendizaje se conservan mientras la cuenta esté activa o hasta que se solicite su supresión, salvo deber legal o contractual. Los registros de pago, facturación, consentimiento, seguridad y reclamaciones se conservan por los términos legales de prueba, prescripción, contabilidad y defensa de derechos. Las copias de respaldo se eliminan o sobrescriben conforme a sus ciclos técnicos y quedan restringidas mientras tanto."
            },
            {
              "type": "p",
              "text": "Cumplido el propósito y vencidos los términos aplicables, los datos se eliminan, anonimizan o bloquean de manera segura."
            }
          ]
        },
        {
          "title": "Derechos de los titulares",
          "blocks": [
            {
              "type": "p",
              "text": "El titular puede:"
            },
            {
              "type": "list",
              "items": [
                "conocer, actualizar y rectificar sus datos;",
                "solicitar prueba de la autorización, salvo excepción legal;",
                "ser informado sobre el uso dado a sus datos;",
                "presentar quejas ante la Superintendencia de Industria y Comercio una vez agotado el trámite directo cuando sea exigible;",
                "revocar la autorización o solicitar la supresión cuando proceda;",
                "acceder gratuitamente a sus datos tratados; y",
                "solicitar una copia portable de la información disponible cuando sea técnicamente razonable, sin afectar derechos de terceros."
              ]
            }
          ]
        },
        {
          "title": "Consultas y reclamos",
          "blocks": [
            {
              "type": "p",
              "text": "Las solicitudes se envían gratuitamente a support@legalenglish5.com con el asunto \"Datos personales\". Deben incluir nombre, identificación suficiente para verificar la identidad, descripción clara de la solicitud, dirección de respuesta y los documentos pertinentes. Un causahabiente, representante o apoderado debe acreditar su calidad. La Prestadora podrá pedir información razonable para evitar divulgaciones indebidas."
            },
            {
              "type": "p",
              "text": "Las consultas se responderán en máximo diez días hábiles desde su recepción. Si no es posible, se informará el motivo y la nueva fecha, que no excederá cinco días hábiles adicionales. Los reclamos se atenderán en máximo quince días hábiles desde el día siguiente a su recepción; cuando no sea posible, se informará el motivo y la nueva fecha, que no excederá ocho días hábiles adicionales. Si el reclamo está incompleto, se aplicará el procedimiento legal para subsanarlo."
            }
          ]
        },
        {
          "title": "Revocatoria supresión y eliminación de cuenta",
          "blocks": [
            {
              "type": "p",
              "text": "El titular puede retirar su autorización o pedir la supresión mediante los canales indicados, siempre que no exista un deber legal o contractual que exija conservar los datos. La revocatoria puede ser total o limitada a finalidades opcionales. Cuando la eliminación de la cuenta se solicite desde el producto o por correo, primero se cancelarán futuras renovaciones activas y después se eliminarán o anonimizarán los datos que no deban conservarse."
            },
            {
              "type": "p",
              "text": "La supresión de la cuenta es distinta de la cancelación de la suscripción y puede ser irreversible respecto del progreso y las preferencias. La Prestadora confirmará el resultado y las retenciones que legalmente subsistan."
            }
          ]
        },
        {
          "title": "Menores de edad",
          "blocks": [
            {
              "type": "p",
              "text": "Legal English 5 no está dirigido a menores de 18 años y no busca recolectar conscientemente sus datos. Si la Prestadora identifica una cuenta de un menor sin la autorización y condiciones legalmente requeridas, adoptará medidas para restringirla y suprimir la información, salvo obligación de conservación."
            }
          ]
        },
        {
          "title": "Cookies y tecnologías equivalentes",
          "blocks": [
            {
              "type": "p",
              "text": "El sitio utiliza tecnologías estrictamente necesarias para autenticación, seguridad y preferencia de idioma. La Política de Cookies explica las categorías, finalidades, duración y opciones del usuario. Si en el futuro se incorporan tecnologías no esenciales, se actualizará la información y se solicitará consentimiento previo cuando corresponda."
            }
          ]
        },
        {
          "title": "Cambios a esta Política",
          "blocks": [
            {
              "type": "p",
              "text": "La Prestadora publicará las modificaciones con su fecha de vigencia. Informará los cambios sustanciales antes de que produzcan efecto y solicitará una nueva autorización cuando impliquen finalidades incompatibles o cuando la ley lo exija. Las versiones anteriores y la evidencia de aceptación se conservarán cuando sea necesario."
            }
          ]
        },
        {
          "title": "Autoridad y contacto",
          "blocks": [
            {
              "type": "p",
              "text": "El titular puede contactar a la Prestadora en support@legalenglish5.com. Si considera que su solicitud no fue atendida adecuadamente, puede acudir a la Superintendencia de Industria y Comercio después de cumplir el requisito de procedibilidad cuando resulte aplicable."
            },
            {
              "type": "p",
              "text": "Portal de la Superintendencia de Industria y Comercio: https://www.sic.gov.co/"
            }
          ]
        },
        {
          "title": "Idioma",
          "blocks": [
            {
              "type": "p",
              "text": "Esta Política se publica en español e inglés. En caso de divergencia, prevalece la versión en español, sin perjuicio de los derechos legales del titular."
            }
          ]
        }
      ]
    },
    "en": {
      "title": "Personal Data Processing and Privacy Policy",
      "effective": "Effective September 11, 2026",
      "intro": [
        {
          "type": "p",
          "text": "This Policy explains how MPC LAW STUDIO, as data controller, collects, uses, stores, shares, and deletes personal data associated with Legal English 5, and how data subjects may exercise their habeas data rights. It applies to the website, account, learning activity, support, trial, and subscriptions."
        }
      ],
      "sections": [
        {
          "title": "Data controller",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Provider",
                  "María del Pilar Cruz, natural person conducting business under the trade name MPC LAW STUDIO"
                ],
                [
                  "Tax ID",
                  "52.148.660-7"
                ],
                [
                  "Website",
                  "https://www.legalenglish5.com"
                ],
                [
                  "Judicial notices",
                  "Calle 78 No. 9-58, apartamento 602, Bogotá D.C., Colombia"
                ],
                [
                  "Telephone",
                  "+57 301 237 7281"
                ],
                [
                  "Email",
                  "support@legalenglish5.com"
                ]
              ]
            },
            {
              "type": "p",
              "text": "Team responsible for petitions, inquiries, and complaints: MPC LAW STUDIO Personal Data Protection and User Support, available at support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Legal framework and principles",
          "blocks": [
            {
              "type": "p",
              "text": "Processing is carried out under the Colombian Constitution, Law 1581 of 2012, Decree 1074 of 2015, and other applicable Colombian rules. The Provider applies the principles of legality, purpose limitation, freedom, accuracy, transparency, restricted access and circulation, security, and confidentiality."
            }
          ]
        },
        {
          "title": "Personal data processed",
          "blocks": [
            {
              "type": "list",
              "items": [
                "Identity and contact data: name, email address, and organization information when provided by the user.",
                "Account and authentication data: account identifiers, protected credentials, session tokens, and access records. Passwords are not stored in readable text.",
                "Learning data: terms viewed or saved, progress, answers, quiz results, streaks, preferences, and in-Service activity history.",
                "Subscription and payment data: plan, trial status, billing dates, amount, currency, transaction identifiers, payment status, and a payment-method reference. The Provider does not store the full card number.",
                "Technical and security data: IP address, browser, device, language, date and time, event logs, and strictly necessary cookies or equivalent technologies.",
                "Support and compliance data: messages, requests, complaints, evidence of acceptance, accepted legal-document versions, and documents supplied by the user.",
                "Profile image, only if the Service enables the feature and the user chooses to upload one."
              ]
            },
            {
              "type": "p",
              "text": "The Provider does not request sensitive data for the ordinary provision of the Service. Users should not send such data through support channels unless strictly necessary. If sensitive-data processing becomes necessary, its optional nature will be explained and explicit authorization will be requested unless a statutory exception applies."
            }
          ]
        },
        {
          "title": "Processing purposes",
          "blocks": [
            {
              "type": "list",
              "items": [
                "create, authenticate, and administer the account;",
                "provide educational content, save preferences, and display progress;",
                "activate the trial, administer the subscription, process payments, and prevent fraud;",
                "respond to requests, provide support, and manage data-subject and consumer rights;",
                "maintain security, diagnose failures, prevent abuse, and improve Service stability;",
                "comply with accounting, tax, contractual, evidentiary, and authority requirements;",
                "send necessary transactional communications about the account, security, billing, and material changes; and",
                "send marketing communications only under separate authorization or a lawful permission, with an opt-out mechanism."
              ]
            },
            {
              "type": "p",
              "text": "Personal data is not sold or used for behavioural advertising. The Provider does not make decisions producing legal effects for the user solely through automated processing."
            }
          ]
        },
        {
          "title": "Authorization and notice",
          "blocks": [
            {
              "type": "p",
              "text": "Unless a statutory exception applies, the Provider obtains prior, express, and informed authorization through a checkbox, affirmative action, or another mechanism that can later be consulted. Before authorization, the data subject is informed of the purposes, the optional nature of answers involving sensitive data or minors, their rights, and the controller's identity and contact details. Silence and pre-checked boxes are not authorization."
            },
            {
              "type": "p",
              "text": "Acceptance of the Terms of Service and authorization for personal-data processing are presented as separate decisions. Optional marketing purposes are also requested separately."
            }
          ]
        },
        {
          "title": "Processors providers and disclosure",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider limits access to parties that need it for the stated purposes. Data may be transmitted to service providers acting as processors under instructions, confidentiality, security, and data-protection obligations. The principal known providers are Supabase, for authentication, database, and product infrastructure, and Mercado Pago, for payment-method activation and payment processing. Mercado Pago may also act as an independent controller for information it collects directly in its own environment."
            },
            {
              "type": "p",
              "text": "Hosting, transactional communication, support, security, or professional-advisory providers may also participate as necessary. Data may be disclosed to authorities under a valid legal duty or request. Data is not shared so third parties can conduct their own advertising without authorization."
            }
          ]
        },
        {
          "title": "International processing",
          "blocks": [
            {
              "type": "p",
              "text": "Some providers may process or store information outside Colombia. When an operation is an international transmission, the Provider will establish the contractual obligations required for the processor to handle data under this Policy and Colombian law. When it is a transfer, the Provider will verify an adequate level of protection or the applicable exception or authorization."
            }
          ]
        },
        {
          "title": "Security and confidentiality",
          "blocks": [
            {
              "type": "p",
              "text": "The Provider uses reasonable and proportionate administrative, technical, and organizational measures to protect data against unauthorized access, loss, alteration, use, or disclosure. Measures include access controls, authentication, separation of duties, logs, and rules governing access to user data. No system is infallible, so the Provider manages incidents and provides notices to data subjects and authorities where required."
            }
          ]
        },
        {
          "title": "Retention and database term",
          "blocks": [
            {
              "type": "p",
              "text": "Legal English 5 databases will remain in force while the Service operates and for additional periods necessary to fulfil authorized purposes and legal obligations. Account and learning data is kept while the account is active or until deletion is requested, unless a legal or contractual duty applies. Payment, billing, consent, security, and complaint records are retained for applicable evidence, limitation, accounting, and rights-defence periods. Backups are deleted or overwritten according to technical cycles and remain restricted in the meantime."
            },
            {
              "type": "p",
              "text": "After the purpose is fulfilled and applicable periods expire, data is securely deleted, anonymized, or blocked."
            }
          ]
        },
        {
          "title": "Data-subject rights",
          "blocks": [
            {
              "type": "p",
              "text": "Data subjects may:"
            },
            {
              "type": "list",
              "items": [
                "access, update, and correct their personal data;",
                "request proof of authorization, unless a statutory exception applies;",
                "obtain information about how their data has been used;",
                "file a complaint with the Colombian Superintendence of Industry and Commerce after completing the direct procedure where required;",
                "withdraw authorization or request deletion where appropriate;",
                "access processed personal data free of charge; and",
                "request a portable copy of available information where technically reasonable and without affecting third-party rights."
              ]
            }
          ]
        },
        {
          "title": "Inquiries and complaints",
          "blocks": [
            {
              "type": "p",
              "text": "Requests may be submitted free of charge to support@legalenglish5.com with the subject line \"Personal data\". They must include the requester's name, sufficient information to verify identity, a clear description of the request, a response address, and relevant documents. Heirs, representatives, and agents must prove their capacity. The Provider may request reasonable information to prevent improper disclosure."
            },
            {
              "type": "p",
              "text": "Inquiries will be answered within ten business days after receipt. If this is not possible, the Provider will explain why and state a new date, no more than five additional business days later. Complaints will be processed within fifteen business days from the day after receipt; if this is not possible, the Provider will explain why and state a new date, no more than eight additional business days later. Incomplete complaints are handled under the statutory cure procedure."
            }
          ]
        },
        {
          "title": "Withdrawal deletion and account removal",
          "blocks": [
            {
              "type": "p",
              "text": "A data subject may withdraw authorization or request deletion through the stated channels unless a legal or contractual duty requires retention. Withdrawal may be total or limited to optional purposes. When account deletion is requested through the product or by email, active future renewals will be stopped first, followed by deletion or anonymization of data that need not be retained."
            },
            {
              "type": "p",
              "text": "Account deletion differs from subscription cancellation and may be irreversible for progress and preferences. The Provider will confirm the result and any legally required retention."
            }
          ]
        },
        {
          "title": "Minors",
          "blocks": [
            {
              "type": "p",
              "text": "Legal English 5 is not directed to persons under 18 and does not knowingly seek to collect their data. If the Provider identifies a minor's account without the legally required authorization and conditions, it will restrict the account and delete the information unless retention is required."
            }
          ]
        },
        {
          "title": "Cookies and equivalent technologies",
          "blocks": [
            {
              "type": "p",
              "text": "The website uses technologies that are strictly necessary for authentication, security, and language preference. The Cookie Policy explains their categories, purposes, duration, and user choices. If non-essential technologies are added later, the information will be updated and prior consent obtained where required."
            }
          ]
        },
        {
          "title": "Policy changes",
          "blocks": [
            {
              "type": "p",
              "text": "Changes will be published with their effective date. Material changes will be communicated before taking effect, and new authorization will be requested for incompatible purposes or where required by law. Previous versions and acceptance evidence will be retained where necessary."
            }
          ]
        },
        {
          "title": "Authority and contact",
          "blocks": [
            {
              "type": "p",
              "text": "Data subjects may contact the Provider at support@legalenglish5.com. Anyone who believes a request was not properly handled may contact the Colombian Superintendence of Industry and Commerce after completing the direct procedure where applicable."
            },
            {
              "type": "p",
              "text": "Colombian Superintendence of Industry and Commerce portal: https://www.sic.gov.co/"
            }
          ]
        },
        {
          "title": "Language",
          "blocks": [
            {
              "type": "p",
              "text": "This Policy is published in Spanish and English. If the versions differ, the Spanish version controls, without prejudice to the data subject's statutory rights."
            }
          ]
        }
      ]
    }
  },
  "cookies": {
    "es": {
      "title": "Política de Cookies",
      "effective": "Versión vigente desde el 11 de septiembre de 2026",
      "intro": [
        {
          "type": "p",
          "text": "Esta Política explica las cookies y tecnologías equivalentes utilizadas por Legal English 5. A la fecha de vigencia, el sitio no despliega intencionalmente cookies publicitarias, rastreadores sociales ni cookies de analítica no esencial. Las tecnologías descritas son necesarias para iniciar sesión, proteger la cuenta, recordar el idioma y completar pagos."
        }
      ],
      "sections": [
        {
          "title": "Responsable y contacto",
          "blocks": [
            {
              "type": "p",
              "text": "MPC LAW STUDIO, operado por María del Pilar Cruz, NIT 52.148.660-7, es responsable de las tecnologías propias del sitio. Las preguntas o solicitudes pueden enviarse a support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Qué son las cookies y tecnologías equivalentes",
          "blocks": [
            {
              "type": "p",
              "text": "Las cookies son pequeños archivos que un sitio guarda en el navegador. Tecnologías equivalentes, como el almacenamiento local o los identificadores de sesión, pueden cumplir funciones similares. Cuando la información permite identificar o hacer identificable a una persona, su tratamiento se rige también por la Política de Tratamiento de Datos Personales y Privacidad."
            }
          ]
        },
        {
          "title": "Tecnologías utilizadas",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Tecnología",
                  "Categoría",
                  "Finalidad",
                  "Duración"
                ],
                [
                  "Autenticación y sesión",
                  "Estrictamente necesaria",
                  "Mantiene el inicio de sesión seguro y la sesión autenticada del usuario mediante Supabase o un mecanismo equivalente de almacenamiento local.",
                  "Duración de la sesión o el periodo técnicamente necesario para la autenticación; termina o se renueva según el cierre de sesión y la configuración de seguridad."
                ],
                [
                  "le5_locale",
                  "Preferencia",
                  "Recuerda el idioma seleccionado por el usuario, inglés o español.",
                  "Hasta 12 meses, salvo que el usuario la elimine antes."
                ],
                [
                  "Tecnologías del proveedor de pagos",
                  "De tercero y necesaria para el pago",
                  "Mercado Pago puede usar sus propias cookies o tecnologías equivalentes cuando el usuario ingresa a su entorno para activar una prueba o realizar un pago.",
                  "La definida por Mercado Pago en sus propias políticas."
                ]
              ]
            },
            {
              "type": "p",
              "text": "Los nombres y duraciones técnicas pueden variar por actualizaciones de seguridad del proveedor, sin cambiar la finalidad informada. Las tecnologías de Mercado Pago se activan dentro de sus dominios o interfaces y se rigen además por sus políticas."
            }
          ]
        },
        {
          "title": "Consentimiento y controles",
          "blocks": [
            {
              "type": "p",
              "text": "Las tecnologías estrictamente necesarias se activan para prestar la función solicitada y no se usan para publicidad comportamental. El usuario puede eliminar o bloquear cookies desde el navegador, cerrar sesión o borrar el almacenamiento del sitio. Bloquear tecnologías esenciales puede impedir el inicio de sesión, el guardado del idioma o el pago."
            },
            {
              "type": "p",
              "text": "Si Legal English 5 incorpora cookies de analítica, publicidad, personalización no esencial o redes sociales, no las activará antes de ofrecer información clara y un mecanismo para aceptar, rechazar o administrar preferencias cuando la autorización sea exigible. Rechazar tecnologías no esenciales no afectará el acceso básico al Servicio."
            }
          ]
        },
        {
          "title": "Cómo administrar cookies",
          "blocks": [
            {
              "type": "p",
              "text": "El usuario puede consultar la configuración de privacidad y cookies de su navegador para bloquear, eliminar o revisar tecnologías almacenadas. También puede usar los controles de preferencias que Legal English 5 habilite. Los ajustes se aplican al navegador y dispositivo utilizados, por lo que pueden requerir configuración separada en otros dispositivos."
            }
          ]
        },
        {
          "title": "Cambios y contacto",
          "blocks": [
            {
              "type": "p",
              "text": "Esta Política se actualizará si cambian las tecnologías, finalidades o proveedores. La fecha de vigencia se mostrará al inicio. Las preguntas y solicitudes se reciben en support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Idioma",
          "blocks": [
            {
              "type": "p",
              "text": "Esta Política se publica en español e inglés. En caso de divergencia, prevalece la versión en español."
            },
            {
              "type": "p",
              "text": "PART II"
            },
            {
              "type": "p",
              "text": "English"
            }
          ]
        }
      ]
    },
    "en": {
      "title": "Cookie Policy",
      "effective": "Effective September 11, 2026",
      "intro": [
        {
          "type": "p",
          "text": "This Policy explains the cookies and equivalent technologies used by Legal English 5. As of the effective date, the website does not intentionally deploy advertising cookies, social trackers, or non-essential analytics cookies. The technologies described below are needed to sign in, protect the account, remember language, and complete payments."
        }
      ],
      "sections": [
        {
          "title": "Controller and contact",
          "blocks": [
            {
              "type": "p",
              "text": "MPC LAW STUDIO, operated by María del Pilar Cruz, NIT 52.148.660-7, controls the website's first-party technologies. Questions and requests may be sent to support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Cookies and equivalent technologies",
          "blocks": [
            {
              "type": "p",
              "text": "Cookies are small files stored by a website in the browser. Equivalent technologies, such as local storage or session identifiers, may perform similar functions. When information identifies or makes a person identifiable, its processing is also governed by the Personal Data Processing and Privacy Policy."
            }
          ]
        },
        {
          "title": "Technologies used",
          "blocks": [
            {
              "type": "table",
              "rows": [
                [
                  "Technology",
                  "Category",
                  "Purpose",
                  "Duration"
                ],
                [
                  "Authentication and session",
                  "Strictly necessary",
                  "Maintains secure sign-in and the user's authenticated session through Supabase or an equivalent local storage mechanism.",
                  "Session duration or the period technically required for authentication; it ends or is renewed according to sign-out and security settings."
                ],
                [
                  "le5_locale",
                  "Preference",
                  "Remembers the language selected by the user, English or Spanish.",
                  "Up to 12 months, unless the user deletes it sooner."
                ],
                [
                  "Payment-provider technologies",
                  "Third-party and necessary for checkout",
                  "Mercado Pago may use its own cookies or comparable technologies when the user enters its environment to activate a trial or make a payment.",
                  "As established by Mercado Pago in its own policies."
                ]
              ]
            },
            {
              "type": "p",
              "text": "Technical names and duration may vary as providers update security without changing the stated purpose. Mercado Pago technologies operate within its domains or interfaces and are also governed by its policies."
            }
          ]
        },
        {
          "title": "Consent and controls",
          "blocks": [
            {
              "type": "p",
              "text": "Strictly necessary technologies are activated to provide a requested function and are not used for behavioural advertising. Users may delete or block cookies through the browser, sign out, or clear site storage. Blocking essential technologies may prevent sign-in, language storage, or payment."
            },
            {
              "type": "p",
              "text": "If Legal English 5 adds analytics, advertising, non-essential personalization, or social-media cookies, it will not activate them before providing clear information and a way to accept, reject, or manage preferences where authorization is required. Rejecting non-essential technologies will not affect basic Service access."
            }
          ]
        },
        {
          "title": "Managing cookies",
          "blocks": [
            {
              "type": "p",
              "text": "Users can use browser privacy and cookie settings to block, delete, or review stored technologies. They may also use any preference controls made available by Legal English 5. Settings apply to the browser and device used and may need to be configured separately on other devices."
            }
          ]
        },
        {
          "title": "Changes and contact",
          "blocks": [
            {
              "type": "p",
              "text": "This Policy will be updated if technologies, purposes, or providers change. The effective date will appear at the beginning. Questions and requests are received at support@legalenglish5.com."
            }
          ]
        },
        {
          "title": "Language",
          "blocks": [
            {
              "type": "p",
              "text": "This Policy is published in Spanish and English. If the versions differ, the Spanish version controls."
            }
          ]
        }
      ]
    }
  }
};
