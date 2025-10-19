import qrcode from 'qrcode';

export const generateQrCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(text);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};
