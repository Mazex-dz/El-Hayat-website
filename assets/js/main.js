// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden'); // Tailwind hidden class
}

// Translations
const translations = {
    ar: {
        'À propos': 'حولنا',
        'Nos expertises': 'خبراتنا',
        'Expertises': 'خبراتنا',
        'Catalogue': 'الكتالوج',
        'Services': 'الخدمات',
        'Contact': 'اتصل بنا',
        'Rendez-vous': 'مواعيد',
        'FR': 'الفرنسية',
        'AR': 'العربية',

        // Header Top Bar
        'Patients': 'مرضى',
        'Résultats en ligne': 'النتائج عبر الإنترنت',
        'Consultez vos analyses': 'اطلع على تحاليلك',
        'Prélèvement domicile': 'سحب العينات في المنزل',
        'Sans vous déplacer': 'دون التنقل',
        'Prendre Rendez-vous': 'حجز موعد',

        // Mega Menu
        'Nos missions': 'مهامنا',
        'Notre engagement envers vous': 'التزامنا تجاهكم',
        'Qualité': 'الجودة',
        'Standards internationaux': 'المعايير الدولية',
        'Le Groupe': 'المجموعة',
        'Notre histoire et valeurs': 'تاريخنا وقيمنا',

        // Hero Section
        'EL HAYAT': 'الحياة',
        'Laboratoire Médical': 'مختبر طبي',
        'L\'Excellence de la': 'التميز في',
        'Biologie Médicale': 'البيولوجيا الطبية',
        'à votre service.': 'في خدمتكم.',
        'Technologies de pointe, équipe d\'experts et résultats rapides. Votre santé mérite la plus haute précision.': 'تقنيات متطورة، فريق من الخبراء ونتائج سريعة. صحتكم تستحق أعلى درجات الدقة.',
        'Nos Expertises': 'خبراتنا',
        'Catalogue des Analyses': 'كتالوج التحاليل',

        // Stats
        'Examens / an': 'فحص / سنة',
        'Laboratoires': 'مختبرات',
        'Experts': 'خبراء',
        'Résultats Rapides': 'نتائج سريعة',

        // Expertise Section
        'Nos Domaines': 'مجالاتنا',
        'Expertises Médicales': 'الخبرات الطبية',
        'Une gamme complète d\'analyses spécialisées réalisées par des experts sur des plateaux techniques de dernière génération.': 'مجموعة كاملة من التحاليل المتخصصة التي يجريها خبراء على أحدث المنصات التقنية.',
        'Consulter le catalogue complet': 'عرض الكتالوج الكامل',

        // Cards Titles & Descriptions
        'Allergologie': 'طب الحساسية',
        'Diagnostic précis des allergies respiratoires et alimentaires. Tests de dernière génération.': 'تشخيص دقيق للحساسية التنفسية والغذائية. اختبارات من أحدث جيل.',
        'Auto-immunité': 'المناعة الذاتية',
        'Exploration approfondie des maladies auto-immunes et inflammatoires chroniques.': 'استكشاف متعمق لأمراض المناعة الذاتية والالتهابات المزمنة.',
        'Biologie Moléculaire': 'البيولوجيا الجزيئية',
        'PCR et séquençage pour le diagnostic génétique et infectieux de haute précision.': 'PCR وتسلسل للتشخيص الجيني والمعدي عالي الدقة.',
        'Endocrinologie': 'طب الغدد الصماء',
        'Bilans hormonaux complets : thyroïde, fertilité, croissance et métabolisme.': 'فحوصات هرمونية كاملة: الغدة الدرقية، الخصوبة، النمو والتمثيل الغذائي.',
        'Hématologie': 'أمراض الدم',
        'Cytologie sanguine, coagulation et immuno-hématologie spécialisée.': 'علم خلايا الدم، التخثر والمناعة الدموية المتخصصة.',
        'Microbiologie': 'علم الأحياء الدقيقة',
        'Identification bactérienne rapide et antibiogrammes ciblés pour un traitement efficace.': 'تحديد بكتيري سريع ومخططات مضادات حيوية مستهدفة لعلاج فعال.',
        'Oncologie': 'علم الأورام',
        'Suivi des marqueurs tumoraux et dépistage précoce des pathologies cancéreuses.': 'متابعة علامات الأورام والكشف المبكر عن الأمراض السرطانية.',
        'Toxicologie': 'علم السموم',
        'Dosage de médicaments, métaux lourds et dépistage de toxiques.': 'قياس الأدوية، المعادن الثقيلة والكشف عن السموم.',

        // Process Section
        'Parcours Patient': 'مسار المريض',
        'Comment ça marche ?': 'كيف يعمل؟',
        'Un parcours simplifié pour une prise en charge rapide et efficace': 'مسار مبسط لرعاية سريعة وفعالة',

        // Steps
        'Prescription': 'الوصفة الطبية',
        'Rédigez ou présentez votre ordonnance médicale.': 'اكتب أو قدم وصفتك الطبية.',
        'Prélèvement': 'أخذ العينات',
        'Au laboratoire ou à domicile sur rendez-vous.': 'في المختبر أو في المنزل بموعد.',
        'Analyse': 'تحليل',
        'Traitement rapide sur nos plateaux techniques.': 'معالجة سريعة على منصاتنا التقنية.',
        'Résultats': 'النتائج',
        'Disponibles en ligne, par email ou au laboratoire.': 'متاحة عبر الإنترنت، بالبريد الإلكتروني أو في المختبر.',

        // Contact Section
        'Notre Localisation': 'موقعنا',
        'Ouvert 24/7': 'مفتوح 24/7',
        'Contactez-nous': 'اتصل بنا',
        'Adresse': 'العنوان',
        'Rue Colonel Amirouche': 'شارع العقيد عميروش',
        'Bordj Menaïel, 35002': 'برج منايل، 35002',
        'Téléphone': 'الهاتف',
        'Email': 'البريد الإلكتروني',
        'Suivez-nous sur les réseaux': 'تابعنا على الشبكات',

        // Footer
        'El HAYAT': 'الحياة',
        'Leader en biologie médicale spécialisée. Nous combinons expertise humaine et innovation technologique pour votre santé.': 'رائد في البيولوجيا الطبية المتخصصة. نجمع بين الخبرة البشرية والابتكار التكنولوجي لصحتك.',
        'Nos expertises': 'خبراتنا',
        'Nous trouver': 'اعثر علينا',
        'Espace Pro': 'فضاء المهنيين',
        'FAQ': 'الأسئلة الشائعة',
        'Politique RSE': 'سياسة المسؤولية الاجتماعية',
        'Mentions Légales': 'إشعارات قانونية',
        'Fait avec excellence': 'صنع بامتياز',

        // Common
        'Copyright': 'حقوق النشر',
        'Tous droits réservés.': 'جميع الحقوق محفوظة.'
    }
};

