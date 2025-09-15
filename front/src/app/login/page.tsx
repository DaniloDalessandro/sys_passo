import { LoginForm } from "@/components/login-form"
import styles from "./LoginPage.module.css"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh bg-gray-50 flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md mb-24"> {/* Aumenta a margem inferior para não sobrepor a animação */}
        <LoginForm />
      </div>
      <div className={styles.ocean}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
    </div>
  )
}
