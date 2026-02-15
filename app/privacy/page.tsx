export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: February 15, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              DebtCrusher.ai ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our website 
              and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Email address (for account creation and communication)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Name and contact information (if voluntarily provided)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Uploaded Documents</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Medical bills and healthcare documents</li>
              <li>Credit reports and financial documents</li>
              <li>Any other documents you choose to upload for analysis</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Analysis Results</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>AI analysis results and recommendations</li>
              <li>Generated dispute letters and templates</li>
              <li>Tracking information for disputes initiated</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Technical Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and local storage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide AI analysis of your documents</li>
              <li>Generate personalized dispute letters and templates</li>
              <li>Maintain your account and provide customer support</li>
              <li>Process payments and prevent fraud</li>
              <li>Improve our services through analytics</li>
              <li>Send important updates about your account or our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-blue-200 mb-2">Automatic Deletion</h3>
              <p className="text-gray-300 leading-relaxed">
                Uploaded documents are automatically deleted after analysis <strong>unless you create an account</strong>. 
                Account holders can save their analysis results for future reference.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-3">Specific retention periods:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Guest uploads:</strong> Deleted immediately after analysis</li>
              <li><strong>Account data:</strong> Retained until account deletion</li>
              <li><strong>Payment records:</strong> 7 years for tax and legal compliance</li>
              <li><strong>Support communications:</strong> 3 years</li>
              <li><strong>Analytics data:</strong> Anonymized after 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Encryption:</strong> 256-bit AES encryption in transit and at rest</li>
              <li><strong>Access Controls:</strong> Strict employee access controls and monitoring</li>
              <li><strong>Secure Infrastructure:</strong> Cloud providers with SOC 2 compliance</li>
              <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              <li><strong>Data Minimization:</strong> We only collect necessary information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">We use the following third-party services:</p>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Anthropic AI</h3>
              <p className="text-gray-300 text-sm">
                For AI-powered document analysis. Documents are processed securely and not stored by Anthropic.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Stripe</h3>
              <p className="text-gray-300 text-sm">
                For secure payment processing. We never store your payment information directly.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Lob</h3>
              <p className="text-gray-300 text-sm">
                For letter printing and mailing services when you choose to send dispute letters.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. HIPAA Disclaimer</h2>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-4">
              <p className="text-yellow-200 font-semibold mb-2">Important Healthcare Privacy Notice:</p>
              <p className="text-gray-300 leading-relaxed">
                <strong>We are NOT a covered entity under HIPAA.</strong> When you upload medical documents, 
                you are voluntarily sharing this information for educational analysis. We recommend removing 
                any highly sensitive personal information before upload if you have privacy concerns.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Privacy Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Download your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at support@debtcrusher.ai or use the account settings page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              California residents have additional privacy rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong>We do NOT sell your personal information</strong> to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cookies and Local Storage</h2>
            <p className="text-gray-300 leading-relaxed mb-3">We use cookies and local storage for:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Authentication and session management</li>
              <li>Saving your preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Providing personalized experiences</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You can manage cookies through your browser settings, but some features may not work properly 
              if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 18 years of age. We do not knowingly collect 
              personal information from children under 18. If you are under 18, please do not use our services 
              or provide any information to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. International Users</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are hosted in the United States. If you are accessing our services from outside 
              the United States, your information will be transferred to and processed in the United States 
              where data protection laws may differ from your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page with an updated "last modified" date. Your continued use 
              of our services after any changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-gray-300">
                Email: support@debtcrusher.ai<br />
                Website: https://debtcrusher.ai<br />
                Subject Line: "Privacy Policy Inquiry"
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}