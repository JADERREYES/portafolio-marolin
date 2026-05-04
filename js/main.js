const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const backToTopButton = document.querySelector(".back-to-top");
const projectButtons = document.querySelectorAll(".project-button");
const assetLinks = document.querySelectorAll(".asset-link");
const assetImages = document.querySelectorAll(".asset-image");
const assetVideo = document.querySelector(".asset-video");
const missingAssetAlerts = new Set();

const closeMenu = () => {
  if (navMenu) {
    navMenu.classList.remove("open");
  }

  if (navToggle) {
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  document.body.classList.remove("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen && window.innerWidth <= 980);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!navMenu || !navToggle) return;
  if (window.innerWidth > 980) return;

  const clickedInsideMenu = navMenu.contains(event.target);
  const clickedToggle = navToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const activeId = entry.target.getAttribute("id");

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    rootMargin: "-40% 0px -45% 0px",
    threshold: 0.1,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener("scroll", () => {
  const shouldShow = window.scrollY > 420;
  backToTopButton?.classList.toggle("visible", shouldShow);
});

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

projectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const projectName = button.dataset.project || "este proyecto";
    window.alert(`Detalle de "${projectName}": esta sección puede ampliarse con evidencias, capturas o documentos del proyecto.`);
  });
});

// Verifica si los recursos críticos están disponibles y avisa al usuario cuando aún son de ejemplo.
const verifyAsset = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

assetLinks.forEach((link) => {
  link.addEventListener("click", async (event) => {
    const url = link.getAttribute("href");
    const assetType = link.dataset.assetType || "archivo";

    if (window.location.protocol === "file:") {
      window.alert(`La verificación automática del ${assetType.toUpperCase()} puede fallar si abres el proyecto directamente desde el explorador. Para validar mejor los archivos, usa Live Server o un servidor local.`);
      return;
    }

    const exists = await verifyAsset(url);

    if (!exists) {
      event.preventDefault();
      window.alert(`El ${assetType.toUpperCase()} aún no está cargado en la ruta esperada. Reemplaza el archivo en assets antes de entregar el proyecto.`);
    }
  });
});

assetImages.forEach((image) => {
  image.addEventListener("error", () => {
    const assetType = image.dataset.assetType || "imagen";
    image.alt = "Recurso pendiente por reemplazar";
    image.style.opacity = "0.55";
    image.style.filter = "grayscale(1)";
    image.title = "Archivo pendiente por reemplazar";

    if (!missingAssetAlerts.has(assetType) && assetType === "qr") {
      missingAssetAlerts.add(assetType);
      window.alert("El código QR aún no existe en assets/img/qr-portafolio.png. Reemplázalo antes de la entrega final.");
    }
  });
});

if (assetVideo) {
  const source = assetVideo.querySelector("source");

  assetVideo.addEventListener("error", () => {
    window.alert("El video CV aún no existe en la ruta assets/video/video-cv-marolin.mp4. Reemplázalo por el archivo real.");
  });

  if (source) {
    verifyAsset(source.src).then((exists) => {
      if (!exists) {
        assetVideo.setAttribute("title", "Video pendiente por reemplazar");
      }
    });
  }
}
