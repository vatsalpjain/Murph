import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Loader } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

interface WalletDisplayProps {
  className?: string;
}

const WalletDisplay = ({ className = '' }: WalletDisplayProps) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(100); // Default ₹100
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/balance-public`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(100); // Default ₹100 for new users
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className={`flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Wallet className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-slate-400">Account Balance</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin text-slate-400" />
              <p className="text-xl font-bold text-white">Loading...</p>
            </div>
          ) : (
            <p className="text-xl font-bold text-white">₹{balance?.toFixed(2)}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate('/payment')}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Money
      </button>
    </div>
  );
};

export default WalletDisplay;
