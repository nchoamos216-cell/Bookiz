import { db } from './db';

async function main() {
  // 1. Créer le salon (Business)
  const salon = await db.business.create({
    data: {
      name: "Mon Salon Bookiz",
      address: "123 Rue de la République, Abidjan",
    },
  });

  // 2. Créer un employé associé au salon
  const employee = await db.employee.create({
    data: {
      name: "Jean Prestataire",
      role: "Coiffeur",
      businessId: salon.id,
    },
  });

  console.log(`✅ Salon créé : ${salon.name} (ID: ${salon.id})`);
  console.log(`✅ Employé créé : ${employee.name} (ID: ${employee.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });