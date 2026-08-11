import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = 'force-dynamic';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function DebugPage() {
  let services: any[] = [];
  let employees: any[] = [];
  let errorMsg = null;

  try {
    services = await prisma.service.findMany();
    employees = await prisma.employee.findMany();
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Page de Debug - Base de données Bookiz</h1>
      
      {errorMsg && (
        <div style={{ background: "#fee", color: "#c00", padding: "10px", marginBottom: "20px" }}>
          Erreur : {errorMsg}
        </div>
      )}

      <h2>Services enregistrés ({services.length}) :</h2>
      <ul>
        {services.map((s) => (
          <li key={s.id}><strong>{s.title}</strong> - {s.price}€ ({s.duration} min)</li>
        ))}
      </ul>
      {services.length === 0 && <p style={{ fontStyle: "italic" }}>Aucun service trouvé dans la base.</p>}

      <h2 style={{ marginTop: "30px" }}>Employés enregistrés ({employees.length}) :</h2>
      <ul>
        {employees.map((e) => (
          <li key={e.id}><strong>{e.name}</strong> - {e.role || "Pas de rôle"}</li>
        ))}
      </ul>
      {employees.length === 0 && <p style={{ fontStyle: "italic" }}>Aucun employé trouvé dans la base.</p>}
    </div>
  );
}
