import { render, screen } from '@testing-library/react';
import CustomerCard from '../../components/CustomerCard';

describe('CustomerCard redemption states', () => {
  it('renders voucher when reward is redeemable', () => {
    render(
      <CustomerCard
        programName="Test Program"
        stampsRequired={5}
        stampsInCycle={5}
        status="redeemable"
        voucherCode="ABC123XYZ"
        redeemExpiresAt="2030-01-01T00:00:00.000Z"
      />
    );

    expect(screen.getByText(/Voucher/i)).toBeInTheDocument();
    expect(screen.getByText(/ABC123XYZ/)).toBeInTheDocument();
    expect(screen.getByText(/Valid until/i)).toBeInTheDocument();
  });

  it('encourages visits when inactive', () => {
    render(
      <CustomerCard
        programName="Test Program"
        stampsRequired={5}
        stampsInCycle={1}
        status="inactive"
      />
    );

    expect(screen.getByText(/Keep scanning/i)).toBeInTheDocument();
    expect(screen.queryByText(/Voucher/i)).not.toBeInTheDocument();
  });
});
