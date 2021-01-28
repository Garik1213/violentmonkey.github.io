import React, { useEffect, useState } from 'react';
import { StaticQuery, Link, graphql } from 'gatsby';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';
import ScrollIndicator from '#/components/scroll-indicator';

const url = 'https://gist.githubusercontent.com/gera2ld/4f420d733bcd462aa02efe6423f15ffa/raw/d138c192e5c525675679837661cf1355f9604b93/loader.js';

async function loadBanner() {
  const res = await fetch(url);
  const text = await res.text();
  const script = document.createElement('script');
  script.textContent = text;
  document.body.append(script);
  script.remove();
  const html = await window.initializeBanner?.();
  return html;
}

function trackBanner(action) {
  trackCustomEvent({
    category: 'global',
    action,
    label: 'banner',
    transport: 'beacon',
  });
}

function Banner() {
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    loadBanner().then(html => {
      if (html) {
        setBanner(html);
        trackBanner('show');
      }
    });
  }, []);
  const handleClose = () => {
    setBanner(null);
    trackBanner('hide');
  };
  if (!banner) return null;
  return (
    <div className="bg-orange-200 px-4 text-sm flex">
      <div className="flex-1" dangerouslySetInnerHTML={{ __html: banner }}></div>
      <div onClick={handleClose} class="cursor-pointer text-gray-600">
        ⨯
      </div>
    </div>
  );
}

function Header(props) {
  const { data, onToggle } = props;
  return (
    <header className="sticky top-0 left-0 right-0 bg-white z-10">
      <nav>
        <a className="toggle" onClick={onToggle}>
          <svg viewBox="0 0 24 24">
            <path d="M0 0h24v4h-24zM0 10h24v4h-24zM0 20h24v4h-24z" />
          </svg>
        </a>
        <Link to="/" className="brand">
          Violentmonkey
        </Link>
        <span className="flex-1" />
        <div className="overflow-auto min-w-0 flex whitespace-no-wrap">
          {data.site.siteMetadata.menu.map(item => (
            <Link
              className="nav-item"
              key={item.path}
              to={item.path}
              activeClassName="active"
              partiallyActive
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <ScrollIndicator />
    </header>
  );
}

export default props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            menu {
              label
              path
            }
          }
        }
      }
    `}
    render={data => (
      <>
        <Banner />
        <Header
          {...props}
          data={data}
        />
      </>
    )}
  />
);
