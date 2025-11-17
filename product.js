// product.js - (النسخة النظيفة المعتمدة على common.js)

document.addEventListener('commonLoaded', () => {

    // --- 1. عناصر الصفحة الخاصة ---
    const productRoot = document.getElementById('productRoot');

    // --- 2. كود تبديل اللغة (الخاص بهذه الصفحة) ---
    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("merta-lang", lang);
        
        // 1. أعد ملء النصوص الثابتة (باستخدام الدالة العامة)
        window.populateStaticText(lang);
        
        // 2. أعد جلب بيانات الصفحة الديناميكية
        loadProduct(lang);
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

    // --- 3. جلب بيانات المنتج المحدد ---
    async function loadProduct(lang) {
        // 1. Read slug from URL
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            if (productRoot) productRoot.innerHTML = '<h1>Error: Product not specified.</h1>';
            return;
        }

        // 2. Fetch specific product data
        // (نستخدم المتغير العالمي window.strapiBaseUrl)
        // (نطلب populate therapeutic_area لنحصل على اسم ورابط المجال للزرار)
        const apiUrl = `${window.strapiBaseUrl}/api/products?locale=${lang}&filters[slug][$eq]=${slug}&populate[0]=productImage&populate[1]=therapeutic_area`;
        
        try {
            if (productRoot) productRoot.innerHTML = `<p>${lang === 'ar' ? 'جاري تحميل المنتج...' : 'Loading product...'}</p>`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const productJson = await response.json();

            if (!productJson.data || productJson.data.length !== 1) {
                if (productRoot) productRoot.innerHTML = `<h1>${lang === 'ar' ? 'خطأ: المنتج غير موجود.' : 'Error: Product not found.'}</h1>`;
                return;
            }

            // 3. استخدم الدالة العالمية window.getData
            const product = window.getData(productJson.data[0]);
            
            if (!product) {
                 if (productRoot) productRoot.innerHTML = `<h1>${lang === 'ar' ? 'خطأ: بيانات المنتج غير صالحة.' : 'Error: Invalid product data.'}</h1>`;
                 return;
            }

            // 4. اعرض المنتج
            renderProduct(product, lang);
            setActiveNavLink();

        } catch (error) {
            console.error("!! فشل في جلب المنتج:", error);
            if (productRoot) productRoot.innerHTML = `<h1>${lang === 'ar' ? 'حدث خطأ أثناء تحميل الصفحة.' : 'An error occurred.'}</h1>`;
        }
    }

    // --- 4. دالة عرض المنتج ---
    function renderProduct(attr, lang) {
        if (!productRoot || !attr) return;

        document.title = `${attr.productName || 'Product'} | Merta Pharma`;

        // 1. الصورة
        const imgData = attr.productImage ? (attr.productImage.data || attr.productImage) : null;
        let imgUrl = "https://via.placeholder.com/500x400/FFFFFF/CCCCCC/?text=Product";
        if (imgData) {
            // نستخدم الدالة العالمية window.getData
            const imgAttrs = window.getData(imgData);
            if (imgAttrs?.url) {
                // نستخدم المتغير العالمي window.strapiBaseUrl
                imgUrl = `${window.strapiBaseUrl}${imgAttrs.url}`;
            }
        }
        const mediaHtml = `<div class="product-media"><img src="${imgUrl}" alt="${attr.productName || ''}"></div>`;

        // 2. (Pills)
        let pillsHtml = '';
        if (attr.isPrescription) {
            pillsHtml += `<span class="badge">${lang === 'ar' ? 'بوصفة طبية' : 'Prescription'}</span>`;
        }
        if (attr.isSellable) {
            pillsHtml += `<span class="badge">${lang === 'ar' ? 'متاح للبيع' : 'Available'}</span>`;
        }
        if (attr.productPrice != null) {
            pillsHtml += `<span class="badge">${attr.productPrice} EGP</span>`;
        }
        
        // 3. المجال العلاجي (للزرار)
        // نستخدم الدالة العالمية window.getData
        const area = window.getData(attr.therapeutic_area);
        const areaName = area?.areaName || (lang === 'ar' ? 'المجال' : 'Area');
        const areaSlug = area?.slug || 'products'; // fallback
        // نستخدم area.html?slug=... بدلاً من products.html?area=... ليتوافق مع باقي الموقع
        const backLinkUrl = `area.html?slug=${areaSlug}`;
        const backLinkText = lang === 'ar' ? `العودة إلى ${areaName}` : `Back to ${areaName}`;

        // 4. الوصف التفصيلي (باستخدام الدالة العالمية window.renderStrapiBlocks)
        const detailedDescriptionHtml = window.renderStrapiBlocks(attr.productDetailedDescription) || '';
        const shortDescriptionHtml = attr.productShortDescription ? `<p class="meta">${attr.productShortDescription}</p>` : '';

        // 5. تجميع الـ HTML
        const productHtml = `
            ${mediaHtml}
            <div class="product-body">
                <div class="meta">${areaName}</div>
                <h1>${attr.productName || 'Product Name'}</h1>
                ${shortDescriptionHtml}
                <div class="kblocks">${pillsHtml}</div>
                
                <div style="margin-top:20px; border-top: 1px solid rgba(255,255,255,.1); padding-top: 20px;">
                    ${detailedDescriptionHtml}
                </div>

                <div class="cta">
                    <a class="btn btn-primary" href="${backLinkUrl}">${backLinkText}</a>
                </div>
            </div>
        `;

        productRoot.innerHTML = productHtml;
    }

    // --- 5. تفعيل الرابط النشط ---
    function setActiveNavLink() {
         // (نفس الكود الموجود في area.js لتظليل "Products")
         const navLinks = document.querySelectorAll('.nav-links ul li a');
         navLinks.forEach(link => {
             if (link.getAttribute('href') === 'products.html') {
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