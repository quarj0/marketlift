"use client";

import Link from "next/link";

import { useLocale } from "@/providers/locale-provider";

type LegalKind = "terms" | "privacy" | "cookies";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  effective: string;
  sections: LegalSection[];
};

const EFFECTIVE_EN = "Effective 23 September 2026";
const EFFECTIVE_PT = "Vigência: 23 de setembro de 2026";

const termsEn: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Terms and Conditions of Use",
  summary:
    "These Terms govern access to and use of the Marketlift marketplace, including listings, messaging, seller services, eligible online checkout, delivery features and related support.",
  effective: EFFECTIVE_EN,
  sections: [
    {
      title: "1. About Marketlift and acceptance",
      paragraphs: [
        "Marketlift is operated by Marketlift Company LTDA (\"Marketlift\", \"we\", \"us\" or \"our\"), a Brazilian company. By creating an account, publishing a listing, contacting another user, purchasing a Marketlift service or using an eligible checkout, you agree to these Terms and the policies referenced here.",
        "If you do not agree with these Terms, do not use the platform. Mandatory rights granted by Brazilian law are not waived by these Terms.",
      ],
    },
    {
      title: "2. Marketplace model",
      paragraphs: [
        "Marketlift is a marketplace that connects buyers and independent sellers. Marketlift is not automatically the owner, manufacturer or seller of products advertised by third-party sellers.",
        "Some eligible listings may offer Marketlift online checkout, payment protection, delivery coordination, dispute tools and seller payout flows. Other categories or listings may remain contact-only, meaning buyers and sellers negotiate and complete the transaction directly.",
        "Marketlift may provide its own paid platform services, such as seller subscriptions, promotions, verification-related services or other features shown in the product.",
      ],
    },
    {
      title: "3. Accounts and account security",
      bullets: [
        "Provide accurate, current information and keep it updated.",
        "Use your own account and keep passwords, session access and verification codes confidential.",
        "Notify Marketlift promptly if you believe your account has been compromised.",
        "Do not create accounts to evade suspension, verification requirements, limits or enforcement.",
      ],
      paragraphs: [
        "You are responsible for activity performed through your account unless the activity resulted from a security failure attributable to Marketlift.",
      ],
    },
    {
      title: "4. Sellers, listings and product information",
      paragraphs: [
        "Sellers are responsible for the accuracy, legality, authenticity, ownership, condition, price, availability and description of their listings, and for having the right to sell the advertised item.",
        "Photos and descriptions must represent the actual item. Material defects, restrictions, financing, liens, accident history, repair history or other information that would reasonably affect a buyer's decision must not be deliberately concealed.",
      ],
      bullets: [
        "Do not advertise illegal, stolen, counterfeit, dangerous or otherwise prohibited items.",
        "Do not impersonate another person or business.",
        "Do not manipulate reviews, favorites, views, prices or marketplace ranking.",
        "Do not move users off-platform for the purpose of fraud, fee evasion or bypassing applicable safety controls.",
      ],
    },
    {
      title: "5. Offers, messaging and negotiations",
      paragraphs: [
        "Messaging and suggested-price buttons are communication tools. When a buyer selects an offer amount, Marketlift sends a message such as \"I would like to make an offer of R$ 76.000,00.\" It does not create an automatic acceptance or rejection workflow.",
        "An offer message is not, by itself, a completed sale, payment authorization or binding confirmation by Marketlift. The parties remain responsible for confirming the deal, or completing the applicable Marketlift checkout when online purchase is enabled.",
        "Users may ignore messages they do not wish to answer. Harassment, spam, threats and deceptive messages are prohibited.",
      ],
    },
    {
      title: "6. Online checkout, payments and seller payouts",
      paragraphs: [
        "Where online checkout is enabled, Marketlift may use regulated or specialized payment providers to process payment, identity checks, connected seller accounts, refunds, chargebacks and payouts. The provider may apply its own terms and verification requirements.",
        "Marketlift does not need to receive or store a buyer's full payment-card number when payment details are entered directly with the payment provider.",
        "For protected marketplace orders, seller proceeds may remain pending until the applicable delivery, confirmation, buyer-protection and dispute conditions are satisfied. Marketlift or the payment provider may delay, restrict, reverse or withhold a payout where reasonably necessary to address a dispute, refund, chargeback, suspected fraud, legal obligation, sanctions requirement or provider restriction.",
        "A payment shown as initiated or pending is not final until the relevant payment provider confirms it. Taxes, fees, shipping and any marketplace charges shown before confirmation form part of the order total where applicable.",
      ],
    },
    {
      title: "7. Delivery, pickup and buyer protection",
      paragraphs: [
        "Eligible orders may support shipping, local delivery or pickup. Available methods are shown before payment and may vary by listing, seller and location.",
        "Buyers and sellers must follow the order status and delivery instructions. A delivery PIN or similar confirmation code must only be shared after the item has actually been handed over and, where appropriate, the buyer has had a reasonable opportunity to confirm the delivery.",
        "Buyer-protection and dispute tools are intended to help resolve eligible marketplace orders. They are not insurance and do not replace statutory consumer rights or a seller's legal obligations.",
      ],
    },
    {
      title: "8. Transactions completed outside Marketlift checkout",
      paragraphs: [
        "If a listing does not offer Marketlift checkout, payment and delivery are arranged directly between buyer and seller. Marketlift does not hold the purchase funds for those off-platform transactions and cannot guarantee payment, delivery or product condition.",
        "Users should verify the item and the other party, use safe meeting practices, keep evidence of agreements and avoid sending money before they are satisfied that the transaction is legitimate.",
      ],
    },
    {
      title: "9. Fees, subscriptions and promotions",
      paragraphs: [
        "Marketlift may charge sellers for subscriptions, listing promotions, boosts or other clearly identified platform services. The applicable price, billing period and included features are displayed before purchase.",
        "Recurring or prepaid services, if offered, are governed by the billing information shown at purchase. Marketlift may change future prices or plan features with reasonable notice; changes do not retroactively alter completed purchases unless required by law.",
      ],
    },
    {
      title: "10. Cancellations, refunds and consumer rights",
      paragraphs: [
        "Nothing in these Terms limits rights that cannot legally be waived. Where a transaction is a consumer relationship under Brazilian law, the Consumer Protection Code and applicable e-commerce rules may apply, including statutory information, service and withdrawal rights when the legal requirements are met.",
        "The legal responsibility of a seller may differ depending on whether the seller acts as a professional supplier or as a private individual. Marketlift may facilitate cancellations, disputes and refunds for eligible platform orders, but the applicable legal rights and obligations depend on the circumstances of the transaction.",
        "Refunds may be returned through the original payment method or another method supported by the payment provider, subject to processing times outside Marketlift's control.",
      ],
    },
    {
      title: "11. Prohibited conduct",
      bullets: [
        "Fraud, scams, money laundering, identity misuse or attempts to obtain another user's credentials or verification codes.",
        "Malware, scraping that disrupts the service, unauthorized automated access or attempts to bypass security controls.",
        "Discriminatory, abusive, threatening, defamatory or unlawful content.",
        "False reports, forged verification materials or manipulation of moderation systems.",
        "Use of the platform in violation of applicable law or third-party rights.",
      ],
    },
    {
      title: "12. Moderation, verification and enforcement",
      paragraphs: [
        "Marketlift may review content, request verification, restrict visibility, place a listing under review, remove listings, suspend features or suspend/close accounts when reasonably necessary to enforce these Terms, protect users, comply with law or address fraud and security risks.",
        "Automated systems may assist with risk detection and prioritization, but Marketlift may also use human review. Where applicable law grants a right to request review of an automated decision, users may contact support.",
      ],
    },
    {
      title: "13. Reviews and user content",
      paragraphs: [
        "You retain ownership of content you submit. You grant Marketlift a non-exclusive, worldwide, royalty-free license to host, reproduce, resize, format, display and distribute that content only as reasonably necessary to operate, secure, promote and improve the marketplace and your listings.",
        "Reviews must reflect genuine marketplace experiences. Marketlift may remove reviews or other content that violates these Terms, applicable law or platform integrity rules.",
      ],
    },
    {
      title: "14. Intellectual property",
      paragraphs: [
        "The Marketlift name, software, interface, branding, marketplace design and platform content owned by Marketlift are protected by applicable intellectual-property laws. These Terms do not transfer ownership of Marketlift intellectual property to users.",
      ],
    },
    {
      title: "15. Availability and changes to the service",
      paragraphs: [
        "Marketlift may perform maintenance, modify features, introduce eligibility rules or temporarily suspend parts of the service for operational, legal, security or business reasons. When maintenance mode is active, the public marketplace may be temporarily unavailable while the administration console remains operational.",
        "We aim to provide a reliable service, but uninterrupted availability cannot be guaranteed.",
      ],
    },
    {
      title: "16. Responsibility and limitation of liability",
      paragraphs: [
        "To the extent permitted by law, Marketlift is not responsible for user-generated misrepresentations, defects in third-party goods, off-platform payments or losses caused by users intentionally bypassing platform protections. Sellers remain responsible for their products and legal obligations.",
        "Marketlift remains responsible for obligations that applicable law places directly on Marketlift. Nothing in these Terms excludes liability that cannot legally be excluded or restricts mandatory consumer rights.",
      ],
    },
    {
      title: "17. Privacy and cookies",
      paragraphs: [
        "Personal data is handled as described in the Privacy Policy. Information about first-party cookies and browser storage is provided in the Cookie Policy.",
      ],
    },
    {
      title: "18. Governing law, complaints and disputes",
      paragraphs: [
        "These Terms are governed by the laws of the Federative Republic of Brazil. Any mandatory consumer forum or jurisdiction rights remain preserved.",
        "Before escalating a dispute, users are encouraged to use the Help Center, order-dispute tools or other support channels made available by Marketlift.",
      ],
    },
    {
      title: "19. Changes and contact",
      paragraphs: [
        "We may update these Terms to reflect legal, regulatory, security, payment, operational or product changes. The current version and effective date will remain available on this page. Material changes may also be communicated through the platform where appropriate.",
        "For questions, complaints or legal requests, use the Marketlift Help Center and the official support channels displayed on the platform.",
      ],
    },
  ],
};

