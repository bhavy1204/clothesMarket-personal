import { Link } from "react-router-dom";
import {
  InstagramLogo,
  WhatsappLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import InstallModal from "../common/InstallModal";
import { useState } from "react";

export default function Footer() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const year = new Date().getFullYear();

 
  return (
    <footer className="bg-surface border-t border-border ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <p className="text-lg font-bold text-primary mb-2">ClothesMarket</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Discover local clothing shops near you and enquire directly on
            WhatsApp.
          </p>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            { to: "/products", label: "All products" },
            { to: "/nearby", label: "Shops near me" },
          ]}
        />

        <FooterColumn
          title="Sell with us"
          links={[
            { to: "/seller/register", label: "Register your shop" },
            { to: "/login", label: "Seller login" },
            { to: "/staff/login", label: "Staff login" },
          ]}
        />

        <FooterColumn
          title="App"
          links={[
            {
              label: "Install App",
              onClick: () => setShowInstallModal(true),
            },
          ]}
        />

        <InstallModal
          open={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />

        <FooterColumn
          title="Legal"
          links={[
            { to: "/privacy-policy", label: "Privacy policy" },
            { to: "/terms-and-conditions", label: "Terms & conditions" },
            { to: "/refund-policy", label: "Refund policy" },
          ]}
        />

        <div>
          <p className="text-sm font-semibold text-text mb-3">Get in touch</p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:cosmanianhanshul722@gmail.com"
              aria-label="Email"
              className="text-text-muted hover:text-primary"
            >
              <EnvelopeSimple size={20} />
            </a>
            <a
              href="https://wa.me/+919358427623"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-text-muted hover:text-primary"
            >
              <WhatsappLogo size={20} />
            </a>
            <a
              href="https://instagram.com/clothesmarket38"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-text-muted hover:text-primary"
            >
              <InstagramLogo size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 px-4 sm:px-6">
        <p className="text-xs text-text-muted text-center">
          © {year} clothesMarket. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text mb-3">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((link, index) => (
          <li key={link.to || link.label || index}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={link.onClick}
                className="text-sm text-text-muted hover:text-primary transition-colors text-left"
              >
                {link.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
