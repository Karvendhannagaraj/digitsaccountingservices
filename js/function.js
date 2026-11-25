(function ($) {
    "use strict";

    var $window = $(window);
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Preloader Effect (with safety fallback so slow assets never block UI) */
    function hidePreloader() {
        var $preloader = $(".preloader");
        if ($preloader.length && $preloader.is(":visible")) {
            $preloader.fadeOut(280);
        }
    }
    $window.on("load", hidePreloader);
    setTimeout(hidePreloader, 1600);

    /* Sticky Header Scroll State, Back-to-Top Progress & Active Nav Highlight */
    var $header = $("header.main-header");
    var $navLinks = $('#menu a[href^="#"]');
    var sectionIds = ["#home", "#about_us", "#services", "#why-choose-body", "#contact"];
    var backToTopBtn = document.getElementById("backToTop");
    var progressCircle = document.querySelector(".back-to-top-progress");
    var ringCircumference = 131.95;

    function updateHeaderOnScroll() {
        var scrollTop = $window.scrollTop() || 0;
        if (scrollTop > 24) {
            $header.addClass("is-scrolled");
        } else {
            $header.removeClass("is-scrolled");
        }

        if (backToTopBtn) {
            if (scrollTop > 320) {
                backToTopBtn.classList.add("is-visible");
            } else {
                backToTopBtn.classList.remove("is-visible");
            }
            if (progressCircle) {
                var docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                var ratio = Math.min(1, Math.max(0, scrollTop / docHeight));
                progressCircle.style.strokeDashoffset = (ringCircumference * (1 - ratio)).toFixed(2);
            }
        }

        var currentId = "#home";
        var checkY = scrollTop + 140;
        for (var i = 0; i < sectionIds.length; i++) {
            var $sec = $(sectionIds[i]);
            if ($sec.length && $sec.offset().top <= checkY) {
                currentId = sectionIds[i];
            }
        }
        $navLinks.removeClass("is-active");
        $navLinks.filter('[href="' + currentId + '"]').addClass("is-active");
    }

    $window.on("scroll", updateHeaderOnScroll);
    updateHeaderOnScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
    }

    /* Slick Mobile Menu */
    $("#menu").slicknav({
        label: "",
        prependTo: ".responsive-menu"
    });

    /* Close mobile menu when an anchor link is clicked */
    $(document).on("click", ".slicknav_nav a[href^='#']", function () {
        if ($("#menu").length && typeof $("#menu").slicknav === "function") {
            $("#menu").slicknav("close");
        }
    });

    /* Smooth Scroll with Sticky Header Offset */
    $(document).on("click", 'a[href^="#"]', function (e) {
        var targetId = $(this).attr("href");
        if (!targetId || targetId === "#") return;
        if (targetId === "#top" || targetId === "#home") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
            return;
        }
        var $target = $(targetId);
        if ($target.length) {
            e.preventDefault();
            var offsetTop = Math.max(0, $target.offset().top - 84);
            window.scrollTo({ top: offsetTop, behavior: prefersReducedMotion ? "auto" : "smooth" });
        }
    });

    /* Plan Selection CTA -> Pre-fill Contact Inquiry */
    $(document).on("click", ".js-select-plan", function () {
        var planName = $(this).data("plan");
        var messageInput = document.getElementById("contactMessage");
        var nameInput = document.getElementById("contactName");
        var formWrap = document.querySelector(".newsletters-form");

        if (messageInput && planName) {
            var currentVal = (messageInput.value || "").trim();
            if (!currentVal || currentVal.indexOf("I would like to get started with the ") === 0) {
                messageInput.value = "Hi, I would like to get started with the " + planName + " bookkeeping plan.";
            }
        }
        if (formWrap && !prefersReducedMotion) {
            formWrap.classList.remove("form-highlight-pulse");
            void formWrap.offsetWidth;
            formWrap.classList.add("form-highlight-pulse");
        }
        if (nameInput) {
            setTimeout(function () {
                nameInput.focus({ preventScroll: true });
            }, 550);
        }
    });

    /* Scroll Reveal Observer for .reveal-up Elements */
    var revealEls = document.querySelectorAll(".reveal-up");
    if (revealEls.length) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealEls.forEach(function (el) {
                el.classList.add("is-visible");
            });
        } else {
            var revealObserver = new IntersectionObserver(
                function (entries, obs) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
                            setTimeout(function () {
                                entry.target.classList.add("is-visible");
                            }, delay);
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
            );
            revealEls.forEach(function (el) {
                revealObserver.observe(el);
            });
        }
    }

    /* Counter Up */
    if ($(".counter").length) {
        if (prefersReducedMotion) {
            $(".counter").each(function () {
                $(this).text($(this).text());
            });
        } else {
            $(".counter").counterUp({ delay: 8, time: 1800 });
        }
    }

    /* GSAP Animations (Disabled cleanly under prefers-reduced-motion) */
    if (!prefersReducedMotion && typeof gsap !== "undefined") {
        if (typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        /* Hero Staggered Entrance (no character-splitting delay on LCP H1) */
        var $heroItems = $(".hero-badge, .hero-content h1, .hero-content-body, .hero-content-footer, .hero-trust-strip");
        if ($heroItems.length) {
            gsap.from($heroItems, {
                y: 20,
                autoAlpha: 0,
                duration: 0.65,
                stagger: 0.08,
                ease: "power2.out",
                clearProps: "transform,opacity,visibility"
            });
        }

        var $heroVisual = $(".hero-image figure, .hero-float-card");
        if ($heroVisual.length) {
            gsap.from($heroVisual, {
                y: 24,
                autoAlpha: 0,
                duration: 0.75,
                delay: 0.15,
                stagger: 0.12,
                ease: "power2.out",
                clearProps: "transform,opacity,visibility"
            });
        }

        /* Image Reveal Animation */
        if ($(".reveal").length && typeof ScrollTrigger !== "undefined") {
            document.querySelectorAll(".reveal").forEach(function (container) {
                var image = container.querySelector("img");
                var tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                });
                tl.set(container, { autoAlpha: 1 });
                tl.from(container, 0.85, { xPercent: -100, ease: "power2.out" });
                if (image) {
                    tl.from(image, 0.85, { xPercent: 100, scale: 1.04, delay: -0.85, ease: "power2.out" });
                }
            });
        }

        /* Refined Heading Reveal for Section Titles (.text-anime-style-3) */
        if ($(".text-anime-style-3").length && typeof SplitText !== "undefined" && typeof ScrollTrigger !== "undefined") {
            document.querySelectorAll(".text-anime-style-3").forEach(function (element) {
                if (element.animation) {
                    element.animation.progress(1).kill();
                    element.split.revert();
                }
                element.split = new SplitText(element, {
                    type: "lines,words",
                    linesClass: "split-line"
                });
                gsap.set(element.split.words, { opacity: 0, y: 20 });
                element.animation = gsap.to(element.split.words, {
                    scrollTrigger: { trigger: element, start: "top 90%" },
                    y: 0,
                    opacity: 1,
                    duration: 0.65,
                    ease: "power2.out",
                    stagger: 0.035
                });
            });
        }

        /* CTA Heading Reveal (.text-anime-style-4 outside Hero) */
        if ($(".cta-box .text-anime-style-4").length && typeof ScrollTrigger !== "undefined") {
            gsap.from(".cta-box .text-anime-style-4", {
                scrollTrigger: { trigger: ".cta-box", start: "top 90%" },
                y: 20,
                autoAlpha: 0,
                duration: 0.7,
                ease: "power2.out",
                clearProps: "transform,opacity,visibility"
            });
        }
    } else {
        /* Ensure reveal containers remain visible when reduced-motion is preferred */
        $(".reveal").css({ visibility: "visible", opacity: 1 });
    }

    /* Web3Forms Contact Form Submission (with Human Captcha, Bot Timing Guard & Inline Status) */
    var contactForm = document.getElementById("newslettersForm");
    if (contactForm) {
        var formLoadedAt = Date.now();
        var submitBtn = document.getElementById("contactSubmitBtn");
        var statusBox = document.getElementById("contactStatus");
        var captchaError = document.getElementById("captchaError");
        var humanCheck = document.getElementById("humanCheck");
        var captchaQuestion = document.getElementById("captchaQuestion");
        var captchaAnswer = document.getElementById("captchaAnswer");
        var captchaRefresh = document.getElementById("captchaRefresh");
        var expectedSum = 7;

        function generateCaptcha() {
            var a = Math.floor(Math.random() * 8) + 2;
            var b = Math.floor(Math.random() * 8) + 1;
            expectedSum = a + b;
            if (captchaQuestion) {
                captchaQuestion.textContent = a + " + " + b + " =";
            }
            if (captchaAnswer) {
                captchaAnswer.value = "";
            }
        }

        generateCaptcha();

        if (captchaRefresh) {
            captchaRefresh.addEventListener("click", function () {
                generateCaptcha();
                if (captchaError) captchaError.style.display = "none";
            });
        }

        contactForm.addEventListener("submit", function (e) {
            var botcheck = contactForm.querySelector('input[name="botcheck"]');
            if ((botcheck && botcheck.checked) || Date.now() - formLoadedAt < 1500) {
                e.preventDefault();
                return;
            }

            var isHumanChecked = humanCheck && humanCheck.checked;
            var userAnswer = captchaAnswer ? parseInt((captchaAnswer.value || "").trim(), 10) : NaN;
            if (!isHumanChecked || isNaN(userAnswer) || userAnswer !== expectedSum) {
                e.preventDefault();
                if (captchaError) {
                    captchaError.textContent = !isHumanChecked
                        ? 'Please check "I am human" to continue.'
                        : "Incorrect math answer. Please try again.";
                    captchaError.style.display = "block";
                }
                if (isNaN(userAnswer) || userAnswer !== expectedSum) {
                    generateCaptcha();
                }
                return;
            } else if (captchaError) {
                captchaError.style.display = "none";
            }

            if (typeof window.fetch !== "function" || typeof window.FormData !== "function") {
                return; /* Fallback to standard HTML POST */
            }

            e.preventDefault();
            if (statusBox) {
                statusBox.className = "contact-form-status";
                statusBox.textContent = "";
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "sending...";
            }

            fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            })
                .then(function (res) {
                    return res.json().then(function (data) {
                        return { ok: res.ok, data: data };
                    });
                })
                .then(function (result) {
                    if (result.ok && result.data && result.data.success) {
                        if (statusBox) {
                            statusBox.className = "contact-form-status is-success";
                            statusBox.textContent = "Thank you! Your inquiry has been received. Our bookkeeping team will reach out shortly.";
                        }
                        contactForm.reset();
                        generateCaptcha();
                    } else {
                        if (statusBox) {
                            statusBox.className = "contact-form-status is-error";
                            statusBox.textContent = (result.data && result.data.message) || "Unable to send right now. Please email info@bledgerbookkeeping.com.";
                        }
                    }
                })
                .catch(function () {
                    if (statusBox) {
                        statusBox.className = "contact-form-status is-error";
                        statusBox.textContent = "Network error. Please try again or email info@bledgerbookkeeping.com.";
                    }
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "send now";
                    }
                });
        });
    }
})(jQuery);
