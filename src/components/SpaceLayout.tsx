import { ArrowLeft, ExternalLink, Compass, Tv, Gamepad2, Sparkles } from 'lucide-react';
import './SpaceLayout.css';

interface SpaceLayoutProps {
  onBack: () => void;
}

export const SpaceLayout = ({ onBack }: SpaceLayoutProps) => {
  return (
    <div className="layout-container fade-in">
      <header className="layout-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={16} />
          <span>back</span>
        </button>
        <span className="layout-logo">zijh</span>
      </header>

      <main className="layout-main">
        <h2 className="section-title">my space // interests</h2>
        <p className="space-intro">A curated shelf of links, profiles, and media resources that shape my hobbies outside of coding.</p>

        <div className="space-grid">
          {/* ELITE DANGEROUS SECTION */}
          <section className="space-section glassmorphism">
            <div className="section-header-row">
              <Compass size={18} className="space-icon cyan" />
              <h3>Cmdr Jack Heather // Elite</h3>
            </div>
            <p>I fly in the black. Main profiles and flight statistics:</p>
            <ul className="space-links">
              <li>
                <a href="https://inara.cz/elite/cmdr/463635/" target="_blank" rel="noopener noreferrer">
                  <span>Inara Commander Profile</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.edsm.net/en/user/profile/id/187652/cmdr/Jack+Heather" target="_blank" rel="noopener noreferrer">
                  <span>EDSM Flight Logs</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </section>

          {/* MEDIA & CHANNELS */}
          <section className="space-section glassmorphism">
            <div className="section-header-row">
              <Tv size={18} className="space-icon violet" />
              <h3>Media & Channels</h3>
            </div>
            <p>YouTube channels, streaming, and content archives:</p>
            <ul className="space-links">
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <span>Main YouTube Channel</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer">
                  <span>Twitch Broadcasts</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </section>

          {/* GAMING & ANIME */}
          <section className="space-section glassmorphism">
            <div className="section-header-row">
              <Gamepad2 size={18} className="space-icon emerald" />
              <h3>Gaming & Inspiration</h3>
            </div>
            <p>Titles, universes, and series that resonate:</p>
            <ul className="space-links font-mono-list">
              <li>
                <span className="space-tag">anime:</span> Hunter x Hunter (Ging Freecss fan)
              </li>
              <li>
                <span className="space-tag">sims:</span> Elite Dangerous, MSFS
              </li>
              <li>
                <span className="space-tag">retro:</span> Rogue-likes, Classic RPGs
              </li>
            </ul>
          </section>

          {/* GENERAL INFO */}
          <section className="space-section glassmorphism">
            <div className="section-header-row">
              <Sparkles size={18} className="space-icon amber" />
              <h3>Vibes & Tech Gear</h3>
            </div>
            <p>Current setup and physical equipment:</p>
            <ul className="space-links font-mono-list">
              <li>
                <span className="space-tag">layout:</span> Dvorak Keyboard Layout
              </li>
              <li>
                <span className="space-tag">editor:</span> Vim keybindings everywhere
              </li>
              <li>
                <span className="space-tag">os:</span> Linux (Main driver)
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};
