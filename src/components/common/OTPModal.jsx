import { useState, useRef, useEffect } from 'react';
import { X, Mail, Smartphone } from 'lucide-react';
import Button from '../ui/Button';

export default function OTPModal({ isOpen, onClose, onVerify, email, phone }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [method, setMethod] = useState('email');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) onVerify(code);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  const maskContact = (contact, type) => {
    if (type === 'email') {
      const [name, domain] = contact.split('@');
      return `${name.slice(0, 2)}***@${domain}`;
    }
    return contact.slice(0, 4) + '***' + contact.slice(-3);
  };

  const contactInfo = method === 'email' ? email : phone;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-3" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
            {method === 'email'
              ? <Mail className="w-8 h-8 text-white" />
              : <Smartphone className="w-8 h-8 text-white" />
            }
          </div>
          <h2 className="text-2xl font-bold text-text-1 mb-2">Verificación de código</h2>
          <p className="text-sm text-text-3 mb-4">
            Ingresa el código de 6 dígitos enviado a<br />
            <span className="font-medium text-text-1">{maskContact(contactInfo, method)}</span>
          </p>

          <div className="flex gap-2 mb-4 bg-page-bg p-1 rounded-lg">
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                method === 'email'
                  ? 'bg-white text-text-1 shadow-sm'
                  : 'text-text-3 hover:text-text-1'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Correo
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                method === 'phone'
                  ? 'bg-white text-text-1 shadow-sm'
                  : 'text-text-3 hover:text-text-1'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-2" />
              Teléfono
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-11 h-12 text-center text-xl font-bold border-2 border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          full
          disabled={otp.join('').length !== 6}
          className="mb-4 h-[48px]"
        >
          Verificar código
        </Button>

        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={!canResend}
            className={`text-sm font-medium transition-colors ${
              canResend
                ? 'text-orange cursor-pointer hover:underline'
                : 'text-text-4 cursor-not-allowed'
            }`}
          >
            {canResend ? 'Reenviar código' : `Reenviar código (${timer}s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
