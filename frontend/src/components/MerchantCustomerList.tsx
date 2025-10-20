import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Text, Group, Loader, Alert, Table, Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';

interface MerchantCustomerListProps {
  merchantId: string;
}

interface Customer {
  id: string;
  email: string;
  createdAt: string;
}

interface CustomerHistory {
  stamps: {
    id: string;
    createdAt: string;
  }[];
}

const MerchantCustomerList: React.FC<MerchantCustomerListProps> = ({ merchantId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // Stores customerId being deleted
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [historyModalOpened, { open: openHistoryModal, close: closeHistoryModal }] = useDisclosure(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/customers/merchant/${merchantId}/customers`);
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to fetch customer list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to remove this customer from your loyalty program?')) {
      return;
    }

    setDeleteLoading(customerId);
    setDeleteError(null);
    try {
      await axios.delete(`/api/customers/merchant/${merchantId}/customer/${customerId}`);
      setDeleteLoading(null);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      setDeleteError('Failed to remove customer.');
      console.error(err);
      setDeleteLoading(null);
    }
  };

  const handleViewHistory = async (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    openHistoryModal();
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await axios.get(`/api/customers/merchant/${merchantId}/customer/${customer.id}/history`);
      setCustomerHistory(response.data);
    } catch (err) {
      setHistoryError('Failed to fetch customer history.');
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchCustomers();
    }
  }, [merchantId]);

  if (loading) {
    return <Loader size="sm" />;
  }

  if (error) {
    return <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">{error}</Alert>;
  }

  return (
    <Paper withBorder radius="md" p="md" mt="md">
      <Text fw={700} mb="md">Customers in Your Loyalty Programs</Text>
      {deleteError && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">{deleteError}</Alert>}
      {customers.length === 0 ? (
        <Text c="dimmed">No customers have joined your loyalty programs yet.</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer ID</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Joined Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {customers.map((customer) => (
              <Table.Tr key={customer.id}>
                <Table.Td>{customer.id}</Table.Td>
                <Table.Td>{customer.email}</Table.Td>
                <Table.Td>{new Date(customer.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      size="xs"
                      onClick={() => handleDeleteCustomer(customer.id)}
                      loading={deleteLoading === customer.id}
                    >
                      Delete
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => handleViewHistory(customer)}>
                      View History
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={historyModalOpened} onClose={closeHistoryModal} title={`History for ${selectedCustomerForHistory?.email}`}>
        {historyLoading && <Loader size="sm" />}
        {historyError && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">{historyError}</Alert>}
        {customerHistory && !historyLoading && (
          <Stack>
            <Text fw={700}>Stamps Issued:</Text>
            {customerHistory.stamps.length === 0 ? (
              <Text c="dimmed">No stamps recorded for this customer.</Text>
            ) : (
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Stamp ID</Table.Th>
                    <Table.Th>Issued Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customerHistory.stamps.map((stamp) => (
                    <Table.Tr key={stamp.id}>
                      <Table.Td>{stamp.id}</Table.Td>
                      <Table.Td>{new Date(stamp.createdAt).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            {/* Add section for rewards redeemed if schema is updated */}
          </Stack>
        )}
      </Modal>
    </Paper>
  );
};

export default MerchantCustomerList;