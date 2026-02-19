import React, { useState, useEffect } from 'react';

// ─── Icon Components ─────────────────────────────────────────────────────────

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.08">
    <path d="M11 7.5V13H7.5c0 1.25.5 2.5 2 3.5L8 18c-2.5-1.5-4-4-4-7V5h7v2.5zm9 0V13h-3.5c0 1.25.5 2.5 2 3.5L17 18c-2.5-1.5-4-4-4-7V5h7v2.5z"/>
  </svg>
);

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Speaking', href: '#speaking' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="font-serif text-lg font-semibold text-slate-900 tracking-tight"
          >
            Matt Morgan, MD
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://substack.com/@mattmorganmd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              Writing <ExternalLinkIcon />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-700 p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden pb-6 border-t border-slate-100">
            <div className="flex flex-col pt-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-base text-slate-600 hover:text-slate-900 py-2 px-2 rounded transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://substack.com/@mattmorganmd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-slate-600 hover:text-slate-900 py-2 px-2 rounded transition-colors flex items-center gap-1.5"
              >
                Writing <ExternalLinkIcon />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="home" className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-6">
          Physician &middot; Radiologist &middot; AI Consultant &middot; Speaker
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-8">
          Helping people see clearly&mdash;in medicine, technology, and life.
        </h1>
        <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mb-10">
          I'm Matt Morgan, a diagnostic radiologist who brings clarity to complex
          topics&mdash;from AI in healthcare to the principles that drive personal
          growth. For over eight years, I've spoken at BYU Education Week and to
          audiences nationwide on living with greater intention and purpose.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded hover:bg-slate-800 transition-colors"
          >
            Book a Speaking Engagement <ArrowRightIcon />
          </a>
          <a
            href="https://substack.com/@mattmorganmd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-6 py-3 rounded hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Read My Writing <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8">
      <div className="border-t border-slate-100" />
    </div>
  );
}

// ─── About Section ───────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" className="py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Photo placeholder */}
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-slate-300 text-sm font-medium">Photo</span>
            </div>
          </div>

          {/* Bio */}
          <div className="lg:col-span-3">
            <p className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-4">
              About
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              A career built on seeing what others miss.
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                As a board-certified diagnostic radiologist, I've spent my career
                developing the ability to look beneath the surface&mdash;finding
                meaning in complexity and delivering clarity when it matters most.
                That same skill set now extends beyond the reading room.
              </p>
              <p>
                I consult with healthcare organizations and technology companies
                on the practical application of artificial intelligence in
                medicine&mdash;bridging the gap between what AI can do and what
                clinicians actually need.
              </p>
              <p>
                But my deepest passion is helping people live with more purpose.
                For over eight years, I've been a featured speaker at BYU Education
                Week, where I teach on topics ranging from resilience and decision-making
                to finding meaning in everyday life. I bring the same rigor I apply
                to medicine to the art of personal development.
              </p>
              <p>
                I'm also exploring a new venture: leading wellness-focused travel
                experiences that combine meaningful destinations with guided
                reflection and personal growth.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {[
                { title: 'Diagnostic Radiology', desc: 'Board-certified physician specializing in medical imaging and diagnosis' },
                { title: 'AI in Healthcare', desc: 'Consulting on practical AI implementation for clinical settings' },
                { title: 'Personal Development', desc: '8+ years speaking at BYU Education Week and national events' },
                { title: 'Wellness Travel', desc: 'Curating intentional travel experiences focused on growth and renewal' },
              ].map((item) => (
                <div key={item.title} className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Speaking Section ────────────────────────────────────────────────────────

const SPEAKING_TOPICS = [
  {
    title: 'AI and the Future of Medicine',
    description: 'A grounded, practical look at how artificial intelligence is reshaping healthcare\u2014and what it means for patients and providers alike.',
  },
  {
    title: 'The Clarity Principle',
    description: 'Lessons from the reading room on making better decisions, cutting through noise, and seeing what truly matters.',
  },
  {
    title: 'Building a Resilient Life',
    description: 'Practical frameworks for navigating uncertainty, recovering from setbacks, and designing a life of purpose.',
  },
  {
    title: 'Intentional Living',
    description: 'How small, consistent choices compound into extraordinary outcomes\u2014drawn from medicine, psychology, and personal experience.',
  },
];

function Speaking() {
  return (
    <section id="speaking" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-4">
            Speaking
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Topics that resonate.
          </h2>
          <p className="text-slate-500 leading-relaxed">
            I speak to audiences ranging from healthcare professionals to
            university students to corporate teams. Every talk is designed to
            leave people with ideas they can act on immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SPEAKING_TOPICS.map((topic) => (
            <div
              key={topic.title}
              className="bg-white rounded-lg p-6 lg:p-8 border border-slate-100"
            >
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-3">
                {topic.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg p-8 lg:p-10 border border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
                Featured: BYU Education Week
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                For over eight consecutive years, I've been invited to teach at
                BYU Education Week&mdash;one of the largest continuing education
                programs in the country, drawing tens of thousands of attendees
                each summer.
              </p>
            </div>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Invite Me to Speak <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "Matt has a rare gift for making complex ideas accessible and deeply personal. His talk on resilience changed the way I approach challenges in my own life.",
    name: "Education Week Attendee",
    context: "BYU Education Week",
  },
  {
    quote: "Dr. Morgan brings a physician\u2019s precision to personal development. His insights on decision-making are practical, research-backed, and immediately applicable.",
    name: "Conference Organizer",
    context: "Healthcare Leadership Summit",
  },
  {
    quote: "One of the most engaging speakers we\u2019ve ever hosted. Matt connects with audiences in a way that is both intellectually rigorous and genuinely moving.",
    name: "Event Director",
    context: "National Speaking Series",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-4">
            Testimonials
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900">
            What people are saying.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="relative">
              <QuoteIcon />
              <blockquote className="mt-4">
                <p className="text-slate-600 leading-relaxed text-sm italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.context}</p>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'speaking',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, connect to a backend or service like Formspree / Netlify Forms
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-4">
              Contact
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Let's work together.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Whether you're looking for a keynote speaker, an AI consultant, or
              a collaborator on a wellness initiative, I'd love to hear from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Speaking Engagements</h3>
                  <p className="text-sm text-slate-500">Keynotes, workshops, and educational programs</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">AI Consulting</h3>
                  <p className="text-sm text-slate-500">Healthcare AI strategy and implementation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Wellness Travel</h3>
                  <p className="text-sm text-slate-500">Guided group experiences with a focus on growth</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {submitted ? (
              <div className="bg-white rounded-lg p-8 lg:p-10 border border-slate-100 text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
                  Message sent.
                </h3>
                <p className="text-slate-500 text-sm">
                  Thank you for reaching out. I'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 lg:p-10 border border-slate-100">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-colors bg-white"
                    >
                      <option value="speaking">Speaking Engagement</option>
                      <option value="consulting">AI Consulting</option>
                      <option value="travel">Wellness Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-colors resize-none"
                      placeholder="Tell me about your event, timeline, and audience..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white text-sm font-medium py-3 rounded hover:bg-slate-800 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-10 px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Matt Morgan, MD. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://substack.com/@mattmorganmd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Substack
          </a>
          <a
            href="https://www.linkedin.com/in/mattmorganmd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  return (
    <div className="font-sans text-slate-900 antialiased">
      <Navigation />
      <main>
        <Hero />
        <Divider />
        <About />
        <Speaking />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
