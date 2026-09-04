// Completion Certificate Generator
(function() {
  'use strict';

  // Check if user has completed all 85 lessons
  function checkCompletion() {
    try {
      const progress = JSON.parse(localStorage.getItem('sp_progress') || '{}');
      const completed = Object.keys(progress).filter(key => progress[key].completed).length;
      return completed >= 85;
    } catch (e) {
      return false;
    }
  }

  // Get user stats
  function getUserStats() {
    try {
      const progress = JSON.parse(localStorage.getItem('sp_progress') || '{}');
      const streak = JSON.parse(localStorage.getItem('sp_learning_streak') || '{"current": 0, "best": 0}');

      const completed = Object.keys(progress).filter(key => progress[key].completed).length;

      // Get completion date (date of last lesson completed)
      let completionDate = new Date();
      Object.values(progress).forEach(lesson => {
        if (lesson.completedAt) {
          const date = new Date(lesson.completedAt);
          if (date > completionDate || !completionDate) {
            completionDate = date;
          }
        }
      });

      return {
        completed,
        bestStreak: streak.best || 0,
        completionDate: completionDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    } catch (e) {
      return {
        completed: 85,
        bestStreak: 0,
        completionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    }
  }

  // Generate verification code
  function generateVerificationCode() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `SP-${timestamp}-${random}`.toUpperCase();
  }

  // Generate certificate using jsPDF
  async function generateCertificate() {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
      // Load jsPDF from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const stats = getUserStats();
    const userName = localStorage.getItem('sp_user_name') || 'Trading Professional';
    const verificationCode = generateVerificationCode();

    // Store verification in localStorage
    localStorage.setItem('sp_certificate_code', verificationCode);

    // Background
    pdf.setFillColor(5, 7, 13);
    pdf.rect(0, 0, 297, 210, 'F');

    // Decorative border
    pdf.setDrawColor(91, 138, 255);
    pdf.setLineWidth(2);
    pdf.roundedRect(15, 15, 267, 180, 3, 3, 'S');

    // Inner border
    pdf.setDrawColor(118, 221, 255);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, 20, 257, 170, 2, 2, 'S');

    // Title
    pdf.setFontSize(40);
    pdf.setTextColor(156, 192, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Certificate of Completion', 148.5, 50, { align: 'center' });

    // Subtitle
    pdf.setFontSize(16);
    pdf.setTextColor(183, 194, 217);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Signal Pilot Education Hub', 148.5, 62, { align: 'center' });

    // Decorative line
    pdf.setDrawColor(91, 138, 255);
    pdf.setLineWidth(0.5);
    pdf.line(80, 68, 217, 68);

    // User name
    pdf.setFontSize(32);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(userName, 148.5, 90, { align: 'center' });

    // Body text
    pdf.setFontSize(14);
    pdf.setTextColor(183, 194, 217);
    pdf.setFont('helvetica', 'normal');
    pdf.text('has successfully completed all 85 lessons of the', 148.5, 105, { align: 'center' });
    pdf.text('Signal Pilot Institutional Trading Curriculum', 148.5, 113, { align: 'center' });

    // Stats
    pdf.setFontSize(11);
    pdf.setTextColor(142, 160, 191);
    const statsText = `110,000 words • ${stats.bestStreak > 0 ? stats.bestStreak + ' day best streak • ' : ''}Completed ${stats.completionDate}`;
    pdf.text(statsText, 148.5, 128, { align: 'center' });

    // Achievement badges
    pdf.setFontSize(10);
    pdf.setTextColor(118, 221, 255);
    pdf.text('🟢 Beginner Mastery', 60, 145, { align: 'center' });
    pdf.text('🟡 Intermediate Mastery', 148.5, 145, { align: 'center' });
    pdf.text('🔴 Advanced Mastery', 237, 145, { align: 'center' });

    // Signature line
    pdf.setDrawColor(142, 160, 191);
    pdf.setLineWidth(0.3);
    pdf.line(110, 162, 187, 162);

    pdf.setFontSize(10);
    pdf.setTextColor(142, 160, 191);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Signal Pilot Labs, Inc.', 148.5, 168, { align: 'center' });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Certificate ID: ${verificationCode}`, 148.5, 185, { align: 'center' });
    pdf.text('Verify at: education.signalpilot.io/verify', 148.5, 190, { align: 'center' });

    // Save
    pdf.save('signal-pilot-completion-certificate.pdf');

    // Track certificate download
    if (typeof trackCertificateDownload === 'function') {
      trackCertificateDownload();
    }

    // Track achievement
    if (typeof trackAchievement === 'function') {
      trackAchievement('all_lessons_completed');
    }
  }

  // Show certificate button if eligible
  function showCertificateButton() {
    if (!checkCompletion()) return;

    // Check if button already exists
    if (document.getElementById('certificate-button')) return;

    // Find container (try multiple possible locations)
    let container = document.getElementById('certificate-container');

    // If no dedicated container, create one on index page
    if (!container && ['/','/education/'].includes(window.location.pathname)) {
      const wrap = document.querySelector('.wrap');
      if (wrap) {
        container = document.createElement('div');
        container.id = 'certificate-container';
        container.style.cssText = 'margin: 3rem auto; max-width: 600px;';
        wrap.insertBefore(container, wrap.firstChild);
      }
    }

    if (!container) return;

    // Create certificate card
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 2.5rem; background: linear-gradient(135deg, rgba(91,138,255,0.15), rgba(118,221,255,0.08)); border: 2px solid rgba(91,138,255,0.3);">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎓</div>
        <h2 class="headline md" style="margin: 0 0 1rem 0;">Congratulations!</h2>
        <p style="font-size: 1.1rem; margin-bottom: 2rem; color: var(--muted);">
          You've completed all 85 lessons of the Signal Pilot Education curriculum!
        </p>
        <button id="certificate-button" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
          📜 Download Your Certificate
        </button>
        <p style="font-size: 0.9rem; margin-top: 1rem; color: var(--muted-2);">
          Share your achievement on LinkedIn!
        </p>
      </div>
    `;

    // Attach click handler
    document.getElementById('certificate-button').addEventListener('click', generateCertificate);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showCertificateButton);
  } else {
    showCertificateButton();
  }

  // Export for manual triggering
  window.generateCertificate = generateCertificate;
  window.checkCertificateEligibility = checkCompletion;
})();
