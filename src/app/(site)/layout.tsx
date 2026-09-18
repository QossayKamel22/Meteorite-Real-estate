import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import BackToTop from "@/components/BackToTop";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgressBar />
      <RouteTransitionOverlay />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
