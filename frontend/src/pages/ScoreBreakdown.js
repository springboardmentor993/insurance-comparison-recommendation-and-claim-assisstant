import { useLocation, useNavigate } from "react-router-dom";
import "./ScoreBreakdown.css";

function ScoreBreakdown() {

  const location = useLocation();
  const navigate = useNavigate();
  const policy = location.state;

  if (!policy) {
    return <h2 style={{padding:"50px"}}>No data found</h2>;
  }

  const b = policy.breakdown;

  return (
    <div className="score-page">

      <div className="score-card">

        <h1>Score Breakdown</h1>

        <h2>{policy.title}</h2>
        <p className="final-score">
          Final Score: <span>{policy.score}/100</span>
        </p>

        <div className="calc-box">
          <div>
            Coverage Score: {b.coverage_score}
            <small> × {b.weights.coverage}</small>
          </div>

          <div>
            Claim Score: {b.claim_score}
            <small> × {b.weights.claim}</small>
          </div>

          <div>
            Rating Score: {b.rating_score}
            <small> × {b.weights.rating}</small>
          </div>

          <div>
            Price Score: {b.price_score}
            <small> × {b.weights.price}</small>
          </div>
        </div>

        <div className="formula">
          (Coverage×0.35) + (Claim×0.30) + 
          (Rating×0.20) + (Price×0.15)
        </div>

        <button onClick={() => navigate(-1)}>
          Back to Recommendations
        </button>

      </div>

    </div>
  );
}

export default ScoreBreakdown;