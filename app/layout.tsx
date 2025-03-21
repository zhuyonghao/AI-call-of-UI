import "./globals.css";
import type { Metadata } from "next";

import { EndpointsContext } from "./agent";
import { ReactNode } from "react";
import Script from "next/script";
import { FloatingComponentProvider } from "./shared";
import { FloatingComponentContainer } from "@/components/prebuilt/FloatingComponentContainer";

export const metadata: Metadata = {
  title: "LangChain.js Gen UI",
  description: "Generative UI application with LangChain.js",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="particles-js"></div>
        <div id="title-particles"></div>
        <FloatingComponentProvider>
          <div className="content-container">
            <div className="glass-highlight"></div>
            <EndpointsContext>{props.children}</EndpointsContext>
          </div>
          <FloatingComponentContainer />
        </FloatingComponentProvider>
        
        <Script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" strategy="afterInteractive" />
        <Script id="particles-config" strategy="afterInteractive">
          {`
            if (typeof particlesJS !== 'undefined') {
              particlesJS("particles-js", {
                particles: {
                  number: { value: 100, density: { enable: true, value_area: 800 } },
                  color: { value: "#ffffff" },
                  shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 } },
                  opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                  size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
                  line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                  move: { 
                    enable: true, 
                    speed: 1.5, 
                    direction: "none", 
                    random: true, 
                    straight: false, 
                    out_mode: "out", 
                    bounce: false, 
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                  }
                },
                interactivity: {
                  detect_on: "canvas",
                  events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
                  modes: {
                    grab: { distance: 140, line_linked: { opacity: 1 } },
                    bubble: { distance: 200, size: 4, duration: 2, opacity: 0.8, speed: 3 },
                    repulse: { distance: 200, duration: 0.4 },
                    push: { particles_nb: 4 },
                    remove: { particles_nb: 2 }
                  }
                },
                retina_detect: true
              });

              particlesJS("title-particles", {
                particles: {
                  number: { value: 80, density: { enable: true, value_area: 600 } },
                  color: { value: ["#4ecdc4", "#ff6b6b", "#c06c84"] },
                  shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
                  opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1, opacity_min: 0.3, sync: false } },
                  size: { value: 4, random: true, anim: { enable: true, speed: 3, size_min: 1, sync: false } },
                  line_linked: { enable: true, distance: 120, color: "#ffffff", opacity: 0.3, width: 0.8 },
                  move: { 
                    enable: true, 
                    speed: 2, 
                    direction: "none", 
                    random: true, 
                    straight: false, 
                    out_mode: "out", 
                    bounce: false, 
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                  }
                },
                interactivity: {
                  detect_on: "canvas",
                  events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
                  modes: {
                    bubble: { distance: 150, size: 5, duration: 2, opacity: 0.8, speed: 3 },
                    push: { particles_nb: 3 }
                  }
                },
                retina_detect: true
              });
            }
            
            document.addEventListener('mousemove', function(e) {
              const x = e.clientX / window.innerWidth;
              const y = e.clientY / window.innerHeight;
              document.documentElement.style.setProperty('--mouse-x', x);
              document.documentElement.style.setProperty('--mouse-y', y);
            });
          `}
        </Script>
      </body>
    </html>
  );
}