const termsPt: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Termos e Condições de Uso",
  summary:
    "Estes Termos regulam o acesso e o uso do marketplace Marketlift, incluindo anúncios, mensagens, serviços para vendedores, checkout online elegível, entregas e suporte relacionado.",
  effective: EFFECTIVE_PT,
  sections: [
    {
      title: "1. Sobre o Marketlift e aceitação",
      paragraphs: [
        "O Marketlift é operado pela Marketlift Company LTDA (\"Marketlift\", \"nós\" ou \"nosso\"), empresa brasileira. Ao criar uma conta, publicar um anúncio, contatar outro usuário, contratar um serviço do Marketlift ou usar um checkout elegível, você concorda com estes Termos e com as políticas aqui referenciadas.",
        "Se você não concordar com estes Termos, não utilize a plataforma. Direitos obrigatórios assegurados pela legislação brasileira não são renunciados por estes Termos.",
      ],
    },
    {
      title: "2. Modelo de marketplace",
      paragraphs: [
        "O Marketlift é um marketplace que conecta compradores e vendedores independentes. O Marketlift não é automaticamente proprietário, fabricante ou vendedor dos produtos anunciados por terceiros.",
        "Alguns anúncios elegíveis podem oferecer checkout online do Marketlift, proteção de pagamento, coordenação de entrega, ferramentas de disputa e fluxo de repasse ao vendedor. Outras categorias ou anúncios podem permanecer apenas para contato, caso em que comprador e vendedor negociam e concluem a transação diretamente.",
        "O Marketlift também pode oferecer serviços próprios pagos, como planos para vendedores, promoções, serviços ligados à verificação e outras funcionalidades apresentadas na plataforma.",
      ],
    },
    {
      title: "3. Contas e segurança",
      bullets: [
        "Forneça informações corretas e atualizadas e mantenha-as atualizadas.",
        "Use sua própria conta e mantenha senhas, sessões e códigos de verificação em sigilo.",
        "Avise o Marketlift prontamente se suspeitar de comprometimento da conta.",
        "Não crie contas para contornar suspensão, verificação, limites ou medidas de aplicação.",
      ],
      paragraphs: [
        "Você é responsável pelas atividades realizadas por sua conta, exceto quando a atividade decorrer de falha de segurança atribuível ao Marketlift.",
      ],
    },
    {
      title: "4. Vendedores, anúncios e informações do produto",
      paragraphs: [
        "O vendedor é responsável pela exatidão, legalidade, autenticidade, propriedade, condição, preço, disponibilidade e descrição do anúncio, bem como por ter o direito de vender o item anunciado.",
        "Fotos e descrições devem representar o item real. Defeitos relevantes, restrições, financiamento, gravames, histórico de acidente, reparos ou outras informações que razoavelmente influenciem a decisão do comprador não devem ser ocultados deliberadamente.",
      ],
      bullets: [
        "Não anuncie itens ilegais, furtados/roubados, falsificados, perigosos ou proibidos.",
        "Não se passe por outra pessoa ou empresa.",
        "Não manipule avaliações, favoritos, visualizações, preços ou classificação do marketplace.",
        "Não leve usuários para fora da plataforma com finalidade de fraude, evasão de taxas ou contorno de controles de segurança aplicáveis.",
      ],
    },
    {
      title: "5. Ofertas, mensagens e negociação",
      paragraphs: [
        "Mensagens e botões de sugestão de preço são ferramentas de comunicação. Quando o comprador seleciona um valor, o Marketlift envia uma mensagem como \"Gostaria de fazer uma oferta de R$ 76.000,00.\" Não existe aceitação ou recusa automática da oferta.",
        "A mensagem de oferta, por si só, não constitui venda concluída, autorização de pagamento nem confirmação vinculante pelo Marketlift. As partes continuam responsáveis por confirmar o negócio ou concluir o checkout aplicável quando a compra online estiver habilitada.",
        "O usuário pode simplesmente não responder a mensagens que não deseje atender. Assédio, spam, ameaças e mensagens enganosas são proibidos.",
      ],
    },
    {
      title: "6. Checkout online, pagamentos e repasses",
      paragraphs: [
        "Quando o checkout online estiver habilitado, o Marketlift poderá utilizar provedores especializados ou regulados para processar pagamento, verificação, contas conectadas de vendedores, reembolsos, chargebacks e repasses. O provedor pode aplicar termos próprios e exigir verificações adicionais.",
        "O Marketlift não precisa receber nem armazenar o número completo do cartão do comprador quando os dados de pagamento são inseridos diretamente no provedor de pagamento.",
        "Em pedidos protegidos, os valores do vendedor podem permanecer pendentes até que as condições aplicáveis de entrega, confirmação, proteção do comprador e disputa sejam satisfeitas. O Marketlift ou o provedor poderá atrasar, restringir, reverter ou reter um repasse quando isso for razoavelmente necessário para tratar disputa, reembolso, chargeback, suspeita de fraude, obrigação legal, sanção ou restrição do provedor.",
        "Um pagamento indicado como iniciado ou pendente só é final após confirmação do provedor. Tributos, taxas, frete e encargos do marketplace mostrados antes da confirmação integram o total do pedido quando aplicáveis.",
      ],
    },
    {
      title: "7. Entrega, retirada e proteção do comprador",
      paragraphs: [
        "Pedidos elegíveis podem oferecer envio, entrega local ou retirada. As opções disponíveis são mostradas antes do pagamento e podem variar por anúncio, vendedor e localidade.",
        "Compradores e vendedores devem acompanhar o status do pedido e seguir as instruções de entrega. PIN de entrega ou código equivalente só deve ser compartilhado após a entrega efetiva do item e, quando apropriado, após o comprador ter oportunidade razoável de confirmar o recebimento.",
        "As ferramentas de proteção e disputa ajudam a resolver pedidos elegíveis, mas não são seguro e não substituem direitos legais do consumidor nem obrigações legais do vendedor.",
      ],
    },
    {
      title: "8. Transações concluídas fora do checkout do Marketlift",
      paragraphs: [
        "Se o anúncio não oferecer checkout do Marketlift, pagamento e entrega são combinados diretamente entre comprador e vendedor. Nesses casos, o Marketlift não mantém os valores da compra e não garante pagamento, entrega ou condição do produto.",
        "Os usuários devem verificar o item e a outra parte, adotar práticas seguras de encontro, guardar provas do acordo e evitar enviar dinheiro antes de estarem satisfeitos de que a transação é legítima.",
      ],
    },
    {
      title: "9. Taxas, planos e promoções",
      paragraphs: [
        "O Marketlift pode cobrar vendedores por planos, promoções de anúncios, impulsionamentos ou outros serviços claramente identificados. O preço, período de cobrança e recursos incluídos são apresentados antes da contratação.",
        "Serviços recorrentes ou pré-pagos, quando oferecidos, seguem as informações exibidas na contratação. O Marketlift pode alterar preços futuros ou características dos planos mediante aviso razoável; as mudanças não alteram retroativamente compras concluídas, salvo quando exigido por lei.",
      ],
    },
    {
      title: "10. Cancelamentos, reembolsos e direitos do consumidor",
      paragraphs: [
        "Nada nestes Termos limita direitos que não possam ser legalmente renunciados. Quando a transação configurar relação de consumo, poderão se aplicar o Código de Defesa do Consumidor e as regras brasileiras de comércio eletrônico, inclusive direitos legais de informação, atendimento e arrependimento quando presentes os requisitos legais.",
        "A responsabilidade jurídica do vendedor pode variar conforme ele atue como fornecedor profissional ou como pessoa física em uma venda particular. O Marketlift pode facilitar cancelamentos, disputas e reembolsos em pedidos elegíveis, mas os direitos e deveres aplicáveis dependem das circunstâncias da transação.",
        "Reembolsos podem retornar ao meio de pagamento original ou a outro método suportado pelo provedor, sujeitos a prazos de processamento fora do controle do Marketlift.",
      ],
    },
    {
      title: "11. Condutas proibidas",
      bullets: [
        "Fraude, golpes, lavagem de dinheiro, uso indevido de identidade ou tentativa de obter credenciais/códigos de outro usuário.",
        "Malware, raspagem que prejudique o serviço, acesso automatizado não autorizado ou tentativa de contornar controles de segurança.",
        "Conteúdo discriminatório, abusivo, ameaçador, difamatório ou ilegal.",
        "Denúncias falsas, documentos de verificação falsificados ou manipulação de sistemas de moderação.",
        "Uso da plataforma em violação à lei aplicável ou a direitos de terceiros.",
      ],
    },
    {
      title: "12. Moderação, verificação e aplicação",
      paragraphs: [
        "O Marketlift pode analisar conteúdo, solicitar verificação, limitar visibilidade, colocar anúncios em revisão, remover anúncios, restringir recursos ou suspender/encerrar contas quando isso for razoavelmente necessário para aplicar estes Termos, proteger usuários, cumprir a lei ou tratar riscos de fraude e segurança.",
        "Sistemas automatizados podem auxiliar na detecção e priorização de riscos, juntamente com revisão humana. Quando a legislação aplicável assegurar revisão de decisão automatizada, o usuário poderá solicitá-la pelos canais de suporte.",
      ],
    },
    {
      title: "13. Avaliações e conteúdo do usuário",
      paragraphs: [
        "Você mantém a titularidade do conteúdo que envia. Você concede ao Marketlift licença não exclusiva, mundial e gratuita para hospedar, reproduzir, redimensionar, formatar, exibir e distribuir esse conteúdo somente na medida razoavelmente necessária para operar, proteger, divulgar e melhorar o marketplace e seus anúncios.",
        "Avaliações devem refletir experiências reais no marketplace. O Marketlift pode remover avaliações ou conteúdo que violem estes Termos, a lei ou regras de integridade da plataforma.",
      ],
    },
    {
      title: "14. Propriedade intelectual",
      paragraphs: [
        "O nome Marketlift, software, interface, identidade visual, design do marketplace e conteúdos próprios do Marketlift são protegidos pelas leis aplicáveis de propriedade intelectual. Estes Termos não transferem ao usuário a titularidade da propriedade intelectual do Marketlift.",
      ],
    },
    {
      title: "15. Disponibilidade e alterações do serviço",
      paragraphs: [
        "O Marketlift pode realizar manutenção, alterar funcionalidades, introduzir regras de elegibilidade ou suspender temporariamente partes do serviço por razões operacionais, legais, de segurança ou comerciais. Durante o modo de manutenção, o marketplace público pode ficar temporariamente indisponível enquanto o console administrativo permanece operacional.",
        "Buscamos oferecer um serviço confiável, mas não é possível garantir disponibilidade ininterrupta.",
      ],
    },
    {
      title: "16. Responsabilidade e limitações",
      paragraphs: [
        "Na medida permitida por lei, o Marketlift não responde por falsas declarações de usuários, defeitos em bens de terceiros, pagamentos feitos fora da plataforma ou perdas causadas pelo contorno deliberado das proteções disponíveis. O vendedor continua responsável por seus produtos e obrigações legais.",
        "O Marketlift continua responsável pelas obrigações que a lei atribua diretamente à empresa. Nada nestes Termos exclui responsabilidade que não possa ser legalmente excluída nem restringe direitos obrigatórios do consumidor.",
      ],
    },
    {
      title: "17. Privacidade e cookies",
      paragraphs: [
        "Dados pessoais são tratados conforme a Política de Privacidade. Informações sobre cookies próprios e armazenamento no navegador constam da Política de Cookies.",
      ],
    },
    {
      title: "18. Lei aplicável, reclamações e disputas",
      paragraphs: [
        "Estes Termos são regidos pelas leis da República Federativa do Brasil. Permanecem preservados os direitos de foro ou competência obrigatória assegurados ao consumidor.",
        "Antes de escalar uma disputa, recomendamos utilizar a Central de Ajuda, as ferramentas de disputa do pedido ou os demais canais oficiais de suporte disponibilizados pelo Marketlift.",
      ],
    },
    {
      title: "19. Alterações e contato",
      paragraphs: [
        "Podemos atualizar estes Termos para refletir mudanças legais, regulatórias, de segurança, pagamento, operação ou produto. A versão vigente e sua data permanecerão disponíveis nesta página. Alterações relevantes poderão ser comunicadas também pela plataforma.",
        "Para dúvidas, reclamações ou solicitações legais, utilize a Central de Ajuda e os canais oficiais de suporte exibidos no Marketlift.",
      ],
    },
  ],
};

