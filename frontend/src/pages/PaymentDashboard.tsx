import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Wallet,
    CreditCard,
    Smartphone,
    Shield,
    CheckCircle,
    Loader,
    AlertCircle,
    ExternalLink,
    Blocks,
    RefreshCw,
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

type PaymentMethod = 'UPI' | 'CARD' | null;
type PaymentStep = 'select' | 'details' | 'processing' | 'otp' | 'redirect' | 'confirming' | 'success' | 'error';

interface PaymentIntent {
    intentId: string;
    status: string;
    confirmations: number;
    amount: number;
}

const PaymentDashboard = () => {
    const navigate = useNavigate();

    // Wallet state
    const [balance, setBalance] = useState<number>(100); // Default ₹100 for new users
    const [loadingBalance, setLoadingBalance] = useState(true);

    // Payment flow state
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [step, setStep] = useState<PaymentStep>('select');
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
    const [error, setError] = useState<string>('');

    // UPI state
    const [upiId, setUpiId] = useState<string>('');

    // Card state
    const [cardNumber, setCardNumber] = useState<string>('');
    const [cardExpiry, setCardExpiry] = useState<string>('');
    const [cardCvv, setCardCvv] = useState<string>('');
    const [cardName, setCardName] = useState<string>('');
    const [otp, setOtp] = useState<string>('');

    // Blockchain state
    const [confirmations, setConfirmations] = useState<number>(0);

    // Fetch wallet balance
    const fetchBalance = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/wallet/balance-public`);
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance);
            }
        } catch (err) {
            console.error('Failed to fetch balance:', err);
            setBalance(100); // Default ₹100 for new users
        } finally {
            setLoadingBalance(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    // Create payment intent
    const createPayment = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setError('');
        setStep('processing');

        try {
            const res = await fetch(`${BACKEND_URL}/api/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    currency: 'INR',
                    method: paymentMethod,
                    payment_details: paymentMethod === 'UPI'
                        ? { upi_id: upiId }
                        : { card_last4: cardNumber.slice(-4), name: cardName }
                }),
            });

            if (!res.ok) throw new Error('Failed to create payment');

            const data = await res.json();
            setPaymentIntent({
                intentId: data.intentId,
                status: data.status,
                confirmations: 0,
                amount: data.amount,
            });

            // Move to next step based on payment method
            if (paymentMethod === 'UPI') {
                setStep('redirect');
                // Simulate UPI app redirect
                setTimeout(() => {
                    signAndConfirm(data.intentId);
                }, 3000);
            } else {
                setStep('otp');
            }
        } catch (err) {
            setError('Payment creation failed. Please try again.');
            setStep('error');
        }
    };

    // Sign and confirm (after OTP or UPI return)
    const signAndConfirm = async (intentId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/sign-and-confirm/${intentId}`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Failed to sign payment');

            setStep('confirming');
            pollStatus(intentId);
        } catch (err) {
            setError('Payment confirmation failed.');
            setStep('error');
        }
    };

    // Poll for blockchain confirmations
    const pollStatus = async (intentId: string) => {
        let attempts = 0;
        const maxAttempts = 10;

        const poll = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/status/${intentId}`);
                if (!res.ok) throw new Error('Failed to get status');

                const data = await res.json();
                setConfirmations(data.confirmations);

                if (data.status === 'SETTLED') {
                    setStep('success');
                    fetchBalance(); // Refresh balance
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 1000);
                } else {
                    setStep('success'); // Assume success after max attempts
                    fetchBalance();
                }
            } catch (err) {
                setError('Status check failed.');
                setStep('error');
            }
        };

        poll();
    };

    // Handle OTP submission
    const handleOtpSubmit = () => {
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setError('');
        if (paymentIntent) {
            signAndConfirm(paymentIntent.intentId);
        }
    };

    // Reset payment flow
    const resetPayment = () => {
        setAmount('');
        setPaymentMethod(null);
        setStep('select');
        setPaymentIntent(null);
        setError('');
        setUpiId('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
        setOtp('');
        setConfirmations(0);
    };

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Payment Gateway</h1>
                                <p className="text-slate-400 text-sm">Powered by Finternet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-2">
                            <Wallet className="h-5 w-5 text-green-400" />
                            <div>
                                <p className="text-xs text-slate-400">Balance</p>
                                {loadingBalance ? (
                                    <Loader className="h-4 w-4 animate-spin text-white" />
                                ) : (
                                    <p className="text-lg font-bold text-white">₹{balance.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Step: Select Payment Method */}
                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Amount Input */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Enter Amount (₹ INR)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-4 text-3xl font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                {[10, 50, 100, 500].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setAmount(preset.toString())}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        ₹{preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-lg font-semibold text-white mb-4">Select Payment Method</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* UPI Option */}
                                <button
                                    onClick={() => setPaymentMethod('UPI')}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${paymentMethod === 'UPI'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${paymentMethod === 'UPI' ? 'bg-green-500' : 'bg-slate-600'}`}>
                                            <Smartphone className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">UPI</h3>
                                            <p className="text-sm text-slate-400">Pay via GPay, PhonePe, Paytm</p>
                                        </div>
                                    </div>
                                </button>

                                {/* Card Option */}
                                <button
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${paymentMethod === 'CARD'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${paymentMethod === 'CARD' ? 'bg-green-500' : 'bg-slate-600'}`}>
                                            <CreditCard className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Credit/Debit Card</h3>
                                            <p className="text-sm text-slate-400">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* UPI Details */}
                        {paymentMethod === 'UPI' && (
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-fadeIn">
                                <h2 className="text-lg font-semibold text-white mb-4">Enter UPI ID</h2>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="username@upi"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-slate-400 mt-2">You'll be redirected to your UPI app to complete payment</p>
                            </div>
                        )}

                        {/* Card Details */}
                        {paymentMethod === 'CARD' && (
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-fadeIn">
                                <h2 className="text-lg font-semibold text-white mb-4">Enter Card Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            placeholder="JOHN DOE"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Expiry</label>
                                            <input
                                                type="text"
                                                value={cardExpiry}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    if (v.length >= 2) {
                                                        setCardExpiry(v.slice(0, 2) + '/' + v.slice(2));
                                                    } else {
                                                        setCardExpiry(v);
                                                    }
                                                }}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">CVV</label>
                                            <input
                                                type="password"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                placeholder="•••"
                                                maxLength={3}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                                    <Shield className="h-4 w-4" />
                                    <span>Secured by Finternet blockchain</span>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Pay Button */}
                        {paymentMethod && (
                            <button
                                onClick={createPayment}
                                disabled={!amount || (paymentMethod === 'UPI' && !upiId) || (paymentMethod === 'CARD' && (!cardNumber || !cardCvv))}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Pay ₹{amount || '0'}
                            </button>
                        )}
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 text-center">
                        <Loader className="h-16 w-16 text-green-400 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Creating Payment Intent</h2>
                        <p className="text-slate-400">Connecting to Finternet network...</p>
                    </div>
                )}

                {/* Step: UPI Redirect */}
                {step === 'redirect' && (
                    <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ExternalLink className="h-10 w-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Redirecting to UPI App</h2>
                        <p className="text-slate-400 mb-6">Complete the payment in your UPI app</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Waiting for payment confirmation from {upiId}</span>
                        </div>
                        <div className="mt-8 p-4 bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-400">Amount: <span className="text-white font-bold">₹{amount}</span></p>
                        </div>
                    </div>
                )}

                {/* Step: OTP Verification */}
                {step === 'otp' && (
                    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                            <p className="text-slate-400">We've sent a 6-digit code to your registered mobile</p>
                        </div>

                        <div className="max-w-xs mx-auto">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="• • • • • •"
                                maxLength={6}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />

                            {error && (
                                <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
                            )}

                            <button
                                onClick={handleOtpSubmit}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                            >
                                Verify & Pay
                            </button>

                            <button className="w-full mt-3 py-3 text-slate-400 hover:text-white transition-colors text-sm">
                                Resend OTP
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Blockchain Confirmation */}
                {step === 'confirming' && (
                    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Blocks className="h-10 w-10 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Confirming on Blockchain</h2>
                            <p className="text-slate-400">Waiting for network confirmations</p>
                        </div>

                        {/* Confirmation Progress */}
                        <div className="max-w-md mx-auto">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Confirmations</span>
                                <span className="text-sm font-bold text-white">{confirmations}/5</span>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500"
                                    style={{ width: `${(confirmations / 5) * 100}%` }}
                                />
                            </div>

                            {/* Block visualization */}
                            <div className="flex justify-center gap-2 mt-6">
                                {[1, 2, 3, 4, 5].map((block) => (
                                    <div
                                        key={block}
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition-all ${block <= confirmations
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-700 text-slate-500'
                                            }`}
                                    >
                                        {block <= confirmations ? <CheckCircle className="h-6 w-6" /> : block}
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-xs text-slate-400 mt-4">
                                Transaction ID: {paymentIntent?.intentId}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 text-center">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-slate-400 mb-6">Your wallet has been credited</p>

                        <div className="bg-slate-700/50 rounded-xl p-6 max-w-sm mx-auto mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400">Amount Added</span>
                                <span className="text-2xl font-bold text-green-400">+₹{amount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">New Balance</span>
                                <span className="text-xl font-bold text-white">₹{balance.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={resetPayment}
                            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
                        >
                            Make Another Payment
                        </button>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="bg-slate-800 rounded-2xl p-12 border border-red-500/30 text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                        <p className="text-slate-400 mb-6">{error || 'Something went wrong. Please try again.'}</p>

                        <button
                            onClick={resetPayment}
                            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Try Again
                        </button>
                    </div>
                )}
            </main>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default PaymentDashboard;
