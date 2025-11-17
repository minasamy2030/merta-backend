// article.js - (النسخة المصححة - تستخدم window.*)

document.addEventListener('commonLoaded', () => {

    const titleElement = document.getElementById('articleTitle');
    const contentElement = document.getElementById('articleContent');
    const imageElement = document.getElementById('articleImage');

    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("merta-lang", lang);
        
        // استخدم الدوال العالمية
        window.populateStaticText(lang);
        loadArticle(lang);
    };

    const langToggleBtn = document.getElementById("lang-toggle-btn");
    if (langToggleBtn) {
         langToggleBtn.addEventListener("click", (e) => {
             e.preventDefault();
             const currentLang = document.documentElement.lang;
             const newLang = currentLang === "ar" ? "en" : "ar";
             setLanguage(newLang);
         });
    }

    async function loadArticle(lang) {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            if (titleElement) titleElement.textContent = 'Error: Article not specified.';
            return;
        }

        // استخدم المتغير العالمي
        const apiUrl = `${window.strapiBaseUrl}/api/news-items?locale=${lang}&filters[slug][$eq]=${slug}&populate=*`;
        
        try {
            if (titleElement) titleElement.textContent = lang === 'ar' ? 'جاري تحميل المقال...' : 'Loading article...';
            if (contentElement) contentElement.innerHTML = '';
            if (imageElement) imageElement.style.display = 'none';
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const newsData = await response.json();
            
            if (!newsData.data || newsData.data.length !== 1) {
                if (titleElement) titleElement.textContent = lang === 'ar' ? 'خطأ: المقال غير موجود.' : 'Error: Article not found.';
                return;
            }

            // استخدم الدالة العالمية
            const article = window.getData(newsData.data[0]);
            
            if (!article) {
                 if (titleElement) titleElement.textContent = lang === 'ar' ? 'خطأ: بيانات المقال غير صالحة.' : 'Error: Invalid article data.';
                 return;
            }

            const articleTitle = article.newsTitle || (lang === 'ar' ? 'عنوان المقال' : 'Article Title');
            document.title = articleTitle;
            if (titleElement) titleElement.textContent = articleTitle;
            
            // استخدم الدالة العالمية
            if (contentElement) contentElement.innerHTML = window.renderStrapiBlocks(article.newsContent) || '';

            if (imageElement && article.newsImage && (article.newsImage.data || article.newsImage.url)) {
                const imgData = article.newsImage.data || article.newsImage;
                // استخدم الدالة العالمية
                const imgAttrs = window.getData(imgData);
                if (imgAttrs?.url) {
                    // استخدم المتغير العالمي
                    imageElement.src = `${window.strapiBaseUrl}${imgAttrs.url}`;
                    imageElement.alt = articleTitle;
                    imageElement.style.display = 'block';
                 }
            }

            setActiveNavLink();

        } catch (error) {
            console.error("!! فشل في جلب المقال:", error);
            if (titleElement) titleElement.textContent = lang === 'ar' ? 'حدث خطأ أثناء تحميل المقال.' : 'An error occurred while loading the article.';
        }
    }

    function setActiveNavLink() {
         const navLinks = document.querySelectorAll('.nav-links ul li a');
         navLinks.forEach(link => {
             if (link.getAttribute('href') === 'news-listing.html') {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });
    }

    const savedLang = localStorage.getItem("merta-lang") || "ar";
    setLanguage(savedLang); 

});