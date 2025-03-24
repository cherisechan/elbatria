import { signIn } from "~/auth"
 
export default function SignInBtn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
        <button type="submit" className="rounded-md bg-[#1d61c9] hover:bg-[#0b418f] text-white font-semibold px-6 py-3 shadow-lg transition duration-300">
         Sign in with Google
        </button>
    </form>
  )
} 