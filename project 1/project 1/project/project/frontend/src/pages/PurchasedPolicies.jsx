import Navbar from "../components/Navbar";

function PurchasedPolicies() {

  const purchased = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];

  return (
    <>
      <Navbar />

      <div className="wrap">
        <h2>My Purchased Policies</h2>

        {purchased.length === 0 && (
          <p style={{ textAlign: "center" }}>No policies purchased yet.</p>
        )}

        {purchased.map((p) => (
          <div key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>Premium ₹{p.premium}</p>
            {/* <p>Cover {p.cover} Lakhs</p> */}
            <p>Term {p.term} months</p>
          </div>
        ))}
      </div>

      <style>{`
        .wrap{
          padding:40px;
          min-height:100vh;
          background:#f0f9ff;
        }

        .card{
          background:white;
          padding:20px;
          margin:20px 0;
          border-radius:12px;
          box-shadow:0 5px 15px rgba(0,0,0,.1);
        }

        h2{text-align:center;}
      `}</style>
    </>
  );
}

export default PurchasedPolicies;
