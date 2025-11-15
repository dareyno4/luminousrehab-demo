import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle2, Mail, Lock } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Screen, NavigationParams } from '../../App';

interface Props {
  navigation: {
    navigate: (screen: Screen, params?: NavigationParams) => void;
    goBack: () => void;
  };
}

export default function AccountActivationScreen({ navigation }: Props) {
  const [activationCode, setActivationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    setActivated(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 space-y-6">
        <button
          onClick={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#64748b]" />
        </button>

        {!activated ? (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#0966CC] to-[#0C4A6E] flex items-center justify-center mb-4">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl text-[#0f172a] mb-2">Activate Your Account</h1>
              <p className="text-[#64748b] px-4">
                Enter the activation code from your welcome email and set your password
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="code">Activation Code</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter activation code"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc]"
                  />
                </div>
              </div>

              <Button
                onClick={handleActivate}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0966CC] to-[#0C4A6E] text-white hover:opacity-90"
              >
                Activate Account
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-[#10B981] mb-4" />
            <h2 className="text-xl text-[#0f172a] mb-2">Account Activated!</h2>
            <p className="text-[#64748b] px-4 mb-8 leading-relaxed">
              Your account has been successfully activated. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigation.navigate('Landing')}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0966CC] to-[#0C4A6E] text-white hover:opacity-90"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
