"use client"

import { useState } from "react"
import SettingsLayout from "./settings-layout"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0

    let strength = 0
    // Length check
    if (password.length >= 8) strength += 25
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25
    // Contains number or special char
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25

    return strength
  }

  const passwordStrength = calculatePasswordStrength(newPassword)

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Fair"
    if (passwordStrength <= 75) return "Good"
    return "Strong"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-amber-500"
    if (passwordStrength <= 75) return "bg-blue-500"
    return "bg-green-500"
  }

  const passwordsMatch = newPassword === confirmPassword
  const canSubmit = currentPassword && newPassword && confirmPassword && passwordsMatch && passwordStrength > 50

  return (
    <SettingsLayout title="Security" description="Manage your account security settings">
      <div className="space-y-8">
        {/* Change Password Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-medium text-violet-100">Change Password</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="bg-violet-900/20 border-violet-500/20 text-violet-100 placeholder:text-violet-400/50"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password strength:</span>
                    <span className="font-medium">{getPasswordStrengthText()}</span>
                  </div>
                  <Progress value={passwordStrength} className={getPasswordStrengthColor()} />
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-1">
                      {newPassword.length >= 8 ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-1">
                      {/[a-z]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      Lowercase letters (a-z)
                    </li>
                    <li className="flex items-center gap-1">
                      {/[A-Z]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      Uppercase letters (A-Z)
                    </li>
                    <li className="flex items-center gap-1">
                      {/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      Numbers or special characters
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={confirmPassword && !passwordsMatch ? "border-red-500" : ""}
                />
              </div>
              {confirmPassword && !passwordsMatch && <p className="text-sm text-red-500">Passwords do not match</p>}
            </div>
          </div>
        </div>

        {/* Two-Factor Section */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-violet-900/20 border border-violet-500/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
              <Label htmlFor="two-factor" className="text-violet-100">Two-Factor Authentication</Label>
            </div>
            <p className="text-sm text-violet-300/80">Add an extra layer of security to your account</p>
          </div>
          <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </div>

        {/* Alert styling */}
        {twoFactorEnabled && (
          <Alert className="bg-violet-900/20 border-violet-500/20">
            <ShieldAlert className="h-4 w-4 text-violet-400" />
            <AlertTitle className="text-violet-100">Two-Factor Authentication is enabled</AlertTitle>
            <AlertDescription className="text-violet-300/80">
              You'll be asked for an authentication code when signing in on new devices.
            </AlertDescription>
          </Alert>
        )}

        {/* Update button */}
        <div className="flex justify-end">
          <Button 
            disabled={!canSubmit}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-500 transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)]"
          >
            Update Password
          </Button>
        </div>
      </div>
    </SettingsLayout>
  )
}
