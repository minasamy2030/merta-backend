/*
common.js (v3 - إصلاح مشكلة Scope)
سنقوم الآن بإرفاق الدوال المساعدة والثوابت بالكائن العام 'window'
حتى تتمكن باقي الملفات (مثل about.js) من الوصول إليها.
*/

// ===== 1. الثوابت والمتغيرات العامة (Global) =====
// إرفاقها بـ 'window' لجعلها مرئية لملفات script.js, about.js, إلخ.
window.strapiBaseUrl = "http://localhost:1337";

// ===== 2. تحميل الهيدر والفوتر (يعمل عند تحميل الـ DOM) =====
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderAndFooter();
});

/**
 * يقوم بجلب محتوى header.html و footer.html
 * وعند الانتهاء، يطلق إشارة (event) اسمها 'commonLoaded'
 * ويقوم بتشغيل لوجيك الـ Navbar والترجمة الثابتة
 */
async function loadHeaderAndFooter() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  const fetchHeader = fetch('header.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load header.html');
      return response.text();
    })
    .then(html => {
      if (headerPlaceholder) headerPlaceholder.outerHTML = html;
    });

  const fetchFooter = fetch('footer.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load footer.html');
      return response.text();
    })
    .then(html => {
      if (footerPlaceholder) footerPlaceholder.outerHTML = html;
    });

  try {
    // انتظر حتى يتم تحميل *كلا* الملفين
    await Promise.all([fetchHeader, fetchFooter]);

    console.log("Common elements (Header/Footer) loaded successfully.");

    // بعد تحميل الهيدر، قم بتشغيل لوجيك الـ Navbar (هذه الدالة خاصة بـ common.js)
    handleNavbarLogic();
    
    // بعد تحميل الهيدر والفوتر، قم بملء النصوص الثابتة
    const savedLang = localStorage.getItem("merta-lang") || "ar";
    // استدعاء الدالة *العامة* التي سنعرفها في الأسفل
    window.populateStaticText(savedLang); 
    
    // أطلق الإشارة لباقي الصفحات لتبدأ تحميل بياناتها
    document.dispatchEvent(new Event('commonLoaded'));

  } catch (error) {
    console.error("Error loading common elements:", error);
    if (headerPlaceholder) headerPlaceholder.innerHTML = "<p style='color:red; text-align:center;'>Error loading navigation bar.</p>";
    if (footerPlaceholder) footerPlaceholder.innerHTML = "<p style='color:red; text-align:center;'>Error loading footer.</p>";
  }
}

/**
 * (دالة خاصة)
 * تعالج لوجيك فتح وإغلاق القائمة الجانبية
 */
