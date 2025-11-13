import { useEffect, useState } from 'react';
import axios from 'axios';

type Merchant = {
  id: string;
  display_name?: string;
  legal_name?: string;
  logo_url?: string;
  category?: string;
  address?: string;
  description?: string;
  website?: string;
  phone?: string;
};

type Program = {
  id: string;
  name: string;
  description?: string;
  reward_description?: string;
};

type MerchantModalProps = {
  merchant: Merchant | null;
  program?: Program | null;
  programId?: string;
  isOpen: boolean;
  onClose: () => void;
  onExitProgram?: (programId?: string) => void;
};

const MerchantModal = ({ merchant, program, programId, isOpen, onClose, onExitProgram }: MerchantModalProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleExitProgram = async () => {
    if (!programId || !onExitProgram) return;

    const confirmed = window.confirm(
      'Are you sure you want to leave this programme? Your collected stamps will be lost.'
    );
    if (!confirmed) {
      return;
    }

    setIsExiting(true);
    try {
      await axios.delete(`/api/v1/customer/memberships/${programId}`);
      onExitProgram(programId);
      onClose();
    } catch (error) {
      console.error('Failed to exit program:', error);
      // Could show an error message here
    } finally {
      setIsExiting(false);
    }
  };

  if (!isOpen || !merchant) return null;

  const resolveLogoUrl = (rawValue: unknown): string | null => {
    if (!rawValue || typeof rawValue !== 'string') return null;
    const trimmed = rawValue.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `${window.location.origin}${trimmed}`;
    }
    return trimmed;
  };

  const logoUrl = resolveLogoUrl(merchant.logo_url);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--rudi-text)]">About {merchant.display_name || merchant.legal_name}</h2>
            <button
              onClick={onClose}
              className="text-[var(--rudi-text)]/60 hover:text-[var(--rudi-text)] text-2xl"
            >
              ×
            </button>
          </div>

          {/* Logo */}
          {logoUrl && (
            <div className="flex justify-center">
              <img
                src={logoUrl}
                alt={`${merchant.display_name || merchant.legal_name} logo`}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}

          {/* Merchant Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-[var(--rudi-text)]">Business Name</h3>
              <p className="text-[var(--rudi-text)]/80">{merchant.display_name || merchant.legal_name}</p>
            </div>

            {merchant.category && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">Category</h3>
                <p className="text-[var(--rudi-text)]/80">{merchant.category}</p>
              </div>
            )}

            {merchant.address && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">Address</h3>
                <p className="text-[var(--rudi-text)]/80">{merchant.address}</p>
              </div>
            )}

            {merchant.description && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">About</h3>
                <p className="text-[var(--rudi-text)]/80">{merchant.description}</p>
              </div>
            )}

            {program && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">Program: {program.name}</h3>
                {program.description && (
                  <p className="text-[var(--rudi-text)]/80 mt-1">{program.description}</p>
                )}
                {program.reward_description && (
                  <div className="mt-2 p-3 bg-[var(--rudi-primary)]/10 rounded-lg">
                    <p className="text-sm font-medium text-[var(--rudi-primary)]">Reward</p>
                    <p className="text-[var(--rudi-text)]/90">{program.reward_description}</p>
                  </div>
                )}
              </div>
            )}

            {merchant.website && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">Website</h3>
                <a
                  href={merchant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--rudi-primary)] hover:underline"
                >
                  {merchant.website}
                </a>
              </div>
            )}

            {merchant.phone && (
              <div>
                <h3 className="font-semibold text-[var(--rudi-text)]">Phone</h3>
                <a
                  href={`tel:${merchant.phone}`}
                  className="text-[var(--rudi-primary)] hover:underline"
                >
                  {merchant.phone}
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            {onExitProgram && (
              <button
                onClick={handleExitProgram}
                disabled={isExiting}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isExiting ? 'Leaving Program...' : 'Exit Program'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-[var(--rudi-primary)] text-white rounded-xl font-semibold hover:bg-[var(--rudi-primary)]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantModal;
