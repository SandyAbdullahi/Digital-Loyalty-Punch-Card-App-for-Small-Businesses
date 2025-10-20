import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Text, Button, Group, Image, Loader, Alert, CopyButton, Tooltip, rem } from '@mantine/core';
import { IconCheck, IconCopy, IconAlertCircle } from '@tabler/icons-react';

interface QrCodeGeneratorProps {
  loyaltyProgramId: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ loyaltyProgramId }) => {
  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/loyalty-programs/${loyaltyProgramId}/qrcode`);
        setQrCodeLink(response.data.qrCodeLink);
      } catch (err) {
        setError('Failed to fetch QR code.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (loyaltyProgramId) {
      fetchQrCode();
    }
  }, [loyaltyProgramId]);

  if (loading) {
    return <Loader size="sm" />;
  }

  if (error) {
    return <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">{error}</Alert>;
  }

  if (!qrCodeLink) {
    return <Text c="dimmed">No QR code available for this program.</Text>;
  }

  return (
    <Paper withBorder radius="md" p="md" mt="md">
      <Text fw={700} mb="xs">Loyalty Program QR Code</Text>
      <Text size="sm" c="dimmed" mb="md">Share this link or QR code with your customers to join this loyalty program.</Text>
      
      <Group position="center" mb="md">
        <Image
          src={qrCodeLink}
          alt="QR Code"
          style={{ maxWidth: rem(200), height: 'auto' }}
        />
      </Group>

      <Group justify="center">
        <CopyButton value={qrCodeLink} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy link'} withArrow position="right">
              <Button color={copied ? 'teal' : 'blue'} onClick={copy} leftSection={copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}>
                {copied ? 'Link Copied' : 'Copy Link'}
              </Button>
            </Tooltip>
          )}
        </CopyButton>
        <Button component="a" href={qrCodeLink} target="_blank" rel="noopener noreferrer" variant="outline">
          Open Link
        </Button>
      </Group>
    </Paper>
  );
};

export default QrCodeGenerator;