const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-gray-600 mb-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6 text-gray-700">
        5StarClip Production (“we”, “our”, “us”) respects your privacy. This Privacy Policy
        explains how we collect, use, and protect your information when you use our website
        and services.
      </p>

      <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Name and email address</li>
        <li>Profile information from Google Sign-In</li>
        <li>Account activity and service usage</li>
        <li>Payment and transaction details (processed securely)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-3">2. Google Login</h2>
      <p className="mb-6 text-gray-700">
        When you sign in using Google, we receive your name, email address, and profile
        picture as permitted by Google. We do not access your Google password.
      </p>

      <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>To create and manage your account</li>
        <li>To provide and improve our services</li>
        <li>To communicate important updates</li>
        <li>To ensure security and prevent fraud</li>
      </ul>

      <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
      <p className="mb-6 text-gray-700">
        We use industry-standard security measures to protect your data. However, no online
        system is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
      <p className="mb-6 text-gray-700">
        You may request access, correction, or deletion of your personal data by contacting us.
      </p>

      <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
      <p className="text-gray-700">
        Email: <strong>5starclipp@gmail.com</strong>
      </p>
    </div>
  )
}

export default PrivacyPolicy
