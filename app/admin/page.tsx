import { PrismaClient } from "@prisma/client";

// Initialisation de Prisma pour récupérer les données
const prisma = new PrismaClient();

export default async function AdminDashboard() {
  // Récupération des réservations avec leurs services associés
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Bookiz - Administration</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>Bienvenue sur le tableau de bord administrateur !</p>

      <h2>Liste des Réservations ({bookings.length})</h2>

      {bookings.length === 0 ? (
        <p style={{ marginTop: "20px", fontStyle: "italic" }}>Aucune réservation pour le moment.</p>
      ) : (
        <div style={{ marginTop: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", backgroundColor: "#f9f9f9" }}>
                <th style={{ padding: "12px" }}>Client</th>
                <th style={{ padding: "12px" }}>Email</th>
                <th style={{ padding: "12px" }}>Service</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Statut</th>
                <th style={{ padding: "12px" }}>Payé</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{booking.clientName}</td>
                  <td style={{ padding: "12px", color: "#555" }}>{booking.clientEmail}</td>
                  <td style={{ padding: "12px" }}>{booking.service?.title || "Service inconnu"}</td>
                  <td style={{ padding: "12px" }}>{new Date(booking.date).toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: booking.status === "CONFIRMED" ? "#e6f4ea" : booking.status === "CANCELLED" ? "#fce8e6" : "#fef7e0",
                      color: booking.status === "CONFIRMED" ? "#137333" : booking.status === "CANCELLED" ? "#c5221f" : "#b06000",
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {booking.isPaid ? "✅ Oui" : "❌ Non"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}