const privacyEn: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Privacy Policy",
  summary:
    "This Policy explains how Marketlift Company LTDA handles personal data when you use the marketplace, seller tools, messaging, verification, checkout, delivery and support.",
  effective: EFFECTIVE_EN,
  sections: [
    {
      title: "1. Controller and scope",
      paragraphs: [
        "Marketlift Company LTDA is responsible for decisions about the personal data it processes to operate Marketlift, except where a third-party provider independently determines how it processes data under its own legal role.",
        "This Policy applies to the public marketplace, registered accounts, seller tools, order and delivery features, support, moderation and administrative operations connected to Marketlift.",
      ],
    },
    {
      title: "2. Personal data we may collect",
      bullets: [
        "Account data: name, email, phone, authentication details and account preferences.",
        "Profile and listing data: seller profile, photos, descriptions, prices, location, category details and public contact choices.",
        "Marketplace activity: searches, saved listings, follows, reviews, messages, offers, reports, support requests and moderation history.",
        "Transaction data: order references, item snapshots, totals, payment status, refunds, disputes, delivery status and payout status.",
        "Delivery data: recipient and delivery address, fulfillment method, tracking information and delivery-confirmation data.",
        "Technical and security data: IP address, device/browser information, session identifiers, logs, timestamps and security events.",
        "Location data: state, city, district and, only when requested by you, device-derived location needed for location features.",
      ],
    },
    {
      title: "3. Seller verification and identity data",
      paragraphs: [
        "Seller onboarding may require CPF/CNPJ, legal name, birth date, identity documents, selfie or other verification information depending on the verification method and applicable provider requirements.",
        "Marketlift does not intentionally publish a seller's CPF, identity-document number, full banking details or verification documents. Verification information is used for identity, fraud prevention, trust, legal compliance and payment-account eligibility.",
        "Where a payment or identity provider collects verification information directly, that provider may process the information under its own privacy terms in addition to the processing necessary for Marketlift to receive verification results.",
      ],
    },
    {
      title: "4. Payments and financial information",
      paragraphs: [
        "For eligible online checkout, payment details may be entered directly with the payment provider. Marketlift may receive transaction identifiers, payment method type, amount, status, refund/chargeback information and other data needed to manage the order without receiving the complete card number.",
        "Seller payout providers may collect bank, tax, identity and business information required to create or maintain a connected payment account. Marketlift may receive account status, payout eligibility and masked destination information.",
      ],
    },
    {
      title: "5. Why we process personal data",
      bullets: [
        "Create accounts, authenticate users and maintain sessions.",
        "Publish, search, rank, save and moderate listings.",
        "Enable messaging, offers, reviews, support and notifications.",
        "Verify sellers and reduce fraud, abuse and account takeover.",
        "Create and manage eligible orders, payments, delivery, disputes, refunds and seller payouts.",
        "Operate subscriptions, promotions and other Marketlift services.",
        "Protect users, enforce platform rules and investigate reports.",
        "Meet legal, tax, accounting, regulatory and judicial obligations.",
        "Measure reliability, diagnose errors and improve platform performance and usability.",
      ],
    },
    {
      title: "6. Legal bases",
      paragraphs: [
        "Depending on the purpose and context, Marketlift may process personal data to perform a contract or pre-contractual steps requested by you, comply with legal or regulatory obligations, exercise rights in legal proceedings, protect life or physical safety where applicable, pursue legitimate interests subject to the rights and freedoms of the data subject, and obtain consent where consent is the appropriate legal basis.",
        "When consent is used, it may be withdrawn through the available controls or support channels without affecting processing already lawfully performed before withdrawal.",
      ],
    },
    {
      title: "7. Messaging and marketplace safety",
      paragraphs: [
        "Marketplace messages, offers and reports are stored so the conversation can function, users can retrieve history, and Marketlift can investigate fraud, abuse, disputes and safety reports where necessary.",
        "Do not send passwords, card numbers, authentication codes or unnecessary sensitive information through chat.",
      ],
    },
    {
      title: "8. Location information",
      paragraphs: [
        "Marketlift uses location information to show relevant listings, delivery options and regional marketplace features. Approximate location may come from information you enter. Precise device location is requested only when a location feature requires it and your device/browser permits sharing.",
      ],
    },
    {
      title: "9. Sharing and service providers",
      paragraphs: [
        "Marketlift may share the minimum personal data reasonably necessary with infrastructure and hosting providers, storage/CDN providers, payment and payout providers, identity-verification providers, communications/notification providers, delivery/logistics participants, fraud/security vendors and professional advisers.",
        "Data may also be disclosed where required by law, court order or competent authority, or where reasonably necessary to establish, exercise or defend legal rights.",
        "Marketlift does not sell personal data to advertisers.",
      ],
    },
    {
      title: "10. International processing and transfers",
      paragraphs: [
        "Some technology providers may process or store information outside Brazil. Where an international transfer of personal data occurs, Marketlift will use an applicable legal mechanism and reasonable safeguards required by Brazilian data-protection law.",
      ],
    },
    {
      title: "11. Retention",
      paragraphs: [
        "We keep personal data only for as long as reasonably necessary for the purposes described in this Policy, to maintain transaction and security records, comply with legal/regulatory retention duties, resolve disputes and exercise legal rights.",
        "Deletion of an account does not necessarily require immediate deletion of every record. Certain information may remain blocked, archived or retained where the law permits or requires retention, including records needed for fraud prevention, accounting, disputes or legal claims.",
      ],
    },
    {
      title: "12. Your LGPD rights",
      bullets: [
        "Confirmation of whether personal data is processed and access to the data.",
        "Correction of incomplete, inaccurate or outdated data.",
        "Anonymization, blocking or deletion of data that is unnecessary, excessive or processed unlawfully, where applicable.",
        "Portability, subject to applicable regulation and commercial/industrial secrets.",
        "Information about public and private entities with which data has been shared.",
        "Information about the consequences of refusing consent where consent is requested.",
        "Withdrawal of consent and deletion of data processed on consent where legally applicable.",
        "Review of decisions based solely on automated processing where the requirements of applicable law are met.",
      ],
      paragraphs: [
        "Requests may be subject to identity verification and lawful exceptions. Use the Help Center or the official privacy/support channels displayed by Marketlift to exercise your rights.",
      ],
    },
    {
      title: "13. Automated fraud and moderation assistance",
      paragraphs: [
        "Marketlift may use rules, scoring or automated tools to detect unusual activity, prioritize moderation, prevent fraud and protect accounts. These tools may be combined with human review. Where Brazilian law gives you a right to request review of a solely automated decision that affects your interests, you may contact us.",
      ],
    },
    {
      title: "14. Security",
      paragraphs: [
        "Marketlift uses administrative and technical controls intended to protect personal data, including access controls, encrypted transport, secure session settings, audit mechanisms and restricted access to sensitive verification/payment information.",
        "No online service can guarantee absolute security. Users should use strong credentials, protect their devices and report suspicious activity promptly.",
      ],
    },
    {
      title: "15. Children and adolescents",
      paragraphs: [
        "Marketlift is not designed to encourage children to enter commercial transactions without appropriate legal capacity or authorization. Where data relating to children or adolescents is processed, Marketlift will apply the protections required by Brazilian law and the best-interest principle where applicable.",
      ],
    },
    {
      title: "16. Cookies and browser storage",
      paragraphs: [
        "Marketlift uses strictly necessary session and security technologies, together with limited browser storage, to support sign-in, request integrity, preferences, checkout continuity and basic marketplace functionality. See the Cookie Policy for details.",
      ],
    },
    {
      title: "17. Policy changes and contact",
      paragraphs: [
        "We may update this Policy when our processing, providers, legal obligations or product features change. The effective date will be updated on this page.",
        "For privacy questions or LGPD requests, use the Marketlift Help Center and official support/privacy channels displayed on the platform.",
      ],
    },
  ],
};

