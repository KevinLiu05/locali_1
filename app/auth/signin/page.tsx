import { SignInForm } from "@/components/sign-in-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative flex w-full flex-col items-center justify-center px-4">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-[300px] h-[300px]">
            {/* Purple rectangle */}
            <div
              className="absolute left-[15%] w-[100px] h-[160px] origin-bottom-left bg-[#6366F1] rounded-xl"
              style={{ transform: "rotate(-15deg)" }}
            >
              <div className="absolute top-[25%] left-1/2 -translate-x-1/2 space-y-4">
                <div className="flex space-x-4">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
            {/* Black rectangle */}
            <div
              className="absolute left-[35%] w-[80px] h-[140px] origin-bottom-left bg-black rounded-xl"
              style={{ transform: "rotate(10deg)" }}
            >
              <div className="absolute top-[30%] left-1/2 -translate-x-1/2">
                <div className="flex space-x-4">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
            {/* Yellow rectangle */}
            <div
              className="absolute right-[25%] w-[70px] h-[120px] origin-bottom-right bg-[#FCD34D] rounded-xl"
              style={{ transform: "rotate(-5deg)" }}
            >
              <div className="absolute top-[30%] left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="relative w-full max-w-sm space-y-6 z-10">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Please enter your details</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  )
}