function handleNavbarLogic() {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", (event) => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      event.stopPropagation();
    });
  }
  document.addEventListener("click", (event) => {
    if (
      nav &&
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      event.target !== menuToggle
    ) {
      nav.classList.remove("open");
      if(menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    }
  });
  window.addEventListener("scroll", () => {
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      if(menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}


// ===== 3. دوال Strapi المساعدة (Global) =====
// هذه الدوال سيتم إرفاقها بـ 'window' لتكون عامة

window.getData = function(strapiObject) {
  if (!strapiObject) return null;
  if (strapiObject.data?.attributes) return strapiObject.data.attributes;
  if (strapiObject.data) return strapiObject.data;
  if (strapiObject.attributes) return strapiObject.attributes;
  return strapiObject;
}

window.renderStrapiBlocks = function(blocks) {
  if (!blocks) return '';
  let html = '';
  blocks.forEach(block => {
    switch (block.type) {
      case 'paragraph':
        // نستخدم 'window.renderChildren' لأنها أيضاً عامة
        html += `<p>${window.renderChildren(block.children)}</p>`;
        break;
      case 'heading':
        const level = Math.max(1, Math.min(6, block.level || 1));
        html += `<h${level}>${window.renderChildren(block.children)}</h${level}>`;
        break;
      case 'list':
        const listTag = block.format === 'ordered' ? 'ol' : 'ul';
        html += `<${listTag}>`;
        block.children.forEach(listItem => {
          if (listItem.children) {
            html += `<li>${window.renderChildren(listItem.children)}</li>`;
          }
        });
        html += `</${listTag}>`;
        break;
      default:
        console.warn('Unsupported block type:', block.type);
        if (block.children) {
          html += `<p>${window.renderChildren(block.children)}</p>`;
        }
    }
  });
  return html;
}

window.renderChildren = function(children) {
  if (!children) return '';
  let text = '';
  children.forEach(child => {
    let childText = child.text || '';
    if (child.bold) childText = `<strong>${childText}</strong>`;
    if (child.italic) childText = `<em>${childText}</em>`;
    if (child.underline) childText = `<u>${childText}</u>`;
    text += childText;
  });
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  } else {
    return text.replace(/\n/g, '<br>');
  }
}


// ===== 4. قاموس الترجمة الثابتة (Global) =====
// إرفاقها بـ 'window' لتكون عامة

window.populateStaticText = function(lang) {
  const staticText = {
    en: {
      logoName: "MERTA PHARMA", navHome: "Home", navAbout: "About Us", navProducts: "Products",
      navRnd: "R&D", navNews: "News", navContact: "Contact Us", newsTitle: "Latest News & Updates",
      footerBrandSub: "Committed to better health for all.", footerLinks1Title: "Quick Links",
      footerLinkJobs: "Careers", footerLinkIR: "Investor Relations", footerLinkPatients: "For Patients",
      footerLinkHCP: "For Professionals", footerLinks2Title: "Legal", footerLinkPrivacy: "Privacy Policy",
      footerLinkTerms: "Terms of Use", footerLinkSupport: "Contact Us", footerContactTitle: "Contact Us",
      footerContactAddress: "Address: 123 Street, Cairo, Egypt", footerContactPhone: "Phone: +20 2 1234 5678",
      footerContactReport: "Report Adverse Event", footerBottomRights: "© 2025 Merta Pharma. All rights reserved.",
      footerBottomDisclaimer: "Disclaimer: The information on this site is for informational purposes only and does not replace consulting a doctor or pharmacist.",
    },
    ar: {
      logoName: "ميرتا فارما", navHome: "الرئيسية", navAbout: "عن الشركة", navProducts: "منتجاتنا",
      navRnd: "الأبحاث والتطوير", navNews: "الأخبار", navContact: "اتصل بنا", newsTitle: "آخر الأخبار والمستجدات",
      footerBrandSub: "ملتزمون بصحة أفضل للجميع.", footerLinks1Title: "روابط سريعة", footerLinkJobs: "الوظائف",
      footerLinkIR: "علاقات المستثمرين", footerLinkPatients: "للمرضى", footerLinkHCP: "للمتخصصين",
      footerLinks2Title: "قانوني", footerLinkPrivacy: "سياسة الخصوصية", footerLinkTerms: "شروط الاستخدام",
      footerLinkSupport: "تواصل معنا", footerContactTitle: "اتصل بنا", footerContactAddress: "العنوان: 123 شارع، القاهرة، مصر",
      footerContactPhone: "هاتف: +20 2 1234 5678", footerContactReport: "الإبلاغ عن آثار جانبية",
      footerBottomRights: "© 2025 Merta Pharma. جميع الحقوق محفوظة.",
      footerBottomDisclaimer: "إخلاء مسؤولية: المعلومات الواردة في هذا الموقع هي لأغراض إعلامية فقط ولا تغني عن استشارة الطبيب أو الصيدلي.",
    },
  };

  const t = staticText[lang];
  if (!t) return;
  
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  if(langToggleBtn) langToggleBtn.textContent = lang === "ar" ? "English" : "العربية";

  Object.keys(t).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = t[key];
    }
  });
}