const privacyPt: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Política de Privacidade",
  summary:
    "Esta Política explica como a Marketlift Company LTDA trata dados pessoais quando você utiliza o marketplace, ferramentas de vendedor, mensagens, verificação, checkout, entrega e suporte.",
  effective: EFFECTIVE_PT,
  sections: [
    {
      title: "1. Controlador e escopo",
      paragraphs: [
        "A Marketlift Company LTDA é responsável pelas decisões sobre os dados pessoais que trata para operar o Marketlift, exceto quando um terceiro determinar de forma independente como tratará dados sob sua própria responsabilidade legal.",
        "Esta Política se aplica ao marketplace público, contas registradas, ferramentas de vendedor, recursos de pedidos e entrega, suporte, moderação e operações administrativas ligadas ao Marketlift.",
      ],
    },
    {
      title: "2. Dados pessoais que podemos coletar",
      bullets: [
        "Dados da conta: nome, e-mail, telefone, dados de autenticação e preferências.",
        "Perfil e anúncios: perfil do vendedor, fotos, descrições, preços, localização, categoria e opções públicas de contato.",
        "Atividade no marketplace: buscas, salvos, seguidores, avaliações, mensagens, ofertas, denúncias, suporte e histórico de moderação.",
        "Dados de transação: referência do pedido, snapshot do item, valores, status do pagamento, reembolsos, disputas, entrega e repasse.",
        "Dados de entrega: destinatário, endereço, modalidade de entrega, rastreamento e confirmação.",
        "Dados técnicos e de segurança: IP, dispositivo/navegador, identificadores de sessão, logs, horários e eventos de segurança.",
        "Localização: estado, cidade, bairro e, somente quando solicitado por você, localização do dispositivo necessária para recursos de localização.",
      ],
    },
    {
      title: "3. Verificação do vendedor e dados de identidade",
      paragraphs: [
        "A ativação de vendedor pode exigir CPF/CNPJ, nome legal, data de nascimento, documento de identidade, selfie ou outras informações de verificação, conforme o método e os requisitos do provedor aplicável.",
        "O Marketlift não publica intencionalmente CPF, número completo de documento, dados bancários completos ou documentos de verificação. Esses dados são usados para identidade, prevenção a fraude, confiança, conformidade legal e elegibilidade de contas de pagamento.",
        "Quando um provedor de pagamento ou identidade coleta dados diretamente, ele poderá tratá-los conforme sua própria política de privacidade, além do tratamento necessário para que o Marketlift receba os resultados da verificação.",
      ],
    },
    {
      title: "4. Pagamentos e informações financeiras",
      paragraphs: [
        "No checkout online elegível, os dados de pagamento podem ser inseridos diretamente no provedor. O Marketlift pode receber identificadores da transação, tipo do meio de pagamento, valor, status, dados de reembolso/chargeback e informações necessárias para administrar o pedido, sem receber o número completo do cartão.",
        "Provedores de repasse a vendedores podem coletar dados bancários, fiscais, de identidade e da empresa necessários para manter uma conta conectada. O Marketlift pode receber status da conta, elegibilidade para repasse e informações mascaradas do destino.",
      ],
    },
    {
      title: "5. Para que usamos os dados",
      bullets: [
        "Criar contas, autenticar usuários e manter sessões.",
        "Publicar, pesquisar, classificar, salvar e moderar anúncios.",
        "Habilitar mensagens, ofertas, avaliações, suporte e notificações.",
        "Verificar vendedores e reduzir fraude, abuso e tomada indevida de conta.",
        "Criar e administrar pedidos elegíveis, pagamentos, entrega, disputas, reembolsos e repasses.",
        "Operar planos, promoções e outros serviços do Marketlift.",
        "Proteger usuários, aplicar regras e investigar denúncias.",
        "Cumprir obrigações legais, fiscais, contábeis, regulatórias e judiciais.",
        "Medir confiabilidade, diagnosticar erros e melhorar desempenho e usabilidade.",
      ],
    },
    {
      title: "6. Bases legais",
      paragraphs: [
        "Conforme a finalidade e o contexto, o Marketlift poderá tratar dados para executar contrato ou procedimentos preliminares solicitados pelo titular, cumprir obrigação legal/regulatória, exercer direitos em processo, proteger vida ou integridade física quando aplicável, atender interesses legítimos respeitando direitos e liberdades do titular e obter consentimento quando essa for a base adequada.",
        "Quando o consentimento for utilizado, ele poderá ser revogado pelos controles disponíveis ou canais de suporte, sem afetar tratamentos já realizados licitamente antes da revogação.",
      ],
    },
    {
      title: "7. Mensagens e segurança do marketplace",
      paragraphs: [
        "Mensagens, ofertas e denúncias podem ser armazenadas para permitir o funcionamento da conversa, recuperação do histórico e investigação de fraude, abuso, disputa e segurança quando necessário.",
        "Não envie senhas, número de cartão, códigos de autenticação ou dados sensíveis desnecessários pelo chat.",
      ],
    },
    {
      title: "8. Informações de localização",
      paragraphs: [
        "O Marketlift usa localização para mostrar anúncios relevantes, opções de entrega e recursos regionais. A localização aproximada pode vir de dados informados por você. A localização precisa do dispositivo somente é solicitada quando uma funcionalidade exige e seu dispositivo/navegador permite o compartilhamento.",
      ],
    },
    {
      title: "9. Compartilhamento e prestadores de serviço",
      paragraphs: [
        "O Marketlift pode compartilhar o mínimo de dados razoavelmente necessário com provedores de infraestrutura e hospedagem, armazenamento/CDN, pagamentos e repasses, verificação de identidade, comunicação/notificações, participantes de logística/entrega, segurança/antifraude e assessores profissionais.",
        "Dados também podem ser divulgados quando exigido por lei, ordem judicial ou autoridade competente, ou quando razoavelmente necessário para constituir, exercer ou defender direitos.",
        "O Marketlift não vende dados pessoais a anunciantes.",
      ],
    },
    {
      title: "10. Tratamento e transferências internacionais",
      paragraphs: [
        "Alguns provedores de tecnologia podem tratar ou armazenar informações fora do Brasil. Quando houver transferência internacional de dados pessoais, o Marketlift adotará mecanismo jurídico aplicável e salvaguardas razoáveis exigidas pela legislação brasileira de proteção de dados.",
      ],
    },
    {
      title: "11. Retenção",
      paragraphs: [
        "Mantemos dados pessoais somente pelo período razoavelmente necessário às finalidades desta Política, à manutenção de registros de transação e segurança, ao cumprimento de deveres legais/regulatórios, à solução de disputas e ao exercício de direitos.",
        "A exclusão da conta não exige necessariamente a eliminação imediata de todos os registros. Algumas informações podem permanecer bloqueadas, arquivadas ou retidas quando a lei permitir ou exigir, inclusive para prevenção a fraude, contabilidade, disputas ou reivindicações legais.",
      ],
    },
    {
      title: "12. Seus direitos na LGPD",
      bullets: [
        "Confirmação da existência de tratamento e acesso aos dados.",
        "Correção de dados incompletos, inexatos ou desatualizados.",
        "Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade, quando aplicável.",
        "Portabilidade, observada a regulamentação aplicável e os segredos comercial e industrial.",
        "Informação sobre entidades públicas e privadas com as quais os dados foram compartilhados.",
        "Informação sobre consequências da recusa do consentimento quando ele for solicitado.",
        "Revogação do consentimento e eliminação dos dados tratados com consentimento quando juridicamente aplicável.",
        "Revisão de decisões tomadas unicamente com base em tratamento automatizado, quando presentes os requisitos legais.",
      ],
      paragraphs: [
        "Solicitações podem exigir confirmação de identidade e estão sujeitas a exceções legais. Utilize a Central de Ajuda ou os canais oficiais de privacidade/suporte do Marketlift para exercer seus direitos.",
      ],
    },
    {
      title: "13. Auxílio automatizado de antifraude e moderação",
      paragraphs: [
        "O Marketlift pode utilizar regras, pontuações ou ferramentas automatizadas para detectar atividade incomum, priorizar moderação, prevenir fraude e proteger contas. Esses recursos podem ser combinados com revisão humana. Quando a lei brasileira assegurar revisão de decisão exclusivamente automatizada que afete seus interesses, você poderá solicitá-la.",
      ],
    },
    {
      title: "14. Segurança",
      paragraphs: [
        "O Marketlift utiliza controles administrativos e técnicos destinados a proteger dados pessoais, incluindo controles de acesso, transporte criptografado, configurações seguras de sessão, mecanismos de auditoria e acesso restrito a informações sensíveis de verificação/pagamento.",
        "Nenhum serviço online garante segurança absoluta. O usuário deve proteger suas credenciais e dispositivos e comunicar atividades suspeitas prontamente.",
      ],
    },
    {
      title: "15. Crianças e adolescentes",
      paragraphs: [
        "O Marketlift não foi concebido para incentivar crianças a realizar transações comerciais sem capacidade legal ou autorização adequada. Quando houver tratamento de dados de crianças ou adolescentes, o Marketlift aplicará as proteções exigidas pela legislação brasileira e, quando aplicável, o princípio do melhor interesse.",
      ],
    },
    {
      title: "16. Cookies e armazenamento no navegador",
      paragraphs: [
        "O Marketlift utiliza tecnologias estritamente necessárias de sessão e segurança, além de armazenamento limitado no navegador, para login, integridade de requisições, preferências, continuidade de checkout e funcionamento básico do marketplace. Consulte a Política de Cookies para detalhes.",
      ],
    },
    {
      title: "17. Alterações e contato",
      paragraphs: [
        "Podemos atualizar esta Política quando mudarem nossos tratamentos, provedores, obrigações legais ou funcionalidades. A data de vigência será atualizada nesta página.",
        "Para dúvidas de privacidade ou solicitações relacionadas à LGPD, utilize a Central de Ajuda e os canais oficiais de suporte/privacidade exibidos na plataforma.",
      ],
    },
  ],
};

