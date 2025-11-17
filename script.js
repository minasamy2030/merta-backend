// script.js (النسخة النظيفة المعتمدة على common.js)
// هذا الملف يتم تحميله فقط في index.html

document.addEventListener('commonLoaded', () => {

    // --- 1. عناصر الصفحة ---
    // (لا حاجة لتعريف langToggleBtn هنا، setLanguage ستتعامل معه)

    // --- 2. كود تبديل اللغة (الخاص بهذه الصفحة) ---
    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("merta-lang", lang);
        
        // 1. أعد ملء النصوص الثابتة (باستخدام الدالة العامة)
        window.populateStaticText(lang);
        
        // 2. أعد جلب بيانات الصفحة الديناميكية
        fetchAndPopulate(lang);
    };

    // (الربط بـ langToggleBtn موجود بالفعل في common.js، 
    // لكننا نحتاج لنسخة خاصة هنا لتشغيل fetchAndPopulate)
    const langToggleBtn = document.getElementById("lang-toggle-btn");
    if (langToggleBtn) {
         langToggleBtn.addEventListener("click", (e) => {
             e.preventDefault();
             const currentLang = document.documentElement.lang;
             const newLang = currentLang === "ar" ? "en" : "ar";
             setLanguage(newLang);
         });
    }

    // --- 3. جلب بيانات الصفحة الرئيسية (Hero, About, News) ---
    async function fetchAndPopulate(lang) {
        
        // استخدم المتغير *العالمي* من common.js
        const heroUrl = `${window.strapiBaseUrl}/api/hero?locale=${lang}&populate=*`;
        const aboutUrl = `${window.strapiBaseUrl}/api/about-title?locale=${lang}&populate=*`;
        
        // جلب آخر 3 مقالات فقط، مرتبة تنازلياً حسب تاريخ النشر
        const newsUrl = `${window.strapiBaseUrl}/api/news-items?locale=${lang}&sort[0]=publishedAt:desc&pagination[limit]=3&populate=*`;

        try {
            const [heroRes, aboutRes, newsRes] = await Promise.all([
                fetch(heroUrl),
                fetch(aboutUrl),
                fetch(newsUrl),
            ]);
            const heroJson = await heroRes.json();
            const aboutJson = await aboutRes.json();
            const newsJson = await newsRes.json();

            // استخدم الدالة *العالمية* من common.js
            populateHero(window.getData(heroJson));
            populateAbout(window.getData(aboutJson));
            populateNews(newsJson.data); // News دائمًا data: [...]

            setActiveNavLink(); // تفعيل رابط "Home"

        } catch (error) {
            console.error("!! فشل في جلب بيانات الصفحة الرئيسية:", error);
            // يمكنك إضافة رسالة خطأ للمستخدم هنا
        }
    }

    // --- 4. دوال ملء المحتوى ---

    function populateHero(data) {
        if (!data) return;
        
        const titleEl = document.getElementById("heroTitle");
        const subtitleEl = document.getElementById("heroSubtitle");
        const btn1El = document.getElementById("heroBtn1");
        const btn2El = document.getElementById("heroBtn2");
        const imgEl = document.getElementById("hero-image-div");

        if(titleEl) titleEl.textContent = data.heroTitle || "";
        if(btn1El) btn1El.textContent = data.heroBtn1 || "";
        if(btn2El) btn2El.textContent = data.heroBtn2 || "";

        // استخدم الدالة *العالمية*
        if(subtitleEl) subtitleEl.innerHTML = window.renderStrapiBlocks(data.heroSubtitle) || "";

        if (imgEl && data.heroImage && (data.heroImage.data || data.heroImage.url)) {
            const imgData = data.heroImage.data || data.heroImage;
            // استخدم الدالة *العالمية*
            const imgUrl = window.getData(imgData)?.url;
            if (imgUrl) {
                // استخدم المتغير *العالمي*
                imgEl.style.backgroundImage = `url(${window.strapiBaseUrl}${imgUrl})`;
            }
        }
    }

    function populateAbout(data) {
        if (!data) return;

        const titleElem = document.getElementById("aboutTitle");
        const chip1Elem = document.getElementById("chip1");
        const chip2Elem = document.getElementById("chip2");
        const chip3Elem = document.getElementById("chip3");
        const chip4Elem = document.getElementById("chip4");
        const btnElem = document.getElementById("aboutBtn");
        const imageElem = document.getElementById("about-img-div");
        const contentElem = document.getElementById("aboutSub");
        
        if (titleElem) titleElem.textContent = data.aboutTitle || "";
        if (chip1Elem) chip1Elem.textContent = data.chip1 || "";
        if (chip2Elem) chip2Elem.textContent = data.chip2 || "";
        if (chip3Elem) chip3Elem.textContent = data.chip3 || "";
        if (chip4Elem) chip4Elem.textContent = data.chip4 || "";
        if (btnElem) btnElem.textContent = data.aboutBtn || "Learn More"; // افترض اسم زر افتراضي
        
        const imgData = data.aboutImage && (data.aboutImage.data || data.aboutImage);
        if (imageElem && imgData) {
            // استخدم الدالة *العالمية*
            const imgAttrs = window.getData(imgData);
            if (imgAttrs && imgAttrs.url) {
                // استخدم المتغير *العالمي*
                imageElem.style.backgroundImage = `url(${window.strapiBaseUrl}${imgAttrs.url})`;
            }
        }

        if (contentElem) {
            if (Array.isArray(data.pageSections) && data.pageSections.length > 0) {
                const firstSection = data.pageSections[0];
                if (firstSection && firstSection.sectionContent) {
                    // استخدم الدالة *العالمية*
                    contentElem.innerHTML = window.renderStrapiBlocks(firstSection.sectionContent);
                }
            } else {
                 contentElem.innerHTML = "";
            }
        }
    }

    function populateNews(newsArray) {
        const container = document.getElementById("news-grid-container");
        if (!container) return;
        
        if (!newsArray || newsArray.length === 0) {
             container.innerHTML = `<p>No news items found.</p>`;
             return;
        }
        
        container.innerHTML = ""; // Clear loading text

        newsArray.forEach((item) => {
            // استخدم الدالة *العالمية*
            const attr = window.getData(item);
            if (!attr) return;

            const imgData = attr.newsImage ? (attr.newsImage.data || attr.newsImage) : null;
            let imgUrl = "https://via.placeholder.com/400x250"; // Default
            if (imgData) {
                // استخدم الدالة *العالمية*
                const imgAttrs = window.getData(imgData);
                if (imgAttrs?.url) {
                    // استخدم المتغير *العالمي*
                    imgUrl = `${window.strapiBaseUrl}${imgAttrs.url}`;
                }
            }

            const title = attr.newsTitle || "News Title";
            // استخدم الدالة *العالمية*
            const subHtml = window.renderStrapiBlocks(attr.newsSub) || ""; 
            const linkText = document.documentElement.lang === 'ar' ? "اقرأ المزيد ←" : "Read More →";
            const slug = attr.slug || `item-${item.id}`;

            const cardHtml = `
              <article class="news-card">
                <img src="${imgUrl}" alt="${title}" />
                <div class="news-card-content">
                    <h3>${title}</h3>
                    <div class="news-card-sub">${subHtml}</div>
                    <a href="article.html?slug=${slug}" class="details-link">${linkText}</a>
                </div>
              </article>
            `;
            container.innerHTML += cardHtml;
        });
    }
    
    // --- 5. تفعيل الرابط النشط (الخاص بهذه الصفحة) ---
    function setActiveNavLink() {
         const navLinks = document.querySelectorAll('.nav-links ul li a');
         navLinks.forEach(link => {
             if (link.getAttribute('href') === 'index.html') {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });
    }

    // --- 6. تشغيل الموقع لأول مرة ---
    const savedLang = localStorage.getItem("merta-lang") || "ar";
    setLanguage(savedLang); // هذا سيقوم بملء النصوص الثابتة وجلب بيانات الصفحة

}); // End commonLoaded