function switchLanguage(lang) {
    const html = document.documentElement;
    const isArabic = lang === 'ar';

    // Set lang and dir
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    // Update button active states
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(lang)) {
            btn.classList.add('bg-primary-50', 'text-primary-700');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-primary-50', 'text-primary-700');
            btn.classList.add('text-slate-400');
        }
    });

    // Text Node Walker for precise key matching
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodes = [];
    while (node = walk.nextNode()) {
        if (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE') continue;
        nodes.push(node);
    }

    nodes.forEach(node => {
        const text = node.nodeValue.trim();
        if (!text) return;

        if (isArabic) {
            // FR -> AR
            if (translations.ar[text]) {
                node.nodeValue = node.nodeValue.replace(text, translations.ar[text]);
            }
        } else {
            // AR -> FR
            const frKey = Object.keys(translations.ar).find(key => translations.ar[key] === text);
            if (frKey) {
                node.nodeValue = node.nodeValue.replace(text, frKey);
            }
        }
    });

    // Handle placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        const text = el.getAttribute('placeholder');
        if (!text) return;

        if (isArabic) {
            if (translations.ar[text]) el.setAttribute('placeholder', translations.ar[text]);
        } else {
            const frKey = Object.keys(translations.ar).find(key => translations.ar[key] === text);
            if (frKey) el.setAttribute('placeholder', frKey);
        }
    });
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Section visibility handling
document.addEventListener('DOMContentLoaded', function () {
    const sections = ['policy', 'governance', 'missions', 'innovations', 'research', 'quality', 'values', 'group'];

    sections.forEach(sectionId => {
        const link = document.querySelector(`a[href="#${sectionId}"]`);
        const section = document.getElementById(sectionId);

        if (link && section) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                // Hide other sections
                sections.forEach(id => {
                    const otherSection = document.getElementById(id);
                    if (otherSection && id !== sectionId) {
                        otherSection.style.display = 'none';
                    }
                });
                // Show clicked section
                section.style.display = 'block';
                section.scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
});

// Pricing Link Navigation
const pricingLink = document.getElementById('pricingLink');
if (pricingLink) {
    pricingLink.addEventListener('click', function (e) {
        // e.preventDefault(); // Should probably let it navigate normally if it's a link, but keeping logic
        // If it's a real link to prices.html, we don't need to prevent default unless we're doing SPA
        // The original code had logic to communicate with parent iframe/canvas. Retaining that safely.

        // If valid link, let it work
        if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;

        e.preventDefault();
        this.innerHTML = 'Navigation... ⏳';

        setTimeout(() => {
            // ... internal logic ...
            this.innerHTML = 'Prix des analyses';
        }, 1000);
    });
}

// Scroll Reveal Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');

            // Counter animation
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                animateCounter(statNumber);
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

function animateCounter(el) {
    const text = el.innerText;
    const numberMatch = text.match(/\d+/);
    if (!numberMatch) return;

    const targetNum = parseInt(numberMatch[0]);
    const suffixText = text.replace(/\d+/, '');

    if (isNaN(targetNum)) return;

    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);

        const currentNum = Math.floor(start + (targetNum - start) * ease);
        el.innerText = currentNum + suffixText;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = targetNum + suffixText;
        }
    }
    requestAnimationFrame(update);
}