const cookiesEn: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Cookie Policy",
  summary:
    "This Policy explains the cookies and similar browser-storage technologies used by Marketlift and how they support security, login, preferences and marketplace functionality.",
  effective: EFFECTIVE_EN,
  sections: [
    {
      title: "1. What cookies are",
      paragraphs: [
        "Cookies are small browser-stored values used by websites. Related browser-storage technologies can retain limited preferences or short-lived application state needed for site functionality.",
      ],
    },
    {
      title: "2. Cookies currently used by Marketlift",
      paragraphs: [
        "Marketlift currently relies primarily on first-party cookies that are necessary for the service to work securely. These cookies are not used to build advertising profiles.",
      ],
      bullets: [
        "Authenticated-session cookies keep a signed-in session associated with the correct account and are protected from ordinary page scripts.",
        "Request-integrity cookies help protect authenticated or state-changing requests from cross-site forgery and similar abuse.",
        "Separate security boundaries may use distinct strictly necessary session cookies so public marketplace activity and authorized administration sessions do not share the same browser session state.",
      ],
    },
    {
      title: "3. Browser storage used for functionality",
      paragraphs: [
        "Marketlift may use limited browser storage for non-advertising functionality such as remembering a selected market, keeping short-lived checkout continuity information, avoiding duplicate view-count events within a browser session and preserving interface preferences.",
        "This browser-held state is used only for the stated functional purposes and remains on the device until it expires, is replaced or is cleared by the application or the user.",
      ],
    },
    {
      title: "4. Payment and other third-party services",
      paragraphs: [
        "When you are redirected to a payment, identity or other third-party provider, that provider may set cookies on its own website or domain under its own cookie/privacy policy. Marketlift does not control cookies placed exclusively on a provider's separate domain.",
      ],
    },
    {
      title: "5. Advertising and non-essential cookies",
      paragraphs: [
        "Marketlift does not currently use advertising cookies or third-party behavioral-profiling cookies on the marketplace.",
        "If Marketlift later introduces non-essential analytics, advertising or similar cookies that require consent or another control under applicable law, the platform will update this Policy and implement an appropriate preference/consent mechanism before using them where required.",
      ],
    },
    {
      title: "6. Your controls",
      paragraphs: [
        "You can delete or block cookies and browser storage using your browser settings. Blocking strictly necessary cookies may prevent login, secure form submission, checkout or other core functions from working correctly.",
        "Signing out invalidates the active authenticated session according to the platform's session controls, but clearing browser data may also be necessary to remove local preferences stored on your device.",
      ],
    },
    {
      title: "7. Changes and contact",
      paragraphs: [
        "We may update this Cookie Policy when technologies, providers or legal requirements change. For questions about cookies or privacy, use the Marketlift Help Center or the official support/privacy channels shown on the platform.",
      ],
    },
  ],
};

