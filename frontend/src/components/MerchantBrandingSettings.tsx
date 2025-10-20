import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MerchantBrandingSettingsProps {
  merchantId: string;
  currentLogo?: string;
  currentTheme?: string;
  // Add more props for card layout settings as needed
  onSettingsSaved?: () => void;
}

const MerchantBrandingSettings: React.FC<MerchantBrandingSettingsProps> = ({
  merchantId,
  currentLogo,
  currentTheme,
  onSettingsSaved,
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(currentLogo);
  const [theme, setTheme] = useState<string>(currentTheme || 'default');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setPreviewLogo(currentLogo);
    setTheme(currentTheme || 'default');
  }, [currentLogo, currentTheme]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('theme', theme);
    // Add other card layout settings to formData

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      await axios.put(`/api/merchants/${merchantId}/branding`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Branding settings saved successfully!');
      onSettingsSaved?.();
    } catch (err) {
      setError('Failed to save branding settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Branding & Card Layout</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div>
        <h4>Logo Upload</h4>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {previewLogo && (
          <div>
            <p>Preview:</p>
            <img src={previewLogo} alt="Logo Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
          </div>
        )}
      </div>

      <div>
        <h4>Theme Selection</h4>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          {/* Add more theme options */}
        </select>
      </div>

      {/* Add more controls for card layout customization here */}
      <h4>Card Layout Customization (Placeholder)</h4>
      <p>Controls for positioning logo, text, etc. will go here.</p>

      <button onClick={handleSaveSettings} disabled={loading}>
        {loading ? 'Saving...' : 'Save Branding Settings'}
      </button>
    </div>
  );
};

export default MerchantBrandingSettings;
