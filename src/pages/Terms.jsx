const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

      <p className="text-gray-600 mb-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6 text-gray-700">
        By accessing or using 5StarClip Production, you agree to comply with these Terms and Conditions.
      </p>

      <h2 className="text-xl font-semibold mb-3">1. Use of Services</h2>
      <p className="mb-6 text-gray-700">
        You must be at least 18 years old to use our services. You agree to use the platform
        only for lawful purposes.
      </p>

      <h2 className="text-xl font-semibold mb-3">2. Accounts</h2>
      <p className="mb-6 text-gray-700">
        You are responsible for maintaining the confidentiality of your account credentials.
        Any activity under your account is your responsibility.
      </p>

      <h2 className="text-xl font-semibold mb-3">3. Payments</h2>
      <p className="mb-6 text-gray-700">
        All payments are subject to review and approval. We reserve the right to refuse or
        cancel any transaction.
      </p>

      <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
      <p className="mb-6 text-gray-700">
        All content, branding, and materials belong to 5StarClip Production and may not be
        reused without permission.
      </p>

      <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
      <p className="mb-6 text-gray-700">
        We may suspend or terminate your account if you violate these terms.
      </p>

      <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
      <p className="mb-6 text-gray-700">
        We are not liable for any indirect or consequential damages arising from use of our services.
      </p>

      <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
      <p className="text-gray-700">
        Email: <strong>5starclipp@gmail.com</strong>
      </p>
    </div>
  )
}

export default Terms
