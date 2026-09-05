// JSON-LD Structured Data for SEO
// Helps search engines understand the content and display rich results

(function() {
  'use strict';

  var BASE = 'https://www.signalpilot.io/education';

  // Organization Schema
  var organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Signal Pilot",
    "url": "https://www.signalpilot.io",
    "logo": BASE + "/education/assets/icons/icon-512x512.png",
    "sameAs": [
      "https://twitter.com/signalpilot",
      "https://linkedin.com/company/signalpilot",
      "https://www.signalpilot.io/docs",
      "https://www.signalpilot.io/blog",
      "https://www.signalpilot.io/education"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@signalpilot.io"
    }
  };

  // Educational Organization
  var educationalOrganization = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Signal Pilot Education Hub",
    "url": BASE,
    "description": "Learn institutional trading concepts from Signal Pilot. 100 comprehensive lessons covering order flow, liquidity engineering, and professional trading frameworks.",
    "provider": {
      "@type": "Organization",
      "name": "Signal Pilot"
    }
  };

  // Course Schema (for homepage)
  var courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Signal Pilot Trading Education",
    "description": "Interactive trading course with 100 lessons across 4 tiers: Beginner, Intermediate, Advanced, and Professional. Learn market structure, institutional order flow, and professional trading frameworks.",
    "provider": {
      "@type": "Organization",
      "name": "Signal Pilot",
      "url": "https://www.signalpilot.io"
    },
    "courseCode": "SP-EDU-001",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": "PT40H"
    },
    "educationalLevel": "Beginner to Advanced",
    "numberOfCredits": 86,
    "about": [
      "Trading",
      "Order Flow",
      "Market Microstructure",
      "Liquidity Engineering",
      "Institutional Trading"
    ],
    "teaches": [
      "Market structure analysis",
      "Order flow reading",
      "Liquidity sweep identification",
      "Risk management",
      "Professional trading frameworks"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5"
    }
  };

  // SoftwareApplication schemas for each Signal Pilot indicator
  var indicatorSchemas = {
    "Volume Oracle": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Volume Oracle",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Order flow confluence engine combining Plutus Flow, Janus Atlas, and regime data into one actionable signal matrix for institutional-grade trading decisions.",
      "url": "https://www.signalpilot.io/docs/indicators/volume-oracle",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Plutus Flow": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Plutus Flow",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Volume delta and absorption analysis tool for detecting institutional accumulation and distribution before breakouts occur.",
      "url": "https://www.signalpilot.io/docs/indicators/plutus-flow",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Janus Atlas": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Janus Atlas",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Liquidity sweep detection system that identifies stop hunts, engineered reversals, and institutional manipulation patterns with volume confluence.",
      "url": "https://www.signalpilot.io/docs/indicators/janus-atlas",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Pentarch Pilot Line": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Pentarch Pilot Line",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Multi-timeframe trend system using 5 EMAs across 3 timeframes with 8 components including TD, IGN, CAP, WRN, BDN events, Pilot Line, Regime Bar Colors, and NanoFlow.",
      "url": "https://www.signalpilot.io/docs/indicators/pentarch",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Harmonic Oscillator": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Harmonic Oscillator",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Regime-adaptive oscillator voting system combining RSI, Stochastic, and CCI for context-aware momentum analysis and divergence detection.",
      "url": "https://www.signalpilot.io/docs/indicators/harmonic-oscillator",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Augury Grid": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Augury Grid",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "Multi-timeframe grid and session liquidity analysis tool for tracking global liquidity flows across Asian, London, and New York sessions.",
      "url": "https://www.signalpilot.io/docs/indicators/augury-grid",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    },
    "Omnideck": {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Omnideck",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Trading Indicator",
      "operatingSystem": "TradingView",
      "description": "3-layer timeframe alignment tool that eliminates conflicting signals by synchronizing daily bias, 4H structure, and 15-minute execution timeframes.",
      "url": "https://www.signalpilot.io/docs/indicators/omnideck",
      "softwareVersion": "10",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      }
    }
  };

  // Indicator mastery lesson numbers (these teach how to configure/use SP indicators)
  var indicatorLessons = {
    28: "Pentarch Pilot Line",
    29: "Harmonic Oscillator",
    30: "Plutus Flow",
    31: "Janus Atlas",
    32: "Volume Oracle"
  };

  // Lessons that are setup/configuration guides (HowTo pattern)
  var setupLessons = [6, 9, 10, 11, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35, 54, 57, 61, 75, 81];

  // Course Schema for tier landing pages
  function createTierCourseSchema(tierData) {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": tierData.name,
      "description": tierData.description,
      "url": tierData.url,
      "courseCode": tierData.courseCode,
      "educationalLevel": tierData.educationalLevel,
      "numberOfLessons": tierData.numberOfLessons,
      "timeToComplete": tierData.timeToComplete,
      "inLanguage": "en-US",
      "provider": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io",
        "logo": {
          "@type": "ImageObject",
          "url": BASE + "/education/assets/icons/icon-512x512.png"
        }
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "Online",
        "instructor": {
          "@type": "Organization",
          "name": "Signal Pilot"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5"
      }
    };
  }

  // Learning Resource for individual lessons
  function createLessonSchema(lessonData) {
    return {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": lessonData.title,
      "description": lessonData.description,
      "learningResourceType": "Lesson",
      "educationalLevel": lessonData.tier,
      "timeRequired": lessonData.duration,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "Course",
        "name": "Signal Pilot Trading Education"
      },
      "position": lessonData.number,
      "teaches": lessonData.teaches || []
    };
  }

  // TechArticle schema for indicator-focused lessons
  function createTechArticleSchema(lessonData) {
    return {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": lessonData.title,
      "description": lessonData.description,
      "proficiencyLevel": lessonData.tier,
      "articleSection": "Indicator Configuration",
      "inLanguage": "en-US",
      "url": lessonData.url,
      "author": {
        "@type": "Organization",
        "name": "Signal Pilot"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io",
        "logo": {
          "@type": "ImageObject",
          "url": BASE + "/education/assets/icons/icon-512x512.png"
        }
      },
      "about": {
        "@type": "SoftwareApplication",
        "name": lessonData.indicatorName
      }
    };
  }

  // HowTo schema for setup/configuration guide lessons
  function createHowToSchema(lessonData) {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": lessonData.title,
      "description": lessonData.description,
      "totalTime": lessonData.duration,
      "inLanguage": "en-US",
      "url": lessonData.url,
      "tool": lessonData.indicatorName ? {
        "@type": "SoftwareApplication",
        "name": lessonData.indicatorName
      } : undefined,
      "step": [{
        "@type": "HowToStep",
        "name": "Read the lesson",
        "text": "Follow the step-by-step guide in this lesson to learn " + lessonData.title.toLowerCase() + ".",
        "url": lessonData.url
      }]
    };
  }

  // Author schema for byline on lessons
  function createAuthorSchema(authorData) {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": authorData.name,
      "jobTitle": authorData.jobTitle,
      "affiliation": {
        "@type": "Organization",
        "name": "Signal Pilot",
        "url": "https://www.signalpilot.io"
      },
      "url": authorData.url || "https://www.signalpilot.io"
    };
  }

  // BreadcrumbList for navigation
  function createBreadcrumbSchema(items) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map(function(item, index) {
        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        };
      })
    };
  }

  // Website Schema
  var websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Signal Pilot Education Hub",
    "url": BASE,
    "description": "Interactive trading education platform with 100 lessons, quizzes, and progress tracking.",
    "publisher": {
      "@type": "Organization",
      "name": "Signal Pilot"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": BASE + "/education/search.html?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // FAQ Schema (can be used on pages with common questions)
  function createFAQSchema(faqs) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(function(faq) {
        return {
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        };
      })
    };
  }

  // Helper function to inject schema into page
  function injectSchema(schema) {
    if (!schema) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // Page name map for breadcrumbs on utility pages
  var pageNameMap = {
    '/education/resources.html': 'Resources',
    '/education/glossary.html': 'Glossary',
    '/education/learning-path.html': 'Learning Path',
    '/education/challenges.html': 'Challenges',
    '/education/my-library.html': 'My Library',
    '/education/calculators.html': 'Calculators',
    '/education/search.html': 'Search',
    '/education/reset-password.html': 'Reset Password'
  };

  // Auto-detect page type and inject appropriate schemas
  function initStructuredData() {
    var pathname = window.location.pathname;

    // Always add Organization schema
    injectSchema(organizationSchema);

    // Homepage
    if (pathname === '/' || pathname === '/education/index.html') {
      injectSchema(websiteSchema);
      injectSchema(courseSchema);
      injectSchema(educationalOrganization);

      // Inject all SoftwareApplication schemas on homepage
      Object.keys(indicatorSchemas).forEach(function(key) {
        injectSchema(indicatorSchemas[key]);
      });

      // Homepage breadcrumb
      injectSchema(createBreadcrumbSchema([
        { name: "Home", url: BASE + "/" }
      ]));
    }

    // Lesson pages
    else if (pathname.indexOf('/education/curriculum/') !== -1) {
      var lessonId = window.getLessonId ? window.getLessonId() : null;

      // Extract tier from URL path
      var tierMatch = pathname.match(/\/curriculum\/(beginner|intermediate|advanced|professional)\//);
      var tier = tierMatch ? tierMatch[1] : null;

      // Extract lesson number from URL or filename
      var lessonNumMatch = pathname.match(/(\d+)-/);
      var lessonNumber = lessonNumMatch ? parseInt(lessonNumMatch[1]) : 1;

      if (tier) {
        var lessonTitle = document.querySelector('.article header .headline');
        lessonTitle = lessonTitle ? lessonTitle.textContent : 'Lesson';
        var tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
        var description = '';
        var descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) description = descMeta.content;

        var lessonData = {
          title: lessonTitle,
          description: description,
          tier: tierName,
          duration: "PT18M",
          number: lessonNumber,
          url: window.location.href,
          indicatorName: indicatorLessons[lessonNumber] || null
        };

        // Base LearningResource schema
        injectSchema(createLessonSchema(lessonData));

        // TechArticle for indicator mastery lessons
        if (indicatorLessons[lessonNumber]) {
          injectSchema(createTechArticleSchema(lessonData));
          // Also inject the specific SoftwareApplication schema
          var indicatorName = indicatorLessons[lessonNumber];
          if (indicatorSchemas[indicatorName]) {
            injectSchema(indicatorSchemas[indicatorName]);
          }
        }

        // HowTo for setup/configuration lessons
        if (setupLessons.indexOf(lessonNumber) !== -1) {
          injectSchema(createHowToSchema(lessonData));
        }

        // Lesson breadcrumb: Home > Curriculum > [Course] > [Lesson]
        injectSchema(createBreadcrumbSchema([
          { name: "Home", url: BASE + "/" },
          { name: tierName + " Curriculum", url: BASE + "/" + tier + ".html" },
          { name: lessonTitle, url: window.location.href }
        ]));

        // Author schema - Signal Pilot as default author
        var authorSchema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": lessonTitle,
          "description": description,
          "author": {
            "@type": "Organization",
            "name": "Signal Pilot",
            "url": "https://www.signalpilot.io"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Signal Pilot",
            "url": "https://www.signalpilot.io",
            "logo": {
              "@type": "ImageObject",
              "url": BASE + "/education/assets/icons/icon-512x512.png"
            }
          },
          "datePublished": document.querySelector('meta[property="article:published_time"]') ?
            document.querySelector('meta[property="article:published_time"]').getAttribute('content') :
            new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        };
        injectSchema(authorSchema);
      }
    }

    // Tier pages (beginner, intermediate, advanced, professional)
    else if (pathname.match(/\/(beginner|intermediate|advanced|professional)\.html/)) {
      var tierMatch = pathname.match(/\/(beginner|intermediate|advanced|professional)/);
      var tierPage = tierMatch[1];
      var tierPageName = tierPage.charAt(0).toUpperCase() + tierPage.slice(1);

      // Tier course definitions
      var tierCourses = {
        'beginner': {
          name: 'Beginner Curriculum — Signal Pilot Trading Education',
          description: 'Complete beginner trading curriculum: 24 lessons on how a market works, what trading costs, and what risk actually is.',
          courseCode: 'SP-EDU-101',
          educationalLevel: 'Beginner',
          numberOfLessons: 24,
          timeToComplete: 'PT8W',
          url: BASE + '/education/beginner.html'
        },
        'intermediate': {
          name: 'Intermediate Curriculum — Signal Pilot Trading Education',
          description: 'Reading the auction: 28 lessons on order flow, market structure, volatility and the context that decides when a reading applies.',
          courseCode: 'SP-EDU-102',
          educationalLevel: 'Intermediate',
          numberOfLessons: 28,
          timeToComplete: 'PT10W',
          url: BASE + '/education/intermediate.html'
        },
        'advanced': {
          name: 'Advanced Curriculum — Signal Pilot Trading Education',
          description: 'Who else is in the book: 18 lessons on market makers, execution, machine learning and building a system that survives testing.',
          courseCode: 'SP-EDU-103',
          educationalLevel: 'Advanced',
          numberOfLessons: 18,
          timeToComplete: 'PT10W',
          url: BASE + '/education/advanced.html'
        },
        'professional': {
          name: 'Professional Curriculum — Signal Pilot Trading Education',
          description: 'Portfolio and profession: 15 lessons on correlation, institutional risk controls, infrastructure, tax, careers and two capstones.',
          courseCode: 'SP-EDU-104',
          educationalLevel: 'Professional',
          numberOfLessons: 15,
          timeToComplete: 'PT6W',
          url: BASE + '/education/professional.html'
        }
      };

      // Inject Course schema for this tier
      if (tierCourses[tierPage]) {
        injectSchema(createTierCourseSchema(tierCourses[tierPage]));
      }

      // Inject breadcrumb schema
      injectSchema(createBreadcrumbSchema([
        { name: "Home", url: BASE + "/" },
        { name: tierPageName, url: window.location.href }
      ]));
    }

    // Utility pages (resources, glossary, calculators, search, etc.)
    else if (pageNameMap[pathname]) {
      var pageName = pageNameMap[pathname];

      injectSchema(createBreadcrumbSchema([
        { name: "Home", url: BASE + "/" },
        { name: pageName, url: BASE + pathname }
      ]));

      // SearchAction on search page
      if (pathname === '/education/search.html') {
        injectSchema(websiteSchema);
      }
    }

    logger.log('[SEO] Structured data injected');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStructuredData);
  } else {
    initStructuredData();
  }

  // Expose helper functions globally for custom use
  window.SEO = {
    createLessonSchema: createLessonSchema,
    createBreadcrumbSchema: createBreadcrumbSchema,
    createFAQSchema: createFAQSchema,
    createTechArticleSchema: createTechArticleSchema,
    createHowToSchema: createHowToSchema,
    createTierCourseSchema: createTierCourseSchema,
    createAuthorSchema: createAuthorSchema,
    indicatorSchemas: indicatorSchemas,
    injectSchema: injectSchema
  };

})();
