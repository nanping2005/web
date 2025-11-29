document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const menuToggle = document.querySelector(".menu-toggle");
    const menuOverlay = document.querySelector(".menu-overlay");
    const menuContent = document.querySelector(".menu-content");
    const menuPreviewImg = document.querySelector(".menu-preview-img");
    const menuLinks = document.querySelectorAll(".link a");

    /**
     * 异步加载 ScrollTrigger 插件，便于所有页面复用。
     */
    function loadScrollTrigger() {
        return new Promise((resolve, reject) => {
            if (window.ScrollTrigger) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("ScrollTrigger load failed"));
            document.head.appendChild(script);
        });
    }

    /**
     * 初始化滚动动画，参考 GSAP 每日最佳网站的动态效果
     */
    function initScrollAnimations() {
        if (!window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        // 首屏标题入场
        gsap.from(".hero-title", {
            y: 80,
            autoAlpha: 0,
            duration: 1.2,
            ease: "power3.out"
        });
        gsap.from(".hero-subtitle", {
            y: 40,
            autoAlpha: 0,
            duration: 1.1,
            delay: 0.2,
            ease: "power3.out"
        });

        const defaultTrigger = {
            start: "top 80%",
            toggleActions: "play none none reverse"
        };

        // 区块标题
        gsap.utils.toArray(".section-header, .about-title, .section-title").forEach(header => {
            gsap.set(header, { autoAlpha: 1 }); // 确保初始可见
            gsap.from(header, {
                y: 60,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: header,
                    ...defaultTrigger
                }
            });
        });

        const staggerSections = [
            [".works-grid .work-item", ".works-grid"],
            [".about-content > *", ".about-content"],
            [".video-grid .video-card", ".video-grid"],
            [".services-grid .service-card", ".services-grid"],
            [".portfolio-grid .portfolio-item", ".portfolio-grid"],
            [".blog-grid .blog-card", ".blog-grid"],
            [".contact-wrapper > *", ".contact-wrapper"],
            [".tips-grid .tip-card", ".tips-grid"],
            [".equipment-grid .equipment-card", ".equipment-grid"]
        ];

        staggerSections.forEach(([targets, trigger]) => {
            const elements = gsap.utils.toArray(targets);
            if (!elements.length) return;
            // 确保元素初始可见
            gsap.set(elements, { autoAlpha: 1 });
            gsap.from(elements, {
                y: 40,
                autoAlpha: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: trigger ? document.querySelector(trigger) || elements[0] : elements[0],
                    ...defaultTrigger
                }
            });
        });

        // 视觉差效果：英雄图轻微缩放
        const heroImage = document.querySelector(".hero-image img");
        if (heroImage) {
            gsap.to(heroImage, {
                scale: 1.1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // 页眉背景渐变
        const pageHero = document.querySelector(".page-hero-image img");
        if (pageHero) {
            gsap.to(pageHero, {
                scale: 1.08,
                ease: "none",
                scrollTrigger: {
                    trigger: ".page-hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    }

    // 导航栏下拉菜单处理
    const navDropdowns = document.querySelectorAll(".nav-dropdown");
    navDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        const menu = dropdown.querySelector(".dropdown-menu");
        
        if (toggle && menu) {
            // 鼠标悬停显示下拉菜单
            dropdown.addEventListener("mouseenter", () => {
                menu.style.opacity = "1";
                menu.style.visibility = "visible";
                menu.style.transform = "translateY(0)";
            });
            
            dropdown.addEventListener("mouseleave", () => {
                menu.style.opacity = "0";
                menu.style.visibility = "hidden";
                menu.style.transform = "translateY(-10px)";
            });
        }
    });

    let isOpen = false;
    let isAnimating = false;

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            if (!isOpen) openMenu();
            else closeMenu();
        });
    }

    function cleanupPreviewImages() {
        if (!menuPreviewImg) return;
        const previewImages = menuPreviewImg.querySelectorAll("img");
        if (previewImages.length > 3) {
            for (let i = 0; i < previewImages.length - 3; i++) {
                menuPreviewImg.removeChild(previewImages[i]);
            }
        }
    }

    function resetPreviewImage() {
        if (!menuPreviewImg) return;
        menuPreviewImg.innerHTML = "";
        const defaultPreviewImg = document.createElement("img");
        defaultPreviewImg.src = "img/slider_img_27.jpg";
        menuPreviewImg.appendChild(defaultPreviewImg);
    }

    function animateMenuToggle(isOpening) {
        const open = document.querySelector("p#menu-open");
        const close = document.querySelector("p#menu-close");

        if (!open || !close) return;

        gsap.to(isOpening ? open : close, {
            x: isOpening ? -5 : 5,
            y: isOpening ? -10 : 10,
            rotation: isOpening ? -5 : 5,
            opacity: 0,
            delay: 0.25,
            duration: 0.5,
            ease: "power2.out",
        });

        gsap.to(isOpening ? close : open, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            delay: 0.5,
            duration: 0.5,
            ease: "power2.out",
        });
    }

    function openMenu() {
        if (isAnimating || isOpen || !container || !menuContent || !menuOverlay) return;
        isAnimating = true;

        gsap.to(container, {
            rotation: 10,
            x: 300,
            y: 450,
            scale: 1.5,
            duration: 1.25,
            ease: "power4.inOut",
        });

        animateMenuToggle(true);

        gsap.to(menuContent, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.25,
            ease: "power4.inOut",
        });

        gsap.to([".link a", ".social a"], {
            y: "0%",
            opacity: 1,
            duration: 1,
            delay: 0.75,
            stagger: 0.1,
            ease: "power3.out",
        });

        gsap.to(menuOverlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
            duration: 1.25,
            ease: "power4.inOut",
            onComplete: () => {
                isOpen = true;
                isAnimating = false;
            },
        });
    }

    function closeMenu() {
        if (isAnimating || !isOpen || !container || !menuContent || !menuOverlay) return;
        isAnimating = true;

        gsap.to(container, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.25,
            ease: "power4.inOut",
        });

        animateMenuToggle(false);

        gsap.to(menuContent, {
            rotation: -15,
            x: -100,
            y: -100,
            scale: 1.5,
            opacity: 0.25,
            duration: 1.25,
            ease: "power4.inOut",
        });

        gsap.to(menuOverlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.25,
            ease: "power4.inOut",
            onComplete: () => {
                isOpen = false;
                isAnimating = false;
                gsap.set([".link a", ".social a"], { y: "120%" });
                resetPreviewImage();
            },
        });
    }

    if (menuLinks && menuPreviewImg) {
        menuLinks.forEach((link) => {
            link.addEventListener("mouseover", () => {
                if (!isOpen || isAnimating) return;

                const imgSrc = link.getAttribute("data-img");
                if (!imgSrc) return;

                const previewImages = menuPreviewImg.querySelectorAll("img");
                if (
                    previewImages.length > 0 &&
                    previewImages[previewImages.length - 1].src.endsWith(imgSrc)
                )
                    return;

                const newPreviewImg = document.createElement("img");
                newPreviewImg.src = imgSrc;
                newPreviewImg.style.opacity = "0";
                newPreviewImg.style.transform = "scale(1.25) rotate(10deg)";

                menuPreviewImg.appendChild(newPreviewImg);
                cleanupPreviewImages();

                gsap.to(newPreviewImg, {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.75,
                    ease: "power2.out",
                });
            });
        });

        // 点击菜单链接后关闭菜单
        menuLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                if (link.getAttribute("href") && !link.getAttribute("href").startsWith("#")) {
                    closeMenu();
                } else if (link.getAttribute("href") && link.getAttribute("href").startsWith("#")) {
                    e.preventDefault();
                    closeMenu();
                    setTimeout(() => {
                        const target = document.querySelector(link.getAttribute("href"));
                        if (target) {
                            target.scrollIntoView({ behavior: "smooth" });
                        }
                    }, 1300);
                }
            });
        });
    }

    // 作品集筛选功能
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const filter = btn.getAttribute("data-filter");
                
                portfolioItems.forEach(item => {
                    if (filter === "all") {
                        item.style.display = "block";
                    } else {
                        const categories = item.getAttribute("data-category");
                        if (categories && categories.includes(filter)) {
                            item.style.display = "block";
                        } else {
                            item.style.display = "none";
                        }
                    }
                });
            });
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 导航栏滚动效果
    let lastScroll = 0;
    const nav = document.querySelector('nav');
    const mainNav = document.querySelector('.main-nav');
    
    function updateNavBackground() {
        const currentScroll = window.pageYOffset;
        
        if (nav) {
            if (currentScroll <= 0) {
                nav.style.backgroundColor = 'transparent';
            } else {
                nav.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            }
        }
        
        if (mainNav) {
            if (currentScroll <= 0) {
                mainNav.classList.remove('scrolled');
            } else {
                mainNav.classList.add('scrolled');
            }
        }
        
        lastScroll = currentScroll;
    }
    
    if (nav || mainNav) {
        window.addEventListener('scroll', updateNavBackground);
        updateNavBackground(); // 初始化
    }

    // 图片懒加载（如果浏览器支持）
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * 视频懒加载：默认静音，进入视口后再加载iframe以触发播放
     */
    function initVideoAutoplay() {
        const videoIframes = document.querySelectorAll('.video-player iframe[data-src]');
        if (!videoIframes.length) return;

        const loadMutedVideo = (iframe) => {
            if (iframe.dataset.loaded === 'true') return;
            const baseUrl = iframe.dataset.src;
            if (!baseUrl) return;

            try {
                const url = new URL(baseUrl, window.location.href);
                url.searchParams.set('muted', '1');
                url.searchParams.set('autoplay', '1');
                iframe.src = url.toString();
            } catch (err) {
                // 回退：无法解析 URL 时直接拼接参数
                const separator = baseUrl.includes('?') ? '&' : '?';
                iframe.src = `${baseUrl}${separator}muted=1&autoplay=1`;
            }
            iframe.dataset.loaded = 'true';
        };

        if (!('IntersectionObserver' in window)) {
            videoIframes.forEach(loadMutedVideo);
            return;
        }

        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadMutedVideo(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        videoIframes.forEach(iframe => videoObserver.observe(iframe));
    }

    // 优先选择横屏图片作为背景
    function checkImageOrientation(img) {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
                resolve(img.naturalWidth > img.naturalHeight);
            } else {
                const checkOrientation = () => {
                    if (img.naturalWidth > 0) {
                        resolve(img.naturalWidth > img.naturalHeight);
                    } else {
                        resolve(false);
                    }
                };
                img.onload = checkOrientation;
                img.onerror = () => resolve(false);
                // 如果图片已经加载但尺寸未知，等待一小段时间
                setTimeout(() => {
                    if (img.naturalWidth > 0) {
                        resolve(img.naturalWidth > img.naturalHeight);
                    } else {
                        resolve(false);
                    }
                }, 100);
            }
        });
    }

    async function selectLandscapeBackground(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const img = container.querySelector('img');
        if (!img) return;

        // 检查当前图片是否为横屏
        const currentIsLandscape = await checkImageOrientation(img);
        
        if (!currentIsLandscape) {
            // 如果不是横屏，尝试从已知的横屏图片中选择
            // 根据文件名和常见横屏图片特征，优先选择这些图片
            const landscapeImages = [
                'img/slider_img_4.jpg',
                'img/slider_img_2.jpg',
                'img/slider_img_22.jpg',
                'img/slider_img_16.jpg',
                'img/slider_img_18.jpg',
                'img/slider_img_14.jpg',
                'img/slider_img_19.jpg',
                'img/slider_img_10.jpg',
                'img/slider_img_8.jpg',
                'img/slider_img_11.jpg',
                'img/slider_img_5.jpg',
                'img/slider_img_6.jpg',
                'img/slider_img_20.jpg',
                'img/slider_img_7.jpg'
            ];

            // 尝试加载第一个横屏图片（通常全景和DJI开头的图片是横屏）
            if (landscapeImages.length > 0) {
                const testImg = new Image();
                testImg.src = landscapeImages[0];
                const isLandscapeImg = await checkImageOrientation(testImg);
                
                if (isLandscapeImg) {
                    img.src = landscapeImages[0];
                } else if (landscapeImages.length > 1) {
                    // 如果第一个不是，尝试第二个
                    const testImg2 = new Image();
                    testImg2.src = landscapeImages[1];
                    const isLandscapeImg2 = await checkImageOrientation(testImg2);
                    if (isLandscapeImg2) {
                        img.src = landscapeImages[1];
                    }
                }
            }
        }
    }

    // 为页面头部背景选择横屏图片
    selectLandscapeBackground('.page-hero-image');

    // 为英雄区域背景选择横屏图片
    selectLandscapeBackground('.hero-image');

    loadScrollTrigger()
        .then(() => initScrollAnimations())
        .catch((err) => console.warn(err.message));

    initVideoAutoplay();

    /**
     * 纯享滚动滑块 - 模仿 T3 动画
     * 仅在首页存在 .pure-slider-container 时初始化
     */
    const pureSliderContainer = document.querySelector(".pure-slider-container");
    const pureSliderRoot = document.querySelector(".pure-slider");

    if (pureSliderContainer && pureSliderRoot && window.gsap) {
        // 纯享滑块的标题文案，使用中文氛围感文案
        const slideData = [
            { title: "", image: "img/slider_img_1.jpg" },
            { title: "", image: "img/slider_img_2.jpg" },
            { title: "", image: "img/slider_img_3.jpg" },
            { title: "", image: "img/slider_img_4.jpg" },
            { title: "", image: "img/slider_img_6.jpg" }
        ];

        let frontSlideIndex = 0;
        let isSliderAnimating = false;
        let wheelAccumulator = 0;
        const wheelThreshold = 100;
        let isWheelActive = false;

        let touchStartY = 0;
        let touchStartX = 0;
        let isTouchActive = false;
        const touchThreshold = 50;

        function initializePureSlider() {
            // 创建初始 5 张卡片
            slideData.forEach((data) => {
                const slide = document.createElement("div");
                slide.className = "pure-slide";
                slide.innerHTML = `
        <img src="${data.image}" alt="" class="pure-slide-image" />
      `;
                pureSliderRoot.appendChild(slide);
            });

            const slides = pureSliderRoot.querySelectorAll(".pure-slide");
            slides.forEach((slide, i) => {
                gsap.set(slide, {
                    y: -15 + 15 * i + "%",
                    z: 15 * i,
                    opacity: 1,
                });
            });
        }

        function handlePureSlideChange(direction = "down") {
            if (isSliderAnimating) return;
            isSliderAnimating = true;

            if (direction === "down") {
                handleScrollDown();
            } else {
                handleScrollUp();
            }
        }

        function handleScrollDown() {
            const slides = pureSliderRoot.querySelectorAll(".pure-slide");
            const firstSlide = slides[0];

            frontSlideIndex = (frontSlideIndex + 1) % slideData.length;
            const newBackIndex = (frontSlideIndex + 4) % slideData.length;
            const nextSlideData = slideData[newBackIndex];

            const newSlide = document.createElement("div");
            newSlide.className = "pure-slide";
            newSlide.innerHTML = `
      <img src="${nextSlideData.image}" alt="" class="pure-slide-image" />
    `;

            pureSliderRoot.appendChild(newSlide);

            gsap.set(newSlide, {
                y: -15 + 15 * 5 + "%",
                z: 15 * 5,
                opacity: 0,
            });

            const allSlides = pureSliderRoot.querySelectorAll(".pure-slide");

            allSlides.forEach((slide, i) => {
                const targetPosition = i - 1;

                gsap.to(slide, {
                    y: -15 + 15 * targetPosition + "%",
                    z: 15 * targetPosition,
                    opacity: targetPosition < 0 ? 0 : 1,
                    duration: 1,
                    ease: "power3.inOut",
                    onComplete: () => {
                        if (i === 0 && firstSlide.parentNode) {
                            firstSlide.remove();
                            isSliderAnimating = false;
                        }
                    },
                });
            });

        }

        function handleScrollUp() {
            const slides = pureSliderRoot.querySelectorAll(".pure-slide");
            const lastSlide = slides[slides.length - 1];

            frontSlideIndex =
                (frontSlideIndex - 1 + slideData.length) % slideData.length;
            const prevSlideData = slideData[frontSlideIndex];

            const newSlide = document.createElement("div");
            newSlide.className = "pure-slide";
            newSlide.innerHTML = `
      <img src="${prevSlideData.image}" alt="" class="pure-slide-image" />
    `;

            pureSliderRoot.prepend(newSlide);

            gsap.set(newSlide, {
                y: -15 + 15 * -1 + "%",
                z: 15 * -1,
                opacity: 0,
            });

            const slideQueue = Array.from(
                pureSliderRoot.querySelectorAll(".pure-slide")
            );
            slideQueue.forEach((slide, i) => {
                const targetPosition = i;

                gsap.to(slide, {
                    y: -15 + 15 * targetPosition + "%",
                    z: 15 * targetPosition,
                    opacity: targetPosition > 4 ? 0 : 1,
                    duration: 1,
                    ease: "power3.inOut",
                    onComplete: () => {
                        if (i === slideQueue.length - 1 && lastSlide.parentNode) {
                            lastSlide.remove();
                            isSliderAnimating = false;
                        }
                    },
                });
            });
        }

        function bindPureSliderEvents() {
            // 鼠标滚轮
            pureSliderContainer.addEventListener(
                "wheel",
                (e) => {
                    e.preventDefault();

                    if (isSliderAnimating || isWheelActive) return;

                    wheelAccumulator += Math.abs(e.deltaY);

                    if (wheelAccumulator >= wheelThreshold) {
                        isWheelActive = true;
                        wheelAccumulator = 0;

                        const direction = e.deltaY > 0 ? "down" : "up";
                        handlePureSlideChange(direction);

                        setTimeout(() => {
                            isWheelActive = false;
                        }, 1200);
                    }
                },
                { passive: false }
            );

            // 触摸滑动（移动端）
            pureSliderContainer.addEventListener(
                "touchstart",
                (e) => {
                    if (!e.touches || !e.touches.length) return;
                    const touch = e.touches[0];
                    touchStartY = touch.clientY;
                    touchStartX = touch.clientX;
                },
                { passive: true }
            );

            pureSliderContainer.addEventListener(
                "touchend",
                (e) => {
                    if (isSliderAnimating || isTouchActive) return;

                    const touchEndY = e.changedTouches[0].clientY;
                    const touchEndX = e.changedTouches[0].clientX;
                    const deltaY = touchStartY - touchEndY;
                    const deltaX = Math.abs(touchStartX - touchEndX);

                    if (Math.abs(deltaY) > deltaX && Math.abs(deltaY) > touchThreshold) {
                        isTouchActive = true;

                        const direction = deltaY > 0 ? "down" : "up";
                        handlePureSlideChange(direction);

                        setTimeout(() => {
                            isTouchActive = false;
                        }, 1200);
                    }
                },
                { passive: true }
            );
        }

        function loadSplitTextPlugin() {
            return new Promise((resolve) => {
                if (window.SplitText) {
                    resolve();
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://assets.codepen.io/16327/SplitText3.min.js";
                script.async = true;
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        }

        loadSplitTextPlugin().then(() => {
            initializePureSlider();
            bindPureSliderEvents();
        });
    }
});