const cookiesPt: LegalCopy = {
  eyebrow: "Marketlift Company LTDA",
  title: "Política de Cookies",
  summary:
    "Esta Política explica os cookies e tecnologias semelhantes de armazenamento no navegador usados pelo Marketlift para segurança, login, preferências e funcionamento do marketplace.",
  effective: EFFECTIVE_PT,
  sections: [
    {
      title: "1. O que são cookies",
      paragraphs: [
        "Cookies são pequenos valores armazenados pelo navegador para o funcionamento de sites. Tecnologias relacionadas de armazenamento no navegador podem manter preferências limitadas ou estados temporários necessários ao funcionamento da plataforma.",
      ],
    },
    {
      title: "2. Cookies atualmente usados pelo Marketlift",
      paragraphs: [
        "O Marketlift utiliza principalmente cookies próprios estritamente necessários para o funcionamento seguro do serviço. Esses cookies não são usados para criar perfis publicitários.",
      ],
      bullets: [
        "Cookies de sessão autenticada mantêm a sessão vinculada à conta correta e são protegidos contra acesso por scripts comuns da página.",
        "Cookies de integridade de requisição ajudam a proteger ações autenticadas ou que alteram dados contra falsificação entre sites e abusos semelhantes.",
        "Limites de segurança separados podem utilizar cookies de sessão estritamente necessários distintos para que a atividade pública do marketplace e sessões administrativas autorizadas não compartilhem o mesmo estado de sessão no navegador.",
      ],
    },
    {
      title: "3. Armazenamento no navegador para funcionalidades",
      paragraphs: [
        "O Marketlift pode utilizar armazenamento limitado no navegador para funcionalidades não publicitárias, como lembrar o mercado selecionado, manter por curto período informações de continuidade do checkout, evitar contagem duplicada de visualizações na mesma sessão do navegador e preservar preferências da interface.",
        "Esse estado mantido no navegador é usado apenas para as finalidades funcionais descritas e permanece no dispositivo até expirar, ser substituído ou ser apagado pela aplicação ou pelo usuário.",
      ],
    },
    {
      title: "4. Pagamentos e outros serviços de terceiros",
      paragraphs: [
        "Ao ser redirecionado a um provedor de pagamento, identidade ou outro terceiro, esse provedor poderá definir cookies em seu próprio site ou domínio conforme sua política de cookies/privacidade. O Marketlift não controla cookies definidos exclusivamente no domínio separado do provedor.",
      ],
    },
    {
      title: "5. Cookies publicitários e não necessários",
      paragraphs: [
        "Atualmente, o Marketlift não utiliza cookies publicitários nem cookies de terceiros para perfil comportamental no marketplace.",
        "Se futuramente forem introduzidos cookies não necessários de analytics, publicidade ou finalidade semelhante que exijam consentimento ou outro controle, esta Política será atualizada e o mecanismo adequado de preferência/consentimento será implementado antes do uso quando exigido pela legislação aplicável.",
      ],
    },
    {
      title: "6. Seus controles",
      paragraphs: [
        "Você pode apagar ou bloquear cookies e armazenamento local nas configurações do navegador. Bloquear cookies estritamente necessários pode impedir login, envio seguro de formulários, checkout ou outras funções essenciais.",
        "O logout invalida a sessão autenticada ativa conforme os controles da plataforma, mas pode ser necessário limpar os dados do navegador para remover preferências salvas localmente no dispositivo.",
      ],
    },
    {
      title: "7. Alterações e contato",
      paragraphs: [
        "Podemos atualizar esta Política quando tecnologias, provedores ou requisitos legais mudarem. Para dúvidas sobre cookies ou privacidade, utilize a Central de Ajuda ou os canais oficiais de suporte/privacidade exibidos na plataforma.",
      ],
    },
  ],
};

