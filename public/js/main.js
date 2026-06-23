/**
 * RideShare Inc — lightweight site interactivity
 * Mobile menu, smooth scroll, form simulation, tab controls, bilingual toggle
 */
(function () {
  "use strict";

  const STRINGS = {
    en: {
      demoSuccess:
        "<strong>Request received!</strong> Our team will contact you within 1 business day.",
      demoSubmitting: "Submitting...",
      demoSubmit: "Submit Request",
      loginError: "Please enter a valid email and password.",
      loginWelcome: "<strong>Welcome back!</strong> Redirecting to your dashboard…",
      loginSigningIn: "Signing in…",
      menuOpen: "Open menu",
      menuClose: "Close menu",
    },
    fr: {
      demoSuccess:
        "<strong>Demande reçue !</strong> Notre équipe vous contactera sous 1 jour ouvré.",
      demoSubmitting: "Envoi en cours…",
      demoSubmit: "Envoyer la demande",
      loginError: "Veuillez saisir une adresse e-mail et un mot de passe valides.",
      loginWelcome:
        "<strong>Bon retour !</strong> Redirection vers votre tableau de bord…",
      loginSigningIn: "Connexion…",
      menuOpen: "Ouvrir le menu",
      menuClose: "Fermer le menu",
    },
  };

  let currentLang = document.body.classList.contains("lang-fr") ? "fr" : "en";

  function t(key) {
    return STRINGS[currentLang]?.[key] || STRINGS.en[key] || key;
  }

  function applyDataLang(lang) {
    document.querySelectorAll("[data-en]").forEach((el) => {
      const text = el.getAttribute(`data-${lang}`);
      if (!text) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
      const ph = el.getAttribute(`data-${lang}-placeholder`);
      if (ph) el.placeholder = ph;
    });
  }

  function applyDriverI18n(lang) {
    if (!window.DRIVER_I18N) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = window.DRIVER_I18N[lang]?.[key];
      if (text) el.textContent = text;
    });
  }

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-fr", lang === "fr");
    document.body.classList.toggle("lang-en", lang === "en");
    try { localStorage.setItem("rider-lang", lang); } catch (e) {}
    applyDataLang(lang);
    applyDriverI18n(lang);

    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuToggle && mobileMenu?.hidden) {
      menuToggle.setAttribute("aria-label", t("menuOpen"));
    }
  }

  function initLanguage() {
    let saved = null;
    try { saved = localStorage.getItem("rider-lang"); } catch (e) {}
    const startLang = saved || (document.body.classList.contains("lang-fr") ? "fr" : "en");
    setLanguage(startLang);

    const langToggle = document.getElementById("lang-toggle");
    langToggle?.addEventListener("click", () => {
      setLanguage(currentLang === "fr" ? "en" : "fr");
    });

    const langToggleMobile = document.getElementById("lang-toggle-mobile");
    langToggleMobile?.addEventListener("click", () => {
      setLanguage(currentLang === "fr" ? "en" : "fr");
    });
  }

  initLanguage();

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  /* ----- Sticky header shadow ----- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Mobile menu toggle ----- */
  function closeMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", t("menuOpen"));
    menuToggle.querySelector(".material-symbols-outlined").textContent = "menu";
    document.body.style.overflow = "";
  }

  function openMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", t("menuClose"));
    menuToggle.querySelector(".material-symbols-outlined").textContent = "close";
    document.body.style.overflow = "hidden";
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      if (mobileMenu.hidden) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  /* ----- Smooth scroll for anchor links ----- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        closeMobileMenu();
      }
    });
  });

  /* ----- Button press feedback ----- */
  document.querySelectorAll("button, .btn").forEach((btn) => {
    btn.addEventListener("mousedown", () => btn.classList.add("is-pressed"));
    btn.addEventListener("mouseup", () => btn.classList.remove("is-pressed"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("is-pressed"));
  });

  /* ----- Demo request form simulation ----- */
  const demoForm = document.getElementById("demo-request-form");
  if (demoForm) {
    const successEl = document.createElement("div");
    successEl.className = "form-success";
    successEl.setAttribute("role", "status");
    successEl.innerHTML = t("demoSuccess");
    demoForm.parentNode.insertBefore(successEl, demoForm.nextSibling);

    demoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!demoForm.checkValidity()) {
        demoForm.reportValidity();
        return;
      }
      const submitBtn = demoForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t("demoSubmitting");
      }
      setTimeout(() => {
        demoForm.reset();
        successEl.classList.add("is-visible");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = t("demoSubmit");
        }
        setTimeout(() => successEl.classList.remove("is-visible"), 6000);
      }, 900);
    });

    demoForm.querySelectorAll("input, select, textarea").forEach((input) => {
      input.addEventListener("focus", () => {
        const label = input.closest("div")?.querySelector("label");
        if (label) label.classList.add("text-secondary");
      });
      input.addEventListener("blur", () => {
        const label = input.closest("div")?.querySelector("label");
        if (label) label.classList.remove("text-secondary");
      });
    });
  }

  /* ----- Tab switcher (pricing + how-it-works) ----- */
  window.switchTab = function switchTab(tabId) {
    const indicator = document.getElementById("tab-indicator");
    if (indicator) {
      const tabs = ["riders", "drivers"];
      tabs.forEach((id, index) => {
        const btn = document.getElementById(`tab-${id}`);
        const content = document.getElementById(`content-${id}`);
        if (!btn || !content) return;
        const isActive = id === tabId;
        btn.classList.toggle("text-secondary", isActive);
        btn.classList.toggle("text-on-surface-variant", !isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        content.classList.toggle("hidden", !isActive);
        content.hidden = !isActive;
        if (isActive) {
          indicator.style.transform = `translateX(${index * 100}%)`;
        }
      });
      return;
    }

    const dataPanels = document.querySelectorAll("[data-tab-panel]");
    const legacyPanels = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");

    if (dataPanels.length) {
      dataPanels.forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== tabId;
      });
    }

    if (legacyPanels.length) {
      legacyPanels.forEach((panel) => {
        const isTarget = panel.id === `content-${tabId}`;
        panel.classList.toggle("hidden", !isTarget);
        panel.classList.toggle("block", isTarget);
        panel.hidden = !isTarget;
      });
    }

    buttons.forEach((btn) => {
      const isActive = btn.id === `tab-${tabId}`;
      btn.classList.toggle("is-active", isActive);
      btn.classList.toggle("bg-white", isActive);
      btn.classList.toggle("shadow-sm", isActive);
      btn.classList.toggle("text-secondary", isActive);
      btn.classList.toggle("text-on-surface-variant", !isActive);
    });
  };

  /* ----- Rider/Driver segmented toggle ----- */
  document.querySelectorAll("[data-segment]").forEach((control) => {
    const segments = control.querySelectorAll("[data-segment-btn]");
    const panels = document.querySelectorAll(`[data-segment-panel="${control.dataset.segment}"]`);

    segments.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.segmentBtn;
        segments.forEach((s) => s.classList.toggle("is-active", s === btn));
        panels.forEach((p) => {
          p.hidden = p.dataset.segmentValue !== value;
        });
      });
    });
  });

  /* ----- FAQ accordion keyboard support ----- */
  document.querySelectorAll(".faq-accordion summary").forEach((summary) => {
    summary.setAttribute("role", "button");
    summary.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        summary.click();
      }
    });
  });

  /* ----- Lazy-load images below fold ----- */
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px" }
    );
    lazyImages.forEach((img) => observer.observe(img));
  }

  /* ----- Wire CTA buttons without href ----- */
  document.querySelectorAll("button").forEach((btn) => {
    const text = btn.textContent.trim().toLowerCase();
    const isDemo =
      text.includes("request") &&
      (text.includes("demo") || text.includes("démo") || text.includes("demander"));
    const isEnterprise =
      text.includes("contact enterprise") || text.includes("contacter le service");
    const isDownload =
      text.includes("download app") ||
      text.includes("télécharger") ||
      text.includes("start your free month") ||
      text.includes("commencer mon mois");
    const isDriverCta =
      text.includes("get started") ||
      text.includes("commencer") ||
      text.includes("download driver") ||
      text.includes("télécharger l'application");
    const isGuide =
      text.includes("view earnings") ||
      text.includes("guide des gains") ||
      text.includes("partner with") ||
      text.includes("devenir partenaire");

    if (isDemo || isEnterprise) {
      btn.addEventListener("click", () => {
        window.location.href = "request-demo.html";
      });
    }
    if (isDownload) {
      btn.addEventListener("click", () => {
        window.location.href = "rider-app.html";
      });
    }
    if (document.body.classList.contains("driver-app-page")) {
      if (isDriverCta) {
        btn.addEventListener("click", () => {
          window.location.href = "request-demo.html";
        });
      }
      if (isGuide) {
        btn.addEventListener("click", () => {
          window.location.href = "pricing.html";
        });
      }
    }
  });

  /* ----- Login page ----- */
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const passInput = document.getElementById("password");
    const passToggle = document.getElementById("password-toggle");
    const errorEl = document.createElement("div");
    errorEl.className = "login-form__error";
    errorEl.setAttribute("role", "alert");
    errorEl.textContent = t("loginError");
    loginForm.insertBefore(errorEl, loginForm.firstChild);

    const successEl = document.createElement("div");
    successEl.className = "form-success";
    successEl.setAttribute("role", "status");
    successEl.innerHTML = t("loginWelcome");
    loginForm.parentNode.insertBefore(successEl, loginForm.nextSibling);

    if (passToggle && passInput) {
      passToggle.addEventListener("click", () => {
        const icon = passToggle.querySelector(".material-symbols-outlined");
        const isHidden = passInput.type === "password";
        passInput.type = isHidden ? "text" : "password";
        if (icon) icon.textContent = isHidden ? "visibility_off" : "visibility";
        passToggle.setAttribute(
          "aria-label",
          isHidden ? "Hide password" : "Show password"
        );
      });
    }

    loginForm.querySelectorAll("input").forEach((input) => {
      const wrapper = input.closest(".relative");
      const icon = wrapper?.querySelector(".material-symbols-outlined:not(.login-form__toggle-pass *)");
      const fieldIcon = wrapper?.querySelector(
        ".material-symbols-outlined:not([id])"
      );
      const targetIcon = fieldIcon || icon;

      input.addEventListener("focus", () => {
        targetIcon?.classList.add("is-focused");
        targetIcon?.style && (targetIcon.style.color = "#0051d5");
      });
      input.addEventListener("blur", () => {
        targetIcon?.classList.remove("is-focused");
        if (targetIcon) targetIcon.style.color = "";
      });
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      errorEl.classList.remove("is-visible");
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        errorEl.classList.add("is-visible");
        return;
      }
      const submitBtn = loginForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t("loginSigningIn");
      }
      setTimeout(() => {
        loginForm.hidden = true;
        successEl.classList.add("is-visible");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }, 800);
    });

    loginForm.querySelectorAll(".login-form__social-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.disabled = true;
        const label = btn.querySelector("span")?.textContent || "Provider";
        btn.querySelector("span").textContent = "Connecting…";
        setTimeout(() => {
          btn.disabled = false;
          btn.querySelector("span").textContent = label;
          successEl.classList.remove("is-visible");
          successEl.innerHTML = `<strong>${label} sign-in simulated.</strong> Connect your OAuth provider in production.`;
          successEl.classList.add("is-visible");
          setTimeout(() => successEl.classList.remove("is-visible"), 4000);
        }, 600);
      });
    });
  }

  /* ----- Driver App page: bento scroll reveal ----- */
  if (document.body.classList.contains("driver-app-page")) {
    const bentoCards = document.querySelectorAll(".driver-bento-card");
    if ("IntersectionObserver" in window && bentoCards.length) {
      const bentoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              bentoObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      bentoCards.forEach((card) => bentoObserver.observe(card));
    } else {
      bentoCards.forEach((card) => card.classList.add("is-visible"));
    }
  }

  /* ----- Login role toggle ----- */
  const toggleRider = document.getElementById("toggle-rider");
  const toggleDriver = document.getElementById("toggle-driver");
  if (toggleRider && toggleDriver) {
    function setActiveRole(activeBtn, inactiveBtn) {
      activeBtn.classList.add("bg-white", "shadow-sm", "text-secondary");
      activeBtn.classList.remove("text-[#64748b]");
      inactiveBtn.classList.remove("bg-white", "shadow-sm", "text-secondary");
      inactiveBtn.classList.add("text-[#64748b]");
    }

    toggleRider.addEventListener("click", () => setActiveRole(toggleRider, toggleDriver));
    toggleDriver.addEventListener("click", () => setActiveRole(toggleDriver, toggleRider));
  }

  /* ----- How It Works page: step scroll reveal ----- */
  if (document.body.classList.contains("how-it-works-page")) {
    const hiwSteps = document.querySelectorAll(".hiw-step");
    if ("IntersectionObserver" in window && hiwSteps.length) {
      const hiwObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              hiwObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
      );
      hiwSteps.forEach((step, i) => {
        step.style.transitionDelay = `${i * 80}ms`;
        hiwObserver.observe(step);
      });
    } else {
      hiwSteps.forEach((step) => step.classList.add("is-visible"));
    }

    document.querySelectorAll(".hiw-tabs button[role='tab']").forEach((btn) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = e.key === "ArrowRight" ? "drivers" : "riders";
          switchTab(next);
          document.getElementById(`tab-${next}`)?.focus();
        }
      });
    });
  }
})();
