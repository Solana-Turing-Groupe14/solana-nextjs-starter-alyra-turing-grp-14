import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Users, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <Icon className="w-12 h-12 text-purple-600 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Soaplana
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simplifiez la gestion de vos événements avec des POAPs sur la blockchain Solana
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition duration-300 flex items-center mx-auto">
            Commencer maintenant
            <ArrowRight className="ml-2" />
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={Zap}
            title="Haut débit et faibles frais"
            description="Profitez des avantages de la blockchain Solana pour une expérience fluide et rapide."
          />
          <FeatureCard
            icon={Shield}
            title="Gestion intuitive"
            description="Créez, distribuez et visualisez vos collections de NFT en quelques clics grâce à une interface simple et performante."
          />
          <FeatureCard
            icon={Users}
            title="POAPs en direct"
            description="Facilitez le minting de vos POAPs lors d'événements en utilisant des QR codes dédiés."
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Pourquoi Soaplana ?</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">Génération de collections complètes de NFT via Metaplex et Candy Machine.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">Suivi en temps réel du nombre de NFT restants à mint.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">Galerie intuitive pour explorer et partager vos collections de POAPs.</p>
            </li>
          </ul>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Rejoignez la révolution NFT avec Soaplana
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rendez vos événements mémorables sur la blockchain !
          </p>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300">
            Découvrir Soaplana
          </button>
        </div>
      </div>
    </div>
  );
}