function policyFor(kind: LegalKind, portuguese: boolean) {
  if (kind === "terms") return portuguese ? termsPt : termsEn;
  if (kind === "privacy") return portuguese ? privacyPt : privacyEn;
  return portuguese ? cookiesPt : cookiesEn;
}

export function LegalDocument({ kind }: { kind: LegalKind }) {
  const { locale } = useLocale();
  const portuguese = locale === "pt-BR";
  const copy = policyFor(kind, portuguese);

  return (
    <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <article className="rounded-xl border bg-white p-5 sm:p-7">
        <header className="border-b pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.summary}
          </p>
          <p className="mt-2 text-xs text-slate-400">{copy.effective}</p>
        </header>

        <div className="divide-y">
          {copy.sections.map((section) => (
            <section key={section.title} className="py-5">
              <h2 className="text-base font-bold text-slate-950">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2 text-sm leading-6 text-slate-600"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="border-t pt-5 text-xs leading-5 text-slate-500">
          <p>
            {portuguese
              ? "Documentos relacionados:"
              : "Related documents:"}{" "}
            <Link className="font-semibold text-brand-700 hover:underline" href="/terms">
              {portuguese ? "Termos e Condições" : "Terms & Conditions"}
            </Link>
            {" · "}
            <Link className="font-semibold text-brand-700 hover:underline" href="/privacy">
              {portuguese ? "Privacidade" : "Privacy"}
            </Link>
            {" · "}
            <Link className="font-semibold text-brand-700 hover:underline" href="/cookies">
              {portuguese ? "Cookies" : "Cookies"}
            </Link>
            {" · "}
            <Link className="font-semibold text-brand-700 hover:underline" href="/help">
              {portuguese ? "Central de Ajuda" : "Help Center"}
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
