import { OnboardingForm } from "@/components/onboarding-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps } from "@/components/steps"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Help us personalize your experience by providing some information</p>
        </div>
        <Steps
          steps={[
            { id: "step-1", label: "Personal Info" },
            { id: "step-2", label: "Interests" },
            { id: "step-3", label: "Preferences" },
          ]}
          currentStep="step-1"
        />
        <Card>
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
            <CardDescription>This information helps us tailor event recommendations to you</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

