import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextInput, NumberInput, Button, Group, Text, Alert, Box, DateInput } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

interface LoyaltyProgramFormProps {
  merchantId: string;
  onProgramCreated?: (programId: string) => void; // Modified to pass programId
  onProgramUpdated?: () => void;
  existingProgram?: LoyaltyProgram;
}

interface LoyaltyProgram {
  id?: string;
  merchantId: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
}

const LoyaltyProgramForm: React.FC<LoyaltyProgramFormProps> = ({ 
  merchantId, 
  onProgramCreated, 
  onProgramUpdated, 
  existingProgram 
}) => {
  const [rewardName, setRewardName] = useState(existingProgram?.rewardName || '');
  const [threshold, setThreshold] = useState(existingProgram?.threshold || 0);
  const [expiryDate, setExpiryDate] = useState<Date | null>(existingProgram?.expiryDate ? new Date(existingProgram.expiryDate) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (existingProgram) {
      setRewardName(existingProgram.rewardName);
      setThreshold(existingProgram.threshold);
      setExpiryDate(existingProgram.expiryDate ? new Date(existingProgram.expiryDate) : null);
    }
  }, [existingProgram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const programData = {
      merchantId,
      rewardName,
      threshold,
      ...(expiryDate && { expiryDate: expiryDate.toISOString() }),
    };

    try {
      if (existingProgram) {
        await axios.put(`/api/loyalty-programs/${existingProgram.id}`, programData);
        setSuccess('Loyalty program updated successfully!');
        onProgramUpdated?.();
      } else {
        const response = await axios.post('/api/loyalty-programs', programData);
        setSuccess('Loyalty program created successfully!');
        onProgramCreated?.(response.data.id); // Pass the new program ID
        // Clear form after creation
        setRewardName('');
        setThreshold(0);
        setExpiryDate(null);
      }
    } catch (err) {
      setError('Failed to save loyalty program.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Title order={4}>{existingProgram ? 'Edit Loyalty Program' : 'Create New Loyalty Program'}</Title>
      {error && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mt="md">{error}</Alert>}
      {success && <Alert icon={<IconCheck size="1rem" />} title="Success" color="green" mt="md">{success}</Alert>}

      <TextInput
        label="Reward Name"
        placeholder="e.g., Free Coffee, 10% Off"
        value={rewardName}
        onChange={(event) => setRewardName(event.currentTarget.value)}
        required
        mt="md"
      />

      <NumberInput
        label="Threshold (Stamps needed)"
        placeholder="e.g., 10"
        value={threshold}
        onChange={(value) => setThreshold(value as number)}
        required
        min={1}
        mt="md"
      />

      <DateInput
        label="Expiry Date (Optional)"
        placeholder="Pick date"
        value={expiryDate}
        onChange={setExpiryDate}
        minDate={new Date()}
        mt="md"
      />

      <Button type="submit" loading={loading} mt="xl">
        {loading ? 'Saving...' : (existingProgram ? 'Update Program' : 'Create Program')}
      </Button>
    </Box>
  );
};
export default LoyaltyProgramForm;