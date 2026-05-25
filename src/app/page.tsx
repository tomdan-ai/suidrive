/**
 * Home Page
 * Landing page for SuiDrive
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-blue-400">SuiDrive</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Immutable File History Protocol
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Preserve permanent, verifiable file history for every type of file on the internet.
            Powered by Walrus + Sui + AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-20">
            <Link
              href="/upload"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition"
            >
              Upload File
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-lg transition"
            >
              View Dashboard
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FeatureCard
              icon="📁"
              title="Immutable Uploads"
              description="Every file stored permanently on Walrus"
            />
            <FeatureCard
              icon="🔗"
              title="Version History"
              description="Git-style timeline for all file types"
            />
            <FeatureCard
              icon="🤖"
              title="AI Intelligence"
              description="Powered by NVIDIA NIM + DeepSeek"
            />
            <FeatureCard
              icon="✓"
              title="Ownership Proof"
              description="Cryptographic verification on Sui"
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <Step
              number={1}
              title="Upload Your File"
              description="Select any file type and upload to SuiDrive"
            />
            <Step
              number={2}
              title="Stored on Walrus"
              description="File is permanently stored on decentralized Walrus network"
            />
            <Step
              number={3}
              title="Recorded on Sui"
              description="Immutable version object created on Sui blockchain"
            />
            <Step
              number={4}
              title="AI Analysis"
              description="AI generates summary and insights about your file"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-400">
        <p>Built with Walrus, Sui, and Tatum • Powered by NVIDIA NIM</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
