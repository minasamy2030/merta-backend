// area.js — صفحة المجال العلاجي + كروت المنتجات (نسخة مبسّطة بدون فلاتر في URL)

document.addEventListener("commonLoaded", () => {
  const areaNameEl = document.getElementById("areaName");
  const areaDescEl = document.getElementById("areaDescription");
  const areaImgEl  = document.getElementById("areaImage");
  const gridEl     = document.getElementById("product-grid-container");

  // ===== Helpers =====
  const getUrlParam = (k) => new URLSearchParams(location.search).get(k);

  const getMediaUrl = (mediaLike) => {
    if (!mediaLike) return "";
    const a = (mediaLike.data && mediaLike.data.attributes) || mediaLike.attributes || mediaLike;
    return a && a.url ? `${window.strapiBaseUrl}${a.url}` : "";
  };

  const setActiveNavLink = () => {
    const links = document.querySelectorAll(".nav-links ul li a");
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "products.html")
    );
  };

  // ===== لغة الموقع =====
  const setLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("merta-lang", lang);
    window.populateStaticText(lang);
    loadArea(lang);
  };

  const langToggleBtn = document.getElementById("lang-toggle-btn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const cur = document.documentElement.lang || "ar";
      setLanguage(cur === "ar" ? "en" : "ar");
    });
  }

  // ===== تحميل المجال + المنتجات من Strapi (بدون فلاتر) =====
  async function loadArea(lang) {
    const slugFromUrl = getUrlParam("slug");
    if (!slugFromUrl) {
      areaNameEl.textContent =
        lang === "ar" ? "خطأ: لم يتم تحديد المجال." : "Error: Area not specified.";
      gridEl.innerHTML = "";
      return;
    }

    try {
      areaNameEl.textContent = lang === "ar" ? "جاري تحميل المجال..." : "Loading area...";
      areaDescEl.innerHTML = "";
      areaImgEl.style.display = "none";
      gridEl.innerHTML = `<p>${lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}</p>`;

      // ناخد كل المجالات ونفلتر في الفرونت إند
      const url =
        `${window.strapiBaseUrl}/api/therapeutic-areas` +
        `?locale=${encodeURIComponent(lang)}` +
        `&populate[arealImage][fields][0]=url` +
        `&populate[areaImage][fields][0]=url` +
        `&populate[products][populate][productImage][fields][0]=url` +
        `&pagination[pageSize]=100`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const allAreas = (json.data || []).map((item) => window.getData(item));
      const slugLower = String(slugFromUrl).toLowerCase();

      const area =
        allAreas.find((a) => (a.slug || "").toLowerCase() === slugLower) || null;

      if (!area) {
        areaNameEl.textContent =
          lang === "ar" ? "المجال غير موجود." : "Area not found.";
        gridEl.innerHTML = "";
        return;
      }

      // ===== عرض بيانات المجال =====
      const name =
        area.areaName || (lang === "ar" ? "مجال علاجي" : "Therapeutic Area");
      document.title = `${name} | Merta Pharma`;
      areaNameEl.textContent = name;

      areaDescEl.innerHTML =
        window.renderStrapiBlocks(area.areaDescription) || "";

      const headerImg = getMediaUrl(area.arealImage || area.areaImage);
      if (headerImg) {
        areaImgEl.src = headerImg;
        areaImgEl.alt = name;
        areaImgEl.style.display = "block";
      }

      // ===== عرض كروت المنتجات =====
      const productsRaw = area.products;
      const products = Array.isArray(productsRaw)
        ? productsRaw
        : productsRaw?.data || [];

      renderProducts(products, lang);
      setActiveNavLink();
    } catch (err) {
      console.error("Area load error:", err);
      areaNameEl.textContent =
        lang === "ar" ? "حدث خطأ أثناء تحميل الصفحة." : "An error occurred.";
      gridEl.innerHTML = "";
    }
  }

  function renderProducts(list, lang) {
    if (!gridEl) return;

    if (!list.length) {
      gridEl.innerHTML =
        lang === "ar"
          ? "<p>لا توجد منتجات حاليًا في هذا المجال.</p>"
          : "<p>No products in this area yet.</p>";
      return;
    }

    gridEl.innerHTML = "";
    list.forEach((item) => {
      const p = window.getData(item);
      const name =
        p.productName || (lang === "ar" ? "منتج" : "Product");
      const short = p.productShortDescription
        ? `<p>${p.productShortDescription}</p>`
        : "";
      const img = getMediaUrl(p.productImage);
      const slug = p.slug || `product-${item.id}`;
      const more = lang === "ar" ? "المزيد →" : "More →";

      const html = `
        <div class="product-card">
          <img src="${
            img ||
            "https://via.placeholder.com/640x360/FFFFFF/CCCCCC?text=Product"
          }" alt="${name}">
          <div class="product-card-content">
            <h3>${name}</h3>
            <div class="short">${short}</div>
            <a class="details-link" href="product.html?slug=${encodeURIComponent(
              slug
            )}">${more}</a>
          </div>
        </div>`;
      gridEl.insertAdjacentHTML("beforeend", html);
    });
  }

  // البداية
  const savedLang = localStorage.getItem("merta-lang") || "ar";
  setLanguage(savedLang);
});
