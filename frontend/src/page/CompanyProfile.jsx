import { useState, useEffect, use } from "react";
import Navbar from "../components/CompanyProfile/Navbar";
import Hero from "../components/CompanyProfile/Hero";
import Stats from "../components/CompanyProfile/Stats";
import About from "../components/CompanyProfile/About";
import Menu from "../components/CompanyProfile/Menu";
import Gallery from "../components/CompanyProfile/Gallery";
import Contact from "../components/CompanyProfile/Contact";
import Footer from "../components/CompanyProfile/Footer";
import AuthModal from "../components/Auth/AuthModal";
import AuthControls from "../components/Auth/AuthControls";
import useAuth from "../hooks/useAuth";
import useNavScroll from "../hooks/useNavScroll";
import { getCategories, getMenuItems, getPublicWebInformation } from "../data/cafeData";

/**
 * Company profile landing page.
 * Composes layout sections with auth state handled by custom hooks.
 */
export default function CompanyProfile() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const navSolid = useNavScroll(60);
  const { user, handleLogin, handleRegister, handleSignOut } = useAuth();
  
  const [webInfo, setWebInfo] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCat] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [menuRes, catRes] = await Promise.all([
        await getMenuItems(),
        await getCategories()
      ]);
      setMenuItems(menuRes);
      setCat(catRes);
    }
    getPublicWebInformation().then(data => {
      if (data) setWebInfo(data);
    });
    fetchData();
  }, []);

  const handleLoginAndClose = async (credentials) => {
    await handleLogin(credentials);
    setShowAuthModal(false);
  };

  const handleRegisterAndClose = async (userData) => {
    await handleRegister(userData);
    setShowAuthModal(false);
  };

  return (
    <div className="bg-[#faf8f4] text-[#1a1410] min-h-screen selection:bg-[#c8a97a]/30">
      <Navbar
      mainTitle={webInfo?.mainTitle}
        solid={navSolid}
        authControls={
          <AuthControls
            user={user}
            onLoginClick={() => setShowAuthModal(true)}
            onSignOut={handleSignOut}
            onDashboard={() => { window.location.href = "/dashboard"; }}
          />
        }
      />

      <Hero
        mainTitle={webInfo?.mainTitle}
        shortDesc={webInfo?.shortDesc}
        establishedYear={webInfo?.establishedYear}
      />
      <Stats establishedYear={webInfo?.establishedYear} />
      <About
        longDesc={webInfo?.longDesc}
        motto1={webInfo?.motto1}
        motto2={webInfo?.motto2}
        motto3={webInfo?.motto3}
        establishedYear={webInfo?.establishedYear}
      />
      {
        menuItems.length > 0 && categories.length > 0 && (
          <Menu items={menuItems} menuCategories={categories} />
        )
      }
      <Gallery gallery={webInfo?.gallery} />
      <Contact
        address={webInfo?.address}
        openingHours={webInfo?.openingHours}
        phoneNumber={webInfo?.phoneNumber}
        mapsLink={webInfo?.mapsLink}
      />
      <Footer mainTitle={webInfo?.mainTitle} />

      {showAuthModal && (
        <AuthModal
        mainTitle={webInfo?.mainTitle}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLoginAndClose}
          onRegister={handleRegisterAndClose}
        />
      )}
    </div>
  );
}
