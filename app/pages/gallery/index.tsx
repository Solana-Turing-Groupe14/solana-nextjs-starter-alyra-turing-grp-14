'use client'

import NFTViewer from '@components/NFTViewer'
import UserData from '@components/UserData'

export default function GalleryPage() {
  return (
    <main>
      <h1>Your NFT Gallery</h1>
      <UserData />
      <NFTViewer />
      {/* Ajoutez le composant de galerie ici */}
    </main>
  )
}