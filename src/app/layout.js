
import Footer from "./Footer";
import "./globals.css";
import Navbar from "./Navbar";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        
      >
        <Navbar/>
       
        {children}
         <Footer/>
      </body>
    </html>
  );
}
