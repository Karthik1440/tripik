// src/components/TripResult.js
export default function TripResult({ trip, onSave, saved }) {
  const plan = trip.plan;
  if (!plan) return null;

  const fmt = (amt) => amt !== undefined && amt !== null
    ? `₹${Number(amt).toLocaleString('en-IN')}`
    : '—';

  const stars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div style={s.wrap}>

      {/* Hero Header */}
      <div style={s.hero}>
        <div>
          <h2 style={s.heroTitle}>{trip.from_location} → {trip.to_location}</h2>
          <p style={s.heroMeta}>{trip.days} days · Budget {fmt(trip.budget)}</p>
          <p style={s.summary}>{plan.summary}</p>
        </div>
        {!saved && (
          <button style={s.saveBtn} onClick={onSave}>💾 Save Trip</button>
        )}
      </div>

      {/* Info Row */}
      <div style={s.infoRow}>
        {plan.best_time_to_visit && (
          <div style={s.infoBadge}>🗓 Best time: {plan.best_time_to_visit}</div>
        )}
        {plan.how_to_reach && (
          <div style={s.infoBadge}>🚆 {plan.how_to_reach}</div>
        )}
        {plan.accommodation_suggestion && (
          <div style={s.infoBadge}>🏨 {plan.accommodation_suggestion}</div>
        )}
      </div>

      {/* Budget Breakdown */}
      {plan.budget_breakdown && Object.keys(plan.budget_breakdown).length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>💰 Budget Breakdown</h3>
          <div style={s.budgetGrid}>
            {Object.entries(plan.budget_breakdown).map(([key, val]) => (
              <div key={key} style={s.budgetCard}>
                <div style={s.budgetLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div style={s.budgetAmt}>{fmt(val)}</div>
              </div>
            ))}
            <div style={{ ...s.budgetCard, background: '#4f46e5', color: '#fff' }}>
              <div style={{ ...s.budgetLabel, color: '#c7d2fe' }}>Total</div>
              <div style={{ ...s.budgetAmt, color: '#fff' }}>{fmt(plan.estimated_cost)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Day-wise Itinerary */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>📅 Day-wise Itinerary</h3>
        {plan.itinerary?.map((day) => (
          <div key={day.day} style={s.dayCard}>
            <div style={s.dayHeader}>
              <span style={s.dayBadge}>Day {day.day}</span>
              <span style={s.dayTitle}>{day.title}</span>
            </div>
            {day.activities?.map((act, i) => (
              <div key={i} style={s.activity}>
                <div style={s.actTime}>{act.time}</div>
                <div style={s.actBody}>
                  <div style={s.actName}>{act.activity}</div>
                  {act.notes && <div style={s.actNote}>{act.notes}</div>}
                </div>
                <div style={s.actCost}>
                  {act.cost === 0 ? (
                    <span style={s.free}>Free</span>
                  ) : (
                    <span style={s.costAmt}>{fmt(act.cost)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Best Places */}
      {plan.best_places?.length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>📍 Best Places to Visit</h3>
          <div style={s.cardGrid}>
            {plan.best_places.map((place, i) => (
              <div key={i} style={s.placeCard}>
                <div style={s.placeTop}>
                  <span style={s.placeName}>{place.name}</span>
                  <span style={s.ratingBadge}>⭐ {place.rating}</span>
                </div>
                <div style={s.stars}>{stars(place.rating)}</div>
                <div style={s.placeCategory}>{place.category}</div>
                <div style={s.placeDetail}>{place.why_visit}</div>
                <div style={s.placeFooter}>
                  <span>🕐 {place.best_time}</span>
                  <span>Entry: {place.entry_fee === 0 ? 'Free' : fmt(place.entry_fee)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Spots */}
      {plan.food_spots?.length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>🍽 Best Food Spots</h3>
          <div style={s.cardGrid}>
            {plan.food_spots.map((food, i) => (
              <div key={i} style={s.foodCard}>
                <div style={s.placeTop}>
                  <span style={s.placeName}>{food.name}</span>
                  <span style={s.ratingBadge}>⭐ {food.rating}</span>
                </div>
                <div style={s.stars}>{stars(food.rating)}</div>
                <div style={s.foodType}>{food.type}</div>
                <div style={s.mustTry}>Must try: <strong>{food.must_try}</strong></div>
                <div style={s.review}>"{food.review_highlight}"</div>
                <div style={s.avgCost}>Avg cost per person: {fmt(food.avg_cost_per_person)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>💡 Travel Tips</h3>
          <div style={s.tipsGrid}>
            {plan.tips.map((tip, i) => (
              <div key={i} style={s.tip}>💡 {tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button Bottom */}
      {!saved && (
        <button style={s.saveBtnBottom} onClick={onSave}>
          💾 Save This Trip Plan
        </button>
      )}
    </div>
  );
}

const s = {
  wrap: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginTop: 24 },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  heroTitle: { fontSize: 26, margin: '0 0 4px', color: '#1a1a2e' },
  heroMeta: { fontSize: 13, color: '#888', margin: '0 0 10px' },
  summary: { color: '#444', lineHeight: 1.7, fontSize: 15, margin: 0, maxWidth: 600 },
  saveBtn: { padding: '10px 22px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  saveBtnBottom: { display: 'block', width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 24 },
  infoRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  infoBadge: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#166534' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, color: '#1a1a2e', margin: '0 0 14px', fontWeight: 700 },
  budgetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 },
  budgetCard: { background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: 10, padding: '12px 14px' },
  budgetLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, textTransform: 'capitalize' },
  budgetAmt: { fontSize: 18, fontWeight: 700, color: '#4f46e5' },
  dayCard: { border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  dayHeader: { background: '#f3f4f6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 },
  dayBadge: { background: '#4f46e5', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 },
  dayTitle: { fontWeight: 600, color: '#374151' },
  activity: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', borderTop: '1px solid #f3f4f6' },
  actTime: { fontSize: 12, color: '#6b7280', minWidth: 75, paddingTop: 2 },
  actBody: { flex: 1 },
  actName: { fontSize: 14, color: '#111827', fontWeight: 500 },
  actNote: { fontSize: 12, color: '#9ca3af', marginTop: 3 },
  actCost: { minWidth: 60, textAlign: 'right' },
  free: { fontSize: 12, fontWeight: 600, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 10 },
  costAmt: { fontSize: 13, fontWeight: 600, color: '#4f46e5' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  placeCard: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fafafa' },
  foodCard: { border: '1px solid #fde68a', borderRadius: 12, padding: 16, background: '#fffbeb' },
  placeTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  placeName: { fontWeight: 600, fontSize: 14, color: '#111827', flex: 1, marginRight: 8 },
  ratingBadge: { background: '#fef3c7', color: '#92400e', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  stars: { color: '#f59e0b', fontSize: 13, marginBottom: 6 },
  placeCategory: { fontSize: 12, color: '#6366f1', fontWeight: 600, marginBottom: 6, background: '#ede9fe', display: 'inline-block', padding: '2px 8px', borderRadius: 10 },
  placeDetail: { fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 8 },
  placeFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' },
  foodType: { fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 6, background: '#fde68a', display: 'inline-block', padding: '2px 8px', borderRadius: 10 },
  mustTry: { fontSize: 13, color: '#374151', marginBottom: 6 },
  review: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 6 },
  avgCost: { fontSize: 12, fontWeight: 600, color: '#059669' },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 },
  tip: { background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#78350f', lineHeight: 1.5 },
};