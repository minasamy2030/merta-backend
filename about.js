// about.js - (النسخة المصححة - تستخدم window.*)

document.addEventListener('commonLoaded', () => {

    const titleElement = document.getElementById('aboutTitle');
    const contentContainer = document.getElementById('aboutSub'); 
    const imageElement = document.getElementById('about-img-div');
    const chipsContainer = document.querySelector('.values');
    const chip1Elem = document.getElementById('chip1');
    const chip2Elem = document.getElementById('chip2');
    const chip3Elem = document.getElementById('chip3');
    const chip4Elem = document.getElementById('chip4');

    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("merta-lang", lang);
        
        // استخدم الدوال العالمية
        window.populateStaticText(lang);
        loadAboutPage(lang);
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

    async function loadAboutPage(lang) {
        // استخدم المتغير العالمي
        const apiUrl = `${window.strapiBaseUrl}/api/about-title?locale=${lang}&populate[0]=pageSections&populate[1]=aboutImage`;
        
        try {
            if (titleElement) titleElement.textContent = lang === 'ar' ? 'جاري التحميل...' : 'Loading...';
            if (contentContainer) contentContainer.innerHTML = '';
            if (chipsContainer) chipsContainer.style.display = 'none';
            if(imageElement) imageElement.style.backgroundImage = '';
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const aboutJson = await response.json();
            
            // استخدم الدالة العالمية
            const aboutData = window.getData(aboutJson);
            
            if (!aboutData) {
                if (titleElement) titleElement.textContent = lang === 'ar' ? 'خطأ: فشل تحميل البيانات.' : 'Error: Failed to load data.';
                return;
            }

            const pageTitle = aboutData.aboutTitle || (lang === 'ar' ? 'عن الشركة' : 'About Us');
            document.title = `${pageTitle} | Merta Pharma`;
            if (titleElement) titleElement.textContent = pageTitle;

            if (imageElement && aboutData.aboutImage && (aboutData.aboutImage.data || aboutData.aboutImage.url)) {
                const imgData = aboutData.aboutImage.data || aboutData.aboutImage;
                // استخدم الدالة العالمية
                const imgUrl = window.getData(imgData)?.url;
                if (imgUrl) {
                    // استخدم المتغير العالمي
                    imageElement.style.backgroundImage = `url(${window.strapiBaseUrl}${imgUrl})`;
                }
            }

            if (contentContainer && aboutData.pageSections && aboutData.pageSections.length > 0) {
                let sectionsHtml = '';
                aboutData.pageSections.forEach(section => {
                    if (section.__component === 'about.about-section') {
                        if (section.sectionTitle) {
                            sectionsHtml += `<h2>${section.sectionTitle}</h2>`;
                        }
                        // استخدم الدالة العالمية
                        sectionsHtml += window.renderStrapiBlocks(section.sectionContent);
                    }
                });
                contentContainer.innerHTML = sectionsHtml;
            }

            if (chipsContainer) {
                 if(chip1Elem) chip1Elem.textContent = aboutData.chip1 || '';
                 if(chip2Elem) chip2Elem.textContent = aboutData.chip2 || '';
                 if(chip3Elem) chip3Elem.textContent = aboutData.chip3 || '';
                 if(chip4Elem) chip4Elem.textContent = aboutData.chip4 || '';
                 if(aboutData.chip1 || aboutData.chip2 || aboutData.chip3 || aboutData.chip4) {
                    chipsContainer.style.display = 'flex';
                 }
            }

            setActiveNavLink();
        } catch (error) {
            console.error("!! فشل في جلب بيانات About:", error);
            if (titleElement) titleElement.textContent = lang === 'ar' ? 'حدث خطأ أثناء تحميل الصفحة.' : 'An error occurred while loading the page.';
        }
    }

    function setActiveNavLink() {
         const navLinks = document.querySelectorAll('.nav-links ul li a');
         navLinks.forEach(link => {
             if (link.getAttribute('href') === 'about.html') {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });
    }

    const savedLang = localStorage.getItem("merta-lang") || "ar";
    setLanguage(savedLang); 

});