import './index.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from 'utils/hooks'
import {
  User,
  Activity,
  Dimensions,
  AverageSessions,
  Performance,
  isPerformance,
} from 'utils/types'
import { downScale } from 'utils/helpers'
import Header from 'layouts/Header'
import ActivityGraph from 'components/ActivityGraph'
import SessionLengthGraph from 'components/SessionLengthGraph'
import TypeGraph from 'components/TypeGraph'
import ScoreGraph from 'components/ScoreGraph'
import Consumption from 'components/Consumption'
import Calories from 'assets/calories-icon.svg?react'
import Carbs from 'assets/carbs-icon.svg?react'
import Protein from 'assets/protein-icon.svg?react'
import Fat from 'assets/fat-icon.svg?react'

/**
 * Profile page function component
 * @export
 * @returns {JSX.Element}
 */
export default function Profile(): JSX.Element {
  const { id } = useParams()
  const [user, setUser] = useState<User>()
  const [activity, setActivity] = useState<Activity>()
  const [averageSessions, setAverageSessions] = useState<AverageSessions>()
  const [performance, setPerformance] = useState<Performance>()
  const userApi = useApi(`/user/${id}`)
  const activityApi = useApi(`/user/${id}/activity`)
  const averageSessionApi = useApi(`/user/${id}/average-sessions`)
  const performanceApi = useApi(`/user/${id}/performance`)
  const activityDimensions: Dimensions = {
    width: downScale(835),
    height: downScale(320),
    marginTop: downScale(112),
    marginRight: downScale(90),
    marginBottom: downScale(62),
    marginLeft: downScale(43),
  }
  const averageSessionsDimensions: Dimensions = {
    width: downScale(260),
    height: downScale(260),
    marginTop: downScale(40),
    marginRight: downScale(0),
    marginBottom: downScale(35),
    marginLeft: downScale(20),
  }

  useEffect(() => {
    if (userApi) {
      setUser(userApi as User)
    }
  }, [userApi])

  useEffect(() => {
    if (activityApi) {
      setActivity(activityApi as Activity)
    }
  }, [activityApi])

  useEffect(() => {
    if (averageSessionApi) {
      setAverageSessions(averageSessionApi as AverageSessions)
    }
  }, [averageSessionApi])

  useEffect(() => {
    if (performanceApi && isPerformance(performanceApi)) {
      setPerformance(performanceApi as Performance)
    }
  }, [performanceApi])

  return (
    <main className="content">
      {user && <Header name={user.userInfos.firstName} />}
      {activity && (
        <ActivityGraph content={activity} dimensions={activityDimensions} />
      )}
      <div className="indicators">
        {averageSessions && (
          <SessionLengthGraph
            content={averageSessions}
            dimensions={averageSessionsDimensions}
          />
        )}
        {performance && (
          <TypeGraph
            content={performance}
            dimensions={{ size: downScale(260), margin: downScale(80) }}
          />
        )}
        {user && (
          <ScoreGraph content={user} dimensions={{ size: downScale(260) }} />
        )}
      </div>
      <div className="consumption">
        <Consumption
          Icon={Calories}
          value={`${user?.keyData.calorieCount.toLocaleString('en')}kCal`}
          type="Calories"
        />
        <Consumption
          Icon={Protein}
          value={`${user?.keyData.proteinCount.toLocaleString('en')}g`}
          type="Proteines"
        />
        <Consumption
          Icon={Carbs}
          value={`${user?.keyData.carbohydrateCount.toLocaleString('en')}g`}
          type="Glucides"
        />
        <Consumption
          Icon={Fat}
          value={`${user?.keyData.lipidCount.toLocaleString('en')}g`}
          type="Lipides"
        />
      </div>
    </main>
  )
}
