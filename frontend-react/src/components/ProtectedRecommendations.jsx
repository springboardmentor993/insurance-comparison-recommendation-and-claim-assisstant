import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function ProtectedRecommendations({ children }) {
    const navigate = useNavigate()
    const hasPreferences = localStorage.getItem("hasPreferences")

    useEffect(() => {
        if (!hasPreferences) {
            navigate("/preferences")
        }
    }, [])

    return children
}
