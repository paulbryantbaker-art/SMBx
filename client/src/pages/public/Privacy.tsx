import PublicLayout from '../../components/public/PublicLayout';

export default function Privacy() {
  return (
    <PublicLayout>
      <section className="max-w-[800px] mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <h1 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.03em] mb-10 m-0">
          Privacy Policy
        </h1>
        <div className="space-y-8 text-[15px] text-[#4A4843] leading-[1.7]">
          <p className="m-0">
            <strong className="text-[#1A1A18]">Last updated:</strong> February 2026
          </p>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">What we collect</h2>
            <p className="m-0">
              When you use smbx.ai, we collect the information you provide directly: your name,
              email address, and the content of your conversations with Yulia. We also collect
              standard technical data such as IP address, browser type, and usage patterns to
              improve the service.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">How we use it</h2>
            <p className="m-0">
              Your information is used to provide and improve the smbx.ai service, including
              generating valuations, financial analyses, and deal documents. We do not sell your
              personal information to third parties. Your business data remains yours.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">Data security</h2>
            <p className="m-0">
              We use industry-standard encryption and security practices to protect your data.
              All conversations and financial information are encrypted in transit and at rest.
              Access to your deal room is limited to you and the people you explicitly invite.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">AI and your data</h2>
            <p className="m-0">
              Yulia uses AI to analyze your business information and generate work product.
              Your data is not used to train AI models. Each conversation is processed
              independently and confidentially.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">Your rights</h2>
            <p className="m-0">
              You can request a copy of your data, correct inaccuracies, or delete your account
              at any time by contacting us at hello@smbx.ai. When you delete your account,
              all associated data is permanently removed within 30 days.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">Cookies</h2>
            <p className="m-0">
              We use essential cookies to maintain your session and preferences. We do not use
              third-party advertising cookies or tracking pixels.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">Contact</h2>
            <p className="m-0">
              Questions about this policy? Email us at{' '}
              <a href="mailto:hello@smbx.ai" className="text-[#D4714E] underline">hello@smbx.ai</a>.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
