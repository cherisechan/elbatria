import { signIn } from "~/auth"
 
export default function SignInBtn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  )
}