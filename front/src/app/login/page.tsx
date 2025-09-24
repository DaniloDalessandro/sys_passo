import { LoginForm } from "@/components/login-form"
import styles from "./LoginPage.module.css"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-sky-100 to-blue-50 flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md mb-24">
        <LoginForm />
      </div>

      {/* Cenário de transporte */}
      <div className={styles.transportScene}>
        {/* Nuvens */}
        <div className={`${styles.cloud} ${styles.cloud1}`}>
          <div className={styles.cloudDetail}></div>
        </div>
        <div className={`${styles.cloud} ${styles.cloud2}`}>
          <div className={styles.cloudDetail}></div>
        </div>

        {/* Pontos de Ônibus */}
        <div className={`${styles.busStop} ${styles.busStop1}`}>
          {/* Estrutura do ponto */}
          <div className={styles.busStopStructure}>
            <div className={styles.busStopPole}></div>
            <div className={styles.busStopRoof}></div>
            <div className={styles.busStopBench}></div>
            <div className={styles.busStopSign}>
              <div className={styles.busStopSignIcon}></div>
            </div>
          </div>
          {/* Pessoas esperando */}
          <div className={`${styles.person} ${styles.waitingPerson1}`}>
            <div className={styles.personHead}></div>
            <div className={styles.personBody}></div>
            <div className={styles.personLegs}></div>
          </div>
          <div className={`${styles.person} ${styles.waitingPerson2}`}>
            <div className={styles.personHead}></div>
            <div className={styles.personBody}></div>
            <div className={styles.personLegs}></div>
          </div>
        </div>

        <div className={`${styles.busStop} ${styles.busStop2}`}>
          {/* Estrutura do ponto */}
          <div className={styles.busStopStructure}>
            <div className={styles.busStopPole}></div>
            <div className={styles.busStopRoof}></div>
            <div className={styles.busStopBench}></div>
            <div className={styles.busStopSign}>
              <div className={styles.busStopSignIcon}></div>
            </div>
          </div>
          {/* Pessoa esperando */}
          <div className={`${styles.person} ${styles.waitingPerson3}`}>
            <div className={styles.personHead}></div>
            <div className={styles.personBody}></div>
            <div className={styles.personLegs}></div>
          </div>
        </div>

        {/* Estrada */}
        <div className={styles.road}>
          <div className={styles.roadLine}></div>
        </div>

        {/* Carros */}
        <div className={`${styles.car} ${styles.car1}`}>
          <div className={styles.carBody}>
            <div className={styles.carRoof}></div>
            <div className={styles.carWindshield}></div>
            <div className={styles.carSideWindow}></div>
            <div className={styles.carFrontLight}></div>
            <div className={styles.carBackLight}></div>
            <div className={styles.carDoor}></div>
            <div className={styles.carBumper}></div>
          </div>
          <div className={styles.carWheels}>
            <div className={`${styles.wheel} ${styles.frontWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
            <div className={`${styles.wheel} ${styles.backWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
          </div>
          <div className={styles.carShadow}></div>
        </div>

        <div className={`${styles.car} ${styles.car2}`}>
          <div className={styles.carBody}>
            <div className={styles.carRoof}></div>
            <div className={styles.carWindshield}></div>
            <div className={styles.carSideWindow}></div>
            <div className={styles.carFrontLight}></div>
            <div className={styles.carBackLight}></div>
            <div className={styles.carDoor}></div>
            <div className={styles.carBumper}></div>
          </div>
          <div className={styles.carWheels}>
            <div className={`${styles.wheel} ${styles.frontWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
            <div className={`${styles.wheel} ${styles.backWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
          </div>
          <div className={styles.carShadow}></div>
        </div>

        <div className={`${styles.car} ${styles.car3}`}>
          <div className={styles.carBody}>
            <div className={styles.carRoof}></div>
            <div className={styles.carWindshield}></div>
            <div className={styles.carSideWindow}></div>
            <div className={styles.carFrontLight}></div>
            <div className={styles.carBackLight}></div>
            <div className={styles.carDoor}></div>
            <div className={styles.carBumper}></div>
          </div>
          <div className={styles.carWheels}>
            <div className={`${styles.wheel} ${styles.frontWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
            <div className={`${styles.wheel} ${styles.backWheel}`}>
              <div className={styles.wheelRim}></div>
            </div>
          </div>
          <div className={styles.carShadow}></div>
        </div>
      </div>
    </div>
  )
}
