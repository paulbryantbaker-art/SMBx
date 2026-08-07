/**
 * /legal/privacy — CARTA chrome (2026-08-07; was the retired product-era
 * PublicLayout with a terra-hex link). COPY UNCHANGED in this pass — it is
 * dated February 2026 and still speaks product-era language ("your deal
 * room", "delete your account"); rewriting a privacy notice is a content
 * decision for Paul, flagged in the conversion record, not a restyle.
 */
import { LegalFrame, LegalH2 } from './Terms';

const strong = { color: '#16181A', fontWeight: 600 } as const;

export default function Privacy() {
  return (
    <LegalFrame crumb="PRIVACY" title="Privacy Policy">
      <p style={{ margin: 0 }}><strong style={strong}>Last updated:</strong> February 2026</p>

      <div>
        <LegalH2>What we collect</LegalH2>
        <p style={{ margin: 0 }}>
          When you use smbx.ai, we collect the information you provide directly: your name,
          email address, and the content of your conversations with Yulia. We also collect
          standard technical data such as IP address, browser type, and usage patterns to
          improve the service.
        </p>
      </div>

      <div>
        <LegalH2>How we use it</LegalH2>
        <p style={{ margin: 0 }}>
          Your information is used to provide and improve the smbx.ai service, including
          generating valuations, financial analyses, and deal documents. We do not sell your
          personal information to third parties. Your business data remains yours.
        </p>
      </div>

      <div>
        <LegalH2>Data security</LegalH2>
        <p style={{ margin: 0 }}>
          We use industry-standard encryption and security practices to protect your data.
          All conversations and financial information are encrypted in transit and at rest.
          Access to your deal room is limited to you and the people you explicitly invite.
        </p>
      </div>

      <div>
        <LegalH2>AI and your data</LegalH2>
        <p style={{ margin: 0 }}>
          Yulia uses AI to analyze your business information and generate work product.
          Your data is not used to train AI models. Each conversation is processed
          independently and confidentially.
        </p>
      </div>

      <div>
        <LegalH2>Your rights</LegalH2>
        <p style={{ margin: 0 }}>
          You can request a copy of your data, correct inaccuracies, or delete your account
          at any time by contacting us at hello@smbx.ai. When you delete your account,
          all associated data is permanently removed within 30 days.
        </p>
      </div>

      <div>
        <LegalH2>Cookies</LegalH2>
        <p style={{ margin: 0 }}>
          We use essential cookies to maintain your session and preferences. We do not use
          third-party advertising cookies or tracking pixels.
        </p>
      </div>

      <div>
        <LegalH2>Contact</LegalH2>
        <p style={{ margin: 0 }}>
          Questions about this policy? Email us at{' '}
          <a href="mailto:hello@smbx.ai" className="ca-h-deepgreen" style={{ color: '#0A7A58', borderBottom: '1px solid #0A7A58', paddingBottom: 1 }}>hello@smbx.ai</a>.
        </p>
      </div>
    </LegalFrame>
  );
}
