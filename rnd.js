// rnd.js - صفحة الأبحاث والتطوير (تبديل عربي / إنجليزي بدون Strapi)
document.addEventListener("commonLoaded", () => {
  const titleEl       = document.getElementById("rndTitle");
  const subtitleEl    = document.getElementById("rndSubtitle");
  const sec1TitleEl   = document.getElementById("rndSection1Title");
  const sec1TextEl    = document.getElementById("rndSection1Text");
  const sec2TitleEl   = document.getElementById("rndSection2Title");
  const chipsWrap     = document.getElementById("rndChips");
  const productsBtn   = document.getElementById("rndProductsBtn");
  const langToggleBtn = document.getElementById("lang-toggle-btn");

  const copy = {
    ar: {
      title: "الأبحاث والتطوير",
      subtitle: "نعمل على تطوير علاجات مبتكرة تُحدث فرقًا في صحة المرضى حول العالم.",
      sec1Title: "رؤيتنا البحثية",
      sec1Text:
        "تستثمر ميرتا فارما في البحث العلمي والابتكار لتطوير منتجات حديثة وآمنة تعتمد على أحدث تقنيات الصناعة الدوائية.",
      sec2Title: "مجالاتنا البحثية",
      chips: ["العظام والمفاصل", "تسكين الألم", "العناية بالبشرة", "المكملات الغذائية"],
      cta: "استكشف المنتجات",
    },
    en: {
      title: "Research & Development",
      subtitle: "We work on developing innovative therapies that make a real difference to patients’ lives worldwide.",
      sec1Title: "Our Research Vision",
      sec1Text:
        "Merta Pharma invests in scientific research and innovation to develop modern, safe products based on the latest pharmaceutical technologies.",
      sec2Title: "Key Research Areas",
      chips: ["Bones & joints", "Pain relief", "Skin care", "Nutritional supplements"],
      cta: "Explore products",
    },
  };

  function applyLanguage(lang) {
    const t = copy[lang] || copy.ar;

    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("merta-lang", lang);

    // يحدِّث النصوص الثابتة في الهيدر والفوتر
    window.populateStaticText(lang);

    if (titleEl)     titleEl.textContent    = t.title;
    if (subtitleEl)  subtitleEl.textContent = t.subtitle;
    if (sec1TitleEl) sec1TitleEl.textContent = t.sec1Title;
    if (sec1TextEl)  sec1TextEl.textContent  = t.sec1Text;
    if (sec2TitleEl) sec2TitleEl.textContent = t.sec2Title;

    if (chipsWrap && Array.isArray(t.chips)) {
      chipsWrap.innerHTML = "";
      t.chips.forEach((label) => {
        const span = document.createElement("span");
        span.className = "chip";
        span.textContent = label;
        chipsWrap.appendChild(span);
      });
    }

    if (productsBtn) productsBtn.textContent = t.cta;
  }

  // زرار تغيير اللغة في الهيدر
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const current = document.documentElement.lang || "ar";
      const next = current === "ar" ? "en" : "ar";
      applyLanguage(next);
    });
  }

  // اللغة المحفوظة أو العربي افتراضيًا
  const savedLang = localStorage.getItem("merta-lang") || "ar";
  applyLanguage(savedLang);
});

document.addEventListener("commonLoaded", () => {
  const titleEl = document.getElementById("rndTitle");
  const subEl = document.getElementById("rndSubtitle");

  const sec1Title = document.getElementById("rndSection1Title");
  const sec1Text = document.getElementById("rndSection1Text");

  const sec2Title = document.getElementById("rndSection2Title");
  const chipsContainer = document.getElementById("rndChips");

  const lang = localStorage.getItem("merta-lang") || "ar";

  async function loadRND() {
    try {
      const url = `${window.strapiBaseUrl}/api/rnd-page?locale=${lang}`;
      const res = await fetch(url);
      const json = await res.json();
      const data = window.getData(json);

      if (!data) return;

      if (titleEl) titleEl.textContent = data.pageTitle || titleEl.textContent;
      if (subEl) subEl.textContent = data.pageSubtitle || subEl.textContent;

      if (sec1Title) sec1Title.textContent = data.section1Title || sec1Title.textContent;
      if (sec1Text) sec1Text.innerHTML = window.renderStrapiBlocks(data.section1Content);

      if (sec2Title) sec2Title.textContent = data.section2Title;
      
      if (chipsContainer && data.section2Chips) {
        chipsContainer.innerHTML = "";
        data.section2Chips.forEach(ch => {
          chipsContainer.innerHTML += `<span class="chip">${ch}</span>`;
        });
      }

    } catch (err) {
      console.error("Error loading RND page:", err);
    }
  }

  loadRND();
});
