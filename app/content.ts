export type PageContent = {title: string; description: string; indexable?: boolean};

// Single route catalogue for page metadata, static generation and the sitemap.
// Legal identity stays indexable; privacy notices and illustrative studies remain accessible.
export const pages: Record<string, PageContent> = {
  '/': {
    title: 'Renovim Sàrl | Peinture, plâtrerie et rénovation en Suisse romande',
    description: 'Renovim Sàrl, entreprise familiale au Mont-sur-Lausanne : peinture, plâtrerie et rénovation en Suisse romande. Près de 25 ans de savoir-faire. Devis gratuit.',
  },
  '/savoir-faire': {
    title: 'Peinture, plâtrerie et rénovation en Suisse romande',
    description: 'Découvrez les savoir-faire de Renovim Sàrl : peinture, plâtrerie et rénovation intérieure à Lausanne, dans le canton de Vaud et en Suisse romande.',
  },
  '/savoir-faire/peinture': {
    title: 'Peinture intérieure et extérieure à Lausanne',
    description: 'Renovim Sàrl réalise vos travaux de peinture : murs, plafonds, façades et boiseries. Préparation et finitions soignées à Lausanne et en Suisse romande.',
  },
  '/savoir-faire/platrerie': {
    title: 'Plâtrerie et faux plafonds dans le canton de Vaud',
    description: 'Enduits, lissage, cloisons, doublages et faux plafonds : Renovim Sàrl prépare et aménage vos intérieurs à Lausanne et en Suisse romande. Devis gratuit.',
  },
  '/savoir-faire/renovation': {
    title: 'Rénovation intérieure à Lausanne et en Suisse romande',
    description: 'Appartements, villas et locaux professionnels : Renovim Sàrl réalise la peinture et la plâtrerie et coordonne les prestations complémentaires de votre rénovation.',
  },
  '/realisations': {
    title: 'Transformations et inspirations pour votre intérieur',
    description: 'Explorez une étude illustrative avant et après. Ces images d’inspiration ne présentent pas un chantier réalisé par Renovim Sàrl.',
    indexable: false,
  },
  '/realisations/lumiere-retrouvee': {
    title: 'Une lumière retrouvée : étude illustrative',
    description: 'Une simulation de rafraîchissement intérieur : supports, peinture, parquet et finitions. Une inspiration visuelle, sans référence à un chantier réalisé.',
    indexable: false,
  },
  '/entreprise': {
    title: 'Entreprise familiale au Mont-sur-Lausanne',
    description: 'Renovim Sàrl associe près de 25 ans d’expérience familiale en peinture et plâtrerie à une nouvelle organisation pour vos travaux en Suisse romande.',
  },
  '/methode': {
    title: 'Notre méthode, du devis à la réception des travaux',
    description: 'Avec Renovim Sàrl, chaque chantier suit quatre étapes : comprendre votre projet, préparer les travaux, réaliser les finitions et réceptionner ensemble.',
  },
  '/professionnels': {
    title: 'Peinture et plâtrerie pour régies et architectes',
    description: 'Renovim Sàrl accompagne les régies, architectes et entreprises : remises en état, peinture et plâtrerie à Lausanne, dans le canton de Vaud et en Suisse romande.',
  },
  '/contact': {
    title: 'Contact et devis pour vos travaux en Suisse romande',
    description: 'Contactez Renovim Sàrl au 078 353 28 03 ou décrivez votre projet de peinture, plâtrerie ou rénovation. Basés au Mont-sur-Lausanne. Devis gratuit, sans engagement.',
  },
  '/cookies': {
    title: 'Cookies et vie privée',
    description: 'Informations sur les mécanismes techniques du site Renovim et l’absence de cookies publicitaires ou de mesure d’audience.',
    indexable: false,
  },
  '/confidentialite': {
    title: 'Déclaration de protection des données',
    description: 'Comment Renovim Sàrl utilise les coordonnées, messages et photographies transmis dans une demande de travaux.',
    indexable: false,
  },
  '/mentions-legales': {
    title: 'Mentions légales et coordonnées',
    description: 'Renovim Sàrl, raison sociale RenovIm Sàrl, CHE-226.712.155. Siège : Route de Lausanne 86, 1052 Le Mont-sur-Lausanne. Informations légales et contact.',
  },
};
export const services=[
{slug:'peinture',n:'01',name:'Peinture',line:'Peinture intérieure.\nFinitions extérieures.',text:'Murs, plafonds, façades : la couleur transforme un lieu. La préparation et la précision des finitions font le reste.',items:['Peinture intérieure : murs et plafonds','Peinture extérieure et façades selon le support','Peinture et remise en état des boiseries','Protection, préparation et réparation des supports','Rafraîchissement et remise en état de logements','Choix des teintes et des finitions'],detail:'Depuis Le Mont-sur-Lausanne, nous accompagnons les particuliers, propriétaires et régies à Lausanne, dans le canton de Vaud et en Suisse romande. Nous commençons par observer les surfaces et leur état. Protection des lieux, préparation, reprises et mise en peinture : chaque étape compte pour obtenir un résultat homogène.',faq:[['Faut-il vider la pièce ?','Cela dépend de l’espace et des travaux. Le déplacement du mobilier et les protections sont précisés lors de la préparation du chantier.'],['Pouvez-vous reprendre uniquement une pièce ?','Oui. Une chambre, un séjour ou un plafond peuvent faire l’objet d’une intervention ciblée.'],['Comment choisir la finition ?','Le choix dépend de la lumière, de l’usage de la pièce, de l’état du support et du rendu souhaité. Ces points sont discutés avant les travaux.']]},
{slug:'platrerie',n:'02',name:'Plâtrerie',line:'Plâtrerie et cloisons.\nDes finitions soignées.',text:'Enduits, cloisons, doublages et faux plafonds : nous préparons les surfaces et aménageons vos espaces avec soin.',items:['Réparation des fissures et des surfaces après diagnostic','Enduits, lissage et préparation avant peinture','Pose de plaques de plâtre et création de cloisons','Doublage des murs et faux plafonds','Moulures décoratives, corniches et raccords','Faux plafonds avec intégration de LED selon le projet'],detail:'Une belle finition repose sur un support adapté. Nous évaluons les défauts visibles et définissons les reprises nécessaires. Nous étudions vos cloisons, doublages et faux plafonds selon les contraintes du bâtiment. Les raccordements électriques des éclairages intégrés sont confiés à des professionnels autorisés. Nous intervenons dans le canton de Vaud et en Suisse romande.',faq:[['Toutes les fissures peuvent-elles être rebouchées ?','Leur cause doit d’abord être comprise. Une fissure liée à un mouvement du bâtiment ou à l’humidité peut nécessiter l’avis d’un spécialiste.'],['L’enduit remplace-t-il la peinture ?','L’enduit prépare ou finit le support selon le système choisi. Le traitement final est défini en fonction de l’aspect recherché.']]},
{slug:'renovation',n:'03',name:'Rénovation',line:'Rénovation intérieure.\nDes lieux qui évoluent.',text:'Rénovation d’appartements, de maisons, de villas et de locaux professionnels. La peinture et la plâtrerie sont au cœur de notre intervention ; les prestations complémentaires sont coordonnées selon votre projet.',items:['Faux plafonds, moulures et intégration de LED et spots','Éclairage : intensité et température de couleur selon le système choisi','Parquet et carrelage dans le cadre d’un projet de rénovation','Rénovation de salles de bains avec partenaires spécialisés','Transformation et rénovation de cuisines','Travaux électriques avec professionnels autorisés','Remise en état d’appartements, de villas et de locaux professionnels','Peinture, plâtrerie et coordination selon le périmètre convenu'],detail:'Nous réalisons les travaux de peinture et de plâtrerie. Pour les sols, cuisines, salles de bains et autres prestations complémentaires, les travaux sont étudiés dans le cadre du projet global, avec des partenaires spécialisés lorsque nécessaire. Les prestations, les intervenants et la coordination sont précisés dans le devis ; les installations électriques sont confiées à des professionnels autorisés.',faq:[['Prenez-vous en charge tous les corps de métier ?','Nos spécialités sont la peinture et la plâtrerie. Selon le projet, nous coordonnons les prestations complémentaires avec les partenaires adaptés, notamment pour les cuisines, salles de bains, revêtements de sols et installations électriques. Le périmètre de chacun et la coordination sont définis avant les travaux.'],['Intervenez-vous dans un logement occupé ?','La faisabilité et le phasage sont étudiés avec vous, en tenant compte de l’accès, des protections, du séchage et de votre quotidien.']]}
];
export const steps=[['Comprendre','Observer les lieux, écouter vos attentes et définir précisément les travaux.','Un périmètre partagé.'],['Préparer','Préciser les prestations, les finitions et le calendrier avant le début de l’intervention.','Un devis détaillé.'],['Réaliser','Protéger, préparer et exécuter. Faire le point avec vous lorsqu’une décision est nécessaire.','Un suivi au fil du chantier.'],['Terminer','Parcourir le résultat ensemble et identifier les éventuels ajustements.','Une réception attentive.']];
