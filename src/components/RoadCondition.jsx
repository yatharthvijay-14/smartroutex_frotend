function RoadCondition({ roads }) {
  const getProgress = (rating) => {
    if (!rating) {
      return 30;
    }

    return (rating / 5) * 100;
  };

  return (
    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "25px"
      }}
    >
      <h2>🛣️ Road Conditions</h2>

      {roads.map((road) => (
        <div
          key={road.id}
          style={{
            marginTop: "25px"
          }}
        >
          <p>
            {road.name} ({road.rating}⭐)
          </p>

          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#e5e7eb",
              borderRadius: "20px"
            }}
          >
            <div
              style={{
                width: `${getProgress(
                  road.rating
                )}%`,
                height: "10px",
                background: "#2563eb",
                borderRadius: "20px"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoadCondition;