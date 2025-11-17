// news-listing.js - (نظيف ومصحح)

// انتظر إشارة 'commonLoaded'
document.addEventListener('commonLoaded', () => {

    // --- 1. عناصر الصفحة الخاصة ---
    const newsContainer = document.getElementById('news-grid-container');
    const pageTitleElement = document.getElementById('newsListingTitle');

    // --- 2. كود تبديل اللغة (الخاص بهذه الصفحة) ---
    const langToggleBtn = document.getElementById("lang-toggle-btn");

    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("merta-lang", lang);
        
        // 1. أعد ملء النصوص الثابتة (من common.js)
        window.populateStaticText(lang); //
        
        // 2. أعد جلب بيانات الصفحة الديناميكية
        loadNewsListing(lang); //
    };

    if (langToggleBtn) { //
         langToggleBtn.addEventListener("click", (e) => { //
             e.preventDefault();
             const currentLang = document.documentElement.lang;
             const newLang = currentLang === "ar" ? "en" : "ar";
             setLanguage(newLang); //
         });
    }

    // --- 3. جلب بيانات كل الأخبار ---
    async function loadNewsListing(lang) {
        // جلب كل الأخبار مرتبة بالأحدث أولاً
        const apiUrl = `${window.strapiBaseUrl}/api/news-items?locale=${lang}&populate=*&sort=publishedAt:desc`;

        try {
            // Loading state
            if(pageTitleElement) pageTitleElement.textContent = lang === 'ar' ? 'جاري تحميل الأخبار...' : 'Loading News...'; //
            if (newsContainer) newsContainer.innerHTML = '<p>' + (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') + '</p>'; //

            const response = await fetch(apiUrl); //
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); //
            const newsJson = await response.json(); //

            // Set page title
            const staticTitle = lang === 'ar' ? 'الأخبار والمستجدات' : 'News & Updates'; //
            document.title = `${staticTitle} | Merta Pharma`; //
            if(pageTitleElement) pageTitleElement.textContent = staticTitle; //

            // Populate news listing
            populateNewsListing(newsJson.data); //

            setActiveNavLink(); //

        } catch (error) {
            console.error("!! فشل في جلب قائمة الأخبار:", error); //
            if(pageTitleElement) pageTitleElement.textContent = lang === 'ar' ? 'حدث خطأ أثناء تحميل الأخبار.' : 'An error occurred while loading news.'; //
            if(newsContainer) newsContainer.innerHTML = ''; //
        }
    }

    // --- 4. عرض قائمة الأخبار ---
    function populateNewsListing(newsArray) {
        if (!newsContainer) return; //

        if (!newsArray || newsArray.length === 0) { //
             newsContainer.innerHTML = document.documentElement.lang === 'ar' ? '<p>لا توجد أخبار لعرضها حالياً.</p>' : '<p>No news items to display currently.</p>'; //
             return;
        }

        newsContainer.innerHTML = ""; //

        newsArray.forEach((item) => { //
            // استخدم getData (من common.js)
            const attr = window.getData(item); //
            if (!attr) {
                console.warn("Skipping an empty or invalid news item:", item);
                return;
            }

            const imgData = attr.newsImage ? (attr.newsImage.data || attr.newsImage) : null; //
            let imgUrl = "https://via.placeholder.com/400x250";
            if (imgData) {
                // استخدم getData (من common.js)
                const imgAttrs = window.getData(imgData); //
                if (imgAttrs?.url) {
                     imgUrl = `${window.strapiBaseUrl}${imgAttrs.url}`; //
                }
            }

            const title = attr.newsTitle || "News Title"; //
            // استخدم renderStrapiBlocks (من common.js)
            const subHtml = window.renderStrapiBlocks(attr.newsSub) || "<p>News Subtitle</p>"; //
            const linkText = attr.newsLink || (document.documentElement.lang === 'ar' ? 'اقرأ المزيد' : 'Read More'); //
            const slug = attr.slug || `item-${item.id}`; //

            const cardHtml = `
              <article class="news-card">
                <img src="${imgUrl}" alt="${title}" />
                <h3>${title}</h3>
                <div class="news-card-sub">${subHtml}</div>
                <a href="article.html?slug=${slug}">${linkText}</a>
              </article>
            `; //
            newsContainer.innerHTML += cardHtml; //
        });
    }

    // --- 5. تفعيل الرابط النشط (الخاص بهذه الصفحة) ---
    function setActiveNavLink() {
         const navLinks = document.querySelectorAll('.nav-links ul li a'); //
         navLinks.forEach(link => { //
             if (link.getAttribute('href') === 'news-listing.html') { //
                 link.classList.add('active'); //
             } else {
                 link.classList.remove('active'); //
             }
         });
    }

    // --- 6. تشغيل الموقع لأول مرة ---
    const savedLang = localStorage.getItem("merta-lang") || "ar"; //
    setLanguage(savedLang); //

}); // End commonLoaded