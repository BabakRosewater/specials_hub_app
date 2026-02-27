(function () {
  const HERO_EL = document.getElementById("hero");
  const CONTENT_EL = document.getElementById("content");
  const FOOTER_EL = document.getElementById("footer");
  const PRINT_FOOTER_EL = document.getElementById("printFooter");

  const safe = (v) => String(v ?? "");
  const esc = (s) =>
    safe(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const money = (v) => esc(v);

  async function loadData() {
    const res = await fetch("data/specials.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load specials.json (${res.status})`);
    return await res.json();
  }

  function renderHero(meta, navCards) {
    const cards = (navCards || []).map((c) => `
      <a href="${esc(c.href)}"
         class="bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 ${esc(c.hoverBorder || "")}
                p-8 rounded-3xl transition-all duration-300 card-hover group text-left flex flex-col h-full shadow-xl">
        <div class="${esc(c.iconColor || "text-blue-400")} mb-5 text-4xl"><i class="${esc(c.iconClass)}"></i></div>
        <h3 class="text-2xl font-bold text-white mb-3 group-hover:opacity-90 transition-colors">${esc(c.title)}</h3>
        <p class="text-sm text-slate-400 mb-8 flex-grow leading-relaxed">${esc(c.desc)}</p>
        <div class="${esc(c.ctaColor || "text-blue-300")} text-xs font-bold uppercase tracking-widest mt-auto flex items-center">
          ${esc(c.cta)} <i class="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>
    `).join("");

    HERO_EL.innerHTML = `
      <header class="relative bg-[#0b1220] pt-24 pb-20 no-print overflow-hidden border-b-[6px] border-[#002c5f]">
        <div class="absolute inset-0 bg-gradient-to-br from-[#002c5f]/40 to-transparent pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div class="inline-block bg-[#002c5f] border border-blue-500/30 text-blue-200 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            ${esc(meta.badge || "")}
          </div>
          <h1 class="text-5xl md:text-7xl font-900 text-white leading-tight mb-6 tracking-tighter">
            ${esc(meta.titleTop || "")} <br class="md:hidden">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">${esc(meta.titleAccent || "")}</span>
          </h1>
          <p class="text-xl text-slate-300 font-light mb-12 max-w-3xl mx-auto">
            ${esc(meta.subtitle || "")}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            ${cards}
          </div>
        </div>
      </header>
    `;
  }

  function sectionShell({ id, bg = "", noPrint = true, inner }) {
    const np = noPrint ? "no-print" : "";
    return `<section id="${esc(id)}" class="py-20 ${esc(bg)} border-t border-gray-200 scroll-mt-10 ${np}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">${inner}</div>
    </section>`;
  }

  function renderHeaderBlock(s) {
    const kicker = s.kicker?.text
      ? `<div class="inline-block ${esc(s.kicker.class || "bg-gray-200 text-gray-700")} px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">${esc(s.kicker.text)}</div>`
      : "";
    return `
      <div class="text-center mb-16">
        ${kicker}
        <h2 class="text-4xl font-800 text-[#002c5f] mb-4">${esc(s.title || "")}</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">${esc(s.subtitle || "")}</p>
      </div>
    `;
  }

  function renderFinePrint(s) {
    if (!s.disclaimer) return "";
    const [head, ...rest] = s.disclaimer.split(":");
    return `<div class="mt-12 text-[10px] text-gray-500 uppercase leading-relaxed text-justify"><strong>${esc(head || "DISCLAIMER")}:</strong> ${esc(rest.join(":").trim())}</div>`;
  }

  function renderFinanceSection(s) {
    const cards = (s.cards || []).map((c) => `
      <div class="bg-white rounded-3xl overflow-hidden shadow-md border-t-4 ${esc(c.topBorder || "border-blue-500")}
                  transition-all duration-300 card-hover flex flex-col h-full">
        <div class="p-8 flex-grow flex flex-col">
          <div class="flex justify-between items-start mb-6">
            <div>
              ${c.tag?.text ? `<div class="text-[10px] font-bold uppercase tracking-widest ${esc(c.tag.class || "text-gray-500")} mb-2">${esc(c.tag.text)}</div>` : ""}
              <h3 class="text-2xl font-bold text-[#002c5f] leading-tight">${esc(c.title)}</h3>
            </div>
          </div>

          <div class="bg-blue-50 rounded-2xl p-6 mb-6 text-center border border-blue-100">
            <div class="text-sm font-bold text-blue-800 uppercase tracking-widest mb-2">Special Finance Rate</div>
            <div class="text-5xl font-900 text-[#002c5f] tracking-tighter">${esc(c.rate?.apr || "0%")}
              <span class="text-xl font-bold">APR</span></div>
            <div class="text-sm text-blue-600 font-medium mt-1">${esc(c.rate?.term || "")}</div>
          </div>

          <div class="space-y-4 mb-8 flex-grow">
            ${(c.bullets || []).map((b) => `
              <div class="flex items-start">
                <i class="${esc(b.icon || "fas fa-check-circle text-green-500")} mt-1 mr-3"></i>
                <div>
                  <div class="font-bold text-gray-900">${esc(b.title || "")}</div>
                  <div class="text-xs text-gray-500">${esc(b.note || "")}</div>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="mt-auto">
            <a href="${esc(c.cta?.href || "#")}" target="_blank"
               class="block w-full text-center bg-transparent border-2 border-[#002c5f] text-[#002c5f] py-3 rounded-xl text-sm font-bold hover:bg-[#002c5f] hover:text-white transition-colors">
              ${esc(c.cta?.label || "Shop Inventory")}
            </a>
          </div>
        </div>
      </div>
    `).join("");

    const ctaCard = s.ctaCard ? `
      <div class="bg-[#002c5f] text-white rounded-3xl overflow-hidden shadow-md border-t-4 border-yellow-400 transition-all duration-300 card-hover flex flex-col h-full justify-center items-center p-8 text-center">
        <i class="${esc(s.ctaCard.icon || "fas fa-search-dollar")} text-6xl text-yellow-400 mb-6 mt-4"></i>
        <h3 class="text-2xl font-bold mb-4 leading-tight">${esc(s.ctaCard.title || "")}</h3>
        <p class="text-blue-200 mb-8 text-sm flex-grow">${esc(s.ctaCard.desc || "")}</p>
        <a href="${esc(s.ctaCard.href || "#")}" target="_blank"
           class="bg-yellow-400 text-[#002c5f] px-8 py-4 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors shadow-lg w-full mt-auto">
          ${esc(s.ctaCard.button || "Shop All")}
        </a>
      </div>
    ` : "";

    return sectionShell({
      id: s.id,
      bg: s.bg || "bg-gray-100",
      noPrint: !!s.noPrint,
      inner: `${renderHeaderBlock(s)}<div class="${esc(s.gridClass || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8")}">${cards}${ctaCard}</div>${renderFinePrint(s)}`
    });
  }

  function renderLeaseGrid(s) {
    const cards = (s.cards || []).map((c) => `
      <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 card-hover flex flex-col h-full">
        <div class="relative h-48">
          <img src="${esc(c.img)}" alt="${esc(c.imgAlt || c.title)}" class="w-full h-full object-cover">
          ${(c.badges || []).map((b, idx) => `
            <div class="absolute top-4 ${idx === 0 ? "left-4" : "right-4"} ${esc(b.class)} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">${esc(b.text)}</div>
          `).join("")}
        </div>
        <div class="p-6 flex-grow flex flex-col">
          <h3 class="text-lg font-bold text-[#002c5f] mb-1 leading-tight">${esc(c.title)}</h3>
          <p class="text-xs text-gray-500 mb-4">${esc(c.sub || "")}</p>

          <div class="flex-grow">
            <div class="space-y-2 mb-6 text-xs">
              ${(c.lines || []).map((ln) => `
                <div class="flex justify-between border-b border-gray-50 pb-1 ${esc(ln.class || "text-gray-600")}">
                  <span>${esc(ln.label)}</span><span class="${ln.class ? "" : "font-medium"}">${money(ln.value)}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="mt-auto">
            <div class="text-center py-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
              <div class="text-xs text-blue-800 font-bold uppercase tracking-widest mb-1">Monthly Payment</div>
              <div class="text-4xl font-900 text-[#002c5f] tracking-tighter payment-text">
                $${esc(c.payment?.dollars || "")}<span class="text-lg font-bold">.${esc(c.payment?.cents || "00")}</span>
              </div>
            </div>
            <a href="${esc(c.href)}" target="_blank"
               class="block w-full text-center bg-[#002c5f] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#0072bc] transition-colors">
              View Details
            </a>
          </div>
        </div>
      </div>
    `).join("");

    const infoCard = s.infoCard ? `
      <div class="bg-[#002c5f] text-white rounded-3xl overflow-hidden shadow-sm border-t-4 border-green-400 transition-all duration-300 card-hover flex flex-col h-full justify-center p-6 ${esc(s.infoCard.className || "")}">
        <div class="text-center mb-6 mt-4">
          <div class="bg-blue-800/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <i class="${esc(s.infoCard.icon || "fas fa-sync-alt")} text-2xl text-green-400"></i>
          </div>
          <h3 class="text-xl font-bold mb-2 leading-tight">${esc(s.infoCard.title || "")}</h3>
          <p class="text-blue-200 text-xs px-2">${esc(s.infoCard.desc || "")}</p>
        </div>
        <div class="space-y-4 mb-8 text-sm px-2 flex-grow">
          ${(s.infoCard.bullets || []).map((b) => `
            <div class="flex items-start">
              <i class="${esc(b.icon)} mt-1 mr-3 text-base"></i>
              <span><strong>${esc(b.title)}</strong><br><span class="text-blue-200 text-xs">${esc(b.note)}</span></span>
            </div>
          `).join("")}
        </div>
        <div class="mt-auto">
          <a href="${esc(s.infoCard.href || "#")}" target="_blank" class="bg-green-400 text-[#002c5f] px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors w-full block text-center shadow-lg">
            ${esc(s.infoCard.button || "Learn More")}
          </a>
        </div>
      </div>
    ` : "";

    return `
      <section id="${esc(s.id)}" class="py-20 ${esc(s.bg || "")} ${s.noPrint ? "no-print" : ""}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-10">
          ${renderHeaderBlock(s)}
          <div class="${esc(s.gridClass || "")}">${cards}${infoCard}</div>
          ${renderFinePrint(s)}
        </div>
      </section>
    `;
  }

  function renderPurchaseGrid(s) {
    const cards = (s.cards || []).map((c) => `
      <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 card-hover flex flex-col h-full">
        <div class="relative h-60">
          <img src="${esc(c.img)}" alt="${esc(c.imgAlt || c.title)}" class="w-full h-full object-cover">
          ${(c.badges || []).map((b, idx) => `<div class="absolute top-4 ${idx === 0 ? "left-4" : "right-4"} ${esc(b.class)} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">${esc(b.text)}</div>`).join("")}
        </div>
        <div class="p-8 flex-grow flex flex-col">
          <h3 class="text-xl font-bold text-[#002c5f] mb-4">${esc(c.title)}</h3>
          <div class="flex-grow">
            <div class="space-y-2 mb-6 text-sm">
              ${(c.lines || []).map((ln) => `
                <div class="flex justify-between border-b border-gray-50 pb-1 ${esc(ln.class || "")}">
                  <span class="${esc(ln.labelClass || "text-gray-500")}">${esc(ln.label)}</span>
                  <span class="${esc(ln.valueClass || "font-semibold text-gray-900")}">${money(ln.value)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="mt-auto">
            <div class="flex justify-between pt-2 border-t border-gray-100 mb-4">
              <span class="font-bold text-[#002c5f]">${esc(c.priceLabel || "BEST Price Promise")}</span>
              <span class="font-semibold text-[#0072bc] text-lg">${esc(c.bestPrice || "")}</span>
            </div>
            <div class="text-center bg-blue-50 py-3 rounded-xl border border-blue-100">
              <span class="text-lg font-900 text-blue-700 uppercase tracking-tight">TOTAL SAVINGS: ${esc(c.savings || "")}</span>
            </div>
          </div>
        </div>
        <div class="p-8 bg-gray-50 mt-auto">
          <a href="${esc(c.href)}" target="_blank" class="block w-full text-center bg-[#002c5f] text-white py-4 rounded-xl font-bold hover:bg-[#0072bc] transition-colors">View Details</a>
        </div>
      </div>
    `).join("");

    return `
      <section id="${esc(s.id)}" class="py-20 border-t border-gray-200 scroll-mt-10 ${s.noPrint ? "no-print" : ""}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          ${renderHeaderBlock(s)}
          <div class="${esc(s.gridClass || "")}">${cards}</div>
          ${renderFinePrint(s)}
        </div>
      </section>
    `;
  }

  function renderServiceCoupons(s) {
    const btns = (s.buttons || []).map((b) => {
      if (b.action === "print") {
        return `<button id="btnPrint" class="${esc(b.class)} px-6 py-3 rounded-xl font-bold transition-all text-sm border border-gray-300">${b.icon ? `<i class="${esc(b.icon)} mr-2"></i>` : ""}${esc(b.label)}</button>`;
      }
      return `<a href="${esc(b.href)}" target="_blank" class="${esc(b.class)} px-6 py-3 rounded-xl font-bold transition-all shadow-lg text-sm">${esc(b.label)}</a>`;
    }).join("");

    const coupons = (s.coupons || []).map((c) => `
      <div class="coupon-card ${esc(c.cardClass || "bg-white border border-slate-200")} rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div class="${esc(c.headerClass || "bg-blue-50 border-b border-blue-100 text-[#002c5f]")} px-6 py-4 uppercase tracking-widest text-[10px] font-black">${esc(c.kicker || "")}</div>
        <div class="p-8 flex-grow">
          <h4 class="text-3xl font-black ${esc(c.titleClass || "text-slate-900")} mb-2 leading-tight">${esc(c.title || "")}</h4>
          ${c.list && c.list.length ? `<ul class="${esc(c.listClass || "text-slate-800 text-sm font-black")} space-y-1 mb-4">${c.list.map((i) => `<li>• ${esc(i)}</li>`).join("")}</ul>` : `<p class="${esc(c.descClass || "text-slate-600")} mb-6 text-sm">${esc(c.desc || "")}</p>`}
          ${c.finePrint ? `<p class="text-[10px] leading-relaxed ${esc(c.finePrintClass || "text-slate-400")} italic">${esc(c.finePrint)}</p>` : ""}
        </div>
        <div class="${esc(c.footerClass || "bg-[#002c5f]")} p-4 flex justify-between items-center">
          <span class="${esc(c.footerPrimaryClass || "text-white")} font-bold text-xs">PROMO: ${esc(c.code || "")}</span>
          <span class="${esc(c.footerSecondaryClass || "text-blue-200")} text-[10px]">${esc(c.expires ? `Expires ${c.expires}` : c.expiryLabel || "")}</span>
        </div>
      </div>
    `).join("");

    const advisors = (s.advisors || []).map((a) => `
      <div class="text-center group">
        <div class="relative mb-4 mx-auto w-48">
          <div class="absolute inset-0 bg-[#002c5f] rounded-2xl ${esc(a.backdropTransform || "rotate-3")} scale-105 group-hover:rotate-0 transition-transform duration-300"></div>
          <img src="${esc(a.img)}" alt="${esc(a.name)}" class="relative z-10 w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl">
        </div>
        <h4 class="text-xl font-black text-slate-900 uppercase tracking-tight">${esc(a.name)}</h4>
        <p class="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">${esc(a.role)}</p>
        <div class="mt-4 flex justify-center gap-3 text-nowrap">
          <a href="${esc(a.scheduleHref)}" target="_blank" class="text-slate-900 font-black text-[10px] uppercase border-b-2 border-blue-600 pb-0.5">Schedule ↗</a>
          <a href="tel:${esc(a.tel)}" class="text-slate-900 font-black text-[10px] uppercase border-b-2 border-slate-300 pb-0.5">Call ${esc(a.phone)}</a>
        </div>
      </div>
    `).join("");

    const faq = (s.faq || []).map((f) => `
      <div>
        <h4 class="text-lg font-black text-slate-900 mb-2">${esc(f.q)}</h4>
        <p class="text-slate-600 text-sm leading-relaxed">${esc(f.a)}</p>
      </div>
    `).join("");

    const testimonials = (s.testimonials || []).map((t) => `
      <div class="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
        <div>
          <div class="flex text-yellow-400 mb-3 space-x-0.5">${"<i class='fas fa-star text-sm'></i>".repeat(5)}</div>
          <p class="text-white font-medium italic mb-4 leading-relaxed text-sm">"${esc(t.quote)}"</p>
        </div>
        <div class="border-t border-white/10 pt-4 mt-auto">
          <div class="font-bold text-blue-300 text-xs uppercase tracking-wider">${esc(t.author)}</div>
          <div class="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">${esc(t.meta)}</div>
        </div>
      </div>
    `).join("");

    return `
      <section id="${esc(s.id)}" class="py-20 bg-slate-50 border-t border-gray-200 scroll-mt-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16 no-print">
            <h2 class="text-4xl font-800 text-[#002c5f] mb-4">${esc(s.title || "")}</h2>
            <p class="text-gray-600 max-w-2xl mx-auto text-lg mb-2">${esc(s.subtitleTop || "")}</p>
            <p class="text-gray-500 max-w-2xl mx-auto text-sm">${esc(s.subtitle || "")}</p>
            <div class="mt-6 flex justify-center gap-4 flex-wrap">${btns}</div>
          </div>

          <div class="${esc(s.couponsGridClass || "")}">${coupons}</div>

          <div class="no-print mb-16 px-4">
            <div class="text-center mb-10">
              <h2 class="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Local Team</h2>
              <h3 class="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Meet Your Service Advisors</h3>
              <p class="text-slate-500 mt-4 max-w-lg mx-auto font-medium">${esc(s.advisorsSubtitle || "Friendly faces. Clear answers. Quality work.")}</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">${advisors}</div>
          </div>

          <div class="no-print bg-white rounded-3xl p-8 md:p-12 mb-16 border border-slate-200 shadow-sm max-w-5xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 class="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Helpful Info</h2>
                <h3 class="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Frequently Asked Questions</h3>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a href="${esc(s.faqPrimaryCta?.href || "#")}" target="_blank" class="bg-[#0b1220] text-white px-6 py-3 rounded-xl font-bold text-sm text-center">${esc(s.faqPrimaryCta?.label || "Schedule Online")}</a>
                <a href="${esc(s.faqSecondaryCta?.href || "#")}" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm text-center">${esc(s.faqSecondaryCta?.label || "Call")}</a>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">${faq}</div>
          </div>

          <div class="no-print bg-[#002c5f] text-white rounded-3xl p-8 md:p-12 max-w-7xl mx-auto shadow-md">
            <div class="text-center mb-10">
              <h2 class="text-sm font-bold text-blue-300 uppercase tracking-widest mb-2">Verified Reviews</h2>
              <h3 class="text-3xl font-black uppercase tracking-tight leading-none">What Our Customers Say</h3>
              <div class="h-1.5 w-24 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${testimonials}</div>
          </div>

          ${renderFinePrint(s)}
        </div>
      </section>
    `;
  }

  function renderCtaSplit(s) {
    return `
      <section class="py-20 bg-blue-600 text-white ${s.noPrint ? "no-print" : ""}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-4xl font-800 mb-8 leading-tight">${esc(s.title)}</h2>
              <div class="space-y-6">
                ${(s.cards || []).map((c) => `
                  <a href="${esc(c.href || "#")}" ${c.href ? 'target="_blank"' : ""} class="flex items-center p-6 ${esc(c.className || "bg-white/10 rounded-2xl hover:bg-white/20")} transition-all group">
                    <div class="${esc(c.iconWrap || "bg-[#002c5f]")} p-4 rounded-xl mr-6">
                      <i class="${esc(c.icon || "fas fa-file-invoice-dollar")} text-xl ${esc(c.iconColor || "text-yellow-400")}"></i>
                    </div>
                    <div>
                      <h4 class="text-xl font-bold">${esc(c.title)}</h4>
                      <p class="text-blue-100">${esc(c.desc)}</p>
                    </div>
                    ${c.chevron ? '<i class="fas fa-chevron-right ml-auto group-hover:translate-x-2 transition-transform"></i>' : ""}
                  </a>
                `).join("")}
              </div>
            </div>
            <div class="relative hidden md:block">
              <img src="${esc(s.image?.src || "")}" alt="${esc(s.image?.alt || "")}" class="rounded-3xl shadow-2xl relative z-10">
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderFooter(footer) {
    const md = (footer.masterDisclaimer || []).map((p) => {
      const [head, ...rest] = p.split(":");
      return `<p><strong>${esc(head || "")}</strong>${rest.length ? `: ${esc(rest.join(":").trim())}` : ""}</p>`;
    }).join("");

    const phones = (footer.dealer?.phones || []).map((p) => `
      <div>
        <div class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">${esc(p.label)}</div>
        <a href="tel:${esc(p.tel)}" class="text-lg font-black text-blue-400 hover:underline">${esc(p.display)}</a>
      </div>
    `).join("");

    FOOTER_EL.innerHTML = `
      <section class="py-12 bg-gray-800 text-gray-300 no-print">
        <div class="max-w-7xl mx-auto px-4 text-[10px] leading-relaxed text-justify uppercase font-medium space-y-4">${md}</div>
      </section>

      <footer class="bg-[#0b1220] py-12 text-center no-print">
        <div class="max-w-7xl mx-auto px-4">
          <h5 class="text-2xl font-black text-white uppercase tracking-tighter">${esc(footer.dealer?.name || "")}</h5>
          <p class="text-slate-400 mt-2 font-bold">${esc(footer.dealer?.address || "")}</p>
          <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-y border-white/10 py-8">${phones}</div>
          <div class="mt-8 text-slate-500 text-sm">
            <span class="font-bold">Service Hours:</span> ${esc(footer.dealer?.serviceHours || "")}<br>
            <span class="text-xs mt-4 block">${esc(footer.dealer?.copyright || "")}</span>
          </div>
        </div>
      </footer>
    `;
  }

  function wirePrintButton() {
    const btn = document.getElementById("btnPrint");
    if (btn) btn.addEventListener("click", () => window.print());
  }

  async function init() {
    try {
      const data = await loadData();
      renderHero(data.meta || {}, data.navCards || []);

      const html = (data.sections || []).map((s) => {
        if (s.type === "finance") return renderFinanceSection(s);
        if (s.type === "leaseGrid") return renderLeaseGrid(s);
        if (s.type === "purchaseGrid") return renderPurchaseGrid(s);
        if (s.type === "serviceCoupons") return renderServiceCoupons(s);
        if (s.type === "ctaSplit") return renderCtaSplit(s);
        return "";
      }).join("");

      CONTENT_EL.innerHTML = html;
      renderFooter(data.footer || {});

      if (PRINT_FOOTER_EL && data.sections) {
        const svc = data.sections.find((x) => x.type === "serviceCoupons");
        PRINT_FOOTER_EL.textContent = svc?.printFooter || "";
      }

      wirePrintButton();
    } catch (err) {
      console.error(err);
      CONTENT_EL.innerHTML = `
        <div class="max-w-3xl mx-auto py-24 px-6">
          <div class="bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
            <h1 class="text-2xl font-black text-slate-900 mb-2">Specials Hub Error</h1>
            <p class="text-slate-600 mb-4">Could not load <code>data/specials.json</code>. This page must be served from a web server (not opened as a local file).</p>
            <pre class="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto">${esc(err.message)}</pre>
          </div>
        </div>
      `;
    }
  }

  init();
})();
