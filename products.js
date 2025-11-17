// products.js — نسخة محدثة
// - لو في slug => يعرض منتجات المجال
// - لو مفيش slug => يعرض كل المنتجات

document.addEventListener('commonLoaded', () => {
  const grid = document.getElementById('area-grid-container');
  const pageTitle = document.getElementById('pageTitle');
  const productsGrid = document.getElementById('product-grid-container');
  const productsTitle = document.getElementById('productsSectionTitle');

  const getUrlParam = (key) => new URLSearchParams(window.location.search).get(key);

  const setLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    localStorage.setItem('merta-lang', lang);
    window.populateStaticText(lang);
    loadData(lang);
  };

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.lang || 'ar';
      setLanguage(current === 'ar' ? 'en' : 'ar');
    });
  }

  const imgUrl = (media) => {
    if (!media) return '';
    let data = media.data ?? media;
    if (Array.isArray(data)) {
      if (!data.length) return '';
      data = data[0];
    }
    const attrs = data.attributes || data;
    return attrs && attrs.url ? `${window.strapiBaseUrl}${attrs.url}` : '';
  };

  function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-links ul li a');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === 'products.html');
    });
  }

  // === عرض كروت المنتجات ===
  function renderProductCards(list, lang) {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    list.forEach((attr) => {
      if (!attr) return;

      let imgSrc = imgUrl(attr.productImage);
      if (!imgSrc) {
        imgSrc = "https://placehold.co/600x400/white/lightgray?text=Product";
      }
      const name = attr.productName || (lang === 'ar' ? 'منتج' : 'Product');
      const short = attr.productShortDescription || '';
      const slug = attr.slug || `product-${attr.id}`;
      const moreText = lang === 'ar' ? 'المزيد →' : 'More →';

      const cardHtml = `
        <div class="product-card">
          <div class="product-thumb">
            <img src="${imgSrc}" alt="${name}">
          </div>
          <div class="product-card-content">
            <h3>${name}</h3>
            <div class="short"><p>${short}</p></div>
            <a href="product.html?slug=${encodeURIComponent(slug)}"
               class="details-link">${moreText}</a>
          </div>
        </div>
      `;
      productsGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
  }

  // === منتجات مجال معيّن ===
  function renderProductsForArea(area, allProducts, lang) {
    if (!productsGrid || !area) return;

    const list = allProducts.filter(p => {
      if (!p) return false;

      const relation = p.therapeutic_area;
      if (!relation) return false;

      // ممكن تكون جوه data أو مباشرة
      let relData = relation.data ?? relation;

      // أكتر من مجال
      if (Array.isArray(relData)) {
        return relData.some(a => a.id === area.id);
      }

      // مجال واحد
      return relData.id === area.id;
    });

    console.log(`Filtering for Area ID: ${area.id} (${area.areaName})`);
    console.log(`Found ${list.length} matching products:`, list);

    if (!list.length) {
      productsGrid.innerHTML = `<p>${
        lang === 'ar'
          ? 'لا توجد منتجات لهذا المجال حالياً.'
          : 'No products for this area yet.'
      }</p>`;
      if (productsTitle) productsTitle.textContent = '';
      return;
    }

    if (productsTitle) {
      productsTitle.textContent = lang === 'ar'
        ? `منتجات مجال ${area.areaName || ''}`
        : `${area.areaName || ''} Products`;
    }

    renderProductCards(list, lang);
  }

  // === كل المنتجات بدون فلترة ===
  function renderAllProducts(allProducts, lang) {
    if (!productsGrid) return;

    if (!allProducts.length) {
      productsGrid.innerHTML = `<p>${
        lang === 'ar'
          ? 'لا توجد منتجات متاحة حالياً.'
          : 'No products available yet.'
      }</p>`;
      if (productsTitle) productsTitle.textContent = '';
      return;
    }

    if (productsTitle) {
      productsTitle.textContent = (lang === 'ar') ? 'كل المنتجات' : 'All Products';
    }

    renderProductCards(allProducts, lang);
  }

  async function loadData(lang) {
    try {
      if (pageTitle) pageTitle.textContent =
        (lang === 'ar') ? 'المجالات العلاجية' : 'Therapeutic Areas';
      if (grid) grid.innerHTML =
        `<p>${(lang === 'ar') ? 'جاري تحميل المجالات...' : 'Loading areas...'}</p>`;
      if (productsGrid) {
        productsGrid.innerHTML = '';
        if (productsTitle) productsTitle.textContent = '';
      }

      const areasUrl = `${window.strapiBaseUrl}/api/therapeutic-areas` +
        `?locale=${encodeURIComponent(lang)}` +
        `&populate[areaImage][fields][0]=url`;

      const productsUrl = `${window.strapiBaseUrl}/api/products` +
        `?locale=${encodeURIComponent(lang)}` +
        `&pagination[limit]=100` +
        `&populate[0]=productImage` +
        `&populate[1]=therapeutic_area`;

      const [areasRes, productsRes] = await Promise.all([
        fetch(areasUrl),
        fetch(productsUrl)
      ]);

      if (!areasRes.ok) throw new Error(`Failed to fetch areas: ${areasRes.status}`);
      if (!productsRes.ok) throw new Error(`Failed to fetch products: ${productsRes.status}`);

      const areasJson = await areasRes.json();
      const productsJson = await productsRes.json();

      const areas = (areasJson.data || []).map(item => window.getData(item));
      const allProducts = (productsJson.data || []).map(item => window.getData(item));

      console.log("AREAS FETCHED:", areas);
      console.log("ALL PRODUCTS FETCHED (after getData):", allProducts);

      if (!areas.length) {
        if (grid) grid.innerHTML =
          (lang === 'ar') ? '<p>لا توجد مجالات.</p>' : '<p>No areas available.</p>';
        renderAllProducts(allProducts, lang);
        return;
      }

      // نحدد المجال الحالي لو فيه slug في الـ URL
      const slugParam = getUrlParam('slug');
      const slugLower = slugParam ? String(slugParam).toLowerCase() : null;
      let currentArea = null;
      if (slugLower) {
        currentArea = areas.find(a => (a.slug || '').toLowerCase() === slugLower) || null;
      }

      // نخلي orthopedic أول واحد دايمًا
      const slugTarget = 'orthopedic';
      const orderedAreas = [...areas].sort((a, b) => {
        const aIsTarget = (a.slug || '').toLowerCase() === slugTarget;
        const bIsTarget = (b.slug || '').toLowerCase() === slugTarget;
        if (aIsTarget && !bIsTarget) return -1;
        if (!aIsTarget && bIsTarget) return 1;
        return 0;
      });

      // رسم كروت المجالات
      grid.innerHTML = '';
      orderedAreas.forEach((area) => {
        const name = area.areaName || (lang === 'ar' ? 'مجال علاجي' : 'Therapeutic Area');
        const media = area.arealImage || area.areaImage || null;
        const urlImg = imgUrl(media);
        const slug = area.slug || '';
        const descHtml = window.renderStrapiBlocks
          ? window.renderStrapiBlocks(area.areaDescription)
          : '';
        const isActive = currentArea && currentArea.slug === area.slug;

        const cardHtml = `
          <a href="products.html?slug=${encodeURIComponent(slug)}"
             class="area-card${isActive ? ' is-active' : ''}"
             data-slug="${slug}">
            <img src="${urlImg || 'https://via.placeholder.com/600x250'}" alt="${name}">
            <div class="area-card-content">
              <h2>${name}</h2>
              <div class="desc-preview">${descHtml}</div>
              <span class="view-products-link">
                ${lang === 'ar' ? 'عرض المنتجات →' : 'View products →'}
              </span>
            </div>
          </a>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
      });

      // لو في slug → فلترة، لو مفيش → كل المنتجات
      if (currentArea) {
        renderProductsForArea(currentArea, allProducts, lang);
      } else {
        renderAllProducts(allProducts, lang);
      }

      // كليك على كروت المجالات
      grid.querySelectorAll('.area-card').forEach(card => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const slug = card.getAttribute('data-slug');
          const selected = orderedAreas.find(a => a.slug === slug);
          if (!selected) return;

          grid.querySelectorAll('.area-card').forEach(c => c.classList.remove('is-active'));
          card.classList.add('is-active');

          const urlObj = new URL(window.location.href);
          urlObj.searchParams.set('slug', slug);
          window.history.replaceState({}, '', urlObj.toString());

          renderProductsForArea(selected, allProducts, lang);
        });
      });

      setActiveNavLink();
    } catch (e) {
      console.error('Fatal Error:', e);
      if (grid) {
        grid.innerHTML = (lang === 'ar')
          ? `<p style="color:red;text-align:center">حدث خطأ: ${e.message}</p>`
          : `<p style="color:red;text-align:center">Error: ${e.message}</p>`;
      }
    }
  }

  const savedLang = localStorage.getItem('merta-lang') || 'ar';
  setLanguage(savedLang);
});
