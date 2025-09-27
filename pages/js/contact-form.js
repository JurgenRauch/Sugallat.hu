/**
 * Contact Form Handler using EmailJS
 * Sugallat.hu - Professional Contact Form
 */

// EmailJS Configuration
const EMAILJS_CONFIG = {
    publicKey: 'klvidjuePqBFE5eAb',
    serviceId: 'service_pn1nrz6',               // ✅ Gmail service connection
    notificationTemplateId: 'template_thoqnhx', // Email to you (notification)
    autoReplyTemplateId: 'template_v5ail7e'     // Email to customer (auto-reply)
};

// Initialize EmailJS when the script loads
(function() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
})();

// Contact form handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('form-status');
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const validation = validateForm(data);
    if (!validation.isValid) {
        showFormStatus('error', validation.message);
        return;
    }
    
    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = submitButton.textContent.includes('Send') ? 'Sending...' : 'Küldés...';
    
    try {
        // Prepare template parameters - match your simple template variables
        const templateParams = {
            name: data.name || '',              // Match {{name}} in template
            email: data.email || '',            // Match {{email}} in template
            message: data.message || '',
            phone: data.phone || 'Nem adott meg',
            company: data.company || 'Nem adott meg',
            subject: data.subject || 'Általános megkeresés',
            sent_time: new Date().toLocaleTimeString('hu-HU'),
            sent_date: new Date().toLocaleDateString('hu-HU'),
            user_ip: await getUserIP()
        };
        
        // Send both emails simultaneously
        const [notificationResponse, autoReplyResponse] = await Promise.all([
            // 1. Send notification email to you
            emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.notificationTemplateId,
                templateParams
            ),
            // 2. Send auto-reply confirmation to customer
            emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.autoReplyTemplateId,
                {
                    name: data.name || '',              // Match {{name}} in template
                    email: data.email || '',            // Match {{email}} in template
                    message: data.message || '',
                    sent_date: new Date().toLocaleDateString('hu-HU')
                }
            )
        ]);

        // Show success message
        const successMessage = submitButton.textContent.includes('Send') 
            ? 'Thank you for your message! We will contact you soon. Please check your email for confirmation.'
            : 'Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot. Kérjük, ellenőrizze email fiókját a visszaigazolásért.';
            
        showFormStatus('success', successMessage);
        
        // Reset form
        form.reset();
        
        // Track successful submission (optional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: 'Contact Form Submission'
            });
        }
        
    } catch (error) {
        // Error sending email
        const errorDetails = {
            status: error.status,
            text: error.text,
            serviceId: EMAILJS_CONFIG.serviceId,
            notificationTemplate: EMAILJS_CONFIG.notificationTemplateId,
            autoReplyTemplate: EMAILJS_CONFIG.autoReplyTemplateId
        });
        
        let errorMessage;
        if (error.status === 422) {
            errorMessage = submitButton.textContent.includes('Send')
                ? 'Email configuration error. Please contact us directly at benko@sugallat.hu'
                : 'Email konfigurációs hiba. Kérjük, írjon nekünk közvetlenül: benko@sugallat.hu';
        } else {
            errorMessage = submitButton.textContent.includes('Send')
                ? 'An error occurred while sending your message. Please try again.'
                : 'Hiba történt az üzenet küldése során. Kérjük, próbálja meg később.';
        }
            
        showFormStatus('error', errorMessage);
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

function validateForm(data) {
    const errors = [];
    
    // Required field validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('A név megadása kötelező (minimum 2 karakter).');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Érvényes email cím megadása kötelező.');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Az üzenet megadása kötelező (minimum 10 karakter).');
    }
    
    // GDPR consent check (if present)
    const gdprConsent = document.getElementById('gdpr-consent');
    if (gdprConsent && !gdprConsent.checked) {
        errors.push('Az adatkezelési tájékoztató elfogadása kötelező.');
    }
    
    return {
        isValid: errors.length === 0,
        message: errors.join(' ')
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormStatus(type, message) {
    const formStatus = document.getElementById('form-status');
    if (!formStatus) return;
    
    formStatus.style.display = 'block';
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
}

async function getUserIP() {
    try {
        // Try multiple IP services in case one is blocked
        const services = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://httpbin.org/ip'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                return data.ip || data.origin || 'Ismeretlen';
            } catch (e) {
                continue; // Try next service
            }
        }
        return 'Ismeretlen';
    } catch (error) {return 'Ismeretlen';
    }
}

// Add CSS for form status messages
const statusStyles = `
<style>
.form-status {
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 500;
    margin-top: 1rem;
}

.form-status.success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.form-status.error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}

.form-status.loading {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', statusStyles);
