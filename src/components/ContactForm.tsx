import React, { useEffect, useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailEnabled, setEmailEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const loadEmailStatus = async () => {
      try {
        const response = await fetch('/api/contact-form', { method: 'GET' });
        const result = await response.json().catch(() => ({}));
        setEmailEnabled(!!result.enabled);
      } catch {
        setEmailEnabled(false);
      }
    };

    loadEmailStatus();
  }, []);

  // Sanitize input by removing HTML tags and dangerous script content
  const sanitizeInput = (input: string, allowWhitespace: boolean = false): string => {
    let sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=

    if (!allowWhitespace) {
      sanitized = sanitized.replace(/[<>'"&]/g, '').trim();
    }

    return sanitized;
  };

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrævet';
    } else if (formData.name.length > 80) {
      newErrors.name = 'Navn må maksimalt være 80 tegn';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail er påkrævet';
    } else if (formData.email.length > 100) {
      newErrors.email = 'E-mail må maksimalt være 100 tegn';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Indtast en gyldig e-mail adresse';
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Besked er påkrævet';
    } else if (formData.message.length > 500) {
      newErrors.message = 'Besked må maksimalt være 500 tegn';
    }

    // Check line count (max 40 lines)
    const lineCount = formData.message.split('\n').length;
    if (lineCount > 40) {
      newErrors.message = 'Besked må maksimalt være 40 linier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const allowWhitespace = field === 'message' || field === 'name';
    const sanitizedValue = sanitizeInput(value, allowWhitespace);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Sanitize all form data before submission
      const sanitizedData = {
        name: sanitizeInput(formData.name, true),
        email: sanitizeInput(formData.email, false),
        message: sanitizeInput(formData.message, true)
      };

      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-white p-8 rounded-xl text-gray-900">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-2xl font-bold mb-4 text-green-800" role="status" aria-live="polite">Tak for din besked!</h3>
          <p className="text-gray-600 mb-6">
            Din besked er sendt succesfuldt. Jeg vender tilbage til dig hurtigst muligt.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Send ny besked
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl text-gray-900">
      <h3 className="text-2xl font-bold mb-6">Kontakt mig</h3>
      <p className="text-gray-600 mb-6">
        Har du spørgsmål eller vil du dele dine tanker? Jeg vil gerne høre fra dig.
      </p>

      {emailEnabled === false && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-800">
                Det er desværre ikke muligt at sende emails lige nu
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Prøv venligst igen senere.
              </p>
            </div>
          </div>
        </div>
      )}

      {emailEnabled !== false && submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert" aria-live="assertive">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Der opstod en fejl ved afsendelse</p>
              <p className="text-sm">Email indstillingerne er muligvis ikke konfigureret korrekt. Kontakt administratoren.</p>
            </div>
          </div>
        </div>
      )}

      {emailEnabled !== false && (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="sr-only">Dit navn</label>
          <input
            id="contact-name"
            type="text"
            placeholder="Dit navn"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            maxLength={80}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : 'name-counter'}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>
          )}
          <p id="name-counter" className="text-xs text-gray-500 mt-1" aria-live="polite">{formData.name.length}/80 tegn</p>
        </div>

        <div>
          <label htmlFor="contact-email" className="sr-only">Din e-mail adresse</label>
          <input
            id="contact-email"
            type="email"
            placeholder="Din E-mail"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            maxLength={100}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : 'email-counter'}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>
          )}
          <p id="email-counter" className="text-xs text-gray-500 mt-1" aria-live="polite">{formData.email.length}/100 tegn</p>
        </div>

        <div>
          <label htmlFor="contact-message" className="sr-only">Din besked</label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Din besked..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            maxLength={500}
            aria-required="true"
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : 'message-counter'}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.message && (
            <p id="message-error" className="text-red-500 text-sm mt-1" role="alert">{errors.message}</p>
          )}
          <p id="message-counter" className="text-xs text-gray-500 mt-1" aria-live="polite">
            {formData.message.length}/500 tegn · {formData.message.split('\n').length}/40 linier
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Sender besked"></div>
              <span aria-live="polite">Sender...</span>
            </>
          ) : (
            <>
              <Send size={20} aria-hidden="true" />
              Send besked
            </>
          )}
        </button>
      </form>
      )}
    </div>
  );
};

export default ContactForm;
