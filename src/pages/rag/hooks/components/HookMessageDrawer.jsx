import { useEffect } from 'react';
import CommonButton from '../../../../components/common-button';

const INSPIRATION_PRESETS = [
  "👋 Need help finding the right solution? I'm here!",
  "💡 Looking for custom web, app, or AI development? Let's talk!",
  "🚀 Want an instant quote or service breakdown? Ask Jerry!",
  "✨ Have questions about pricing or tech stacks?",
  "📱 Planning to build an iOS or Android app? Let's chat!",
];

const DELAY_PRESETS = [
  { label: '10s (Fast)', value: 10 },
  { label: '20s', value: 20 },
  { label: '30s (Default)', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s (Patient)', value: 60 },
];

function HookMessageDrawer({
  isOpen,
  editId,
  messageText,
  displayFrequency,
  isActive,
  saving,
  onClose,
  onTextChange,
  onFrequencyChange,
  onActiveChange,
  onApplyPreset,
  onSave,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const charCount = messageText.length;
  const isOverLimit = charCount > 140;
  const isNearLimit = charCount > 120 && !isOverLimit;

  const livePreview =
    messageText.trim() ||
    "👋 Hi there! Need help choosing the right tech stack or quote? Let's talk!";

  return (
    <div className="hm-drawer-root">
      {/* Backdrop */}
      <div className="hm-drawer-backdrop" onClick={onClose} />

      {/* Slide-Over Panel */}
      <div className="hm-drawer-panel" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="hm-drawer-header">
          <div className="hm-drawer-header-info">
            <span className="hm-drawer-badge">
              {editId ? 'Editing Nudge' : 'New Hook Nudge'}
            </span>
            <h3 className="hm-drawer-title">
              {editId ? 'Edit Hook Message' : 'Create Hook Nudge'}
            </h3>
            <p className="hm-drawer-desc">
              Hook messages pop up as animated speech bubbles next to the Jerry AI launcher to capture visitor interest.
            </p>
          </div>
          <button
            type="button"
            className="hm-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="hm-drawer-body">
          {/* Section 1: Quick Inspiration Presets */}
          <div className="hm-form-section">
            <label className="hm-form-section-title">
              ⚡ Quick Inspiration Presets
            </label>
            <p className="hm-form-section-sub">
              Click any suggestion below to pre-fill engaging copy for visitors.
            </p>
            <div className="hm-presets-list">
              {INSPIRATION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="hm-preset-btn"
                  onClick={() => onApplyPreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Message Copy Textarea */}
          <div className="hm-form-section">
            <div className="hm-input-label-row">
              <label htmlFor="hm-message-input" className="hm-form-section-title">
                Message Copy <span className="hm-required-star">*</span>
              </label>
              <span
                className={`hm-char-tag ${
                  isOverLimit
                    ? 'hm-char-tag--danger'
                    : isNearLimit
                    ? 'hm-char-tag--warn'
                    : ''
                }`}
              >
                {charCount} / 140 chars
              </span>
            </div>
            <textarea
              id="hm-message-input"
              className="hm-textarea"
              rows={3}
              maxLength={140}
              placeholder="e.g. Need help choosing the right tech stack? Ask me!"
              value={messageText}
              onChange={(e) => onTextChange(e.target.value)}
            />
            <span className="hm-helper-note">
              Keep it punchy, friendly, and under 140 characters for optimal mobile viewing.
            </span>
          </div>

          {/* Section 3: Display Delay */}
          <div className="hm-form-section">
            <div className="hm-input-label-row">
              <label htmlFor="hm-delay-input" className="hm-form-section-title">
                Display Delay (seconds)
              </label>
              <span className="hm-delay-current-tag">{displayFrequency}s delay</span>
            </div>

            {/* Quick delay presets */}
            <div className="hm-delay-chips">
              {DELAY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`hm-delay-chip ${
                    Number(displayFrequency) === p.value ? 'hm-delay-chip--active' : ''
                  }`}
                  onClick={() => onFrequencyChange(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="hm-delay-input-wrapper">
              <input
                id="hm-delay-input"
                type="number"
                min="5"
                max="3600"
                step="1"
                className="hm-number-input"
                value={displayFrequency}
                onChange={(e) =>
                  onFrequencyChange(Math.max(5, Number(e.target.value) || 30))
                }
              />
              <span className="hm-delay-unit">seconds</span>
            </div>
            <span className="hm-helper-note">
              Seconds to wait after landing before showing this popup next to the launcher (minimum 5s, default 30s).
            </span>
          </div>

          {/* Section 4: Active Switch */}
          <div className="hm-form-section">
            <div className="hm-switch-card">
              <label className="hm-switch-toggle" htmlFor="hm-active-drawer-toggle">
                <input
                  id="hm-active-drawer-toggle"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => onActiveChange(e.target.checked)}
                />
                <span className="hm-switch-thumb" />
              </label>
              <div className="hm-switch-info">
                <span className="hm-switch-main-label">Active immediately</span>
                <span className="hm-switch-sub-label">
                  When enabled, visitors will see this in rotation on the live site.
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Real-Time Live Widget Simulator */}
          <div className="hm-form-section">
            <label className="hm-form-section-title">
              🎨 Live Launcher Preview
            </label>
            <p className="hm-form-section-sub">
              Real-time rendering of how Jerry presents this nudge to desktop and mobile visitors.
            </p>

            <div className="hm-sim-box">
              {/* Simulated website background lines */}
              <div className="hm-sim-mockup-lines" aria-hidden="true">
                <div className="hm-sim-line" style={{ width: '55%' }} />
                <div className="hm-sim-line" style={{ width: '85%' }} />
                <div className="hm-sim-line" style={{ width: '40%' }} />
              </div>

              {/* Proactive Speech Bubble Nudge */}
              <div className="hm-sim-widget-cluster">
                <div className="hm-sim-speech-card">
                  <div className="hm-sim-speech-body">
                    <div className="hm-sim-speech-head">
                      <span className="hm-sim-avatar-dot" />
                      <span className="hm-sim-name">Jerry</span>
                      <span className="hm-sim-badge">AI</span>
                      <div className="hm-sim-wave-bars" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <p className="hm-sim-text">{livePreview}</p>
                    <div className="hm-sim-cta">Chat with Jerry →</div>
                  </div>
                  <span className="hm-sim-close" title="Dismiss simulation">✕</span>
                </div>

                {/* Simulated Floating Launcher Button */}
                <div className="hm-sim-orb-container">
                  <div className="hm-sim-orb-glow" />
                  <div className="hm-sim-orb-circle">
                    <span className="hm-sim-orb-icon">💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="hm-drawer-footer">
          <button
            type="button"
            className="hm-drawer-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <CommonButton
            text={saving ? 'Saving...' : editId ? 'Save Changes' : 'Publish Hook'}
            onClick={onSave}
            disabled={saving || !messageText.trim()}
            backgroundColor="var(--primary)"
            color="#ffffff"
            borderColor="var(--primary)"
          />
        </div>
      </div>
    </div>
  );
}

export default HookMessageDrawer;

