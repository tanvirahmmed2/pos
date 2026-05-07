import BottomBar from "@/components/bar/BottomBar"
import Footer from "@/components/bar/Footer"
import Navbar from "@/components/bar/Navbar"


export const metadata = {
  title: 'Home',
  description: 'Home page'
}

const MainLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen relative">
      <Navbar />
      <div className="w-full mt-14  min-h-screen flex">{children}</div>
      
      <Footer />
      <BottomBar/>
    </div>
  )
}

export default MainLayout
