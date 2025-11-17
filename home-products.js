// home-products.js — سكشن المنتجات المتحرك في الصفحة الرئيسية
(function () {
  const getMediaUrl = (mediaLike) => {
    if (!mediaLike) return "";
    const a =
      (mediaLike.data && mediaLike.data.attributes) ||
      mediaLike.attributes ||
      mediaLike;
    return a && a.url ? `${window.strapiBaseUrl}${a.url}` : "";
  };

  const updateLabels = (lang) => {
    const titleEl = document.getElementById("homeProductsTitle");
    const moreBtn = document.getElementById("homeProductsMore");

    if (lang === "ar") {
      titleEl.textContent = "منتجاتنا";
      moreBtn.textContent = "استكشف المنتجات";
    } else {
      titleEl.textContent = "Our Products";
      moreBtn.textContent = "View all products";
    }
  };

  async function loadHomeProducts(lang) {
    const track = document.getElementById("homeProductsTrack");
    if (!track) return;

    track.innerHTML = `<p class="muted">${
      lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."
    }</p>`;

    try {
      const url =
        `${window.strapiBaseUrl}/api/products` +
        `?locale=${encodeURIComponent(lang)}` +
        `&populate[productImage][fields][0]=url` +
        `&pagination[pageSize]=20` +
        `&sort[0]=createdAt:desc`;

      const res = await fetch(url);
      const json = await res.json();
      const list = (json.data || []).map((prod) => window.getData(prod));

      track.innerHTML = "";

      list.forEach((raw) => {
        const p = window.getData(raw);

        const name =
          p.productName || (lang === "ar" ? "منتج" : "Product");

        const img = getMediaUrl(p.productImage);
        const short = p.productShortDescription || "";
        const slug = p.slug || "";
        const more = lang === "ar" ? "المزيد →" : "More →";

        const href = slug
          ? `product.html?slug=${encodeURIComponent(slug)}`
          : "#";

        // الشكل الموحد + نسخة الهوم الأكبر
        const cardHtml = `
          <a class="product-card-base product-card-home" href="${href}">
            <div class="thumb">
              <img src="${img}" alt="${name}">
            </div>
            <div class="body">
              <h3>${name}</h3>
              <p>${short}</p>
              <span class="home-product-more">${more}</span>
            </div>
          </a>
        `;

        track.insertAdjacentHTML("beforeend", cardHtml);
      });
    } catch (err) {
      console.error(err);
    }
  }

  function setupCarouselButtons() {
    const track = document.getElementById("homeProductsTrack");
    const prevBtn = document.getElementById("homeProductsPrev");
    const nextBtn = document.getElementById("homeProductsNext");
    if (!track) return;

    const scrollAmount = () => {
      const card = track.querySelector(".product-card-home");
      return card ? card.offsetWidth + 16 : 300;
    };

    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
  }

  const originalPopulate = window.populateStaticText;
  window.populateStaticText = function (lang) {
    if (typeof originalPopulate === "function") originalPopulate(lang);
    updateLabels(lang);
    loadHomeProducts(lang);
  };

  document.addEventListener("commonLoaded", () => {
    const lang =
      localStorage.getItem("merta-lang") ||
      document.documentElement.lang ||
      "ar";

    updateLabels(lang);
    loadHomeProducts(lang);
    setupCarouselButtons();
  });
})();
