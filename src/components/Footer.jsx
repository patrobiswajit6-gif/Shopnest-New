import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>ShopNest</strong>
          <p>Built as an academic full-stack demo — product data powered by the DummyJSON API.</p>
        </div>
        <div className="site-footer-cols">
          <div>
            <span>Shop</span>
            <p>Categories</p>
            <p>New Arrivals</p>
          </div>
          <div>
            <span>Support</span>
            <p>Track Order</p>
            <p>Returns &amp; Refunds</p>
          </div>
          <div>
            <span>Company</span>
            <p>About</p>
            <p>Careers</p>
          </div>
        </div>
      </div>
      <style>{`
        .site-footer {
          background: var(--navy-deep);
          color: #cdd6e8;
          margin-top: 48px;
        }
        .site-footer-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 36px 24px;
          display: flex;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .site-footer strong {
          color: #fff;
          font-family: var(--font-display);
          font-size: 18px;
        }
        .site-footer-inner > div:first-child {
          max-width: 320px;
        }
        .site-footer p {
          font-size: 13px;
          margin: 6px 0 0;
          color: #aebbd3;
        }
        .site-footer-cols {
          display: flex;
          gap: 40px;
        }
        .site-footer-cols span {
          font-weight: 700;
          color: #fff;
          font-size: 13px;
        }
      `}</style>
    </footer>
  )
}
