import { signIn } from "~/auth"
 
export default function SignInBtn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit" className='bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600'>Sign in with Google</button>
    </form>
  )
}