import dynamic from 'next/dynamic'
import { NextPage } from "next"

const DynamicGalleryPageContent = dynamic(
  () => import('../../components/GalleryPageContent'),
  { ssr: false }
)

const GalleryPage: NextPage = () => {
  return <DynamicGalleryPageContent />
}

export default GalleryPage